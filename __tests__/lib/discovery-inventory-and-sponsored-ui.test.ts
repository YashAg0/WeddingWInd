import fs from "fs";
import path from "path";
import { featuredWeddings } from "@/lib/data";
import {
  sortWeddingsByDiscoveryPriority,
  getWeddingDiscoveryPriority,
  isSponsorshipCurrentlyActive,
  isFeaturedCurrentlyActive,
} from "@/lib/marketplace/ranking";

describe("Discovery Inventory Restoration and Ranking Invariants", () => {
  test("Complete discovery inventory contains all 21 curated weddings (NOT limited to 8)", () => {
    expect(featuredWeddings.length).toBeGreaterThanOrEqual(21);
    expect(featuredWeddings.length).toBe(21);
  });

  test("Ranking does NOT filter out normal weddings (ranking is not filtering)", () => {
    const inputCount = featuredWeddings.length;
    const sorted = sortWeddingsByDiscoveryPriority(featuredWeddings);

    // Array length must be strictly preserved
    expect(sorted.length).toBe(inputCount);

    // Normal listings (tier 0) must remain present and discoverable
    const normalListings = sorted.filter((w) => getWeddingDiscoveryPriority(w) === 0);
    expect(normalListings.length).toBeGreaterThan(0);
    expect(sorted).toEqual(expect.arrayContaining(normalListings));
  });

  test("3-Tier Discovery Invariant: SPONSORED > FEATURED > NORMAL", () => {
    const sorted = sortWeddingsByDiscoveryPriority(featuredWeddings);

    let currentHighestTier = 2;
    for (const wedding of sorted) {
      const priority = getWeddingDiscoveryPriority(wedding);
      expect(priority).toBeLessThanOrEqual(currentHighestTier);
      currentHighestTier = priority;
    }

    // Top listings must be active sponsored
    const sponsoredListings = sorted.filter((w) => isSponsorshipCurrentlyActive(w));
    expect(sponsoredListings.length).toBeGreaterThanOrEqual(2);
    expect(sorted.slice(0, sponsoredListings.length)).toEqual(sponsoredListings);

    // Next listings must be active featured
    const featuredListings = sorted.filter((w) => isFeaturedCurrentlyActive(w));
    expect(featuredListings.length).toBeGreaterThanOrEqual(4);
  });

  test("Secondary sorting preserves business order within each priority tier without dropping items", () => {
    const sortedByPrice = sortWeddingsByDiscoveryPriority(featuredWeddings, "price_asc");
    expect(sortedByPrice.length).toBe(featuredWeddings.length);

    // Check price ordering within the normal tier
    const normalByPrice = sortedByPrice.filter((w) => getWeddingDiscoveryPriority(w) === 0);
    for (let i = 0; i < normalByPrice.length - 1; i++) {
      expect(normalByPrice[i].pricePerGuest).toBeLessThanOrEqual(normalByPrice[i + 1].pricePerGuest);
    }

    // Check duration ordering with duration_desc
    const sortedByDuration = sortWeddingsByDiscoveryPriority(featuredWeddings, "duration_desc");
    expect(sortedByDuration.length).toBe(featuredWeddings.length);
    const normalByDuration = sortedByDuration.filter((w) => getWeddingDiscoveryPriority(w) === 0);
    for (let i = 0; i < normalByDuration.length - 1; i++) {
      expect(normalByDuration[i].durationDays).toBeGreaterThanOrEqual(normalByDuration[i + 1].durationDays);
    }
  });

  test("Expired or unpaid sponsored weddings lose priority but remain discoverable in standard inventory", () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const mockExpiredWedding = {
      id: "mock-expired-w1",
      slug: "mock-expired-wedding",
      title: "Expired Sponsored Wedding",
      pricePerGuest: 500,
      durationDays: 3,
      sponsored: true,
      sponsorshipEnd: pastDate,
      featured: false,
    };

    expect(isSponsorshipCurrentlyActive(mockExpiredWedding)).toBe(false);
    expect(getWeddingDiscoveryPriority(mockExpiredWedding)).toBe(0);

    const testPool = [mockExpiredWedding, ...featuredWeddings];
    const sorted = sortWeddingsByDiscoveryPriority(testPool);

    // Total count preserved
    expect(sorted.length).toBe(testPool.length);
    // Expired item is still in the list
    expect(sorted.some((w) => w.id === "mock-expired-w1")).toBe(true);
    // Expired item appears after active sponsored and active featured items
    const expiredIdx = sorted.findIndex((w) => w.id === "mock-expired-w1");
    const activeSponsoredCount = sorted.filter((w) => isSponsorshipCurrentlyActive(w)).length;
    const activeFeaturedCount = sorted.filter((w) => isFeaturedCurrentlyActive(w)).length;
    expect(expiredIdx).toBeGreaterThanOrEqual(activeSponsoredCount + activeFeaturedCount);
  });
});

describe("Ultra-Premium Sponsored Wedding Card UI and Styles", () => {
  const cardFilePath = path.join(process.cwd(), "components/wedding/WeddingCard.tsx");
  const cardCode = fs.readFileSync(cardFilePath, "utf8");

  test("Sponsored card container uses thick 3.5px luxury frame padding", () => {
    expect(cardCode).toContain("sponsored-luxury-frame p-[3.5px]");
  });

  test("Sponsored card features multi-tone champagne gold gradient palette", () => {
    expect(cardCode).toContain("#8f6b1f");
    expect(cardCode).toContain("#d4af37");
    expect(cardCode).toContain("#f4d77a");
    expect(cardCode).toContain("#ffe9a6");
    expect(cardCode).toContain("#b8860b");
  });

  test("Sponsored card has slow continuous light sweep animation with reduced-motion support", () => {
    expect(cardCode).toContain("luxuryGoldSweep");
    expect(cardCode).toContain("animation: luxuryGoldSweep 6s ease-in-out infinite");
    expect(cardCode).toContain("@media (prefers-reduced-motion: reduce)");
    expect(cardCode).toContain("animation: none !important");
  });

  test("Dedicated non-overlapping Sponsored badge is in Row 2 with whitespace-nowrap", () => {
    expect(cardCode).toContain("SPONSORED");
    expect(cardCode).toContain("whitespace-nowrap");
    expect(cardCode).toContain("top-11 left-3");
  });

  test("Inner card article has subtle inner gold highlight and proper border radius", () => {
    expect(cardCode).toContain("rounded-[13px] border border-amber-200/50");
    expect(cardCode).toContain("shadow-[inset_0_0_8px_rgba(212,175,55,0.08)]");
  });
});
