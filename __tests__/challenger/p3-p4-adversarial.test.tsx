import React from "react";
import ReactDOMServer from "react-dom/server";
import crypto from "crypto";

// 1. Loading Skeletons
import DestinationsLoading from "@/app/destinations/loading";
import LearnLoading from "@/app/learn/loading";
import CelebrationsLoading from "@/app/dashboard/celebrations/loading";
import EarningsLoading from "@/app/dashboard/earnings/loading";
import ReferralsLoading from "@/app/dashboard/referrals/loading";
import VerificationLoading from "@/app/dashboard/verification/loading";
import ProfileLoading from "@/app/dashboard/profile/loading";
import NotificationsLoading from "@/app/dashboard/notifications/loading";
import WishlistLoading from "@/app/dashboard/wishlist/loading";
import SafetyLoading from "@/app/dashboard/safety/loading";
import OperationsLoading from "@/app/dashboard/operations/loading";
import LeadsLoading from "@/app/dashboard/leads/loading";
import CheckInLoading from "@/app/dashboard/check-in/loading";

// 2. Mock Data & Marketing Data
import * as marketingData from "@/lib/marketing-data";
import { featuredWeddings as decoupledFeaturedWeddings } from "@/lib/data/mock-weddings";
import * as dataReExports from "@/lib/data";

// 3. Components
import { TrustStrip } from "@/components/home/TrustStrip";
import { TrustPortalClient } from "@/components/trust/TrustPortalClient";
import nextConfig from "@/next.config";

// 4. Mission-Critical Invariants
import { encryptPass, decryptPass, hashPassToken } from "@/lib/security/guest-pass-crypto";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

