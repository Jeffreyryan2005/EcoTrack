/**
 * @module education
 * @description Education Hub component for EcoTrack
 */

export function renderEducation(container) {
  const content = document.createElement('div');
  content.className = 'education-hub';

  // Hero Section
  const heroHTML = `
    <header class="education-hero">
      <h1 class="hero-title">Understanding Your Carbon Footprint</h1>
      <p class="hero-subtitle">Learn how daily choices impact our planet and discover practical ways to reduce your emissions.</p>
    </header>
  `;

  // Quick Facts Carousel
  const factsHTML = `
    <section class="quick-facts-section" aria-labelledby="facts-title">
      <h2 id="facts-title" class="section-title">Quick Facts</h2>
      <div class="facts-grid">
        <div class="fact-card">
          <div class="fact-icon" aria-hidden="true">🌍</div>
          <p>The average person produces <strong>4-5 tonnes</strong> of CO₂ per year globally, but over <strong>15 tonnes</strong> in developed nations.</p>
        </div>
        <div class="fact-card">
          <div class="fact-icon" aria-hidden="true">🚗</div>
          <p>Transport accounts for roughly <strong>27%</strong> of global greenhouse gas emissions.</p>
        </div>
        <div class="fact-card">
          <div class="fact-icon" aria-hidden="true">🍽️</div>
          <p>Food production causes <strong>26%</strong> of global emissions, with meat and dairy making up the majority.</p>
        </div>
        <div class="fact-card">
          <div class="fact-icon" aria-hidden="true">⚡</div>
          <p>Switching to renewable energy can reduce a household's footprint by up to <strong>1.5 tonnes</strong> of CO₂ annually.</p>
        </div>
        <div class="fact-card">
          <div class="fact-icon" aria-hidden="true">🗑️</div>
          <p>A third of all food produced is wasted. If food waste were a country, it would be the <strong>3rd largest emitter</strong>.</p>
        </div>
        <div class="fact-card">
          <div class="fact-icon" aria-hidden="true">👕</div>
          <p>The fashion industry is responsible for <strong>10%</strong> of annual global carbon emissions.</p>
        </div>
      </div>
    </section>
  `;

  // Deep Dives (Accordions)
  const categoriesHTML = `
    <section class="deep-dives-section" aria-labelledby="deep-dives-title">
      <h2 id="deep-dives-title" class="section-title">Category Deep Dives</h2>
      <div class="accordion-container">
        
        <details class="accordion-item">
          <summary class="accordion-header">
            <span class="accordion-icon" aria-hidden="true">🚗</span>
            <h3>Transport</h3>
          </summary>
          <div class="accordion-content">
            <p>Transportation is one of the largest sources of emissions. Cars, trucks, ships, trains, and planes all burn fossil fuels.</p>
            <ul>
              <li><strong>Flights:</strong> A single long-haul flight can produce more CO₂ than an average person emits in an entire year across dozens of countries.</li>
              <li><strong>Cars:</strong> Driving alone in a petrol/diesel car is the least efficient form of ground transport. Carpooling or switching to EVs significantly lowers impact.</li>
              <li><strong>Public Transit:</strong> Buses and trains spread the emissions cost across many passengers, drastically reducing the per-person footprint.</li>
            </ul>
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-header">
            <span class="accordion-icon" aria-hidden="true">⚡</span>
            <h3>Energy</h3>
          </summary>
          <div class="accordion-content">
            <p>Our homes and buildings require immense energy to heat, cool, and power.</p>
            <ul>
              <li><strong>Heating & Cooling:</strong> Often the largest chunk of home energy. Better insulation and smart thermostats can cut this by 20% or more.</li>
              <li><strong>Vampire Power:</strong> Electronics plugged in but not in use still draw power. Unplugging them can save 5-10% on residential electricity bills.</li>
              <li><strong>Renewables:</strong> Installing solar panels or opting into a green energy plan from your utility provider transforms your impact.</li>
            </ul>
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-header">
            <span class="accordion-icon" aria-hidden="true">🍽️</span>
            <h3>Food</h3>
          </summary>
          <div class="accordion-content">
            <p>What we eat matters immensely. The entire supply chain—farming, processing, transport, and packaging—contributes to emissions.</p>
            <ul>
              <li><strong>Plant-based diets:</strong> Producing plant-based foods generally emits significantly fewer greenhouse gases than producing meat and dairy.</li>
              <li><strong>Food miles:</strong> Eating local and in-season reduces the transportation emissions of your food.</li>
              <li><strong>Deforestation:</strong> Large-scale agriculture, particularly for cattle and animal feed, drives deforestation, eliminating vital carbon sinks.</li>
            </ul>
          </div>
        </details>

        <details class="accordion-item">
          <summary class="accordion-header">
            <span class="accordion-icon" aria-hidden="true">🛒</span>
            <h3>Shopping & Waste</h3>
          </summary>
          <div class="accordion-content">
            <p>Every product we buy has embodied carbon—emissions generated during its raw material extraction, manufacturing, and transport.</p>
            <ul>
              <li><strong>Fast Fashion:</strong> Buying fewer, higher-quality garments or shopping secondhand reduces demand for resource-intensive textile production.</li>
              <li><strong>Electronics:</strong> The manufacturing phase of devices like smartphones accounts for roughly 80% of their total carbon footprint. Keep them longer!</li>
              <li><strong>Circular Economy:</strong> Repairing, reusing, and recycling keeps materials in use, significantly cutting down on new production emissions.</li>
            </ul>
          </div>
        </details>

      </div>
    </section>
  `;

  // Equivalencies Section
  const equivalenciesHTML = `
    <section class="equivalencies-section" aria-labelledby="equiv-title">
      <h2 id="equiv-title" class="section-title">What does 1 Tonne of CO₂ look like?</h2>
      <div class="equivalencies-grid">
        <div class="equiv-card">
          <div class="equiv-visual" aria-hidden="true">✈️ ✈️ ✈️ ✈️</div>
          <p><strong>4 Economy Flights</strong></p>
          <span>London to Paris and back</span>
        </div>
        <div class="equiv-card">
          <div class="equiv-visual" aria-hidden="true">🌳 x 63</div>
          <p><strong>63 Trees</strong></p>
          <span>Needed to grow for 10 years to absorb it</span>
        </div>
        <div class="equiv-card">
          <div class="equiv-visual" aria-hidden="true">🚙 4,000 km</div>
          <p><strong>4,000 Kilometers</strong></p>
          <span>Driven in an average petrol car</span>
        </div>
        <div class="equiv-card">
          <div class="equiv-visual" aria-hidden="true">📱 x 121,000</div>
          <p><strong>121,000 Smartphones</strong></p>
          <span>Charged from 0 to 100%</span>
        </div>
      </div>
    </section>
  `;

  // Tips and Resources
  const tipsHTML = `
    <section class="tips-section" aria-labelledby="tips-title">
      <h2 id="tips-title" class="section-title">Actionable Tips to Get Started</h2>
      <ul class="action-tips-list">
        <li><strong>Audit your life:</strong> Use our calculator to find your biggest emission sources.</li>
        <li><strong>Switch your bulbs:</strong> Swap incandescent bulbs for LEDs.</li>
        <li><strong>Eat plant-based:</strong> Start with Meatless Mondays and expand from there.</li>
        <li><strong>Wash cold:</strong> Wash clothes in cold water to save the energy used to heat it.</li>
        <li><strong>Fly less:</strong> Take a train for regional trips, or use video conferencing instead of flying for business.</li>
      </ul>
      <div class="resources-links">
        <h3>External Resources</h3>
        <a href="https://www.ipcc.ch/" target="_blank" rel="noopener noreferrer">IPCC Climate Reports</a>
        <a href="https://unfccc.int/" target="_blank" rel="noopener noreferrer">UN Climate Change</a>
        <a href="https://www.carbonfootprint.com/" target="_blank" rel="noopener noreferrer">Carbon Footprint Information</a>
      </div>
    </section>
  `;

  content.innerHTML = `
    ${heroHTML}
    <div class="education-container">
      ${factsHTML}
      ${categoriesHTML}
      ${equivalenciesHTML}
      ${tipsHTML}
    </div>
  `;

  // Clear container and append new content
  container.innerHTML = '';
  container.appendChild(content);

  // Add keyboard interaction to details summary elements
  const summaries = container.querySelectorAll('summary');
  summaries.forEach(summary => {
    summary.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const details = summary.parentElement;
        if (details.hasAttribute('open')) {
          details.removeAttribute('open');
        } else {
          details.setAttribute('open', '');
        }
      }
    });
  });
}
