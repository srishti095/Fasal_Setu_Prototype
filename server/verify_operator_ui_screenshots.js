import puppeteer from 'puppeteer-core';
import fs from 'fs';

(async () => {
  let executablePath = '';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromePath86 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

  if (fs.existsSync(edgePath)) executablePath = edgePath;
  else if (fs.existsSync(chromePath)) executablePath = chromePath;
  else if (fs.existsSync(chromePath86)) executablePath = chromePath86;

  console.log('Using browser executable:', executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Navigating to index.html login...');
  await page.goto('http://localhost:5000/index.html?login=1', { waitUntil: 'networkidle0' });

  console.log('2. Filling credentials for Operator...');
  await page.waitForSelector('input[name="identifier"]');
  await page.type('input[name="identifier"]', 'operator@fasalsetu.demo');
  await page.type('input[name="password"]', 'Operator@123');

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);

  console.log('Navigated to:', page.url());
  await new Promise(r => setTimeout(r, 2000));

  // Overview Screenshot
  await page.screenshot({ path: 'C:/Users/Hp/.gemini/antigravity/brain/c127675a-9a8a-41ca-8e24-4f7bf29b0b5c/operator_01_overview.png', fullPage: true });
  console.log('Captured operator_01_overview.png');

  // Today's Queue Screenshot
  await page.click('button[data-section="operatorQueue"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/Hp/.gemini/antigravity/brain/c127675a-9a8a-41ca-8e24-4f7bf29b0b5c/operator_02_queue.png', fullPage: true });
  console.log('Captured operator_02_queue.png');

  // Checkin Module Screenshot
  await page.click('button[data-section="checkin"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/Hp/.gemini/antigravity/brain/c127675a-9a8a-41ca-8e24-4f7bf29b0b5c/operator_03_checkin.png', fullPage: true });
  console.log('Captured operator_03_checkin.png');

  // Quality Module Screenshot
  await page.click('button[data-section="quality"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/Hp/.gemini/antigravity/brain/c127675a-9a8a-41ca-8e24-4f7bf29b0b5c/operator_04_quality.png', fullPage: true });
  console.log('Captured operator_04_quality.png');

  // Weighment Module Screenshot
  await page.click('button[data-section="weighment"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/Hp/.gemini/antigravity/brain/c127675a-9a8a-41ca-8e24-4f7bf29b0b5c/operator_05_weighment.png', fullPage: true });
  console.log('Captured operator_05_weighment.png');

  // Procurement Module Screenshot
  await page.click('button[data-section="procurement"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/Hp/.gemini/antigravity/brain/c127675a-9a8a-41ca-8e24-4f7bf29b0b5c/operator_06_procurement.png', fullPage: true });
  console.log('Captured operator_06_procurement.png');

  // Centre Status Screenshot
  await page.click('button[data-section="centreStatus"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/Hp/.gemini/antigravity/brain/c127675a-9a8a-41ca-8e24-4f7bf29b0b5c/operator_07_centre_status.png', fullPage: true });
  console.log('Captured operator_07_centre_status.png');

  // Reports Screenshot
  await page.click('button[data-section="reports"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/Hp/.gemini/antigravity/brain/c127675a-9a8a-41ca-8e24-4f7bf29b0b5c/operator_08_reports.png', fullPage: true });
  console.log('Captured operator_08_reports.png');

  // Profile Screenshot
  await page.click('button[data-section="profile"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/Hp/.gemini/antigravity/brain/c127675a-9a8a-41ca-8e24-4f7bf29b0b5c/operator_09_profile.png', fullPage: true });
  console.log('Captured operator_09_profile.png');

  console.log('=== ALL SCREENSHOTS CAPTURED SUCCESSFULLY ===');
  await browser.close();
})();