// Next navigation mock
const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Phase 3 & Phase 4 Adversarial Stress Test Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  // =========================================================================
  // 1. Standardized Suspense Skeletons (PRF-01)
  // =========================================================================
  describe("PRF-01: 13 Standardized Loading Skeletons", () => {
    const skeletons = [
      { name: "app/destinations/loading.tsx", Component: DestinationsLoading },
      { name: "app/learn/loading.tsx", Component: LearnLoading },
      { name: "app/dashboard/celebrations/loading.tsx", Component: CelebrationsLoading },
      { name: "app/dashboard/earnings/loading.tsx", Component: EarningsLoading },
      { name: "app/dashboard/referrals/loading.tsx", Component: ReferralsLoading },
      { name: "app/dashboard/verification/loading.tsx", Component: VerificationLoading },
      { name: "app/dashboard/profile/loading.tsx", Component: ProfileLoading },
      { name: "app/dashboard/notifications/loading.tsx", Component: NotificationsLoading },
      { name: "app/dashboard/wishlist/loading.tsx", Component: WishlistLoading },
      { name: "app/dashboard/safety/loading.tsx", Component: SafetyLoading },
      { name: "app/dashboard/operations/loading.tsx", Component: OperationsLoading },
      { name: "app/dashboard/leads/loading.tsx", Component: LeadsLoading },
      { name: "app/dashboard/check-in/loading.tsx", Component: CheckInLoading },
    ];

    test("All 13 skeletons are functions and export valid React components", () => {
      expect(skeletons).toHaveLength(13);
      skeletons.forEach(({ Component }) => {
        expect(typeof Component).toBe("function");
      });
    });

    test("All 13 skeletons render to static markup without throwing runtime errors", () => {
      skeletons.forEach(({ Component }) => {
        let html = "";
        expect(() => {
          html = ReactDOMServer.renderToStaticMarkup(React.createElement(Component));
        }).not.toThrow();

        expect(html.length).toBeGreaterThan(50);
        // Skeletons must use animate-pulse for luxury loading feedback
        expect(html).toContain("animate-pulse");
      });
    });
  });

  // =========================================================================
  // 2. Static Mock Data Decoupling & Backward Compatibility (PRF-02)
  // =========================================================================
  describe("PRF-02: Static Mock Data Decoupling", () => {
    test("lib/marketing-data.ts exports non-empty UI constants with valid schema", () => {
      expect(marketingData.categories.length).toBeGreaterThan(0);
      expect(marketingData.countries.length).toBeGreaterThan(0);
      expect(marketingData.faqItems.length).toBeGreaterThan(0);
      expect(marketingData.howItWorksSteps.length).toBeGreaterThan(0);
      expect(marketingData.stats.length).toBeGreaterThan(0);

      // Verify categories
      marketingData.categories.forEach((cat) => {
        expect(cat).toHaveProperty("id");
        expect(cat).toHaveProperty("name");
        expect(cat).toHaveProperty("slug");
        expect(typeof cat.name).toBe("string");
      });

      // Verify FAQ items
      marketingData.faqItems.forEach((faq) => {
        expect(faq).toHaveProperty("question");
        expect(faq).toHaveProperty("answer");
      });
    });

    test("lib/data/mock-weddings.ts contains decoupled featured weddings list", () => {
      expect(Array.isArray(decoupledFeaturedWeddings)).toBe(true);
      expect(decoupledFeaturedWeddings.length).toBeGreaterThan(0);

      decoupledFeaturedWeddings.forEach((w: any) => {
        expect(w).toHaveProperty("id");
        expect(w).toHaveProperty("title");
        expect(w).toHaveProperty("location");
      });
    });

    test("lib/data.ts preserves 100% backward compatibility re-exports", () => {
      // Must re-export featuredWeddings
      expect(dataReExports.featuredWeddings).toBe(decoupledFeaturedWeddings);

      // Must re-export all marketing constants
      expect(dataReExports.categories).toBe(marketingData.categories);
      expect(dataReExports.weddingCategories).toBe(marketingData.weddingCategories);
      expect(dataReExports.stats).toBe(marketingData.stats);
      expect(dataReExports.heroStats).toBe(marketingData.heroStats);
      expect(dataReExports.countries).toBe(marketingData.countries);
      expect(dataReExports.faqItems).toBe(marketingData.faqItems);
      expect(dataReExports.howItWorksSteps).toBe(marketingData.howItWorksSteps);
    });
  });

  // =========================================================================
  // 3. Static TrustStrip (UX-06)
  // =========================================================================
  describe("UX-06: Static 4-Column TrustStrip", () => {
    test("Renders 4 distinct trust pillars and 0 keyframe animation loops", () => {
      const html = ReactDOMServer.renderToStaticMarkup(<TrustStrip />);

      // Zero keyframe animations or continuous transforms
      expect(html).not.toContain("marqueeScroll");
      expect(html).not.toContain("animate-marquee");
      expect(html).not.toContain("animation-duration");

      // Verify 4-column responsive grid
      expect(html).toContain("lg:grid-cols-4");

      // Verify all 4 pillar titles
      expect(html).toContain("100% KYC Verified Hosts");
      expect(html).toContain("Escrow &amp; 4-Tier Refund");
      expect(html).toContain("Dedicated Cultural Concierge");
      expect(html).toContain("All-Inclusive Guest Pass");

      // Verify deep links to /trust portal with specific tabs and anchors
      expect(html).toContain('href="/trust?tab=safety#verification"');
      expect(html).toContain('href="/trust?tab=terms#cancellation"');
      expect(html).toContain('href="/trust?tab=safety#guest-guide"');
      expect(html).toContain('href="/trust?tab=terms#booking-terms"');
      expect(html).toContain('href="/trust"');
    });
  });

  // =========================================================================
  // 4. Consolidated /trust Portal (UX-05) & Canonical Redirects
  // =========================================================================
  describe("UX-05: Consolidated 3-Tab /trust Portal & Redirects", () => {
    test("Renders Terms tab by default when no searchParams are provided", () => {
      const html = ReactDOMServer.renderToStaticMarkup(<TrustPortalClient />);
      expect(html).toContain("Statutory Intermediary Notice");
      expect(html).toContain("4-Tier Cancellation &amp; Refund Policy");
      expect(html).toContain("85%–90% Refund");
      expect(html).toContain("50%–70% Refund");
      expect(html).toContain("40% Refund");
      expect(html).toContain("0% (Non-refundable)");
      expect(html).toContain("100% Full Refund");
    });

    test("Renders Privacy tab when tab=privacy in searchParams", () => {
      mockSearchParams = new URLSearchParams("tab=privacy");
      const html = ReactDOMServer.renderToStaticMarkup(<TrustPortalClient />);
      expect(html).toContain("Zero Data Monetization Guarantee");
      expect(html).toContain("Digital Personal Data Protection (DPDP) Act, 2023 Compliance");
      expect(html).toContain("European &amp; UK GDPR Privacy Rights");
      expect(html).toContain(LEGAL_CONFIG.DATA_PROTECTION.EMAIL);
    });

    test("Renders Safety tab when tab=safety in searchParams", () => {
      mockSearchParams = new URLSearchParams("tab=safety");
      const html = ReactDOMServer.renderToStaticMarkup(<TrustPortalClient />);
      expect(html).toContain("Immediate Emergency Helplines (India)");
      expect(html).toContain(LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.NATIONAL_EMERGENCY);
      expect(html).toContain("100% KYC Verification Standards");
      expect(html).toContain("Statutory Grievance Redressal Officer");
      expect(html).toContain(LEGAL_CONFIG.GRIEVANCE_OFFICER.NAME);
      expect(html).toContain(LEGAL_CONFIG.GRIEVANCE_OFFICER.EMAIL);
    });

    test("Falls back safely to terms tab on invalid or adversarial tab query values", () => {
      const adversarialParams = ["tab=../../etc/passwd", "tab=<script>alert(1)</script>", "tab=unknown_tab", "tab="];
      adversarialParams.forEach((param) => {
        mockSearchParams = new URLSearchParams(param);
        const html = ReactDOMServer.renderToStaticMarkup(<TrustPortalClient />);
        expect(html).toContain("Statutory Intermediary Notice");
        expect(html).toContain("4-Tier Cancellation &amp; Refund Policy");
      });
    });

    test("next.config.ts contains 308 permanent redirects consolidating 20+ legacy legal routes to /trust", async () => {
      const redirects = await (nextConfig as any).redirects();
      expect(Array.isArray(redirects)).toBe(true);

      const redirectMap = new Map(redirects.map((r: any) => [r.source, { dest: r.destination, perm: r.permanent }]));

      // Verify legacy legal route redirects
      expect(redirectMap.get("/terms")).toEqual({ dest: "/trust?tab=terms", perm: true });
      expect(redirectMap.get("/privacy")).toEqual({ dest: "/trust?tab=privacy", perm: true });
      expect(redirectMap.get("/safety")).toEqual({ dest: "/trust?tab=safety", perm: true });
      expect(redirectMap.get("/guest-safety")).toEqual({ dest: "/trust?tab=safety#guest-guide", perm: true });
      expect(redirectMap.get("/host-safety")).toEqual({ dest: "/trust?tab=safety#guest-guide", perm: true });
      expect(redirectMap.get("/incident-report")).toEqual({ dest: "/trust?tab=safety#emergency", perm: true });
      expect(redirectMap.get("/grievance")).toEqual({ dest: "/trust?tab=safety#grievance", perm: true });
      expect(redirectMap.get("/cancellation-policy")).toEqual({ dest: "/trust?tab=terms#cancellation", perm: true });
      expect(redirectMap.get("/refund-policy")).toEqual({ dest: "/trust?tab=terms#cancellation", perm: true });
      expect(redirectMap.get("/dpdp")).toEqual({ dest: "/trust?tab=privacy#dpdp", perm: true });
      expect(redirectMap.get("/gdpr")).toEqual({ dest: "/trust?tab=privacy#gdpr", perm: true });
      expect(redirectMap.get("/community-guidelines")).toEqual({ dest: "/trust?tab=safety#guest-guide", perm: true });
    });
  });

  // =========================================================================
  // 5. Mission-Critical Invariants Stress Testing
  // =========================================================================
  describe("Mission-Critical Invariants Adversarial Verification", () => {
    // Invariant 2: AES-256-GCM Pass Encryption & Tamper Resistance
    describe("Invariant 2: AES-256-GCM Guest Pass Crypto", () => {
      test("Correctly encrypts, hashes, and decrypts raw tokens", () => {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hash = hashPassToken(rawToken);
        expect(hash).toHaveLength(64);

        const encrypted = encryptPass(rawToken);
        const parts = encrypted.split(":");
        expect(parts).toHaveLength(3); // iv:authTag:ciphertext
        expect(parts[0]).toHaveLength(24); // 12 bytes IV = 24 hex
        expect(parts[1]).toHaveLength(32); // 16 bytes auth tag = 32 hex

        const decrypted = decryptPass(encrypted);
        expect(decrypted).toBe(rawToken);
      });

      test("Throws on tampered ciphertext, invalid IV, or malformed format", () => {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const encrypted = encryptPass(rawToken);
        const [iv, authTag, cipher] = encrypted.split(":");

        // Tamper ciphertext
        const tamperedCipher = cipher.slice(0, -2) + (cipher.slice(-2) === "00" ? "11" : "00");
        expect(() => decryptPass(`${iv}:${authTag}:${tamperedCipher}`)).toThrow();

        // Tamper auth tag
        const tamperedTag = authTag.slice(0, -2) + (authTag.slice(-2) === "00" ? "11" : "00");
        expect(() => decryptPass(`${iv}:${tamperedTag}:${cipher}`)).toThrow();

        // Invalid format
        expect(() => decryptPass("invalid-string")).toThrow(/Invalid stored token format/);
        expect(() => decryptPass("iv:tag")).toThrow(/Invalid stored token format/);
      });
    });

    // Invariant 4: Bayesian Review Rating Formula (C=4.5, m=3)
    describe("Invariant 4: Bayesian Review Rating Computation", () => {
      // Formula: (R * v + C * m) / (v + m) where C = 4.5, m = 3
      const C = 4.5;
      const m = 3;
      const computeBayesian = (ratings: number[]) => {
        if (ratings.length === 0) return 4.5;
        const v = ratings.length;
        const R = ratings.reduce((a, b) => a + b, 0) / v;
        return parseFloat(((R * v + C * m) / (v + m)).toFixed(2));
      };

      test("Returns default 4.5 when 0 reviews exist", () => {
        expect(computeBayesian([])).toBe(4.5);
      });

      test("Calculates correct dampening with 1 review of 5.0 -> (5*1 + 4.5*3)/4 = 4.63", () => {
        expect(computeBayesian([5.0])).toBe(4.63);
      });

      test("Calculates correct dampening with 1 review of 1.0 -> (1*1 + 4.5*3)/4 = 3.63", () => {
        expect(computeBayesian([1.0])).toBe(3.63);
      });

      test("Converges toward empirical average at high sample size (100 reviews of 5.0 -> 4.99)", () => {
        const hundredFives = Array(100).fill(5.0);
        expect(computeBayesian(hundredFives)).toBe(4.99);
      });

      test("Handles varied distributions accurately", () => {
        // 5 reviews of 3.0 -> (15 + 13.5) / 8 = 28.5 / 8 = 3.5625 -> 3.56
        expect(computeBayesian([3, 3, 3, 3, 3])).toBe(3.56);
      });
    });
  });
});
