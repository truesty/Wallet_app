package main.java.com.example.walletapp.models;

public class Account {
    private String _id;
    private String accountName;
    private String accountType;
    private double balance;
    private String createdAt;

    // Constructor
    public Account(String _id, String accountName, String accountType, double balance, String createdAt) {
        this._id = _id;
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = balance;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
