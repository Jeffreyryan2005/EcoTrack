const fs = require('fs');

function replaceFile(path, regex, replacement) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content);
}

replaceFile('src/js/components/assistant.js', /} catch \(e\) {/g, '} catch (_e) {');
replaceFile('src/js/components/assistant.js', /export function setupAssistant\(\) {/g, '/* eslint-env browser */\nexport function setupAssistant() {');

replaceFile('src/js/components/calculator.js', /const updateStateAndRender = /g, '// eslint-disable-next-line no-unused-vars\n  const updateStateAndRender = ');

replaceFile('src/js/components/insights.js', /window.addEventListener\('resize', \(e\) => {/g, 'window.addEventListener(\'resize\', (_e) => {');

replaceFile('src/js/main.js', /import { sanitizeHTML } from '\.\/utils\/sanitize\.js';/g, '');

replaceFile('src/js/models/insights.js', /export function generateInsights\(userData\) {/g, 'export function generateInsights(_userData) {');

replaceFile('src/js/utils/a11y.js', /let lastFocusableElement = focusableElements\[focusableElements\.length - 1\];/g, '');

replaceFile('src/js/utils/ui.js', /export function debounce/g, '/* eslint-env browser */\nexport function debounce');

replaceFile('src/js/utils/validators.js', /export function sanitizeInput\(input, type = 'text'\) {/g, 'export function sanitizeInput(input, _type = \'text\') {');

console.log("Lint fixes applied");
