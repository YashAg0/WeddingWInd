/**
 * __tests__/lib/legal-compliance-audit.test.ts
 *
 * Automated Legal, Compliance, Trust & Grievance Verification Suite
 *
 * Validates:
 * 1. Statutory Grievance Redressal compliance (IT Rules 2021 & Consumer Protection Rules 2020)
 * 2. Emergency helpline validity (Official Govt of India public services)
 * 3. Harmonized cancellation & refund tiers
 * 4. Transparent intermediary disclosure & statutory consumer guarantees
 * 5. Media consent and takedown protocol
 */

import { LEGAL_CONFIG } from "@/lib/constants/legal";

describe("Legal, Trust, Safety & Compliance Audit", () => {
  describe("1. Statutory Grievance Redressal Mechanism", () => {
    it("mandates valid Grievance Officer details", () => {
      expect(LEGAL_CONFIG.GRIEVANCE_OFFICER.NAME).toBeDefined();
      expect(LEGAL_CONFIG.GRIEVANCE_OFFICER.EMAIL).toMatch(/@weddingwithindia\.com$/);
      expect(LEGAL_CONFIG.GRIEVANCE_OFFICER.ADDRESS).toContain("Jaipur");
      expect(LEGAL_CONFIG.GRIEVANCE_OFFICER.ACKNOWLEDGMENT_TIMEFRAME_HOURS).toBe(24);
      expect(LEGAL_CONFIG.GRIEVANCE_OFFICER.RESOLUTION_TIMEFRAME_DAYS).toBe(15);
    });

    it("verifies privacy & data protection nodal contacts", () => {
      expect(LEGAL_CONFIG.DATA_PROTECTION.EMAIL).toMatch(/@weddingwithindia\.com$/);
      expect(LEGAL_CONFIG.DATA_PROTECTION.DPDP_NODAL_EMAIL).toMatch(/@weddingwithindia\.com$/);
      expect(LEGAL_CONFIG.DATA_PROTECTION.DPO_EMAIL).toMatch(/@weddingwithindia\.com$/);
    });
  });

  describe("2. Emergency Helplines (Official Indian Govt Services)", () => {
    it("contains authentic Indian national emergency numbers", () => {
      expect(LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.NATIONAL_EMERGENCY).toBe("112");
      expect(LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.TOURIST_HELPLINE_24X7).toBe("1363");
      expect(LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.AMBULANCE).toContain("108");
    });
  });

  describe("3. Harmonized Cancellation & Refund Rules", () => {
    it("enforces clear non-overlapping cancellation tiers", () => {
      const tiers = LEGAL_CONFIG.CANCELLATION_POLICY.TIERS;
      expect(tiers.length).toBe(3);

      // Tier 1: > 30 days -> 85%
      expect(tiers[0].REFUND_PERCENT).toBe(85);
      // Tier 2: 15-30 days -> 50%
      expect(tiers[1].REFUND_PERCENT).toBe(50);
      // Tier 3: < 15 days -> 0%
      expect(tiers[2].REFUND_PERCENT).toBe(0);

      // Host cancellation must be 100% full refund
      expect(LEGAL_CONFIG.CANCELLATION_POLICY.HOST_CANCELLATION_REFUND_PERCENT).toBe(100);
    });
  });

  describe("4. Intermediary Disclosure & Consumer Rights", () => {
    it("clearly defines marketplace intermediary status", () => {
      expect(LEGAL_CONFIG.INTERMEDIARY_DISCLOSURE).toContain("marketplace intermediary");
      expect(LEGAL_CONFIG.INTERMEDIARY_DISCLOSURE).toContain("does not organize, direct, own, or operate individual wedding ceremonies");
    });

    it("preserves non-excludable statutory consumer guarantees", () => {
      expect(LEGAL_CONFIG.STATUTORY_GUARANTEE_STATEMENT).toContain("Consumer Protection Act, 2019");
      expect(LEGAL_CONFIG.STATUTORY_GUARANTEE_STATEMENT).toContain("Australian Consumer Law");
    });
  });

  describe("5. Media Consent & Takedown Protocol", () => {
    it("restricts wedding photography to personal non-commercial use", () => {
      expect(LEGAL_CONFIG.MEDIA_CONSENT.ALLOWED_USE).toContain("Personal, non-commercial");
      expect(LEGAL_CONFIG.MEDIA_CONSENT.PROHIBITED_USE).toContain("Commercial monetization");
      expect(LEGAL_CONFIG.MEDIA_CONSENT.TAKEDOWN_EMAIL).toMatch(/@weddingwithindia\.com$/);
    });
  });
});
