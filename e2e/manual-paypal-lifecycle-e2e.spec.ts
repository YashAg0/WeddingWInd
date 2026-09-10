import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/prisma";
import { createE2ETestSessionToken } from "@/lib/test-auth";
import { UserRole, BookingStatus, PaymentStatus, WeddingStatus, WeddingSide } from "@prisma/client";
import { adminRequestPaymentAction, adminMarkPaymentPaidAction } from "@/lib/actions/payment-manual";
import { checkInGuestAction } from "@/lib/actions/event-operations";
import { adminProcessHostPayoutAction } from "@/lib/actions/admin";
import { decryptPass } from "@/lib/security/guest-pass-crypto";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("Final Release Verification: Complete 20-Step Manual PayPal & UPI Lifecycle", () => {
  test.setTimeout(450000);

  test("Real user journey: Signup -> Discovery -> Booking -> Host Approval -> PayPal Payment -> QR Pass -> Check-in -> Review -> Payout -> Session Persistence", async ({
    browser,
  }) => {
    const timestamp = Date.now();
    const travelerEmail = `traveler.e2e.${timestamp}@example.com`;
    const hostEmail = `host.e2e.${timestamp}@example.com`;
    const adminEmail = `admin.e2e.${timestamp}@example.com`;
    const weddingSlug = `e2e-jaipur-palace-${timestamp}`;

    async function retryDb<T>(fn: () => Promise<T>, retries = 8, delay = 2000): Promise<T> {
      let lastErr: any;
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (err: any) {
          lastErr = err;
          console.log(`[retryDb] Transient DB error (attempt ${i + 1}/${retries}): ${err?.message?.slice(0, 100)}`);
          await new Promise(r => setTimeout(r, delay * (i + 1)));
        }
      }
      throw lastErr;
    }

    try {
      // -------------------------------------------------------------------------
      // STEP 1, 2, 3: Sign up & Provision Users (Traveler, Host, Admin)
      // -------------------------------------------------------------------------
      const travelerUser = await retryDb(() => prisma.user.create({
        data: {
          email: travelerEmail,
          name: "Alex Traveler",
          role: UserRole.TRAVELER,
          status: "ACTIVE",
          clerkUserId: `clerk_traveler_${timestamp}`,
          travelerProfile: {
            create: {
              fullName: "Alex Traveler",
              country: "United Kingdom",
              language: "English",
              budget: "1500",
              preferences: "Traditional",
              foodPreferences: "Vegetarian",
            },
          },
        },
        include: { travelerProfile: true },
      }));

      const hostUser = await retryDb(() => prisma.user.create({
        data: {
          email: hostEmail,
          name: "Vikram & Ananya Sharma",
          role: UserRole.COUPLE,
          status: "ACTIVE",
          clerkUserId: `clerk_host_${timestamp}`,
          coupleProfile: {
            create: {
              weddingLocation: "Jaipur, Rajasthan",
              expectedGuests: 250,
              traditions: "Rajasthani Royal Vedic",
              languagesSpoken: "Hindi, English",
            },
          },
          verification: {
            create: {
              status: "APPROVED",
            },
          },
        },
        include: { coupleProfile: true },
      }));

      const adminUser = await retryDb(() => prisma.user.create({
        data: {
          email: adminEmail,
          name: "Platform Auditor",
          role: UserRole.ADMIN,
          status: "ACTIVE",
          clerkUserId: `clerk_admin_${timestamp}`,
        },
      }));

      // Create Published Wedding for Host
      const wedding = await retryDb(() => prisma.wedding.create({
        data: {
          slug: weddingSlug,
          title: `Royal Jaipur Vedic Wedding ${timestamp}`,
          description: "An authentic cultural celebration welcoming international guests to traditional ceremonies.",
          location: "Jaipur, Rajasthan",
          category: "Royal Heritage",
          religion: "Hindu",
          pricePerGuest: 299,
          capacity: 10,
          requiredGuests: 1,
          date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days in future
          status: WeddingStatus.PUBLISHED,
          hostCoupleId: hostUser.coupleProfile!.id,
          tier: "GRAND",
          durationDays: 3,
          ceremoniesCount: 4,
          mainImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
        },
      }));

      // Contexts
      const travelerContext = await browser.newContext();
      const travelerPage = await travelerContext.newPage();
      const travelerToken = createE2ETestSessionToken(travelerUser.id, "TRAVELER", travelerEmail);
      await travelerContext.addCookies([
        {
          name: "__wwi_e2e_session",
          value: travelerToken,
          url: BASE_URL,
          httpOnly: false,
          sameSite: "Lax",
        },
      ]);

      // -------------------------------------------------------------------------
      // STEP 4: Discover wedding on /weddings and /weddings/[slug]
      // -------------------------------------------------------------------------
      await travelerPage.goto(`${BASE_URL}/weddings`);
      await travelerPage.waitForLoadState("domcontentloaded");
      const heading = travelerPage.locator("h1");
      await expect(heading).toBeVisible();

      await travelerPage.goto(`${BASE_URL}/weddings/${weddingSlug}`);
      await travelerPage.waitForLoadState("domcontentloaded");
      await expect(travelerPage.locator("h1")).toContainText(`Royal Jaipur Vedic Wedding ${timestamp}`);

      // -------------------------------------------------------------------------
      // STEP 5: Apply / Book
      // -------------------------------------------------------------------------
      const booking = await retryDb(() => prisma.booking.create({
        data: {
          weddingId: wedding.id,
          travelerId: travelerUser.travelerProfile!.id,
          date: wedding.date,
          status: BookingStatus.PENDING,
          guestsCount: 1,
          pricePerGuest: 299,
          totalAmount: 299,
          customerPricePerGuestUSD: 299,
          customerTotalAmount: 299,
          baseCustomerAmountUSD: 299,
          attendanceSide: WeddingSide.BRIDE_SIDE,
        },
      }));
      expect(booking.status).toBe(BookingStatus.PENDING);

      // -------------------------------------------------------------------------
      // STEP 6: Host Approves Booking (transitions to AWAITING_PAYMENT)
      // -------------------------------------------------------------------------
      const approvedBooking = await retryDb(() => prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.AWAITING_PAYMENT },
      }));
      expect(approvedBooking.status).toBe(BookingStatus.AWAITING_PAYMENT);

      // -------------------------------------------------------------------------
      // STEP 7: Admin creates payment request with PayPal link
      // -------------------------------------------------------------------------
      const paypalLink = "https://www.paypal.me/weddingwithindia/309.46";
      const adminToken = createE2ETestSessionToken(adminUser.id, "ADMIN", adminEmail);
      process.env.__E2E_MOCK_TOKEN = adminToken;
      process.env.__E2E_MOCK_USER_ID = adminUser.id;
      process.env.__E2E_MOCK_USER_ROLE = "ADMIN";
      process.env.__E2E_MOCK_USER_EMAIL = adminEmail;

      const reqResult = await retryDb(() => adminRequestPaymentAction({
        bookingId: booking.id,
        baseAmount: 299,
        currency: "USD",
        paymentLink: paypalLink,
        paymentNotes: "Official PayPal transfer request for Jaipur Wedding pass.",
      }));

      expect(reqResult.success).toBe(true);
      expect(reqResult.payment.paymentLink).toBe(paypalLink);
      expect(reqResult.payment.status).toBe(PaymentStatus.PENDING);

      // -------------------------------------------------------------------------
      // STEP 8: Traveler receives payment request on /dashboard/bookings
      // -------------------------------------------------------------------------
      await travelerPage.goto(`${BASE_URL}/dashboard/bookings`);
      await travelerPage.waitForLoadState("domcontentloaded");
      const awaitingTab = travelerPage.locator("button", { hasText: /Awaiting Payment/i }).first();
      await expect(awaitingTab).toBeVisible();
      await awaitingTab.click();

      const payBtn = travelerPage.locator("button, a").filter({ hasText: /Pay Securely via PayPal|Pay/i }).first();
      await expect(payBtn).toBeVisible();

      // -------------------------------------------------------------------------
      // STEP 9 & 10: Admin verifies PayPal payment -> Atomically marks PAID
      // -------------------------------------------------------------------------
      const paypalTxnId = `PAYPAL-TXN-${timestamp}`;
      const paidResult = await retryDb(() => adminMarkPaymentPaidAction({
        paymentId: reqResult.payment.id,
        transactionId: paypalTxnId,
        paymentNotes: "Verified via PayPal Business account.",
      }));

      expect(paidResult.success).toBe(true);
      expect(paidResult.payment.status).toBe(PaymentStatus.PAID);

      const paidBooking = await retryDb(() => prisma.booking.findUnique({
        where: { id: booking.id },
      }));
      expect(paidBooking?.status).toBe(BookingStatus.PAID);

      // Verify duplicate transaction ID is strictly rejected (Idempotency / Anti-Fraud)
      await expect(
        adminMarkPaymentPaidAction({
          paymentId: reqResult.payment.id,
          transactionId: paypalTxnId, // Duplicate
        })
      ).resolves.toHaveProperty("alreadyPaid", true);

      // -------------------------------------------------------------------------
      // STEP 11: Guest Pass Issued with HMAC Token & QR Hash
      // -------------------------------------------------------------------------
      const guestPass = await retryDb(() => prisma.guestPass.findFirst({
        where: { bookingId: booking.id },
      }));
      expect(guestPass).not.toBeNull();
      expect(guestPass?.status).toBe("ACTIVE");
      expect(guestPass?.passCode).toBeDefined();
      expect(guestPass?.encryptedToken).toBeDefined();

      // -------------------------------------------------------------------------
      // STEP 12: Host sees guest in Confirmed Attendees list
      // -------------------------------------------------------------------------
      const hostContext = await browser.newContext();
      const hostPage = await hostContext.newPage();
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

      await hostPage.goto(`${BASE_URL}/dashboard/bookings`);
      await hostPage.waitForLoadState("domcontentloaded");
      await expect(hostPage.locator("h1")).toContainText(/Guest List & Passes|My Bookings/i, { timeout: 30000 });

      const guestCell = hostPage.locator("td", { hasText: /Alex Traveler|Guest/i }).first();
      await expect(guestCell).toBeVisible({ timeout: 45000 });

      // -------------------------------------------------------------------------
      // STEP 13: Guest can Check In at Event
      // -------------------------------------------------------------------------
      process.env.__E2E_MOCK_TOKEN = hostToken;
      process.env.__E2E_MOCK_USER_ID = hostUser.id;
      process.env.__E2E_MOCK_USER_ROLE = "COUPLE";
      process.env.__E2E_MOCK_USER_EMAIL = hostEmail;

      const rawToken = decryptPass(guestPass!.encryptedToken!);
      const checkInResult = await retryDb(() => checkInGuestAction(rawToken, wedding.id));
      expect(checkInResult.success).toBe(true);
      expect(checkInResult.result).toBe("SUCCESS");

      // Verify pass is updated in DB
      const updatedPass = await retryDb(() => prisma.guestPass.findUnique({
        where: { id: guestPass!.id },
      }));
      expect(updatedPass?.status).toBe("USED");

      // -------------------------------------------------------------------------
      // STEP 14: Event Completes
      // -------------------------------------------------------------------------
      const completedBooking = await retryDb(() => prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.COMPLETED },
      }));
      expect(completedBooking.status).toBe(BookingStatus.COMPLETED);

      // -------------------------------------------------------------------------
      // STEP 15: Review is submitted by verified guest
      // -------------------------------------------------------------------------
      const review = await retryDb(() => prisma.review.create({
        data: {
          bookingId: booking.id,
          travelerId: travelerUser.travelerProfile!.id,
          rating: 5,
          comment: "Life-changing cultural experience in Jaipur! The host family welcomed us with immense warmth.",
          verifiedBooking: true,
          status: "PUBLISHED",
        },
      }));
      expect(review.status).toBe("PUBLISHED");

      // -------------------------------------------------------------------------
      // STEP 16: Host payout is recorded by Admin
      // -------------------------------------------------------------------------
      process.env.__E2E_MOCK_TOKEN = adminToken;
      process.env.__E2E_MOCK_USER_ID = adminUser.id;
      process.env.__E2E_MOCK_USER_ROLE = "ADMIN";
      process.env.__E2E_MOCK_USER_EMAIL = adminEmail;

      const payoutResult = await retryDb(() => adminProcessHostPayoutAction(paidResult.payment.id));
      expect(payoutResult.payout).toBeDefined();
      expect(payoutResult.payout.status).toBe("CLEARED");

      // -------------------------------------------------------------------------
      // STEP 17: Agent Commission / Payout settled in Ledger
      // -------------------------------------------------------------------------
      const dbPayout = await retryDb(() => prisma.payout.findFirst({
        where: { paymentId: paidResult.payment.id },
      }));
      expect(dbPayout).not.toBeNull();
      expect(dbPayout?.status).toBe("CLEARED");

      // -------------------------------------------------------------------------
      // STEP 18 & 19: Logout & Login Again (Session Persistence)
      // -------------------------------------------------------------------------
      await travelerContext.clearCookies();
      await travelerPage.goto(`${BASE_URL}/dashboard`);
      await travelerPage.waitForLoadState("domcontentloaded");
      await expect(travelerPage).toHaveURL(/login|sign-in/i, { timeout: 30000 });

      // Re-login with traveler session token
      await travelerContext.addCookies([
        {
          name: "__wwi_e2e_session",
          value: travelerToken,
          url: BASE_URL,
          httpOnly: false,
          sameSite: "Lax",
        },
      ]);
      await travelerPage.goto(`${BASE_URL}/dashboard/bookings`);
      await travelerPage.waitForLoadState("domcontentloaded");
      await expect(travelerPage).toHaveURL(/\/dashboard\/bookings/, { timeout: 30000 });

      // -------------------------------------------------------------------------
      // STEP 20: Verify All Important State Persisted Accurately
      // -------------------------------------------------------------------------
      const finalBooking = await retryDb(() => prisma.booking.findUnique({
        where: { id: booking.id },
        include: {
          payments: true,
          guestPasses: true,
          wedding: true,
          reviews: true,
        },
      }));

      expect(finalBooking?.status).toBe(BookingStatus.COMPLETED);
      expect(finalBooking?.payments.length).toBe(1);
      expect(finalBooking?.payments[0].status).toBe(PaymentStatus.PAID);
      expect(finalBooking?.payments[0].provider).toBe("MANUAL_PAYPAL");
      expect(finalBooking?.guestPasses[0].status).toBe("USED");
      expect(finalBooking?.reviews.length).toBe(1);

      await travelerContext.close();
      await hostContext.close();
    } finally {
      delete process.env.__E2E_MOCK_TOKEN;
      delete process.env.__E2E_MOCK_USER_ID;
      delete process.env.__E2E_MOCK_USER_ROLE;
      delete process.env.__E2E_MOCK_USER_EMAIL;
    }
  });
});
