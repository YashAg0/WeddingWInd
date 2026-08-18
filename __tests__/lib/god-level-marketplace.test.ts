import { featuredWeddings } from "@/lib/data";
import { toWeddingDTO } from "@/lib/wedding-dto";
import {
  getCustomerPriceUSD,
  getHostPayoutPerGuestINR,
  getAgentPayoutPerGuestINR,
  normalizeWeddingTier,
  normalizeDurationDays,
} from "@/lib/services/pricing-engine";

describe("God-Level Wedding Marketplace Multi-Day Realism & Data Integrity", () => {
  it("should contain a balanced, realistic distribution of 1, 2, 3, 4, and 5 day celebrations in featured demo data", () => {
    expect(featuredWeddings.length).toBeGreaterThanOrEqual(6);

    const durations = featuredWeddings.map((w) => w.durationDays);
    expect(durations).toContain(1); // 1-day experience
    expect(durations).toContain(2); // 2-day experience
    expect(durations).toContain(3); // 3-day experience
    expect(durations).toContain(4); // 4-day experience
    expect(durations).toContain(5); // 5-day experience

    // Check traditions diversity
    const traditions = featuredWeddings.map((w) => w.religion);
    expect(traditions).toContain("Hindu");
    expect(traditions).toContain("Christian");
    expect(traditions).toContain("Sikh");
    expect(traditions).toContain("Muslim");
    expect(traditions).toContain("Jain");
    expect(traditions).toContain("Interfaith / Multicultural");
  });

  it("should explicitly identify all demo listings with isDemo: true and zero fake ratings/reviews", () => {
    featuredWeddings.forEach((w) => {
      expect(w.isDemo).toBe(true);
      expect(w.rating).toBe(0);
      expect(w.reviewCount).toBe(0);
      expect(w.reviews).toEqual([]);
      expect(w.guestsAllowed).toBeGreaterThan(0);
      expect(w.timeline.length).toBeGreaterThan(0);
    });
  });

  it("should enforce authoritative pricing engine matrix across all tiers and durations without manual drift", () => {
    const testCases: Array<{
      tier: "STANDARD" | "ENHANCED" | "GRAND" | "ROYAL" | "SIGNATURE_ROYAL";
      days: number;
      expectedUSD: number;
      expectedHostINR: number;
      expectedAgentINR: number;
    }> = [
      { tier: "STANDARD", days: 1, expectedUSD: 149, expectedHostINR: 5101, expectedAgentINR: 511 },
      { tier: "STANDARD", days: 5, expectedUSD: 349, expectedHostINR: 13101, expectedAgentINR: 511 },
      { tier: "ENHANCED", days: 2, expectedUSD: 249, expectedHostINR: 10101, expectedAgentINR: 1011 },
      { tier: "GRAND", days: 3, expectedUSD: 449, expectedHostINR: 20101, expectedAgentINR: 1511 },
      { tier: "ROYAL", days: 4, expectedUSD: 799, expectedHostINR: 41101, expectedAgentINR: 2011 },
      { tier: "SIGNATURE_ROYAL", days: 5, expectedUSD: 1199, expectedHostINR: 61101, expectedAgentINR: 2511 },
    ];

    testCases.forEach(({ tier, days, expectedUSD, expectedHostINR, expectedAgentINR }) => {
      const normTier = normalizeWeddingTier(tier);
      const normDays = normalizeDurationDays(days);

      expect(getCustomerPriceUSD(normTier, normDays)).toBe(expectedUSD);
      expect(getHostPayoutPerGuestINR(normTier, normDays)).toBe(expectedHostINR);
      expect(getAgentPayoutPerGuestINR(normTier)).toBe(expectedAgentINR);
    });
  });

  it("should normalize raw wedding records into structured multi-day DTOs with day timelines", () => {
    const rawMultiDayRecord = {
      id: "w-rajasthan-5d",
      slug: "rajasthan-5d-royal",
      title: "Royal Rajputana 5-Day Matrimony",
      location: "Jodhpur, Rajasthan",
      category: "Royal",
      religion: "Hindu",
      tier: "SIGNATURE_ROYAL",
      durationDays: 5,
      capacity: 20,
      guestsAllowed: 20,
      mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a",
      status: "PUBLISHED",
      isDemo: true,
      events: [
        { id: "e1", name: "Day 1 Welcome", startTime: "16:00", endTime: "20:00", date: new Date("2026-11-18") },
        { id: "e2", name: "Day 2 Music", startTime: "18:00", endTime: "22:00", date: new Date("2026-11-19") },
        { id: "e3", name: "Day 3 Baraat", startTime: "17:00", endTime: "21:00", date: new Date("2026-11-20") },
        { id: "e4", name: "Day 4 Pheras", startTime: "10:00", endTime: "14:00", date: new Date("2026-11-21") },
        { id: "e5", name: "Day 5 Gala", startTime: "19:00", endTime: "23:00", date: new Date("2026-11-22") },
      ],
    };

    const dto = toWeddingDTO(rawMultiDayRecord);

    expect(dto.durationDays).toBe(5);
    expect(dto.pricePerGuest).toBe(1199); // Signature Royal 5 days
    expect(dto.timeline.length).toBe(5);
    expect(dto.isDemo).toBe(true);
    expect(dto.ceremoniesCount).toBe(5);
    expect(dto.isVerified).toBe(false); // Demo data must not claim verified
    expect(dto.availabilityStatus).toBe("FULLY_BOOKED"); // Demo listings are showcase only
  });

  it("should derive availabilityStatus correctly for live, full, draft, and completed weddings", () => {
    // 1. Live open wedding
    const liveOpen = toWeddingDTO({
      id: "live-open",
      slug: "live-open-wed",
      title: "Real Host Celebration",
      location: "Jaipur, Rajasthan",
      capacity: 10,
      guestsBooked: 2,
      status: "PUBLISHED",
      isDemo: false,
      isVerified: true,
    });
    expect(liveOpen.availabilityStatus).toBe("AVAILABLE");
    expect(liveOpen.isVerified).toBe(true);

    // 2. Live sold-out wedding
    const liveFull = toWeddingDTO({
      id: "live-full",
      slug: "live-full-wed",
      title: "Sold Out Celebration",
      location: "Jaipur, Rajasthan",
      capacity: 10,
      guestsBooked: 10,
      status: "PUBLISHED",
      isDemo: false,
    });
    expect(liveFull.availabilityStatus).toBe("FULLY_BOOKED");

    // 3. Draft wedding
    const draftWed = toWeddingDTO({
      id: "draft-wed",
      slug: "draft-wed",
      title: "Draft Celebration",
      location: "Jaipur, Rajasthan",
      capacity: 10,
      guestsBooked: 0,
      status: "DRAFT",
      isDemo: false,
    });
    expect(draftWed.availabilityStatus).toBe("UNAVAILABLE");

    // 4. Completed wedding
    const completedWed = toWeddingDTO({
      id: "comp-wed",
      slug: "comp-wed",
      title: "Past Celebration",
      location: "Jaipur, Rajasthan",
      capacity: 10,
      guestsBooked: 8,
      status: "COMPLETED",
      isDemo: false,
    });
    expect(completedWed.availabilityStatus).toBe("COMPLETED");
  });

  it("should never display $149 or Standard pricing for 5-Day, 4-Day, 3-Day, or 2-Day premium listings", () => {
    const signatureRoyal5D = toWeddingDTO({
      id: "sr-5d",
      slug: "sr-5d",
      title: "5-Day Signature Royal",
      location: "Jodhpur, Rajasthan",
      tier: "SIGNATURE_ROYAL",
      durationDays: 5,
      capacity: 20,
      status: "PUBLISHED",
      isDemo: true,
    });
    expect(signatureRoyal5D.pricePerGuest).toBe(1199);
    expect(signatureRoyal5D.pricePerGuest).not.toBe(149);

    const royal4D = toWeddingDTO({
      id: "r-4d",
      slug: "r-4d",
      title: "4-Day Royal",
      location: "Amritsar, Punjab",
      tier: "ROYAL",
      durationDays: 4,
      capacity: 16,
      status: "PUBLISHED",
      isDemo: true,
    });
    expect(royal4D.pricePerGuest).toBe(799);
    expect(royal4D.pricePerGuest).not.toBe(149);

    const grand3D = toWeddingDTO({
      id: "g-3d",
      slug: "g-3d",
      title: "3-Day Grand",
      location: "Alleppey, Kerala",
      tier: "GRAND",
      durationDays: 3,
      capacity: 12,
      status: "PUBLISHED",
      isDemo: true,
    });
    expect(grand3D.pricePerGuest).toBe(449);
    expect(grand3D.pricePerGuest).not.toBe(149);

    const enhanced2D = toWeddingDTO({
      id: "e-2d",
      slug: "e-2d",
      title: "2-Day Enhanced",
      location: "Mandrem, Goa",
      tier: "ENHANCED",
      durationDays: 2,
      capacity: 10,
      status: "PUBLISHED",
      isDemo: true,
    });
    expect(enhanced2D.pricePerGuest).toBe(249);
    expect(enhanced2D.pricePerGuest).not.toBe(149);

    const standard1D = toWeddingDTO({
      id: "s-1d",
      slug: "s-1d",
      title: "1-Day Standard",
      location: "Madurai, Tamil Nadu",
      tier: "STANDARD",
      durationDays: 1,
      capacity: 8,
      status: "PUBLISHED",
      isDemo: true,
    });
    expect(standard1D.pricePerGuest).toBe(149);
  });
});
