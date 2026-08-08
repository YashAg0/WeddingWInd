import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Phase 7: Agent Journey Verification", () => {
  test("Agent landing page (/for-agents) renders correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/for-agents`);
    await page.waitForLoadState("load");
    
    // Check title or main heading related to agents
    const heading = page.locator("h1");
    await expect(heading).toContainText(/Commissions|Agent|Partner|Travel/i);
    
    // Verify a CTA exists for applying/contacting
    const applyBtn = page.locator("a, button").filter({ hasText: /Agent|Application/i }).first();
    await expect(applyBtn).toBeVisible();
  });
});
