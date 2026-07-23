const { chromium } = require("playwright");
const fs = require("fs");

const baseUrl = process.env.BROWSER_AUDIT_BASE_URL ?? "http://127.0.0.1:3000";
const routes = process.env.BROWSER_AUDIT_ROUTES?.split(",") ?? [
  "/",
  "/weddings",
  "/weddings/grand-maharaja-wedding",
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const failedRequests = [];
  const routeResults = [];

  for (const route of routes) {
    const page = await browser.newPage();
    page.on("pageerror", (error) => errors.push(`Page error on ${route}: ${error.message}`));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        !message.text().startsWith("Failed to load resource")
      ) {
        errors.push(`Console error on ${route}: ${message.text()}`);
      }
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        errors.push(`HTTP ${response.status()} on ${route}: ${response.url()}`);
      }
    });
    page.on("requestfailed", (request) =>
      request.failure()?.errorText !== "net::ERR_ABORTED" &&
        failedRequests.push(`${route}: ${request.url()} - ${request.failure()?.errorText ?? "Unknown failure"}`),
    );

    try {
      const response = await page.goto(`${baseUrl}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      await page.waitForTimeout(1_500);
      const result = {
        route,
        status: response?.status() ?? null,
        title: await page.title(),
      };
      routeResults.push(result);
      console.log(`${result.route}: ${result.status} - ${result.title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Navigation error on ${route}: ${message}`);
      routeResults.push({ route, status: null, title: null });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  const report = { baseUrl, routeResults, errors, failedRequests };
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
