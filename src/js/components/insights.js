import { showToast } from '../utils/ui.js';
/**
 * @module insights
 * @description Personalized Insights component for EcoTrack
 */

// Dummy insight model import (mocked for this component)
// import { generateRecommendations } from '../models/insights.js';

export function renderInsights(container) {
  // Clear container
  container.innerHTML = '';
  
  const content = document.createElement('div');
  content.className = 'insights-page';

  // State
  let activeFilter = 'All';

  // Mocked recommendations based on user data
  const recommendations = [
    {
      id: 1,
      category: 'Food',
      categoryIcon: '🍽️',
      impact: 'High',
      title: 'Adopt a more plant-based diet',
      description: 'Reducing your meat consumption can significantly drop your dietary carbon footprint. Red meat specifically has a very high carbon cost.',
      savings: 'Up to 800 kg CO₂/year',
      difficulty: 3, // 1 to 5
      steps: [
        'Start with Meatless Mondays.',
        'Swap beef for poultry or fish.',
        'Try plant-based alternatives for milk and cheese.',
        'Explore entirely vegetarian recipes for dinners.'
      ]
    },
    {
      id: 2,
      category: 'Transport',
      categoryIcon: '🚗',
      impact: 'High',
      title: 'Commute by public transit or bike',
      description: 'Driving alone is extremely carbon-intensive. Shifting your daily commute to public transit or cycling drastically reduces emissions.',
      savings: 'Up to 1,200 kg CO₂/year',
      difficulty: 4,
      steps: [
        'Check local bus or train routes for your commute.',
        'Invest in a comfortable bicycle or e-bike.',
        'If you must drive, look into carpooling with colleagues.',
        'Work from home one or two days a week if possible.'
      ]
    },
    {
      id: 3,
      category: 'Energy',
      categoryIcon: '⚡',
      impact: 'Medium',
      title: 'Switch to a green energy tariff',
      description: 'Many utility companies offer plans powered 100% by renewable energy like wind and solar.',
      savings: 'Up to 1,500 kg CO₂/year',
      difficulty: 1,
      steps: [
        'Check your current electricity bill and provider.',
        'Research green energy providers in your area.',
        'Call your provider or use their website to switch to a renewable plan.'
      ]
    },
    {
      id: 4,
      category: 'Shopping',
      categoryIcon: '🛒',
      impact: 'Low',
      title: 'Buy secondhand clothing',
      description: 'The fashion industry is highly polluting. Buying pre-loved clothes extends their life and reduces demand for fast fashion.',
      savings: 'Up to 150 kg CO₂/year',
      difficulty: 2,
      steps: [
        'Visit local thrift shops for your next wardrobe update.',
        'Use apps like Vinted, Depop, or Poshmark.',
        'Organize clothing swaps with friends.',
        'Repair damaged clothes instead of throwing them away.'
      ]
    },
    {
      id: 5,
      category: 'Energy',
      categoryIcon: '⚡',
      impact: 'Medium',
      title: 'Optimize home heating',
      description: 'Heating uses a lot of energy. Lowering your thermostat just a little makes a big difference.',
      savings: 'Up to 300 kg CO₂/year',
      difficulty: 2,
      steps: [
        'Turn down the thermostat by 1°C (or 2°F).',
        'Install a smart thermostat to avoid heating an empty home.',
        'Seal drafts around doors and windows.',
        'Wear warmer clothing indoors during winter.'
      ]
    }
  ];

  // Helper function to map impact to colors
  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'impact-red';
      case 'medium': return 'impact-amber';
      case 'low': return 'impact-green';
      default: return '';
    }
  };

  // Helper function for difficulty stars
  const renderDifficulty = (level) => {
    return Array.from({ length: 5 }).map((_, i) => 
      `<span class="star ${i < level ? 'filled' : 'empty'}" aria-hidden="true">★</span>`
    ).join('');
  };

  // Render Header
  const renderHeader = () => {
    return `
      <header class="insights-header">
        <h1>Your Smart EcoAssistant Insights</h1>
        <p class="insights-subtitle">As your dynamic AI assistant, I've analyzed your footprint. Here are the most effective actions you can take to reduce your impact.</p>
        
        <div class="potential-section">
          <h2>Your Potential Impact</h2>
          <div class="potential-stats">
            <div class="stat-box">
              <span class="stat-label">Current Footprint</span>
              <span class="stat-value">9.2 <small>tonnes/yr</small></span>
            </div>
            <div class="stat-arrow" aria-hidden="true">➡️</div>
            <div class="stat-box highlight">
              <span class="stat-label">Projected Footprint</span>
              <span class="stat-value">6.5 <small>tonnes/yr</small></span>
            </div>
          </div>
          <p class="motivation-msg">"Adopting your top 3 actions could reduce your footprint by nearly 30%!"</p>
        </div>
      </header>
    `;
  };

  // Render Filters
  const renderFilters = () => {
    const filters = ['All', 'Transport', 'Energy', 'Food', 'Shopping'];
    const filterButtons = filters.map(f => `
      <button class="filter-btn ${activeFilter === f ? 'active' : ''}" data-filter="${f}" aria-pressed="${activeFilter === f}">
        ${f}
      </button>
    `).join('');

    return `
      <div class="insights-filters" role="group" aria-label="Filter insights by category">
        ${filterButtons}
      </div>
    `;
  };

  // Render Cards Grid
  const renderCards = (recs) => {
    if (recs.length === 0) {
      return `<div class="empty-state">Great job! No major recommendations right now. Keep up the good work!</div>`;
    }

    const cards = recs.map(rec => `
      <article class="insight-card">
        <div class="insight-card-header">
          <div class="insight-category" aria-label="Category: ${rec.category}">
            <span class="category-icon" aria-hidden="true">${rec.categoryIcon}</span>
            <span>${rec.category}</span>
          </div>
          <span class="impact-badge ${getImpactColor(rec.impact)}">${rec.impact} Impact</span>
        </div>
        
        <div class="insight-card-body">
          <h3 class="insight-title">${rec.title}</h3>
          <p class="insight-desc">${rec.description}</p>
          <div class="insight-meta">
            <div class="savings-highlight">
              <span aria-hidden="true">📉</span> ${rec.savings}
            </div>
            <div class="difficulty-indicator" aria-label="Difficulty: ${rec.difficulty} out of 5">
              ${renderDifficulty(rec.difficulty)}
            </div>
          </div>
        </div>
        
        <div class="insight-card-footer">
          <button class="btn-toggle-steps" aria-expanded="false" aria-controls="steps-${rec.id}">
            View Steps <span class="toggle-icon" aria-hidden="true">▼</span>
          </button>
          <button class="btn-start-action">Start This Action</button>
        </div>
        
        <div id="steps-${rec.id}" class="insight-steps-container" hidden>
          <h4>How to get started:</h4>
          <ol class="insight-steps-list">
            ${rec.steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
      </article>
    `).join('');

    return `<div class="insights-grid">${cards}</div>`;
  };

  // Main render loop function
  const renderView = () => {
    const filteredRecs = activeFilter === 'All' 
      ? recommendations 
      : recommendations.filter(r => r.category === activeFilter);

    content.innerHTML = `
      ${renderHeader()}
      ${renderFilters()}
      ${renderCards(filteredRecs)}
    `;

    // Attach Event Listeners
    const filterBtns = content.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeFilter = e.target.getAttribute('data-filter');
        renderView(); // Re-render on filter change
      });
    });

    const toggleBtns = content.querySelectorAll('.btn-toggle-steps');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !isExpanded);
        
        const controlsId = btn.getAttribute('aria-controls');
        const stepsContainer = content.querySelector(`#${controlsId}`);
        
        if (isExpanded) {
          stepsContainer.hidden = true;
          btn.innerHTML = 'View Steps <span class="toggle-icon" aria-hidden="true">▼</span>';
        } else {
          stepsContainer.hidden = false;
          btn.innerHTML = 'Hide Steps <span class="toggle-icon" aria-hidden="true">▲</span>';
        }
      });
    });

    const startBtns = content.querySelectorAll('.btn-start-action');
    startBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.insight-card');
        const title = card.querySelector('.insight-title').innerText;
        showToast(`Great! You've started tracking the action: "${title}". This will be added to your active challenges.`);
      });
    });
  };

  renderView();
  container.appendChild(content);
}
