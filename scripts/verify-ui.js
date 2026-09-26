const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ashwin\\.gemini\\antigravity\\brain\\d5516443-6a9b-42e3-bfe8-3a1f19202444';

// Candidate paths for Edge / Chrome on Windows
const browserPaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

const executablePath = browserPaths.find((p) => fs.existsSync(p));

if (!executablePath) {
  console.error('No Edge or Chrome browser executable found!');
  process.exit(1);
}

console.log('Using browser executable:', executablePath);

async function runVerification() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();
  
  // Listen to console logs from the page
  page.on('console', (msg) => {
    console.log('[PAGE CONSOLE]', msg.text());
  });

  try {
    // 1. Navbar close-up screenshot on Landing Page
    console.log('1. Navigating to http://localhost:3000/ ...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('header');
    
    // Take screenshot of navbar
    const headerElement = await page.$('header');
    if (headerElement) {
      await headerElement.screenshot({
        path: path.join(ARTIFACT_DIR, 'navbar-closeup.png'),
      });
      console.log('✓ Saved navbar-closeup.png');
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'landing-page.png'),
    });
    console.log('✓ Saved landing-page.png');

    // 2. /register screenshot showing floating cards & form
    console.log('2. Navigating to http://localhost:3000/register ...');
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0', timeout: 30000 });
    // Wait 1.5s for floating card animations and layout
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'register-page.png'),
    });
    console.log('✓ Saved register-page.png');

    // 3. Register a fresh new user to test the entire Onboarding Flow live
    const uniqueId = Date.now();
    const testUser = {
      name: `Verification Student ${uniqueId.toString().slice(-4)}`,
      email: `student.${uniqueId}@campus.edu`,
      password: 'Password123!',
    };

    console.log(`3. Registering new user ${testUser.email}...`);
    await page.type('#fullName', testUser.name);
    await page.type('#email', testUser.email);
    await page.type('#password', testUser.password);
    await page.type('#confirmPassword', testUser.password);

    // Click submit button
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    // Wait for navigation / redirect to /onboarding
    console.log('Waiting for redirect after registration...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    console.log('Current URL after registration:', page.url());

    // If redirected to /onboarding, screenshot Step 1
    await page.waitForSelector('h1');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'onboarding-step1.png'),
    });
    console.log('✓ Saved onboarding-step1.png');

    // 4. Click on Student role card
    console.log('4. Selecting Student role card in Step 1...');
    // Find button containing Student text
    const buttons = await page.$$('button');
    let studentButton = null;
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.innerText, btn);
      if (text.includes('Student') && text.includes('Report classroom')) {
        studentButton = btn;
        break;
      }
    }

    if (studentButton) {
      await studentButton.click();
      await new Promise((r) => setTimeout(r, 800)); // wait for step transition
      console.log('✓ Clicked Student role card');
    } else {
      console.warn('Student button not found by description, clicking first card');
      const cards = await page.$$('button[type="button"]');
      if (cards[0]) await cards[0].click();
    }

    // Screenshot Step 2
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'onboarding-step2.png'),
    });
    console.log('✓ Saved onboarding-step2.png');

    // 5. Select 3rd Year in Step 2
    console.log('5. Selecting 3rd Year...');
    const yearButtons = await page.$$('button');
    let thirdYearBtn = null;
    for (const btn of yearButtons) {
      const text = await page.evaluate((el) => el.innerText, btn);
      if (text.includes('3rd Year')) {
        thirdYearBtn = btn;
        break;
      }
    }

    if (thirdYearBtn) {
      await thirdYearBtn.click();
      console.log('✓ Clicked 3rd Year button');
    }

    await new Promise((r) => setTimeout(r, 500));

    // Submit Onboarding
    console.log('Submitting onboarding form...');
    const completeBtn = await page.$('button[type="submit"]');
    if (completeBtn) {
      await completeBtn.click();
    }

    // Wait for redirect to /dashboard
    console.log('Waiting for final redirect to /dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    console.log('Final URL after onboarding completion:', page.url());

    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'dashboard-after-onboarding.png'),
    });
    console.log('✓ Saved dashboard-after-onboarding.png');

    console.log('ALL VERIFICATION SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
