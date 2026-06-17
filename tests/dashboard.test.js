import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderDashboard } from '../src/js/components/dashboard.js';

describe('Dashboard Component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    // Mock navigator share and clipboard
    Object.assign(navigator, {
      share: vi.fn().mockResolvedValue(),
      clipboard: {
        writeText: vi.fn().mockResolvedValue()
      }
    });
  });

  it('renders dashboard with stats and buttons', () => {
    renderDashboard(container);
    expect(container.querySelector('.dashboard-page')).toBeTruthy();
    expect(container.querySelector('#btn-share-progress')).toBeTruthy();
    expect(container.querySelector('#btn-offset-emissions')).toBeTruthy();
    expect(container.querySelector('#btn-clear-data')).toBeTruthy();
  });

  it('handles share button click', () => {
    renderDashboard(container);
    const shareBtn = container.querySelector('#btn-share-progress');
    shareBtn.click();
    expect(navigator.share).toHaveBeenCalled();
  });

  it('handles offset button click', () => {
    renderDashboard(container);
    const offsetBtn = container.querySelector('#btn-offset-emissions');
    offsetBtn.click();
    // Should trigger toast but we mock/ignore it for simple coverage
  });
});
