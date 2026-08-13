/**
 * WeddingWithIndia — Single Source of Truth Wedding DTO Normalizer
 *
 * Ensures 100% data consistency across Database -> Actions -> Discovery -> Cards -> Detail Pages -> SEO.
 */

import { Wedding } from "@/types";
import { normalizeReligion, resolveCulturalProfileDefaults } from "./culture";

/**
 * Evaluates whether a wedding has active (unexpired) sponsorship.
 * Sponsored state is time-aware: if sponsorshipEnd is set and in the past, sponsorship is expired.
 */
export function isSponsorshipActive(rawWedding: any): boolean {
  if (!rawWedding || !rawWedding.sponsored) return false;

  const now = new Date();

  if (rawWedding.sponsorshipStart) {
    const startDate = new Date(rawWedding.sponsorshipStart);
    if (!isNaN(startDate.getTime()) && startDate > now) {
      return false; // Campaign starts in the future
    }
  }

  if (rawWedding.sponsorshipEnd) {
    const endDate = new Date(rawWedding.sponsorshipEnd);
    if (!isNaN(endDate.getTime()) && endDate <= now) {
      return false; // Campaign expired
    }
  }

  return true;
}

export function toWeddingDTO(rawWedding: any): Wedding {
  if (!rawWedding) {
    throw new Error("Cannot normalize null or undefined wedding record");
  }

  const activeSponsored = isSponsorshipActive(rawWedding);

  // 1. Host information fallback
  const hostUser = rawWedding.hostCouple?.user || {};
  const coupleName = rawWedding.hostCouple?.name || hostUser.name || rawWedding.coupleName || rawWedding.hostName || "Host Family";
  const coupleImage = rawWedding.mainImageUrl || hostUser.avatar || rawWedding.coupleImage || "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80";
  const hostAvatar = hostUser.avatar || rawWedding.hostAvatar || coupleImage;

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

  // 3. Price & Capacity bounds
  const pricePerGuest = typeof rawWedding.pricePerGuest === "number" && rawWedding.pricePerGuest > 0
    ? rawWedding.pricePerGuest
    : 12000;

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

  // 6. Gallery & Tags
  const gallery: string[] = Array.isArray(rawWedding.gallery)
    ? rawWedding.gallery.map((g: any) => (typeof g === "string" ? g : g.imageUrl))
    : [rawWedding.mainImageUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80"];

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
    pricePerGuest,
    currency: rawWedding.currency || "INR",
    rating,
    reviewCount,
    guestsAllowed,
    guestsBooked,
    imageUrl: rawWedding.mainImageUrl || rawWedding.imageUrl || gallery[0],
    coupleImage,
    coupleName,
    hostName: coupleName,
    hostAvatar,
    featured: !!rawWedding.featured,
    sponsored: activeSponsored,
    sponsorshipStart: rawWedding.sponsorshipStart ? new Date(rawWedding.sponsorshipStart).toISOString() : null,
    sponsorshipEnd: rawWedding.sponsorshipEnd ? new Date(rawWedding.sponsorshipEnd).toISOString() : null,
    isDemo: !!rawWedding.isDemo,
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
    durationDays: rawWedding.durationDays || 3,
    languages: Array.isArray(rawWedding.languages)
      ? rawWedding.languages
      : rawWedding.hostCouple?.languagesSpoken?.split(",").map((l: string) => l.trim()) || ["English", "Hindi"],
    isVerified: true,
    isCurated: !!(activeSponsored || rawWedding.featured || rawWedding.isCurated),
    curatedBadge: activeSponsored ? "Sponsored" : rawWedding.featured ? "Featured" : rawWedding.isDemo ? "Showcase" : undefined,
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
