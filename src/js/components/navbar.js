/**
 * @module navbar
 * @description Navigation component for EcoTrack
 */

export function renderNavbar(container) {
  // Select elements from the existing HTML instead of replacing them
  const toggleBtn = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const themeToggleBtn = document.getElementById('theme-toggle');

  // Mobile menu toggle
  const toggleMenu = () => {
    if (!toggleBtn || !menu) return;
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('active');
    toggleBtn.classList.toggle('active');
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleMenu);
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menu && menu.classList.contains('active')) {
      // If click is not inside the nav or is on a nav link, close the menu
      if (!container.contains(e.target) || e.target.closest('.nav-link')) {
        toggleMenu();
      }
    }
  });

  // Highlight active link based on current path
  const updateActiveLink = () => {
    let currentPath = window.location.pathname;
    if (currentPath === '/') currentPath = '/home'; // Default matching
    
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('data-link') || link.getAttribute('href')?.replace('#', '');
      if (linkPath && currentPath.includes(linkPath)) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  };

  // Listen for route changes
  window.addEventListener('popstate', updateActiveLink);
  // Initial check
  updateActiveLink();
  
  // Custom event listener for SPA router
  document.addEventListener('route-changed', updateActiveLink);

  // Theme Toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('ecotrack_theme', newTheme);
    });
  }

  // Smart Navbar Scroll Logic - User requested it disappears entirely when scrolled
  const navbar = document.getElementById('site-header');
  
  if (navbar) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        navbar.classList.add('nav-hidden');
      } else {
        navbar.classList.remove('nav-hidden');
      }
    }, { passive: true });
  }
}