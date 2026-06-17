/**
 * @module navbar
 * @description Navigation component for EcoTrack
 */

export function renderNavbar(container) {
  const navHTML = `
    <nav class="navbar" aria-label="Main Navigation">
      <div class="navbar-container">
        <a href="/" class="navbar-logo" aria-label="EcoTrack Home">
          <span aria-hidden="true">🍃</span> EcoTrack
        </a>
        
        <button class="navbar-toggle" aria-expanded="false" aria-controls="navbar-menu" aria-label="Toggle navigation menu">
          <span class="hamburger-line" aria-hidden="true"></span>
          <span class="hamburger-line" aria-hidden="true"></span>
          <span class="hamburger-line" aria-hidden="true"></span>
        </button>

        <ul id="navbar-menu" class="navbar-menu" role="menubar">
          <li role="none"><a href="/" class="nav-link" role="menuitem">Home</a></li>
          <li role="none"><a href="/calculator" class="nav-link" role="menuitem">Calculator</a></li>
          <li role="none"><a href="/dashboard" class="nav-link" role="menuitem">Dashboard</a></li>
          <li role="none"><a href="/insights" class="nav-link" role="menuitem">Insights</a></li>
          <li role="none"><a href="/challenges" class="nav-link" role="menuitem">Challenges</a></li>
          <li role="none"><a href="/learn" class="nav-link" role="menuitem">Learn</a></li>
        </ul>

        <div class="navbar-actions">
          <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark theme">
            <span class="theme-icon-light" aria-hidden="true">☀️</span>
            <span class="theme-icon-dark" aria-hidden="true">🌙</span>
          </button>
        </div>
      </div>
    </nav>
  `;

  container.innerHTML = navHTML;

  // Select elements
  const toggleBtn = container.querySelector('.navbar-toggle');
  const menu = container.querySelector('#navbar-menu');
  const themeToggleBtn = container.querySelector('#theme-toggle');
  const navLinks = container.querySelectorAll('.nav-link');

  // Mobile menu toggle
  const toggleMenu = () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('is-open');
    toggleBtn.classList.toggle('is-active');
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && menu.classList.contains('is-open')) {
      toggleMenu();
    }
  });

  // Close mobile menu on route change (click on a link)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) {
        toggleMenu();
      }
      
      // Update active state
      navLinks.forEach(l => {
        l.classList.remove('active');
        l.removeAttribute('aria-current');
      });
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    });
  });

  // Theme toggle functionality
  themeToggleBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    root.setAttribute('data-theme', newTheme);
    
    // Save to storage if available
    try {
      localStorage.setItem('ecotrack_theme', newTheme);
    } catch (e) {
      console.warn('Could not save theme to localStorage');
    }
  });

  // Keyboard navigation (Arrow keys between nav items)
  menu.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;
    if (!activeElement.classList.contains('nav-link')) return;

    const linksArray = Array.from(navLinks);
    const index = linksArray.indexOf(activeElement);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % linksArray.length;
      linksArray[nextIndex].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + linksArray.length) % linksArray.length;
      linksArray[prevIndex].focus();
    }
  });
}
