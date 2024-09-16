const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const permify = require("permify-javascript");
const clients = require('./clients');
const azureUtils = require('./utils/azure');

const app = express();
const port = process.env.PORT || 3001;
const secretKey = 'your_secret_key'; // Use a strong secret key
const tenantId = "tx";

app.use(cors());
app.use(express.json());

const db = clients.createMySQLConnection();
const permifyClient = clients.createPermifyClient();
const azureSender = clients.createServiceBusSender();

// JWT Middleware to Authenticate Requests
const jwtAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.userId = decoded.userId; // Attach the user ID to the request
        next();
    } catch (error) {
        console.error('Invalid or expired token:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};


// Route for Schema Management
app.post('/schema/manage', jwtAuthMiddleware, async (req, res) => {
    const { schema } = req.body;

    if (!schema) {
        return res.status(400).json({ message: 'Schema is required' });
    }

    try {
        permifyClient.schemaApi.schemasWrite(tenantId, { tenantId, schema }, (error, data, response) => {
            if (error) {
                console.error('Error managing schema:', error);
                return res.status(500).json({ message: 'Error managing schema' });
            }
            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Error during schema management:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Route: User Signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) {
                console.error('Error creating user:', err);
                return res.status(500).json({ message: 'Error creating user' });
            }
            res.json({ success: true, message: 'User created successfully' });
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route: User Signin
app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Error during signin' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }

            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
            res.json({ success: true, token });
        } catch (error) {
            console.error('Error during password comparison:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

// Route: Create Organization (Authenticated)
app.post('/organizations', jwtAuthMiddleware, async (req, res) => {
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Organization name is required' });
    }

    try {
        // Insert into organizations table
        db.query('INSERT INTO organizations (name) VALUES (?)', [name], async (err, result) => {
            if (err) {
                console.error('Error creating organization:', err);
                return res.status(500).json({ message: 'Failed to create organization' });
            }

            const organizationId = result.insertId;

            // Call Permify API to create the organization and assign the user as admin

            azureUtils.createUserOrganizationRelation(azureSender, tenantId, userId, organizationId, "admin")

            try {
                await permify.createOrganization(organizationId, name, userId);
                res.status(201).json({ message: 'Organization created successfully' });
            } catch (err) {
                console.error('Error writing relation to Permify:', err);
                res.status(500).json({ message: 'Failed to update Permify' });
            }





        });
    } catch (error) {
        console.error('Error during organization creation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Route: Get Organization (Authenticated)
app.get('/organizations/:id', jwtAuthMiddleware, async (req, res) => {
    const userId = req.userId;
    const organizationId = req.params.id;

    try {
        // Check if user has 'admin' or 'view' role in user_organization table
        db.query('SELECT role FROM user_organization WHERE user_id = ? AND organization_id = ?', [userId, organizationId], (err, results) => {
            if (err) {
                console.error('Error checking user role:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (results.length === 0 || (results[0].role !== 'admin' && results[0].role !== 'view')) {
                return res.status(403).json({ message: 'Access denied: You do not have permission to view this organization' });
            }

            // Fetch organization details
            db.query('SELECT * FROM organizations WHERE id = ?', [organizationId], (err, results) => {
                if (err) {
                    console.error('Error fetching organization:', err);
                    return res.status(500).json({ message: 'Failed to retrieve organization' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: 'Organization not found' });
                }

                return res.json({ success: true, organization: results[0] });
            });
        });
    } catch (error) {
        console.error('Error retrieving organization:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route: List Organizations (Authenticated)
app.get('/organizations', jwtAuthMiddleware, async (req, res) => {
    const userId = req.userId;

    try {
        // Get all organizations where the user has 'view' or 'admin' role
        db.query(
            `SELECT o.id, o.name, uo.role 
            FROM organizations o
            JOIN user_organization uo ON o.id = uo.organization_id
            WHERE uo.user_id = ? AND (uo.role = 'admin' OR uo.role = 'view')`,
            [userId],
            (err, results) => {
                if (err) {
                    console.error('Error fetching organizations:', err);
                    return res.status(500).json({ message: 'Failed to retrieve organizations' });
                }

                return res.json({
                    success: true,
                    organizations: results
                });
            }
        );
    } catch (error) {
        console.error('Error retrieving organizations:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route: Get Repositories (Authenticated)
app.get('/repositories', jwtAuthMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const results = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM repositories WHERE owner_id = ?', [userId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        return res.json({
            success: true,
            message: 'Repositories retrieved from the database successfully.',
            data: results,
        });
    } catch (error) {
        console.error('Error retrieving repositories:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Route: Add a New Repository (Authenticated)
app.post('/repositories', jwtAuthMiddleware, async (req, res) => {
    const userId = req.userId;
    const { title, organizationId } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Repository title is required' });
    }

    if (!organizationId) {
        return res.status(400).json({ message: 'Repository organization id is required' });
    }

    try {
        db.query('INSERT INTO repositories (title) VALUES (?)', [title], (err) => {
            if (err) {
                console.error('Error inserting repository:', err);
                return res.status(500).json({ message: 'Failed to add repository' });
            }
            // send relations to permify
            return res.json({ success: true, message: 'Repository added successfully.' });
        });
    } catch (error) {
        console.error('Error adding repository:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
});
