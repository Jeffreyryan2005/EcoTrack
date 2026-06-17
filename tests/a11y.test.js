import { describe, it, expect, beforeEach } from 'vitest';
import { setupAccessibility, announce } from '../src/js/utils/a11y.js';

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
    announce('Test message');
    const politeRegion = document.getElementById('a11y-live-region-polite');
    expect(politeRegion.textContent).toBe('Test message');
  });

  it('announces assertive messages', () => {
    setupAccessibility();
    announce('Urgent message', true);
    const assertiveRegion = document.getElementById('a11y-live-region-assertive');
    expect(assertiveRegion.textContent).toBe('Urgent message');
  });
});
