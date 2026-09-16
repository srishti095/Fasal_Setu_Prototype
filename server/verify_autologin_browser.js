import puppeteer from 'puppeteer-core';

(async () => {
  console.log('Testing Operator Dashboard loading with async initDashboard completion...');
  const executablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('http://localhost:5000/operator-dashboard.html');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5000/operator-dashboard.html', { waitUntil: 'networkidle0' });

  // Wait 1.5 seconds for async initDashboard -> ensureDemoAuth -> loadOverview to complete
  await new Promise(r => setTimeout(r, 1500));

  const title = await page.evaluate(() => document.getElementById('headerCentreTitle')?.innerText);
  const meta = await page.evaluate(() => document.getElementById('headerCentreMeta')?.innerText);
  const overviewHtml = await page.evaluate(() => document.getElementById('overviewContent')?.innerHTML);

  console.log('--- FINAL RENDERED STATE ---');
  console.log('Title:', title);
  console.log('Meta:', meta);
  console.log('Overview HTML Snippet:\n', overviewHtml?.substring(0, 300));

  await page.screenshot({ path: '../scratch/operator_dashboard_fully_rendered.png', fullPage: true });
  await browser.close();
})();
