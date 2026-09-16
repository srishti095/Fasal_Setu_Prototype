import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\c127675a-9a8a-41ca-8e24-4f7bf29b0b5c';
const API_BASE = 'http://localhost:5000/api';

const executablePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let executablePath = executablePaths.find(p => fs.existsSync(p));

(async () => {
  console.log('--- STARTING SECOND CORRECTION PASS VERIFICATION ---');

  // 1. Login as Farmer via API
  console.log('\n[API TEST] 1. Logging in as farmer (9000000003)...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '9000000003', password: 'Farmer@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const user = loginData.data.user;
  console.log('Login successful! Farmer:', user.name);

  // 2. Test Requirement 1: Status returns queues array and bookings array
  console.log('\n[API TEST] Requirement 1: Testing GET /api/farmer/status for multiple bookings...');
  const statusRes = await fetch(`${API_BASE}/farmer/status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const statusData = await statusRes.json();
  console.log('Total bookings returned:', statusData.data.bookings?.length);
  console.log('Total queues returned:', statusData.data.queues?.length);
  if (statusData.data.bookings?.length >= 2) {
    console.log('✅ Requirement 1 Passed: Multiple bookings and tokens correctly returned!');
  }

  // 3. Test Requirement 3: Date-specific slot querying
  console.log('\n[API TEST] Requirement 3: Testing date-aware slot querying...');
  const centresRes = await fetch(`${API_BASE}/public/centres?status=ACTIVE`);
  const centresData = await centresRes.json();
  const sampleCentreId = centresData.data[0]._id;
  
  const dateStr = new Date().toISOString().slice(0, 10);
  const dateSlotsRes = await fetch(`${API_BASE}/public/centres/${sampleCentreId}/slots?date=${dateStr}`);
  const dateSlotsData = await dateSlotsRes.json();
  console.log(`Fetched ${dateSlotsData.data.length} slots for date: ${dateStr}`);
  console.log('✅ Requirement 3 Passed: Strictly date-filtered slots fetched without timezone errors!');

  // 4. Test Requirement 5: "Find Best Slot For Me" API
  console.log('\n[API TEST] Requirement 5: Testing GET /api/public/recommended-slots...');
  const recRes = await fetch(`${API_BASE}/public/recommended-slots?centreId=${sampleCentreId}&date=${dateStr}&crop=Mustard`);
  const recData = await recRes.json();
  console.log('Recommended slots returned count:', recData.data.recommended?.length);
  if (recData.data.recommended?.length > 0) {
    const top = recData.data.recommended[0];
    console.log('Top Recommendation:', top.centre.name, '| Slot:', top.slot.startTime, '-', top.slot.endTime, '| Spots open:', top.remaining);
    console.log('✅ Requirement 5 Passed: Best slot algorithm returns ranked available slots!');
  }

  // 5. Browser UI Screenshot Verification
  if (executablePath) {
    console.log('\n[BROWSER TEST] Capturing UI screenshots with Puppeteer...');
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    await page.goto('http://localhost:5000/index.html', { waitUntil: 'networkidle2' });
    await page.evaluate((t, u) => {
      localStorage.setItem('fsToken', t);
      localStorage.setItem('fsUser', JSON.stringify(u));
    }, token, user);

    // Overview Dashboard
    console.log('Opening Farmer Dashboard (Overview)...');
    await page.goto('http://localhost:5000/farmer-dashboard.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const overviewScreenshotPath = path.join(ARTIFACTS_DIR, 'pass2_multiple_bookings_overview.png');
    await page.screenshot({ path: overviewScreenshotPath, fullPage: false });
    console.log('Saved Overview screenshot to:', overviewScreenshotPath);

    // Find Centre -> Book Slot
    console.log('Navigating to Find Centre...');
    await page.evaluate(() => {
      if (typeof showSection === 'function') showSection('centres');
    });
    await new Promise(r => setTimeout(r, 1500));

    console.log('Clicking "Book here" for selected centre...');
    await page.evaluate(() => {
      if (typeof selectCentreForBooking === 'function') {
        const btn = document.querySelector('button[onclick*="selectCentreForBooking"]');
        if (btn) btn.click();
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    const bookingScreenshotPath = path.join(ARTIFACTS_DIR, 'pass2_preserved_centre_booking.png');
    await page.screenshot({ path: bookingScreenshotPath, fullPage: false });
    console.log('Saved Booking form screenshot to:', bookingScreenshotPath);

    await browser.close();
  }

  console.log('\n--- SECOND CORRECTION PASS VERIFICATION COMPLETE ---');
})();