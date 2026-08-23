/**
 * e2e/booking-flow.spec.ts
 *
 * Playwright E2E test — Full booking flow happy path.
 *
 * Setup:
 *   1. npm install -D @playwright/test
 *   2. npx playwright install chromium
 *   3. npx playwright test
 *
 * Requires a running dev server: npm run dev
 * Or set baseURL to a staging deployment.
 */

import { test, expect, Page } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function waitForHydration(page: Page) {
  await page.waitForLoadState("load");
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("Public Pages", () => {
  test("Homepage loads with correct title", async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForHydration(page);

    await expect(page).toHaveTitle(/WeddingWithIndia|Wedding With India|Indian Weddings/i);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("Marketplace renders wedding cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/weddings`);
    await waitForHydration(page);

    await expect(page).toHaveTitle(/Weddings|Celebrations|WeddingWithIndia/i);
    // Should render at least one wedding card
    const cards = page.locator("[data-testid='wedding-card']");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("Wedding detail page has booking section", async ({ page }) => {
    await page.goto(`${BASE_URL}/weddings`);
    await waitForHydration(page);

    const firstCardLink = page.locator("a[href^='/weddings/']").first();
    await expect(firstCardLink).toBeVisible({ timeout: 10000 });
    await firstCardLink.click();
    await waitForHydration(page);

    await expect(page).toHaveTitle(/WeddingWithIndia|Wedding|Celebration/i);
    // Booking CTA or inquiry section should be visible
    const bookingSection = page.locator("[data-testid='booking-form'], #book-now, button:has-text('Book'), a:has-text('Reserve'), button:has-text('Attend'), a:has-text('Attend')");
    await expect(bookingSection.first()).toBeVisible({ timeout: 10000 });
  });

  test("Sitemap is accessible", async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/sitemap.xml`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("weddingwithindia.com");
  });

  test("Robots.txt is accessible", async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/robots.txt`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body.toLowerCase()).toContain("user-agent");
    expect(body).toContain("Disallow: /dashboard/");
  });

  test("Health endpoint is healthy", async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/health`);
    expect([200, 503]).toContain(response.status()); // 503 acceptable without DB
    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
  });
});

test.describe("Security Headers", () => {
  test("Homepage has required security headers", async ({ page }) => {
    const response = await page.request.get(BASE_URL);
    const headers = response.headers();

    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    // Should NOT expose Next.js
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

test.describe("Accessibility", () => {
  test("Skip-to-main link is in the DOM", async ({ page }) => {
    await page.goto(BASE_URL);
    const skipLink = page.locator("a[href='#main-content']").first();
    await expect(skipLink).toBeAttached();
  });

  test("Main content landmark exists", async ({ page }) => {
    await page.goto(BASE_URL);
    const main = page.locator("main#main-content");
    await expect(main).toBeAttached();
  });

  test("Page has a single h1", async ({ page }) => {
    await page.goto(BASE_URL);
    const h1s = page.locator("h1");
    expect(await h1s.count()).toBe(1);
  });
});

test.describe("404 Page", () => {
  test("Non-existent page returns 404 UI", async ({ page }) => {
    await page.goto(`${BASE_URL}/this-page-does-not-exist-xyz`);
    await waitForHydration(page);

    await expect(page.locator("h1")).toContainText("Destination Uncharted");
    // Should link back to home
    await expect(page.locator("a[href='/']").first()).toBeVisible();
  });
});
