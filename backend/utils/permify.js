// Util function to create a user-organization relation via Permify
/**
 * Creates a relation between a user and an organization in Permify.
 * 
 * This function constructs a body payload representing the relation between
 * a user and an organization, and then writes this data to the Permify API using 
 * the `dataWrite` method. The relation can specify different roles such as admin, 
 * member, etc.
 * 
 * @param {Object} api - The Permify API client instance.
 * @param {string} tenantId - The ID of the tenant (organization) within which the relation exists.
 * @param {string} userId - The ID of the user.
 * @param {string} organizationId - The ID of the organization.
 * @param {string} role - The role the user has in the organization (e.g., "admin", "member").
 */
const createUserOrganizationRelation = (api, tenantId, userId, organizationId, role) => {
    body = {
            tenantId: tenantId,
            metadata: {
                schemaVersion: ""
            },
            tuples: [{
                entity: {
                    type: "organization",
                    id: organizationId
                },
                relation: role,
                subject: {
                    type: "user",
                    id: userId
                }
            }],
            attributes: []
    };
    try {
        api.dataWrite(tenantId, body, (error, data, response) => {
            if (error) {
                console.error('Error inserting data:', error);
                return res.status(500).json({ message: 'Error inserting data' });
            }
            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Error during data insertion:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Util function to create a user-repository relation via Permify
/**
 * Creates a relation between a user and a repository in Permify.
 * 
 * This function builds a payload representing the relation between
 * a user and a repository (e.g., contributor, maintainer), and sends this data 
 * to the Permify API using the `dataWrite` method.
 * 
 * @param {Object} api - The Permify API client instance.
 * @param {string} tenantId - The ID of the tenant (organization) within which the relation exists.
 * @param {string} userId - The ID of the user.
 * @param {string} repositoryId - The ID of the repository.
 * @param {string} role - The role the user has in the repository (e.g., "contributor", "maintainer").
 */

const createUserRepositoryRelation = (api, tenantId, userId, repositoryId, role) => {
    body = {
            tenantId: tenantId,
            metadata: {
                schemaVersion: ""
            },
            tuples: [{
                entity: {
                    type: "repository",
                    id: repositoryId
                },
                relation: role,
                subject: {
                    type: "user",
                    id: userId
                }
            }],
            attributes: []
    };
    try {
        api.dataWrite(tenantId, body, (error, data, response) => {
            if (error) {
                console.error('Error inserting data:', error);
                return res.status(500).json({ message: 'Error inserting data' });
            }
            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Error during data insertion:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// Exporting functions
module.exports = {
    createUserOrganizationRelation,
    createUserRepositoryRelation
    // You can add other functions here as needed
};
