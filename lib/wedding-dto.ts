/**
 * WeddingWithIndia — Single Source of Truth Wedding DTO Normalizer
 *
 * Ensures 100% data consistency across Database -> Actions -> Discovery -> Cards -> Detail Pages -> SEO.
 */

import { Wedding } from "@/types";
import { normalizeReligion, resolveCulturalProfileDefaults } from "./culture";
import { resolveWeddingVisualProfile, CANONICAL_COUPLE_NAMES } from "./wedding-images";
import {
  normalizeWeddingTier,
  normalizeDurationDays,
  getCustomerPriceUSD,
} from "@/lib/services/pricing-engine";

import {
  isSponsorshipCurrentlyActive,
  isFeaturedCurrentlyActive,
  getWeddingDiscoveryPriority,
  sortWeddingsByDiscoveryPriority,
} from "./marketplace/ranking";

export { isSponsorshipCurrentlyActive, isFeaturedCurrentlyActive, getWeddingDiscoveryPriority, sortWeddingsByDiscoveryPriority };

/**
 * Evaluates whether a wedding has active (unexpired) sponsorship.
 * Sponsored state is time-aware: if sponsorshipEnd is set and in the past, sponsorship is expired.
 */
export function isSponsorshipActive(rawWedding: any): boolean {
  return isSponsorshipCurrentlyActive(rawWedding);
}

export function isFeaturedActive(rawWedding: any): boolean {
  return isFeaturedCurrentlyActive(rawWedding);
}

