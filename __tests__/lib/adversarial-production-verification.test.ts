import {
  createBookingAction,
  getWeddingBySlug,
} from "@/lib/actions/index";
import {
  checkInGuestAction,
} from "@/lib/actions/event-operations";
import {
  adminOverrideBookingStatusAction,
  adminProcessHostPayoutAction,
} from "@/lib/actions/admin";
import {
  createStripeCheckoutAction,
  retryStripeWebhookEventAction,
} from "@/lib/actions/stripe";
import { searchWeddingsAction } from "@/lib/actions/discovery";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import {
  UserRole,
  BookingStatus,
  PaymentStatus,
  WeddingStatus,
} from "@prisma/client";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

jest.mock("@/lib/stripe", () => ({
  stripe: {
    transfers: {
      create: jest.fn().mockResolvedValue({ id: "tr_mock_123" }),
    },
    events: {
      retrieve: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}));

jest.mock("@/lib/email", () => ({
  sendVerificationApprovedEmail: jest.fn().mockResolvedValue(true),
  sendVerificationRejectedEmail: jest.fn().mockResolvedValue(true),
  sendInvoiceEmail: jest.fn().mockResolvedValue(true),
  sendHostApprovalWithPaymentLinkEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/security/guest-pass-crypto", () => ({
  encryptPass: jest.fn().mockReturnValue("encrypted_pass_token"),
  decryptPass: jest.fn().mockReturnValue("decrypted_raw_token"),
  hashPassToken: jest.fn((token: string) => `hash_${token}`),
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("@/lib/prisma", () => {
  const mockPrisma: any = {
    wedding: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    coupleProfile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    travelerProfile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    coordinatorProfile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    guestPass: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    guestCheckIn: {
      create: jest.fn(),
    },
    verification: {
      upsert: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    safetyCase: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    userRestriction: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    searchAnalytics: {
      create: jest.fn(),
    },
    payout: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: "payout-123" }),
    },
    payment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    paymentIntent: {
      create: jest.fn(),
    },
    stripeWebhookEvent: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    cancellationRequest: {
      count: jest.fn().mockResolvedValue(0),
    },
    dispute: {
      count: jest.fn().mockResolvedValue(0),
    },
    review: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    refund: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    reputationEvent: {
      create: jest.fn().mockResolvedValue({ id: "rep-1" }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    reputationProfile: {
      findUnique: jest.fn().mockResolvedValue({ overallScore: 90 }),
      upsert: jest.fn(),
    },
    trustScoreSnapshot: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    badge: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
    },
    weddingQualityBadge: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(async (cb) => {
      if (typeof cb === "function") return cb(mockPrisma);
      return cb;
    }),
  };
  return { prisma: mockPrisma };
});

describe("Adversarial Production Verification Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Concurrency & Row-Locking Capacity Protection
  // ───────────────────────────────────────────────────────────────────────────
  describe("1. Concurrency & Row-Locking Capacity Invariants", () => {
    it("should execute SELECT FOR UPDATE and block concurrent booking when capacity is exhausted", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "traveler-user-id",
        role: UserRole.TRAVELER,
      });

      (prisma.travelerProfile.findUnique as jest.Mock).mockResolvedValue({
        id: "traveler-profile-id",
        userId: "traveler-user-id",
      });

      const mockTx = {
        $queryRaw: jest.fn().mockResolvedValue([{ id: "wedding-123" }]),
        wedding: {
          findUnique: jest.fn().mockResolvedValue({
            id: "wedding-123",
            capacity: 2,
            date: new Date(Date.now() + 86400000),
            suspended: false,
            isDemo: false,
            pricePerGuest: 100,
            hostCouple: { userId: "host-user-id" },
          }),
        },
        booking: {
          findFirst: jest.fn().mockResolvedValue(null),
          aggregate: jest.fn().mockResolvedValue({
            _sum: { guestsCount: 2 }, // Already at max capacity (2/2)
          }),
          create: jest.fn(),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await expect(
        createBookingAction({
          weddingId: "wedding-123",
          date: new Date(Date.now() + 86400000).toISOString(),
          guestsCount: 1,
        })
      ).rejects.toThrow("Cannot exceed maximum wedding guest capacity");

      // Verify row lock was executed
      expect(mockTx.$queryRaw).toHaveBeenCalled();
    });

    it("should block admin status override to confirmed if capacity is exceeded", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        id: "admin-id",
        email: "admin@weddingwithindia.com",
        role: UserRole.ADMIN,
      });

      const mockTx = {
        $queryRaw: jest.fn().mockResolvedValue([{ id: "wedding-123" }]),
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            id: "booking-123",
            status: BookingStatus.CANCELLED,
            guestsCount: 2,
            weddingId: "wedding-123",
            wedding: { id: "wedding-123", capacity: 5 },
          }),
          aggregate: jest.fn().mockResolvedValue({
            _sum: { guestsCount: 4 }, // 4 existing + 2 new = 6 > capacity of 5
          }),
          update: jest.fn(),
        },
        guestPass: { updateMany: jest.fn() },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await expect(
        adminOverrideBookingStatusAction("booking-123", BookingStatus.CONFIRMED, "Override to confirmed")
      ).rejects.toThrow("Cannot override booking status: wedding capacity exceeded");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Coordinator Cross-Wedding Access & QR Isolation
  // ───────────────────────────────────────────────────────────────────────────
  describe("2. Coordinator Cross-Wedding Isolation", () => {
    it("should ALLOW coordinator assigned to Wedding A to check in guests at Wedding A", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "coord-user-id",
        role: UserRole.COORDINATOR,
      });

      (prisma.coupleProfile.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.coordinatorProfile.findUnique as jest.Mock).mockResolvedValue({
        id: "coord-profile-id",
        userId: "coord-user-id",
        assignedWeddingId: "wedding-A",
        assignedEventTitle: "Wedding A Title",
      });

      const mockTx = {
        guestPass: {
          findUnique: jest.fn().mockResolvedValue({
            id: "pass-123",
            bookingId: "booking-A",
            status: "ACTIVE",
            booking: {
              weddingId: "wedding-A",
              travelerId: "traveler-123",
              traveler: { fullName: "Jane Doe", user: { id: "u-123" } },
              wedding: { id: "wedding-A", hostCoupleId: "host-A", title: "Wedding A Title" },
            },
          }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        booking: { update: jest.fn() },
        guestCheckIn: { create: jest.fn() },
        notification: { create: jest.fn() },
        auditLog: { create: jest.fn() },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      const res = await checkInGuestAction("raw_qr_token", "wedding-A");
      expect(res.success).toBe(true);
      expect(res.result).toBe("SUCCESS");
    });

    it("should REJECT coordinator assigned to Wedding A attempting to check in guests at Wedding B", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "coord-user-id",
        role: UserRole.COORDINATOR,
      });

      (prisma.coupleProfile.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.coordinatorProfile.findUnique as jest.Mock).mockResolvedValue({
        id: "coord-profile-id",
        userId: "coord-user-id",
        assignedWeddingId: "wedding-A",
        assignedEventTitle: "Wedding A Title",
      });

      const mockTx = {
        guestPass: {
          findUnique: jest.fn().mockResolvedValue({
            id: "pass-456",
            bookingId: "booking-B",
            status: "ACTIVE",
            booking: {
              weddingId: "wedding-B",
              travelerId: "traveler-456",
              traveler: { fullName: "John Smith", user: { id: "u-456" } },
              wedding: { id: "wedding-B", hostCoupleId: "host-B", title: "Wedding B Title" },
            },
          }),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await expect(checkInGuestAction("raw_qr_token", "wedding-B")).rejects.toThrow(
        "Unauthorized for this wedding event"
      );
    });

    it("should REJECT unassigned coordinator with no assigned wedding", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "coord-unassigned-id",
        role: UserRole.COORDINATOR,
      });

      (prisma.coupleProfile.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.coordinatorProfile.findUnique as jest.Mock).mockResolvedValue({
        id: "coord-profile-unassigned",
        userId: "coord-unassigned-id",
        assignedWeddingId: null,
        assignedEventTitle: null,
      });

      const mockTx = {
        guestPass: {
          findUnique: jest.fn().mockResolvedValue({
            id: "pass-789",
            bookingId: "booking-C",
            status: "ACTIVE",
            booking: {
              weddingId: "wedding-C",
              travelerId: "traveler-789",
              traveler: { fullName: "Bob Guest", user: { id: "u-789" } },
              wedding: { id: "wedding-C", hostCoupleId: "host-C", title: "Wedding C Title" },
            },
          }),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await expect(checkInGuestAction("raw_qr_token", "wedding-C")).rejects.toThrow(
        "Unauthorized for this wedding event"
      );
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Soft-Deleted Weddings Query Exclusion
  // ───────────────────────────────────────────────────────────────────────────
  describe("3. Soft-Deleted Weddings Query Invariants", () => {
    it("should include deletedAt: null in searchWeddingsAction query filters", async () => {
      (prisma.wedding.findMany as jest.Mock).mockResolvedValue([]);

      await searchWeddingsAction({ query: "Royal" });

      expect(prisma.wedding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PUBLISHED",
            suspended: false,
            deletedAt: null,
          }),
        })
      );
    });

    it("should return null for soft-deleted weddings in getWeddingBySlug", async () => {
      (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
        id: "w-deleted",
        slug: "deleted-royal-wedding",
        deletedAt: new Date(),
        status: WeddingStatus.DRAFT,
      });

      const result = await getWeddingBySlug("deleted-royal-wedding");
      expect(result).toBeNull();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Webhook Replay & Idempotency
  // ───────────────────────────────────────────────────────────────────────────
  describe("4. Webhook Replay & Idempotency Invariants", () => {
    it("should skip booking mutations on retry if booking is already PAID", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        id: "admin-id",
        email: "admin@weddingwithindia.com",
        role: UserRole.ADMIN,
      });

      (prisma.stripeWebhookEvent.findUnique as jest.Mock).mockResolvedValue({
        id: "evt_db_123",
        stripeEventId: "evt_stripe_123",
        status: "FAILED",
      });

      (stripe.events.retrieve as jest.Mock).mockResolvedValue({
        id: "evt_stripe_123",
        type: "checkout.session.completed",
        data: {
          object: {
            client_reference_id: "booking-already-paid",
            currency: "usd",
            id: "cs_mock_123",
          },
        },
      });

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-already-paid",
        status: BookingStatus.PAID,
        payments: [{ id: "pay-1", status: PaymentStatus.PAID }],
      });

      (prisma.stripeWebhookEvent.update as jest.Mock).mockResolvedValue({
        id: "evt_db_123",
        status: "PROCESSED",
      });

      const res = await retryStripeWebhookEventAction("evt_db_123");
      expect(res.success).toBe(true);

      // Verify no duplicate booking update or transaction was initiated
      expect(prisma.booking.update).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Zero-Value Booking Idempotency
  // ───────────────────────────────────────────────────────────────────────────
  describe("5. Zero-Value Booking Idempotency", () => {
    it("should return already_paid url if booking is already PAID on checkout entry", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        id: "traveler-user-id",
        role: UserRole.TRAVELER,
      });

      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        id: "booking-free",
        status: BookingStatus.PAID,
        totalAmount: 0,
        traveler: { userId: "traveler-user-id" },
        wedding: { hostCouple: { userId: "host-user-id" } },
      });

      const res = await createStripeCheckoutAction("booking-free", "FREE100");
      expect(res.success).toBe(true);
      expect(res.url).toContain("already_paid=true");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 6. Zero-Decimal Currency Handling
  // ───────────────────────────────────────────────────────────────────────────
  describe("6. Multi-Currency Payout Precision", () => {
    it("should use 1x multiplier for JPY and 100x for USD/INR in Stripe transfers", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        id: "admin-id",
        role: UserRole.ADMIN,
      });

      // 1. Test JPY (Zero-decimal currency)
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
        id: "pay-jpy",
        amount: 5000,
        currency: "JPY",
        hostPayoutTransferred: false,
        booking: {
          id: "book-jpy",
          traveler: { fullName: "Tokyo Guest" },
          wedding: {
            title: "Kyoto Ceremony",
            hostCoupleId: "host-jpy",
            hostCouple: {
              stripeAccountId: "acct_jpy_123",
              user: { email: "host@kyoto.jp" },
            },
          },
        },
      });

      (prisma.safetyCase.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.review.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.payment.update as jest.Mock).mockResolvedValue({});
      (prisma.transaction.create as jest.Mock).mockResolvedValue({});

      await adminProcessHostPayoutAction("pay-jpy");

      expect(stripe.transfers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 5000, // 1x multiplier for JPY
          currency: "jpy",
          destination: "acct_jpy_123",
        })
      );

      // 2. Test USD (Standard currency with 100x multiplier)
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
        id: "pay-usd",
        amount: 500,
        currency: "USD",
        hostPayoutTransferred: false,
        booking: {
          id: "book-usd",
          traveler: { fullName: "US Guest" },
          wedding: {
            title: "Goa Beach Wedding",
            hostCoupleId: "host-usd",
            hostCouple: {
              stripeAccountId: "acct_usd_123",
              user: { email: "host@goa.com" },
            },
          },
        },
      });

      await adminProcessHostPayoutAction("pay-usd");

      expect(stripe.transfers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50000, // 100x multiplier for USD ($500 -> 50000 cents)
          currency: "usd",
          destination: "acct_usd_123",
        })
      );
    });
  });
});
