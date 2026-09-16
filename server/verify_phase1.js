import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\c127675a-9a8a-41ca-8e24-4f7bf29b0b5c';

const executablePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = executablePaths.find(p => fs.existsSync(p));

(async () => {
  if (!executablePath) {
    console.log('No Chrome/Edge binary found.');
    return;
  }

  // First fetch farmer login token via API
  console.log('Fetching login session via API...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '9000000003', password: 'Farmer@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const user = loginData.data.user;
  console.log('Logged in as:', user.name);

  console.log('Launching browser at:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Set localStorage on domain BEFORE navigating to farmer-dashboard.html
  console.log('Setting domain localStorage...');
  await page.goto('http://localhost:5000/index.html', { waitUntil: 'networkidle2' });
  await page.evaluate((t, u) => {
    localStorage.setItem('fsToken', t);
    localStorage.setItem('fsUser', JSON.stringify(u));
  }, token, user);

  // Now navigate to farmer-dashboard.html
  console.log('Opening farmer dashboard with active session...');
  await page.goto('http://localhost:5000/farmer-dashboard.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. My Crops Screenshot
  console.log('Navigating to My Crops...');
  await page.evaluate(() => {
    if (typeof showSection === 'function') showSection('crops');
  });
  await new Promise(r => setTimeout(r, 2000));

  const cropsScreenshotPath = path.join(ARTIFACTS_DIR, 'phase1_my_crops.png');
  await page.screenshot({ path: cropsScreenshotPath, fullPage: false });
  console.log('Saved My Crops screenshot to:', cropsScreenshotPath);

  // 2. My Bookings History Screenshot
  console.log('Navigating to My Bookings History...');
  await page.evaluate(() => {
    if (typeof showSection === 'function') showSection('myBookings');
  });
  await new Promise(r => setTimeout(r, 2000));

  const bookingsScreenshotPath = path.join(ARTIFACTS_DIR, 'phase1_my_bookings.png');
  await page.screenshot({ path: bookingsScreenshotPath, fullPage: false });
  console.log('Saved My Bookings screenshot to:', bookingsScreenshotPath);

  await browser.close();
  console.log('Phase 1 Screenshots Captured Successfully!');
})();
