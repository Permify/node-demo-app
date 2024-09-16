package co.permify.servicebusconsumer;

import org.json.JSONObject;
import org.permify.model.DataWriteRequest;
import org.permify.model.Entity;
import org.permify.model.Subject;
import org.permify.model.Tuple;

public class MessageHandler {

    private final PermifyClientWrapper permifyClient = new PermifyClientWrapper();

    // Function to handle different actions based on the action field in the message body
    public void handleAction(String action, String messageBody) throws Exception {
        switch (action) {
            case "writeData":
                // Call your method for creating user-organization relation
                this.handleWriteData(messageBody);
                break;
            // Add cases for other actions as needed
            default:
                throw new IllegalArgumentException("Unsupported action: " + action);
        }
    }


    public void handleWriteData(String messageBody) throws Exception {
        DataWriteRequest dataWriteRequest = new DataWriteRequest();
    
        // Parse the message body as JSON
        JSONObject json = new JSONObject(messageBody);
    
        // Extract values from the JSON object
        String tenantId = json.getString("tenantId");

        String subjectId = json.getString("subjectId");
        String subjectType = json.getString("subjectType");

        String entityId = json.getString("entityId");
        String entityType = json.getString("entityType");

        String relation = json.getString("relation");
    
        // Create a tuple for the relation
        Tuple tuple = new Tuple();
        tuple.setRelation(relation);
    
        // Create the entity for the organization
        Entity entity = new Entity();
        entity.setId(entityId);
        entity.setType(entityType);
        tuple.setEntity(entity);
    
        // Create the subject for the user
        Subject subject = new Subject();
        subject.setId(subjectId);
        subject.setType(subjectType);
        tuple.setSubject(subject);
    
        // Add the tuple to the DataWriteRequest
        dataWriteRequest.addTuplesItem(tuple);
    
        // Send the request using the Permify client
        permifyClient.writeData(tenantId, dataWriteRequest);
    }

}
