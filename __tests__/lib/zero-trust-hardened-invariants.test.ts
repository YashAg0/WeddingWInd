import {
  issueGuestPassAction,
  checkInGuestAction,
} from "@/lib/actions/event-operations";
import {
  adminProcessHostPayoutAction,
  adminUpdateUserRoleAction,
} from "@/lib/actions/admin";
import { hostCancelWeddingAction } from "@/lib/actions/safety";
import { submitCoordinatorApplication } from "@/app/actions/coordinator";
import { reverseBookingCommissionAction } from "@/lib/actions/referrals";
import { recordManualRefundAtomic } from "@/lib/services/payments";
import { PATCH as adminHostsPatch } from "@/app/api/admin/hosts/route";
import {
  canIssueGuestPass,
  canAdmitGuest,
  canMarkAttendance,
  canProcessHostPayout,
  HOST_CANCELLATION_AFFECTED_STATUSES,
} from "@/lib/booking-statuses";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import {
  UserRole,
  BookingStatus,
  PaymentStatus,
  CommissionStatus,
} from "@prisma/client";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock("@/lib/email", () => ({
  sendVerificationApprovedEmail: jest.fn().mockResolvedValue(true),
  sendVerificationRejectedEmail: jest.fn().mockResolvedValue(true),
  sendRefundConfirmationEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/lib/security/guest-pass-crypto", () => ({
  encryptPass: jest.fn().mockReturnValue("encrypted-token-test"),
  decryptPass: jest.fn().mockReturnValue("decrypted-token-test"),
  hashPassToken: jest.fn((t: string) => `hash_${t}`),
}));

jest.mock("@/lib/services/reputation", () => ({
  logReputationEvent: jest.fn().mockResolvedValue(true),
}));

