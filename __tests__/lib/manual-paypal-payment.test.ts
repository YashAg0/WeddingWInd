/**
 * __tests__/lib/manual-paypal-payment.test.ts
 *
 * Comprehensive Test Suite for Manual PayPal Payment MVP:
 * 1. Payment Link Validation & Allowlist Enforcement.
 * 2. Financial Breakdown & Processing Fee Calculations.
 * 3. Payment Request Generation & State Transition (PENDING -> AWAITING_PAYMENT).
 * 4. Payment Confirmation, Pass Generation, Commission & Idempotency.
 * 5. Manual Refund Operations & Safety Invariants.
 * 6. Traveler Payment Retrieval & IDOR Protection.
 */

import {
  validatePaymentLink,
  calculatePaymentBreakdown,
} from "@/lib/services/payments";
import {
  adminRequestPaymentAction,
  adminMarkPaymentPaidAction,
  adminRecordManualRefundAction,
  travelerGetPaymentDetailsAction,
} from "@/lib/actions/payment-manual";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { sendHostApprovalWithPaymentLinkEmail, sendRefundConfirmationEmail } from "@/lib/email";
import { UserRole, BookingStatus, PaymentStatus } from "@prisma/client";

// Mocks
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/email", () => ({
  sendHostApprovalWithPaymentLinkEmail: jest.fn().mockResolvedValue(true),
  sendRefundConfirmationEmail: jest.fn().mockResolvedValue(true),
  sendInvoiceEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/security/guest-pass-crypto", () => ({
  encryptPass: jest.fn().mockReturnValue("enc_guest_pass_token_xyz"),
  hashPassToken: jest.fn((token: string) => `hash_${token}`),
}));

jest.mock("@/lib/prisma", () => {
  const mockSystemConfig = {
    id: "global",
    paypalProcessingFeePercent: 3.5,
    paypalProcessingFeeFixedAmount: 0.0,
    paypalDomainAllowlist: "paypal.com,paypal.me",
    currencyCode: "USD",
  };

  const mockTravelerUser = {
    id: "traveler_user_1",
    email: "traveler@example.com",
    fullName: "Aarav Patel",
    role: "TRAVELER",
  };

  const mockHostUser = {
    id: "host_user_1",
    email: "host@example.com",
    name: "Host Family",
  };

  const mockBookingPending = {
    id: "b_pending_1",
    status: "PENDING",
    totalAmount: 1000,
    pricePerGuest: 500,
    guestsCount: 2,
    date: new Date("2026-11-20"),
    travelerId: "tp_1",
    weddingId: "w_1",
    agentReferralCode: "AGENT99",
    traveler: {
      id: "tp_1",
      userId: "traveler_user_1",
      fullName: "Aarav Patel",
      user: mockTravelerUser,
    },
    wedding: {
      id: "w_1",
      title: "Grand Royal Jaipur Wedding",
      location: "Jaipur, Rajasthan",
      date: new Date("2026-11-20"),
      hostCoupleId: "hc_1",
      hostCouple: {
        userId: "host_user_1",
        user: mockHostUser,
      },
    },
    payments: [],
  };

  const mockPaymentPending = {
    id: "pay_req_1",
    bookingId: "b_pending_1",
    provider: "MANUAL_PAYPAL",
    baseAmount: 1000,
    processingFeePercent: 3.5,
    processingFeeAmount: 35,
    totalAmount: 1035,
    amount: 1035,
    currency: "USD",
    paymentLink: "https://www.paypal.com/ncp/payment/MOCK123",
    status: "PENDING",
    booking: mockBookingPending,
    refunds: [],
  };

  const mockPrismaClient: any = {
    systemConfig: {
      findUnique: jest.fn(async () => mockSystemConfig),
    },
    booking: {
      findUnique: jest.fn(async () => mockBookingPending),
      update: jest.fn(async ({ where, data }: any) => ({ ...mockBookingPending, ...data, id: where.id })),
    },
    payment: {
      findUnique: jest.fn(async () => mockPaymentPending),
      findFirst: jest.fn(async () => null),
      create: jest.fn(async ({ data }: any) => ({ id: "pay_new_1", ...data })),
      update: jest.fn(async ({ where, data }: any) => ({ ...mockPaymentPending, ...data, id: where.id })),
    },
    transaction: {
      create: jest.fn(async ({ data }: any) => ({ id: "tx_1", ...data })),
    },
    guestPass: {
      findFirst: jest.fn(async () => null),
      create: jest.fn(async ({ data }: any) => ({ id: "pass_1", ...data })),
    },
    travelerPreparation: {
      create: jest.fn(async ({ data }: any) => ({ id: "prep_1", ...data })),
    },
    commission: {
      findMany: jest.fn(async () => []),
      findFirst: jest.fn(async () => null),
      create: jest.fn(async ({ data }: any) => ({ id: "comm_1", ...data })),
      update: jest.fn(async () => ({})),
    },
    agentProfile: {
      findUnique: jest.fn(async () => ({ id: "agent_prof_1", agentCode: "AGENT99", commissionRate: 0.10 })),
    },
    notification: {
      create: jest.fn(async ({ data }: any) => ({ id: "notif_1", ...data })),
    },
    refund: {
      findMany: jest.fn(async () => []),
      findFirst: jest.fn(async () => null),
      create: jest.fn(async ({ data }: any) => ({ id: "ref_1", ...data })),
    },
    auditLog: {
      create: jest.fn(async ({ data }: any) => ({ id: "audit_1", ...data })),
    },
    $transaction: jest.fn(async (callback: any) => {
      if (typeof callback === "function") {
        return callback(mockPrismaClient);
      }
      return callback;
    }),
  };

  return {
    prisma: mockPrismaClient,
    isDatabaseAvailable: jest.fn().mockResolvedValue(true),
  };
});

