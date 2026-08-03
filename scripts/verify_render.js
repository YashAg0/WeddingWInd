const http = require('http');

function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ path, status: res.statusCode, length: body.length, hasCurrency: body.includes('USD') || body.includes('INR') || body.includes('EUR') }));
    }).on('error', (err) => resolve({ path, status: 'ERROR', error: err.message }));
  });
}

async function runSweep() {
  const routes = [
    '/',
    '/weddings',
    '/weddings/grand-maharaja-wedding',
    '/account',
    '/list-wedding',
    '/for-agents/apply',
    '/for-agents/dashboard',
    '/hosts/dashboard',
    '/admin/hosts',
    '/admin/agents',
    '/admin/bookings',
    '/admin'
  ];

  console.log("--- STARTING COMPREHENSIVE ROUTE SWEEP ---");
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`Route [${res.path}] -> Status: ${res.status} | Length: ${res.length || 0} bytes | Currency Present: ${res.hasCurrency}`);
  }
  console.log("--- ROUTE SWEEP COMPLETED ---");
}

runSweep();
