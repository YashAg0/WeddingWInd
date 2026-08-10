import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Phase 4: Authentication Verification", () => {
  
  test("Unauthorized users cannot access protected pages", async ({ page }) => {
    // Attempting to visit /dashboard should redirect to clerk sign-in
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState("load");

    // Clerk redirect adds ?redirect_url= or sends to accounts.clerk.com depending on config
    // In dev, usually redirects to sign-in path
    await expect(page).toHaveURL(/sign-in|login/i);
  });

  test("Login routing correctly redirects to Clerk sign-in", async ({ page }) => {
    // Navigating to /login (which is usually a clerk route or page)
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("load");
    
    // Check if the URL contains sign-in or we see the clerk sign-in component
    await expect(page).toHaveURL(/sign-in|login/i);
    // Looking for Clerk's standard sign-in heading or a specific header
    const signInHeader = page.locator("h1", { hasText: /Sign in/i }).first();
    await expect(signInHeader).toBeVisible();
  });

  test("Sign-up routing correctly redirects to Clerk sign-up", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState("load");

    // Check if we hit sign-up route
    await expect(page).toHaveURL(/sign-up|signup/i);
    // Looking for Clerk's standard sign-up heading
    const signUpHeader = page.locator("h1", { hasText: /Create your account/i }).first();
    await expect(signUpHeader).toBeVisible();
  });

});
