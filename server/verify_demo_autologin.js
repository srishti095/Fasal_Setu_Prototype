import puppeteer from 'puppeteer';

(async () => {
  console.log('Testing direct visit to operator-dashboard.html without existing credentials...');
  const executablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Clear localStorage
  await page.goto('http://localhost:5000/operator-dashboard.html');
  await page.evaluate(() => localStorage.clear());

  // Reload page
  await page.goto('http://localhost:5000/operator-dashboard.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));

  const text = await page.evaluate(() => document.body.innerText);
  console.log('--------------------------------------------------');
  console.log('PAGE TEXT SAMPLE:\n', text.substring(0, 400));
  console.log('--------------------------------------------------');

  const isStuck = text.includes('Loading assigned centre...') || text.includes('Loading today\'s queue...');
  if (isStuck) {
    console.error('RESULT: FAILED - Page is still stuck in loading state!');
  } else {
    console.log('RESULT: SUCCESS - Page loaded dynamically without getting stuck!');
  }

  const userStr = await page.evaluate(() => localStorage.getItem('fsUser'));
  console.log('Logged in User:', userStr);

  await page.screenshot({ path: '../scratch/operator_autologin_verified.png', fullPage: true });
  await browser.close();
  process.exit(isStuck ? 1 : 0);
})();
