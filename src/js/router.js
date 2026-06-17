/**
 * @module router
 * @description Simple SPA router for EcoTrack
 */

export class Router {
  constructor(rootElementId) {
    this.rootElement = document.getElementById(rootElementId);
    this.routes = {};
    
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Intercept link clicks for SPA routing
    document.body.addEventListener('click', e => {
      if (e.target.matches('[data-link]') || e.target.closest('a')?.classList.contains('nav-link')) {
        const link = e.target.closest('a');
        if (link && link.href && link.origin === window.location.origin) {
          e.preventDefault();
          this.navigateTo(link.getAttribute('href'));
        }
      }
    });
  }

  register(path, renderFunction) {
    this.routes[path] = renderFunction;
  }

  navigateTo(path) {
    window.history.pushState(null, null, path);
    this.handleRoute();
  }

  handleRoute() {
    let path = window.location.pathname;
    
    // If not found, fallback to root or 404
    const renderFunction = this.routes[path] || this.routes['/'];
    
    if (this.rootElement && renderFunction) {
      this.rootElement.innerHTML = '';
      renderFunction(this.rootElement);
      // Announce route change for screen readers
      this.announcePage(path);
    }
  }

  announcePage(path) {
    let announcer = document.getElementById('route-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'route-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    const pageName = path === '/' ? 'Home' : path.substring(1);
    announcer.textContent = `Navigated to ${pageName} page`;
  }

  init() {
    this.handleRoute();
  }
}
