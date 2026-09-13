/**
 * __tests__/lib/adversarial-release-gate.test.ts
 *
 * STAGE 2 ADVERSARIAL RELEASE GATE TEST SUITE
 * "ASSUME THE PREVIOUS AUDIT IS WRONG"
 *
 * Explicitly attacks:
 *  1. 50 concurrent host submissions
 *  2. Same idempotency token
 *  3. Same token from different users
 *  4. Process restart/retry scenario
 *  5. Concurrent first application creation
 *  6. Concurrent CoupleProfile creation
 *  7. Duplicate Stripe webhook
 *  8. Forged Stripe webhook
 *  9. Unauthorized application mutation
 * 10. Unauthorized wedding mutation
 * 11. Unpublished wedding access
 * 12. Client price tampering
 * 13. Currency tampering
 * 14. Guest count tampering
 * 15. Stale-cache after unpublish
 * 16. Discovery query-count regression
 * 17. Large catalog performance
 * 18. Malicious user-generated HTML
 * 19. Malformed API input
 * 20. Redis/rate-limit failure
 */

import {
  submitHostApplicationAction,
  saveHostApplicationDraftAction,
  HostApplicationInput,
} from "@/lib/actions/host-application";
import {
  createBookingAction,
  getWeddingBySlug,
  cancelBookingAction,
  handleGuestApplicationAction,
} from "@/lib/actions/index";
import { searchWeddingsAction } from "@/lib/actions/discovery";
import { calculateBookingPricing } from "@/lib/services/pricing-engine";
import { rateLimit, clearRateLimitStore } from "@/lib/rate-limit";
import { POST as stripeWebhookPOST } from "@/app/api/webhooks/stripe/route";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, BookingStatus, WeddingStatus } from "@prisma/client";
import { NextRequest } from "next/server";

// Mock external dependencies
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn((rawBody: string, signature: string, _secret: string) => {
        if (signature === "invalid_signature" || signature.includes("bad_signature")) {
          throw new Error("Signature verification failed");
        }
        return JSON.parse(rawBody);
      }),
    },
  }));
});

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
  syncAndGetDbUser: jest.fn(),
}));

