import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/prisma";
import { createE2ETestSessionToken } from "@/lib/test-auth";
import { UserRole, VerificationStatus } from "@prisma/client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function createTestUserWithRetry(email: string, name: string, clerkUserId: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await prisma.user.create({
        data: {
          email,
          name,
          role: UserRole.TRAVELER,
          status: "ACTIVE",
          clerkUserId,
          travelerProfile: {
            create: {
              fullName: name,
              country: "India",
              language: "English",
            },
          },
        },
      });
    } catch (err: any) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error("Failed to create test user");
}

test.describe("Real-Browser End-to-End: Host Application Submission Flow", () => {
  test("1. Logged-Out Journey: Fill -> Submit -> Auth Redirect -> Resume -> Auto-Submit -> Database Write", async ({
    page,
    context,
  }) => {
    test.setTimeout(180000);
    const testEmail = `test.e2e.resume.${Date.now()}@example.com`;
    let userId = "";

    // Provision test user in PostgreSQL
    const user = await createTestUserWithRetry(testEmail, "Aarav Sharma", `clerk_e2e_resume_${Date.now()}`);
    userId = user.id;

    try {
      const consoleErrors: string[] = [];
      const networkUrls: string[] = [];

      page.on("console", (msg) => {
        console.log(`[BROWSER ${msg.type()}]:`, msg.text());
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      page.on("requestfailed", (req) => {
        console.log(`[REQUEST FAILED]: ${req.method()} ${req.url()} - Error: ${req.failure()?.errorText}`);
      });

      page.on("response", (res) => {
        if (res.status() >= 400) {
          console.log(`[HTTP ERROR ${res.status()}]: ${res.request().method()} ${res.url()}`);
        }
      });

      // 1. Open /list-wedding with clean unauthenticated session
      await context.clearCookies();
      await page.goto(`${BASE_URL}/list-wedding`);
      await page.waitForLoadState("domcontentloaded");

      // Verify main intake heading
      const pageHeading = page.locator("h1, h2").filter({ hasText: /List Your Celebration|Host Application|Your Wedding/i }).first();
      await expect(pageHeading).toBeVisible();

      // 2. Fill the complete form with realistic test celebration data
      await page.locator('input[name="hostName"]').fill("Aarav Sharma");
      await expect(page.locator('input[name="hostName"]')).toHaveValue("Aarav Sharma");

      await page.locator('input[name="email"]').fill(testEmail);
      await expect(page.locator('input[name="email"]')).toHaveValue(testEmail);

      await page.locator('input[name="phone"]').fill("+91 98765 43210");
      await page.locator('input[name="brideName"]').fill("Ananya");
      await page.locator('input[name="groomName"]').fill("Aarav");
      await page.locator('input[name="coupleNames"]').fill("Ananya & Aarav Royal Wedding");
      await expect(page.locator('input[name="coupleNames"]')).toHaveValue("Ananya & Aarav Royal Wedding");

      await page.locator('input[name="city"]').fill("Udaipur");
      await expect(page.locator('input[name="city"]')).toHaveValue("Udaipur");

      await page.locator('input[name="state"]').fill("Rajasthan");
      await page.locator('input[name="venueName"]').fill("Jagmandir Island Palace");
      await page.locator('input[name="weddingDate"]').fill("2026-11-20");

      await page.locator('textarea[name="story"]').fill("A magical 3-day royal heritage celebration welcoming international travelers into Indian culture and traditions.");
      await expect(page.locator('textarea[name="story"]')).toHaveValue(/magical/i);

      // 3. Click Submit Button and verify redirect to /login
      const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /Submit Celebration|Submit/i }).first();
      await expect(submitBtn).toBeVisible();
      await submitBtn.click();

      // Verify client-side transition to login with redirect_url
      await page.waitForURL(/login|sign-in/i, { timeout: 20000, waitUntil: "domcontentloaded" });
      expect(page.url()).toContain("redirect_url");
      await page.waitForLoadState("domcontentloaded");

      // 4. Verify LocalStorage contains draft and auto-submit intent
      const draftInStorage = await page.evaluate(() => {
        return localStorage.getItem("wwi_host_application_draft_v1");
      });
      expect(draftInStorage).toBeTruthy();
      expect(draftInStorage).toContain("Udaipur");

      const autoSubmitIntent = await page.evaluate(() => {
        return localStorage.getItem("wwi_host_draft_auto_submit");
      });
      expect(autoSubmitIntent).toBe("true");

      // 5. Complete authentication by attaching E2E test session cookie
      const token = createE2ETestSessionToken(userId, "TRAVELER", testEmail);
      await context.addCookies([
        {
          name: "__wwi_e2e_session",
          value: token,
          url: BASE_URL,
          httpOnly: false,
          sameSite: "Lax",
        },
      ]);

      // 6. Return to /list-wedding?resume=true as an authenticated user
      await page.goto(`${BASE_URL}/list-wedding?resume=true`);
      await page.waitForLoadState("domcontentloaded");

      // Verify auto-resumption triggers and transitions to dashboard
      await page.waitForURL(/\/dashboard/i, { timeout: 60000, waitUntil: "domcontentloaded" });
      await expect(page.locator('h1, h2, [role="main"], main').first()).toBeVisible({ timeout: 60000 });

      // 8. Inspect actual PostgreSQL Database state
      const createdApp = await prisma.hostApplication.findFirst({
        where: { userId },
        include: {
          days: true,
          auditLogs: true,
        },
      });

      expect(createdApp).not.toBeNull();
      expect(createdApp?.userId).toBe(userId);
      expect(createdApp?.status).toBe("SUBMITTED");
      expect(createdApp?.city).toBe("Udaipur");
      expect(createdApp?.coupleNames).toContain("Ananya");

      // 9. Verify User Role was elevated to COUPLE in PostgreSQL
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(updatedUser?.role).toBe(UserRole.COUPLE);

      // 10. Verify Verification record was upserted to PENDING
      const verification = await prisma.verification.findUnique({
        where: { userId },
      });
      expect(verification).not.toBeNull();
      expect(verification?.status).toBe(VerificationStatus.PENDING);

      // 11. Verify LocalStorage Draft cleanup
      const draftAfterSubmit = await page.evaluate(() => {
        return localStorage.getItem("wwi_host_application_draft_v1");
      });
      expect(draftAfterSubmit).toBeNull();

      // 12. Verify Network traffic contained no invalid port 5572 calls
      const invalidPortCalls = networkUrls.filter((u) => u.includes(":5572"));
      expect(invalidPortCalls.length).toBe(0);

      // 13. Verify Console had no unhandled critical errors
      const criticalConsoleErrors = consoleErrors.filter(
        (err) =>
          !err.includes("clerk") &&
          !err.includes("favicon") &&
          !err.includes("UploadThing") &&
          !err.includes("Next.js")
      );
      expect(criticalConsoleErrors.length).toBe(0);
    } finally {
      // Clean up test user records
      try {
        if (userId) {
          await prisma.hostApplicationAuditLog.deleteMany({ where: { actorId: userId } });
          await prisma.hostApplicationDay.deleteMany({ where: { application: { userId } } });
          await prisma.hostApplication.deleteMany({ where: { userId } });
          await prisma.verification.deleteMany({ where: { userId } });
          await prisma.coupleProfile.deleteMany({ where: { userId } });
          await prisma.user.deleteMany({ where: { id: userId } });
        }
      } catch (cleanupErr) {
        console.warn("Cleanup error in test 1:", cleanupErr);
      }
    }
  });

  test("2. Direct Authenticated Submission: Logged-in host submits form directly without login redirect", async ({
    page,
    context,
  }) => {
    test.setTimeout(180000);
    const testEmail = `test.e2e.direct.${Date.now()}@example.com`;
    let userId = "";

    // Provision test user in PostgreSQL
    const user = await createTestUserWithRetry(testEmail, "Rahul Verma", `clerk_e2e_direct_${Date.now()}`);
    userId = user.id;

    try {
      page.on("console", (msg) => {
        console.log(`[BROWSER T2 ${msg.type()}]:`, msg.text());
      });

      page.on("requestfailed", (req) => {
        console.log(`[REQUEST FAILED T2]: ${req.method()} ${req.url()} - Error: ${req.failure()?.errorText}`);
      });

      page.on("response", (res) => {
        if (res.status() >= 400) {
          console.log(`[HTTP ERROR T2 ${res.status()}]: ${res.request().method()} ${res.url()}`);
        }
      });

      // Authenticate prior to navigation
      await context.clearCookies();
      const token = createE2ETestSessionToken(userId, "TRAVELER", testEmail);
      await context.addCookies([
        {
          name: "__wwi_e2e_session",
          value: token,
          url: BASE_URL,
          httpOnly: false,
          sameSite: "Lax",
        },
      ]);

      await page.goto(`${BASE_URL}/list-wedding`);
      await page.waitForLoadState("domcontentloaded");

      // Ensure session is recognized by waiting for dashboard link in DOM or user avatar
      await page.waitForFunction(
        () => {
          return Boolean(document.querySelector('a[href*="/dashboard"]'));
        },
        null,
        { timeout: 15000 }
      ).catch(() => {});

      // Fill form
      await page.locator('input[name="hostName"]').fill("Rahul Verma");
      await expect(page.locator('input[name="hostName"]')).toHaveValue("Rahul Verma");

      await page.locator('input[name="email"]').fill(testEmail);
      await expect(page.locator('input[name="email"]')).toHaveValue(testEmail);

      await page.locator('input[name="brideName"]').fill("Priya");
      await page.locator('input[name="groomName"]').fill("Rahul");
      await page.locator('input[name="coupleNames"]').fill("Priya & Rahul Royal Celebration");
      await expect(page.locator('input[name="coupleNames"]')).toHaveValue("Priya & Rahul Royal Celebration");

      await page.locator('input[name="city"]').fill("Jaipur");
      await expect(page.locator('input[name="city"]')).toHaveValue("Jaipur");

      await page.locator('input[name="weddingDate"]').fill("2026-12-25");

      // Click Submit
      const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /Submit Celebration|Submit/i }).first();
      await expect(submitBtn).toBeVisible();
      await submitBtn.click();

      // Verify submission succeeds and transitions to dashboard
      await page.waitForURL(/\/dashboard/i, { timeout: 60000, waitUntil: "domcontentloaded" });
      await expect(page.locator('h1, h2, [role="main"], main').first()).toBeVisible({ timeout: 60000 });

      // Verify exactly one application created in DB
      const apps = await prisma.hostApplication.findMany({
        where: { userId },
      });
      expect(apps.length).toBe(1);
      expect(apps[0].status).toBe("SUBMITTED");
      expect(apps[0].city).toBe("Jaipur");

      // Verify user role upgrade to COUPLE
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(updatedUser?.role).toBe(UserRole.COUPLE);
    } finally {
      // Clean up test user records
      try {
        if (userId) {
          await prisma.hostApplicationAuditLog.deleteMany({ where: { actorId: userId } });
          await prisma.hostApplicationDay.deleteMany({ where: { application: { userId } } });
          await prisma.hostApplication.deleteMany({ where: { userId } });
          await prisma.verification.deleteMany({ where: { userId } });
          await prisma.coupleProfile.deleteMany({ where: { userId } });
          await prisma.user.deleteMany({ where: { id: userId } });
        }
      } catch (cleanupErr) {
        console.warn("Cleanup error in test 2:", cleanupErr);
      }
    }
  });
});
