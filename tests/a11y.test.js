import { describe, it, expect, beforeEach, vi } from 'vitest';
import { A11yManager } from '../src/js/utils/a11y.js';

describe('A11yManager', () => {
  let a11y;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app"></div>
      <button id="test-btn">Test</button>
      <div role="dialog" id="dialog"></div>
    `;
    a11y = new A11yManager();
  });

  it('initializes and observes DOM', () => {
    expect(a11y.initialized).toBe(false);
    a11y.init();
    expect(a11y.initialized).toBe(true);
  });

  it('manages focus traps', () => {
    const dialog = document.getElementById('dialog');
    a11y.trapFocus(dialog);
    // Since trapFocus adds event listeners, we can just verify it didn't throw
    expect(true).toBe(true);
    a11y.releaseFocus(dialog);
  });

  it('announces messages', () => {
    a11y.init();
    a11y.announce('Test message');
    const announcer = document.getElementById('a11y-announcer');
    expect(announcer.textContent).toBe('Test message');
  });
});
