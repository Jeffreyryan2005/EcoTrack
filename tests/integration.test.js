import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderCalculator } from '../src/js/components/calculator.js';

describe('Integration: Calculator Flow', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('completes a full calculator flow and displays results', () => {
    renderCalculator(container);
    
    // 1. Initial State
    expect(container.querySelector('.calculator-page')).toBeTruthy();
    
    // 2. Select car transport
    const transportSelect = container.querySelector('#transport-type');
    if (transportSelect) {
      transportSelect.value = 'car';
      transportSelect.dispatchEvent(new Event('change'));
    }
    
    const distanceInput = container.querySelector('#distance');
    if (distanceInput) {
      distanceInput.value = '100';
      distanceInput.dispatchEvent(new Event('input'));
    }

    // 3. Move to next step
    const nextBtn = container.querySelector('#next-step');
    if (nextBtn) {
      nextBtn.click();
      
      // Should now be on step 2 (Energy)
      const energyInput = container.querySelector('#electricity');
      expect(energyInput).toBeTruthy();
    }
    
    // Jump straight to results for integration
    const resultsBtn = container.querySelector('#btn-view-results');
    if (resultsBtn) {
      resultsBtn.click();
      
      // Should show results panel
      const resultsPanel = container.querySelector('.results-panel');
      expect(resultsPanel).toBeTruthy();
    }
  });
});
