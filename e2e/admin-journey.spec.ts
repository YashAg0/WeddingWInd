import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Phase 8: Admin Dashboards Verification", () => {
  test("Unauthorized users cannot access /dashboard/admin", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin`);
    await page.waitForLoadState("load");
    
    // Clerk should intercept and redirect to sign-in or return 404 depending on configuration
    // Often it redirects to sign-in or accounts.clerk.com
    await expect(page).toHaveURL(/sign-in|login/i);
  });
});
