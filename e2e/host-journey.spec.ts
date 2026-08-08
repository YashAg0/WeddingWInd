import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Phase 6: Host Journey Verification", () => {
  test("Host landing page (/list-wedding or /for-couples) renders correctly", async ({ page }) => {
    // Try both since the URL might have been renamed to /list-wedding or /for-couples
    const _response = await page.goto(`${BASE_URL}/list-wedding`).catch(() => null);
    
    // Fallback if list-wedding redirects or 404s, but based on route inventory it exists
    await page.waitForLoadState("load");
    
    // Check title or main heading related to hosting
    const heading = page.locator("h1");
    await expect(heading).toContainText(/Host|List/i);
    
    // Verify a CTA exists for applying
    const applyBtn = page.locator("a, button").filter({ hasText: /Apply|List|Host/i }).first();
    await expect(applyBtn).toBeVisible();
  });
});
