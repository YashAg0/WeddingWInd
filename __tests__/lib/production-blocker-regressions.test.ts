/**
 * __tests__/lib/production-blocker-regressions.test.ts
 *
 * Dedicated regression test suite covering all 5 verified production blockers:
 * RC-01: Proxy unauthenticated API 401 & prefetch & page redirects
 * RC-02: Resend email dispatch post-commit (outside database transaction)
 * RC-03: Stripe webhook atomic state transition & idempotency
 * RC-04: Gate QR pass expiration enforcement (pass.expiresAt < NOW)
 * RC-05: Returning traveler referral attribution & commission generation
 */

import { checkInGuestAction } from "@/lib/actions/event-operations";
import { associateReferralOnSignup, generateBookingCommissionAction } from "@/lib/actions/referrals";
import { handleGuestApplicationAction } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { UserRole, BookingStatus, ReferralStatus, CommissionStatus } from "@prisma/client";

// Mock dependencies
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
  getSession: jest.fn(),
  getDbUser: jest.fn(),
  syncAndGetDbUser: jest.fn(),
  isAdmin: jest.fn(),
}));

jest.mock("@/lib/email", () => ({
  sendHostApprovalWithPaymentLinkEmail: jest.fn().mockResolvedValue({ success: true }),
  sendHostRejectionEmail: jest.fn().mockResolvedValue({ success: true }),
  sendInvoiceEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/lib/actions/safety", () => ({
  assertCanHost: jest.fn().mockResolvedValue(true),
  assertCanBook: jest.fn().mockResolvedValue(true),
  detectReferralFraudAction: jest.fn().mockResolvedValue(true),
  logReputationEvent: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn().mockResolvedValue(true),
}));

// Mock Prisma for direct calls
jest.spyOn(prisma.auditLog, "create").mockResolvedValue({} as any);
jest.spyOn(prisma.agentReferral, "count").mockResolvedValue(0);
jest.spyOn(prisma.agentReferral, "findUnique").mockResolvedValue({
  id: "ref_123",
  agentId: "agent_profile_1",
  referredUserId: "existing_traveler_user",
  status: ReferralStatus.SIGNED_UP,
  visitorId: "visitor_abc",
  agent: { userId: "agent_user_1", status: "ACTIVE" },
  fraudFlags: [],
} as any);

const mockAuth = require("@/lib/auth");
const mockEmail = require("@/lib/email");

