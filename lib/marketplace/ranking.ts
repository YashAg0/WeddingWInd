/**
 * lib/marketplace/ranking.ts
 *
 * Single Source of Truth for 3-Tier Marketplace Ranking:
 * TIER 2: SPONSORED (#1 Top Priority & Animated Gold Frame)
 * TIER 1: FEATURED (#2 Highlighted Ribbon Above Standard)
 * TIER 0: NORMAL (#3 Standard Discovery)
 *
 * PURE CLIENT-SAFE MODULE:
 * - NO Prisma / database queries
 * - NO Next.js server headers / cookies
 * - NO Clerk server auth
 * - Safe for both Server Components and Client Components
 */

/**
 * Single Source of Truth: Evaluates whether a wedding or sponsorship record has active unexpired SPONSORED placement.
 * Invariant: Must be status=ACTIVE, payment verified or waived, not revoked, startsAt <= now, and endsAt > now.
 * If record has promotionType, it must be "SPONSORED" (or null/undefined for backward compatibility).
 */
export function isSponsorshipCurrentlyActive(rawWeddingOrSponsorship: any): boolean {
  if (!rawWeddingOrSponsorship) return false;
  const now = new Date();

  // If this is a SponsorshipRequest model
  if ("paymentRequired" in rawWeddingOrSponsorship || "paymentStatus" in rawWeddingOrSponsorship) {
    const s = rawWeddingOrSponsorship;
    if (s.promotionType && s.promotionType !== "SPONSORED") {
      return false;
    }
    if (s.status !== "ACTIVE") {
      return false;
    }
    if (s.paymentRequired) {
      const pStatus = s.paymentStatus ? String(s.paymentStatus).toUpperCase() : "";
      if (pStatus !== "PAID" && pStatus !== "PAYMENT_VERIFIED" && pStatus !== "WAIVED") {
        return false;
      }
    }
    if (s.revokedAt) return false;
    if (s.startsAt && new Date(s.startsAt) > now) return false;
    if (s.endsAt && new Date(s.endsAt) <= now) return false;
    return true;
  }

  // If wedding has sponsorshipRequests relation attached, it is authoritative
  if (Array.isArray(rawWeddingOrSponsorship.sponsorshipRequests)) {
    if (rawWeddingOrSponsorship.sponsorshipRequests.length === 0) {
      // Fallback to wedding level cached field if relation is empty array
      if (!rawWeddingOrSponsorship.sponsored) return false;
      if (rawWeddingOrSponsorship.sponsorshipStart && new Date(rawWeddingOrSponsorship.sponsorshipStart) > now) return false;
      if (rawWeddingOrSponsorship.sponsorshipEnd && new Date(rawWeddingOrSponsorship.sponsorshipEnd) <= now) return false;
      return true;
    }
    return rawWeddingOrSponsorship.sponsorshipRequests.some((r: any) =>
      isSponsorshipCurrentlyActive(r)
    );
  }

  // Fallback to wedding level cached fields
  if (!rawWeddingOrSponsorship.sponsored) return false;
  if (rawWeddingOrSponsorship.sponsorshipStart && new Date(rawWeddingOrSponsorship.sponsorshipStart) > now) {
    return false; // Future scheduled
  }
  if (rawWeddingOrSponsorship.sponsorshipEnd && new Date(rawWeddingOrSponsorship.sponsorshipEnd) <= now) {
    return false; // Expired
  }

  return true;
}

/**
 * Single Source of Truth: Evaluates whether a wedding has active FEATURED placement.
 * Returns true if active FEATURED promotion record exists, OR wedding.featured === true (when not sponsored).
 */
export function isFeaturedCurrentlyActive(rawWeddingOrSponsorship: any): boolean {
  if (!rawWeddingOrSponsorship) return false;
  // If active sponsored, priority is SPONSORED (not just featured)
  if (isSponsorshipCurrentlyActive(rawWeddingOrSponsorship)) return false;

  const now = new Date();

  // If this is a SponsorshipRequest model
  if ("paymentRequired" in rawWeddingOrSponsorship || "paymentStatus" in rawWeddingOrSponsorship) {
    const s = rawWeddingOrSponsorship;
    if (s.promotionType !== "FEATURED") return false;
    if (s.status !== "ACTIVE") return false;
    if (s.paymentRequired) {
      const pStatus = s.paymentStatus ? String(s.paymentStatus).toUpperCase() : "";
      if (pStatus !== "PAID" && pStatus !== "PAYMENT_VERIFIED" && pStatus !== "WAIVED") return false;
    }
    if (s.revokedAt) return false;
    if (s.startsAt && new Date(s.startsAt) > now) return false;
    if (s.endsAt && new Date(s.endsAt) <= now) return false;
    return true;
  }

  // If wedding has sponsorshipRequests relation attached
  if (Array.isArray(rawWeddingOrSponsorship.sponsorshipRequests)) {
    const hasActiveFeatured = rawWeddingOrSponsorship.sponsorshipRequests.some((r: any) =>
      isFeaturedCurrentlyActive(r)
    );
    if (hasActiveFeatured) return true;
  }

  // Fallback to wedding.featured flag
  return Boolean(rawWeddingOrSponsorship.featured);
}

/**
 * Single Source of Truth: Discovery Priority Score (2 = Sponsored, 1 = Featured, 0 = Normal)
 */
export function getWeddingDiscoveryPriority(wedding: {
  sponsored?: boolean;
  featured?: boolean;
  sponsorshipStart?: string | Date | null;
  sponsorshipEnd?: string | Date | null;
  sponsorshipRequests?: any[];
}): number {
  if (isSponsorshipCurrentlyActive(wedding)) return 2;
  if (isFeaturedCurrentlyActive(wedding)) return 1;
  return 0;
}

/**
 * Single Source of Truth: Canonical In-Memory Stable Sorter for Weddings.
 * Strictly enforces:
 * Tier 2: Active SPONSORED listings first (#1)
 * Tier 1: Active FEATURED listings second (#2)
 * Tier 0: Normal listings third (#3)
 */
export function sortWeddingsByDiscoveryPriority<T extends {
  id?: string;
  sponsored?: boolean;
  featured?: boolean;
  durationDays?: number;
  pricePerGuest?: number;
  date?: string;
  sponsorshipStart?: string | Date | null;
  sponsorshipEnd?: string | Date | null;
  sponsorshipRequests?: any[];
  [key: string]: any;
}>(weddings: T[], secondarySort?: string): T[] {
  return [...weddings].sort((a, b) => {
    // 1. Sponsorship tier is always the absolute primary discovery key
    const priorityA = getWeddingDiscoveryPriority(a);
    const priorityB = getWeddingDiscoveryPriority(b);
    if (priorityB !== priorityA) return priorityB - priorityA;

    // 2. Secondary sort criteria
    if (secondarySort === "price_asc") return (a.pricePerGuest || 0) - (b.pricePerGuest || 0);
    if (secondarySort === "price_desc") return (b.pricePerGuest || 0) - (a.pricePerGuest || 0);
    if (secondarySort === "duration_desc") return (b.durationDays || 1) - (a.durationDays || 1);
    if (secondarySort === "duration_asc") return (a.durationDays || 1) - (b.durationDays || 1);
    if (secondarySort === "date_asc" && a.date && b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }

    // Default: duration diversity then deterministic ID tiebreaker
    if ((b.durationDays || 1) !== (a.durationDays || 1)) {
      return (b.durationDays || 1) - (a.durationDays || 1);
    }
    return (a.id || "").localeCompare(b.id || "");
  });
}
