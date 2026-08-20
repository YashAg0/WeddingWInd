/**
 * __tests__/lib/server-client-boundary-architecture.test.ts
 *
 * Architectural Regression Test Suite for Server/Client Boundary Isolation.
 * Validates:
 * 1. lib/marketplace/ranking.ts is pure and client-safe (no server-only, next/headers, prisma, auth imports).
 * 2. lib/attribution/types.ts is pure and client-safe.
 * 3. lib/attribution/server.ts is strictly server-only with next/headers.
 * 4. lib/services/sponsorship.ts and lib/auth.ts are guarded with "server-only".
 * 5. components/home/FeaturedWeddings.tsx and components/wedding/WeddingCard.tsx do not import server-only modules.
 * 6. Pure ranking logic works deterministically on in-memory DTO objects.
 */

import fs from "fs";
import path from "path";
import {
  isSponsorshipCurrentlyActive,
  isFeaturedCurrentlyActive,
  getWeddingDiscoveryPriority,
  sortWeddingsByDiscoveryPriority,
} from "@/lib/marketplace/ranking";

describe("Next.js Server/Client Boundary Architectural Integrity", () => {
  const rootDir = process.cwd();

  const rankingCode = fs.readFileSync(path.join(rootDir, "lib/marketplace/ranking.ts"), "utf8");
  const attributionTypesCode = fs.readFileSync(path.join(rootDir, "lib/attribution/types.ts"), "utf8");
  const attributionClientCode = fs.readFileSync(path.join(rootDir, "lib/attribution/client.ts"), "utf8");
  const attributionServerCode = fs.readFileSync(path.join(rootDir, "lib/attribution/server.ts"), "utf8");
  const attributionEntryCode = fs.readFileSync(path.join(rootDir, "lib/attribution.ts"), "utf8");
  const authCode = fs.readFileSync(path.join(rootDir, "lib/auth.ts"), "utf8");
  const sponsorshipCode = fs.readFileSync(path.join(rootDir, "lib/services/sponsorship.ts"), "utf8");
  const weddingDtoCode = fs.readFileSync(path.join(rootDir, "lib/wedding-dto.ts"), "utf8");
  const featuredWeddingsCode = fs.readFileSync(path.join(rootDir, "components/home/FeaturedWeddings.tsx"), "utf8");
  const weddingCardCode = fs.readFileSync(path.join(rootDir, "components/wedding/WeddingCard.tsx"), "utf8");

  describe("1. Pure Client-Safe Modules Audit", () => {
    it("ensures lib/marketplace/ranking.ts has NO server-only or database imports", () => {
      expect(rankingCode).not.toContain("server-only");
      expect(rankingCode).not.toContain("next/headers");
      expect(rankingCode).not.toContain("next/cache");
      expect(rankingCode).not.toContain("@prisma/client");
      expect(rankingCode).not.toContain("@clerk/nextjs/server");
      expect(rankingCode).not.toContain("../auth");
      expect(rankingCode).not.toContain("../prisma");
    });

    it("ensures lib/attribution/types.ts and lib/attribution/client.ts have NO server dependencies", () => {
      expect(attributionTypesCode).not.toContain("server-only");
      expect(attributionTypesCode).not.toContain("next/headers");
      expect(attributionClientCode).not.toContain("server-only");
      expect(attributionClientCode).not.toContain("next/headers");
      expect(attributionClientCode).not.toContain("@prisma/client");
    });

    it("ensures lib/wedding-dto.ts imports ranking from pure marketplace ranking module", () => {
      expect(weddingDtoCode).toContain("./marketplace/ranking");
      expect(weddingDtoCode).not.toContain("./services/sponsorship");
      expect(weddingDtoCode).not.toContain("next/headers");
      expect(weddingDtoCode).not.toContain("@prisma/client");
    });

    it("ensures Client Components (FeaturedWeddings & WeddingCard) do not import server services", () => {
      expect(featuredWeddingsCode).not.toContain("lib/services/sponsorship");
      expect(featuredWeddingsCode).not.toContain("lib/auth");
      expect(featuredWeddingsCode).not.toContain("lib/attribution.server");
      expect(featuredWeddingsCode).not.toContain("next/headers");

      expect(weddingCardCode).not.toContain("lib/services/sponsorship");
      expect(weddingCardCode).not.toContain("lib/auth");
      expect(weddingCardCode).not.toContain("next/headers");
    });
  });

  describe("2. Server-Only Module Protection", () => {
    it("ensures lib/attribution/server.ts and lib/attribution.ts are protected with server-only", () => {
      expect(attributionServerCode).toContain("server-only");
      expect(attributionEntryCode).toContain("server-only");
    });

    it("ensures lib/auth.ts and lib/services/sponsorship.ts are protected with server-only", () => {
      expect(authCode).toContain("server-only");
      expect(sponsorshipCode).toContain("server-only");
    });
  });

  describe("3. Pure Ranking Logic Invariants", () => {
    const past = new Date(Date.now() - 3600000);
    const future = new Date(Date.now() + 3600000);

    it("evaluates SPONSORED (#1) > FEATURED (#2) > NORMAL (#3) accurately", () => {
      const normal = { id: "1", title: "Normal" };
      const featured = { id: "2", title: "Featured", featured: true };
      const sponsored = {
        id: "3",
        title: "Sponsored",
        sponsored: true,
        sponsorshipStart: past,
        sponsorshipEnd: future,
        sponsorshipRequests: [
          {
            status: "ACTIVE",
            paymentStatus: "PAYMENT_VERIFIED",
            paymentRequired: true,
            startsAt: past,
            endsAt: future,
            revokedAt: null,
          },
        ],
      };

      expect(getWeddingDiscoveryPriority(sponsored)).toBe(2);
      expect(getWeddingDiscoveryPriority(featured)).toBe(1);
      expect(getWeddingDiscoveryPriority(normal)).toBe(0);

      expect(isSponsorshipCurrentlyActive(sponsored)).toBe(true);
      expect(isFeaturedCurrentlyActive(sponsored)).toBe(false); // Exclusivity

      const sorted = sortWeddingsByDiscoveryPriority([normal, sponsored, featured]);
      expect(sorted.map((w) => w.id)).toEqual(["3", "2", "1"]);
    });
  });
});
