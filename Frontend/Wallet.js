const API_URL = 'http://localhost:3000/api/transactions';

// Populate subcategories dynamically based on category selection
const subcategories = {
    food: ["Groceries", "Restaurants", "Snacks"],
    transport: ["Fuel", "Public Transport", "Taxi"],
    entertainment: ["Movies", "Concerts", "Games"],
    utilities: ["Electricity", "Water", "Internet"]
};

document.getElementById('category').addEventListener('change', (event) => {
    const selectedCategory = event.target.value;
    const subcategoryDropdown = document.getElementById('subcategory');

    subcategoryDropdown.innerHTML = '<option value="">Select Subcategory</option>';
    if (subcategories[selectedCategory]) {
        subcategories[selectedCategory].forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory;
            option.textContent = subcategory;
            subcategoryDropdown.appendChild(option);
        });
    }
});

// Add transaction and store it on the server
document.getElementById('transaction-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const transaction = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        subcategory: document.getElementById('subcategory').value
    };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    })
    .then(response => response.json())
    .then(data => {
        totalExpenses += transaction.amount;
        checkBudget();
        addTransactionToTable(data); // Add the transaction to the table
    })
    .catch(error => {
        console.error('Error adding transaction:', error);
    });
});

// Fetch transactions and display them in the table
function fetchTransactionsWithLoader() {
    const spinner = document.getElementById('spinner');
    const transactionsTableBody = document.getElementById('transactions-table-body');

    // Show spinner while fetching
    spinner.style.display = 'block';

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            transactionsTableBody.innerHTML = ''; // Clear existing rows
            data.forEach(transaction => {
                addTransactionToTable(transaction);
            });
        })
        .catch(error => {
            console.error('Error fetching transactions:', error);
        })
        .finally(() => {
            spinner.style.display = 'none'; // Hide spinner after fetching
        });
}

// Function to add a transaction to the table
function addTransactionToTable(transaction) {
    const transactionsTableBody = document.getElementById('transactions-table-body');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${transaction.description}</td>
        <td>$${transaction.amount.toFixed(2)}</td>
        <td>${new Date(transaction.date).toLocaleDateString()}</td>
        <td>${transaction.category}</td>
        <td>${transaction.subcategory}</td>
    `;
    transactionsTableBody.appendChild(row);
}

// Budget management and notification
let totalExpenses = 0;
let budgetLimit = 0;

document.getElementById('budget-form').addEventListener('submit', (event) => {
    event.preventDefault();
    budgetLimit = parseFloat(document.getElementById('budget-amount').value);
    document.getElementById('total-budget').innerText = `$${budgetLimit.toFixed(2)}`;
    alert(`Budget set to $${budgetLimit}`);
});

function checkBudget() {
    document.getElementById('total-expenses').innerText = `$${totalExpenses.toFixed(2)}`;
    if (totalExpenses > budgetLimit) {
        alert('You have exceeded your budget!');
    }
}

// Category management
document.getElementById('category-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const newCategory = document.getElementById('new-category').value;
    const newSubcategory = document.getElementById('new-subcategory').value;

    if (!categories[newCategory]) {
        categories[newCategory] = [];
    }
    categories[newCategory].push(newSubcategory);
    alert(`Added ${newSubcategory} to ${newCategory}`);
    
    // Update category dropdown
    const categoryDropdown = document.getElementById('category');
    const option = document.createElement('option');
    option.value = newCategory;
    option.textContent = newCategory;
    categoryDropdown.appendChild(option);
});

// Generate report based on the desired time gap
document.getElementById('report-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const filteredTransactions = data.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transactionDate >= startDate && transactionDate <= endDate;
            });

            const csvData = filteredTransactions.map(transaction => {
                return `${transaction.description},${transaction.amount},${transaction.date},${transaction.category},${transaction.subcategory}`;
            }).join('\n');

            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions_report.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Error generating report:', error);
        });
});

// Dark Mode Toggle Functionality
document.getElementById('toggle-dark-mode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const currentMode = document.body.classList.contains('dark-mode') ? 'Dark Mode' : 'Light Mode';
    alert(`Switched to ${currentMode}`);
});