describe("Zero-Trust Hardened Invariants — 20 Mandatory Verifications", () => {
  const mockTravelerUser = { id: "u_traveler_1", role: UserRole.TRAVELER, email: "traveler@test.com" };
  const mockAdminUser = { id: "u_admin_1", role: UserRole.ADMIN, email: "admin@test.com" };
  const _mockCoordinatorUser = { id: "u_coord_1", role: UserRole.COORDINATOR, email: "coord@test.com" };
  const mockCoupleUser = { id: "u_couple_1", role: UserRole.COUPLE, email: "couple@test.com" };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(prisma.auditLog, "create").mockResolvedValue({} as any);
    jest.spyOn(prisma.notification, "create").mockResolvedValue({} as any);
    jest.spyOn(prisma.safetyCase, "findMany").mockResolvedValue([]);
    jest.spyOn(prisma.safetyCase, "findFirst").mockResolvedValue(null);
    jest.spyOn(prisma.review, "findMany").mockResolvedValue([]);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 1: PENDING booking cannot receive GuestPass
  // ───────────────────────────────────────────────────────────────────────────
  it("1. PENDING booking cannot receive GuestPass", async () => {
    (requireAuth as jest.Mock).mockResolvedValue(mockTravelerUser);

    const mockBooking = {
      id: "b_pending_1",
      status: BookingStatus.PENDING,
      traveler: { user: { id: mockTravelerUser.id } },
      wedding: { hostCoupleId: "couple_1" },
    };

    const mockTx: any = {
      booking: { findUnique: jest.fn().mockResolvedValue(mockBooking) },
      guestPass: { findFirst: jest.fn(), create: jest.fn() },
    };

    jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => cb(mockTx));

    await expect(issueGuestPassAction("b_pending_1")).rejects.toThrow(
      "Cannot issue Guest Pass for booking in PENDING status. Payment must be verified first."
    );
    expect(mockTx.guestPass.create).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANTS 2–5: Non-admissible bookings cannot check in
  // ───────────────────────────────────────────────────────────────────────────
  const nonAdmissibleStatuses = [
    { status: BookingStatus.PENDING, label: "2. PENDING booking cannot check in" },
    { status: BookingStatus.REFUNDED, label: "3. REFUNDED booking cannot check in" },
    { status: BookingStatus.CANCELLED, label: "4. CANCELLED booking cannot check in" },
    { status: BookingStatus.REJECTED, label: "5. REJECTED booking cannot check in" },
  ];

  for (const { status, label } of nonAdmissibleStatuses) {
    it(label, async () => {
      (requireAuth as jest.Mock).mockResolvedValue(mockAdminUser);
      jest.spyOn(prisma.coupleProfile, "findUnique").mockResolvedValue(null);
      jest.spyOn(prisma.coordinatorProfile, "findUnique").mockResolvedValue(null);

      const mockPass = {
        id: `pass_${status}`,
        bookingId: `b_${status}`,
        status: "ACTIVE",
        expiresAt: null,
        booking: {
          id: `b_${status}`,
          status,
          weddingId: "wedding_1",
          wedding: { id: "wedding_1", title: "Palace Wedding", hostCoupleId: "couple_1" },
          traveler: { fullName: "Test Guest", user: { id: "u_g" } },
        },
      };

      const mockTx: any = {
        guestPass: {
          findUnique: jest.fn().mockResolvedValue(mockPass),
          updateMany: jest.fn(),
        },
        guestCheckIn: { create: jest.fn().mockResolvedValue({}) },
        booking: { update: jest.fn() },
      };

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => cb(mockTx));

      const res = await checkInGuestAction("raw_token", "wedding_1");

      expect(res.success).toBe(false);
      expect(res.result).toBe("BOOKING_INELIGIBLE");
      expect(mockTx.guestCheckIn.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ result: "BOOKING_INELIGIBLE" }),
        })
      );
      expect(mockTx.guestPass.updateMany).not.toHaveBeenCalled();
      expect(mockTx.booking.update).not.toHaveBeenCalled();
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 6: Refunding booking revokes active passes
  // ───────────────────────────────────────────────────────────────────────────
  it("6. Refunding booking revokes active passes", async () => {
    const mockTx: any = {
      payment: {
        findUnique: jest.fn().mockResolvedValue({
          id: "pay_1",
          amount: 500,
          currency: "USD",
          status: PaymentStatus.PAID,
          refunds: [],
          bookingId: "b_paid_1",
          booking: {
            traveler: { user: { id: "u_1", email: "t@test.com" }, fullName: "Test" },
            wedding: { title: "Udaipur Royal" },
          },
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      refund: { create: jest.fn().mockResolvedValue({ id: "ref_1" }) },
      booking: { update: jest.fn().mockResolvedValue({}) },
      guestPass: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      transaction: { create: jest.fn().mockResolvedValue({}) },
      notification: { create: jest.fn().mockResolvedValue({}) },
      commission: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const res = await recordManualRefundAtomic(mockTx, {
      paymentId: "pay_1",
      refundAmount: 500, // full refund
      adminUserId: "admin_1",
      adminEmail: "admin@test.com",
    });

    expect(res.success).toBe(true);
    expect(mockTx.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: BookingStatus.REFUNDED } })
    );
    expect(mockTx.guestPass.updateMany).toHaveBeenCalledWith({
      where: { bookingId: "b_paid_1", status: "ACTIVE" },
      data: { status: "REVOKED" },
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 7: Refunded / Revoked pass cannot be replayed
  // ───────────────────────────────────────────────────────────────────────────
  it("7. Refunded pass cannot be replayed", async () => {
    (requireAuth as jest.Mock).mockResolvedValue(mockAdminUser);
    jest.spyOn(prisma.coupleProfile, "findUnique").mockResolvedValue(null);
    jest.spyOn(prisma.coordinatorProfile, "findUnique").mockResolvedValue(null);

    const revokedPass = {
      id: "pass_revoked",
      bookingId: "b_revoked",
      status: "REVOKED",
      booking: {
        id: "b_revoked",
        status: BookingStatus.REFUNDED,
        weddingId: "wedding_1",
        wedding: { id: "wedding_1", title: "Celebration", hostCoupleId: "c_1" },
        traveler: { fullName: "Revoked Guest", user: { id: "u_rev" } },
      },
    };

    const mockTx: any = {
      guestPass: { findUnique: jest.fn().mockResolvedValue(revokedPass), updateMany: jest.fn() },
      guestCheckIn: { create: jest.fn().mockResolvedValue({}) },
      booking: { update: jest.fn() },
    };

    jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => cb(mockTx));

    const res = await checkInGuestAction("revoked_token", "wedding_1");
    expect(res.success).toBe(false);
    expect(res.result).toBe("REVOKED");
    expect(mockTx.guestPass.updateMany).not.toHaveBeenCalled();
    expect(mockTx.booking.update).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 8: Wrong wedding pass cannot check in
  // ───────────────────────────────────────────────────────────────────────────
  it("8. Wrong wedding pass cannot check in", async () => {
    (requireAuth as jest.Mock).mockResolvedValue(mockAdminUser);
    jest.spyOn(prisma.coupleProfile, "findUnique").mockResolvedValue(null);
    jest.spyOn(prisma.coordinatorProfile, "findUnique").mockResolvedValue(null);

    const validPassWeddingA = {
      id: "pass_wed_A",
      bookingId: "b_A",
      status: "ACTIVE",
      booking: {
        id: "b_A",
        status: BookingStatus.PAID,
        weddingId: "wedding_A",
        wedding: { id: "wedding_A", title: "Wedding A", hostCoupleId: "c_1" },
        traveler: { fullName: "Guest A", user: { id: "u_a" } },
      },
    };

    const mockTx: any = {
      guestPass: { findUnique: jest.fn().mockResolvedValue(validPassWeddingA) },
    };

    jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => cb(mockTx));

    const res = await checkInGuestAction("token_A", "wedding_B");
    expect(res.success).toBe(false);
    expect(res.result).toBe("WRONG_EVENT");
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 9: Concurrent scans allow only one successful check-in
  // ───────────────────────────────────────────────────────────────────────────
  it("9. Concurrent scans allow only one successful check-in", async () => {
    (requireAuth as jest.Mock).mockResolvedValue(mockAdminUser);
    jest.spyOn(prisma.coupleProfile, "findUnique").mockResolvedValue(null);
    jest.spyOn(prisma.coordinatorProfile, "findUnique").mockResolvedValue(null);

    let scanWinner = false;

    const validPass = {
      id: "pass_race",
      bookingId: "b_race",
      status: "ACTIVE",
      booking: {
        id: "b_race",
        status: BookingStatus.PAID,
        weddingId: "wedding_race",
        wedding: { id: "wedding_race", title: "Race Wedding", hostCoupleId: "c_race" },
        travelerId: "t_race",
        traveler: { fullName: "Racer", user: { id: "u_race" } },
      },
    };

    jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
      const mockTx: any = {
        guestPass: {
          findUnique: jest.fn().mockResolvedValue(validPass),
          updateMany: jest.fn().mockImplementation(async () => {
            if (!scanWinner) {
              scanWinner = true;
              return { count: 1 };
            }
            return { count: 0 };
          }),
        },
        guestCheckIn: { create: jest.fn().mockResolvedValue({}) },
        booking: { update: jest.fn().mockResolvedValue({}) },
        notification: { create: jest.fn().mockResolvedValue({}) },
        auditLog: { create: jest.fn().mockResolvedValue({}) },
      };
      return await cb(mockTx);
    });

    const results = await Promise.all([
      checkInGuestAction("token_race", "wedding_race"),
      checkInGuestAction("token_race", "wedding_race"),
      checkInGuestAction("token_race", "wedding_race"),
      checkInGuestAction("token_race", "wedding_race"),
    ]);

    const successes = results.filter((r) => r.success && r.result === "SUCCESS");
    const alreadyUsed = results.filter((r) => !r.success && r.result === "ALREADY_USED");

    expect(successes).toHaveLength(1);
    expect(alreadyUsed).toHaveLength(3);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANTS 10–12: Unpaid, failed, and refunded payments cannot generate host payout
  // ───────────────────────────────────────────────────────────────────────────
  const invalidPaymentStates = [
    { status: PaymentStatus.PENDING, label: "10. Unpaid payment cannot generate host payout" },
    { status: PaymentStatus.FAILED, label: "11. Failed payment cannot generate host payout" },
    { status: PaymentStatus.REFUNDED, label: "12. Refunded payment cannot generate host payout" },
  ];

  for (const { status, label } of invalidPaymentStates) {
    it(label, async () => {
      (requireRole as jest.Mock).mockResolvedValue(mockAdminUser);

      const mockPayment = {
        id: `pay_${status}`,
        status,
        hostPayoutTransferred: false,
        booking: {
          id: `book_${status}`,
          status: status === PaymentStatus.REFUNDED ? BookingStatus.REFUNDED : BookingStatus.PENDING,
          traveler: { fullName: "Guest" },
          wedding: { hostCoupleId: "h_1", hostCouple: { user: { email: "host@test.com" } } },
        },
      };

      const mockTx: any = {
        $queryRaw: jest.fn().mockResolvedValue([]),
        payment: { findUnique: jest.fn().mockResolvedValue(mockPayment) },
        payout: { create: jest.fn() },
      };

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => cb(mockTx));

      await expect(adminProcessHostPayoutAction(`pay_${status}`)).rejects.toThrow(
        `Cannot process host payout: Payment status is ${status}. Only PAID payments qualify for host payout.`
      );
      expect(mockTx.payout.create).not.toHaveBeenCalled();
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 13: Concurrent payout attempts produce exactly one business payout
  // ───────────────────────────────────────────────────────────────────────────
  it("13. Concurrent payout attempts produce exactly one business payout", async () => {
    (requireRole as jest.Mock).mockResolvedValue(mockAdminUser);

    let payoutProcessed = false;

    const validPayment = {
      id: "pay_concurrent",
      amount: 1000,
      currency: "USD",
      status: PaymentStatus.PAID,
      hostPayoutTransferred: false,
      booking: {
        id: "b_payout",
        status: BookingStatus.PAID,
        traveler: { userId: "u_trav", fullName: "Guest" },
        wedding: {
          hostCoupleId: "host_c",
          weddingId: "w_payout",
          hostCouple: { userId: "u_host", user: { email: "host@test.com" } },
        },
      },
    };

    let lockQueue: Promise<void> = Promise.resolve();

    jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
      // Model SELECT ... FOR UPDATE row-level lock serialization
      let releaseLock: () => void;
      const currentTurn = new Promise<void>((resolve) => {
        releaseLock = resolve;
      });
      const previousTurn = lockQueue;
      lockQueue = lockQueue.then(() => currentTurn);

      await previousTurn;
      try {
        const mockTx: any = {
          $queryRaw: jest.fn().mockResolvedValue([]),
          payment: {
            findUnique: jest.fn().mockImplementation(async () => {
              return {
                ...validPayment,
                hostPayoutTransferred: payoutProcessed,
              };
            }),
            update: jest.fn().mockImplementation(async () => {
              payoutProcessed = true;
            }),
          },
          payout: {
            findFirst: jest.fn().mockImplementation(async () => {
              return payoutProcessed ? { id: "payout_existing", status: "CLEARED" } : null;
            }),
            create: jest.fn().mockImplementation(async () => {
              payoutProcessed = true;
              return { id: "payout_created", status: "CLEARED" };
            }),
          },
          safetyCase: { findMany: jest.fn().mockResolvedValue([]) },
          review: { findMany: jest.fn().mockResolvedValue([]) },
        };
        return await cb(mockTx);
      } finally {
        releaseLock!();
      }
    });

    const attempts = await Promise.allSettled(
      Array.from({ length: 10 }).map(() => adminProcessHostPayoutAction("pay_concurrent"))
    );

    const fulfilled = attempts.filter((a) => a.status === "fulfilled");
    const rejected = attempts.filter((a) => a.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(9);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANTS 14–16: Host cancellation handles CONFIRMED, READY_FOR_EVENT, and revokes passes
  // ───────────────────────────────────────────────────────────────────────────
  it("14-16. Host cancellation handles CONFIRMED, READY_FOR_EVENT, and revokes affected passes", async () => {
    (requireAuth as jest.Mock).mockResolvedValue(mockCoupleUser);

    const weddingToCancel = {
      id: "w_cancel_1",
      title: "Royal Palace Udaipur",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      hostCoupleId: "couple_1",
      bookings: [
        {
          id: "b_confirmed",
          status: BookingStatus.CONFIRMED,
          traveler: { user: { id: "u_conf", email: "conf@test.com" } },
        },
        {
          id: "b_ready",
          status: BookingStatus.READY_FOR_EVENT,
          traveler: { user: { id: "u_ready", email: "ready@test.com" } },
        },
        {
          id: "b_pending",
          status: BookingStatus.PENDING,
          traveler: { user: { id: "u_pend", email: "pend@test.com" } },
        },
      ],
    };

    jest.spyOn(prisma.coupleProfile, "findUnique").mockResolvedValue({ id: "couple_1", userId: mockCoupleUser.id } as any);
    jest.spyOn(prisma.wedding, "findFirst").mockResolvedValue(weddingToCancel as any);
    jest.spyOn(prisma.wedding, "update").mockResolvedValue({} as any);
    jest.spyOn(prisma.safetyCase, "create").mockResolvedValue({ id: "case_1" } as any);
    jest.spyOn(prisma.notification, "create").mockResolvedValue({} as any);
    jest.spyOn(prisma.booking, "update").mockResolvedValue({} as any);
    jest.spyOn(prisma.guestPass, "updateMany").mockResolvedValue({ count: 1 } as any);

    jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
      const mockTx: any = {
        safetyCase: { create: jest.fn().mockResolvedValue({ id: "case_1" }) },
        caseParticipant: { create: jest.fn().mockResolvedValue({}) },
        caseTimelineEvent: { create: jest.fn().mockResolvedValue({}) },
        auditLog: { create: jest.fn().mockResolvedValue({}) },
        booking: {
          findUnique: jest.fn().mockImplementation((args: any) => {
            const found = weddingToCancel.bookings.find((b) => b.id === args?.where?.id);
            return found ? { ...found, wedding: weddingToCancel } : null;
          }),
          update: jest.fn().mockResolvedValue({}),
        },
        guestPass: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
        payment: { findUnique: jest.fn().mockResolvedValue({ id: "p1", refunds: [] }), update: jest.fn() },
        refund: { create: jest.fn().mockResolvedValue({ id: "r1" }) },
        transaction: { create: jest.fn().mockResolvedValue({}) },
      };
      return await cb(mockTx);
    });

    const res = await hostCancelWeddingAction("w_cancel_1", "Family emergency");
    expect(res.success).toBe(true);
    expect(res.results).toHaveLength(3);

    // Assert that HOST_CANCELLATION_AFFECTED_STATUSES includes CONFIRMED and READY_FOR_EVENT
    expect(HOST_CANCELLATION_AFFECTED_STATUSES).toContain(BookingStatus.CONFIRMED);
    expect(HOST_CANCELLATION_AFFECTED_STATUSES).toContain(BookingStatus.READY_FOR_EVENT);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 17: Coordinator application does not grant coordinator role
  // ───────────────────────────────────────────────────────────────────────────
  it("17. Coordinator application does not grant coordinator role", async () => {
    (requireAuth as jest.Mock).mockResolvedValue(mockTravelerUser);

    jest.spyOn(prisma.coordinatorProfile, "findUnique").mockResolvedValue(null);
    const mockCreate = jest.spyOn(prisma.coordinatorProfile, "create").mockResolvedValue({
      id: "coord_prof_1",
      userId: mockTravelerUser.id,
      status: "PENDING",
    } as any);
    const mockUserUpdate = jest.spyOn(prisma.user, "update");

    const res = await submitCoordinatorApplication({
      fullName: "Traveler Candidate",
      email: "traveler@test.com",
      phone: "+919999999999",
      city: "Jaipur",
      availability: "Weekends",
      eventExperience: "5 years hospitality",
      languages: "English, Hindi",
      interestNote: "Excited to coordinate weddings",
    });

    expect(res.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PENDING" }),
      })
    );
    // User role must NOT be updated upon application submission
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 18: Only authorized authority can promote ADMIN
  // ───────────────────────────────────────────────────────────────────────────
  it("18. Only authorized authority can promote or demote ADMIN", async () => {
    // Normal admin lacks PROMOTES_ADMIN_ROLES permission
    (requireRole as jest.Mock).mockResolvedValue(mockAdminUser);

    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({
      id: "u_target",
      role: UserRole.TRAVELER,
      email: "target@test.com",
    } as any);

    await expect(adminUpdateUserRoleAction("u_target", UserRole.ADMIN)).rejects.toThrow(
      "PROMOTES_ADMIN_ROLES"
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 19: Unverified host cannot be published through REST API
  // ───────────────────────────────────────────────────────────────────────────
  it("19. Unverified host cannot be published through REST API", async () => {
    (requireRole as jest.Mock).mockResolvedValue(mockAdminUser);

    const unverifiedWedding = {
      id: "w_unverified",
      title: "Unvetted Wedding",
      hostCouple: {
        user: {
          id: "u_host_unvetted",
          verification: { status: "NOT_SUBMITTED" }, // KYC NOT APPROVED
        },
      },
    };

    jest.spyOn(prisma.wedding, "findUnique").mockResolvedValue(unverifiedWedding as any);
    const mockUpdate = jest.spyOn(prisma.wedding, "update");

    const req = new NextRequest("http://localhost:3000/api/admin/hosts", {
      method: "PATCH",
      body: JSON.stringify({ weddingId: "w_unverified", action: "approve" }),
    });

    const res = await adminHostsPatch(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Cannot publish wedding: Host KYC verification is not approved.");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // INVARIANT 20: Partial refund does not incorrectly reverse fixed agent commission
  // ───────────────────────────────────────────────────────────────────────────
  it("20. Partial refund does not incorrectly reverse fixed agent commission", async () => {
    const mockTx: any = {
      commission: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "comm_1",
            agentId: "agent_1",
            status: CommissionStatus.PENDING,
            commissionAmount: 2511,
          },
        ]),
        update: jest.fn(),
      },
      agentProfile: { findUnique: jest.fn() },
      notification: { create: jest.fn() },
    };

    // When isFullRefund = false ($1 partial refund), commission must NOT be reversed
    const partialRes = await reverseBookingCommissionAction(mockTx, "pay_1", "ref_1", false);
    expect(partialRes.success).toBe(true);
    expect(partialRes.reason).toBe("Partial refund does not cancel fixed attendance commission.");
    expect(mockTx.commission.update).not.toHaveBeenCalled();

    // When isFullRefund = true (100% full refund/cancellation), commission IS reversed
    const fullRes = await reverseBookingCommissionAction(mockTx, "pay_1", "ref_1", true);
    expect(fullRes.success).toBe(true);
    expect(mockTx.commission.update).toHaveBeenCalledWith({
      where: { id: "comm_1" },
      data: { status: CommissionStatus.REVERSED },
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Centralized Predicates Invariant Checks
  // ───────────────────────────────────────────────────────────────────────────
  it("Authoritative Predicates encode correct business policies", () => {
    // Pass Issuance
    expect(canIssueGuestPass(BookingStatus.PENDING)).toBe(false);
    expect(canIssueGuestPass(BookingStatus.APPROVED)).toBe(false);
    expect(canIssueGuestPass(BookingStatus.AWAITING_PAYMENT)).toBe(false);
    expect(canIssueGuestPass(BookingStatus.REFUNDED)).toBe(false);
    expect(canIssueGuestPass(BookingStatus.CANCELLED)).toBe(false);
    expect(canIssueGuestPass(BookingStatus.REJECTED)).toBe(false);
    expect(canIssueGuestPass(BookingStatus.PAID)).toBe(true);
    expect(canIssueGuestPass(BookingStatus.CONFIRMED)).toBe(true);
    expect(canIssueGuestPass(BookingStatus.READY_FOR_EVENT)).toBe(true);

    // Venue Admission
    expect(canAdmitGuest(BookingStatus.REFUNDED, "ACTIVE")).toBe(false);
    expect(canAdmitGuest(BookingStatus.CANCELLED, "ACTIVE")).toBe(false);
    expect(canAdmitGuest(BookingStatus.PENDING, "ACTIVE")).toBe(false);
    expect(canAdmitGuest(BookingStatus.PAID, "REVOKED")).toBe(false);
    expect(canAdmitGuest(BookingStatus.PAID, "ACTIVE")).toBe(true);
    expect(canAdmitGuest(BookingStatus.CONFIRMED, "ACTIVE")).toBe(true);
    expect(canAdmitGuest(BookingStatus.READY_FOR_EVENT, "ACTIVE")).toBe(true);

    // Attendance Marking
    expect(canMarkAttendance(BookingStatus.PENDING)).toBe(false);
    expect(canMarkAttendance(BookingStatus.PAID)).toBe(false);
    expect(canMarkAttendance(BookingStatus.CHECKED_IN)).toBe(true);

    // Host Payout
    expect(canProcessHostPayout("PENDING", false, BookingStatus.PAID).eligible).toBe(false);
    expect(canProcessHostPayout("PAID", true, BookingStatus.PAID).eligible).toBe(false);
    expect(canProcessHostPayout("PAID", false, BookingStatus.REFUNDED).eligible).toBe(false);
    expect(canProcessHostPayout("PAID", false, BookingStatus.PAID).eligible).toBe(true);
  });
});
