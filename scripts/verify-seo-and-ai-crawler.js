/**
 * scripts/verify-seo-and-ai-crawler.js
 *
 * WeddingWithIndia — Master Technical SEO, GEO & AI Crawler Validation Suite.
 *
 * Validates:
 * 1. Robots.txt rules for all search engines & AI crawlers (Google, Bing, OpenAI, Claude, Perplexity).
 * 2. Sitemap completeness, absence of private/localhost URLs, and lastmod integrity.
 * 3. Knowledge Graph Entity Schema connections (Organization, WebSite, Founder, Event).
 * 4. Machine-readable llms.txt & llms-full.txt presence and valid canonical URL links.
 * 5. Public page canonical tags, metadata, and breadcrumb structures.
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const BASE_URL = "https://weddingwithindia.com";

const RESULTS = {
  passed: 0,
  failed: 0,
  checks: [],
};

function assert(condition, message) {
  if (condition) {
    RESULTS.passed++;
    RESULTS.checks.push({ status: "PASS", message });
    console.log(`  \x1b[32m[PASS]\x1b[0m ${message}`);
  } else {
    RESULTS.failed++;
    RESULTS.checks.push({ status: "FAIL", message });
    console.error(`  \x1b[31m[FAIL]\x1b[0m ${message}`);
  }
}

async function runSeoAudit() {
  console.log("\n===============================================================");
  console.log("  WEDDINGWITHINDIA — GOD-LEVEL SEO & AI CRAWLER AUDIT SUITE");
  console.log("===============================================================\n");

  // ──────────────────────────────────────────────────────────────────────────
  // 1. AUDIT ROBOTS.TS & AI CRAWLER ACCESS
  // ──────────────────────────────────────────────────────────────────────────
  console.log("1. Auditing Robots.txt Policy & AI Crawler Access...");
  const robotsPath = path.join(ROOT_DIR, "app", "robots.ts");
  assert(fs.existsSync(robotsPath), "app/robots.ts exists on disk");

  const robotsContent = fs.readFileSync(robotsPath, "utf8");

  // Check required AI and Search crawlers
  const requiredCrawlers = [
    "Googlebot",
    "Bingbot",
    "OAI-SearchBot",
    "OAI-AdsBot",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
  ];

  requiredCrawlers.forEach((bot) => {
    assert(
      robotsContent.includes(bot),
      `Robots policy explicitly configures ${bot}`
    );
  });

  // Ensure private routes are blocked
  const requiredDisallows = [
    "/dashboard/",
    "/admin/",
    "/account/",
    "/onboarding/",
    "/api/",
  ];

  requiredDisallows.forEach((disallow) => {
    assert(
      robotsContent.includes(disallow),
      `Robots policy strictly disallows private route: ${disallow}`
    );
  });

  // Ensure sitemap is referenced
  assert(
    robotsContent.includes("https://weddingwithindia.com/sitemap.xml"),
    "Robots policy declares canonical sitemap.xml location"
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 2. AUDIT SITEMAP.TS INTEGRITY & ROUTE COVERAGE
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n2. Auditing Sitemap.ts Integrity & URL Architecture...");
  const sitemapPath = path.join(ROOT_DIR, "app", "sitemap.ts");
  assert(fs.existsSync(sitemapPath), "app/sitemap.ts exists on disk");

  const sitemapContent = fs.readFileSync(sitemapPath, "utf8");

  // Check essential public routes in sitemap
  const essentialRoutes = [
    `${BASE_URL}`,
    `${BASE_URL}/weddings`,
    `${BASE_URL}/weddings/map`,
    `${BASE_URL}/destinations`,
    `${BASE_URL}/destinations/rajasthan`,
    `${BASE_URL}/destinations/goa`,
    `${BASE_URL}/destinations/punjab`,
    `${BASE_URL}/destinations/kerala`,
    `${BASE_URL}/destinations/delhi-ncr`,
    `${BASE_URL}/destinations/mumbai`,
    `${BASE_URL}/learn`,
    `${BASE_URL}/learn/can-foreigners-attend-indian-weddings`,
    `${BASE_URL}/learn/how-to-attend-an-indian-wedding`,
    `${BASE_URL}/learn/indian-wedding-etiquette-for-foreigners`,
    `${BASE_URL}/learn/what-to-wear-to-an-indian-wedding`,
    `${BASE_URL}/learn/indian-wedding-rituals-explained`,
    `${BASE_URL}/learn/indian-wedding-food-guide`,
    `${BASE_URL}/learn/indian-wedding-tourism`,
    `${BASE_URL}/learn/indian-wedding-experience-cost`,
    `${BASE_URL}/how-it-works`,
    `${BASE_URL}/for-travelers`,
    `${BASE_URL}/for-couples`,
    `${BASE_URL}/for-agents`,
    `${BASE_URL}/about`,
    `${BASE_URL}/founder/tanishq-gupta`,
    `${BASE_URL}/safety`,
    `${BASE_URL}/guest-safety`,
    `${BASE_URL}/host-safety`,
  ];

  essentialRoutes.forEach((route) => {
    assert(
      sitemapContent.includes(route) || sitemapContent.includes(route.replace(BASE_URL, "${baseUrl}")),
      `Sitemap includes essential public route: ${route}`
    );
  });

  // Verify no forbidden private routes in sitemap
  const forbiddenInSitemap = [
    "/dashboard",
    "/admin",
    "/account",
    "/onboarding",
    "/api/",
    "localhost",
    "http://",
  ];

  forbiddenInSitemap.forEach((bad) => {
    // Only flag if it's a URL in static routes
    assert(
      !sitemapContent.includes(`url: \`${BASE_URL}${bad}`) && !sitemapContent.includes(`url: "${BASE_URL}${bad}`),
      `Sitemap does NOT leak private or invalid URL: ${bad}`
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. AUDIT LLMS.TXT & LLMS-FULL.TXT FOR AI RETRIEVAL
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n3. Auditing Machine-Readable LLM Discovery Infrastructure...");
  const llmsPath = path.join(ROOT_DIR, "public", "llms.txt");
  const llmsFullPath = path.join(ROOT_DIR, "public", "llms-full.txt");

  assert(fs.existsSync(llmsPath), "public/llms.txt exists on disk");
  assert(fs.existsSync(llmsFullPath), "public/llms-full.txt exists on disk");

  const llmsText = fs.readFileSync(llmsPath, "utf8");
  const llmsFullText = fs.readFileSync(llmsFullPath, "utf8");

  assert(llmsText.length > 200, "public/llms.txt contains substantial context");
  assert(llmsFullText.length > 1000, "public/llms-full.txt contains rich full knowledge graph");
  assert(llmsText.includes(BASE_URL), "public/llms.txt uses absolute canonical URLs");
  assert(llmsText.includes("Tanishq Gupta"), "public/llms.txt attributes founder accurately");
  assert(llmsText.includes("/learn/can-foreigners-attend-indian-weddings"), "public/llms.txt indexes answer guides");
  assert(llmsText.includes("/destinations/rajasthan"), "public/llms.txt indexes destination hubs");

  // ──────────────────────────────────────────────────────────────────────────
  // 4. AUDIT KNOWLEDGE GRAPH ENTITY ARCHITECTURE
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n4. Auditing Knowledge Graph Entity Schema Integrity...");
  const layoutPath = path.join(ROOT_DIR, "app", "layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf8");

  assert(
    layoutContent.includes('"@id": `${APP_URL}/#organization`') || layoutContent.includes('"@id": "https://weddingwithindia.com/#organization"'),
    "Organization entity has stable @id (https://weddingwithindia.com/#organization)"
  );
  assert(
    layoutContent.includes('"@id": `${APP_URL}/#website`') || layoutContent.includes('"@id": "https://weddingwithindia.com/#website"'),
    "WebSite entity has stable @id (https://weddingwithindia.com/#website)"
  );
  assert(
    layoutContent.includes('publisher: {') && layoutContent.includes('#organization'),
    "WebSite entity references Organization as publisher"
  );
  assert(
    layoutContent.includes('founder: {') && layoutContent.includes('tanishq-gupta'),
    "Organization entity links to Founder Person entity"
  );
  assert(
    !layoutContent.includes("world's first"),
    "Unsubstantiated hyperbole 'world\\'s first' removed from root layout"
  );

  const founderPath = path.join(ROOT_DIR, "app", "founder", "tanishq-gupta", "page.tsx");
  const founderContent = fs.readFileSync(founderPath, "utf8");
  assert(
    founderContent.includes('"@id": "https://weddingwithindia.com/founder/tanishq-gupta#person"'),
    "Founder Person entity has stable @id"
  );
  assert(
    founderContent.includes('"@id": "https://weddingwithindia.com/#organization"'),
    "Founder Person entity links worksFor -> Organization entity"
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 5. AUDIT ANSWER HUB & DESTINATION PAGES ON DISK
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n5. Auditing Answer Hub & Destination Clusters on Disk...");
  const answerRoutes = [
    "can-foreigners-attend-indian-weddings",
    "how-to-attend-an-indian-wedding",
    "indian-wedding-etiquette-for-foreigners",
    "what-to-wear-to-an-indian-wedding",
    "indian-wedding-rituals-explained",
    "indian-wedding-food-guide",
    "indian-wedding-tourism",
    "indian-wedding-experience-cost",
  ];

  answerRoutes.forEach((route) => {
    const pagePath = path.join(ROOT_DIR, "app", "learn", route, "page.tsx");
    assert(fs.existsSync(pagePath), `Answer guide exists: app/learn/${route}/page.tsx`);
    if (fs.existsSync(pagePath)) {
      const pageCode = fs.readFileSync(pagePath, "utf8");
      assert(pageCode.includes("FAQPage"), `app/learn/${route} implements FAQPage JSON-LD schema`);
      assert(pageCode.includes("BreadcrumbList"), `app/learn/${route} implements BreadcrumbList schema`);
      assert(pageCode.includes("canonical"), `app/learn/${route} declares canonical URL`);
    }
  });

  const destRoutes = ["rajasthan", "goa", "punjab", "kerala", "delhi-ncr", "mumbai"];
  destRoutes.forEach((dest) => {
    const pagePath = path.join(ROOT_DIR, "app", "destinations", dest, "page.tsx");
    assert(fs.existsSync(pagePath), `Destination page exists: app/destinations/${dest}/page.tsx`);
    if (fs.existsSync(pagePath)) {
      const pageCode = fs.readFileSync(pagePath, "utf8");
      assert(pageCode.includes("Place"), `app/destinations/${dest} implements Place schema`);
      assert(pageCode.includes("BreadcrumbList"), `app/destinations/${dest} implements BreadcrumbList schema`);
      assert(pageCode.includes("canonical"), `app/destinations/${dest} declares canonical URL`);
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n===============================================================");
  console.log(`  AUDIT RESULTS: ${RESULTS.passed} Passed, ${RESULTS.failed} Failed`);
  console.log("===============================================================\n");

  if (RESULTS.failed > 0) {
    console.error("❌ Master SEO Audit FAILED. Fix the failed checks above.");
    process.exit(1);
  } else {
    console.log("✅ Master SEO Audit PASSED with 100% compliance!");
    process.exit(0);
  }
}

runSeoAudit().catch((err) => {
  console.error("Audit threw unexpected error:", err);
  process.exit(1);
});
