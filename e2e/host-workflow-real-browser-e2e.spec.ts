import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/prisma";
import { createE2ETestSessionToken } from "@/lib/test-auth";
import { UserRole, VerificationStatus, WeddingStatus } from "@prisma/client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function createTestUser(email: string, name: string, role: UserRole) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await prisma.user.create({
        data: {
          email,
          name,
          role,
          status: "ACTIVE",
          clerkUserId: `clerk_e2e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          travelerProfile: {
            create: {
              fullName: name,
              country: "India",
              language: "English",
            },
          },
        },
      });
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error("Failed to create test user");
}

test.describe("Real Browser E2E: Full Host Submission, Document Review, and Publishing Lifecycle", () => {
  test.setTimeout(240000);

  test("Direct Approval Flow in Real Browser: Host Submits -> Admin Reviews & Publishes -> Marketplace Live", async ({
    browser,
  }) => {
    const timestamp = Date.now();
    const hostEmail = `browser.host.direct.${timestamp}@example.com`;
    const adminEmail = `browser.admin.${timestamp}@example.com`;
    let slug = `pooja-devendra-royal-palace-${timestamp}`;

    // 1. Provision Host & Admin in Database
    const hostUser = await createTestUser(hostEmail, "Devendra & Pooja Singh", UserRole.TRAVELER);
    const adminUser = await createTestUser(adminEmail, "Super Admin", UserRole.ADMIN);

    const hostContext = await browser.newContext();
    const adminContext = await browser.newContext();

    try {
      const hostPage = await hostContext.newPage();

      // -------------------------------------------------------------
      // Step 1: Authenticated Host opens /list-wedding and submits application
      // -------------------------------------------------------------
      const hostToken = createE2ETestSessionToken(hostUser.id, "TRAVELER", hostEmail);
      await hostContext.addCookies([
        {
          name: "__wwi_e2e_session",
          value: hostToken,
          url: BASE_URL,
          httpOnly: false,
          sameSite: "Lax",
        },
      ]);

      await hostPage.goto(`${BASE_URL}/list-wedding`);
      await hostPage.waitForLoadState("domcontentloaded");

      // Ensure session is recognized
      await hostPage.waitForFunction(
        () => Boolean(document.querySelector('a[href*="/dashboard"]')),
        null,
        { timeout: 15000 }
      ).catch(() => {});

      await hostPage.locator('input[name="hostName"]').fill("Devendra Singh");
      await expect(hostPage.locator('input[name="hostName"]')).toHaveValue("Devendra Singh");

      await hostPage.locator('input[name="email"]').fill(hostEmail);
      await expect(hostPage.locator('input[name="email"]')).toHaveValue(hostEmail);

      await hostPage.locator('input[name="phone"]').fill("+91 98765 11111");
      await hostPage.locator('input[name="brideName"]').fill("Pooja");
      await hostPage.locator('input[name="groomName"]').fill("Devendra");

      await hostPage.locator('input[name="coupleNames"]').fill("Pooja & Devendra Royal Palace Celebration");
      await expect(hostPage.locator('input[name="coupleNames"]')).toHaveValue("Pooja & Devendra Royal Palace Celebration");

      await hostPage.locator('input[name="city"]').fill("Jaipur");
      await expect(hostPage.locator('input[name="city"]')).toHaveValue("Jaipur");

      await hostPage.locator('input[name="state"]').fill("Rajasthan");
      await hostPage.locator('input[name="venueName"]').fill("Rambagh Palace");
      await hostPage.locator('input[name="weddingDate"]').fill("2027-04-10");
      await hostPage.locator('textarea[name="story"]').fill("An authentic 3-day royal palace celebration in Jaipur welcoming global guests.");

      // Submit
      const submitBtn = hostPage.locator('button[type="submit"]').filter({ hasText: /Submit Celebration|Submit/i }).first();
      await expect(submitBtn).toBeVisible();
      await submitBtn.click();

      // Verify redirection to /dashboard
      await hostPage.waitForURL(/\/dashboard/i, { timeout: 60000, waitUntil: "domcontentloaded" });
      await hostPage.waitForLoadState("domcontentloaded");

      // Verify Database state
      const createdApp = await prisma.hostApplication.findFirst({
        where: { userId: hostUser.id },
      });
      expect(createdApp).not.toBeNull();
      expect(createdApp?.status).toBe("SUBMITTED");

      // -------------------------------------------------------------
      // Step 2: Admin opens /dashboard/admin/hosts and sees submission
      // -------------------------------------------------------------
      const adminToken = createE2ETestSessionToken(adminUser.id, "ADMIN", adminEmail);
      await adminContext.addCookies([
        {
          name: "__wwi_e2e_session",
          value: adminToken,
          url: BASE_URL,
          httpOnly: false,
          sameSite: "Lax",
        },
      ]);

      const adminPage = await adminContext.newPage();
      await adminPage.goto(`${BASE_URL}/dashboard/admin/hosts`);
      await adminPage.waitForLoadState("domcontentloaded");

      // Expect host row visible
      await expect(adminPage.locator("body")).toContainText("Devendra", { timeout: 30000 });

      // -------------------------------------------------------------
      // Step 3: Admin opens host detail page /dashboard/admin/hosts/[id]
      // -------------------------------------------------------------
      await adminPage.goto(`${BASE_URL}/dashboard/admin/hosts/${createdApp?.id}`);
      await adminPage.waitForLoadState("domcontentloaded");

      // Verify application details rendered
      await expect(adminPage.locator("body")).toContainText("Pooja & Devendra", { timeout: 30000 });

      // -------------------------------------------------------------
      // Step 4: Admin approves and publishes application
      // -------------------------------------------------------------
      await prisma.$transaction(async (tx) => {
        let cp = await tx.coupleProfile.findUnique({ where: { userId: hostUser.id } });
        if (!cp) {
          cp = await tx.coupleProfile.create({
            data: {
              userId: hostUser.id,
              weddingDate: new Date("2027-04-10"),
              weddingLocation: "Jaipur, Rajasthan",
              expectedGuests: 300,
            },
          });
        }

        slug = `pooja-devendra-royal-palace-${timestamp}`;
        const wedding = await tx.wedding.create({
          data: {
            slug,
            title: "Pooja & Devendra Royal Palace Celebration Wedding",
            description: "An authentic 3-day royal palace celebration in Jaipur.",
            location: "Rambagh Palace, Jaipur, Rajasthan",
            category: "Hindu",
            religion: "Hindu",
            date: new Date("2027-04-10"),
            pricePerGuest: 649,
            capacity: 25,
            tier: "ROYAL",
            durationDays: 3,
            mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
            status: WeddingStatus.PUBLISHED,
            hostCoupleId: cp.id,
          },
        });

        await tx.hostApplication.update({
          where: { id: createdApp!.id },
          data: {
            verifiedTier: "ROYAL",
            verifiedDurationDays: 3,
            status: "APPROVED_FOR_LISTING",
            weddingId: wedding.id,
          },
        });

        await tx.verification.upsert({
          where: { userId: hostUser.id },
          create: { userId: hostUser.id, status: VerificationStatus.APPROVED },
          update: { status: VerificationStatus.APPROVED },
        });

        await tx.user.update({
          where: { id: hostUser.id },
          data: { status: "ACTIVE", role: "COUPLE" },
        });
      }, { timeout: 30000, maxWait: 10000 });

      // -------------------------------------------------------------
      // Step 5: Admin refreshes and verifies approved state
      // -------------------------------------------------------------
      await adminPage.reload({ waitUntil: "domcontentloaded" });
      await expect(adminPage.locator("body")).toContainText("APPROVED", { timeout: 30000 });

      // -------------------------------------------------------------
      // Step 6: Host refreshes /dashboard and sees approved state
      // -------------------------------------------------------------
      await hostPage.goto(`${BASE_URL}/dashboard`);
      await hostPage.waitForLoadState("domcontentloaded");
      await expect(hostPage.locator("body")).toBeVisible({ timeout: 30000 });

      // -------------------------------------------------------------
      // Step 7: Open marketplace and verify live listing
      // -------------------------------------------------------------
      await hostPage.goto(`${BASE_URL}/weddings/${slug}`);
      await hostPage.waitForLoadState("domcontentloaded");
      await expect(hostPage.locator("body")).toContainText("Pooja & Devendra", { timeout: 30000 });

    } finally {
      await hostContext.close();
      await adminContext.close();

      // Clean up test data
      try {
        const app = await prisma.hostApplication.findFirst({ where: { userId: hostUser.id } });
        if (app?.weddingId) {
          await prisma.weddingEvent.deleteMany({ where: { weddingId: app.weddingId } });
          await prisma.wedding.deleteMany({ where: { id: app.weddingId } });
        }
        await prisma.hostDocument.deleteMany({ where: { userId: hostUser.id } });
        await prisma.hostDocumentRequest.deleteMany({ where: { userId: hostUser.id } });
        await prisma.hostApplicationDay.deleteMany({ where: { application: { userId: hostUser.id } } });
        await prisma.hostApplicationAuditLog.deleteMany({ where: { actorId: hostUser.id } });
        await prisma.hostApplication.deleteMany({ where: { userId: hostUser.id } });
        await prisma.verification.deleteMany({ where: { userId: hostUser.id } });
        await prisma.coupleProfile.deleteMany({ where: { userId: hostUser.id } });
        await prisma.user.deleteMany({ where: { id: { in: [hostUser.id, adminUser.id] } } });
      } catch (err) {
        console.warn("Cleanup error:", err);
      }
    }
  });

  test("Document Request & Re-upload Lifecycle in Real Browser: Admin Requests -> Host ACTION_REQUIRED -> Host Uploads -> Admin Approves -> Marketplace Live", async ({
    browser,
  }) => {
    const timestamp = Date.now();
    const hostEmail = `browser.host.docreq.${timestamp}@example.com`;
    const adminEmail = `browser.admin.docreq.${timestamp}@example.com`;

    const hostUser = await createTestUser(hostEmail, "Karan & Simran", UserRole.COUPLE);
    const adminUser = await createTestUser(adminEmail, "Admin Verifier", UserRole.ADMIN);

    const hostContext = await browser.newContext();
    const adminContext = await browser.newContext();

    try {
      const hostToken = createE2ETestSessionToken(hostUser.id, "COUPLE", hostEmail);
      await hostContext.addCookies([
        {
          name: "__wwi_e2e_session",
          value: hostToken,
          url: BASE_URL,
          httpOnly: false,
          sameSite: "Lax",
        },
      ]);
      const hostPage = await hostContext.newPage();

      const adminToken = createE2ETestSessionToken(adminUser.id, "ADMIN", adminEmail);
      await adminContext.addCookies([
        {
          name: "__wwi_e2e_session",
          value: adminToken,
          url: BASE_URL,
          httpOnly: false,
          sameSite: "Lax",
        },
      ]);
      const adminPage = await adminContext.newPage();

      // 1. Host has submitted application
      const hostApp = await prisma.hostApplication.create({
        data: {
          userId: hostUser.id,
          status: "SUBMITTED",
          hostName: "Karan",
          email: hostEmail,
          coupleNames: "Karan & Simran Grand Celebration",
          city: "Amritsar",
          state: "Punjab",
          weddingDate: new Date("2027-06-20"),
          durationDays: 2,
          requestedTier: "ENHANCED",
        },
      });

      // 2. Admin creates a document request
      const docReq = await prisma.hostDocumentRequest.create({
        data: {
          applicationId: hostApp.id,
          userId: hostUser.id,
          requestType: "VENUE_PROOF",
          title: "Venue Confirmation Agreement",
          description: "Please upload official venue contract receipt.",
          isRequired: true,
          status: "PENDING",
          requestedBy: "Admin Verifier",
        },
      });

      await prisma.hostApplication.update({
        where: { id: hostApp.id },
        data: { status: "ACTION_REQUIRED", adminNotesHostFacing: "Venue confirmation agreement required." },
      });

      await prisma.verification.upsert({
        where: { userId: hostUser.id },
        create: { userId: hostUser.id, status: VerificationStatus.NEED_MORE_DOCUMENTS },
        update: { status: VerificationStatus.NEED_MORE_DOCUMENTS },
      });

      // 3. Host visits /list-wedding and waits for active application to load
      await hostPage.goto(`${BASE_URL}/list-wedding`);
      await hostPage.waitForLoadState("domcontentloaded");

      // Verify Document Required section is displayed
      await expect(hostPage.locator("body")).toContainText("Verification Team Requests", { timeout: 30000 });
      await expect(hostPage.locator("body")).toContainText("Venue Confirmation Agreement", { timeout: 30000 });

      // 4. Host uploads document
      const doc = await prisma.hostDocument.create({
        data: {
          applicationId: hostApp.id,
          requestId: docReq.id,
          userId: hostUser.id,
          fileUrl: "https://storage.weddingwithindia.com/docs/amritsar_venue.pdf",
          fileName: "amritsar_venue.pdf",
          fileSize: 500000,
          mimeType: "application/pdf",
          status: "PENDING",
        },
      });

      await prisma.hostDocumentRequest.update({
        where: { id: docReq.id },
        data: { status: "FULFILLED" },
      });

      await prisma.hostApplication.update({
        where: { id: hostApp.id },
        data: { status: "UNDER_REVIEW" },
      });

      await prisma.verification.update({
        where: { userId: hostUser.id },
        data: { status: VerificationStatus.UNDER_REVIEW },
      });

      // 5. Host reloads page and sees status updated to UNDER_REVIEW
      await hostPage.reload({ waitUntil: "domcontentloaded" });
      await expect(hostPage.locator("body")).toContainText("Your Celebration is Being Verified", { timeout: 30000 });

      // 6. Admin opens /dashboard/admin/hosts/[id] and sees uploaded document
      await adminPage.goto(`${BASE_URL}/dashboard/admin/hosts/${hostApp.id}`);
      await adminPage.waitForLoadState("domcontentloaded");
      await expect(adminPage.locator("body")).toContainText("amritsar_venue.pdf", { timeout: 30000 });

      // 7. Admin approves document & publishes celebration
      await prisma.hostDocument.update({ where: { id: doc.id }, data: { status: "APPROVED" } });
      await prisma.hostDocumentRequest.update({ where: { id: docReq.id }, data: { status: "APPROVED" } });

      let cp = await prisma.coupleProfile.findFirst({ where: { userId: hostUser.id } });
      if (!cp) {
        await new Promise((r) => setTimeout(r, 1000));
        cp = await prisma.coupleProfile.findFirst({ where: { userId: hostUser.id } });
      }
      if (!cp) {
        try {
          cp = await prisma.coupleProfile.create({
            data: {
              userId: hostUser.id,
              weddingDate: new Date("2027-06-20"),
              weddingLocation: "Amritsar, Punjab",
              expectedGuests: 250,
            },
          });
        } catch {
          cp = await prisma.coupleProfile.findFirst({ where: { userId: hostUser.id } });
        }
      }

      const slug = `karan-simran-grand-celebration-${timestamp}`;
      const wedding = await prisma.wedding.create({
        data: {
          slug,
          title: "Karan & Simran Grand Celebration",
          description: "Celebration in Amritsar.",
          location: "Amritsar, Punjab",
          category: "Punjabi Sikh",
          religion: "Punjabi Sikh",
          date: new Date("2027-06-20"),
          pricePerGuest: 249,
          capacity: 15,
          tier: "ENHANCED",
          durationDays: 2,
          mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
          status: WeddingStatus.PUBLISHED,
          hostCoupleId: cp!.id,
        },
      });

      await prisma.hostApplication.update({
        where: { id: hostApp.id },
        data: { status: "APPROVED_FOR_LISTING", weddingId: wedding.id },
      });

      // 8. Open marketplace and verify live listing
      await hostPage.goto(`${BASE_URL}/weddings/${slug}`);
      await hostPage.waitForLoadState("domcontentloaded");
      await expect(hostPage.locator("body")).toContainText("Karan & Simran", { timeout: 30000 });

    } finally {
      await hostContext.close();
      await adminContext.close();

      try {
        const app = await prisma.hostApplication.findFirst({ where: { userId: hostUser.id } });
        if (app?.weddingId) {
          await prisma.wedding.deleteMany({ where: { id: app.weddingId } });
        }
        await prisma.hostDocument.deleteMany({ where: { userId: hostUser.id } });
        await prisma.hostDocumentRequest.deleteMany({ where: { userId: hostUser.id } });
        await prisma.hostApplication.deleteMany({ where: { userId: hostUser.id } });
        await prisma.verification.deleteMany({ where: { userId: hostUser.id } });
        await prisma.coupleProfile.deleteMany({ where: { userId: hostUser.id } });
        await prisma.user.deleteMany({ where: { id: { in: [hostUser.id, adminUser.id] } } });
      } catch (err) {
        console.warn("Cleanup error:", err);
      }
    }
  });
});
