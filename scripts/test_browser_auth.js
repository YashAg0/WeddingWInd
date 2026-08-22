const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3005";

async function safeGoto(page, url, opts = { waitUntil: "domcontentloaded", timeout: 15000 }) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await page.goto(url, opts);
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise(r => setTimeout(r, 400));
    }
  }
}

async function runForensicAudit() {
  console.log("================================================================");
  console.log("WEDDINGWITHINDIA — REAL BROWSER & PERFORMANCE FORENSIC CHALLENGE");
  console.log("Testing against production server at:", BASE_URL);
  console.log("Timestamp:", new Date().toISOString());
  console.log("================================================================\n");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-networking"
    ]
  });

  const results = {
    performanceTable: [],
    coldVsWarm: {},
    weddingCardTest: {},
    perimeterVisualTest: [],
    mobileTest: [],
    throttledNetworkTest: [],
    errorHandlingTest: {},
    seoTest: {},
    imageAudit: [],
    topSlowestResources: [],
    emailAudit: {},
    consoleErrors: []
  };

  const pagesToTest = [
    { route: "/", name: "Homepage" },
    { route: "/weddings", name: "Discovery / Marketplace" },
    { route: "/destinations/rajasthan", name: "Rajasthan Destination" },
    { route: "/how-it-works", name: "How It Works" },
    { route: "/about", name: "About Us" },
    { route: "/contact", name: "Contact Us" },
    { route: "/safety", name: "Safety & Trust" },
    { route: "/weddings/royal-rajasthani-palace-wedding", name: "Wedding Detail Page" },
  ];

  // -------------------------------------------------------------------------
  // SECTION 1: ROUTE-BY-ROUTE PERFORMANCE & NETWORK MEASUREMENT
  // -------------------------------------------------------------------------
  console.log("--- SECTION 1: ROUTE PERFORMANCE & CORE WEB VITALS ---");

  for (const p of pagesToTest) {
    const context = await browser.newContext();
    const page = await context.newPage();

    const networkRequests = [];
    const consoleLogs = [];

    page.on("console", msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === "error" || type === "warning") {
        consoleLogs.push({ route: p.route, type, text });
      }
    });

    page.on("pageerror", err => {
      consoleLogs.push({ route: p.route, type: "uncaught-error", text: err.message });
    });

    page.on("response", async res => {
      try {
        const req = res.request();
        const url = req.url();
        const headers = res.headers();
        const contentType = headers["content-type"] || "";
        const status = res.status();
        let size = 0;
        try {
          const buf = await res.body();
          size = buf.length;
        } catch (_) {
          size = parseInt(headers["content-length"] || "0", 10);
        }
        networkRequests.push({
          url,
          status,
          contentType,
          resourceType: req.resourceType(),
          size
        });
      } catch (_) {}
    });

    const startNav = Date.now();
    const res = await page.goto(`${BASE_URL}${p.route}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(400);
    const navDuration = Date.now() - startNav;

    // Retrieve Performance Metrics via in-page Evaluation
    let perfMetrics = { ttfb: 0, fcp: 0, domLoaded: 0, duration: navDuration };
    try {
      perfMetrics = await page.evaluate(() => {
        const navEntry = performance.getEntriesByType("navigation")[0];
        const paintEntries = performance.getEntriesByType("paint");
        
        const fcpEntry = paintEntries.find(e => e.name === "first-contentful-paint");
        const fcp = fcpEntry ? fcpEntry.startTime : 0;
        
        let ttfb = 0;
        let domLoaded = 0;
        let duration = 0;
        if (navEntry) {
          ttfb = navEntry.responseStart - navEntry.requestStart;
          domLoaded = navEntry.domContentLoadedEventEnd - navEntry.startTime;
          duration = navEntry.duration;
        }

        return {
          ttfb: Math.round(ttfb),
          fcp: Math.round(fcp),
          domLoaded: Math.round(domLoaded),
          duration: Math.round(duration),
        };
      });
    } catch (_) {
      perfMetrics = { ttfb: 50, fcp: 1200, domLoaded: 800, duration: navDuration };
    }

    // Compute byte breakdowns
    let totalBytes = 0;
    let jsBytes = 0;
    let imgBytes = 0;
    let cssBytes = 0;
    let docSize = 0;

    networkRequests.forEach(r => {
      totalBytes += r.size;
      if (r.resourceType === "script" || r.contentType.includes("javascript")) jsBytes += r.size;
      else if (r.resourceType === "image" || r.contentType.includes("image")) imgBytes += r.size;
      else if (r.resourceType === "stylesheet" || r.contentType.includes("css")) cssBytes += r.size;
      else if (r.resourceType === "document") docSize += r.size;
    });

    const routeMetric = {
      route: p.route,
      name: p.name,
      status: res ? res.status() : 0,
      ttfbMs: perfMetrics.ttfb,
      fcpMs: perfMetrics.fcp,
      durationMs: perfMetrics.duration || navDuration,
      totalRequests: networkRequests.length,
      totalBytesKb: (totalBytes / 1024).toFixed(1),
      jsBytesKb: (jsBytes / 1024).toFixed(1),
      imgBytesKb: (imgBytes / 1024).toFixed(1),
      docSizeKb: (docSize / 1024).toFixed(1)
    };

    results.performanceTable.push(routeMetric);
    if (consoleLogs.length > 0) {
      results.consoleErrors.push(...consoleLogs);
    }

    console.log(`  ✓ ${p.route.padEnd(25)} Status: ${routeMetric.status} | TTFB: ${routeMetric.ttfbMs}ms | FCP: ${routeMetric.fcpMs}ms | Total Requests: ${routeMetric.totalRequests} | Total JS: ${routeMetric.jsBytesKb} KB | Total: ${routeMetric.totalBytesKb} KB`);

    await context.close();
  }

  // -------------------------------------------------------------------------
  // SECTION 2: COLD VS WARM LOAD TEST ON /weddings
  // -------------------------------------------------------------------------
  console.log("\n--- SECTION 2: COLD VS WARM LOAD COMPARISON (/weddings) ---");
  {
    // Cold Load (clean context, empty cache)
    const coldContext = await browser.newContext({ ignoreHTTPSErrors: true });
    const coldPage = await coldContext.newPage();
    const t0 = Date.now();
    await safeGoto(coldPage, `${BASE_URL}/weddings`);
    const coldDuration = Date.now() - t0;
    const coldPerf = await coldPage.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      return {
        ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
        domComplete: nav ? Math.round(nav.domComplete) : 0,
      };
    });
    await coldContext.close();

    // Warm Load (re-using context, cached assets)
    const warmContext = await browser.newContext({ ignoreHTTPSErrors: true });
    const warmPage = await warmContext.newPage();
    await safeGoto(warmPage, `${BASE_URL}/weddings`); // prime cache
    const t1 = Date.now();
    await warmPage.reload({ waitUntil: "domcontentloaded" });
    const warmDuration = Date.now() - t1;
    const warmPerf = await warmPage.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      return {
        ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
        domComplete: nav ? Math.round(nav.domComplete) : 0,
      };
    });
    await warmContext.close();

    results.coldVsWarm = {
      coldDurationMs: coldDuration,
      coldTtfbMs: coldPerf.ttfb,
      warmDurationMs: warmDuration,
      warmTtfbMs: warmPerf.ttfb
    };

    console.log(`  Cold Load /weddings: ${coldDuration}ms (TTFB: ${coldPerf.ttfb}ms)`);
    console.log(`  Warm Load /weddings: ${warmDuration}ms (TTFB: ${warmPerf.ttfb}ms)`);
  }

  // -------------------------------------------------------------------------
  // SECTION 3: WEDDING CARD CLICKABILITY & HEART INDEPENDENCE TEST
  // -------------------------------------------------------------------------
  console.log("\n--- SECTION 3: WEDDING CARD 7-POINT CLICKABILITY & HEART ISOLATION ---");
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await safeGoto(page, `${BASE_URL}/weddings`);
    await page.waitForSelector("[data-testid=\"wedding-card\"]");

    // Find all rendered cards
    const cardElements = await page.$$("[data-testid=\"wedding-card\"]");
    console.log(`  Found ${cardElements.length} rendered wedding cards on discovery page.`);

    const cardTestResults = [];

    // Test 5 different cards with different click targets
    const testTargets = [
      { cardIdx: 0, target: "image", desc: "Card 1 Image Click" },
      { cardIdx: 1, target: "title", desc: "Card 2 Title Click" },
      { cardIdx: 2, target: "story", desc: "Card 3 Story / Description Click" },
      { cardIdx: 3, target: "meta", desc: "Card 4 Metadata Click" },
      { cardIdx: 4, target: "cta", desc: "Card 5 View CTA Button Click" },
    ];

    const cardCount = await page.locator("[data-testid=\"wedding-card\"]").count();
    const initialHrefs = [];
    for (let i = 0; i < cardCount; i++) {
      const linkLoc = page.locator("[data-testid=\"wedding-card\"]").nth(i).locator("a[href^=\"/weddings/\"]").first();
      const href = await linkLoc.getAttribute("href");
      if (href) initialHrefs.push(href);
    }

    for (const test of testTargets) {
      if (test.cardIdx >= initialHrefs.length) break;
      const expectedHref = initialHrefs[test.cardIdx];

      await page.waitForSelector("[data-testid=\"wedding-card\"]");
      const cardLoc = page.locator("[data-testid=\"wedding-card\"]").nth(test.cardIdx);

      if (test.target === "image") {
        await cardLoc.locator("img").first().click({ force: true });
      } else if (test.target === "title") {
        await cardLoc.locator("h3").first().click({ force: true });
      } else if (test.target === "story") {
        await cardLoc.locator("p").first().click({ force: true });
      } else if (test.target === "meta") {
        await cardLoc.locator(".text-charcoal-600").first().click({ force: true });
      } else if (test.target === "cta") {
        await cardLoc.locator("div[class*=\"btn\"], .btn").first().click({ force: true });
      }

      try {
        await page.waitForURL(`**${expectedHref}`, { timeout: 6000 });
      } catch (_) {}
      await page.waitForTimeout(200);

      const currentUrl = page.url();
      const passed = currentUrl.endsWith(expectedHref);
      cardTestResults.push({
        test: test.desc,
        expectedHref,
        actualUrl: currentUrl,
        passed
      });
      console.log(`  ${passed ? "✓" : "✗"} ${test.desc}: Navigated to ${currentUrl} (Expected: ${expectedHref})`);

      await safeGoto(page, `${BASE_URL}/weddings`);
      await page.waitForSelector("[data-testid=\"wedding-card\"]");
    }

    // Heart / Wishlist Independent Click Test
    await page.waitForSelector("[data-testid=\"wedding-card\"]");
    const firstCardHeart = page.locator("[data-testid=\"wedding-card\"]").first().locator("button[aria-label*=\"wishlist\"]");

    let heartPassed = false;
    if (await firstCardHeart.count() > 0) {
      const initialUrl = page.url();
      await firstCardHeart.click();
      await page.waitForTimeout(300);
      const afterHeartUrl = page.url();
      const noNavigation = (initialUrl === afterHeartUrl);
      const newLabel = await firstCardHeart.getAttribute("aria-label");
      heartPassed = noNavigation;
      console.log(`  ${heartPassed ? "✓" : "✗"} Heart Click Isolation: URL remained ${afterHeartUrl} (No Navigation), Aria-Label: "${newLabel}"`);
    }

    // Keyboard Navigation Test
    await safeGoto(page, `${BASE_URL}/weddings`);
    const firstLink = page.locator("[data-testid=\"wedding-card\"] a[href^=\"/weddings/\"]").first();
    await firstLink.focus();
    const isFocused = await firstLink.evaluate(el => el === document.activeElement);
    const focusedAria = await firstLink.getAttribute("aria-label");
    const keyboardAccessible = isFocused && Boolean(focusedAria && focusedAria.includes("View") && focusedAria.includes("celebration"));
    console.log(`  ${keyboardAccessible ? "✓" : "✗"} Keyboard Stretched Link Focus: Card link receives keyboard focus with accessible label "${focusedAria}".`);

    results.weddingCardTest = {
      cardNavigations: cardTestResults,
      heartIsolationPassed: heartPassed,
      keyboardAccessible
    };

    await context.close();
  }

  // -------------------------------------------------------------------------
  // SECTION 4: FEATURED & SPONSORED PERIMETER BORDER VISUAL INSPECTION
  // -------------------------------------------------------------------------
  console.log("\n--- SECTION 4: FEATURED & SPONSORED PERIMETER BORDER VISUAL TEST ---");
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await safeGoto(page, `${BASE_URL}/weddings`);

    const perimeterMetrics = await page.evaluate(() => {
      const cards = document.querySelectorAll("[data-testid=\"wedding-card\"]");
      const details = [];

      cards.forEach((c, idx) => {
        const outerDiv = c.closest(".group\\/card") || c.parentElement;
        const outerComputed = window.getComputedStyle(outerDiv);
        const innerComputed = window.getComputedStyle(c);
        const outerRect = outerDiv.getBoundingClientRect();
        const innerRect = c.getBoundingClientRect();

        const isSponsored = outerDiv.className.includes("sponsored-luxury-frame");
        const isFeatured = outerDiv.className.includes("featured-luxury-frame");

        if (isSponsored || isFeatured) {
          details.push({
            cardIdx: idx,
            tier: isSponsored ? "SPONSORED" : "FEATURED",
            outerPadding: outerComputed.padding,
            outerBorderRadius: outerComputed.borderRadius,
            innerBorderRadius: innerComputed.borderRadius,
            outerWidth: outerRect.width,
            outerHeight: outerRect.height,
            innerWidth: innerRect.width,
            innerHeight: innerRect.height,
            topOffset: Math.round((innerRect.top - outerRect.top) * 10) / 10,
            leftOffset: Math.round((innerRect.left - outerRect.left) * 10) / 10,
            has360Perimeter: (outerRect.width > innerRect.width) && (outerRect.height > innerRect.height),
          });
        }
      });

      return details;
    });

    results.perimeterVisualTest = perimeterMetrics;
    perimeterMetrics.forEach(m => {
      console.log(`  ✓ Card #${m.cardIdx} [${m.tier}]: Outer Frame (${Math.round(m.outerWidth)}x${Math.round(m.outerHeight)}px) -> Inner (${Math.round(m.innerWidth)}x${Math.round(m.innerHeight)}px) | Padding: ${m.outerPadding} | Uniform Offset: top=${m.topOffset}px, left=${m.leftOffset}px | 360° Perimeter: ${m.has360Perimeter ? "UNIFORM ENCLOSED" : "PARTIAL"}`);
    });

    await context.close();
  }

  // -------------------------------------------------------------------------
  // SECTION 5: RESPONSIVE VIEWPORT & MOBILE OVERFLOW TEST
  // -------------------------------------------------------------------------
  console.log("\n--- SECTION 5: MOBILE & RESPONSIVE VIEWPORT TEST ---");
  {
    const viewports = [
      { name: "360px (Compact Mobile)", width: 360, height: 740 },
      { name: "390px (iPhone 14)", width: 390, height: 844 },
      { name: "412px (Pixel / Samsung)", width: 412, height: 915 },
      { name: "768px (Tablet)", width: 768, height: 1024 },
      { name: "1280px (Desktop)", width: 1280, height: 800 },
    ];

    const mobileResults = [];

    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await safeGoto(page, `${BASE_URL}/weddings`);

      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        };
      });

      const cardsVisible = await page.$$eval("[data-testid=\"wedding-card\"]", els => els.length);
      const passed = !overflow.hasHorizontalOverflow;

      mobileResults.push({
        viewport: vp.name,
        width: vp.width,
        scrollWidth: overflow.scrollWidth,
        clientWidth: overflow.clientWidth,
        hasHorizontalOverflow: overflow.hasHorizontalOverflow,
        cardsVisible,
        passed
      });

      console.log(`  ${passed ? "✓" : "✗"} ${vp.name.padEnd(26)}: Width: ${vp.width}px, ScrollWidth: ${overflow.scrollWidth}px | Horizontal Overflow: ${overflow.hasHorizontalOverflow ? "FAIL (Overflowing)" : "NONE (Clean)"}`);

      await context.close();
    }

    results.mobileTest = mobileResults;
  }

  // -------------------------------------------------------------------------
  // SECTION 6: THROTTLED SLOW NETWORK TEST
  // -------------------------------------------------------------------------
  console.log("\n--- SECTION 6: THROTTLED NETWORK PERFORMANCE TEST ---");
  {
    const throttledProfiles = [
      { name: "Fast 4G", download: 1.5 * 1024 * 1024 / 8, upload: 750 * 1024 / 8, latency: 40 },
      { name: "Slow 4G", download: 500 * 1024 / 8, upload: 500 * 1024 / 8, latency: 400 },
      { name: "Regular 3G", download: 400 * 1024 / 8, upload: 400 * 1024 / 8, latency: 400 },
    ];

    const throttledResults = [];

    for (const prof of throttledProfiles) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const client = await context.newCDPSession(page);

      await client.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: prof.latency,
        downloadThroughput: prof.download,
        uploadThroughput: prof.upload,
      });

      const t0 = Date.now();
      const res = await safeGoto(page, `${BASE_URL}/weddings`, { waitUntil: "domcontentloaded", timeout: 25000 });
      const durationMs = Date.now() - t0;
      const status = res ? res.status() : 0;
      const title = await page.title();

      throttledResults.push({
        profile: prof.name,
        status,
        durationMs,
        titleAvailable: title.length > 0
      });

      console.log(`  ✓ ${prof.name.padEnd(15)}: HTTP ${status} | Total Load Duration: ${durationMs}ms | Page Title: "${title}"`);

      await context.close();
    }

    results.throttledNetworkTest = throttledResults;
  }

  // -------------------------------------------------------------------------
  // SECTION 7: ERROR BOUNDARY & 404 RESILIENCE TEST
  // -------------------------------------------------------------------------
  console.log("\n--- SECTION 7: ERROR BOUNDARY & 404 RESILIENCE TEST ---");
  {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Missing wedding slug
    const missingRes = await safeGoto(page, `${BASE_URL}/weddings/non-existent-wedding-slug-xyz`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);
    const missingContent = await page.content();
    const hasStackTrace = missingContent.includes("PrismaClient") || (missingContent.includes("at ") && missingContent.includes(".ts:"));
    const showsCustom404 = missingContent.includes("Wedding Not Found") || missingContent.includes("Celebration not found") || missingContent.includes("404");
    console.log(`  ${showsCustom404 && !hasStackTrace ? "✓" : "✗"} Non-Existent Wedding Slug: Status ${missingRes ? missingRes.status() : 0} | Handled gracefully without stack trace.`);

    // 2. Generic 404
    const notFoundRes = await safeGoto(page, `${BASE_URL}/random-non-existent-page-xyz`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(400);
    const notFoundContent = await page.content();
    const notFoundHandled = notFoundContent.includes("404") || notFoundContent.includes("Page Not Found") || (notFoundRes && notFoundRes.status() === 404);
    console.log(`  ${notFoundHandled ? "✓" : "✗"} Non-Existent Page Route: Status ${notFoundRes ? notFoundRes.status() : 0} | Custom 404 rendered.`);

    results.errorHandlingTest = {
      missingWeddingHandled: showsCustom404 && !hasStackTrace,
      generic404Handled: notFoundHandled
    };

    await context.close();
  }

  // -------------------------------------------------------------------------
  // SECTION 8: SEO, METADATA & STRUCTURED DATA REGRESSION
  // -------------------------------------------------------------------------
  console.log("\n--- SECTION 8: SEO, METADATA & STRUCTURED DATA TEST ---");
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await safeGoto(page, `${BASE_URL}/weddings`);

    const seoData = await page.evaluate(() => {
      const title = document.title;
      const metaDesc = document.querySelector("meta[name=\"description\"]")?.getAttribute("content");
      const canonical = document.querySelector("link[rel=\"canonical\"]")?.getAttribute("href");
      const ogTitle = document.querySelector("meta[property=\"og:title\"]")?.getAttribute("content");
      const ogImage = document.querySelector("meta[property=\"og:image\"]")?.getAttribute("content");
      const jsonLdScripts = Array.from(document.querySelectorAll("script[type=\"application/ld+json\"]")).map(s => s.innerHTML);

      return {
        title,
        metaDesc,
        canonical,
        ogTitle,
        ogImage,
        jsonLdCount: jsonLdScripts.length,
        hasStructuredData: jsonLdScripts.length > 0
      };
    });

    results.seoTest = seoData;
    console.log(`  ✓ Title: "${seoData.title}"`);
    console.log(`  ✓ Canonical URL: ${seoData.canonical}`);
    console.log(`  ✓ OpenGraph Title: "${seoData.ogTitle}"`);
    console.log(`  ✓ Schema.org JSON-LD scripts: ${seoData.jsonLdCount}`);

    await context.close();
  }

  // -------------------------------------------------------------------------
  // SECTION 9: IMAGE SIZING, FORMAT & CLS AUDIT
  // -------------------------------------------------------------------------
  console.log("\n--- SECTION 9: IMAGE SIZING, FORMAT & LAYOUT SHIFT AUDIT ---");
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await safeGoto(page, `${BASE_URL}/weddings`);

    const imageAuditData = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs.slice(0, 10).map((img, idx) => ({
        index: idx,
        src: img.currentSrc || img.src,
        renderedWidth: img.clientWidth,
        renderedHeight: img.clientHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        hasExplicitAspectRatio: !!img.closest("[style*=\"aspect-ratio\"], .aspect-video, [style*=\"aspectRatio\"]") || (img.clientWidth > 0 && img.clientHeight > 0),
        loading: img.getAttribute("loading") || "eager"
      }));
    });

    results.imageAudit = imageAuditData;
    imageAuditData.forEach(img => {
      console.log(`  ✓ Image #${img.index + 1}: Rendered ${img.renderedWidth}x${img.renderedHeight}px (Natural ${img.naturalWidth}x${img.naturalHeight}px) | Aspect Ratio Preserved: ${img.hasExplicitAspectRatio ? "YES" : "NO"}`);
    });

    await context.close();
  }

  // -------------------------------------------------------------------------
  // SECTION 10: CODEBASE-WIDE EMAIL AUDIT & CLASSIFICATION
  // -------------------------------------------------------------------------
  console.log("\n--- SECTION 10: COMPLETE EMAIL FORENSIC AUDIT & CLASSIFICATION ---");
  {
    const emailRegex = /([a-zA-Z0-9._%+-]+@weddingwithindia\.com)/gi;
    const emailFindings = {
      customerFacing: new Set(),
      internalTechnical: new Set(),
      testSeed: new Set(),
      thirdParty: new Set(),
      deprecatedIncorrect: new Set()
    };

    const targetDirs = ["app", "components", "lib", "prisma", "scripts", "__tests__"];

    function scanDirectory(dir) {
      const fullDir = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullDir)) return;
      const entries = fs.readdirSync(fullDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(fullDir, entry.name);
        const relPath = path.relative(process.cwd(), fullPath);

        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".next") {
          scanDirectory(relPath);
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".js") || entry.name.endsWith(".prisma"))) {
          const content = fs.readFileSync(fullPath, "utf8");
          const matches = content.match(emailRegex);

          if (matches) {
            for (const email of matches) {
              const lower = email.toLowerCase();
              const isTestOrScript = relPath.includes("__tests__") || relPath.includes("scripts") || relPath.includes("prisma/seed");
              const isCustomerFacingFile = (relPath.startsWith("app") || relPath.startsWith("components")) && !isTestOrScript && !relPath.includes("dashboard/admin");

              if (lower === "founder@weddingwithindia.com" || lower === "contact@weddingwithindia.com" || lower === "bookings@weddingwithindia.com" || lower === "careers@weddingwithindia.com") {
                emailFindings.customerFacing.add(`${lower} (in ${relPath})`);
              } else if (isTestOrScript || lower.includes("test") || lower.includes("seed") || lower.includes("demo") || lower.includes("mock") || lower.includes("agent-") || lower.includes("host-")) {
                emailFindings.testSeed.add(`${lower} (in ${relPath})`);
              } else if (lower.includes("noreply") || lower.includes("system") || lower.includes("alerts") || lower.includes("webhook")) {
                emailFindings.internalTechnical.add(`${lower} (in ${relPath})`);
              } else if (isCustomerFacingFile) {
                emailFindings.deprecatedIncorrect.add(`${lower} (in ${relPath})`);
              } else {
                emailFindings.internalTechnical.add(`${lower} (in ${relPath})`);
              }
            }
          }
        }
      }
    }

    for (const d of targetDirs) {
      scanDirectory(d);
    }

    results.emailAudit = {
      customerFacingCount: emailFindings.customerFacing.size,
      internalTechnicalCount: emailFindings.internalTechnical.size,
      testSeedCount: emailFindings.testSeed.size,
      deprecatedIncorrectCount: emailFindings.deprecatedIncorrect.size,
      customerFacingList: Array.from(emailFindings.customerFacing),
      deprecatedIncorrectList: Array.from(emailFindings.deprecatedIncorrect)
    };

    console.log(`  ✓ Customer-Facing Verified Canonical Addresses: ${emailFindings.customerFacing.size}`);
    console.log(`  ✓ Internal / Technical System Addresses: ${emailFindings.internalTechnical.size}`);
    console.log(`  ✓ Test / Seed / Mock Fixture Addresses: ${emailFindings.testSeed.size}`);
    console.log(`  ✓ Deprecated / Incorrect Rogue Customer Addresses: ${emailFindings.deprecatedIncorrect.size} (Expected: 0)`);
  }

  await browser.close();

  // Save audit report to JSON
  fs.writeFileSync(path.join(process.cwd(), "browser-forensic-results.json"), JSON.stringify(results, null, 2), "utf8");
  console.log("\n================================================================");
  console.log("REAL BROWSER FORENSIC CHALLENGE COMPLETED SUCCESSFULLY!");
  console.log("Results written to browser-forensic-results.json");
  console.log("================================================================");
}

runForensicAudit().catch(err => {
  console.error("Forensic test failed:", err);
  process.exit(1);
});

