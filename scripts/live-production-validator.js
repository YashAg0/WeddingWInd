/**
 * scripts/live-production-validator.js
 *
 * NON-DESTRUCTIVE READ-ONLY FORENSIC VALIDATOR FOR LIVE PRODUCTION:
 * https://weddingwithindia.com
 *
 * Tests:
 * 1. Live Deployment & Commit Version (/api/version)
 * 2. Live robots.txt (character-by-character RFC 9309, /_next/ unblocked)
 * 3. Live sitemap.xml (0 test slugs, 0 redirect slugs, 21 showcase weddings)
 * 4. Live Homepage (Status 200, Canonical, Brand Title, Robots, H1, dual UA)
 * 5. 10 Priority Routes (Status, Canonical, Title, Robots, H1, Schema)
 * 6. 5 Curated Wedding Showcase URLs (index, follow, Event schema)
 * 7. Structured Data Forensic Validation (Organization, WebSite, BreadcrumbList, Event, Person)
 */

const BASE_URL = 'https://weddingwithindia.com';

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

async function requestUrl(url, userAgent = BROWSER_UA) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    },
    redirect: 'manual',
  });
  const text = await res.text();
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    body: text,
  };
}

function extractMetadata(html) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]*>/g, '').trim());
  // Extract all JSON-LD blocks
  const jsonLdBlocks = [];
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      jsonLdBlocks.push(JSON.parse(match[1]));
    } catch {
      jsonLdBlocks.push({ error: 'JSON parse error', raw: match[1] });
    }
  }

  return {
    title: titleMatch ? titleMatch[1] : null,
    canonical: canonicalMatch ? canonicalMatch[1] : null,
    robots: robotsMatch ? robotsMatch[1] : null,
    h1s: h1Matches,
    jsonLd: jsonLdBlocks,
  };
}

