/**
 * @module main
 * @description EcoTrack application entry point
 */
import { Router } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderCalculator } from './components/calculator.js';
import { renderDashboard } from './components/dashboard.js';
import { renderInsights } from './components/insights.js';
import { renderChallenges } from './components/challenges.js';
import { renderEducation } from './components/education.js';

// Setup accessibility stub
function setupAccessibility() {
  document.body.classList.add('js-enabled');
  // Add focus styles or other global a11y handlers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
  });
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('user-is-tabbing');
  });
}

// Storage mock for main
class SecureStorage {
  constructor(prefix) { this.prefix = prefix; }
  get(key) { return localStorage.getItem(`${this.prefix}_${key}`); }
  set(key, val) { localStorage.setItem(`${this.prefix}_${key}`, val); }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  setupAccessibility();
  const storage = new SecureStorage('ecotrack');
  initTheme(storage);
  
  const navContainer = document.getElementById('main-nav');
  if (navContainer) {
    renderNavbar(navContainer);
  } else {
    // Inject nav container if missing
    const nav = document.createElement('div');
    nav.id = 'main-nav';
    document.body.prepend(nav);
    renderNavbar(nav);
  }
  
  let appContainer = document.getElementById('app');
  if (!appContainer) {
    appContainer = document.createElement('main');
    appContainer.id = 'app';
    appContainer.setAttribute('role', 'main');
    document.body.appendChild(appContainer);
  }

  const router = new Router('app');
  
  router.register('/', renderHome);
  router.register('/calculator', renderCalculator);
  router.register('/dashboard', renderDashboard);
  router.register('/insights', renderInsights);
  router.register('/challenges', renderChallenges);
  router.register('/learn', renderEducation);
  
  router.init();
});

function initTheme(storage) {
  const savedTheme = storage.get('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function renderHome(container) {
  container.innerHTML = '';
  const homeDiv = document.createElement('div');
  homeDiv.className = 'home-page';

  homeDiv.innerHTML = `
    <!-- Hero Section -->
    <section class="home-hero" aria-labelledby="hero-title">
      <div class="hero-content">
        <h1 id="hero-title" class="hero-title">
          <span class="typewriter-effect">Track Your Carbon Footprint.</span><br/>
          Shape Our Future.
        </h1>
        <p class="hero-subtitle">
          EcoTrack empowers you to understand, monitor, and reduce your environmental impact through actionable insights and engaging challenges.
        </p>
        <div class="hero-cta-group">
          <a href="/calculator" class="btn btn-primary btn-large nav-link" data-link>Calculate Now</a>
          <a href="/learn" class="btn btn-secondary btn-large nav-link" data-link>Learn More</a>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="gradient-sphere"></div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="home-stats" aria-label="Global Impact Statistics">
      <div class="stat-counter-box">
        <span class="stat-number">2M+</span>
        <span class="stat-label">Users Tracking</span>
      </div>
      <div class="stat-counter-box">
        <span class="stat-number">50k</span>
        <span class="stat-label">Tonnes CO₂ Saved</span>
      </div>
      <div class="stat-counter-box">
        <span class="stat-number">100+</span>
        <span class="stat-label">Eco Challenges</span>
      </div>
    </section>

    <!-- Features Section -->
    <section class="home-features" aria-labelledby="features-title">
      <h2 id="features-title" class="section-title text-center">Everything you need to make a difference</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">🧮</div>
          <h3>Comprehensive Calculator</h3>
          <p>Measure your footprint across transport, energy, food, and shopping with our science-backed tool.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">📊</div>
          <h3>Advanced Tracking</h3>
          <p>Set goals, monitor trends over time, and compare your footprint against national averages.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">🎯</div>
          <h3>Actionable Insights</h3>
          <p>Get personalized recommendations on how to reduce your emissions efficiently.</p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how-it-works" aria-labelledby="how-it-works-title">
      <h2 id="how-it-works-title" class="section-title text-center">How EcoTrack Works</h2>
      <div class="steps-container">
        <div class="step-item">
          <div class="step-number">1</div>
          <h3>Calculate</h3>
          <p>Answer simple questions about your lifestyle.</p>
        </div>
        <div class="step-connector" aria-hidden="true"></div>
        <div class="step-item">
          <div class="step-number">2</div>
          <h3>Track</h3>
          <p>Review your dashboard and monitor your trends.</p>
        </div>
        <div class="step-connector" aria-hidden="true"></div>
        <div class="step-item">
          <div class="step-number">3</div>
          <h3>Reduce</h3>
          <p>Complete challenges and adopt new habits.</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="home-bottom-cta text-center" aria-label="Call to action">
      <h2>Ready to start your journey?</h2>
      <p>Join thousands of others making a positive impact on the planet.</p>
      <a href="/calculator" class="btn btn-primary btn-large nav-link" data-link>Get Started for Free</a>
    </section>
  `;

  container.appendChild(homeDiv);
}
