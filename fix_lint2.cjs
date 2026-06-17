const fs = require('fs');

function replaceFile(path, regex, replacement) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content);
}

replaceFile('src/js/models/insights.js', /calculateSaving: \(userData\) => {/g, 'calculateSaving: (_userData) => {');
replaceFile('src/js/components/insights.js', /btn\.addEventListener\('click', \(e\) => {/g, 'btn.addEventListener(\'click\', (_e) => {');
replaceFile('src/js/utils/a11y.js', /let lastFocusableElement = focusableElements\[focusableElements\.length - 1\];/g, '// eslint-disable-next-line no-unused-vars\n    let lastFocusableElement = focusableElements[focusableElements.length - 1];');
replaceFile('src/js/utils/validators.js', /export function sanitizeInput\(input, type = 'text'\) {/g, 'export function sanitizeInput(input, _type = \'text\') {');

console.log("Fixes applied");
