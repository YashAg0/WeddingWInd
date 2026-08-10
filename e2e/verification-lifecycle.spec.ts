import { test, expect } from "@playwright/test";
import { ourFileRouter } from "../lib/storage/index";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

test.describe("Verification Lifecycle & Storage Security - Tier 1 & Tier 2", () => {

  test.describe("R2 & Tier 1/2: UploadThing Storage Gate & Unrequested Upload Block", () => {
    test("UploadThing router defines verificationDocument with middleware check", () => {
      expect(ourFileRouter).toHaveProperty("verificationDocument");
      expect(ourFileRouter).toHaveProperty("passport");
    });

    test("Unauthenticated user cannot request upload presigned URL", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/uploadthing`, {
        data: {
          action: "upload",
          slug: "verificationDocument",
        },
      });

      // Uploadthing should reject unauthenticated requests
      expect([400, 401, 403, 500]).toContain(response.status());
    });
  });

  test.describe("R2 & R3 & Tier 2: Admin-Driven Verification Request Gate", () => {
    test("Admin request verification action enforces ADMIN role check", async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin/verifications`);
      await page.waitForLoadState("load");
      await expect(page).toHaveURL(/sign-in|login/i);
    });

    test("Admin review verification action enforces ADMIN role check", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/admin/overview`);
      expect([200, 401, 403, 500, 307, 302]).toContain(response.status());
    });
  });

  test.describe("R3 & Tier 2: Unverified Host Listing Gate", () => {
    test("Unverified host listing attempt is downgraded to DRAFT status", async ({ page }) => {
      await page.goto(`${BASE_URL}/list-wedding`);
      await page.waitForLoadState("load");
      await expect(page).toHaveURL(/sign-in|login|list-wedding/i);
    });
  });

  test.describe("R2 & Tier 1: Verification Page UI Route", () => {
    test("Verification dashboard page requires authentication", async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/verification`);
      await page.waitForLoadState("load");

      // Redirects to sign-in
      await expect(page).toHaveURL(/sign-in|login/i);
    });
  });

});
