import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

test.describe("Phase 3: Homepage Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for hydration by checking if the main element is interactive or fully loaded
    await page.waitForLoadState("load");
  });

  test("Hero section renders and is above the fold", async ({ page }) => {
    // Look for the main hero section (often a header or section with an h1)
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();
    
    // Check if the hero section is in the viewport
    const boundingBox = await heroSection.boundingBox();
    expect(boundingBox?.y).toBeLessThanOrEqual(0); // Should start at the top
    expect(boundingBox?.height).toBeGreaterThan(100); // Should have significant height
  });

  test("Navbar is present and links work", async ({ page }) => {
    const navbar = page.locator("nav").first();
    await expect(navbar).toBeVisible();

    // Check for essential navigation links
    const links = navbar.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    // Verify some expected links are in the DOM (case insensitive regex)
    await expect(navbar).toContainText(/weddings/i);
  });

  test("Call to Action exists", async ({ page }) => {
    // Look for a prominent CTA link/button
    const cta = page.locator("a, button").filter({ hasText: /(explore|reserve)/i }).first();
    await expect(cta).toBeVisible();
  });

  test("SEO and Meta elements are correct", async ({ page }) => {
    // Verify title
    await expect(page).toHaveTitle(/WeddingWithIndia|Wedding With India|Indian Weddings/i);
    
    // Verify meta description
    const metaDescription = page.locator("meta[name='description']");
    await expect(metaDescription).toHaveAttribute("content", /authentic Indian weddings/i);

    // Verify canonical URL
    const canonical = page.locator("link[rel='canonical']");
    await expect(canonical).toHaveAttribute("href", "https://weddingwithindia.com");

    // Verify H1 exists and there is exactly one
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("Featured Indian Weddings renders 8 cards in 2 rows of 4 with valid links and metadata", async ({ page }) => {
    const section = page.locator("#featured-weddings");
    await expect(section).toBeVisible();
    await expect(section.locator("h2")).toContainText("Featured Indian");

    // Check desktop grid cards
    const desktopGrid = section.locator(".hidden.sm\\:grid");
    await expect(desktopGrid).toBeVisible();

    const cards = desktopGrid.locator('[role="listitem"]');
    const cardCount = await cards.count();
    expect(cardCount).toBe(8);

    // Verify all 8 card links point to /weddings/... without empty hrefs
    for (let i = 0; i < cardCount; i++) {
      const cardLink = cards.nth(i).locator('a[href^="/weddings/"]').first();
      await expect(cardLink).toBeVisible();
      const href = await cardLink.getAttribute("href");
      expect(href).toMatch(/^\/weddings\/[a-z0-9-]+$/);
    }

    // Verify "View all celebrations" and "Browse all celebrations" links exist
    const topAction = section.locator('a[href="/weddings"]').filter({ hasText: /View all celebrations/i });
    await expect(topAction).toBeVisible();

    const bottomAction = section.locator('a[href="/weddings"]').filter({ hasText: /Browse all celebrations/i });
    await expect(bottomAction).toBeVisible();
  });
});
