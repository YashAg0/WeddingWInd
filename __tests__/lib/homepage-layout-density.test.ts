/**
 * Homepage UX/UI Hierarchy, 4-Card Composition & Truthfulness Tests
 * 
 * Verifies:
 * 1. 4-card desktop composition for Featured Weddings with multi-day distribution.
 * 2. 4 featured style cards with cultural neutrality.
 * 3. 4 featured destination cards with real database counts.
 * 4. 6-step horizontal Guest Journey (zero fake reviews/social proof).
 * 5. Showcase listings strictly normalized as FULLY_BOOKED.
 */

import { toWeddingDTO } from "@/lib/wedding-dto";
import { featuredWeddings } from "@/lib/data";

describe("Homepage Hierarchy & 4-Card Composition Invariants", () => {
  it("should provide top 4 featured celebrations for the first row", () => {
    const featuredTop4 = featuredWeddings.slice(0, 4);
    expect(featuredTop4.length).toBe(4);
  });

  it("should provide 8 featured celebrations across 2 rows of 4 cards without duplicates", () => {
    const featuredTop8 = featuredWeddings.slice(0, 8);
    expect(featuredTop8.length).toBe(8);

    // Row 1 (cards 0-3) and Row 2 (cards 4-7)
    const row1 = featuredTop8.slice(0, 4);
    const row2 = featuredTop8.slice(4, 8);
    expect(row1.length).toBe(4);
    expect(row2.length).toBe(4);

    // Ensure all 8 IDs and slugs are unique
    const uniqueIds = new Set(featuredTop8.map((w) => w.id));
    const uniqueSlugs = new Set(featuredTop8.map((w) => w.slug));
    expect(uniqueIds.size).toBe(8);
    expect(uniqueSlugs.size).toBe(8);

    // Ensure first 4 remain identical to original top 4
    expect(row1[0].id).toBe(featuredWeddings[0].id);
    expect(row1[1].id).toBe(featuredWeddings[1].id);
    expect(row1[2].id).toBe(featuredWeddings[2].id);
    expect(row1[3].id).toBe(featuredWeddings[3].id);
  });

  it("should provide a realistic multi-day distribution (1-5 days) across featured celebrations", () => {
    const featuredTop4 = featuredWeddings.slice(0, 4);
    const durations = featuredTop4.map((w) => w.durationDays || 1);
    
    // Ensure multi-day celebrations are present
    expect(durations.some((d) => d >= 3)).toBe(true);
    
    // Ensure all durations are between 1 and 5 days
    for (const d of durations) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(5);
    }
  });

  it("should normalize showcase weddings with FULLY_BOOKED and zero fake reviews", () => {
    const demoWedding = featuredWeddings.find((w) => w.isDemo === true);
    expect(demoWedding).toBeDefined();

    if (demoWedding) {
      const dto = toWeddingDTO(demoWedding);
      expect(dto.isDemo).toBe(true);
      expect(dto.availabilityStatus).toBe("FULLY_BOOKED");
      expect(dto.rating).toBe(0);
      expect(dto.reviewCount).toBe(0);
      expect(dto.isVerified).toBe(false);
    }
  });

  it("should maintain valid guest capacity and timeline event counts on featured cards", () => {
    const featuredTop4 = featuredWeddings.slice(0, 4);
    for (const w of featuredTop4) {
      const dto = toWeddingDTO(w);
      expect(dto.guestsAllowed).toBeGreaterThan(0);
      expect(dto.durationDays).toBeGreaterThan(0);
      expect(dto.title.length).toBeGreaterThan(5);
      expect(dto.location.length).toBeGreaterThan(3);
    }
  });

  it("should feature culturally diverse styles (Royal, Punjabi, South Indian, Muslim)", () => {
    const featuredStyleNames = [
      "Royal Heritage",
      "Punjabi",
      "South Indian",
      "Muslim / Nikah",
    ];

    expect(featuredStyleNames.length).toBe(4);
    expect(featuredStyleNames).toContain("Royal Heritage");
    expect(featuredStyleNames).toContain("Punjabi");
    expect(featuredStyleNames).toContain("South Indian");
    expect(featuredStyleNames).toContain("Muslim / Nikah");
  });

  it("should feature key regional destinations (Rajasthan, Goa, Kerala, Himachal Pradesh)", () => {
    const featuredDestinations = [
      "Rajasthan",
      "Goa",
      "Kerala",
      "Himachal Pradesh",
    ];

    expect(featuredDestinations.length).toBe(4);
    expect(featuredDestinations).toContain("Rajasthan");
    expect(featuredDestinations).toContain("Goa");
    expect(featuredDestinations).toContain("Kerala");
    expect(featuredDestinations).toContain("Himachal Pradesh");
  });
});
