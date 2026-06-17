const fs = require('fs');
let css = fs.readFileSync('src/css/responsive.css', 'utf8');

// The BEM classes in responsive.css are wrong. Replace them with actual classes from JS.
const replacements = [
  ['.calc__tabs', '.calc-tabs'],
  ['.calc__tab', '.tab-btn'],
  ['.calc__form-grid', '.grid-inputs-2, .grid-inputs-3'],
  ['.calc__layout', '.calc-layout'],
  ['.dash__stats-grid', '.stat-cards-row'],
  ['.dash__chart-container', '.chart-container'],
  ['.dash__timeline-filters', '.time-filters'],
  ['.dash__charts-grid', '.charts-grid'],
  ['.dash__layout', '.dashboard-page'],
  ['.insights__grid', '.insights-grid'],
  ['.challenges__grid', '.challenges-grid'],
  ['.edu__equivalency-grid', '.facts-grid'],
  ['.edu__layout', '.education-hub'],
  ['.progress-bar__fill', '.progress-bar-fill'],
  ['.nav-link--active', '.nav-link.active']
];

for (const [bad, good] of replacements) {
  css = css.split(bad).join(good);
}

fs.writeFileSync('src/css/responsive.css', css);
console.log('Fixed responsive.css');
