const { chromium } = require("playwright");
const fs = require("fs");

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3005";

const ROUTES = [
  "/",
  "/weddings",
  "/destinations/rajasthan",
  "/how-it-works",
  "/about",
  "/contact",
  "/safety",
  "/weddings/royal-rajasthani-palace-wedding"
];

async function profileRoute(browser, route) {
  const context = await browser.newContext();
  const page = await context.newPage();

  const networkRequests = [];
  page.on("response", (res) => {
    try {
      const req = res.request();
      const url = req.url();
      const headers = res.headers();
      const contentType = headers["content-type"] || "";
      const contentLength = parseInt(headers["content-length"] || "0", 10);
      networkRequests.push({
        url,
        status: res.status(),
        contentType,
        resourceType: req.resourceType(),
        size: contentLength
      });
    } catch (_) {}
  });

  const startNav = Date.now();
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "commit", timeout: 20000 });
  try {
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
  } catch (_) {}
  await page.waitForTimeout(600);
  const navDuration = Date.now() - startNav;

  const perfMetrics = await page.evaluate(() => {
    const navEntry = performance.getEntriesByType("navigation")[0];
    const paintEntries = performance.getEntriesByType("paint") || [];
    const fcpEntry = paintEntries.find(e => e.name === "first-contentful-paint");
    const fpEntry = paintEntries.find(e => e.name === "first-paint");

    const resEntries = performance.getEntriesByType("resource") || [];

    let ttfb = 0;
    let domLoaded = 0;
    let duration = 0;
    if (navEntry) {
      ttfb = navEntry.responseStart - navEntry.requestStart;
      domLoaded = navEntry.domContentLoadedEventEnd - navEntry.startTime;
      duration = navEntry.duration;
    }

    const resources = resEntries.map(r => ({
      name: r.name,
      initiatorType: r.initiatorType,
      duration: Math.round(r.duration),
      transferSize: r.transferSize || 0,
      decodedBodySize: r.decodedBodySize || 0
    }));

    return {
      ttfb: Math.round(ttfb),
      fcp: Math.round(fcpEntry ? fcpEntry.startTime : 0),
      fp: Math.round(fpEntry ? fpEntry.startTime : 0),
      domLoaded: Math.round(domLoaded),
      duration: Math.round(duration),
      resources
    };
  });

  let jsTransferSize = 0;
  let cssTransferSize = 0;
  let imgTransferSize = 0;
  let fontTransferSize = 0;
  let totalTransferSize = 0;

  for (const r of perfMetrics.resources) {
    totalTransferSize += r.transferSize;
    if (r.initiatorType === "script" || r.name.endsWith(".js") || r.name.includes("/chunks/") || r.name.includes("clerk")) {
      jsTransferSize += r.transferSize;
    } else if (r.initiatorType === "css" || r.initiatorType === "link" || r.name.endsWith(".css")) {
      cssTransferSize += r.transferSize;
    } else if (r.initiatorType === "img" || /\.(png|jpg|jpeg|webp|avif|svg)/i.test(r.name)) {
      imgTransferSize += r.transferSize;
    } else if (/\.(woff|woff2|ttf)/i.test(r.name) || r.initiatorType === "font") {
      fontTransferSize += r.transferSize;
    }
  }

  // If transferSize is 0 (e.g. CORS or mock), calculate from networkRequests
  if (totalTransferSize === 0) {
    for (const req of networkRequests) {
      totalTransferSize += req.size;
      if (req.resourceType === "script" || req.contentType.includes("javascript")) jsTransferSize += req.size;
      else if (req.resourceType === "stylesheet" || req.contentType.includes("css")) cssTransferSize += req.size;
      else if (req.resourceType === "image" || req.contentType.includes("image")) imgTransferSize += req.size;
      else if (req.resourceType === "font" || req.contentType.includes("font")) fontTransferSize += req.size;
    }
  }

  const topJsChunks = perfMetrics.resources
    .filter(r => r.initiatorType === "script" || r.name.endsWith(".js") || r.name.includes("/chunks/"))
    .sort((a, b) => b.transferSize - a.transferSize)
    .slice(0, 5)
    .map(r => ({
      name: r.name.split("/").pop().split("?")[0],
      sizeKb: (r.transferSize / 1024).toFixed(1),
      durationMs: r.duration
    }));

  await context.close();

  return {
    route,
    navDuration,
    fcp: perfMetrics.fcp,
    fp: perfMetrics.fp,
    ttfb: perfMetrics.ttfb,
    domLoaded: perfMetrics.domLoaded,
    requestsCount: networkRequests.length,
    jsTransferKb: (jsTransferSize / 1024).toFixed(1),
    cssTransferKb: (cssTransferSize / 1024).toFixed(1),
    imgTransferKb: (imgTransferSize / 1024).toFixed(1),
    fontTransferKb: (fontTransferSize / 1024).toFixed(1),
    totalTransferKb: (totalTransferSize / 1024).toFixed(1),
    topJsChunks
  };
}

async function runProfiler() {
  console.log("================================================================");
  console.log("STARTING DEEP PERFORMANCE PROFILING AGAINST PRODUCTION BUILD");
  console.log(`Server: ${BASE_URL}`);
  console.log("================================================================\n");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });

  const profileResults = [];
  for (const route of ROUTES) {
    try {
      const res = await profileRoute(browser, route);
      profileResults.push(res);
      console.log(`  ✓ ${route.padEnd(42)} | FCP: ${res.fcp}ms | TTFB: ${res.ttfb}ms | JS: ${res.jsTransferKb}KB | Total: ${res.totalTransferKb}KB | Requests: ${res.requestsCount}`);
      if (res.topJsChunks.length > 0) {
        console.log(`    Top JS chunks: ${res.topJsChunks.map(c => `${c.name} (${c.sizeKb}KB)`).join(", ")}`);
      }
    } catch (err) {
      console.error(`  ✗ Error profiling ${route}:`, err.message);
    }
  }

  await browser.close();

  fs.writeFileSync("deep-performance-profile.json", JSON.stringify(profileResults, null, 2));
  console.log("\nDeep performance profile written to deep-performance-profile.json");
}

runProfiler().catch(console.error);
