import { POST } from "@/app/api/webhooks/stripe/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn((rawBody: string, signature: string, _secret: string) => {
        if (signature === "invalid_signature") {
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

jest.mock("@/lib/prisma", () => {
  const prismaMock: any = {
    stripeWebhookEvent: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    guestPass: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    travelerPreparation: {
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    sponsorshipRequest: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    wedding: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (fn: any) => fn(prismaMock)),
  };
  return { prisma: prismaMock };
});

const mockPrisma = prisma as any;

describe("Stripe Webhook API — Forensic Security & Idempotency Audit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("case 1: rejects webhook when stripe-signature header is missing", async () => {
    const payload = JSON.stringify({ id: "evt_no_sig", type: "checkout.session.completed" });
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Missing stripe-signature header");
  });

  it("case 1: rejects webhook when official stripe.webhooks.constructEvent signature is invalid", async () => {
    const payload = JSON.stringify({ id: "evt_bad_sig", type: "checkout.session.completed" });
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
      headers: {
        "stripe-signature": "invalid_signature",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Webhook signature verification failed");
  });

  it("case 18: handles valid signed event, marks booking PAID, creates payment and guest pass", async () => {
    mockPrisma.stripeWebhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.stripeWebhookEvent.upsert.mockResolvedValue({});
    mockPrisma.stripeWebhookEvent.update.mockResolvedValue({});

    mockPrisma.booking.findUnique.mockResolvedValue({
      id: "booking_123",
      status: "AWAITING_PAYMENT",
      totalAmount: 299,
      currency: "USD",
      date: new Date(),
      guestsCount: 2,
      traveler: { user: { id: "user_traveler", email: "traveler@test.com", name: "John Traveler" } },
      wedding: { title: "Royal Jaipur Celebration", hostCouple: { user: { id: "host_user" } } },
      payments: [],
      guestPasses: [],
    });
    mockPrisma.payment.findFirst.mockResolvedValue(null);
    mockPrisma.payment.create.mockResolvedValue({ id: "payment_stripe_1", amount: 299, status: "PAID" });
    mockPrisma.booking.update.mockResolvedValue({ id: "booking_123", status: "PAID" });
    mockPrisma.guestPass.findFirst.mockResolvedValue(null);
    mockPrisma.guestPass.create.mockResolvedValue({ id: "pass_123", status: "ACTIVE" });
    mockPrisma.transaction.create.mockResolvedValue({});

    const payload = JSON.stringify({
      id: "evt_test_checkout_123",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_session_123",
          payment_intent: "pi_test_intent_123",
          payment_status: "paid",
          amount_total: 29900,
          currency: "usd",
          metadata: { bookingId: "booking_123" },
        },
      },
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
      headers: {
        "stripe-signature": "t=123456,v1=valid_mock_signature",
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockPrisma.booking.update).toHaveBeenCalledWith({
      where: { id: "booking_123" },
      data: expect.objectContaining({ status: "PAID" }),
    });
    expect(mockPrisma.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bookingId: "booking_123",
          status: "PAID",
          provider: "STRIPE",
        }),
      })
    );
    expect(mockPrisma.guestPass.create).toHaveBeenCalled();
    expect(mockPrisma.stripeWebhookEvent.update).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_test_checkout_123" },
      data: expect.objectContaining({
        status: "PROCESSED",
      }),
    });
  });

  it("case 2: handles duplicate webhook events idempotently without re-executing activation", async () => {
    mockPrisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      id: "evt_db_1",
      stripeEventId: "evt_test_already_processed",
      status: "PROCESSED",
    });

    const payload = JSON.stringify({
      id: "evt_test_already_processed",
      type: "checkout.session.completed",
      data: { object: { id: "cs_123" } },
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
      headers: {
        "stripe-signature": "t=123456,v1=valid_mock_signature",
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.idempotent).toBe(true);
    expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
    expect(mockPrisma.guestPass.create).not.toHaveBeenCalled();
  });

  it("case 3: handles concurrent duplicate webhook race condition safely (P2002 unique constraint)", async () => {
    mockPrisma.stripeWebhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.stripeWebhookEvent.upsert.mockRejectedValue({ code: "P2002", message: "Unique constraint failed" });

    const payload = JSON.stringify({
      id: "evt_concurrent_race",
      type: "checkout.session.completed",
      data: { object: { id: "cs_concurrent" } },
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
      headers: {
        "stripe-signature": "t=123456,v1=valid_mock_signature",
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.idempotent).toBe(true);
  });

  it("does NOT activate if checkout session payment_status is not 'paid'", async () => {
    mockPrisma.stripeWebhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.stripeWebhookEvent.upsert.mockResolvedValue({});
    mockPrisma.stripeWebhookEvent.update.mockResolvedValue({});

    const payload = JSON.stringify({
      id: "evt_test_unpaid_checkout",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_unpaid_123",
          payment_status: "unpaid", // Unpaid!
        },
      },
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: payload,
      headers: {
        "stripe-signature": "t=123456,v1=valid_mock_signature",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockPrisma.stripeWebhookEvent.update).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_test_unpaid_checkout" },
      data: expect.objectContaining({
        status: "PROCESSED",
      }),
    });
  });
});
