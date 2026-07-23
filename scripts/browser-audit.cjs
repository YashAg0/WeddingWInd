const { chromium } = require("playwright");
const fs = require("fs");
const baseUrl = process.env.BROWSER_AUDIT_BASE_URL ?? "http://127.0.0.1:3000";

const routes = [
  "/",
  "/weddings",
  "/weddings/grand-maharaja-wedding",
  "/this-page-does-not-exist-xyz",
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const failedRequests = [];

  page.on("pageerror", (error) => errors.push(`Page error: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`Console error: ${message.text()}`);
  });
  page.on("requestfailed", (request) =>
    failedRequests.push(`${request.url()} — ${request.failure()?.errorText ?? "Unknown failure"}`),
  );

  for (const route of routes) {
    const response = await page.goto(`${baseUrl}${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });
    await page.waitForTimeout(1_500);
    console.log(`${route}: ${response?.status() ?? "no response"} — ${await page.title()}`);
  }

  await browser.close();

  const report = { routes, errors, failedRequests };
  fs.mkdirSync("test-results", { recursive: true });
  fs.writeFileSync("test-results/browser-audit.json", JSON.stringify(report, null, 2));

  if (errors.length || failedRequests.length) {
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  } else {
    console.log("Browser audit completed with no console errors, page errors, or failed requests.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
