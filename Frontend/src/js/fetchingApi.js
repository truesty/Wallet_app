// Fetch transactions and render them on the page
// Fetch transactions and render them on the page
export function fetchTransactions() {
    fetch('http://localhost:3000/api/transactions')
        .then(response => response.json())
        .then(data => {
            let transactionsList = document.getElementById('transactions-list');
            transactionsList.innerHTML = '';
            data.forEach(transaction => {
                let listItem = document.createElement('li');
                listItem.classList.add('list-group-item');
                listItem.textContent = `${transaction.description}: $${transaction.amount} on ${transaction.date}`;
                transactionsList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching transactions:', error));
}



// Fetch accounts and render them on the page
export function fetchAccounts() {
    fetch('http://localhost:3000/api/accounts')
        .then(response => response.json())
        .then(data => {
            let accountList = document.getElementById('account-list');
            accountList.innerHTML = '';
            data.forEach(account => {
                let listItem = document.createElement('li');
                listItem.textContent = `${account.accountName}: $${account.balance}`;
                accountList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching accounts:', error));
}

// Fetch categories and render them on the page
export function fetchCategories() {
    fetch('http://localhost:3000/api/categories')
        .then(response => response.json())
        .then(data => {
            let categoryList = document.getElementById('category-list');
            categoryList.innerHTML = '';
            data.forEach(category => {
                let listItem = document.createElement('li');
                listItem.textContent = `${category.categoryName}: ${category.subcategories.join(', ')}`;
                categoryList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// Fetch budgets and render them on the page
export function fetchBudgets() {
    fetch('http://localhost:3000/api/budgets')
        .then(response => response.json())
        .then(data => {
            let budgetList = document.getElementById('budget-list');
            budgetList.innerHTML = '';
            data.forEach(budget => {
                let listItem = document.createElement('li');
                listItem.textContent = `${budget.category}: $${budget.currentSpending} / $${budget.amount}`;
                budgetList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching budgets:', error));
}

// Call these functions to load data on page load
window.onload = function() {
    fetchTransactions();
    fetchAccounts();
    fetchCategories();
    fetchBudgets();
}