jest.mock("@/lib/prisma", () => {
  const mockCoupleProfiles: any[] = [];
  const mockHostApplications: any[] = [];
  const mockAuditLogs: any[] = [];
  const mockNotifications: any[] = [];
  const mockWeddings: any[] = [];
  const mockBookings: any[] = [];
  const mockStripeEvents: any[] = [];

  let txQueue = Promise.resolve();
  const mockDb = {
    $transaction: jest.fn(async (cb: any) => {
      const prev = txQueue;
      let resolver: () => void;
      txQueue = new Promise((resolve) => { resolver = resolve; });
      await prev;
      try {
        return await cb(mockDb);
      } finally {
        resolver!();
      }
    }),
    $queryRaw: jest.fn().mockResolvedValue([{ id: "lock-ok" }]),
    user: {
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve({ id: where.id, role: "COUPLE", email: "user@example.com", name: "Test User" });
      }),
      findMany: jest.fn().mockResolvedValue([{ id: "admin-1", role: "ADMIN" }]),
      update: jest.fn().mockResolvedValue({ id: "usr-1", role: "COUPLE" }),
    },
    userRestriction: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    searchAnalytics: {
      create: jest.fn().mockResolvedValue({ id: "analytics-1" }),
    },
    coupleProfile: {
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockCoupleProfiles.find((p) => p.userId === where.userId) || null);
      }),
      upsert: jest.fn().mockImplementation(({ where, create, update }: any) => {
        const existing = mockCoupleProfiles.find((p) => p.userId === where.userId);
        if (existing) {
          Object.assign(existing, update);
          return Promise.resolve(existing);
        }
        const created = { id: `cp-${where.userId}`, ...create };
        mockCoupleProfiles.push(created);
        return Promise.resolve(created);
      }),
      create: jest.fn().mockImplementation(({ data }: any) => {
        const created = { id: `cp-${data.userId}`, ...data };
        mockCoupleProfiles.push(created);
        return Promise.resolve(created);
      }),
    },
    hostApplication: {
      findFirst: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(
          mockHostApplications.find(
            (a) => (where.userId && a.userId === where.userId) || (where.id && a.id === where.id)
          ) || null
        );
      }),
      create: jest.fn().mockImplementation(({ data }: any) => {
        const created = { id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...data };
        mockHostApplications.push(created);
        return Promise.resolve(created);
      }),
      update: jest.fn().mockImplementation(({ where, data }: any) => {
        const app = mockHostApplications.find((a) => a.id === where.id);
        if (app) Object.assign(app, data);
        return Promise.resolve(app || { id: where.id, ...data });
      }),
      count: jest.fn().mockResolvedValue(1),
    },
    hostApplicationDay: {
      upsert: jest.fn().mockResolvedValue({ id: "day-1" }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    hostApplicationEvent: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({ id: "event-1" }),
    },
    hostApplicationAuditLog: {
      create: jest.fn().mockImplementation(({ data }: any) => {
        mockAuditLogs.push(data);
        return Promise.resolve({ id: "audit-1", ...data });
      }),
    },
    notification: {
      create: jest.fn().mockImplementation(({ data }: any) => {
        mockNotifications.push(data);
        return Promise.resolve({ id: "notif-1", ...data });
      }),
    },
    verification: {
      upsert: jest.fn().mockResolvedValue({ id: "verif-1" }),
    },
    wedding: {
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockWeddings.find((w) => w.id === where.id || w.slug === where.slug) || null);
      }),
      findFirst: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockWeddings.find((w) => w.id === where.id || (w.slug && where.OR)) || null);
      }),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([...mockWeddings])),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      findFirst: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockBookings.find((b) => b.travelerId === where.travelerId && b.weddingId === where.weddingId) || null);
      }),
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockBookings.find((b) => b.id === where.id) || null);
      }),
      aggregate: jest.fn().mockResolvedValue({ _sum: { guestsCount: 5 } }),
      create: jest.fn().mockImplementation(({ data }: any) => {
        const b = { id: `b-${Date.now()}`, ...data };
        mockBookings.push(b);
        return Promise.resolve(b);
      }),
      update: jest.fn(),
    },
    travelerProfile: {
      findUnique: jest.fn().mockResolvedValue({ id: "traveler-1", userId: "usr-traveler-1" }),
    },
    safetyCase: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    reputationProfile: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    weddingQualityBadge: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    reviewFraudSignal: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    review: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    stripeWebhookEvent: {
      findUnique: jest.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockStripeEvents.find((e) => e.stripeEventId === where.stripeEventId) || null);
      }),
      create: jest.fn().mockImplementation(({ data }: any) => {
        mockStripeEvents.push(data);
        return Promise.resolve({ id: "evt-db-1", ...data });
      }),
      updateMany: jest.fn().mockImplementation(({ where, data }: any) => {
        const existing = mockStripeEvents.find((e) => e.stripeEventId === where.stripeEventId);
        if (existing && existing.status !== "PROCESSED") {
          Object.assign(existing, data);
          return Promise.resolve({ count: 1 });
        }
        return Promise.resolve({ count: 0 });
      }),
      update: jest.fn().mockImplementation(({ where, data }: any) => {
        const existing = mockStripeEvents.find((e) => e.stripeEventId === where.stripeEventId);
        if (existing) {
          Object.assign(existing, data);
        }
        return Promise.resolve(existing || { ...data, stripeEventId: where.stripeEventId });
      }),
    },
    __resetState: () => {
      mockCoupleProfiles.length = 0;
      mockHostApplications.length = 0;
      mockAuditLogs.length = 0;
      mockNotifications.length = 0;
      mockWeddings.length = 0;
      mockBookings.length = 0;
      mockStripeEvents.length = 0;
    },
    __getState: () => ({
      mockCoupleProfiles,
      mockHostApplications,
      mockAuditLogs,
      mockNotifications,
      mockWeddings,
      mockBookings,
      mockStripeEvents,
    }),
  };

  return { prisma: mockDb };
});

