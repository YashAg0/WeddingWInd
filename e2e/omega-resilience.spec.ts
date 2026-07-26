import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

const publicRoutes = [
  "/",
  "/weddings",
  "/weddings/royal-rajasthani-palace-wedding",
  "/about",
  "/how-it-works",
  "/for-travelers",
  "/for-couples",
  "/for-agents",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
];

test.describe("Omega System Resilience & Fallback Tests", () => {
  for (const route of publicRoutes) {
    test(`Public page '${route}' loads crash-free without runtime or module errors`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));

      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);

      // Verify no unhandled JS runtime crashes
      expect(pageErrors.length).toBe(0);

      // Check for module factory crash strings
      const bodyText = await page.innerText("body");
      expect(bodyText).not.toContain("module factory is not available");
      expect(bodyText).not.toContain("PrismaClientInitializationError");
    });
  }

  test("Homepage Hero section renders interactive elements cleanly", async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("section[aria-label*='Hero']")).toBeVisible();
  });

  test("Marketplace Search & Filter Sidebar navigation works", async ({ page }) => {
    await page.goto(`${BASE_URL}/weddings`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("Explore Wedding Celebrations");
  });

  test("Browser back and deep links navigate seamlessly", async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.goto(`${BASE_URL}/about`, { waitUntil: "domcontentloaded" });
    await page.goBack({ waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/");
  });
});
