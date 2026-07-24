// State & Elements
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart = null;

const form = document.getElementById('transaction-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');
const totalBalanceEl = document.getElementById('total-balance');

// Initialize App
function init() {
  updateUI();
  form.addEventListener('submit', addTransaction);
}

// Add New Transaction
function addTransaction(e) {
  e.preventDefault();

  const name = itemNameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!name || isNaN(amount) || amount <= 0) {
    alert('Please enter valid details!');
    return;
  }

  const transaction = {
    id: Date.now(),
    name,
    amount,
    category
  };

  transactions.push(transaction);
  saveData();
  updateUI();

  // Reset Form
  form.reset();
}

// Delete Transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  updateUI();
}

// Save to LocalStorage
function saveData() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update UI Components
function updateUI() {
  renderList();
  renderBalance();
  renderChart();
}

// Render Transaction List
function renderList() {
  transactionList.innerHTML = '';

  if (transactions.length === 0) {
    transactionList.innerHTML = '<li style="color: #888;">No transactions added yet.</li>';
    return;
  }

  transactions.forEach(t => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.innerHTML = `
      <div class="transaction-info">
        <h4>${t.name}</h4>
        <p>$${t.amount.toFixed(2)}</p>
        <small>${t.category}</small>
      </div>
      <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
    `;
    transactionList.appendChild(li);
  });
}

// Render Total Balance
function renderBalance() {
  const total = transactions.reduce((acc, t) => acc + t.amount, 0);
  totalBalanceEl.textContent = `$${total.toFixed(2)}`;
}

// Render Pie Chart
function renderChart() {
  const ctx = document.getElementById('spendingChart').getContext('2d');

  // Calculate totals per category
  const categories = ['Food', 'Transport', 'Fun'];
  const dataSums = categories.map(cat => {
    return transactions
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
  });

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: dataSums,
        backgroundColor: ['#28a745', '#007bff', '#fd7e14']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Run App on Load
init();
