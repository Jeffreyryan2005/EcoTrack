const https = require('https');
const fs = require('fs');

https.get('https://api.microlink.io/?url=https://eco-track123.vercel.app/&screenshot=true&meta=false', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const imageUrl = json.data.screenshot.url;
    console.log(imageUrl);
    
    // Download the image
    const file = fs.createWriteStream("C:\\Users\\user\\.gemini\\antigravity\\brain\\5c1c6965-c646-4897-9a13-250296100a5d\\actual_screenshot.png");
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log("Screenshot downloaded!");
      });
    });
  });
});
