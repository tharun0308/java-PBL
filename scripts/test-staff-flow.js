const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\ashwin\\.gemini\\antigravity\\brain\\d5516443-6a9b-42e3-bfe8-3a1f19202444';

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

// Create a dummy image file for upload testing
const sampleIdCardPath = path.join(__dirname, 'sample-faculty-id.png');
const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGpJREFUeNrswTEBAAAAwqD1T20ND6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4MccigABk330qAAAAABJRU5ErkJggg==',
  'base64'
);
fs.writeFileSync(sampleIdCardPath, pngBuffer);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runEndToEndStaffFlow() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 860 },
  });

  const page = await browser.newPage();
  page.on('console', (msg) => console.log('[PAGE CONSOLE]', msg.text()));

  try {
    const timestamp = Date.now();
    const testEmail = `teacher_${timestamp}@campus.edu`;
    const testPassword = 'Password@123';

    console.log(`\n--- STEP 1: Register New Teacher Account (${testEmail}) ---`);
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
    await page.type('#fullName', 'Prof. Eleanor Vance');
    await page.type('#email', testEmail);
    await page.type('#password', testPassword);
    await page.type('#confirmPassword', testPassword);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
    console.log('✓ Registered successfully, currently at URL:', page.url());

    console.log('\n--- STEP 2: Complete Onboarding as Teacher with Manager Intent & ID Upload ---');
    await delay(1000);

    // Click Teacher card on Step 1
    const teacherBtn = await page.waitForSelector('xpath///h3[contains(text(), "Teacher")]/ancestor::button');
    await teacherBtn.click();
    console.log('✓ Selected Teacher / Faculty role, advanced to Step 2');
    await delay(1000);

    // Step 2: Select "Manager Access" card
    const managerBtn = await page.waitForSelector('xpath///span[contains(text(), "Manager Access")]/ancestor::button');
    await managerBtn.click();
    console.log('✓ Selected Manager Access mode');
    await delay(800);

    // Upload ID proof file
    console.log('Attaching sample Employee ID document...');
    const fileInput = await page.waitForSelector('#staff-id-file-input', { timeout: 5000 });
    await fileInput.uploadFile(sampleIdCardPath);
    await delay(2500); // Wait for upload completion

    // Fill department
    const deptInput = await page.waitForSelector('input[placeholder*="Assistant Professor"]');
    await deptInput.type('Department of Computer Science & Engineering');
    await delay(500);

    // Screenshot Step 2
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'onboarding-manager-step2-uploaded.png'),
    });
    console.log('✓ Saved onboarding-manager-step2-uploaded.png');

    // Submit Onboarding
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
    console.log('✓ Completed onboarding, currently at URL:', page.url());

    // Screenshot Pending Approval Page
    await delay(1500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pending-approval-page.png'),
    });
    console.log('✓ Saved pending-approval-page.png');

    console.log('\n--- STEP 3: Verify File on Disk in backend/uploads/staff-id-proofs/ ---');
    const possibleUploadDirs = [
      path.resolve(__dirname, '../backend/uploads/staff-id-proofs'),
      path.resolve(__dirname, '../../backend/uploads/staff-id-proofs'),
      path.resolve(__dirname, '../uploads/staff-id-proofs'),
    ];
    const uploadsDir = possibleUploadDirs.find((d) => fs.existsSync(d));
    if (uploadsDir) {
      const files = fs.readdirSync(uploadsDir);
      console.log('Files found in uploads directory (' + uploadsDir + '):', files);
      const matched = files.filter((f) => f.startsWith('id-proof-'));
      console.log('✓ Verified uploaded ID files matching id-proof-* pattern:', matched);
      if (matched.length === 0) {
        throw new Error('No uploaded files matching id-proof-* found in storage directory!');
      }
    } else {
      throw new Error('Uploads directory not found in any expected location: ' + JSON.stringify(possibleUploadDirs));
    }

    console.log('\n--- STEP 4: Login as Main Admin and Review Request ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    });
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.type('#email', 'admin@gmail.com');
    await page.type('#password', 'Aswinabi1*');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
    console.log('✓ Logged in as Main Admin, currently at URL:', page.url());

    // Go to Admin Staff Requests page
    console.log('Navigating to http://localhost:3000/admin/staff-requests ...');
    await page.goto('http://localhost:3000/admin/staff-requests', { waitUntil: 'networkidle0' });
    await delay(2500);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'admin-staff-requests-list.png'),
    });
    console.log('✓ Saved admin-staff-requests-list.png');

    // Click "View Employee ID" button to open modal preview
    const viewIdBtn = await page.waitForSelector('xpath///button[contains(., "View Employee ID")]', { timeout: 8000 });
    if (viewIdBtn) {
      await viewIdBtn.click();
      await delay(2000);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'admin-view-employee-id-modal.png'),
      });
      console.log('✓ Saved admin-view-employee-id-modal.png');

      // Approve directly from the modal footer
      console.log('\n--- STEP 5: Approve Request as Main Admin ---');
      const approveInModalBtn = await page.waitForSelector('xpath///button[contains(., "Approve Staff Admin")]', { timeout: 5000 });
      if (approveInModalBtn) {
        await approveInModalBtn.click();
        console.log('✓ Clicked "Approve Staff Admin" in modal');
        await delay(2500);
      }
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'admin-staff-requests-after-approve.png'),
    });
    console.log('✓ Saved admin-staff-requests-after-approve.png');

    console.log('\n--- STEP 6: Test Regular Teacher Dashboard Request Card Flow ---');
    // Register another teacher who starts as REGULAR, then requests manager on Dashboard
    const timestamp2 = Date.now();
    const testEmail2 = `teacher_regular_${timestamp2}@campus.edu`;
    await page.evaluate(async () => {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    });
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
    await page.waitForSelector('#fullName', { timeout: 10000 });
    await page.type('#fullName', 'Prof. Arthur Pendelton');
    await page.type('#email', testEmail2);
    await page.type('#password', testPassword);
    await page.type('#confirmPassword', testPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForFunction(() => window.location.pathname.includes('/onboarding') || window.location.pathname.includes('/dashboard'), { timeout: 15000 });
    console.log('✓ Registered Teacher 2, navigating to onboarding...');

    // If redirected to /dashboard first, navigate to /onboarding
    if (page.url().includes('/dashboard')) {
      await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle0' });
    }

    // Onboard as Regular Teacher
    await delay(1500);
    const teacherBtn2 = await page.waitForSelector('xpath///h3[contains(text(), "Teacher")]/ancestor::button');
    await teacherBtn2.click();
    await delay(1000);

    const regularBtn = await page.waitForSelector('xpath///span[contains(text(), "Regular Teacher")]/ancestor::button');
    await regularBtn.click();
    await delay(500);

    const submitBtn2 = await page.waitForSelector('button[type="submit"]');
    await submitBtn2.click();
    await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 15000 });
    console.log('✓ Onboarded as Regular Teacher, now at URL:', page.url());

    // Scroll down to the bottom card on Dashboard
    await delay(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(1000);

    // On Dashboard, verify the "Request Manager (Staff Admin) Access" card exists!
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'regular-teacher-dashboard-request-card.png'),
    });
    console.log('✓ Saved regular-teacher-dashboard-request-card.png');

    // Upload file on dashboard and submit request
    const dashFileInput = await page.waitForSelector('#staff-id-file-input', { timeout: 5000 });
    await dashFileInput.uploadFile(sampleIdCardPath);
    await delay(3000);

    // Fill department
    const dashDeptInput = await page.waitForSelector('input[placeholder*="Assistant Professor"]');
    await dashDeptInput.type('Department of Electrical Engineering');
    await delay(800);

    // Screenshot dashboard card with file attached
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'regular-teacher-dashboard-attached.png'),
    });
    console.log('✓ Saved regular-teacher-dashboard-attached.png');

    // Click submit manager request button with genuine mouse click
    const submitManagerBtn = await page.waitForSelector('xpath///button[contains(., "Submit Manager Request")]');
    if (submitManagerBtn) {
      await submitManagerBtn.click();
      console.log('✓ Clicked Submit Manager Request button');
    }

    await page.waitForFunction(() => window.location.pathname.includes('/pending-approval'), { timeout: 15000 });
    console.log('✓ Successfully requested manager access from Dashboard! Current URL:', page.url());

    await delay(1500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'dashboard-requested-pending-approval.png'),
    });
    console.log('✓ Saved dashboard-requested-pending-approval.png');

    console.log('\n======================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('======================================\n');
  } catch (err) {
    console.error('Test failed with error:', err);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'test-error.png'),
    });
  } finally {
    await browser.close();
    if (fs.existsSync(sampleIdCardPath)) {
      fs.unlinkSync(sampleIdCardPath);
    }
  }
}

runEndToEndStaffFlow();
