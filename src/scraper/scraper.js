// src/scraper/scraper.js

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    // Launch the browser in headless mode
    const browser = await puppeteer.launch({
      headless: true, // Ensure headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Open a new page
    const page = await browser.newPage();

    // Set a user-agent to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/88.0.4324.96 Safari/537.36'
    );

    // Navigate to the Happy Meal Toys page
    await page.goto('https://www.happymeal.com/#toys', {
      waitUntil: 'networkidle2',
    });

    // Function to auto-scroll to the bottom of the page to load all toys
    async function autoScroll(page) {
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight - window.innerHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
    }

    // Auto-scroll to load all toys
    await autoScroll(page);

    // Wait for at least one .toy-idle image
    await page.waitForSelector('div.toy img.toy--idle');

    // Grab all the toys by looking at each <div class="toy"> container
    const toys = await page.$$eval('div.toy', (toyDivs) => {
      return toyDivs.map((div) => {
        const idleImg = div.querySelector('img.toy--idle');
        const hoverImg = div.querySelector('img.toy--hover');

        // Return the relevant info
        return {
          name: idleImg ? idleImg.getAttribute('alt') : null,
          idleUrl: idleImg ? idleImg.getAttribute('src') : null,
          hoverUrl: hoverImg ? hoverImg.getAttribute('src') : null,
        };
      });
    });

    // Filter out entries without a name or without an image
    const filteredToys = toys.filter(
      (toy) => toy.name && toy.name.trim() !== '' && toy.idleUrl
    );

    // Clean up the image URLs if they are relative
    // (In the screenshot, they appear to be absolute URLs already, but just in case)
    const baseUrl = 'https://www.happymeal.com';
    const cleanedToys = filteredToys.map((toy) => ({
      name: toy.name,
      idleUrl: toy.idleUrl.startsWith('http')
        ? toy.idleUrl
        : `${baseUrl}${toy.idleUrl.split('#')[0]}`,
      hoverUrl: toy.hoverUrl
        ? (toy.hoverUrl.startsWith('http')
            ? toy.hoverUrl
            : `${baseUrl}${toy.hoverUrl.split('#')[0]}`)
        : null,
    }));

    // Define the path to save toys.json
    const dataDir = path.join(__dirname, '../data');
    const outputPath = path.join(dataDir, 'toys.json');

    // Ensure the data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save the data to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(cleanedToys, null, 2));

    console.log('Scraping completed successfully.');
    console.log(`Data saved to ${outputPath}`);

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error occurred while scraping:', error);
  }
})();
