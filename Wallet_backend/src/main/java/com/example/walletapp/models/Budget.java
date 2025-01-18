package main.java.com.example.walletapp.models;

public class Budget {
    private String _id;
    private String category;
    private double amount;
    private double currentSpending;
    private String startDate;
    private String endDate;

    // Constructor
    public Budget(String _id, String category, double amount, double currentSpending, String startDate, String endDate) {
        this._id = _id;
        this.category = category;
        this.amount = amount;
        this.currentSpending = currentSpending;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public double getCurrentSpending() {
        return currentSpending;
    }

    public void setCurrentSpending(double currentSpending) {
        this.currentSpending = currentSpending;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
