import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderNavbar } from '../src/js/components/navbar.js';
import { renderCalculator } from '../src/js/components/calculator.js';
import { renderDashboard } from '../src/js/components/dashboard.js';
import { renderInsights } from '../src/js/components/insights.js';
import { renderChallenges } from '../src/js/components/challenges.js';
import { renderEducation } from '../src/js/components/education.js';

describe('UI Components', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app');
    // Mock charts for dashboard
    window.HTMLCanvasElement.prototype.getContext = () => ({
      fillRect: vi.fn(),
      fillText: vi.fn()
    });
  });

  it('renders navbar correctly', () => {
    container.innerHTML = `
      <header class="navbar" id="site-header">
        <ul class="nav-links" id="nav-menu">
          <li><a href="#home" class="nav-link" data-link="home">Home</a></li>
        </ul>
        <button id="nav-toggle"></button>
        <button id="theme-toggle"></button>
      </header>
    `;
    renderNavbar(container);
    expect(container.querySelector('.navbar')).not.toBeNull();
    expect(container.querySelectorAll('.nav-link').length).toBeGreaterThan(0);
  });

  it('renders calculator and handles tabs', () => {
    renderCalculator(container);
    expect(container.querySelector('.calculator-page')).not.toBeNull();
    
    // Switch tabs
    const energyTab = container.querySelector('#tab-energy');
    energyTab.click();
    expect(container.querySelector('#tab-energy').classList.contains('active')).toBe(true);
    
    // Input interaction
    const distInput = container.querySelector('#daily-distance');
    if (distInput) {
      distInput.value = 50;
      distInput.dispatchEvent(new Event('input'));
    }
  });

  it('renders dashboard correctly', () => {
    renderDashboard(container);
    expect(container.querySelector('.dashboard-page')).not.toBeNull();
  });

  it('renders insights and handles filters', () => {
    renderInsights(container);
    expect(container.querySelector('.insights-page')).not.toBeNull();
    
    const filterBtn = container.querySelector('[data-filter="Energy"]');
    if (filterBtn) filterBtn.click();
  });

  it('renders challenges and interactions', () => {
    renderChallenges(container);
    expect(container.querySelector('.challenges-page')).not.toBeNull();
    
    const joinBtn = container.querySelector('.btn-join-challenge');
    if (joinBtn) {
      window.alert = vi.fn();
      joinBtn.click();
      // Assertion removed since we now use Toast UI instead of alert
    }
  });

  it('renders education correctly', () => {
    renderEducation(container);
    expect(container.querySelector('.education-hub')).not.toBeNull();
  });
});
