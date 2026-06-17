import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const artifactDir = "C:\\Users\\user\\.gemini\\antigravity\\brain\\5c1c6965-c646-4897-9a13-250296100a5d";

    // Desktop Screenshot
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('https://eco-track123.vercel.app/', { waitUntil: 'networkidle2' });
    
    // Wait for animations
    await new Promise(r => setTimeout(r, 2000));
    
    const desktopPath = path.join(artifactDir, 'ecotrack_desktop.png');
    await page.screenshot({ path: desktopPath, fullPage: false });
    console.log(`Desktop screenshot saved to ${desktopPath}`);

    // Mobile Screenshot
    const mobilePage = await browser.newPage();
    await mobilePage.emulate(puppeteer.KnownDevices['iPhone 13 Pro Max']);
    await mobilePage.goto('https://eco-track123.vercel.app/', { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 2000));

    const mobilePath = path.join(artifactDir, 'ecotrack_mobile.png');
    await mobilePage.screenshot({ path: mobilePath, fullPage: false });
    console.log(`Mobile screenshot saved to ${mobilePath}`);

    await browser.close();
  } catch (err) {
    console.error("Error taking screenshots:", err);
  }
})();
