const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const heroMatch = indexHtml.match(/<!-- ==================== HOME \/ HERO SECTION ==================== -->[\s\S]*?<!-- ==================== FEATURES PREVIEW ==================== -->/);
const featuresMatch = indexHtml.match(/<!-- ==================== FEATURES PREVIEW ==================== -->[\s\S]*?<\/section>/);

if (!heroMatch || !featuresMatch) {
  console.error("Could not find sections in index.html");
  process.exit(1);
}

const finalHtml = (heroMatch[0] + "\n      " + featuresMatch[0])
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

let mainJs = fs.readFileSync('src/js/main.js', 'utf8');

// Replace the renderHome function
const newRenderHome = `function renderHome(container) {
  container.innerHTML = \`
${finalHtml}
  \`;
}`;

mainJs = mainJs.replace(/function renderHome\(container\) \{[\s\S]*?\n\}/, newRenderHome);

fs.writeFileSync('src/js/main.js', mainJs);
console.log("Updated main.js");
