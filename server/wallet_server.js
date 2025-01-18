const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

// Mock data
let transactions = [
  {
    _id: "615c1d8f1c9d44000038d82c",
    accountType: "Bank",
    accountId: "615c1d8f1c9d44000038d82d",
    amount: 100.0,
    category: "Food",
    subcategory: "Groceries",
    date: "2025-01-15T10:00:00Z",
    description: "Bought groceries",
  },
  {
    _id: "615c1d8f1c9d44000038d82c",
    accountType: "Mobile Money",
    accountId: "615c1d8f1c9d44000038d82e",
    amount: 50.0,
    category: "Transport",
    subcategory: "Taxi",
    date: "2025-01-16T12:00:00Z",
    description: "Taxi fare",
  },
];

let accounts = [
  {
    _id: "615c1d8f1c9d44000038d82d",
    accountName: "Bank",
    accountType: "Savings",
    balance: 1500.0,
    createdAt: "2025-01-01T10:00:00Z",
  },
  {
    _id: "615c1d8f1c9d44000038d82e",
    accountName: "Mobile Money",
    accountType: "Current",
    balance: 800.0,
    createdAt: "2025-01-01T11:00:00Z",
  },
];

let categories = [
  {
    _id: "615c1d8f1c9d44000038d82g",
    categoryName: "Food",
    subcategories: ["Groceries", "Restaurants"],
  },
  {
    _id: "615c1d8f1c9d44000038d82h",
    categoryName: "Transport",
    subcategories: ["Taxi", "Public Transport"],
  },
];

let budgets = [
  {
    _id: "615c1d8f1c9d44000038d82i",
    category: "Food",
    amount: 500.0,
    currentSpending: 450.0,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-01-31T23:59:59Z",
  },
  {
    _id: "615c1d8f1c9d44000038d82j",
    category: "Transport",
    amount: 200.0,
    currentSpending: 50.0,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-01-31T23:59:59Z",
  },
];

// Routes for Transactions
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
  const newTransaction = req.body;
  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// Routes for Accounts
app.get("/api/accounts", (req, res) => {
  res.json(accounts);
});

app.post("/api/accounts", (req, res) => {
  const newAccount = req.body;
  accounts.push(newAccount);
  res.status(201).json(newAccount);
});

// Routes for Categories
app.get("/api/categories", (req, res) => {
  res.json(categories);
});

app.post("/api/categories", (req, res) => {
  const newCategory = req.body;
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

// Routes for Budgets
app.get("/api/budgets", (req, res) => {
  res.json(budgets);
});

app.post("/api/budgets", (req, res) => {
  const newBudget = req.body;
  budgets.push(newBudget);
  res.status(201).json(newBudget);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
