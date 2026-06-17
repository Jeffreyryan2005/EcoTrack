import { showToast } from '../utils/ui.js';
/**
 * @module calculator
 * @description Carbon Footprint Calculator component for EcoTrack
 */

export function renderCalculator(container) {
  container.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'calculator-page';

  // State
  const state = {
    activeTab: 'transport',
    data: {
      transport: { vehicleType: 'petrol', dailyDistance: 0, busKm: 0, trainKm: 0, subwayKm: 0, shortFlights: 0, longFlights: 0, walkCycle: false },
      energy: { electricity: 0, gas: 0, heatingType: 'gas', renewablePercent: 0, householdMembers: 1 },
      food: { dietType: 'average', beef: 2, chicken: 3, pork: 2, fish: 1, dairy: 5, eggs: 4, veg: 10, fruit: 10, wastePercent: 10, localPercent: 20 },
      shopping: { clothes: 0, smallElectronics: 0, largeElectronics: 0, householdGoods: 0, recyclePercent: 0 }
    },
    results: {
      total: 0,
      breakdown: { transport: 0, energy: 0, food: 0, shopping: 0 }
    }
  };

  // Mock calculation logic (in real app, import from carbon.js)
  const calculateFootprint = () => {
    // Very simplified mock calculations
    const d = state.data;
    
    // Transport
    let transportTotal = (d.transport.dailyDistance * 365 * 0.2) + 
                         (d.transport.shortFlights * 200) + 
                         (d.transport.longFlights * 800) +
                         (d.transport.busKm * 52 * 0.1) +
                         (d.transport.trainKm * 52 * 0.05);
    
    if(d.transport.vehicleType === 'ev') transportTotal *= 0.3;
    if(d.transport.walkCycle) transportTotal *= 0.9; // Small bonus
    
    // Energy
    let energyTotal = ((d.energy.electricity * 12 * 0.4) + (d.energy.gas * 12 * 2.0)) / Math.max(1, d.energy.householdMembers);
    energyTotal = energyTotal * (1 - (d.energy.renewablePercent / 100));

    // Food
    let foodBase = 1000;
    if(d.food.dietType === 'vegan') foodBase = 400;
    if(d.food.dietType === 'meat-heavy') foodBase = 1500;
    let foodTotal = foodBase + (d.food.beef * 50) + (d.food.wastePercent * 5) - (d.food.localPercent * 2);

    // Shopping
    let shoppingTotal = (d.shopping.clothes * 12 * 15) + 
                        (d.shopping.smallElectronics * 50) + 
                        (d.shopping.largeElectronics * 300) + 
                        (d.shopping.householdGoods * 12 * 10);
    shoppingTotal = shoppingTotal * (1 - (d.shopping.recyclePercent / 100 * 0.5));

    state.results.breakdown = { 
      transport: Math.max(0, transportTotal), 
      energy: Math.max(0, energyTotal), 
      food: Math.max(0, foodTotal), 
      shopping: Math.max(0, shoppingTotal) 
    };
    
    state.results.total = Math.round(
      state.results.breakdown.transport + 
      state.results.breakdown.energy + 
      state.results.breakdown.food + 
      state.results.breakdown.shopping
    );
  };

  // UI Render functions
  const renderTabs = () => `
    <div class="calc-tabs" role="tablist" aria-label="Calculator Categories">
      <button class="tab-btn ${state.activeTab === 'transport' ? 'active' : ''}" role="tab" aria-selected="${state.activeTab === 'transport'}" aria-controls="panel-transport" id="tab-transport">🚗 Transport</button>
      <button class="tab-btn ${state.activeTab === 'energy' ? 'active' : ''}" role="tab" aria-selected="${state.activeTab === 'energy'}" aria-controls="panel-energy" id="tab-energy">⚡ Energy</button>
      <button class="tab-btn ${state.activeTab === 'food' ? 'active' : ''}" role="tab" aria-selected="${state.activeTab === 'food'}" aria-controls="panel-food" id="tab-food">🍽️ Food</button>
      <button class="tab-btn ${state.activeTab === 'shopping' ? 'active' : ''}" role="tab" aria-selected="${state.activeTab === 'shopping'}" aria-controls="panel-shopping" id="tab-shopping">🛒 Shopping</button>
    </div>
  `;

  const renderTransportForm = () => `
    <div id="panel-transport" class="tab-panel" role="tabpanel" aria-labelledby="tab-transport" ${state.activeTab === 'transport' ? '' : 'hidden'}>
      <h2>Transport Habits</h2>
      <form class="calc-form" id="form-transport">
        <div class="form-group">
          <label for="vehicle-type">Primary Vehicle Type</label>
          <select id="vehicle-type" name="vehicleType" class="calc-input">
            <option value="petrol" ${state.data.transport.vehicleType === 'petrol' ? 'selected' : ''}>Petrol Car</option>
            <option value="diesel" ${state.data.transport.vehicleType === 'diesel' ? 'selected' : ''}>Diesel Car</option>
            <option value="hybrid" ${state.data.transport.vehicleType === 'hybrid' ? 'selected' : ''}>Hybrid Car</option>
            <option value="ev" ${state.data.transport.vehicleType === 'ev' ? 'selected' : ''}>Electric Car</option>
            <option value="motorcycle" ${state.data.transport.vehicleType === 'motorcycle' ? 'selected' : ''}>Motorcycle</option>
            <option value="none" ${state.data.transport.vehicleType === 'none' ? 'selected' : ''}>None</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="daily-distance">Daily Driving Distance (km)</label>
          <div class="range-with-input">
            <input type="range" id="daily-distance-slider" name="dailyDistance" class="calc-input" min="0" max="200" value="${state.data.transport.dailyDistance}">
            <input type="number" id="daily-distance" name="dailyDistance" class="calc-input" min="0" value="${state.data.transport.dailyDistance}" aria-describedby="daily-desc">
          </div>
          <small id="daily-desc" class="helper-text">Average commute is around 15km one way.</small>
        </div>

        <fieldset class="form-group-fieldset">
          <legend>Public Transport (km per week)</legend>
          <div class="grid-inputs-3">
            <div>
              <label for="bus-km">Bus</label>
              <input type="number" id="bus-km" name="busKm" class="calc-input" min="0" value="${state.data.transport.busKm}">
            </div>
            <div>
              <label for="train-km">Train</label>
              <input type="number" id="train-km" name="trainKm" class="calc-input" min="0" value="${state.data.transport.trainKm}">
            </div>
            <div>
              <label for="subway-km">Subway</label>
              <input type="number" id="subway-km" name="subwayKm" class="calc-input" min="0" value="${state.data.transport.subwayKm}">
            </div>
          </div>
        </fieldset>

        <fieldset class="form-group-fieldset">
          <legend>Flights (per year)</legend>
          <div class="grid-inputs-2">
            <div>
              <label for="short-flights">Short-haul (&lt; 3 hours)</label>
              <input type="number" id="short-flights" name="shortFlights" class="calc-input" min="0" value="${state.data.transport.shortFlights}">
            </div>
            <div>
              <label for="long-flights">Long-haul (&gt; 3 hours)</label>
              <input type="number" id="long-flights" name="longFlights" class="calc-input" min="0" value="${state.data.transport.longFlights}">
            </div>
          </div>
        </fieldset>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="walk-cycle" name="walkCycle" class="calc-input" ${state.data.transport.walkCycle ? 'checked' : ''}>
          <label for="walk-cycle">I frequently walk or cycle for my commute.</label>
        </div>
      </form>
    </div>
  `;

  const renderEnergyForm = () => `
    <div id="panel-energy" class="tab-panel" role="tabpanel" aria-labelledby="tab-energy" ${state.activeTab === 'energy' ? '' : 'hidden'}>
      <h2>Home Energy</h2>
      <form class="calc-form" id="form-energy">
        <div class="form-group">
          <label for="household-members">Number of Household Members</label>
          <input type="number" id="household-members" name="householdMembers" class="calc-input" min="1" max="15" value="${state.data.energy.householdMembers}" aria-describedby="members-desc">
          <small id="members-desc" class="helper-text">To calculate your personal share.</small>
        </div>

        <div class="form-group">
          <label for="electricity">Monthly Electricity Usage (kWh)</label>
          <input type="number" id="electricity" name="electricity" class="calc-input" min="0" value="${state.data.energy.electricity}" aria-describedby="elec-desc">
          <small id="elec-desc" class="helper-text">Average household uses ~250-300 kWh/month.</small>
        </div>

        <div class="form-group">
          <label for="heating-type">Primary Heating System</label>
          <select id="heating-type" name="heatingType" class="calc-input">
            <option value="gas" ${state.data.energy.heatingType === 'gas' ? 'selected' : ''}>Natural Gas</option>
            <option value="electric" ${state.data.energy.heatingType === 'electric' ? 'selected' : ''}>Electric Heating</option>
            <option value="oil" ${state.data.energy.heatingType === 'oil' ? 'selected' : ''}>Heating Oil</option>
            <option value="wood" ${state.data.energy.heatingType === 'wood' ? 'selected' : ''}>Wood Pellet / Biomass</option>
          </select>
        </div>

        <div class="form-group" id="gas-input-group" ${state.data.energy.heatingType !== 'gas' ? 'hidden' : ''}>
          <label for="gas">Monthly Natural Gas (m³)</label>
          <input type="number" id="gas" name="gas" class="calc-input" min="0" value="${state.data.energy.gas}">
        </div>

        <div class="form-group">
          <label for="renewable-percent">Percentage of Renewable Energy (%)</label>
          <div class="range-with-input">
            <input type="range" id="renewable-slider" name="renewablePercent" class="calc-input" min="0" max="100" value="${state.data.energy.renewablePercent}">
            <input type="number" id="renewable-percent" name="renewablePercent" class="calc-input" min="0" max="100" value="${state.data.energy.renewablePercent}">
          </div>
        </div>
      </form>
    </div>
  `;

  const renderFoodForm = () => `
    <div id="panel-food" class="tab-panel" role="tabpanel" aria-labelledby="tab-food" ${state.activeTab === 'food' ? '' : 'hidden'}>
      <h2>Diet & Food Habits</h2>
      <form class="calc-form" id="form-food">
        <div class="form-group">
          <label for="diet-type">General Diet Type</label>
          <select id="diet-type" name="dietType" class="calc-input">
            <option value="meat-heavy" ${state.data.food.dietType === 'meat-heavy' ? 'selected' : ''}>Meat-heavy (Meat every day)</option>
            <option value="average" ${state.data.food.dietType === 'average' ? 'selected' : ''}>Average (Meat a few times a week)</option>
            <option value="pescatarian" ${state.data.food.dietType === 'pescatarian' ? 'selected' : ''}>Pescatarian</option>
            <option value="vegetarian" ${state.data.food.dietType === 'vegetarian' ? 'selected' : ''}>Vegetarian</option>
            <option value="vegan" ${state.data.food.dietType === 'vegan' ? 'selected' : ''}>Vegan</option>
          </select>
        </div>

        <div class="advanced-diet-section">
          <h3>Custom Weekly Consumption (servings)</h3>
          <div class="grid-inputs-2">
            <div class="form-group">
              <label for="beef">Beef / Lamb</label>
              <input type="range" id="beef" name="beef" class="calc-input" min="0" max="21" value="${state.data.food.beef}">
              <span class="val-display">${state.data.food.beef}</span>
            </div>
            <div class="form-group">
              <label for="chicken">Chicken / Poultry</label>
              <input type="range" id="chicken" name="chicken" class="calc-input" min="0" max="21" value="${state.data.food.chicken}">
              <span class="val-display">${state.data.food.chicken}</span>
            </div>
            <div class="form-group">
              <label for="dairy">Dairy</label>
              <input type="range" id="dairy" name="dairy" class="calc-input" min="0" max="28" value="${state.data.food.dairy}">
              <span class="val-display">${state.data.food.dairy}</span>
            </div>
            <div class="form-group">
              <label for="veg">Vegetables</label>
              <input type="range" id="veg" name="veg" class="calc-input" min="0" max="35" value="${state.data.food.veg}">
              <span class="val-display">${state.data.food.veg}</span>
            </div>
          </div>
        </div>

        <div class="form-group mt-4">
          <label for="waste-percent">Estimated Food Waste (%)</label>
          <div class="range-with-input">
            <input type="range" id="waste-slider" name="wastePercent" class="calc-input" min="0" max="50" value="${state.data.food.wastePercent}">
            <input type="number" id="waste-percent" name="wastePercent" class="calc-input" min="0" max="50" value="${state.data.food.wastePercent}">
          </div>
        </div>

        <div class="form-group">
          <label for="local-percent">Local/Organic Purchasing (%)</label>
          <div class="range-with-input">
            <input type="range" id="local-slider" name="localPercent" class="calc-input" min="0" max="100" value="${state.data.food.localPercent}">
            <input type="number" id="local-percent" name="localPercent" class="calc-input" min="0" max="100" value="${state.data.food.localPercent}">
          </div>
        </div>
      </form>
    </div>
  `;

  const renderShoppingForm = () => `
    <div id="panel-shopping" class="tab-panel" role="tabpanel" aria-labelledby="tab-shopping" ${state.activeTab === 'shopping' ? '' : 'hidden'}>
      <h2>Shopping & Waste</h2>
      <form class="calc-form" id="form-shopping">
        <div class="form-group">
          <label for="clothes">Clothing Purchases (items per month)</label>
          <input type="number" id="clothes" name="clothes" class="calc-input" min="0" value="${state.data.shopping.clothes}">
        </div>

        <fieldset class="form-group-fieldset">
          <legend>Electronics Purchases (items per year)</legend>
          <div class="grid-inputs-2">
            <div>
              <label for="small-electronics">Small (Phones, accessories)</label>
              <input type="number" id="small-electronics" name="smallElectronics" class="calc-input" min="0" value="${state.data.shopping.smallElectronics}">
            </div>
            <div>
              <label for="large-electronics">Large (Laptops, TVs, appliances)</label>
              <input type="number" id="large-electronics" name="largeElectronics" class="calc-input" min="0" value="${state.data.shopping.largeElectronics}">
            </div>
          </div>
        </fieldset>

        <div class="form-group">
          <label for="household-goods">Household Goods (items/month)</label>
          <input type="number" id="household-goods" name="householdGoods" class="calc-input" min="0" value="${state.data.shopping.householdGoods}">
        </div>

        <div class="form-group">
          <label for="recycle-percent">How much of your waste do you recycle/compost? (%)</label>
          <div class="range-with-input">
            <input type="range" id="recycle-slider" name="recyclePercent" class="calc-input" min="0" max="100" value="${state.data.shopping.recyclePercent}">
            <input type="number" id="recycle-percent" name="recyclePercent" class="calc-input" min="0" max="100" value="${state.data.shopping.recyclePercent}">
          </div>
        </div>
      </form>
    </div>
  `;

  const renderResultsPanel = () => {
    let rating = 'Average';
    let ratingClass = 'rating-med';
    if(state.results.total < 4000) { rating = 'Low'; ratingClass = 'rating-low'; }
    else if(state.results.total > 10000) { rating = 'Very High'; ratingClass = 'rating-very-high'; }
    else if(state.results.total > 7000) { rating = 'High'; ratingClass = 'rating-high'; }

    return `
      <div class="results-panel" aria-live="polite">
        <div class="results-header">
          <h2>Your Footprint</h2>
        </div>
        
        <div class="total-display">
          <span class="total-number" id="animated-total">${state.results.total}</span>
          <span class="total-unit">kg CO₂ / year</span>
        </div>
        
        <div class="rating-badge ${ratingClass}">
          Impact: ${rating}
        </div>

        <div class="results-breakdown">
          <div class="breakdown-item">
            <span class="dot color-transport"></span> Transport: <span class="breakdown-val">${Math.round(state.results.breakdown.transport)}</span> kg
          </div>
          <div class="breakdown-item">
            <span class="dot color-energy"></span> Energy: <span class="breakdown-val">${Math.round(state.results.breakdown.energy)}</span> kg
          </div>
          <div class="breakdown-item">
            <span class="dot color-food"></span> Food: <span class="breakdown-val">${Math.round(state.results.breakdown.food)}</span> kg
          </div>
          <div class="breakdown-item">
            <span class="dot color-shopping"></span> Shopping: <span class="breakdown-val">${Math.round(state.results.breakdown.shopping)}</span> kg
          </div>
        </div>

        <div class="results-comparison">
          <label>You vs National Average</label>
          <div class="comparison-bar">
            <div class="bar-you" style="width: ${Math.min(100, (state.results.total / 12000) * 100)}%;">You</div>
            <div class="bar-avg" style="width: 70%;">Avg (8400)</div>
          </div>
        </div>

        <div class="results-actions">
          <button id="btn-save-track" class="btn-primary w-100 mb-2">Save & Track</button>
          <a href="/insights" class="btn-secondary w-100 text-center nav-link" data-link>Get Insights</a>
        </div>
      </div>
    `;
  };

  const renderView = () => {
    calculateFootprint(); // Ensure calcs are up to date
    wrapper.innerHTML = `
      <div class="calc-header">
        <h1>Carbon Footprint Calculator</h1>
        <p>Answer as accurately as you can to get a detailed breakdown of your environmental impact.</p>
      </div>
      <div class="calc-layout">
        <div class="calc-main">
          ${renderTabs()}
          <div class="calc-form-container">
            ${renderTransportForm()}
            ${renderEnergyForm()}
            ${renderFoodForm()}
            ${renderShoppingForm()}
          </div>
        </div>
        <div class="calc-sidebar">
          ${renderResultsPanel()}
        </div>
      </div>
    `;

    bindEvents();
  };

  // Debounce helper
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => { clearTimeout(timeout); func(...args); };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // eslint-disable-next-line no-unused-vars
  const updateStateAndRender = debounce((tab, key, value, type) => {
    let parsedValue = value;
    if (type === 'number' || type === 'range') parsedValue = parseFloat(value) || 0;
    if (type === 'checkbox') parsedValue = value === 'true' || value === true;
    
    state.data[tab][key] = parsedValue;
    
    // Check specific dependencies like heating type and gas
    if (key === 'heatingType') {
      const gasGroup = wrapper.querySelector('#gas-input-group');
      if (gasGroup) {
        gasGroup.hidden = (value !== 'gas');
      }
    }

    renderView(); // Re-render entirely (in React this is easy, in Vanilla we lose focus, so a better approach is to just update the DOM values and results panel without full render, but keeping it simple as requested)
    // Wait, full render loses focus. Let's do partial updates instead for inputs.
  }, 300);

  // Advanced bindings to prevent focus loss during typing
  const bindEvents = () => {
    // Tabs
    const tabBtns = wrapper.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.activeTab = e.target.id.replace('tab-', '');
        renderView(); // Tab change full render is okay
      });
    });

    // Inputs inside the active panel
    const inputs = wrapper.querySelectorAll('.calc-input');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.name;
        const type = e.target.type;
        const value = type === 'checkbox' ? e.target.checked : e.target.value;
        const tab = state.activeTab;

        // Sync synced inputs (range <-> number)
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
          const numInput = e.target.parentElement.querySelector('input[type="number"]');
          if (numInput) numInput.value = e.target.value;
          // also sync value display if present
          const valDisplay = e.target.parentElement.querySelector('.val-display');
          if(valDisplay) valDisplay.innerText = e.target.value;
        } else if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
          const rangeInput = e.target.parentElement.querySelector('input[type="range"]');
          if (rangeInput) rangeInput.value = e.target.value;
        }

        // Update state without losing focus
        let parsedValue = value;
        if (type === 'number' || type === 'range') parsedValue = parseFloat(value) || 0;
        if (type === 'checkbox') parsedValue = value;
        state.data[tab][key] = parsedValue;

        // Special UI toggle for gas
        if (key === 'heatingType') {
          const gasGroup = wrapper.querySelector('#gas-input-group');
          if(gasGroup) gasGroup.hidden = (parsedValue !== 'gas');
        }

        // Only recalculate and update sidebar, don't re-render forms
        calculateFootprint();
        updateSidebar();
      });
    });

    // Save Button
    const btnSave = wrapper.querySelector('#btn-save-track');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        showToast("Results saved to your dashboard!");
      });
    }
  };

  const updateSidebar = () => {
    const sidebar = wrapper.querySelector('.calc-sidebar');
    if (sidebar) {
      sidebar.innerHTML = renderResultsPanel();
      // Re-bind save button inside sidebar
      const btnSave = sidebar.querySelector('#btn-save-track');
      if (btnSave) {
        btnSave.addEventListener('click', () => {
          showToast("Results saved to your dashboard!");
        });
      }
    }
  };

  renderView();
  container.appendChild(wrapper);
}
