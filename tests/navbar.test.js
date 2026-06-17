import { describe, it, expect, beforeEach } from 'vitest';
import { renderNavbar } from '../src/js/components/navbar.js';

describe('Navbar Component', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <header id="main-header">
        <button id="nav-toggle" aria-expanded="false"></button>
        <nav id="nav-menu">
          <a href="/" class="nav-link">Home</a>
          <a href="/calculator" class="nav-link">Calculator</a>
        </nav>
        <button id="theme-toggle"></button>
      </header>
    `;
    container = document.getElementById('main-header');
  });

  it('sets up mobile toggle functionality', () => {
    renderNavbar(container);
    const toggleBtn = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    toggleBtn.click();
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
    expect(menu.classList.contains('active')).toBe(true);
  });
});
