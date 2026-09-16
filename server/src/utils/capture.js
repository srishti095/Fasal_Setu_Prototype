import puppeteer from 'puppeteer-core';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\Hp\\.gemini\\antigravity\\brain\\c127675a-9a8a-41ca-8e24-4f7bf29b0b5c';
const projectRoot = 'd:\\SIH2026\\correction_2\\fasalSetu3';

export async function capturePages(pageList) {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  for (const item of pageList) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const fileUrl = `file:///${projectRoot.replace(/\\/g, '/')}/client/${item.page}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    const savePath = path.join(artifactDir, item.file);
    await page.screenshot({ path: savePath, fullPage: false });
    await page.close();
    console.log(`Saved screenshot: ${item.file}`);
  }
  await browser.close();
}

const list = [
  { page: 'index.html', file: 'home_current.png' },
  { page: 'procurement-centres.html', file: 'centres_current.png' },
  { page: 'crops.html', file: 'crops_current.png' },
  { page: 'msp-calculator.html', file: 'msp_current.png' },
  { page: 'about.html', file: 'about_current.png' }
];

capturePages(list).catch(console.error);
