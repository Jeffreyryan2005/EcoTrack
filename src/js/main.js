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
  container.innerHTML = `
<!-- ==================== HOME / HERO SECTION ==================== -->
      <section class="hero" id="section-home" aria-labelledby="hero-heading">
        <!-- Animated background orbs -->
        <div class="hero__bg" aria-hidden="true">
          <div class="hero__orb hero__orb--1"></div>
          <div class="hero__orb hero__orb--2"></div>
          <div class="hero__orb hero__orb--3"></div>
        </div>

        <div class="hero__content">
          <div class="hero__badge" aria-hidden="true">
            <span class="hero__badge-dot"></span>
            Open Source &middot; Free Forever
          </div>

          <h1 class="hero__title" id="hero-heading">
            Track Your Impact.
            <span class="hero__title-highlight">Save the Planet.</span>
          </h1>

          <p class="hero__subtitle">
            Understand your carbon footprint with real-time calculations, personalized
            insights, and actionable challenges. Join thousands making a measurable
            difference for our planet.
          </p>

          <div class="hero__actions">
            <a href="#calculator" class="btn btn-primary btn-lg" id="hero-cta-primary" data-route="calculator">
              <span aria-hidden="true">🧮</span>
              Calculate My Footprint
            </a>
            <a href="#learn" class="btn btn-secondary btn-lg" id="hero-cta-secondary" data-route="learn">
              <span aria-hidden="true">📖</span>
              Learn More
            </a>
          </div>

          <!-- Floating Stats -->
          <div class="hero__stats" aria-label="Platform statistics">
            <div class="hero__stat-card">
              <span class="hero__stat-value" id="stat-users">12,847</span>
              <span class="hero__stat-label">Active Users</span>
            </div>
            <div class="hero__stat-card">
              <span class="hero__stat-value" id="stat-co2">2.4M</span>
              <span class="hero__stat-label">kg CO₂ Tracked</span>
            </div>
            <div class="hero__stat-card">
              <span class="hero__stat-value" id="stat-reduction">18%</span>
              <span class="hero__stat-label">Avg. Reduction</span>
            </div>
          </div>
        </div>

        <!-- Floating eco icons -->
        <div class="hero__floating" aria-hidden="true">
          <span class="hero__float-icon hero__float-icon--1">🌱</span>
          <span class="hero__float-icon hero__float-icon--2">🌍</span>
          <span class="hero__float-icon hero__float-icon--3">♻️</span>
          <span class="hero__float-icon hero__float-icon--4">⚡</span>
          <span class="hero__float-icon hero__float-icon--5">🌊</span>
          <span class="hero__float-icon hero__float-icon--6">🍃</span>
        </div>
      </section>

      <!-- ==================== FEATURES PREVIEW ==================== -->
      <!-- ==================== FEATURES PREVIEW ==================== -->
      <section class="features" id="section-features" aria-labelledby="features-heading">
        <div class="container">
          <h2 class="section-title" id="features-heading">
            Everything you need to <span class="text-gradient">go green</span>
          </h2>
          <p class="section-subtitle">
            Powerful tools designed to make sustainability simple, measurable, and rewarding.
          </p>

          <div class="features__grid">
            <article class="feature-card" id="feature-calculator">
              <div class="feature-card__icon" aria-hidden="true">🧮</div>
              <h3 class="feature-card__title">Smart Calculator</h3>
              <p class="feature-card__desc">
                Calculate emissions across transport, energy, food, and shopping with
                science-backed conversion factors from EPA and DEFRA.
              </p>
            </article>

            <article class="feature-card" id="feature-dashboard">
              <div class="feature-card__icon" aria-hidden="true">📊</div>
              <h3 class="feature-card__title">Live Dashboard</h3>
              <p class="feature-card__desc">
                Visualize your carbon data with interactive charts, trend analysis,
                and category breakdowns updated in real time.
              </p>
            </article>

            <article class="feature-card" id="feature-insights">
              <div class="feature-card__icon" aria-hidden="true">💡</div>
              <h3 class="feature-card__title">AI Insights</h3>
              <p class="feature-card__desc">
                Get personalized recommendations ranked by impact. Know exactly where
                to focus for maximum carbon reduction.
              </p>
            </article>

            <article class="feature-card" id="feature-challenges">
              <div class="feature-card__icon" aria-hidden="true">🏆</div>
              <h3 class="feature-card__title">Weekly Challenges</h3>
              <p class="feature-card__desc">
                Earn points, build streaks, and unlock achievements as you adopt
                greener habits. Make sustainability fun.
              </p>
            </article>
          </div>
        </div>
      </section>
  `;
}
