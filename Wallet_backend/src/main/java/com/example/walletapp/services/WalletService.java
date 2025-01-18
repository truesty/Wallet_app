package main.java.com.example.walletapp.services;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class WalletService {

    // Base URL of the server
    private static final String BASE_URL = "http://localhost:3000/api";

    // Method to send a GET request
    public static String sendGetRequest(String endpoint) {
        try {
            URL url = new URL(BASE_URL + endpoint);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    response.append(line);
                }
                in.close();
                return response.toString();
            } else {
                return "GET request failed: " + responseCode;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    // Method to send a POST request
    public static String sendPostRequest(String endpoint, String jsonBody) {
        try {
            URL url = new URL(BASE_URL + endpoint);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; utf-8");
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonBody.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_CREATED || responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    response.append(line);
                }
                in.close();
                return response.toString();
            } else {
                return "POST request failed: " + responseCode;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    // Main method to test the service
    public static void main(String[] args) {
        // Test GET request
        String transactions = sendGetRequest("/transactions");
        System.out.println("GET /transactions response: " + transactions);

        // Test POST request
        String newTransaction = "{\"_id\": \"615c1d8f1c9d44000038d82f\", \"accountType\": \"Cash\", \"accountId\": \"615c1d8f1c9d44000038d82d\", \"amount\": 20.0, \"category\": \"Miscellaneous\", \"subcategory\": \"Other\", \"date\": \"2025-01-17T14:00:00Z\", \"description\": \"Bought snacks\"}";
        String postResponse = sendPostRequest("/transactions", newTransaction);
        System.out.println("POST /transactions response: " + postResponse);
    }
}

