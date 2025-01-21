class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = {
            dashboard: this.loadDashboard.bind(this),
            transactions: this.loadTransactions.bind(this),
            categories: this.loadCategories.bind(this),
            accounts: this.loadAccounts.bind(this),
            budgets: this.loadBudgets.bind(this),
            reports: this.loadReports.bind(this)
        };

        this.initialize();
    }

    initialize() {
        // Setup event listeners
        this.setupEventListeners();

        // Load initial page
        this.loadPage(this.currentPage);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.loadPage(page);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('show');
        });
    }

    async loadPage(page) {
        if (!this.pages[page]) return;

        // Update navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Show loading
        utils.showLoading('pageContent');

        try {
            // Load page content
            const content = await this.pages[page]();
            document.getElementById('pageContent').innerHTML = content;
        } catch (error) {
            console.error(`Error loading page ${page}:`, error);
            utils.showToast('Error loading page', 'danger');
        } finally {
            utils.hideLoading('pageContent');
        }
    }

    // Page Loaders
    async loadDashboard() {
        try {
            const dateRange = document.getElementById('dateRange').value;
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - Number(dateRange));

            const report = await api.getReport(startDate.toISOString(), endDate.toISOString());
            const [transactions, categories, accounts] = await Promise.all([
                api.getTransactions(startDate.toISOString(), endDate.toISOString()),
                api.getCategories(),
                api.getAccounts()
            ]);

            // Create charts data
            const incomeData = Array(Number(dateRange)).fill(0);
            const expenseData = Array(Number(dateRange)).fill(0);
            const labels = Array(Number(dateRange)).fill('').map((_, i) => {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });

            transactions.forEach(t => {
                const date = new Date(t.createdAt);
                const dayIndex = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
                if (dayIndex >= 0 && dayIndex < dateRange) {
                    if (t.type === 'income') {
                        incomeData[dayIndex] += Number(t.amount);
                    } else {
                        expenseData[dayIndex] += Number(t.amount);
                    }
                }
            });

            const categoryData = Object.entries(report.byCategory).map(([category, data]) => ({
                category,
                expenses: data.expenses
            })).sort((a, b) => b.expenses - a.expenses);

            return `
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Total Income</h6>
                                <h4 class="card-title text-success">${utils.formatCurrency(report.summary.totalIncome)}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Total Expenses</h6>
                                <h4 class="card-title text-danger">${utils.formatCurrency(report.summary.totalExpenses)}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Net Income</h6>
                                <h4 class="card-title">${utils.formatCurrency(report.summary.totalIncome - report.summary.totalExpenses)}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Total Balance</h6>
                                <h4 class="card-title">${utils.formatCurrency(accounts.reduce((sum, a) => sum + Number(a.balance), 0))}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Income vs Expenses</h5>
                                <canvas id="incomeExpensesChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Expenses by Category</h5>
                                <canvas id="categoryChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Recent Transactions</h5>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${transactions.slice(0, 5).map(transaction => `
                                        <tr>
                                            <td>${utils.formatDate(transaction.createdAt)}</td>
                                            <td>${transaction.description}</td>
                                            <td>${transaction.category}</td>
                                            <td class="text-${transaction.type === 'income' ? 'success' : 'danger'}">
                                                ${utils.formatCurrency(transaction.amount)}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Initialize charts after content is loaded
            setTimeout(() => {
                // Income vs Expenses Chart
                new Chart(document.getElementById('incomeExpensesChart'), {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            {
                                label: 'Income',
                                data: incomeData,
                                borderColor: '#22C55E',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                fill: true
                            },
                            {
                                label: 'Expenses',
                                data: expenseData,
                                borderColor: '#EF4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                fill: true
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });

                // Category Chart
                new Chart(document.getElementById('categoryChart'), {
                    type: 'doughnut',
                    data: {
                        labels: categoryData.map(d => d.category),
                        datasets: [{
                            data: categoryData.map(d => d.expenses),
                            backgroundColor: [
                                '#3B82F6',
                                '#6366F1',
                                '#8B5CF6',
                                '#EC4899',
                                '#F43F5E'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }, 0);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            throw error;
        }
    }

    async loadTransactions() {
        try {
            const [transactions, categories, subcategories, accounts] = await Promise.all([
                api.getTransactions(),
                api.getCategories(),
                api.getSubcategories(),
                api.getAccounts()
            ]);

            // Group subcategories by category
            const subcategoriesByCategory = {};
            subcategories.forEach(sub => {
                if (!subcategoriesByCategory[sub.categoryId]) {
                    subcategoriesByCategory[sub.categoryId] = [];
                }
                subcategoriesByCategory[sub.categoryId].push(sub);
            });

            return `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4>Transactions</h4>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addTransactionModal">
                        Add Transaction
                    </button>
                </div>

                <div class="card">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th>Subcategory</th>
                                        <th>Account</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${transactions.map(transaction => `
                                        <tr>
                                            <td>${utils.formatDate(transaction.createdAt)}</td>
                                            <td>${transaction.description}</td>
                                            <td>${transaction.category}</td>
                                            <td>${transaction.subcategory || '-'}</td>
                                            <td>${transaction.account}</td>
                                            <td class="text-${transaction.type === 'income' ? 'success' : 'danger'}">
                                                ${utils.formatCurrency(transaction.amount)}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Add Transaction Modal -->
                <div class="modal fade" id="addTransactionModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add Transaction</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addTransactionForm">
                                    <div class="mb-3">
                                        <label class="form-label">Type</label>
                                        <select class="form-select" name="type" required onchange="app.handleTransactionTypeChange(this)">
                                            <option value="income">Income</option>
                                            <option value="expense">Expense</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Description</label>
                                        <input type="text" class="form-control" name="description" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Amount</label>
                                        <input type="number" class="form-control" name="amount" step="0.01" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Category</label>
                                        <select class="form-select" name="category" required onchange="app.handleCategoryChange(this)">
                                            <option value="">Select Category</option>
                                            ${categories
                                                .filter(category => category.type === 'income')
                                                .map(category => 
                                                    `<option value="${category.id}" data-type="${category.type}">${category.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="mb-3" id="subcategoryContainer" style="display: none;">
                                        <label class="form-label">Subcategory</label>
                                        <select class="form-select" name="subcategory">
                                            <option value="">Select Subcategory</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Account</label>
                                        <select class="form-select" name="account" required>
                                            ${accounts.map(account => 
                                                `<option value="${account.name}">${account.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="app.addTransaction()">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading transactions:', error);
            throw error;
        }
    }

    handleTransactionTypeChange(select) {
        const categorySelect = document.querySelector('select[name="category"]');
        const type = select.value;
        const categories = Array.from(categorySelect.options);
        
        categories.forEach(option => {
            if (option.value) {
                option.style.display = option.dataset.type === type ? '' : 'none';
            }
        });

        // Reset category and subcategory selections
        categorySelect.value = '';
        this.handleCategoryChange(categorySelect);
    }

    handleCategoryChange(select) {
        const subcategoryContainer = document.getElementById('subcategoryContainer');
        const subcategorySelect = document.querySelector('select[name="subcategory"]');
        const selectedCategoryId = select.value;

        if (selectedCategoryId && subcategoriesByCategory[selectedCategoryId]?.length > 0) {
            subcategorySelect.innerHTML = `
                <option value="">Select Subcategory</option>
                ${subcategoriesByCategory[selectedCategoryId].map(sub =>
                    `<option value="${sub.name}">${sub.name}</option>`
                ).join('')}
            `;
            subcategoryContainer.style.display = '';
        } else {
            subcategoryContainer.style.display = 'none';
            subcategorySelect.value = '';
        }
    }

    async loadCategories() {
        try {
            const [categories, subcategories] = await Promise.all([
                api.getCategories(),
                api.getSubcategories()
            ]);

            return `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4>Categories</h4>
                    <div>
                        <button class="btn btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#addSubcategoryModal">
                            Add Subcategory
                        </button>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCategoryModal">
                        Add Category
                    </button>
                    </div>
                </div>

                <div class="row">
                    ${categories.map(category => {
                        const categorySubcategories = subcategories.filter(s => s.categoryId === category.id);
                        return `
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${category.name}</h5>
                                    <p class="card-text">
                                        <span class="badge bg-${category.type === 'income' ? 'success' : 'danger'}">
                                            ${category.type}
                                        </span>
                                    </p>
                                        ${categorySubcategories.length > 0 ? `
                                            <div class="mt-3">
                                                <h6 class="card-subtitle mb-2 text-muted">Subcategories:</h6>
                                                <ul class="list-unstyled">
                                                    ${categorySubcategories.map(sub => `
                                                        <li>
                                                            <i class="fas fa-tag me-2"></i>
                                                            ${sub.name}
                                                        </li>
                                                    `).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>

                <!-- Add Category Modal -->
                <div class="modal fade" id="addCategoryModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add Category</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addCategoryForm">
                                    <div class="mb-3">
                                        <label class="form-label">Name</label>
                                        <input type="text" class="form-control" name="name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Type</label>
                                        <select class="form-select" name="type" required>
                                            <option value="income">Income</option>
                                            <option value="expense">Expense</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="app.addCategory()">Add</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Subcategory Modal -->
                <div class="modal fade" id="addSubcategoryModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add Subcategory</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addSubcategoryForm">
                                    <div class="mb-3">
                                        <label class="form-label">Parent Category</label>
                                        <select class="form-select" name="categoryId" required>
                                            ${categories.map(category => 
                                                `<option value="${category.id}">${category.name}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Name</label>
                                        <input type="text" class="form-control" name="name" required>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="app.addSubcategory()">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading categories:', error);
            throw error;
        }
    }

    async loadAccounts() {
        try {
            const accounts = await api.getAccounts();

            return `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4>Accounts</h4>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAccountModal">
                        Add Account
                    </button>
                </div>

                <div class="row">
                    ${accounts.map(account => `
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${account.name}</h5>
                                    <h6 class="card-subtitle mb-2 text-muted">${account.type}</h6>
                                    <p class="card-text">
                                        Balance: ${utils.formatCurrency(account.balance)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Add Account Modal -->
                <div class="modal fade" id="addAccountModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add Account</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addAccountForm">
                                    <div class="mb-3">
                                        <label class="form-label">Name</label>
                                        <input type="text" class="form-control" name="name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Type</label>
                                        <select class="form-select" name="type" required>
                                            <option value="checking">Checking</option>
                                            <option value="savings">Savings</option>
                                            <option value="credit">Credit Card</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Initial Balance</label>
                                        <input type="number" class="form-control" name="balance" step="0.01" required>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="app.addAccount()">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading accounts:', error);
            throw error;
        }
    }

    async loadBudgets() {
        try {
            const [budgets, categories] = await Promise.all([
                api.getBudgets(),
                api.getCategories()
            ]);

            return `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4>Budgets</h4>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBudgetModal">
                        Add Budget
                    </button>
                </div>

                <div class="row">
                    ${budgets.map(budget => `
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${budget.category}</h5>
                                    <h6 class="card-subtitle mb-2 text-muted">
                                        ${utils.formatDate(budget.startDate)} - ${utils.formatDate(budget.endDate)}
                                    </h6>
                                    <div class="progress mb-2">
                                        <div class="progress-bar ${
                                            budget.spent >= budget.limit ? 'bg-danger' :
                                            budget.spent >= budget.limit * 0.8 ? 'bg-warning' : 'bg-success'
                                        }" 
                                        role="progressbar" 
                                        style="width: ${Math.min((budget.spent / budget.limit) * 100, 100)}%">
                                        </div>
                                    </div>
                                    <p class="card-text">
                                        Spent: ${utils.formatCurrency(budget.spent)} / ${utils.formatCurrency(budget.limit)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Add Budget Modal -->
                <div class="modal fade" id="addBudgetModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Add Budget</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addBudgetForm">
                                    <div class="mb-3">
                                        <label class="form-label">Category</label>
                                        <select class="form-select" name="category" required>
                                            ${categories
                                                .filter(category => category.type === 'expense')
                                                .map(category => 
                                                    `<option value="${category.name}">${category.name}</option>`
                                                ).join('')}
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Limit</label>
                                        <input type="number" class="form-control" name="limit" step="0.01" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Start Date</label>
                                        <input type="date" class="form-control" name="startDate" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">End Date</label>
                                        <input type="date" class="form-control" name="endDate" required>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" onclick="app.addBudget()">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading budgets:', error);
            throw error;
        }
    }

    async loadReports() {
        try {
            const dateRange = document.getElementById('dateRange').value;
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - Number(dateRange));

            const report = await api.getReport(startDate.toISOString(), endDate.toISOString());

            const categoryData = Object.entries(report.byCategory).map(([category, data]) => ({
                category,
                income: data.income,
                expenses: data.expenses
            }));

            const accountData = Object.entries(report.byAccount).map(([account, data]) => ({
                account,
                income: data.income,
                expenses: data.expenses
            }));

            return `
                <h4 class="mb-4">Financial Report</h4>

                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Summary</h5>
                                <table class="table">
                                    <tr>
                                        <td>Total Income</td>
                                        <td class="text-success">${utils.formatCurrency(report.summary.totalIncome)}</td>
                                    </tr>
                                    <tr>
                                        <td>Total Expenses</td>
                                        <td class="text-danger">${utils.formatCurrency(report.summary.totalExpenses)}</td>
                                    </tr>
                                    <tr>
                                        <td>Net Income</td>
                                        <td>${utils.formatCurrency(report.summary.totalIncome - report.summary.totalExpenses)}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">By Category</h5>
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Category</th>
                                                <th>Income</th>
                                                <th>Expenses</th>
                                                <th>Net</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${categoryData.map(data => `
                                                <tr>
                                                    <td>${data.category}</td>
                                                    <td class="text-success">${utils.formatCurrency(data.income)}</td>
                                                    <td class="text-danger">${utils.formatCurrency(data.expenses)}</td>
                                                    <td>${utils.formatCurrency(data.income - data.expenses)}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">By Account</h5>
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Account</th>
                                                <th>Income</th>
                                                <th>Expenses</th>
                                                <th>Net</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${accountData.map(data => `
                                                <tr>
                                                    <td>${data.account}</td>
                                                    <td class="text-success">${utils.formatCurrency(data.income)}</td>
                                                    <td class="text-danger">${utils.formatCurrency(data.expenses)}</td>
                                                    <td>${utils.formatCurrency(data.income - data.expenses)}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading reports:', error);
            throw error;
        }
    }

    // Form Handlers
    async addTransaction() {
        const form = document.getElementById('addTransactionForm');
        const data = utils.getFormData(form);

        try {
            await api.createTransaction(data);
            utils.showToast('Transaction added successfully');
            utils.resetForm(form);
            this.loadPage('transactions');
            bootstrap.Modal.getInstance(document.getElementById('addTransactionModal')).hide();
        } catch (error) {
            console.error('Error adding transaction:', error);
            utils.showToast('Error adding transaction', 'danger');
        }
    }

    async addCategory() {
        const form = document.getElementById('addCategoryForm');
        const data = utils.getFormData(form);

        try {
            await api.createCategory(data);
            utils.showToast('Category added successfully');
            utils.resetForm(form);
            this.loadPage('categories');
            bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
        } catch (error) {
            console.error('Error adding category:', error);
            utils.showToast('Error adding category', 'danger');
        }
    }

    async addAccount() {
        const form = document.getElementById('addAccountForm');
        const data = utils.getFormData(form);

        try {
            await api.createAccount(data);
            utils.showToast('Account added successfully');
            utils.resetForm(form);
            this.loadPage('accounts');
            bootstrap.Modal.getInstance(document.getElementById('addAccountModal')).hide();
        } catch (error) {
            console.error('Error adding account:', error);
            utils.showToast('Error adding account', 'danger');
        }
    }

    async addBudget() {
        const form = document.getElementById('addBudgetForm');
        const data = utils.getFormData(form);

        try {
            await api.createBudget(data);
            utils.showToast('Budget added successfully');
            utils.resetForm(form);
            this.loadPage('budgets');
            bootstrap.Modal.getInstance(document.getElementById('addBudgetModal')).hide();
        } catch (error) {
            console.error('Error adding budget:', error);
            utils.showToast('Error adding budget', 'danger');
        }
    }

    async addSubcategory() {
        const form = document.getElementById('addSubcategoryForm');
        const data = utils.getFormData(form);

        try {
            await api.createSubcategory(data);
            utils.showToast('Subcategory added successfully');
            utils.resetForm(form);
            this.loadPage('categories');
            bootstrap.Modal.getInstance(document.getElementById('addSubcategoryModal')).hide();
        } catch (error) {
            console.error('Error adding subcategory:', error);
            utils.showToast('Error adding subcategory', 'danger');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 