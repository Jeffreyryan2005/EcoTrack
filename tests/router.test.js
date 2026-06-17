import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Router } from '../src/js/router.js';

describe('Router', () => {
  let container;
  
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById('app');
    window.history.pushState({}, '', '/');
  });

  it('initializes and navigates correctly', () => {
    const router = new Router('app');
    const mockRender = vi.fn();
    router.register('/', mockRender);
    
    router.init();
    expect(mockRender).toHaveBeenCalledWith(container);
  });

  it('navigates via navigateTo', () => {
    const router = new Router('app');
    const mockRender = vi.fn();
    router.register('/test', mockRender);
    
    router.navigateTo('/test');
    expect(window.location.pathname).toBe('/test');
    expect(mockRender).toHaveBeenCalledWith(container);
  });

  it('intercepts link clicks', () => {
    const router = new Router('app');
    const mockRender = vi.fn();
    router.register('/link', mockRender);
    
    const link = document.createElement('a');
    link.href = '/link';
    link.setAttribute('data-link', '');
    document.body.appendChild(link);
    
    link.click();
    expect(window.location.pathname).toBe('/link');
    expect(mockRender).toHaveBeenCalledWith(container);
  });
});
