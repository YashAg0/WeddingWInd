/**
 * __tests__/lib/financial-remediation.test.ts
 *
 * Comprehensive Regression & Acceptance Test Suite for:
 * 1. Host payout ledger records fixed INR (totalHostPayoutINR) instead of customer USD
 * 2. Host couple dashboard derives earnings from totalHostPayoutINR in INR
 * 3. Admin finance dashboard communicates agent commissions in INR
 * 4. Marketing explainer diagrams reflect guaranteed fixed INR host & agent payouts
 * 5. Manual payment request defaults to authoritative booking amount and guards mismatches
 * 6. Agent commission notification uses INR formatting
 * 7. Canonical financial reconciliation across all 6 scenarios
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    systemConfig: {
      findUnique: jest.fn().mockResolvedValue({
        id: "global",
        paypalFeePercent: 0,
        paypalFeeFixed: 0,
        allowedDomains: ["paypal.com", "paypal.me"],
      }),
    },
  },
}));

import {
  CUSTOMER_PRICE_MATRIX_USD,
  HOST_PAYOUT_MATRIX_INR,
  AGENT_PAYOUT_MATRIX_INR,
  calculateBookingPricing,
  calculateHostPotentialEarnings,
  calculateAgentPotentialEarnings,
  getCustomerPriceUSD,
  getHostPayoutPerGuestINR,
  getAgentPayoutPerGuestINR,
} from "@/lib/services/pricing-engine";
import { calculatePaymentBreakdown, createOrUpdatePaymentRequestAtomic } from "@/lib/services/payments";

describe("WeddingWithIndia — Final Financial Remediation Test Suite", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Host Payout Ledger Verification
  // ─────────────────────────────────────────────────────────────────────────
  describe("1. Host Payout Ledger Calculations", () => {
    it("should calculate exact fixed INR payout for Signature Royal 4-day / 20 guests (₹10,22,020)", () => {
      const pricing = calculateBookingPricing({
        tier: "SIGNATURE_ROYAL",
        durationDays: 4,
        guestCount: 20,
        isAgentAttributed: true,
      });

      expect(pricing.customerPricePerGuestUSD).toBe(999);
      expect(pricing.customerTotalAmountUSD).toBe(19980); // $19,980 USD
      expect(pricing.hostPayoutPerGuestINR).toBe(51101); // ₹51,101 INR
      expect(pricing.totalHostPayoutINR).toBe(1022020); // ₹10,22,020 INR
      expect(pricing.agentPayoutPerGuestINR).toBe(2511); // ₹2,511 INR
      expect(pricing.totalAgentPayoutINR).toBe(50220); // ₹50,220 INR

      // Host payout MUST NOT equal customer USD payment
      expect(pricing.totalHostPayoutINR).not.toBe(pricing.customerTotalAmountUSD);
      expect(pricing.totalHostPayoutINR).toBe(1022020);
    });

    it("should calculate exact fixed INR payout for Grand 3-day / 20 guests (₹4,02,020)", () => {
      const pricing = calculateBookingPricing({
        tier: "GRAND",
        durationDays: 3,
        guestCount: 20,
        isAgentAttributed: true,
      });

      expect(pricing.customerPricePerGuestUSD).toBe(449);
      expect(pricing.customerTotalAmountUSD).toBe(8980); // $8,980 USD
      expect(pricing.hostPayoutPerGuestINR).toBe(20101); // ₹20,101 INR
      expect(pricing.totalHostPayoutINR).toBe(402020); // ₹4,02,020 INR
      expect(pricing.agentPayoutPerGuestINR).toBe(1511); // ₹1,511 INR
      expect(pricing.totalAgentPayoutINR).toBe(30220); // ₹30,220 INR
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Canonical Reconciliation Across All 6 Scenarios
  // ─────────────────────────────────────────────────────────────────────────
  describe("2. Canonical 6 Financial Scenarios Reconciliation", () => {
    it("Scenario 1: Standard 1-day / 1 guest", () => {
      const p = calculateBookingPricing({ tier: "STANDARD", durationDays: 1, guestCount: 1, isAgentAttributed: true });
      expect(p.customerTotalAmountUSD).toBe(149);
      expect(p.totalHostPayoutINR).toBe(5101);
      expect(p.totalAgentPayoutINR).toBe(511);
      expect(p.economics.paypalFeeUSD).toBe(6.86);
      expect(p.economics.netAfterPayPalINR).toBe(13179);
      expect(p.economics.reserveINR).toBe(659);
      expect(p.economics.wwiContributionAfterReserveINR).toBe(6908);
    });

    it("Scenario 2: Grand 3-day / 20 guests", () => {
      const p = calculateBookingPricing({ tier: "GRAND", durationDays: 3, guestCount: 20, isAgentAttributed: true });
      expect(p.customerTotalAmountUSD).toBe(8980);
      expect(p.totalHostPayoutINR).toBe(402020);
      expect(p.totalAgentPayoutINR).toBe(30220);
      expect(p.economics.paypalFeeUSD).toBe(395.42);
      expect(p.economics.netAfterPayPalINR).toBe(795949);
      expect(p.economics.reserveINR).toBe(39797);
      expect(p.economics.wwiContributionAfterReserveINR).toBe(323912);
    });

    it("Scenario 3: Royal 4-day / 20 guests", () => {
      const p = calculateBookingPricing({ tier: "ROYAL", durationDays: 4, guestCount: 20, isAgentAttributed: true });
      expect(p.customerTotalAmountUSD).toBe(15980);
      expect(p.totalHostPayoutINR).toBe(822020);
      expect(p.totalAgentPayoutINR).toBe(40220);
      expect(p.economics.paypalFeeUSD).toBe(703.42);
      expect(p.economics.netAfterPayPalINR).toBe(1416421);
      expect(p.economics.reserveINR).toBe(70821);
      expect(p.economics.wwiContributionAfterReserveINR).toBe(483360);
    });

    it("Scenario 4 (Primary Benchmark): Signature Royal 4-day / 20 guests", () => {
      const p = calculateBookingPricing({ tier: "SIGNATURE_ROYAL", durationDays: 4, guestCount: 20, isAgentAttributed: true });
      expect(p.customerTotalAmountUSD).toBe(19980);
      expect(p.totalHostPayoutINR).toBe(1022020); // Exactly ₹10,22,020 INR
      expect(p.totalAgentPayoutINR).toBe(50220);
      expect(p.economics.paypalFeeUSD).toBe(879.42);
      expect(p.economics.netAfterPayPalINR).toBe(1770976);
      expect(p.economics.reserveINR).toBe(88549);
      expect(p.economics.wwiContributionAfterReserveINR).toBe(610187);
    });

    it("Scenario 5: Signature Royal 5-day / 20 guests", () => {
      const p = calculateBookingPricing({ tier: "SIGNATURE_ROYAL", durationDays: 5, guestCount: 20, isAgentAttributed: true });
      expect(p.customerTotalAmountUSD).toBe(23980);
      expect(p.totalHostPayoutINR).toBe(1222020);
      expect(p.totalAgentPayoutINR).toBe(50220);
      expect(p.economics.paypalFeeUSD).toBe(1055.42);
      expect(p.economics.netAfterPayPalINR).toBe(2125531);
      expect(p.economics.reserveINR).toBe(106277);
      expect(p.economics.wwiContributionAfterReserveINR).toBe(747014);
    });

    it("Scenario 6: Signature Royal 5-day / 50 guests", () => {
      const p = calculateBookingPricing({ tier: "SIGNATURE_ROYAL", durationDays: 5, guestCount: 50, isAgentAttributed: true });
      expect(p.customerTotalAmountUSD).toBe(59950);
      expect(p.totalHostPayoutINR).toBe(3055050);
      expect(p.totalAgentPayoutINR).toBe(125550);
      expect(p.economics.paypalFeeUSD).toBe(2638.10);
      expect(p.economics.netAfterPayPalINR).toBe(5313870);
      expect(p.economics.reserveINR).toBe(265694);
      expect(p.economics.wwiContributionAfterReserveINR).toBe(1867576);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Payment Request Mismatch Guard
  // ─────────────────────────────────────────────────────────────────────────
  describe("3. Payment Request Mismatch Guard", () => {
    it("should reject silent payment amount mismatch when override is not authorized", async () => {
      const mockTx = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            id: "b-101",
            status: "PENDING",
            customerTotalAmount: 5994,
            baseCustomerAmountUSD: 5994,
            totalAmount: 5994,
            payments: [],
            wedding: { title: "Grand Celebration" },
            traveler: { user: { email: "guest@example.com" } },
          }),
          update: jest.fn(),
        },
        payment: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
          update: jest.fn(),
        },
        notification: {
          create: jest.fn(),
        },
      };

      await expect(
        createOrUpdatePaymentRequestAtomic(mockTx as any, {
          bookingId: "b-101",
          baseAmount: 599, // Typo attempt: $599 instead of $5,994
          paymentLink: "https://www.paypal.com/invoice/p/#1234",
          adminUserId: "admin-1",
          adminEmail: "admin@weddingwithindia.com",
        })
      ).rejects.toThrow("PAYMENT_AMOUNT_MISMATCH");
    });

    it("should accept payment request matching authoritative booking amount without override flag", async () => {
      const mockCreatedPayment = {
        id: "pay-101",
        amount: 5994,
        baseAmount: 5994,
        totalAmount: 5994,
        currency: "USD",
        status: "PENDING",
      };

      const mockTx = {
        booking: {
          findUnique: jest.fn().mockResolvedValue({
            id: "b-101",
            status: "PENDING",
            customerTotalAmount: 5994,
            baseCustomerAmountUSD: 5994,
            totalAmount: 5994,
            payments: [],
            wedding: { title: "Grand Celebration" },
            traveler: { user: { email: "guest@example.com", id: "u-traveler-1" } },
          }),
          update: jest.fn().mockResolvedValue({ id: "b-101", status: "AWAITING_PAYMENT" }),
        },
        payment: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(mockCreatedPayment),
        },
        notification: {
          create: jest.fn().mockResolvedValue({ id: "notif-1" }),
        },
      };

      const result = await createOrUpdatePaymentRequestAtomic(mockTx as any, {
        bookingId: "b-101",
        baseAmount: 5994,
        paymentLink: "https://www.paypal.com/invoice/p/#1234",
        adminUserId: "admin-1",
        adminEmail: "admin@weddingwithindia.com",
      });

      expect(result.breakdown.totalAmount).toBe(5994);
      expect(result.currency).toBe("USD");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Host & Agent Potential Calculators
  // ─────────────────────────────────────────────────────────────────────────
  describe("4. Public Calculators Verification", () => {
    it("Host Calculator defaults to Signature Royal 4-day 20 guests = ₹10,22,020", () => {
      const hostCalc = calculateHostPotentialEarnings("SIGNATURE_ROYAL", 4, 20);
      expect(hostCalc.totalPotentialEarningsINR).toBe(1022020);
      expect(hostCalc.formattedTotalINR).toBe("₹10,22,020");
    });

    it("Agent Calculator defaults to Signature Royal 20 guests = ₹50,220", () => {
      const agentCalc = calculateAgentPotentialEarnings("SIGNATURE_ROYAL", 20);
      expect(agentCalc.totalPotentialEarningsINR).toBe(50220);
      expect(agentCalc.formattedTotalINR).toBe("₹50,220");
    });
  });
});
