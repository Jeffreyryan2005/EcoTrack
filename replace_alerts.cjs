const fs = require('fs');
const files = [
  'src/js/components/calculator.js',
  'src/js/components/challenges.js',
  'src/js/components/dashboard.js',
  'src/js/components/insights.js'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('import { showToast }')) {
    content = "import { showToast } from '../utils/ui.js';\n" + content;
  }
  content = content.replace(/alert\((['"`])(.*?)\1\);/g, "showToast($1$2$1);");
  fs.writeFileSync(f, content);
});
console.log('Replaced alerts with Toasts!');
