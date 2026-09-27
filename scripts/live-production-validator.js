/**
 * scripts/live-production-validator.js
 *
 * NON-DESTRUCTIVE READ-ONLY FORENSIC VALIDATOR FOR LIVE PRODUCTION:
 * https://weddingwithindia.com
 *
 * Tests:
 * 1. Live Deployment & HTTP Headers
 * 2. Live robots.txt (character-by-character)
 * 3. Live sitemap.xml (parsing and categorization)
 * 4. Live Homepage (dual User-Agent: Standard Browser vs Googlebot)
 */

const https = require('https');
const { URL } = require('url');

function fetchUrl(targetUrl, userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36') {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${targetUrl}`));
    });

    req.end();
  });
}

async function runLiveValidation() {
  console.log('====================================================');
  console.log('  LIVE PRODUCTION FORENSIC VALIDATION');
  console.log('  Target: https://weddingwithindia.com');
  console.log('  Timestamp:', new Date().toISOString());
  console.log('====================================================\n');

  // STEP 1: Fetch Live robots.txt
  console.log('>>> [STEP 1 & 2] Fetching Live https://weddingwithindia.com/robots.txt ...');
  try {
    const robotsRes = await fetchUrl('https://weddingwithindia.com/robots.txt');
    console.log(`Status Code: ${robotsRes.statusCode}`);
    console.log('Headers:', JSON.stringify(robotsRes.headers, null, 2));
    console.log('\n--- LIVE ROBOTS.TXT CONTENT ---');
    console.log(robotsRes.body);
    console.log('-------------------------------\n');

    const hasNextBlocked = robotsRes.body.includes('/_next/');
    console.log(`Analysis: /_next/ blocked on live production? ${hasNextBlocked ? 'YES (CRITICAL BLOCKER STILL LIVE)' : 'NO (UNBLOCKED ON LIVE)'}`);
    console.log(`Analysis: Host directive: ${robotsRes.body.match(/Host:\s*(.*)/i)?.[1] || 'None'}`);
    console.log(`Analysis: Sitemap directive: ${robotsRes.body.match(/Sitemap:\s*(.*)/i)?.[1] || 'None'}`);
  } catch (err) {
    console.error('Failed to fetch live robots.txt:', err.message);
  }

  // STEP 2: Fetch Live Homepage
  console.log('\n>>> [STEP 4] Fetching Live Homepage (Standard Browser UA) ...');
  try {
    const homeRes = await fetchUrl('https://weddingwithindia.com/');
    console.log(`Status Code: ${homeRes.statusCode}`);
    console.log('Vercel ID:', homeRes.headers['x-vercel-id']);
    console.log('Age / Cache:', homeRes.headers['age'], homeRes.headers['cache-control']);

    const titleMatch = homeRes.body.match(/<title>([^<]*)<\/title>/i);
    const canonicalMatch = homeRes.body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const robotsMatch = homeRes.body.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
    const h1Match = homeRes.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

    console.log(`Live <title>: ${titleMatch ? titleMatch[1] : 'NONE FOUND'}`);
    console.log(`Live <link rel="canonical">: ${canonicalMatch ? canonicalMatch[1] : 'NONE FOUND'}`);
    console.log(`Live <meta name="robots">: ${robotsMatch ? robotsMatch[1] : 'NONE FOUND'}`);
    console.log(`Live <h1>: ${h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : 'NONE FOUND'}`);
  } catch (err) {
    console.error('Failed to fetch live homepage:', err.message);
  }

  // STEP 3: Fetch Live Homepage under Googlebot User-Agent
  console.log('\n>>> [STEP 4 & 5] Fetching Live Homepage (Googlebot User-Agent) ...');
  const googlebotUa = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
  try {
    const gbotRes = await fetchUrl('https://weddingwithindia.com/', googlebotUa);
    console.log(`Googlebot Status Code: ${gbotRes.statusCode}`);
    const titleMatch = gbotRes.body.match(/<title>([^<]*)<\/title>/i);
    const canonicalMatch = gbotRes.body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const robotsMatch = gbotRes.body.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);

    console.log(`Googlebot Seen Title: ${titleMatch ? titleMatch[1] : 'NONE'}`);
    console.log(`Googlebot Seen Canonical: ${canonicalMatch ? canonicalMatch[1] : 'NONE'}`);
    console.log(`Googlebot Seen Robots: ${robotsMatch ? robotsMatch[1] : 'NONE'}`);
  } catch (err) {
    console.error('Failed to fetch live homepage as Googlebot:', err.message);
  }

  // STEP 4: Fetch Live sitemap.xml
  console.log('\n>>> [STEP 3] Fetching Live https://weddingwithindia.com/sitemap.xml ...');
  try {
    const sitemapRes = await fetchUrl('https://weddingwithindia.com/sitemap.xml');
    console.log(`Sitemap Status Code: ${sitemapRes.statusCode}`);
    const urls = [];
    const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(sitemapRes.body)) !== null) {
      urls.push(match[1]);
    }
    console.log(`Total URLs in Live Sitemap: ${urls.length}`);

    const testSlugs = urls.filter(u => u.includes('e2e-') || u.includes('stage9_') || u.includes('test_pp') || u.includes('wedding-test_'));
    const weddingUrls = urls.filter(u => u.includes('/weddings/'));
    const redirectedSlugs = urls.filter(u => u.endsWith('/safety') || u.endsWith('/guest-safety') || u.endsWith('/host-safety'));

    console.log(`Showcase/Listing Wedding URLs: ${weddingUrls.length}`);
    console.log(`Synthetic Test Slugs in Live Sitemap: ${testSlugs.length} ${testSlugs.length > 0 ? JSON.stringify(testSlugs) : '(CLEAN)'}`);
    console.log(`Redirected Legacy Slugs in Live Sitemap: ${redirectedSlugs.length} ${redirectedSlugs.length > 0 ? JSON.stringify(redirectedSlugs) : '(CLEAN)'}`);

    console.log('\nSample Sitemap URLs (First 15):');
    urls.slice(0, 15).forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    if (weddingUrls.length > 0) {
      console.log('\nWedding URLs in Live Sitemap:');
      weddingUrls.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    }
  } catch (err) {
    console.error('Failed to fetch live sitemap.xml:', err.message);
  }
}

runLiveValidation();
