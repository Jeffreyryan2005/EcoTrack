import { showToast } from '../utils/ui.js';
/**
 * @module dashboard
 * @description Tracking Dashboard component for EcoTrack
 */

// Mocked ChartManager and Storage for component functionality
import { ChartManager } from '../charts/chartManager.js';
// import { SecureStorage } from '../utils/storage.js';

export function renderDashboard(container) {
  container.innerHTML = '';
  const content = document.createElement('div');
  content.className = 'dashboard-page';

  // State
  let timeRange = 'Month';
  
  // Mock Data
  const stats = {
    totalEmissions: 420, // kg for the current period
    trend: -5, // percentage
    goalProgress: 65, // percentage
    streak: 12, // days
    bestMonth: 'April'
  };

  const recentEntries = [
    { id: 1, date: '2023-10-24', category: 'Transport', detail: 'Drive to work', amount: 4.5 },
    { id: 2, date: '2023-10-23', category: 'Food', detail: 'Beef Burger', amount: 3.2 },
    { id: 3, date: '2023-10-22', category: 'Energy', detail: 'Home Electricity', amount: 12.0 },
    { id: 4, date: '2023-10-21', category: 'Shopping', detail: 'New Jeans', amount: 15.0 },
  ];

  const renderStatCards = () => `
    <div class="stat-cards-row">
      <div class="stat-card">
        <h3>Total Emissions</h3>
        <div class="stat-value">
          ${stats.totalEmissions} <span class="unit">kg CO₂</span>
        </div>
        <div class="stat-trend ${stats.trend <= 0 ? 'good' : 'bad'}">
          <span aria-hidden="true">${stats.trend <= 0 ? '↓' : '↑'}</span> ${Math.abs(stats.trend)}% vs last period
        </div>
      </div>
      <div class="stat-card">
        <h3>Goal Progress</h3>
        <div class="stat-value">${stats.goalProgress}%</div>
        <div class="progress-bar-bg" aria-hidden="true">
          <div class="progress-bar-fill" style="width: ${stats.goalProgress}%;"></div>
        </div>
        <div class="stat-desc">Monthly target: 600 kg</div>
      </div>
      <div class="stat-card">
        <h3>Current Streak</h3>
        <div class="stat-value">${stats.streak} <span class="unit">Days</span></div>
        <div class="stat-desc">Tracking every day!</div>
      </div>
      <div class="stat-card">
        <h3>Best Month</h3>
        <div class="stat-value">${stats.bestMonth}</div>
        <div class="stat-desc">Lowest footprint this year</div>
      </div>
    </div>
  `;

  const renderFilters = () => {
    const ranges = ['Week', 'Month', '3 Months', 'Year', 'All Time'];
    const buttons = ranges.map(r => `
      <button class="time-filter-btn ${timeRange === r ? 'active' : ''}" data-range="${r}" aria-pressed="${timeRange === r}">
        ${r}
      </button>
    `).join('');

    return `
      <div class="dashboard-controls">
        <div class="time-filters" role="group" aria-label="Filter data by time range">
          ${buttons}
        </div>
        <div class="dashboard-actions">
          <button type="button" id="btn-set-goal" class="btn-secondary">Set Goal</button>
          <button type="button" id="btn-export-data" class="btn-secondary">Export CSV</button>
          <button type="button" id="btn-share-progress" class="btn-primary">Share Progress</button>
          <button type="button" id="btn-share-linkedin" class="btn-primary" style="background:#0077b5;" aria-label="Share on LinkedIn">LinkedIn</button>
          <button type="button" id="btn-offset-emissions" class="btn-primary" style="background:var(--secondary-color);">Offset Emissions</button>
          <button type="button" id="btn-clear-data" class="btn-danger" style="background:var(--error-color); color:white;">Clear Data</button>
        </div>
      </div>
    `;
  };

  const renderChartsSection = () => `
    <div class="charts-grid">
      <div class="chart-container main-chart">
        <h3>Emission Trend</h3>
        <canvas id="trendChart" aria-label="Line chart showing emission trends over time" role="img"></canvas>
        <div class="chart-fallback" hidden>Chart data unavailable</div>
      </div>
      <div class="chart-container side-chart">
        <h3>Category Breakdown</h3>
        <canvas id="breakdownChart" aria-label="Doughnut chart showing emissions by category" role="img"></canvas>
      </div>
      <div class="chart-container full-width-chart">
        <h3>Monthly Comparison</h3>
        <canvas id="comparisonChart" aria-label="Bar chart comparing emissions per month" role="img"></canvas>
      </div>
    </div>
  `;

  const renderRecentEntries = () => {
    if (recentEntries.length === 0) {
      return `
        <div class="recent-entries empty-state">
          <h3>Recent Entries</h3>
          <p>No data recorded yet.</p>
          <a href="/calculator" class="btn-primary">Use Calculator</a>
        </div>
      `;
    }

    const rows = recentEntries.map(entry => {
      const icon = entry.category === 'Transport' ? '🚗' : 
                   entry.category === 'Food' ? '🍽️' : 
                   entry.category === 'Energy' ? '⚡' : '🛒';
      
      return `
        <tr class="entry-row">
          <td>${entry.date}</td>
          <td><span aria-hidden="true">${icon}</span> ${entry.category}</td>
          <td>${entry.detail}</td>
          <td class="amount-cell">${entry.amount} kg</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="recent-entries-section">
        <h3>Recent Entries</h3>
        <div class="table-responsive">
          <table class="entries-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Category</th>
                <th scope="col">Detail</th>
                <th scope="col" class="amount-cell">Amount (CO₂)</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderGoalModal = () => `
    <div id="goal-modal" class="modal-overlay" hidden aria-hidden="true">
      <div class="modal-content" role="dialog" aria-labelledby="modal-title" aria-modal="true">
        <h2 id="modal-title">Set Emission Goal</h2>
        <form id="goal-form">
          <div class="form-group">
            <label for="target-amount">Monthly Target (kg CO₂)</label>
            <input type="number" id="target-amount" value="600" min="50" step="10">
            <span class="helper-text" id="target-helper">National average is ~800kg/month.</span>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn-primary">Save Goal</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const renderView = () => {
    content.innerHTML = `
      <header class="dashboard-header">
        <h1>Your Tracking Dashboard</h1>
      </header>
      ${renderFilters()}
      ${renderStatCards()}
      ${renderChartsSection()}
      ${renderRecentEntries()}
      ${renderGoalModal()}
    `;

    // Initialize real charts
    const chartManager = new ChartManager();
    setTimeout(() => {
      chartManager.createTrendLine('trendChart', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [450, 420, 400, 380, 410, 390]);
      chartManager.createCategoryDoughnut('breakdownChart', { transport: 150, energy: 120, food: 100, shopping: 50 });
      chartManager.createBarChart('comparisonChart', ['You', 'Average'], [420, 600]);
    }, 0);

    // Event Listeners
    const filterBtns = content.querySelectorAll('.time-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        timeRange = e.target.getAttribute('data-range');
        // Re-render or fetch new data here
        renderView(); 
      });
    });

    // Modal logic
    const goalModal = content.querySelector('#goal-modal');
    const btnSetGoal = content.querySelector('#btn-set-goal');
    const btnCancelModal = content.querySelector('#btn-cancel-modal');
    const goalForm = content.querySelector('#goal-form');

    if (btnSetGoal) {
      btnSetGoal.addEventListener('click', () => {
        goalModal.hidden = false;
        goalModal.setAttribute('aria-hidden', 'false');
        content.querySelector('#target-amount').focus();
      });
    }

    if (btnCancelModal) {
      btnCancelModal.addEventListener('click', () => {
        goalModal.hidden = true;
        goalModal.setAttribute('aria-hidden', 'true');
      });
    }

    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Goal saved successfully!');
        goalModal.hidden = true;
        goalModal.setAttribute('aria-hidden', 'true');
      });
    }

    // Export Data logic
    const btnExport = content.querySelector('#btn-export-data');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        // Generate CSV Data
        const csvContent = "data:text/csv;charset=utf-8,Category,Value(kg CO2)\\nTransport,150\\nEnergy,120\\nFood,100\\nShopping,50";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "ecotrack_data.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
        showToast('CSV downloaded successfully!', 'success');
      });
    }

    // Offset Emissions logic
    const btnOffset = content.querySelector('#btn-offset-emissions');
    if (btnOffset) {
      btnOffset.addEventListener('click', () => {
        showToast('Redirecting to carbon offset partners (mocked)', 'success');
        // In a real app, this would open a modal to buy carbon credits or plant trees
      });
    }

    // LinkedIn Share logic
    const btnLinkedIn = content.querySelector('#btn-share-linkedin');
    if (btnLinkedIn) {
      btnLinkedIn.addEventListener('click', () => {
        const url = encodeURIComponent(window.location.origin);
        const text = encodeURIComponent(`I'm tracking my carbon footprint on EcoTrack! My current footprint is ${totalCarbon.toFixed(1)} kg CO2e. Join me in making a difference! 🌍🌱 #EcoTrack #Sustainability #ClimateAction`);
        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text} ${url}`, '_blank', 'noopener,noreferrer');
      });
    }

    // Share logic
    const btnShare = content.querySelector('#btn-share-progress');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        const text = `I'm tracking my carbon footprint with EcoTrack! My emissions trend is down ${Math.abs(stats.trend)}%. Join me and start tracking yours to save the planet! 🌍💚\n\n#EcoTrack #Sustainability #CarbonFootprint`;
        const url = window.location.origin;
        
        if (navigator.share) {
          navigator.share({
            title: 'EcoTrack - My Carbon Footprint',
            text: text,
            url: url
          }).catch(() => showToast('Share cancelled or failed', 'error'));
        } else {
          navigator.clipboard.writeText(`${text}\n${url}`)
            .then(() => showToast('Share text copied to clipboard!', 'success'))
            .catch(() => showToast('Failed to copy share text.', 'error'));
        }
      });
    }

    // Clear Data logic
    const btnClear = content.querySelector('#btn-clear-data');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('Are you sure you want to completely erase all your tracking data? This cannot be undone.')) {
          localStorage.clear();
          showToast('All tracking data cleared.', 'success');
          // Reload page after a short delay
          setTimeout(() => window.location.reload(), 1500);
        }
      });
    }
  };

  renderView();
  container.appendChild(content);
}
