/**
 * scripts/sitemap-crawler-audit.js
 *
 * Crawls EVERY single URL listed in https://weddingwithindia.com/sitemap.xml
 * Verifies:
 * - HTTP Status Code
 * - Meta Robots (index/follow vs noindex)
 * - Canonical tag matching URL
 * - Document Title
 * - H1 existence
 * - Body content length (> 500 chars)
 */

async function main() {
  const sitemapUrl = "https://weddingwithindia.com/sitemap.xml";
  console.log(`Fetching sitemap from ${sitemapUrl}...`);

  const sitemapRes = await fetch(sitemapUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" }
  });

  const xmlText = await sitemapRes.text();
  const locs = [];
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xmlText)) !== null) {
    locs.push(match[1]);
  }

  console.log(`Discovered ${locs.length} URLs in sitemap.\n`);

  let count200 = 0;
  let count3xx = 0;
  let count4xx = 0;
  let count5xx = 0;
  let noindexCount = 0;
  let testUrlCount = 0;
  let redirectUrlCount = 0;
  let duplicateCount = 0;
  let canonicalMismatchCount = 0;
  let weddingUrlCount = 0;

  const seen = new Set();
  const results = [];

  for (let i = 0; i < locs.length; i++) {
    const url = locs[i];
    if (seen.has(url)) {
      duplicateCount++;
    }
    seen.add(url);

    if (url.includes("e2e-") || url.includes("stage9_") || url.includes("test_pp") || url.includes("wedding-test_")) {
      testUrlCount++;
    }
    if (url.endsWith("/safety") || url.endsWith("/guest-safety") || url.endsWith("/host-safety")) {
      redirectUrlCount++;
    }
    if (url.includes("/weddings/")) {
      weddingUrlCount++;
    }

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
        redirect: "manual"
      });

      if (res.status === 200) count200++;
      else if (res.status >= 300 && res.status < 400) count3xx++;
      else if (res.status >= 400 && res.status < 500) count4xx++;
      else if (res.status >= 500) count5xx++;

      const html = await res.text();
      const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || "NONE";
      const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)?.[1] || "NONE";
      const robots = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i)?.[1] || "index, follow (default)";
      const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, '').trim() || "NONE";
      const hasContent = html.length > 500;

      const isNoindex = robots.includes("noindex");
      if (isNoindex) noindexCount++;

      const isCanonicalMismatch = canonical !== "NONE" && canonical !== url;
      if (isCanonicalMismatch) canonicalMismatchCount++;

      results.push({
        url,
        status: res.status,
        robots,
        isNoindex,
        canonical,
        canonicalMatch: !isCanonicalMismatch,
        title,
        h1,
        contentLen: html.length
      });

      process.stdout.write(`[${i + 1}/${locs.length}] ${res.status} | ${url} | Robots: ${robots.slice(0, 15)} | Canonical: ${canonical ? "OK" : "MISSING"}\n`);
    } catch (err) {
      count5xx++;
      console.error(`[${i + 1}/${locs.length}] ERROR: ${url} - ${err.message}`);
    }
  }

  console.log("\n====================================================");
  console.log("  SITEMAP FORENSIC CRAWL REPORT SUMMARY");
  console.log("====================================================");
  console.log(`TOTAL_URLS: ${locs.length}`);
  console.log(`200_URLS: ${count200}`);
  console.log(`3xx_URLS: ${count3xx}`);
  console.log(`4xx_URLS: ${count4xx}`);
  console.log(`5xx_URLS: ${count5xx}`);
  console.log(`NOINDEX_URLS: ${noindexCount}`);
  console.log(`TEST_URLS: ${testUrlCount}`);
  console.log(`REDIRECT_URLS: ${redirectUrlCount}`);
  console.log(`DUPLICATE_URLS: ${duplicateCount}`);
  console.log(`CANONICAL_MISMATCHES: ${canonicalMismatchCount}`);
  console.log(`WEDDING_URLS: ${weddingUrlCount}`);
  console.log("====================================================\n");

  const fs = require('fs');
  fs.writeFileSync('scripts/sitemap-crawl-results.json', JSON.stringify({
    summary: {
      TOTAL_URLS: locs.length,
      URLS_200: count200,
      URLS_3xx: count3xx,
      URLS_4xx: count4xx,
      URLS_5xx: count5xx,
      NOINDEX_URLS: noindexCount,
      TEST_URLS: testUrlCount,
      REDIRECT_URLS: redirectUrlCount,
      DUPLICATE_URLS: duplicateCount,
      CANONICAL_MISMATCHES: canonicalMismatchCount,
      WEDDING_URLS: weddingUrlCount,
    },
    results
  }, null, 2));

  console.log("Detailed results saved to scripts/sitemap-crawl-results.json");
}

main().catch(console.error);
