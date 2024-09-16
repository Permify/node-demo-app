package co.permify.servicebusconsumer;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.function.BiFunction;

import com.microsoft.azure.servicebus.ClientFactory;
import com.microsoft.azure.servicebus.IMessage;
import com.microsoft.azure.servicebus.IMessageReceiver;
import com.microsoft.azure.servicebus.ReceiveMode;
import com.microsoft.azure.servicebus.primitives.ConnectionStringBuilder;

import org.json.JSONObject;

public class ServiceBusConsumer {

    private final MessageHandler messageHandler = new MessageHandler(); // Create PermifyRequests

    public void run(String connectionString, String queueName) throws Exception {
        IMessageReceiver targetQueueReceiver;
        // Receive messages from Azure Service Bus Queue
        targetQueueReceiver = ClientFactory.createMessageReceiverFromConnectionStringBuilder(
                new ConnectionStringBuilder(connectionString, queueName), ReceiveMode.PEEKLOCK);

        // Message processing loop
        while (true) {
            IMessage message = targetQueueReceiver.receive(Duration.ofSeconds(10));

            if (message != null) {
                // Print message details
                printReceivedMessage(message);

                try {
                    String messageBody = new String(message.getBody(), StandardCharsets.UTF_8);
                    JSONObject json = new JSONObject(messageBody);
                    String action = json.getString("action");
                    messageHandler.handleAction(action, messageBody);

                    // Complete the message if processed successfully
                    targetQueueReceiver.complete(message.getLockToken());
                } catch (Exception e) {
                    // Log and abandon the message for retry
                    System.err.println("Error processing message: " + e.getMessage());
                    targetQueueReceiver.abandon(message.getLockToken());
                }
            }
        }
    }

    /**
     * Print the received message details.
     */
    void printReceivedMessage(IMessage receivedMessage) {
        System.out.printf("Received message:\n\tLabel:\t%s\n\tBody:\t%s\n",
                receivedMessage.getLabel(), new String(receivedMessage.getBody(), StandardCharsets.UTF_8));

        if (receivedMessage.getProperties() != null) {
            for (String p : receivedMessage.getProperties().keySet()) {
                System.out.printf("\tProperty:\t%s = %s\n", p, receivedMessage.getProperties().get(p));
            }
        }
    }

    public static void main(String[] args) {
        System.exit(runApp(args, (connectionString, queueName) -> {
            ServiceBusConsumer app = new ServiceBusConsumer();
            try {
                app.run(connectionString, queueName);
                return 0;
            } catch (Exception e) {
                System.err.printf("Error: %s%n", e.toString());
                return 1;
            }
        }));
    }

    public static int runApp(String[] args, BiFunction<String, String, Integer> run) {
        if (args.length < 2) {
            System.err.println("Usage: ServiceBusConsumer <connectionString> <queueName>");
            return 2;
        }

        String connectionString = args[0];
        String queueName = args[1];

        return run.apply(connectionString, queueName);
    }
}
