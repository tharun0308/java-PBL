const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const browserPaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

const executablePath = browserPaths.find((p) => fs.existsSync(p));

async function measureLoginFlow() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 860 },
  });

  const page = await browser.newPage();
  
  // Track all network requests with exact timestamps
  const requests = new Map();
  const networkLogs = [];

  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  client.on('Network.requestWillBeSent', (event) => {
    requests.set(event.requestId, {
      url: event.request.url,
      method: event.request.method,
      startTime: event.timestamp * 1000, // convert to ms
    });
  });

  client.on('Network.responseReceived', (event) => {
    const req = requests.get(event.requestId);
    if (req) {
      req.status = event.response.status;
      req.mimeType = event.response.mimeType;
      req.timing = event.response.timing;
      req.endTime = event.timestamp * 1000;
      req.duration = req.endTime - req.startTime;
      networkLogs.push(req);
    }
  });

  try {
    console.log('--- Step 1: Navigating to /login ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await page.waitForSelector('#email');

    // Fill credentials
    await page.type('#email', 'admin@gmail.com');
    await page.type('#password', 'Aswinabi1*');

    console.log('--- Step 2: Clicking Sign In & Timing Every Phase ---');
    const startClickTime = performance.now();

    // Click submit
    await page.click('button[type="submit"]');

    // Wait for URL to become /admin/dashboard
    await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 30000 });
    const urlChangeTime = performance.now();
    const timeToUrlChange = urlChangeTime - startClickTime;

    // Wait for Dashboard content to load (e.g. Facilities Overview & Analytics text)
    await page.waitForSelector('text/Facilities Overview & Analytics', { timeout: 30000 });
    const dashboardDomTime = performance.now();
    const timeToDomReady = dashboardDomTime - startClickTime;

    // Wait for stats to load (isLoading = false, i.e., numbers appear or skeleton disappears)
    await page.waitForSelector('text/Total Complaints', { timeout: 30000 });
    const statsRenderedTime = performance.now();
    const totalLoadTime = statsRenderedTime - startClickTime;

    console.log('\n================ TIMING BREAKDOWN ================');
    console.log(`1. Click "Sign In" -> URL Changed to /admin/dashboard: ${timeToUrlChange.toFixed(2)} ms`);
    console.log(`2. Click "Sign In" -> Admin Dashboard DOM Ready:      ${timeToDomReady.toFixed(2)} ms`);
    console.log(`3. Click "Sign In" -> Full Data Rendered (Final):     ${totalLoadTime.toFixed(2)} ms (${(totalLoadTime / 1000).toFixed(2)}s)`);
    console.log('===================================================\n');

    console.log('================ API NETWORK LOGS ================');
    const relevantLogs = networkLogs.filter(l => 
      l.url.includes('/api/') || 
      l.url.includes('/admin/dashboard') || 
      l.url.includes('onboarding') ||
      l.url.includes('login')
    );

    for (const log of relevantLogs) {
      const cleanUrl = log.url.replace('http://localhost:3000', '');
      console.log(`${log.method.padEnd(5)} | Status: ${log.status} | Duration: ${log.duration?.toFixed(2).padStart(8)} ms | ${cleanUrl}`);
    }
    console.log('==================================================\n');

  } catch (err) {
    console.error('Benchmark failed:', err);
  } finally {
    await browser.close();
  }
}

measureLoginFlow();
