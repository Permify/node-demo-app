package co.permify.servicebusconsumer;

import org.junit.Assert;
import org.junit.Test;

public class ServiceBusConsumerTest {

    @Test
    public void run() throws Exception {
        Assert.assertEquals(0,
            ServiceBusConsumer.runApp(new String[0], (connectionString, queueName) -> {
                    ServiceBusConsumer app = new ServiceBusConsumer();
                    try {
                        app.run(connectionString, queueName);
                        return 0;
                    } catch (Exception e) {
                        System.out.printf("%s", e.toString());
                        return 1;
                    }
                }));
    }
}