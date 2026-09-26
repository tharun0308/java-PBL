async function runDiagnostics() {
  console.log('--- Benchmarking Direct Backend vs Next.js API Routes ---\n');

  // 1. Direct Backend Login
  const t0 = performance.now();
  const resBackendLogin = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'Aswinabi1*' }),
  });
  const t1 = performance.now();
  const backendLoginJson = await resBackendLogin.json();
  const token = backendLoginJson?.data?.accessToken;
  console.log(`1. Direct Java Backend Login: ${(t1 - t0).toFixed(2)} ms (Status: ${resBackendLogin.status})`);

  // 2. Next.js API Login
  const t2 = performance.now();
  const resNextLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'Aswinabi1*' }),
  });
  const t3 = performance.now();
  const nextLoginCookies = resNextLogin.headers.get('set-cookie');
  console.log(`2. Next.js Proxy Login:       ${(t3 - t2).toFixed(2)} ms (Status: ${resNextLogin.status})`);

  // 3. Direct Backend Report Summary
  const t4 = performance.now();
  const resBackendReports = await fetch('http://localhost:8080/api/v1/reports/summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const t5 = performance.now();
  console.log(`3. Direct Java Report Summary: ${(t5 - t4).toFixed(2)} ms (Status: ${resBackendReports.status})`);

  // 4. Next.js Report Summary
  const t6 = performance.now();
  const resNextReports = await fetch('http://localhost:3000/api/reports/summary', {
    headers: { Cookie: nextLoginCookies || '' },
  });
  const t7 = performance.now();
  console.log(`4. Next.js Report Summary:     ${(t7 - t6).toFixed(2)} ms (Status: ${resNextReports.status})`);

  console.log('\n--- Repeat to check warm execution ---');
  const t8 = performance.now();
  await fetch('http://localhost:8080/api/v1/reports/summary', { headers: { Authorization: `Bearer ${token}` } });
  const t9 = performance.now();
  console.log(`Direct Java Report (Warm):     ${(t9 - t8).toFixed(2)} ms`);

  const t10 = performance.now();
  await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'Aswinabi1*' }),
  });
  const t11 = performance.now();
  console.log(`Direct Java Login (Warm):      ${(t11 - t10).toFixed(2)} ms`);
}

runDiagnostics();
