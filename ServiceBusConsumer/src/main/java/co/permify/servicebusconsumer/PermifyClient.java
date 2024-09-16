package co.permify.servicebusconsumer;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * This class handles the interactions with the Permify API.
 */
public class PermifyClient {

    private static final String PERMIFY_API_URL = "https://api.permify.co/v1/data/write";
    private static final String PERMIFY_API_KEY = "<Your-API-Key>";

    /**
     * Sends a message to the Permify API.
     * 
     * @param messageBody The body of the message to send to Permify API.
     * @throws Exception if there is an error in the HTTP request or the response code is not 200.
     */
    public void sendToPermifyApi(String messageBody) throws Exception {
        // Prepare HTTP request for Permify API
        URL url = new URL(PERMIFY_API_URL);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Authorization", "Bearer " + PERMIFY_API_KEY);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);

        // Send the message body as JSON
        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = messageBody.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        // Handle the response
        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            System.out.println("Successfully sent to Permify API.");
        } else {
            throw new Exception("Failed to send to Permify API. HTTP response code: " + responseCode);
        }
    }
}
