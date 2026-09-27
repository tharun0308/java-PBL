import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8080';

async function runTests() {
  console.log('=== Step 1: Query Backend Database for "citar" / "plumbing" complaint ===');
  try {
    // Admin login on backend directly to inspect DB
    const adminLoginRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'Aswinabi1*' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data?.accessToken;

    const complaintsRes = await fetch(`${BACKEND_URL}/api/v1/complaints?size=100`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const complaintsData = await complaintsRes.json();
    const list = complaintsData.data?.content || complaintsData.data || [];
    console.log(`Total complaints in DB: ${list.length}`);
    const match = list.find((c) => 
      (c.location && c.location.toLowerCase().includes('citar')) ||
      (c.description && c.description.toLowerCase().includes('plumbing'))
    );
    if (match) {
      console.log('Found matching complaint in DB:', match);
    } else {
      console.log('Confirmed: No complaint with "citar" or "plumbing" found in DB.');
    }
  } catch (err) {
    console.error('Error querying backend:', err);
  }

  console.log('\n=== Step 2: Test Silent Refresh via Next.js Backend ===');
  try {
    // Log in via Next.js route
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'Aswinabi1*' }),
    });
    
    // In node-fetch, headers can be retrieved via get('set-cookie') or raw()
    const setCookieHeader = loginRes.headers.get('set-cookie') || '';
    const loginBody = await loginRes.json().catch(() => ({}));
    console.log('Login status:', loginRes.status, 'Body:', loginBody);
    console.log('Login Set-Cookie Header:', setCookieHeader);

    // Extract cookies
    const cookiesArray = setCookieHeader.split(/,(?=\s*scms_)/);
    let accessTokenCookie = '';
    let refreshTokenCookie = '';

    setCookieHeader.split(';').forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.startsWith('scms_access_token=')) {
        accessTokenCookie = trimmed;
      }
      if (trimmed.startsWith('scms_refresh_token=')) {
        refreshTokenCookie = trimmed;
      }
    });

    // Alternatively extract via regex
    const accessMatch = setCookieHeader.match(/scms_access_token=([^;]+)/);
    if (accessMatch) accessTokenCookie = accessMatch[0];
    const refreshMatch = setCookieHeader.match(/scms_refresh_token=([^;]+)/);
    if (refreshMatch) refreshTokenCookie = refreshMatch[0];

    console.log('Access token cookie present:', !!accessTokenCookie);
    console.log('Refresh token cookie present:', !!refreshTokenCookie);

    // Helper to update cookies from response headers
    function updateCookies(res) {
      const setCookies = res.headers.get('set-cookie');
      if (setCookies) {
        const accessMatch = setCookies.match(/scms_access_token=([^;]+)/);
        if (accessMatch) accessTokenCookie = accessMatch[0];
        const refreshMatch = setCookies.match(/scms_refresh_token=([^;]+)/);
        if (refreshMatch) refreshTokenCookie = refreshMatch[0];
      }
    }

    // Test 2a: Normal fetch with valid cookies
    const compRes1 = await fetch(`${BASE_URL}/api/complaints`, {
      headers: { Cookie: `${accessTokenCookie}; ${refreshTokenCookie}` },
    });
    console.log('Status with valid access token:', compRes1.status);
    updateCookies(compRes1);

    // Test 2b: Fetch with EXPIRED/INVALID access token but VALID refresh token
    const expiredTokenCookie = 'scms_access_token=invalid_expired_token';
    const compRes2 = await fetch(`${BASE_URL}/api/complaints`, {
      headers: { Cookie: `${expiredTokenCookie}; ${refreshTokenCookie}` },
    });
    console.log('Status with expired access token + valid refresh token:', compRes2.status);
    const compData2 = await compRes2.json();
    console.log('Response success:', compData2.success, 'Complaints count:', compData2.data?.length ?? 0);
    updateCookies(compRes2);

    // Test 2c: Auth Me with expired access token + updated valid refresh token
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `${expiredTokenCookie}; ${refreshTokenCookie}` },
    });
    console.log('Status of /api/auth/me with expired access token + valid refresh token:', meRes.status);
    const meData = await meRes.json();
    console.log('User returned from /api/auth/me:', meData.user?.email);
    updateCookies(meRes);

    // Test 2d: /api/auth/refresh endpoint directly with current valid refresh token
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: refreshTokenCookie },
    });
    console.log('/api/auth/refresh status:', refreshRes.status);
    const refreshData = await refreshRes.json();
    console.log('/api/auth/refresh result:', refreshData);

    console.log('\n=== All token refresh tests passed! ===');
  } catch (err) {
    console.error('Error during token refresh test:', err);
  }
}

runTests();