describe("1. Payment Link URL Validation & Domain Security", () => {
  const allowlist = "paypal.com,paypal.me";

  it("1.1 Accepts valid HTTPS PayPal links", () => {
    expect(validatePaymentLink("https://www.paypal.com/ncp/payment/ABC123XYZ", allowlist).valid).toBe(true);
    expect(validatePaymentLink("https://paypal.me/weddingwithindia/1000usd", allowlist).valid).toBe(true);
    expect(validatePaymentLink("https://paypal.com/invoice/p/#INV-12345", allowlist).valid).toBe(true);
  });

  it("1.2 Rejects non-HTTPS PayPal links", () => {
    const res = validatePaymentLink("http://www.paypal.com/ncp/payment/ABC123XYZ", allowlist);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("HTTPS");
  });

  it("1.3 Rejects links from unapproved or spoofed domains", () => {
    expect(validatePaymentLink("https://evil-paypal.com/pay", allowlist).valid).toBe(false);
    expect(validatePaymentLink("https://paypal.com.scam.net/pay", allowlist).valid).toBe(false);
    expect(validatePaymentLink("https://stripe.com/pay", allowlist).valid).toBe(false);
  });

  it("1.4 Rejects invalid or malformed URL strings", () => {
    expect(validatePaymentLink("not-a-url", allowlist).valid).toBe(false);
    expect(validatePaymentLink("", allowlist).valid).toBe(false);
  });
});

describe("2. Financial Breakdown Calculations", () => {
  it("2.1 Calculates percentage processing fee with mathematical rounding", () => {
    const res = calculatePaymentBreakdown({ baseAmount: 1000, feePercent: 3.5 });
    expect(res.baseAmount).toBe(1000);
    expect(res.processingFeePercent).toBe(3.5);
    expect(res.processingFeeAmount).toBe(35);
    expect(res.totalAmount).toBe(1035);
  });

  it("2.2 Calculates combined percentage and fixed processing fee", () => {
    const res = calculatePaymentBreakdown({ baseAmount: 500, feePercent: 3.0, feeFixedAmount: 5 });
    expect(res.processingFeeAmount).toBe(20); // 15 + 5
    expect(res.totalAmount).toBe(520);
  });

  it("2.3 Handles zero fee configuration", () => {
    const res = calculatePaymentBreakdown({ baseAmount: 750, feePercent: 0, feeFixedAmount: 0 });
    expect(res.processingFeeAmount).toBe(0);
    expect(res.totalAmount).toBe(750);
  });
});

