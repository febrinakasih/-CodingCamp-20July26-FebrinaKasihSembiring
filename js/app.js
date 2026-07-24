let transactions = [];
try {
  const saved = localStorage.getItem('transactions');
  if (saved) {
    transactions = JSON.parse(saved);
  }
} catch (e) {
  console.error('Failed to load storage:', e);
}

let myChart = null;

function startApp() {
  const form = document.getElementById('transaction-form');
  const itemNameInput = document.getElementById('item-name');
  const amountInput = document.getElementById('amount');
  const categoryInput = document.getElementById('category');

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
  if (!transactionList) return;

  transactionList.innerHTML = '';

  if (transactions.length === 0) {
    transactionList.innerHTML = '<li style="color: #888; padding: 10px 0;">No transactions added yet.</li>';
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

function renderBalance() {
  const totalBalanceEl = document.getElementById('total-balance');
  if (!totalBalanceEl) return;

  const total = transactions.reduce((acc, t) => acc + t.amount, 0);
  totalBalanceEl.textContent = `$${total.toFixed(2)}`;
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
