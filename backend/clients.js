const permify = require('permify-javascript');
const mysql = require('mysql2');
const { ServiceBusClient } = require('@azure/service-bus');

/**
 * Creates a Permify client with the specified host and key.
 * @returns {Object} An object containing different API clients.
 */
function createPermifyClient() {
    const permifyHost = ""
    const permifyKey = ""
    const ac = new permify.ApiClient(permifyHost);
    ac.defaultHeaders = {
        'Authorization': "Bearer " + permifyKey
    };

    return {
        schemaApi: new permify.SchemaApi(ac),
        dataApi: new permify.DataApi(ac),
        tenancyApi: new permify.TenancyApi(ac),
        permissionApi: new permify.PermissionApi(ac),
        bundleApi: new permify.BundleApi(ac)
    };
}

/**
 * Creates a MySQL connection with the specified configuration.
 * @returns {Object} The MySQL connection object.
 */
function createMySQLConnection() {
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'rootpassword',
        database: 'mydb',
        insecureAuth: true // Allow older authentication methods
    });

    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Connected to MySQL database');
    });

    return db;
}


/**
 * Creates an Azure Service Bus connection with the specified configuration.
 * @returns {Object} The Azure Service Bus sender object.
 */
function createServiceBusSender() {
    const serviceBusUrl = ""
    const serviceBusQueue = ""
    const sbClient = new ServiceBusClient(serviceBusUrl);
    const sender = sbClient.createSender(serviceBusQueue);
    return sender;
}

// Exporting functions
module.exports = {
    createPermifyClient,
    createMySQLConnection,
    createServiceBusSender
};
