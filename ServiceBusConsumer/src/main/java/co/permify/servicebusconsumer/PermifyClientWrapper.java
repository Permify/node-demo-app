package co.permify.servicebusconsumer;

import org.permify.ApiClient;
import org.permify.api.TenancyApi;
import org.permify.api.PermissionApi;
import org.permify.api.BundleApi;
import org.permify.api.DataApi;
import org.permify.api.SchemaApi;
import org.permify.api.WatchApi;
import org.permify.model.DataWriteRequest;

/**
 * This class handles the interactions with the Permify API.
 */
public class PermifyClientWrapper {

    private static final String PERMIFY_URL = "https://api.permify.com"; // Replace with actual Permify URL
    private static final String PERMIFY_KEY = "your-permify-api-key"; // Replace with actual Permify API key

    private final BundleApi bundleApi;
    private final DataApi dataApi;
    private final WatchApi watchApi;
    private final TenancyApi tenancyApi;
    private final SchemaApi schemaApi;
    private final PermissionApi permissionApi;

    /**
     * Constructs a PermifyClientWrapper instance.
     */
    public PermifyClientWrapper() {
        // Initialize the ApiClient with the necessary configuration
        ApiClient apiClient = new ApiClient();
        apiClient.setBasePath(PERMIFY_URL);
        apiClient.addDefaultHeader("Authorization", "Bearer " + PERMIFY_KEY);

        // Initialize all API clients
        this.bundleApi = new BundleApi(apiClient);
        this.dataApi = new DataApi(apiClient);
        this.watchApi = new WatchApi(apiClient);
        this.tenancyApi = new TenancyApi(apiClient);
        this.schemaApi = new SchemaApi(apiClient);
        this.permissionApi = new PermissionApi(apiClient);

        System.out.println("PermifyClientWrapper initialized!");
    }

    /**
     * Writes data to Permify API.
     * 
     * @param tenantId The ID of the tenant (organization).
     * @param dataWriteRequest The data write request containing the tuples to be written.
     * @throws Exception if there is an error during the API request.
     */
    public void writeData(String tenantId, DataWriteRequest dataWriteRequest) throws Exception {
        try {
            dataApi.dataWrite(tenantId, dataWriteRequest);
            System.out.println("Data written successfully.");
        } catch (Exception e) {
            System.err.println("Error writing data: " + e.getMessage());
            throw new Exception("Error writing data", e);
        }
    }
}
