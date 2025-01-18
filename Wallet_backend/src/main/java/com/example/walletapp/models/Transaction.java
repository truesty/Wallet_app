package main.java.com.example.walletapp.models;

public class Transaction {
    private String _id;
    private String accountType;
    private String accountId;
    private double amount;
    private String category;
    private String subcategory;
    private String date;
    private String description;

    // Constructor
    public Transaction(String _id, String accountType, String accountId, double amount, String category, String subcategory, String date, String description) {
        this._id = _id;
        this.accountType = accountType;
        this.accountId = accountId;
        this.amount = amount;
        this.category = category;
        this.subcategory = subcategory;
        this.date = date;
        this.description = description;
    }

    // Getters and Setters
    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
