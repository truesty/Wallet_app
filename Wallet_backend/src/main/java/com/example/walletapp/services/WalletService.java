package main.java.com.example.walletapp.services;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class WalletService {

    private static final String BASE_URL = "http://localhost:3000/api";

    // Method to fetch monthly report
    public static String getMonthlyReport(int month, int year) {
        String endpoint = String.format("/reports/monthly?month=%d&year=%d", month, year);
        return sendGetRequest(endpoint);
    }

    // Method to set budget
    public static String setBudget(String category, double amount, String startDate, String endDate) {
        String jsonBody = String.format(
            "{\"category\": \"%s\", \"amount\": %.2f, \"startDate\": \"%s\", \"endDate\": \"%s\"}",
            category, amount, startDate, endDate
        );
        return sendPostRequest("/budgets", jsonBody);
    }

    // Generic GET request method
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

    // Generic POST request method
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

    public static void main(String[] args) {
        // Example: Fetching a monthly report
        String report = getMonthlyReport(1, 2025);
        System.out.println("Monthly Report: " + report);

        // Example: Setting a budget
        String response = setBudget("Food", 500.0, "2025-01-01", "2025-01-31");
        System.out.println("Set Budget Response: " + response);
    }
}
