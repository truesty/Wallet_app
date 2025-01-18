package main.java.com.example.walletapp.models;

import java.util.List;

public class Category {
    private String _id;
    private String categoryName;
    private List<String> subcategories;

    // Constructor
    public Category(String _id, String categoryName, List<String> subcategories) {
        this._id = _id;
        this.categoryName = categoryName;
        this.subcategories = subcategories;
    }

    // Getters and Setters
    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public List<String> getSubcategories() {
        return subcategories;
    }

    public void setSubcategories(List<String> subcategories) {
        this.subcategories = subcategories;
    }
}
