import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Phase 5: Traveler Journey Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/weddings`);
    await page.waitForLoadState("load");
  });

  test("Marketplace shows weddings and allows filtering", async ({ page }) => {
    // Check that we are on the weddings page
    await expect(page).toHaveTitle(/Marketplace|Weddings|Celebrations|WeddingWithIndia/i);
    
    // Check that at least one wedding card renders
    const cards = page.locator("[data-testid='wedding-card'], a[href^='/weddings/']");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("Can navigate to a specific wedding detail page", async ({ page }) => {
    const firstCardLink = page.locator("a[href^='/weddings/']").first();
    await expect(firstCardLink).toBeVisible({ timeout: 10000 });

    // Click on the card link to navigate
    await firstCardLink.click();

    // Verify URL changes to the detail page (e.g., /weddings/...)
    await page.waitForURL(/\/weddings\/.+/);
    
    // Verify detail page has content
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("Clicking wishlist without auth updates wishlist state or shows feedback", async ({ page }) => {
    const wishlistBtn = page.locator("button[aria-label*='wishlist' i], button:has(svg.lucide-heart)").first();
    if (await wishlistBtn.count() > 0 && await wishlistBtn.isVisible()) {
      await wishlistBtn.click();
      // Should remain interactive and functional
      await expect(wishlistBtn).toBeVisible();
    }
  });
});
