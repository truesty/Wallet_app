const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log('Starting server...');
console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    PWD: process.cwd(),
    PATH: process.env.PATH
});

app.get('/health', (req, res) => {
    console.log('Health check requested');
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        port: port
    });
});

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const corsOptions = {
    origin: ['https://wallet-truest.netlify.app', 'http://localhost:3000', 'https://wallet-server-13x5.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
    maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

const db = {
    transactions: [],
    categories: [
        {
            id: 1,
            name: 'Salary',
            type: 'income',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Food',
            type: 'expense',
            createdAt: new Date().toISOString()
        }
    ],
    accounts: [
        {
            id: 1,
            name: 'Cash',
            type: 'cash',
            balance: 1000,
            createdAt: new Date().toISOString()
        }
    ],
    budgets: [],
    subcategories: []
};

function checkBudgetNotifications(transaction) {
    if (transaction.type !== 'expense') return null;

    const categoryBudgets = db.budgets.filter(b => 
        b.category === transaction.category &&
        new Date(b.startDate) <= new Date(transaction.createdAt) &&
        new Date(b.endDate) >= new Date(transaction.createdAt)
    );

    const notifications = [];
    categoryBudgets.forEach(budget => {
        const totalExpenses = db.transactions
            .filter(t => 
                t.type === 'expense' &&
                t.category === budget.category &&
                new Date(t.createdAt) >= new Date(budget.startDate) &&
                new Date(t.createdAt) <= new Date(budget.endDate)
            )
            .reduce((sum, t) => sum + Number(t.amount), 0);

        if (totalExpenses >= budget.limit) {
            notifications.push({
                type: 'danger',
                message: `Budget exceeded for ${budget.category}! Limit: ${budget.limit}, Spent: ${totalExpenses}`
            });
        } else if (totalExpenses >= budget.limit * 0.8) {
            notifications.push({
                type: 'warning',
                message: `Near budget limit for ${budget.category}! Limit: ${budget.limit}, Spent: ${totalExpenses}`
            });
        }
    });

    return notifications;
}

app.get('/api/transactions', (req, res) => {
    const { startDate, endDate } = req.query;
    let filteredTransactions = db.transactions;

    if (startDate && endDate) {
        filteredTransactions = filteredTransactions.filter(t => 
            new Date(t.createdAt) >= new Date(startDate) &&
            new Date(t.createdAt) <= new Date(endDate)
        );
    }

    res.json(filteredTransactions);
});

app.post('/api/transactions', (req, res) => {
    const transaction = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    db.transactions.push(transaction);
    const notifications = checkBudgetNotifications(transaction);
    res.status(201).json({ transaction, notifications });
});

app.get('/api/categories', (req, res) => {
    res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
    const category = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    db.categories.push(category);
    res.status(201).json(category);
});

app.get('/api/subcategories', (req, res) => {
    const { categoryId } = req.query;
    let filteredSubcategories = db.subcategories;
    
    if (categoryId) {
        filteredSubcategories = filteredSubcategories.filter(s => s.categoryId === categoryId);
    }
    
    res.json(filteredSubcategories);
});

app.post('/api/subcategories', (req, res) => {
    const subcategory = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    db.subcategories.push(subcategory);
    res.status(201).json(subcategory);
});

app.get('/api/accounts', (req, res) => {
    res.json(db.accounts);
});

app.post('/api/accounts', (req, res) => {
    const account = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    db.accounts.push(account);
    res.status(201).json(account);
});

app.get('/api/budgets', (req, res) => {
    res.json(db.budgets);
});

app.post('/api/budgets', (req, res) => {
    const budget = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    db.budgets.push(budget);
    res.status(201).json(budget);
});

app.get('/api/reports', (req, res) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    const transactions = db.transactions.filter(t => 
        new Date(t.createdAt) >= start &&
        new Date(t.createdAt) <= end
    );

    const report = {
        summary: {
            totalIncome: transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Number(t.amount), 0),
            totalExpenses: transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Number(t.amount), 0)
        },
        byCategory: transactions.reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = { income: 0, expenses: 0 };
            }
            if (t.type === 'income') {
                acc[t.category].income += Number(t.amount);
            } else {
                acc[t.category].expenses += Number(t.amount);
            }
            return acc;
        }, {}),
        byAccount: transactions.reduce((acc, t) => {
            if (!acc[t.account]) {
                acc[t.account] = { income: 0, expenses: 0 };
            }
            if (t.type === 'income') {
                acc[t.account].income += Number(t.amount);
            } else {
                acc[t.account].expenses += Number(t.amount);
            }
            return acc;
        }, {})
    };

    res.json(report);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const server = app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
    console.log(`Process running as user: ${process.env.USER}`);
    console.log(`Working directory: ${process.cwd()}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
}); 