export function toWeddingDTO(rawWedding: any): Wedding {
  if (!rawWedding) {
    throw new Error("Cannot normalize null or undefined wedding record");
  }

  const activeSponsored = isSponsorshipActive(rawWedding);
  const activeFeatured = isFeaturedActive(rawWedding);

  // 1. Host & Couple Identity Synchronization (Single Source of Truth)
  const slugKey = (rawWedding.slug || "").toLowerCase().trim();
  const canonicalCoupleName = CANONICAL_COUPLE_NAMES[slugKey];
  const hostUser = rawWedding.hostCouple?.user || {};
  const coupleName = canonicalCoupleName || rawWedding.hostCouple?.name || hostUser.name || rawWedding.coupleName || rawWedding.hostName || "Host Couple";

  // 2. Cultural identity & defaults
  const rawReligion = rawWedding.religion || "Hindu";
  const canonicalReligion = normalizeReligion(rawReligion);
  const locationStr = rawWedding.location || "";
  const inferredRegion = rawWedding.region || (
    locationStr.toLowerCase().includes("kashmir") ? "Kashmir" :
    locationStr.toLowerCase().includes("kerala") ? "Kerala" :
    locationStr.toLowerCase().includes("rajasthan") ? "Rajasthan" :
    locationStr.toLowerCase().includes("punjab") ? "Punjab" :
    locationStr.toLowerCase().includes("goa") ? "Goa" : undefined
  );

  const cultDefaults = resolveCulturalProfileDefaults(
    canonicalReligion,
    inferredRegion,
    rawWedding.community || rawWedding.ethnicity || undefined
  );

  const region = inferredRegion || cultDefaults.region;
  const community = rawWedding.community || rawWedding.ethnicity || cultDefaults.community;
  const foodContext = rawWedding.foodContext || cultDefaults.foodContext;
  const dressExpectations = rawWedding.dressExpectations || cultDefaults.dressExpectations;
  const guestRules = rawWedding.guestRules || cultDefaults.guestRules;
  const etiquetteNotes = rawWedding.etiquetteNotes || cultDefaults.etiquetteNotes;

  // 3. Centralized Tier, Duration & Price
  const tier = normalizeWeddingTier(rawWedding.tier || (rawWedding.category === "Royal" ? "ROYAL" : "STANDARD"));
  const durationDays = normalizeDurationDays(
    rawWedding.durationDays ||
    (Array.isArray(rawWedding.events) && rawWedding.events.length > 0
      ? Math.min(5, Math.max(1, rawWedding.events.length))
      : 3)
  );
  const pricePerGuest = getCustomerPriceUSD(tier, durationDays);
  const ceremoniesCount = typeof rawWedding.ceremoniesCount === "number" && rawWedding.ceremoniesCount > 0
    ? rawWedding.ceremoniesCount
    : Array.isArray(rawWedding.events) && rawWedding.events.length > 0
    ? rawWedding.events.length
    : durationDays;

  const guestsAllowed = typeof rawWedding.capacity === "number" && rawWedding.capacity > 0
    ? rawWedding.capacity
    : typeof rawWedding.guestsAllowed === "number" && rawWedding.guestsAllowed > 0
    ? rawWedding.guestsAllowed
    : 20;

  const guestsBooked = typeof rawWedding.guestsBooked === "number"
    ? rawWedding.guestsBooked
    : rawWedding._count?.bookings || 0;

  // 4. Rating & Reviews
  const rating = typeof rawWedding.rating === "number"
    ? rawWedding.rating
    : rawWedding.avgRating || 0;
  const reviewCount = typeof rawWedding.reviewCount === "number"
    ? rawWedding.reviewCount
    : 0;

  // 5. Date formatting (ISO YYYY-MM-DD)
  let dateStr = "";
  if (rawWedding.date) {
    if (typeof rawWedding.date === "string") {
      dateStr = rawWedding.date.split("T")[0];
    } else if (rawWedding.date instanceof Date) {
      dateStr = rawWedding.date.toISOString().split("T")[0];
    }
  }

  // 6. Visual Profile & Canonical Image Resolution (1 Wedding = 1 Canonical Image Everywhere)
  const hasApprovedVerification =
    rawWedding.hostCouple?.user?.verification?.status === "APPROVED" ||
    rawWedding.verification?.status === "APPROVED";

  const hasVerifiedQualityBadge =
    Array.isArray(rawWedding.hostCouple?.user?.badges) &&
    rawWedding.hostCouple.user.badges.some(
      (b: any) =>
        (b.badge?.key === "verified-host" || b.badgeKey === "verified-host" || b.key === "verified-host") &&
        !b.revokedAt
    );

  const isExplicitlyVerified = Boolean(rawWedding.isVerified);

  const isVerified =
    !rawWedding.isDemo && (hasApprovedVerification || hasVerifiedQualityBadge || isExplicitlyVerified);

  const isVerifiedHostMedia = isVerified;
  const visualProfile = resolveWeddingVisualProfile({
    slug: rawWedding.slug,
    id: rawWedding.id,
    imageUrl: rawWedding.mainImageUrl || rawWedding.imageUrl,
    title: rawWedding.title,
    location: rawWedding.location,
    isVerified: isVerifiedHostMedia,
  });
  const canonicalImageUrl = isVerifiedHostMedia && rawWedding.mainImageUrl ? rawWedding.mainImageUrl : visualProfile.imageUrl;

  // 7. Gallery & Tags
  const rawGallery = Array.isArray(rawWedding.gallery)
    ? rawWedding.gallery.map((g: any) => (typeof g === "string" ? g : g.imageUrl))
    : [];
  const gallery: string[] = [canonicalImageUrl, ...rawGallery.filter((url: string) => url && url !== canonicalImageUrl)];

  const traditions = Array.isArray(rawWedding.traditions)
    ? rawWedding.traditions.map((t: any) => ({
        title: t.title || t.name || "Tradition",
        description: t.description || "",
      }))
    : cultDefaults.defaultTraditions.map((t: { name: string; description: string }) => ({ title: t.name, description: t.description }));

  const tags: string[] = Array.isArray(rawWedding.tags) && rawWedding.tags.length > 0
    ? rawWedding.tags
    : traditions.map((t: { title: string }) => t.title);

  const timeline = Array.isArray(rawWedding.events)
    ? rawWedding.events.map((evt: any) => ({
        id: evt.id || `evt-${Math.random()}`,
        title: evt.name || evt.title || "Ceremony",
        time: evt.startTime && evt.endTime ? `${evt.startTime} - ${evt.endTime}` : evt.time || "10:00 - 13:00",
        date: evt.date ? (evt.date instanceof Date ? evt.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : String(evt.date)) : undefined,
        description: evt.description || "",
        icon: "Sparkles",
      }))
    : cultDefaults.defaultCeremonies.map((c) => ({
        id: `def-${c.name}`,
        title: c.name,
        time: c.defaultTimeRange,
        description: c.description,
        icon: "Sparkles",
      }));

  const locationParts = (rawWedding.location || "India").split(",");
  const city = rawWedding.city || locationParts[0]?.trim() || "India";
  const state = rawWedding.state || locationParts[1]?.trim() || "India";

  return {
    id: rawWedding.id,
    slug: rawWedding.slug,
    title: rawWedding.title,
    location: rawWedding.location || "India",
    city,
    state,
    country: rawWedding.country || "India",
    countryCode: rawWedding.countryCode || "IN",
    category: rawWedding.category || "Traditional",
    tier,
    durationDays,
    ceremoniesCount,
    pricePerGuest,
    currency: "USD",
    rating,
    reviewCount,
    guestsAllowed,
    guestsBooked,
    imageUrl: canonicalImageUrl,
    imageMeta: visualProfile,
    objectPosition: visualProfile.objectPosition || "center 35%",
    coupleImage: isVerifiedHostMedia && (rawWedding.coupleImage || rawWedding.hostCouple?.avatar) ? (rawWedding.coupleImage || rawWedding.hostCouple?.avatar) : canonicalImageUrl,
    coupleName,
    hostName: isVerifiedHostMedia && (hostUser.name || rawWedding.hostName) ? (hostUser.name || rawWedding.hostName) : coupleName,
    hostAvatar: isVerifiedHostMedia && (hostUser.avatar || rawWedding.hostAvatar) ? (hostUser.avatar || rawWedding.hostAvatar) : canonicalImageUrl,
    featured: activeFeatured,
    sponsored: activeSponsored,
    sponsorshipStart: (() => {
      if (!rawWedding.sponsorshipStart) return null;
      const d = new Date(rawWedding.sponsorshipStart);
      return !isNaN(d.getTime()) ? d.toISOString() : null;
    })(),
    sponsorshipEnd: (() => {
      if (!rawWedding.sponsorshipEnd) return null;
      const d = new Date(rawWedding.sponsorshipEnd);
      return !isNaN(d.getTime()) ? d.toISOString() : null;
    })(),
    isDemo: !!rawWedding.isDemo,
    availabilityStatus: (() => {
      if (rawWedding.availabilityStatus) return rawWedding.availabilityStatus;
      if (rawWedding.isDemo || (guestsAllowed - guestsBooked) <= 0) return "FULLY_BOOKED";
      if (rawWedding.status === "COMPLETED") return "COMPLETED";
      if (rawWedding.suspended || rawWedding.status === "DRAFT" || rawWedding.status === "UNDER_REVIEW") return "UNAVAILABLE";
      return "AVAILABLE";
    })(),
    tags,
    date: dateStr,
    religion: canonicalReligion,
    region,
    community,
    foodContext,
    dressExpectations,
    guestRules,
    etiquetteNotes,
    luxuryLevel: rawWedding.luxuryLevel || "Luxury",
    languages: Array.isArray(rawWedding.languages)
      ? rawWedding.languages
      : rawWedding.hostCouple?.languagesSpoken?.split(",").map((l: string) => l.trim()) || ["English", "Hindi"],
    isVerified,
    isCurated: !!(activeSponsored || activeFeatured || rawWedding.isCurated),
    curatedBadge: activeSponsored ? "Sponsored" : activeFeatured ? "Featured" : undefined,
    gallery,
    story: rawWedding.description || rawWedding.story || "A beautiful celebration of love and culture.",
    coupleBio: rawWedding.hostCouple?.familyBio || rawWedding.coupleBio || `The ${coupleName} family welcomes global guests with warm hospitality.`,
    timeline,
    traditions,
    dressCode: dressExpectations,
    foodDescription: foodContext,
    venueDescription: rawWedding.venueDescription || `Heritage venue in ${city}, ${state} with dedicated guest hospitality and safety protocols.`,
    accommodation: rawWedding.accommodation || "Luxury lodging and hotel recommendations coordinated by host team.",
    included: Array.isArray(rawWedding.included) ? rawWedding.included : ["Access to ceremonial events", "Authentic wedding feasts & beverages", "Cultural orientation & etiquette guide", "Dedicated host liaison assistance"],
    notIncluded: Array.isArray(rawWedding.notIncluded) ? rawWedding.notIncluded : ["International flights", "Personal local transport", "Private hotel accommodation"],
    reviews: Array.isArray(rawWedding.reviews) ? rawWedding.reviews : [],
    faqs: Array.isArray(rawWedding.faqs) ? rawWedding.faqs : [],
  };
}
