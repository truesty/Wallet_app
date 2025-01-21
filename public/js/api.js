class Api {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    async request(endpoint, options = {}) {
        try {
            const url = this.baseUrl + endpoint;
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Transactions
    async getTransactions(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request(`/transactions?${params.toString()}`);
    }

    async createTransaction(transaction) {
        const response = await this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction)
        });
        
        // Handle budget notifications
        if (response.notifications?.length) {
            response.notifications.forEach(notification => {
                utils.showToast(notification.message, notification.type);
            });
        }
        
        return response.transaction;
    }

    // Categories
    async getCategories() {
        return this.request('/categories');
    }

    async createCategory(category) {
        return this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(category)
        });
    }

    // Subcategories
    async getSubcategories(categoryId) {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        return this.request(`/subcategories?${params.toString()}`);
    }

    async createSubcategory(subcategory) {
        return this.request('/subcategories', {
            method: 'POST',
            body: JSON.stringify(subcategory)
        });
    }

    // Accounts
    async getAccounts() {
        return this.request('/accounts');
    }

    async createAccount(account) {
        return this.request('/accounts', {
            method: 'POST',
            body: JSON.stringify(account)
        });
    }

    // Budgets
    async getBudgets() {
        return this.request('/budgets');
    }

    async createBudget(budget) {
        return this.request('/budgets', {
            method: 'POST',
            body: JSON.stringify(budget)
        });
    }

    // Reports
    async getReport(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return this.request(`/reports?${params.toString()}`);
    }
}

// Create and export a single instance
const api = new Api(); 