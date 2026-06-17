import { describe, it, expect, beforeEach } from 'vitest';
import { initAssistant } from '../src/js/components/assistant.js';

describe('Assistant Component', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="ai-fab"></button>
    `;
  });

  it('sets up assistant toggle functionality', () => {
    initAssistant();
    const btnToggle = document.getElementById('ai-fab');
    
    btnToggle.click();
    // Assistant widget should be created
    expect(document.getElementById('ai-chat-widget')).toBeTruthy();
  });
});