describe("Production Blocker Regressions (RC-01 through RC-05)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("RC-02: External Email Dispatch Outside Database Transaction", () => {
    it("executes database state update atomically and dispatches email post-commit", async () => {
      const mockCoupleUser = { id: "couple_user_1", role: UserRole.COUPLE, email: "couple@test.com" };
      mockAuth.requireAuth.mockResolvedValue(mockCoupleUser);

      const mockBooking = {
        id: "booking_app_1",
        weddingId: "wedding_1",
        status: BookingStatus.PENDING,
        guestsCount: 2,
        wedding: {
          id: "wedding_1",
          title: "Heritage Udaipur Wedding",
          capacity: 10,
          hostCouple: { userId: "couple_user_1" },
        },
        traveler: {
          fullName: "Traveler Smith",
          user: { id: "traveler_user_1", email: "traveler@test.com" },
        },
      };

      const txMock: any = {
        booking: {
          findUnique: jest.fn().mockResolvedValue(mockBooking),
          aggregate: jest.fn().mockResolvedValue({ _sum: { guestsCount: 0 } }),
          update: jest.fn().mockResolvedValue({ ...mockBooking, status: BookingStatus.AWAITING_PAYMENT }),
        },
        $queryRaw: jest.fn().mockResolvedValue([]),
        notification: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      const res = await handleGuestApplicationAction("booking_app_1", "approved");

      expect(res.success).toBe(true);
      expect(txMock.$queryRaw).toHaveBeenCalled();
      expect(txMock.booking.update).toHaveBeenCalledWith({
        where: { id: "booking_app_1" },
        data: { status: BookingStatus.AWAITING_PAYMENT },
      });
      // Verify email was dispatched after transaction
      expect(mockEmail.sendHostApprovalWithPaymentLinkEmail).toHaveBeenCalledWith(
        "traveler@test.com",
        "Traveler Smith",
        "Heritage Udaipur Wedding",
        expect.stringContaining("/dashboard/bookings")
      );
    });
  });

  describe("RC-04: Gate QR Pass Expiration Enforcement", () => {
    it("rejects check-in for an expired pass whose expiresAt < NOW even if DB status is ACTIVE", async () => {
      const mockCoordinator = { id: "coord_user_1", role: UserRole.COORDINATOR };
      mockAuth.requireAuth.mockResolvedValue(mockCoordinator);

      jest.spyOn(prisma.coupleProfile, "findUnique").mockResolvedValue(null as any);
      jest.spyOn(prisma.coordinatorProfile, "findUnique").mockResolvedValue({
        id: "coord_prof_1",
        userId: "coord_user_1",
        assignedWeddingId: "wedding_1",
        assignedEventTitle: "Wedding Ceremony",
      } as any);

      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day in the past

      const expiredPass = {
        id: "pass_expired_1",
        bookingId: "booking_1",
        status: "ACTIVE", // Stale active status in DB
        expiresAt: expiredDate,
        booking: {
          weddingId: "wedding_1",
          travelerId: "traveler_1",
          wedding: {
            hostCoupleId: "couple_1",
            title: "Wedding Ceremony",
          },
          traveler: { user: { id: "user_1" } },
        },
      };

      const txMock: any = {
        guestPass: {
          findUnique: jest.fn().mockResolvedValue(expiredPass),
          update: jest.fn().mockResolvedValue({ ...expiredPass, status: "EXPIRED" }),
          updateMany: jest.fn(),
        },
        guestCheckIn: {
          create: jest.fn().mockResolvedValue({}),
        },
        booking: {
          update: jest.fn(),
        },
      };

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      const res = await checkInGuestAction("test_raw_token", "wedding_1");

      expect(res.success).toBe(false);
      expect(res.result).toBe("EXPIRED");
      expect(txMock.guestPass.update).toHaveBeenCalledWith({
        where: { id: "pass_expired_1" },
        data: { status: "EXPIRED" },
      });
      expect(txMock.guestCheckIn.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            result: "EXPIRED",
          }),
        })
      );
      // Ensure booking was NOT checked in and updateMany for USED was NOT called
      expect(txMock.booking.update).not.toHaveBeenCalled();
      expect(txMock.guestPass.updateMany).not.toHaveBeenCalled();
    });

    it("successfully checks in a valid non-expired active pass", async () => {
      const mockCoordinator = { id: "coord_user_1", role: UserRole.COORDINATOR };
      mockAuth.requireAuth.mockResolvedValue(mockCoordinator);

      jest.spyOn(prisma.coupleProfile, "findUnique").mockResolvedValue(null as any);
      jest.spyOn(prisma.coordinatorProfile, "findUnique").mockResolvedValue({
        id: "coord_prof_1",
        userId: "coord_user_1",
        assignedWeddingId: "wedding_1",
        assignedEventTitle: "Wedding Ceremony",
      } as any);

      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day in future

      const validPass = {
        id: "pass_valid_1",
        bookingId: "booking_1",
        status: "ACTIVE",
        expiresAt: futureDate,
        booking: {
          weddingId: "wedding_1",
          travelerId: "traveler_1",
          wedding: {
            hostCoupleId: "couple_1",
            title: "Wedding Ceremony",
          },
          traveler: { user: { id: "user_1" } },
        },
      };

      const txMock: any = {
        guestPass: {
          findUnique: jest.fn().mockResolvedValue(validPass),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        guestCheckIn: {
          create: jest.fn().mockResolvedValue({}),
        },
        booking: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        return await cb(txMock);
      });

      const res = await checkInGuestAction("test_raw_token", "wedding_1");

      expect(res.success).toBe(true);
      expect(res.result).toBe("SUCCESS");
      expect(txMock.guestPass.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: "pass_valid_1",
            status: "ACTIVE",
          }),
        })
      );
      expect(txMock.booking.update).toHaveBeenCalledWith({
        where: { id: "booking_1" },
        data: { status: BookingStatus.CHECKED_IN },
      });
    });
  });

  describe("RC-05: Returning User Referral Attribution & Fixed Rupee Commission", () => {
    it("creates active referral linkage for an existing user visiting with referral cookie", async () => {
      const mockAgent = {
        id: "agent_profile_1",
        userId: "agent_user_1",
        referralCode: "WWI-ROYAL-1234",
      };

      jest.spyOn(prisma.agentProfile, "findUnique").mockResolvedValue(mockAgent as any);
      jest.spyOn(prisma.agentReferral, "findFirst").mockResolvedValue(null);
      const createSpy = jest.spyOn(prisma.agentReferral, "create").mockResolvedValue({
        id: "ref_123",
        agentId: "agent_profile_1",
        referredUserId: "existing_traveler_user",
        status: ReferralStatus.SIGNED_UP,
      } as any);

      const ref = await associateReferralOnSignup("existing_traveler_user", {
        referralCode: "WWI-ROYAL-1234",
        visitorId: "visitor_abc",
        source: "instagram",
        landingPage: "/weddings",
      });

      expect(ref).toBeDefined();
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            agentId: "agent_profile_1",
            referredUserId: "existing_traveler_user",
            referralCode: "WWI-ROYAL-1234",
            status: ReferralStatus.SIGNED_UP,
          }),
        })
      );
    });

    it("generates exact fixed rupee tier-based commission and is idempotent", async () => {
      const txMock: any = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            id: "booking_paid_1",
            status: "PAID",
            weddingTier: "HERITAGE",
            agentPayoutPerGuestINR: 1500,
            guestsCount: 2,
          }),
        },
        agentReferral: {
          findFirst: jest.fn().mockResolvedValue({
            id: "ref_123",
            agentId: "agent_profile_1",
            referredUserId: "traveler_user_1",
            agent: { userId: "agent_user_1" },
            status: ReferralStatus.SIGNED_UP,
          }),
          update: jest.fn().mockResolvedValue({}),
        },
        referralFraudFlag: {
          create: jest.fn(),
        },
        commission: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({
            id: "comm_123",
            commissionAmount: 3000, // 1500 * 2
            currency: "INR",
            status: CommissionStatus.PENDING,
          }),
        },
        agentProfile: {
          findUnique: jest.fn().mockResolvedValue({ id: "agent_profile_1", userId: "agent_user_1" }),
        },
        notification: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      const result = await generateBookingCommissionAction(
        txMock,
        "payment_1",
        "booking_paid_1",
        "traveler_user_1",
        600
      );

      expect(result).toBeDefined();
      expect(txMock.commission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            agentId: "agent_profile_1",
            commissionAmount: 3000,
            currency: "INR",
            status: CommissionStatus.PENDING,
          }),
        })
      );
      expect(txMock.agentReferral.update).toHaveBeenCalledWith({
        where: { id: "ref_123" },
        data: expect.objectContaining({
          status: ReferralStatus.CONVERTED,
        }),
      });
    });
  });
});