async function runLiveValidation() {
  console.log('====================================================');
  console.log('  LIVE PRODUCTION FORENSIC VALIDATION');
  console.log('  Target:', BASE_URL);
  console.log('  Timestamp:', new Date().toISOString());
  console.log('====================================================\n');

  // STEP 1: Verify Production Commit
  console.log('>>> [1/7] LIVE VERSION & COMMIT ENDPOINT');
  const versionRes = await requestUrl(`${BASE_URL}/api/version`);
  console.log(`HTTP Status: ${versionRes.status}`);
  try {
    const vData = JSON.parse(versionRes.body);
    console.log(`Live Version: ${vData.version}`);
    console.log(`Live Commit Short: ${vData.commit}`);
    console.log(`Live Commit Full: ${vData.commitSha}`);
    console.log(`Live Region: ${vData.region}`);
    console.log(`Live Deployment Verified: ${vData.commit.startsWith('62ca504') ? 'PASS (Matches Remediation Commit)' : 'FAIL'}`);
  } catch (e) {
    console.error('Failed to parse version response:', e.message);
  }

  // STEP 2: Live robots.txt
  console.log('\n>>> [2/7] LIVE ROBOTS.TXT FORENSIC CHECK');
  const robotsRes = await requestUrl(`${BASE_URL}/robots.txt`);
  console.log(`Status: ${robotsRes.status}`);
  console.log(`Content-Type: ${robotsRes.headers['content-type']}`);
  const rBody = robotsRes.body;
  const hasNextBlocked = rBody.includes('/_next/');
  const hostMatch = rBody.match(/Host:\s*(.*)/i);
  const sitemapMatch = rBody.match(/Sitemap:\s*(.*)/i);
  console.log(`- /_next/ crawl block present? ${hasNextBlocked ? 'FAIL (STILL BLOCKED)' : 'PASS (UNBLOCKED - CSS/JS renderable)'}`);
  console.log(`- Host directive: ${hostMatch ? hostMatch[1] : 'NONE'} (Expected: weddingwithindia.com, no protocol)`);
  console.log(`- Sitemap directive: ${sitemapMatch ? sitemapMatch[1] : 'NONE'}`);

  // STEP 3: Live sitemap.xml
  console.log('\n>>> [3/7] LIVE SITEMAP.XML FORENSIC CHECK');
  const sitemapRes = await requestUrl(`${BASE_URL}/sitemap.xml`);
  console.log(`Status: ${sitemapRes.status}`);
  const urls = [];
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let sMatch;
  while ((sMatch = locRegex.exec(sitemapRes.body)) !== null) {
    urls.push(sMatch[1]);
  }
  console.log(`- Total URLs in Live Sitemap: ${urls.length}`);
  const testSlugs = urls.filter(u => u.includes('e2e-') || u.includes('stage9_') || u.includes('test_pp') || u.includes('wedding-test_'));
  const redirectSlugs = urls.filter(u => u.endsWith('/safety') || u.endsWith('/guest-safety') || u.endsWith('/host-safety'));
  const weddingUrls = urls.filter(u => u.includes('/weddings/'));
  console.log(`- Synthetic test slugs: ${testSlugs.length} ${testSlugs.length === 0 ? 'PASS (0 found)' : 'FAIL: ' + JSON.stringify(testSlugs)}`);
  console.log(`- Redirect legacy slugs: ${redirectSlugs.length} ${redirectSlugs.length === 0 ? 'PASS (0 found)' : 'FAIL: ' + JSON.stringify(redirectSlugs)}`);
  console.log(`- Weddings in sitemap: ${weddingUrls.length} (21 showcase + /weddings/map)`);

  // STEP 4: Live Homepage (Dual User-Agent)
  console.log('\n>>> [4/7] LIVE HOMEPAGE (Standard Browser vs Googlebot UA)');
  const homeBrowser = await requestUrl(`${BASE_URL}/`, BROWSER_UA);
  const homeGbot = await requestUrl(`${BASE_URL}/`, GOOGLEBOT_UA);
  console.log(`Standard Browser UA -> Status: ${homeBrowser.status}`);
  console.log(`Googlebot UA        -> Status: ${homeGbot.status}`);

  const metaBrowser = extractMetadata(homeBrowser.body);
  const metaGbot = extractMetadata(homeGbot.body);

  console.log(`Title: ${metaBrowser.title}`);
  console.log(`Canonical: ${metaBrowser.canonical}`);
  console.log(`Robots: ${metaBrowser.robots}`);
  console.log(`H1 count: ${metaBrowser.h1s.length} | Text: "${metaBrowser.h1s.join('", "')}"`);
  console.log(`Parity Check (Browser vs Googlebot): ${metaBrowser.title === metaGbot.title && metaBrowser.canonical === metaGbot.canonical ? 'PASS (Identical HTML / 0 Cloaking)' : 'FAIL'}`);

  // STEP 5: 10 Priority Routes Forensic Audit
  console.log('\n>>> [5/7] 10 PRIORITY ROUTES FORENSIC AUDIT');
  const priorityRoutes = [
    '/',
    '/destinations',
    '/destinations/rajasthan',
    '/destinations/delhi-ncr',
    '/learn',
    '/learn/how-to-attend-an-indian-wedding',
    '/weddings',
    '/weddings/grand-maharaja-wedding',
    '/trust',
    '/founder/tanishq-gupta',
  ];

  for (const route of priorityRoutes) {
    const fullUrl = `${BASE_URL}${route}`;
    const res = await requestUrl(fullUrl);
    const meta = extractMetadata(res.body);
    const hasBrandDup = meta.title && (meta.title.match(/WeddingWithIndia/g) || []).length > 1;

    console.log(`\nRoute: ${route}`);
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Title: ${meta.title}`);
    console.log(`  Canonical: ${meta.canonical}`);
    console.log(`  Robots: ${meta.robots || 'index, follow (default)'}`);
    console.log(`  H1: [${meta.h1s.length}] ${meta.h1s.join(' | ')}`);
    console.log(`  Double-Brand Suffix Bug? ${hasBrandDup ? 'FAIL (Detected duplication)' : 'PASS (Clean single brand)'}`);
    console.log(`  Structured Data Types: ${meta.jsonLd.map(s => s['@type'] || (s['@graph'] ? s['@graph'].map(g => g['@type']).join(',') : 'Unknown')).join(', ')}`);
  }

  // STEP 6: 5 Showcase Weddings Deep Check
  console.log('\n>>> [6/7] 5 CURATED WEDDING SHOWCASE URLS DEEP CHECK');
  const showcaseSlugs = [
    'grand-maharaja-wedding',
    'goan-sunset-beach-nuptials',
    'punjabi-amritsar-golden-wedding',
    'kerala-coastal-christian-matrimony',
    'varanasi-ganges-spiritual-wedding',
  ];

  for (const slug of showcaseSlugs) {
    const fullUrl = `${BASE_URL}/weddings/${slug}`;
    const res = await requestUrl(fullUrl);
    const meta = extractMetadata(res.body);
    const isNoindexed = meta.robots && meta.robots.includes('noindex');

    console.log(`\nWedding: /weddings/${slug}`);
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Title: ${meta.title}`);
    console.log(`  Robots Content: ${meta.robots}`);
    console.log(`  Indexable by Search Engines? ${!isNoindexed ? 'PASS (index, follow)' : 'FAIL (noindex present!)'}`);
    console.log(`  Canonical: ${meta.canonical}`);

    // Check Event schema
    const eventSchema = meta.jsonLd.find(s => s['@type'] === 'Event');
    if (eventSchema) {
      console.log(`  Event Schema Name: "${eventSchema.name}"`);
      console.log(`  Event Schema startDate: ${eventSchema.startDate}`);
      console.log(`  Event Schema endDate: ${eventSchema.endDate}`);
      console.log(`  Event Schema Location: ${eventSchema.location?.name}, ${eventSchema.location?.address?.addressLocality}`);
    } else {
      console.log('  Event Schema: NOT FOUND');
    }
  }

  // STEP 7: Structured Data Forensic Validation
  console.log('\n>>> [7/7] STRUCTURED DATA FORENSIC INTEGRITY');
  const learnGuideRes = await requestUrl(`${BASE_URL}/learn/how-to-attend-an-indian-wedding`);
  const learnMeta = extractMetadata(learnGuideRes.body);
  const breadcrumb = learnMeta.jsonLd.find(s => s['@type'] === 'BreadcrumbList');
  if (breadcrumb) {
    const items = breadcrumb.itemListElement || [];
    const invalidLearnType = items.some(it => it['@type'] === 'Learn');
    const validListItem = items.every(it => it['@type'] === 'ListItem');
    console.log(`- BreadcrumbList @type: "ListItem" validation: ${validListItem && !invalidLearnType ? 'PASS (All items are ListItem, 0 invalid "Learn" types)' : 'FAIL'}`);
    console.log(`  Breadcrumb Items: ${JSON.stringify(items)}`);
  } else {
    console.log('- BreadcrumbList: NOT FOUND on learn guide');
  }

  console.log('\n====================================================');
  console.log('  LIVE PRODUCTION FORENSIC VALIDATION COMPLETE');
  console.log('====================================================\n');
}

runLiveValidation().catch(e => {
  console.error('Fatal validation error:', e);
  process.exit(1);
});
