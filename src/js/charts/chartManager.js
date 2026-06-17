/**
 * @module chartManager
 * @description Wrapper for Chart.js to ensure consistent styling and accessibility
 */

import Chart from 'chart.js/auto';

// Custom color palette designed for accessibility (colorblind friendly)
const COLORS = {
  transport: '#3b82f6', // Blue
  energy: '#f59e0b',    // Amber
  food: '#10b981',      // Emerald
  shopping: '#8b5cf6',  // Purple
  background: 'rgba(255, 255, 255, 0.1)',
  gridLines: 'rgba(128, 128, 128, 0.2)',
  text: '#6b7280'
};

// Update global defaults
Chart.defaults.color = COLORS.text;
Chart.defaults.font.family = "'Inter', sans-serif";

export class ChartManager {
  constructor() {
    this.charts = {};
  }

  /**
   * Check if user prefers reduced motion
   */
  _getAnimationConfig() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion ? false : { duration: 800, easing: 'easeOutQuart' };
  }

  /**
   * Creates a doughnut chart for category breakdown
   * @param {string|HTMLCanvasElement} canvasId 
   * @param {Object} data - { transport: 100, energy: 200... }
   * @returns {Chart}
   */
  createCategoryDoughnut(canvasId, data) {
    const ctx = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!ctx) return null;

    // Destroy existing if re-rendering
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const labels = Object.keys(data).map(k => k.charAt(0).toUpperCase() + k.slice(1));
    const values = Object.values(data);
    const bgColors = Object.keys(data).map(k => COLORS[k] || '#ccc');

    this.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card') || '#fff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: this._getAnimationConfig(),
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw.toFixed(1)} kg CO₂e`
            }
          }
        },
        cutout: '70%'
      }
    });

    return this.charts[canvasId];
  }

  /**
   * Creates a line chart for tracking over time
   * @param {string|HTMLCanvasElement} canvasId 
   * @param {Array} labels - x-axis labels (e.g. dates)
   * @param {Array} data - y-axis data points
   * @returns {Chart}
   */
  createTrendLine(canvasId, labels, data) {
    const ctx = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!ctx) return null;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    // Get primary color from CSS variables or fallback
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#10b981';

    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Total Emissions',
          data,
          borderColor: primaryColor,
          backgroundColor: `${primaryColor}33`, // 20% opacity hex
          borderWidth: 3,
          tension: 0.4, // smooth curves
          fill: true,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: this._getAnimationConfig(),
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.raw.toFixed(1)} kg CO₂e`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: COLORS.gridLines,
              drawBorder: false
            }
          }
        }
      }
    });

    return this.charts[canvasId];
  }

  /**
   * Creates a bar chart for comparisons
   * @param {string|HTMLCanvasElement} canvasId 
   * @param {Array} labels 
   * @param {Array} data 
   * @returns {Chart}
   */
  createBarChart(canvasId, labels, data) {
    const ctx = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!ctx) return null;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#10b981';

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Emissions',
          data,
          backgroundColor: [primaryColor, '#6b7280'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: this._getAnimationConfig(),
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    return this.charts[canvasId];
  }

  /**
   * Destroy a specific chart
   * @param {string} canvasId 
   */
  destroyChart(canvasId) {
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
      delete this.charts[canvasId];
    }
  }

  /**
   * Destroy all charts (cleanup)
   */
  destroyAll() {
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};
  }
}