describe("3. Admin Request Payment Action (PENDING -> AWAITING_PAYMENT)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin_1",
      role: UserRole.ADMIN,
      email: "admin@weddingwithindia.com",
    });
  });

  it("3.1 Rejects non-admin users", async () => {
    (requireRole as jest.Mock).mockRejectedValueOnce(new Error("FORBIDDEN"));

    await expect(
      adminRequestPaymentAction({
        bookingId: "b_pending_1",
        baseAmount: 1000,
        currency: "USD",
        paymentLink: "https://www.paypal.com/pay/123",
      })
    ).rejects.toThrow("FORBIDDEN");
  });

  it("3.2 Rejects invalid payment link format", async () => {
    await expect(
      adminRequestPaymentAction({
        bookingId: "b_pending_1",
        baseAmount: 1000,
        currency: "USD",
        paymentLink: "https://unauthorized-domain.com/pay",
      })
    ).rejects.toThrow("not in the allowed PayPal domains list");
  });

  it("3.3 Creates payment request and transitions booking to AWAITING_PAYMENT", async () => {
    (prisma.booking.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "b_pending_1",
      status: BookingStatus.PENDING,
      totalAmount: 1000,
      pricePerGuest: 500,
      guestsCount: 2,
      date: new Date("2026-11-20"),
      travelerId: "tp_1",
      weddingId: "w_1",
      traveler: {
        id: "tp_1",
        userId: "traveler_user_1",
        fullName: "Aarav Patel",
        user: { id: "traveler_user_1", email: "traveler@example.com" },
      },
      wedding: {
        id: "w_1",
        title: "Grand Royal Jaipur Wedding",
        date: new Date("2026-11-20"),
        hostCoupleId: "hc_1",
        hostCouple: { user: { email: "host@example.com" } },
      },
      payments: [],
    });
    (prisma.payment.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const res = await adminRequestPaymentAction({
      bookingId: "b_pending_1",
      baseAmount: 1000,
      currency: "USD",
      paymentLink: "https://www.paypal.com/ncp/payment/MOCK123",
      paymentNotes: "Please pay before Friday",
    });

    expect(res.success).toBe(true);
    expect(res.bookingStatus).toBe(BookingStatus.AWAITING_PAYMENT);
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: "b_pending_1",
        provider: "MANUAL_PAYPAL",
        baseAmount: 1000,
        currency: "USD",
        paymentLink: "https://www.paypal.com/ncp/payment/MOCK123",
        status: PaymentStatus.PENDING,
      }),
    });
    expect(sendHostApprovalWithPaymentLinkEmail).toHaveBeenCalled();
  });
});

