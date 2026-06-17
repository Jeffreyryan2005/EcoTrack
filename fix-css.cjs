const fs = require('fs');
let c = fs.readFileSync('src/css/components.css');
// Find the index of the first null byte which signifies the start of the corrupted text
let idx = -1;
for (let i = c.length - 500; i < c.length; i++) {
  if (c[i] === 0) {
    idx = i;
    break;
  }
}
if (idx !== -1) {
  // Move back to the '@' character before the null byte
  while (idx > 0 && c[idx-1] !== 64) {
    idx--;
  }
  idx--; // Include the '@'
  c = c.slice(0, idx);
}

// Append proper string
const css = `
@media (max-width: 767px) {
  .nav-links {
    position: fixed;
    top: var(--nav-height, 72px);
    left: 0;
    width: 100%;
    flex-direction: column;
    background: var(--bg-primary);
    padding: 20px;
    display: none;
    box-shadow: var(--shadow-md);
  }
  .nav-links.active {
    display: flex;
  }
  .nav-toggle {
    display: block;
  }
}
`;

fs.writeFileSync('src/css/components.css', Buffer.concat([c, Buffer.from(css)]));
console.log('Done');
