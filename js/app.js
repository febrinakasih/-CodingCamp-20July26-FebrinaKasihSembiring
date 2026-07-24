let transactions = [];
try {
  const saved = localStorage.getItem('transactions');
  if (saved) {
    transactions = JSON.parse(saved);
  }
} catch (e) {
  console.error('Failed to load storage:', e);
}

let spendingLimit = localStorage.getItem('spendingLimit') || 0;
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let myChart = null;

function startApp() {
  const form = document.getElementById('transaction-form');
  const itemNameInput = document.getElementById('item-name');
  const amountInput = document.getElementById('amount');
  const categoryInput = document.getElementById('category');
  const themeToggle = document.getElementById('theme-toggle');
  const limitInput = document.getElementById('budget-limit');
  const sortSelect = document.getElementById('sort-order');

  // Load Saved Preferences
  if (isDarkMode) document.body.classList.add('dark-mode');
  if (themeToggle) themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
  if (limitInput) limitInput.value = spendingLimit || '';

  // Theme Toggle Event
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      isDarkMode = !isDarkMode;
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', isDarkMode);
      themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
  }

  // Limit Input Event
  if (limitInput) {
    limitInput.addEventListener('input', (e) => {
      spendingLimit = parseFloat(e.target.value) || 0;
      localStorage.setItem('spendingLimit', spendingLimit);
      renderBalance();
    });
  }

  // Sort Event
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      renderList();
    });
  }

  updateUI();

  if (form) {
    form.addEventListener('submit', (e) => {
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
        name: name,
        amount: amount,
        category: category
      };

      transactions.push(transaction);
      saveData();
      updateUI();

      form.reset();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

function saveData() {
  try {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

window.deleteTransaction = function(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  updateUI();
};

function updateUI() {
  renderList();
  renderBalance();
  renderChart();
}

function renderList() {
  const transactionList = document.getElementById('transaction-list');
  const sortOrder = document.getElementById('sort-order')?.value || 'newest';
  if (!transactionList) return;

  transactionList.innerHTML = '';

  if (transactions.length === 0) {
    transactionList.innerHTML = '<li style="color: #888; padding: 10px 0;">No transactions added yet.</li>';
    return;
  }

  // Copy & Sort transactions
  let sorted = [...transactions];
  if (sortOrder === 'highest') {
    sorted.sort((a, b) => b.amount - a.amount);
  } else if (sortOrder === 'lowest') {
    sorted.sort((a, b) => a.amount - b.amount);
  } else {
    sorted.reverse(); // Newest first
  }

  sorted.forEach(t => {
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

function renderBalance() {
  const totalBalanceEl = document.getElementById('total-balance');
  const balanceCard = document.querySelector('.balance-card');
  const limitWarning = document.getElementById('limit-warning');
  if (!totalBalanceEl) return;

  const total = transactions.reduce((acc, t) => acc + t.amount, 0);
  totalBalanceEl.textContent = `$${total.toFixed(2)}`;

  // Limit Check
  if (spendingLimit > 0 && total > spendingLimit) {
    balanceCard.classList.add('over-limit');
    if (limitWarning) limitWarning.textContent = `⚠️ Warning: Spending exceeded limit of $${spendingLimit.toFixed(2)}!`;
  } else {
    balanceCard.classList.remove('over-limit');
    if (limitWarning) limitWarning.textContent = '';
  }
}

function renderChart() {
  const canvas = document.getElementById('spendingChart');
  if (!canvas) return;

  if (typeof Chart === 'undefined') {
    setTimeout(renderChart, 200);
    return;
  }

  const ctx = canvas.getContext('2d');
  const categories = ['Food', 'Transport', 'Fun'];
  
  let dataSums = categories.map(cat => {
    return transactions
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const hasData = dataSums.some(sum => sum > 0);
  const displayData = hasData ? dataSums : [1, 1, 1];
  const displayColors = hasData 
    ? ['#28a745', '#007bff', '#fd7e14'] 
    : ['#e0e0e0', '#d6d6d6', '#cccccc'];

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: displayData,
        backgroundColor: displayColors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          enabled: hasData
        }
      }
    }
  });
}
