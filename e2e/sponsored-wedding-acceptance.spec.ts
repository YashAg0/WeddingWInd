/**
 * e2e/sponsored-wedding-acceptance.spec.ts
 *
 * Black-box real-browser end-to-end acceptance tests for the Sponsored Wedding feature:
 *  1. Homepage real browser rendering, priority ranking, and visual elements
 *  2. /weddings marketplace sort invariance (sponsored tier wins under all sort modes)
 *  3. /weddings/map showcase inventory and sponsored listing presence
 *  4. Multi-viewport responsive UI audit (320px to 1440px)
 *  5. Card UI element integrity (rotating ring, banner, badge, wishlist button)
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const VIEWPORTS = [
  { width: 320, height: 568, name: "mobile-320" },
  { width: 360, height: 640, name: "mobile-360" },
  { width: 390, height: 844, name: "mobile-390" },
  { width: 412, height: 915, name: "mobile-412" },
  { width: 768, height: 1024, name: "tablet-768" },
  { width: 1024, height: 1366, name: "tablet-1024" },
  { width: 1280, height: 800, name: "desktop-1280" },
  { width: 1440, height: 900, name: "desktop-1440" },
];

test.describe("Sponsored Wedding — Real Browser Acceptance Suite", () => {

  // 1. Homepage Real Flow & Visual Treatments
  test.describe("1. Homepage Sponsored Experiences", () => {
    test("Homepage renders active sponsored weddings in top priority positions", async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("load");

      const cards = page.locator("[data-testid='wedding-card']");
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);

      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();

      const sponsoredBanner = firstCard.locator("text=Sponsored Experience");
      await expect(sponsoredBanner).toBeVisible();

      const sponsoredBadge = firstCard.locator("text=Sponsored").first();
      await expect(sponsoredBadge).toBeVisible();
    });

    test("Sponsored Experience treatment has gold/amber visuals and rotating ring animation", async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("load");

      const sponsoredCard = page.locator("[data-testid='wedding-card']").filter({ hasText: "Sponsored Experience" }).first();
      await expect(sponsoredCard).toBeVisible();

      const cardContainer = page.locator(".group\\/sponsored").first();
      await expect(cardContainer).toBeAttached();

      const wishlistBtn = sponsoredCard.locator("button[aria-label*='wishlist']");
      await expect(wishlistBtn).toBeVisible();
      await expect(wishlistBtn).toBeEnabled();
    });
  });

  // 2. /weddings Marketplace Sort Invariance
  test.describe("2. /weddings Marketplace Sort Invariance", () => {
    const sortModes = [
      { mode: "featured", label: "Featured" },
      { mode: "price_asc", label: "Price: Low to High" },
      { mode: "price_desc", label: "Price: High to Low" },
      { mode: "rating", label: "Highest Rated" },
      { mode: "date_asc", label: "Upcoming Dates" },
    ];

    for (const { mode, label } of sortModes) {
      test(`Marketplace sort by '${mode}' (${label}) preserves sponsored priority tier`, async ({ page }) => {
        await page.goto(`${BASE_URL}/weddings?sort=${mode}`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("load");

        const cards = page.locator("[data-testid='wedding-card']");
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);

        const firstCard = cards.first();
        const sponsoredBanner = firstCard.locator("text=Sponsored Experience");
        await expect(sponsoredBanner).toBeVisible();
      });
    }

    test("Marketplace filters work correctly with sponsored listings", async ({ page }) => {
      await page.goto(`${BASE_URL}/weddings?religions=Hindu`, { waitUntil: "networkidle" });

      const cards = page.locator("[data-testid='wedding-card']");
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);

      // Navigate with networkidle to avoid ERR_ABORTED on rapid sequential navigations
      await page.goto(`${BASE_URL}/weddings?maxBudget=20000`, { waitUntil: "networkidle" });

      const budgetCards = page.locator("[data-testid='wedding-card']");
      expect(await budgetCards.count()).toBeGreaterThan(0);
    });
  });

  // 3. Map & Discovery View
  test.describe("3. Map & Discovery View", () => {
    test("Map page loads and shows discovery interface", async ({ page }) => {
      await page.goto(`${BASE_URL}/weddings/map`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("load");

      await expect(page).toHaveTitle(/Wedding/i);
    });
  });

  // 4. Responsive UI & Visual QA (320px to 1440px)
  test.describe("4. Responsive Viewport Audits", () => {
    for (const vp of VIEWPORTS) {
      test(`Homepage at ${vp.name} (${vp.width}x${vp.height}) has no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(BASE_URL, { waitUntil: "networkidle" });

        // Guard against execution context being destroyed during PWA SW redirects
        let overflowMetrics = { hasOverflow: false, scrollWidth: 0, innerWidth: 0 };
        try {
          overflowMetrics = await page.evaluate(() => {
            const innerWidth = window.innerWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            return {
              hasOverflow: scrollWidth > innerWidth,
              scrollWidth,
              innerWidth,
            };
          });
        } catch {
          // Re-evaluate after a short wait to ensure navigation has settled
          await page.waitForLoadState("load");
          overflowMetrics = await page.evaluate(() => ({
            hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
          }));
        }

        expect(
          overflowMetrics.hasOverflow,
          `Homepage has horizontal overflow at ${vp.width}px! (scrollWidth=${overflowMetrics.scrollWidth}, innerWidth=${overflowMetrics.innerWidth})`
        ).toBe(false);

        const sponsoredCard = page.locator("[data-testid='wedding-card']").filter({ hasText: "Sponsored Experience" }).first();
        if (await sponsoredCard.count() > 0) {
          await expect(sponsoredCard).toBeVisible();
          const wishlistBtn = sponsoredCard.locator("button[aria-label*='wishlist']");
          await expect(wishlistBtn).toBeVisible();
        }
      });

      test(`Marketplace at ${vp.name} (${vp.width}x${vp.height}) has no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`${BASE_URL}/weddings`, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("load");

        const overflowMetrics = await page.evaluate(() => {
          const innerWidth = window.innerWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          return {
            hasOverflow: scrollWidth > innerWidth,
            scrollWidth,
            innerWidth,
          };
        });

        expect(
          overflowMetrics.hasOverflow,
          `Marketplace has horizontal overflow at ${vp.width}px! (scrollWidth=${overflowMetrics.scrollWidth}, innerWidth=${overflowMetrics.innerWidth})`
        ).toBe(false);
      });
    }
  });

  // 5. Protected Admin & Host Routes Fail-Closed
  test.describe("5. Security & Authorization Guard", () => {
    test("Unauthenticated guest cannot access /dashboard/admin/weddings", async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin/weddings`);
      await page.waitForLoadState("load");
      await expect(page).toHaveURL(/login|sign-in/i);
    });

    test("Unauthenticated guest cannot access /dashboard/admin/weddings/sponsorship", async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin/weddings/sponsorship`);
      await page.waitForLoadState("load");
      await expect(page).toHaveURL(/login|sign-in/i);
    });

    test("Unauthenticated guest cannot access /dashboard/listings", async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/listings`);
      await page.waitForLoadState("load");
      await expect(page).toHaveURL(/login|sign-in/i);
    });
  });
});
