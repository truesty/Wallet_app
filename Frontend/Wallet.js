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

// Fetch transactions and display them in the table
function fetchTransactionsWithLoader() {
    const spinner = document.getElementById('spinner');
    const transactionsTableBody = document.getElementById('transactions-table-body');

    // Show spinner while fetching
    spinner.style.display = 'block';

    // Simulated backend call (replace URL with your backend endpoint)
    fetch('http://localhost:3000/api/transactions')
        .then(response => response.json())
        .then(data => {
            transactionsTableBody.innerHTML = ''; // Clear existing rows
            data.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.description}</td>
                    <td>$${transaction.amount.toFixed(2)}</td>
                    <td>${new Date(transaction.date).toLocaleDateString()}</td>
                    <td>${transaction.category}</td>
                    <td>${transaction.subcategory}</td>
                `;
                transactionsTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching transactions:', error);
        })
        .finally(() => {
            spinner.style.display = 'none'; // Hide spinner after fetching
        });
}