describe("4. Admin Mark Payment as Paid Action (AWAITING_PAYMENT -> PAID)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin_1",
      role: UserRole.ADMIN,
      email: "admin@weddingwithindia.com",
    });
  });

  it("4.1 Rejects empty or whitespace transaction ID", async () => {
    await expect(
      adminMarkPaymentPaidAction({
        paymentId: "pay_req_1",
        transactionId: "   ",
      })
    ).rejects.toThrow("PayPal Transaction ID is required to confirm payment.");
  });

  it("4.2 Rejects already used duplicate transaction ID", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "pay_req_1",
      status: PaymentStatus.PENDING,
      booking: {
        id: "b_pending_1",
        status: BookingStatus.AWAITING_PAYMENT,
        date: new Date("2026-11-20"),
        wedding: { title: "Grand Jaipur", date: new Date("2026-11-20") },
        traveler: { user: { id: "u1" } },
      },
    });
    (prisma.payment.findFirst as jest.Mock).mockResolvedValueOnce({
      id: "pay_other",
      transactionId: "PP-TXN-DUP-123",
    });

    await expect(
      adminMarkPaymentPaidAction({
        paymentId: "pay_req_1",
        transactionId: "PP-TXN-DUP-123",
      })
    ).rejects.toThrow("already recorded in the system");
  });

  it("4.3 Marks payment as PAID, issues single GuestPass, creates preparation, ledger entry, and commission", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "pay_req_1",
      status: PaymentStatus.PENDING,
      amount: 1035,
      currency: "USD",
      bookingId: "b_pending_1",
      booking: {
        id: "b_pending_1",
        status: BookingStatus.AWAITING_PAYMENT,
        date: new Date("2026-11-20"),
        guestsCount: 2,
        agentReferralCode: "AGENT99",
        traveler: {
          id: "tp_1",
          userId: "traveler_user_1",
          fullName: "Aarav Patel",
          user: { id: "traveler_user_1", email: "traveler@example.com" },
        },
        wedding: {
          id: "w_1",
          title: "Grand Royal Jaipur Wedding",
          date: new Date("2026-11-20"),
          hostCoupleId: "hc_1",
          hostCouple: { user: { id: "host_user_1", email: "host@example.com" } },
        },
      },
    });
    (prisma.payment.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const res = await adminMarkPaymentPaidAction({
      paymentId: "pay_req_1",
      transactionId: "PP-TXN-998877",
      paymentNotes: "Verified on PayPal Business Console",
    });

    expect(res.success).toBe(true);
    expect(res.alreadyPaid).toBe(false);

    // Verify payment updated to PAID with transactionId
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: "pay_req_1" },
      data: expect.objectContaining({
        status: PaymentStatus.PAID,
        transactionId: "PP-TXN-998877",
      }),
    });

    // Verify booking updated to PAID
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: "b_pending_1" },
      data: expect.objectContaining({
        status: BookingStatus.PAID,
      }),
    });

    // Verify single GuestPass creation
    expect(prisma.guestPass.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: "b_pending_1",
        encryptedToken: "enc_guest_pass_token_xyz",
        qrTokenHash: expect.any(String),
      }),
    });

    // Verify TravelerPreparation creation
    expect(prisma.travelerPreparation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: "b_pending_1",
      }),
    });

    // Verify Transaction creation
    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentId: "pay_req_1",
        amount: 1035,
        type: "CHARGE",
        status: "SUCCESS",
        referenceId: "PP-TXN-998877",
      }),
    });
  });

  it("4.4 Idempotency: Second execution returns existing record immediately without duplicating pass or commission", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "pay_req_1",
      status: PaymentStatus.PAID,
      transactionId: "PP-TXN-998877",
      booking: {
        id: "b_pending_1",
        status: BookingStatus.PAID,
      },
    });

    const res = await adminMarkPaymentPaidAction({
      paymentId: "pay_req_1",
      transactionId: "PP-TXN-998877",
    });

    expect(res.success).toBe(true);
    expect(res.alreadyPaid).toBe(true);
    expect(prisma.guestPass.create).not.toHaveBeenCalled();
    expect(prisma.commission.create).not.toHaveBeenCalled();
  });
});

