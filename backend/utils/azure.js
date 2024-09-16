/**
 * Util function to send a user-organization relation creation request to Azure Service Bus
 * @param {Object} sender - The Azure Service Bus sender object
 * @param {string} tenantId - The tenant ID
 * @param {string} userId - The user ID
 * @param {string} organizationId - The organization ID
 * @param {string} role - The role to associate with the user and organization
 */
const createUserOrganizationRelation = async (sender, tenantId, userId, organizationId, role) => {
    const body = {
        action: "createUserOrganizationRelation",
        tenantId,
        userId,
        organizationId,
        role
    };

    try {
        const message = {
            body: JSON.stringify(body),
            contentType: "application/json"
        };
        
        console.log("Sending message to Azure Service Bus:", body);
        await sender.sendMessages(message);
        console.log("Message sent successfully!");
    } catch (error) {
        console.error('Error sending message to Service Bus:', error);
    }
};

/**
 * Util function to send a user-repository relation creation request to Azure Service Bus
 * @param {Object} sender - The Azure Service Bus sender object
 * @param {string} tenantId - The tenant ID
 * @param {string} userId - The user ID
 * @param {string} repositoryId - The repository ID
 * @param {string} role - The role to associate with the user and repository
 */
const createUserRepositoryRelation = async (sender, tenantId, userId, repositoryId, role) => {
    const body = {
        action: "createUserRepositoryRelation",
        tenantId,
        userId,
        repositoryId,
        role
    };

    try {
        const message = {
            body: JSON.stringify(body),
            contentType: "application/json"
        };
        
        console.log("Sending message to Azure Service Bus:", body);
        await sender.sendMessages(message);
        console.log("Message sent successfully!");
    } catch (error) {
        console.error('Error sending message to Service Bus:', error);
    }
};

module.exports = {
    createUserOrganizationRelation,
    createUserRepositoryRelation
};
