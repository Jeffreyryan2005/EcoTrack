import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupNavbar } from '../src/js/components/navbar.js';
import { router } from '../src/js/router.js';

describe('Navbar Component', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav class="navbar">
        <a href="/" class="nav-brand">EcoTrack</a>
        <button class="nav-toggle" aria-expanded="false"></button>
        <div class="nav-links">
          <a href="/" class="nav-link">Home</a>
          <a href="/calculator" class="nav-link">Calculator</a>
        </div>
      </nav>
    `;
    vi.spyOn(router, 'navigate').mockImplementation(() => {});
  });

  it('sets up mobile toggle functionality', () => {
    setupNavbar();
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(links.classList.contains('active')).toBe(true);
  });

  it('handles navigation clicks', () => {
    setupNavbar();
    const link = document.querySelector('.nav-link[href="/calculator"]');
    link.click();
    expect(router.navigate).toHaveBeenCalledWith('/calculator');
  });
});