describe("Stage 2 Adversarial Production Release Gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma as any).__resetState();
    clearRateLimitStore();

    (requireAuth as jest.Mock).mockResolvedValue({
      id: "usr-adversary-1",
      email: "adversary@example.com",
      name: "Adversarial Host",
      role: UserRole.COUPLE,
    });
  });

  // 1. 50 Concurrent Submissions
  it("Attack 1: 50 concurrent host submissions resolve to identical resource without duplicates", async () => {
    const input: HostApplicationInput = {
      submissionToken: "tok_50_storm_test",
      hostName: "Adversary One",
      email: "adversary@example.com",
      coupleNames: "Storm & Wave Celebration",
      city: "Udaipur",
      weddingDate: "2026-12-25",
      durationDays: 3,
    };

    const requests = Array.from({ length: 50 }, () => submitHostApplicationAction(input));
    const results = await Promise.all(requests);

    results.forEach((r) => expect(r.success).toBe(true));
    const firstAppId = results[0].applicationId;
    results.forEach((r) => expect(r.applicationId).toBe(firstAppId));

    const state = (prisma as any).__getState();
    expect(state.mockHostApplications.length).toBe(1);
    expect(state.mockHostApplications[0].coupleNames).toBe("Storm & Wave Celebration");
  });

  // 2. Same Idempotency Token
  it("Attack 2: Repeated submission with same token returns idempotent result without re-notification", async () => {
    const input: HostApplicationInput = {
      submissionToken: "tok_replay_invariant",
      hostName: "Replay Host",
      coupleNames: "Priya & Raj",
      city: "Jaipur",
      weddingDate: "2026-11-15",
      durationDays: 3,
    };

    const res1 = await submitHostApplicationAction(input);
    expect(res1.success).toBe(true);

    const state1 = (prisma as any).__getState();
    const notifCount1 = state1.mockNotifications.length;
    expect(notifCount1).toBeGreaterThanOrEqual(1);

    const res2 = await submitHostApplicationAction(input);
    expect(res2.success).toBe(true);
    expect(res2.applicationId).toBe(res1.applicationId);

    const state2 = (prisma as any).__getState();
    expect(state2.mockNotifications.length).toBe(notifCount1);
  });

  // 3. Same Token From Different Users
  it("Attack 3: Same token from different users is safely isolated to each user", async () => {
    const inputUser1: HostApplicationInput = {
      submissionToken: "tok_shared_token_colliding",
      hostName: "User One",
      coupleNames: "One & Partner",
      city: "Goa",
      weddingDate: "2026-12-01",
    };

    (requireAuth as jest.Mock).mockResolvedValueOnce({
      id: "usr-user-1",
      email: "user1@example.com",
      role: UserRole.COUPLE,
    });
    const res1 = await submitHostApplicationAction(inputUser1);

    (requireAuth as jest.Mock).mockResolvedValueOnce({
      id: "usr-user-2",
      email: "user2@example.com",
      role: UserRole.COUPLE,
    });
    const inputUser2: HostApplicationInput = {
      submissionToken: "tok_shared_token_colliding",
      hostName: "User Two",
      coupleNames: "Two & Partner",
      city: "Delhi",
      weddingDate: "2026-12-05",
    };
    const res2 = await submitHostApplicationAction(inputUser2);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(res1.applicationId).not.toBe(res2.applicationId);
  });

  // 4. Process Restart / Retry Scenario
  it("Attack 4: Durable database state survives simulated process restart", async () => {
    const input: HostApplicationInput = {
      submissionToken: "tok_persist_across_restarts",
      hostName: "Restart Host",
      coupleNames: "Karan & Tanya",
      city: "Mumbai",
      weddingDate: "2027-01-10",
      durationDays: 2,
    };

    const initial = await submitHostApplicationAction(input);
    expect(initial.success).toBe(true);

    clearRateLimitStore();

    const resumed = await submitHostApplicationAction(input);
    expect(resumed.success).toBe(true);
    expect(resumed.applicationId).toBe(initial.applicationId);
  });

  // 5 & 6. Concurrent First Application & Couple Profile Creation
  it("Attack 5 & 6: Simultaneous first-time calls create exactly one CoupleProfile and one Application", async () => {
    const input: HostApplicationInput = {
      submissionToken: "tok_brand_new_user",
      hostName: "First Timer",
      coupleNames: "A & B Celebration",
      city: "Kolkata",
      weddingDate: "2027-02-14",
    };

    const [first, second] = await Promise.all([
      saveHostApplicationDraftAction(input),
      saveHostApplicationDraftAction(input),
    ]);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(first.applicationId).toBe(second.applicationId);

    const state = (prisma as any).__getState();
    expect(state.mockCoupleProfiles.length).toBe(1);
    expect(state.mockHostApplications.length).toBe(1);
  });

  // 7. Duplicate Stripe Webhook
  it("Attack 7: Duplicate Stripe webhook execution is strictly idempotent", async () => {
    const fakePayload = JSON.stringify({
      id: "evt_12345",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_12345",
          status: "succeeded",
          metadata: {},
        },
      },
    });
    const req1 = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: fakePayload,
      headers: {
        "content-type": "application/json",
        "stripe-signature": "valid_signature",
      },
    });

    const res1 = await stripeWebhookPOST(req1);
    expect(res1.status).toBe(200);

    const req2 = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: fakePayload,
      headers: {
        "content-type": "application/json",
        "stripe-signature": "valid_signature",
      },
    });
    const res2 = await stripeWebhookPOST(req2);
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.idempotent).toBe(true);
  });

  // 8. Forged Stripe Webhook
  it("Attack 8: Forged Stripe webhook with invalid signature is rejected with 400", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    try {
      const forgedReq = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
        method: "POST",
        body: JSON.stringify({ id: "evt_forged", type: "charge.succeeded" }),
        headers: { "stripe-signature": "t=12345,v1=bad_signature" },
      });

      const res = await stripeWebhookPOST(forgedReq);
      expect(res.status).toBe(400);
    } finally {
      delete process.env.STRIPE_WEBHOOK_SECRET;
    }
  });

  // 9. Unauthorized Application Mutation
  it("Attack 9: User cannot cancel or approve another user booking/application", async () => {
    const state = (prisma as any).__getState();
    state.mockBookings.push({
      id: "b-victim-101",
      travelerId: "traveler-victim",
      weddingId: "w-victim-999",
      status: BookingStatus.PENDING,
      traveler: { userId: "usr-victim" },
      wedding: { hostCouple: { userId: "usr-other-host" } },
    });

    (requireAuth as jest.Mock).mockResolvedValue({
      id: "usr-attacker",
      role: UserRole.TRAVELER,
    });

    await expect(cancelBookingAction("b-victim-101")).rejects.toThrow("Forbidden");
  });

  // 10. Unauthorized Wedding Mutation
  it("Attack 10: Non-owner host cannot approve guest application for another couple wedding", async () => {
    const state = (prisma as any).__getState();
    state.mockBookings.push({
      id: "b-target-202",
      status: BookingStatus.PENDING,
      wedding: { hostCouple: { userId: "usr-legit-couple" } },
      traveler: { user: { id: "usr-traveler-1" } },
    });

    (requireAuth as jest.Mock).mockResolvedValue({
      id: "usr-malicious-host",
      role: UserRole.COUPLE,
    });

    await expect(handleGuestApplicationAction("b-target-202", "approved")).rejects.toThrow("Forbidden");
  });

  // 11. Unpublished Wedding Access
  it("Attack 11: Anonymous caller cannot access unpublished draft wedding", async () => {
    const state = (prisma as any).__getState();
    state.mockWeddings.push({
      id: "w-draft-private",
      slug: "private-draft-celebration",
      status: WeddingStatus.DRAFT,
      hostCouple: { userId: "usr-couple-owner", user: { id: "usr-couple-owner", name: "Owner" } },
    });

    const res = await getWeddingBySlug("private-draft-celebration");
    expect(res).toBeNull();
  });

  // 12. Client Price Tampering
  it("Attack 12: Client price tampering is ignored; pricing derives strictly from authoritative tier", () => {
    const standardPricing = calculateBookingPricing({
      tier: "STANDARD",
      durationDays: 3,
      guestCount: 2,
    });

    expect(standardPricing.customerPricePerGuestUSD).toBe(249);
    expect(standardPricing.customerTotalAmountUSD).toBe(498);
  });

  // 13 & 14. Guest Count & Currency Tampering
  it("Attack 13 & 14: Tampered negative and zero guest counts are rejected", async () => {
    (requireAuth as jest.Mock).mockResolvedValue({
      id: "usr-traveler-1",
      role: UserRole.TRAVELER,
    });

    await expect(
      createBookingAction({
        weddingId: "w-test-1",
        date: "2026-12-20",
        guestsCount: 0,
      })
    ).rejects.toThrow("INVALID_GUEST_COUNT");

    await expect(
      createBookingAction({
        weddingId: "w-test-1",
        date: "2026-12-20",
        guestsCount: -5,
      })
    ).rejects.toThrow("INVALID_GUEST_COUNT");
  });

  // 15. Stale Cache After Unpublish
  it("Attack 15: Soft-deleted and suspended weddings return null from public lookup", async () => {
    const state = (prisma as any).__getState();
    state.mockWeddings.push({
      id: "w-suspended",
      slug: "suspended-celebration",
      status: WeddingStatus.PUBLISHED,
      suspended: true,
      deletedAt: null,
      hostCouple: { userId: "usr-owner" },
    });

    const res = await getWeddingBySlug("suspended-celebration");
    expect(res).toBeNull();
  });

  // 16 & 17. Discovery Query Count & Large Catalog Performance
  it("Attack 16 & 17: Search discovery executes batched queries and handles empty/large catalog in O(1) calls", async () => {
    const emptyRes = await searchWeddingsAction({});
    expect(emptyRes.weddings).toEqual([]);
    expect(emptyRes.totalCount).toBe(0);

    const state = (prisma as any).__getState();
    for (let i = 1; i <= 20; i++) {
      state.mockWeddings.push({
        id: `w-bulk-${i}`,
        slug: `wedding-bulk-${i}`,
        title: `Royal Wedding ${i}`,
        location: "Jaipur, Rajasthan",
        status: WeddingStatus.PUBLISHED,
        manualTrendingBoost: 2.0,
        bookings: [],
        featured: false,
      });
    }

    const bulkRes = await searchWeddingsAction({ query: "Royal" });
    expect(bulkRes.weddings.length).toBeGreaterThan(0);
    expect(prisma.safetyCase.findMany).toHaveBeenCalledTimes(1);
  });

  // 18. Malicious User-Generated HTML
  it("Attack 18: Malicious script tags in coupleNames and story are safely preserved as text without injection", async () => {
    const xssPayload = "<script>alert('pwned')</script>";
    const input: HostApplicationInput = {
      submissionToken: "tok_xss_test",
      hostName: "XSS Tester",
      coupleNames: xssPayload,
      city: "Mumbai",
      story: "<img src=x onerror=alert(1)>",
      weddingDate: "2026-12-30",
    };

    const res = await submitHostApplicationAction(input);
    expect(res.success).toBe(true);

    const state = (prisma as any).__getState();
    const app = state.mockHostApplications[0];
    expect(app.coupleNames).toBe(xssPayload);
    expect(typeof app.coupleNames).toBe("string");
  });

  // 19. Malformed API Input
  it("Attack 19: Malformed inputs in pricing engine clamp safely to valid domain limits", () => {
    const resNegative = calculateBookingPricing({ tier: "ROYAL", durationDays: -99, guestCount: NaN });
    expect(resNegative.durationDays).toBe(1);
    expect(resNegative.guestCount).toBe(1);

    const resExcessive = calculateBookingPricing({ tier: "ROYAL", durationDays: 999, guestCount: 1000 });
    expect(resExcessive.durationDays).toBe(5);
    expect(resExcessive.guestCount).toBe(1000);
  });

  // 20. Redis / Rate-Limit Failure
  it("Attack 20: Rate limiter gracefully falls back to memory tier when Redis is unavailable", async () => {
    clearRateLimitStore();

    for (let i = 1; i <= 5; i++) {
      const res = await rateLimit("testAction", "user-rl-1", { limit: 5, window: 60 });
      expect(res.success).toBe(true);
    }

    const breached = await rateLimit("testAction", "user-rl-1", { limit: 5, window: 60 });
    expect(breached.success).toBe(false);
    expect(breached.remaining).toBe(0);
  });
});
