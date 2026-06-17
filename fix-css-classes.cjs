const fs = require('fs');

function fixClasses(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const replacements = [
    // Navbar
    [/class="site-header"/g, 'class="navbar"'],
    [/\.site-header/g, '.navbar'],
    [/class="nav"/g, 'class="nav"'],
    [/\.nav__container/g, '.nav-container'],
    [/class="nav__container"/g, 'class="nav-container"'],
    [/\.nav__logo-icon/g, '.nav-logo-icon'],
    [/\.nav__logo/g, '.nav-logo'],
    [/class="nav__logo"/g, 'class="nav-logo"'],
    [/class="nav__logo-icon"/g, 'class="nav-logo-icon"'],
    [/\.nav__toggle-bar/g, '.nav-toggle-bar'],
    [/\.nav__toggle/g, '.nav-toggle'],
    [/class="nav__toggle"/g, 'class="nav-toggle"'],
    [/class="nav__toggle-bar"/g, 'class="nav-toggle-bar"'],
    [/\.nav__menu/g, '.nav-links'],
    [/class="nav__menu"/g, 'class="nav-links"'],
    [/\.nav__item/g, '.nav-item'],
    [/class="nav__item"/g, 'class="nav-item"'],
    [/\.nav__link/g, '.nav-link'],
    [/class="nav__link/g, 'class="nav-link'],
    [/nav__link--active/g, 'active'],
    [/\.nav__theme-toggle/g, '.theme-toggle'],
    [/class="nav__theme-toggle"/g, 'class="theme-toggle"'],
    
    // Hero
    [/\.hero__bg/g, '.hero-bg'],
    [/class="hero__bg"/g, 'class="hero-bg"'],
    [/\.hero__orb/g, '.hero-orb'],
    [/class="hero__orb/g, 'class="hero-orb'],
    [/\.hero__content/g, '.hero-content'],
    [/class="hero__content"/g, 'class="hero-content"'],
    [/\.hero__badge-dot/g, '.hero-badge-dot'],
    [/\.hero__badge/g, '.hero-badge'],
    [/class="hero__badge"/g, 'class="hero-badge"'],
    [/class="hero__badge-dot"/g, 'class="hero-badge-dot"'],
    [/\.hero__title-highlight/g, '.hero-title-highlight'],
    [/\.hero__title/g, '.hero-title'],
    [/class="hero__title"/g, 'class="hero-title"'],
    [/class="hero__title-highlight"/g, 'class="hero-title-highlight"'],
    [/\.hero__subtitle/g, '.hero-subtitle'],
    [/class="hero__subtitle"/g, 'class="hero-subtitle"'],
    [/\.hero__actions/g, '.hero-actions'],
    [/class="hero__actions"/g, 'class="hero-actions"'],
    [/\.hero__stats/g, '.hero-stats'],
    [/class="hero__stats"/g, 'class="hero-stats"'],
    [/\.hero__stat-card/g, '.stat-counter-box'],
    [/class="hero__stat-card"/g, 'class="stat-counter-box"'],
    [/\.hero__stat-value/g, '.stat-number'],
    [/class="hero__stat-value"/g, 'class="stat-number"'],
    [/\.hero__stat-label/g, '.stat-label'],
    [/class="hero__stat-label"/g, 'class="stat-label"'],
    [/\.hero__floating/g, '.hero-floating'],
    [/class="hero__floating"/g, 'class="hero-floating"'],
    [/\.hero__float-icon/g, '.hero-float-icon'],
    [/class="hero__float-icon/g, 'class="hero-float-icon'],
    
    // Features
    [/\.features__grid/g, '.features-grid'],
    [/class="features__grid"/g, 'class="features-grid"'],
    [/\.feature-card__icon/g, '.feature-icon'],
    [/class="feature-card__icon"/g, 'class="feature-icon"'],
    [/\.feature-card__title/g, ''],
    [/class="feature-card__title"/g, ''], // H3 uses direct styling usually
    [/\.feature-card__desc/g, ''],
    [/class="feature-card__desc"/g, ''],
    
    // Footer
    [/\.footer__container/g, '.footer-container'],
    [/class="footer__container"/g, 'class="footer-container"'],
    [/\.footer__grid/g, '.footer-grid'],
    [/class="footer__grid"/g, 'class="footer-grid"'],
    [/\.footer__brand/g, '.footer-brand'],
    [/class="footer__brand"/g, 'class="footer-brand"'],
    [/\.footer__logo/g, '.footer-logo'],
    [/class="footer__logo"/g, 'class="footer-logo"'],
    [/\.footer__tagline/g, '.footer-tagline'],
    [/class="footer__tagline"/g, 'class="footer-tagline"'],
    [/\.footer__links/g, '.footer-links'],
    [/class="footer__links"/g, 'class="footer-links"'],
    [/\.footer__heading/g, '.footer-heading'],
    [/class="footer__heading"/g, 'class="footer-heading"'],
    [/\.footer__list/g, '.footer-list'],
    [/class="footer__list"/g, 'class="footer-list"'],
    [/\.footer__bottom/g, '.footer-bottom'],
    [/class="footer__bottom"/g, 'class="footer-bottom"'],
    [/\.footer__copyright/g, '.footer-copyright'],
    [/class="footer__copyright"/g, 'class="footer-copyright"'],
    [/\.footer__a11y-note/g, '.footer-a11y-note'],
    [/class="footer__a11y-note"/g, 'class="footer-a11y-note"'],
    
    // Modal & Toast
    [/\.modal__close/g, '.modal-close'],
    [/class="modal__close"/g, 'class="modal-close"'],
    [/\.modal__content/g, '.modal-content'],
    [/class="modal__content"/g, 'class="modal-content"'],
  ];

  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }

  fs.writeFileSync(filePath, content);
}

fixClasses('src/css/responsive.css');
fixClasses('src/css/components.css');
console.log('Fixed classes');