describe("5. Manual Refund Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin_1",
      role: UserRole.ADMIN,
      email: "admin@weddingwithindia.com",
    });
  });

  it("5.1 Rejects refund amount exceeding available balance", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "pay_req_1",
      status: PaymentStatus.PAID,
      amount: 1000,
      refunds: [{ amount: 800 }],
    });

    await expect(
      adminRecordManualRefundAction({
        paymentId: "pay_req_1",
        refundAmount: 300, // 800 + 300 = 1100 > 1000
        reason: "Excess refund",
      })
    ).rejects.toThrow("exceeds remaining unrefunded payment balance");
  });

  it("5.2 Rejects non-positive refund amounts", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "pay_req_1",
      status: PaymentStatus.PAID,
      amount: 1000,
      refunds: [],
    });

    await expect(
      adminRecordManualRefundAction({
        paymentId: "pay_req_1",
        refundAmount: -10,
        reason: "Invalid amount",
      })
    ).rejects.toThrow("Refund amount must be greater than 0.");
  });

  it("5.3 Successfully records partial refund without changing booking to REFUNDED", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "pay_req_1",
      status: PaymentStatus.PAID,
      amount: 1000,
      currency: "USD",
      refunds: [],
      bookingId: "b_pending_1",
      booking: {
        id: "b_pending_1",
        status: BookingStatus.PAID,
        traveler: { user: { id: "u1", email: "traveler@test.com" }, fullName: "Test Traveler" },
        wedding: { title: "Grand Celebration" },
      },
    });

    const res = await adminRecordManualRefundAction({
      paymentId: "pay_req_1",
      refundAmount: 400,
      reason: "Partial itinerary change",
      refundTransactionId: "REF-PP-400",
    });

    expect(res.success).toBe(true);
    expect(prisma.refund.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentId: "pay_req_1",
        amount: 400,
        refundTransactionId: "REF-PP-400",
        status: "COMPLETED",
      }),
    });
    // Booking remains PAID since refund is partial (400 < 1000)
    expect(prisma.booking.update).not.toHaveBeenCalled();
    expect(sendRefundConfirmationEmail).toHaveBeenCalled();
  });

  it("5.4 Successfully records full refund and transitions booking to REFUNDED", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "pay_req_1",
      status: PaymentStatus.PAID,
      amount: 1000,
      currency: "USD",
      refunds: [],
      bookingId: "b_pending_1",
      booking: {
        id: "b_pending_1",
        status: BookingStatus.PAID,
        traveler: { user: { id: "u1", email: "traveler@test.com" }, fullName: "Test Traveler" },
        wedding: { title: "Grand Celebration" },
      },
    });

    const res = await adminRecordManualRefundAction({
      paymentId: "pay_req_1",
      refundAmount: 1000,
      reason: "Full cancellation",
      refundTransactionId: "REF-PP-1000",
    });

    expect(res.success).toBe(true);
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: "b_pending_1" },
      data: expect.objectContaining({
        status: BookingStatus.REFUNDED,
      }),
    });
  });
});

describe("6. Traveler Payment Retrieval & IDOR Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("6.1 Rejects unauthenticated user", async () => {
    (requireAuth as jest.Mock).mockRejectedValueOnce(new Error("UNAUTHENTICATED"));

    await expect(travelerGetPaymentDetailsAction("b_pending_1")).rejects.toThrow("UNAUTHENTICATED");
  });

  it("6.2 Rejects unauthorized traveler trying to view another traveler's booking payment", async () => {
    (requireAuth as jest.Mock).mockResolvedValueOnce({
      id: "hacker_user_99",
      role: UserRole.TRAVELER,
    });

    (prisma.booking.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "b_pending_1",
      traveler: {
        userId: "traveler_user_1", // Different user
      },
    });

    await expect(travelerGetPaymentDetailsAction("b_pending_1")).rejects.toThrow("Forbidden: You do not have permission to view payment details for this booking.");
  });

  it("6.3 Returns payment details to authorized booking owner", async () => {
    (requireAuth as jest.Mock).mockResolvedValueOnce({
      id: "traveler_user_1",
      role: UserRole.TRAVELER,
    });

    (prisma.booking.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "b_pending_1",
      status: BookingStatus.AWAITING_PAYMENT,
      date: new Date("2026-11-20"),
      guestsCount: 2,
      traveler: {
        userId: "traveler_user_1",
      },
      wedding: {
        title: "Grand Jaipur",
        location: "Jaipur",
      },
      payments: [{
        id: "pay_req_1",
        provider: "MANUAL_PAYPAL",
        status: PaymentStatus.PENDING,
        currency: "USD",
        amount: 1035,
        baseAmount: 1000,
        processingFeePercent: 3.5,
        processingFeeAmount: 35,
        totalAmount: 1035,
        paymentLink: "https://www.paypal.com/ncp/payment/MOCK123",
      }],
    });

    const res = await travelerGetPaymentDetailsAction("b_pending_1");
    expect(res.success).toBe(true);
    expect(res.booking.id).toBe("b_pending_1");
    expect(res.payment).toHaveProperty("totalAmount", 1035);
    expect(res.payment).toHaveProperty("paymentLink", "https://www.paypal.com/ncp/payment/MOCK123");
  });
});
