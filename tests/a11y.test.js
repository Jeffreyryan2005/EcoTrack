import { describe, it, expect, beforeEach } from 'vitest';
import { setupAccessibility, announceToScreenReader } from '../src/js/utils/a11y.js';

describe('A11y Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('sets up accessibility live regions', () => {
    setupAccessibility();
    expect(document.getElementById('a11y-live-region-polite')).toBeTruthy();
    expect(document.getElementById('a11y-live-region-assertive')).toBeTruthy();
  });

  it('announces messages', () => {
    setupAccessibility();
    announceToScreenReader('Test message');
    const politeRegion = document.getElementById('a11y-live-region-polite');
    setTimeout(() => {
      expect(politeRegion.textContent).toBe('Test message');
    }, 100);
  });

  it('announces assertive messages', () => {
    setupAccessibility();
    announceToScreenReader('Urgent message', 'assertive');
    const assertiveRegion = document.getElementById('a11y-live-region-assertive');
    setTimeout(() => {
      expect(assertiveRegion.textContent).toBe('Urgent message');
    }, 100);
  });
});
