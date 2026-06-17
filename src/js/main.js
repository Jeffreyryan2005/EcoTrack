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
import { renderAssistantModal } from './components/assistant.js';
import { SecureStorage } from './utils/storage.js';
import { sanitizeHTML } from './utils/sanitize.js';

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

// Main storage instance will be initialized in DOMContentLoaded

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

  // Setup Modal Closing globally
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalContent = document.getElementById('modal-content');
  
  if (modalOverlay && modalClose) {
    const closeModal = () => {
      modalOverlay.hidden = true;
      modalOverlay.setAttribute('aria-hidden', 'true');
      modalOverlay.classList.remove('assistant-overlay');
    };
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Setup AI FAB listener
  const aiFab = document.getElementById('ai-fab');
  if (aiFab && modalOverlay && modalContent) {
    aiFab.addEventListener('click', () => {
      modalOverlay.classList.add('assistant-overlay');
      renderAssistantModal(modalContent, modalOverlay);
    });
  }
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
        <div class="hero-bg" aria-hidden="true">
          <div class="hero-orb hero__orb--1"></div>
          <div class="hero-orb hero__orb--2"></div>
          <div class="hero-orb hero__orb--3"></div>
        </div>

        <div class="hero-content">
          <div class="hero-badge" aria-hidden="true">
            <span class="hero-badge-dot"></span>
            Open Source &middot; Free Forever
          </div>

          <h1 class="hero-title" id="hero-heading">
            Track Your Impact.
            <span class="hero-title-highlight">Save the Planet.</span>
          </h1>

          <p class="hero-subtitle">
            Understand your carbon footprint with real-time calculations, personalized
            insights, and actionable challenges. Join thousands making a measurable
            difference for our planet.
          </p>

          <div class="hero-actions">
            <a href="#calculator" class="btn btn-primary btn-large" id="hero-cta-primary" data-link="calculator">
              <span aria-hidden="true">🧮</span>
              Calculate My Footprint
            </a>
            <a href="#learn" class="btn btn-secondary btn-large" id="hero-cta-secondary" data-link="learn">
              <span aria-hidden="true">📖</span>
              Learn More
            </a>
          </div>
        </div>

        <!-- Floating eco icons -->
        <div class="hero-floating" aria-hidden="true">
          <span class="hero-float-icon hero__float-icon--1">🌱</span>
          <span class="hero-float-icon hero__float-icon--2">🌍</span>
          <span class="hero-float-icon hero__float-icon--3">♻️</span>
          <span class="hero-float-icon hero__float-icon--4">⚡</span>
          <span class="hero-float-icon hero__float-icon--5">🌊</span>
          <span class="hero-float-icon hero__float-icon--6">🍃</span>
        </div>
      </section>

      <!-- ==================== FEATURES PREVIEW ==================== -->
      <!-- ==================== FEATURES PREVIEW ==================== -->
      <section class="home-features" id="section-features" aria-labelledby="features-heading">
        <div class="container">
          <h2 class="section-title" id="features-heading">
            Everything you need to <span class="text-gradient">go green</span>
          </h2>
          <p class="section-subtitle">
            Powerful tools designed to make sustainability simple, measurable, and rewarding.
          </p>

          <div class="features-grid">
            <article class="feature-card" id="feature-calculator">
              <div class="feature-icon" aria-hidden="true">🧮</div>
              <h3 >Smart Calculator</h3>
              <p >
                Calculate emissions across transport, energy, food, and shopping with
                science-backed conversion factors from EPA and DEFRA.
              </p>
            </article>

            <article class="feature-card" id="feature-dashboard">
              <div class="feature-icon" aria-hidden="true">📊</div>
              <h3 >Live Dashboard</h3>
              <p >
                Visualize your carbon data with interactive charts, trend analysis,
                and category breakdowns updated in real time.
              </p>
            </article>

            <article class="feature-card" id="feature-insights">
              <div class="feature-icon" aria-hidden="true">💡</div>
              <h3 >AI Insights</h3>
              <p >
                Get personalized recommendations ranked by impact. Know exactly where
                to focus for maximum carbon reduction.
              </p>
            </article>

            <article class="feature-card" id="feature-challenges">
              <div class="feature-icon" aria-hidden="true">🏆</div>
              <h3 >Weekly Challenges</h3>
              <p >
                Earn points, build streaks, and unlock achievements as you adopt
                greener habits. Make sustainability fun.
              </p>
            </article>
          </div>
        </div>
      </section>
  `;
}
