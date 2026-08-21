const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3005';

async function fetchRoute(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { redirect: 'manual', ...options });
  const text = await res.text();
  const location = res.headers.get('location');
  const titleMatch = text.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch ? titleMatch[1] : (location ? `REDIRECT -> ${location}` : 'N/A');
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    text,
    title,
    location
  };
}

async function runSmokeTests() {
  console.log(`\n===============================================================`);
  console.log(`  WEDDING WITH INDIA — PRODUCTION SMOKE TEST SUITE`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`===============================================================\n`);

  let failures = 0;
  let passes = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passes++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failures++;
    }
  }

  // 1. Core Homepage
  console.log('\n--- [1] Testing Homepage (/) ---');
  const home = await fetchRoute('/');
  assert(home.status === 200, `Homepage returned HTTP ${home.status} (expected 200)`);
  assert(home.title.includes('WeddingWithIndia') || home.title.includes('Indian Weddings'), `Homepage title is correct: "${home.title}"`);
  assert(home.text.includes('Hero') || home.text.includes('hero') || home.text.includes('Authentic') || home.text.includes('Featured'), 'Homepage contains marketing DOM elements');
  const mainMatch = home.text.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  assert(mainMatch && !mainMatch[1].includes('Destination Uncharted'), 'Homepage <main> body does NOT render custom 404 page');

  // 2. Public Marketplace & Exploration Routes
  console.log('\n--- [2] Testing Public Marketplace & Category Routes ---');
  const publicRoutes = [
    { path: '/weddings', expectedTitle: 'Explore' },
    { path: '/list-wedding', expectedTitle: 'List Your Wedding' },
    { path: '/how-it-works', expectedTitle: 'How It Works' },
    { path: '/about', expectedTitle: 'About Us' },
    { path: '/contact', expectedTitle: 'Contact Us' },
    { path: '/for-travelers', expectedTitle: 'Travelers' },
    { path: '/for-couples', expectedTitle: 'Couples' },
    { path: '/for-agents', expectedTitle: 'Agent' },
    { path: '/coordinators', expectedTitle: 'Coordinator' },
    { path: '/founder/tanishq-gupta', expectedTitle: 'Tanishq Gupta' },
  ];

  for (const r of publicRoutes) {
    const res = await fetchRoute(r.path);
    assert(res.status === 200, `${r.path.padEnd(25)} returned HTTP ${res.status}`);
    assert(res.title.includes(r.expectedTitle) || res.title.includes('WeddingWithIndia'), `${r.path.padEnd(25)} title matches ("${res.title}")`);
    const main = (res.text.match(/<main[^>]*>([\s\S]*?)<\/main>/) || [])[1] || '';
    assert(!main.includes('Destination Uncharted'), `${r.path.padEnd(25)} <main> body renders authentic route content`);
  }

  // 3. Legal, Compliance & Policy Routes
  console.log('\n--- [3] Testing Legal, Compliance & Policy Routes ---');
  const legalRoutes = [
    '/privacy',
    '/terms',
    '/cookies',
    '/cancellation-policy',
    '/refund-policy',
    '/safety',
    '/dpdp',
    '/gdpr',
    '/host-agreement',
    '/traveler-agreement',
    '/agent-agreement',
    '/coordinator-agreement',
    '/copyright',
    '/trademark',
  ];

  for (const path of legalRoutes) {
    const res = await fetchRoute(path);
    assert(res.status === 200, `${path.padEnd(25)} returned HTTP ${res.status}`);
    const main = (res.text.match(/<main[^>]*>([\s\S]*?)<\/main>/) || [])[1] || '';
    assert(!main.includes('Destination Uncharted'), `${path.padEnd(25)} <main> body renders authentic policy content`);
  }

  // 4. Canonical Redirects for Common Aliases
  console.log('\n--- [4] Testing Canonical Redirects for Marketing Aliases ---');
  const aliasTests = [
    { from: '/signin', to: '/login' },
    { from: '/host', to: '/list-wedding' },
    { from: '/attend', to: '/weddings' },
    { from: '/destinations', to: '/weddings' },
    { from: '/about-us', to: '/about' },
    { from: '/contact-us', to: '/contact' },
    { from: '/terms-of-service', to: '/terms' },
    { from: '/privacy-policy', to: '/privacy' },
    { from: '/faq', to: '/how-it-works' },
  ];

  for (const alias of aliasTests) {
    const res = await fetchRoute(alias.from);
    assert(res.status === 307 || res.status === 308, `${alias.from.padEnd(20)} returned redirect status HTTP ${res.status}`);
    assert(res.location === alias.to, `${alias.from.padEnd(20)} redirects to ${alias.to} (got ${res.location})`);
  }

  // 5. Authentication Boundaries & Signin/Signup
  console.log('\n--- [5] Testing Auth Routes & Protected Boundaries ---');
  const loginRes = await fetchRoute('/login');
  assert(loginRes.status === 200, `/login returned HTTP ${loginRes.status}`);

  const signupRes = await fetchRoute('/signup');
  assert(signupRes.status === 200, `/signup returned HTTP ${signupRes.status}`);

  const unauthAdmin = await fetchRoute('/dashboard/admin');
  assert(unauthAdmin.status === 307 || unauthAdmin.status === 308 || unauthAdmin.status === 302 || unauthAdmin.status === 200, `/dashboard/admin unauthenticated access handled appropriately (HTTP ${unauthAdmin.status})`);

  // 6. Custom 404 Verification
  console.log('\n--- [6] Testing Custom 404 (Destination Uncharted) ---');
  const notFoundRes = await fetchRoute('/some-completely-invalid-nonexistent-path-12345');
  assert(notFoundRes.status === 404, `Invalid route returned HTTP ${notFoundRes.status} (expected 404)`);
  assert(notFoundRes.title.includes('Destination Uncharted'), `404 page title is "Destination Uncharted" (got: "${notFoundRes.title}")`);
  assert(notFoundRes.text.includes('Return Home'), '404 page contains "Return Home" action');
  assert(notFoundRes.text.includes('Explore Celebrations'), '404 page contains "Explore Celebrations" action');

  // 7. System Health and Readiness APIs
  console.log('\n--- [7] Testing System Health & Readiness APIs ---');
  const healthRes = await fetchRoute('/api/health');
  assert(healthRes.status === 200, `/api/health returned HTTP ${healthRes.status}`);

  console.log(`\n===============================================================`);
  console.log(`  RESULTS: ${passes} PASSED | ${failures} FAILED`);
  console.log(`===============================================================\n`);

  if (failures > 0) {
    process.exit(1);
  }
}

runSmokeTests().catch(err => {
  console.error('Smoke test harness encountered an unhandled error:', err);
  process.exit(1);
});
