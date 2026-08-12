"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireAuth } from "../auth";
import { UserRole, ReputationEntityType } from "@prisma/client";
import { calculateBayesianRating } from "../services/trust-score";
import { submitReviewAction, voteReviewHelpfulAction, replyToReviewAction } from "./reviews";

/**
 * Searches weddings based on multi-faceted filters, sorting models, and relevance scores.
 */
export async function searchWeddingsAction(
  filters: {
    city?: string;
    state?: string;
    country?: string;
    weddingStyle?: string;
    religion?: string;
    minPrice?: number;
    maxPrice?: number;
    minGuests?: number;
    maxGuests?: number;
    startDate?: string;
    endDate?: string;
    language?: string;
    foodPreference?: string;
    minRating?: number;
    featured?: boolean;
    verifiedCouples?: boolean;
    query?: string;
  },
  cursor?: string,
  limit: number = 10,
  sort: "relevance" | "price_asc" | "price_desc" | "date_asc" | "rating_desc" = "relevance"
) {
  // Construct Prisma WHERE block dynamically
  const where: any = {
    status: "PUBLISHED",
    suspended: false,
    isDemo: false,
  };

  // String Search Query (Title, Location, Category/Style, Description)
  if (filters.query) {
    where.OR = [
      { title: { contains: filters.query, mode: "insensitive" } },
      { location: { contains: filters.query, mode: "insensitive" } },
      { category: { contains: filters.query, mode: "insensitive" } },
      { description: { contains: filters.query, mode: "insensitive" } },
    ];
  }

  // Location filters
  if (filters.city || filters.state || filters.country) {
    const locQueries = [];
    if (filters.city) locQueries.push({ location: { contains: filters.city, mode: "insensitive" } });
    if (filters.state) locQueries.push({ location: { contains: filters.state, mode: "insensitive" } });
    if (filters.country) locQueries.push({ location: { contains: filters.country, mode: "insensitive" } });
    where.AND = where.AND ? [...where.AND, { OR: locQueries }] : [{ OR: locQueries }];
  }

  // Style / Category
  if (filters.weddingStyle) {
    where.category = { contains: filters.weddingStyle, mode: "insensitive" };
  }

  // Price Range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.pricePerGuest = {};
    if (filters.minPrice !== undefined) where.pricePerGuest.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.pricePerGuest.lte = filters.maxPrice;
  }

  // Guest Count (Capacity validation range)
  if (filters.minGuests !== undefined || filters.maxGuests !== undefined) {
    where.capacity = {};
    if (filters.minGuests !== undefined) where.capacity.gte = filters.minGuests;
    if (filters.maxGuests !== undefined) where.capacity.lte = filters.maxGuests;
  }

  // Date Range
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }

  // Featured flag
  if (filters.featured !== undefined) {
    where.featured = filters.featured;
  }

  // Verified host couples check
  if (filters.verifiedCouples) {
    where.hostCouple = {
      user: {
        verification: {
          status: "APPROVED",
        },
      },
    };
  }

  // Fetch from database with static fallback resilience
  let weddings: any[] = [];
  try {
    weddings = await prisma.wedding.findMany({
      where,
      take: limit + 1, // Fetch limit + 1 to check if there is a next page
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        hostCouple: {
          include: {
            user: {
              include: { verification: true },
            },
          },
        },
        bookings: true,
      },
    });
  } catch (err) {
    console.warn("[searchWeddingsAction] Database query failed or database unreachable. Returning static discovery fallback.", err);
    const { featuredWeddings } = await import("../data");
    return {
      weddings: featuredWeddings.map((fw) => ({
        ...fw,
        trustScore: 98,
        matchScore: 95,
        trendingBoost: 1.2
      })),
      nextCursor: undefined,
      totalCount: featuredWeddings.length
    };
  }

  let nextCursor: string | undefined = undefined;
  if (weddings.length > limit) {
    const nextItem = weddings.pop();
    nextCursor = nextItem?.id;
  }

  // Fetch reviews for rating scores calculation
  const mappedWeddings = await Promise.all(
    weddings.map(async (w) => {
      // 1. Exclude if active critical safety case exists
      const activeCriticalSafety = await prisma.safetyCase.count({
        where: {
          weddingId: w.id,
          severity: "CRITICAL",
          status: { notIn: ["RESOLVED", "CLOSED"] }
        }
      });
      if (activeCriticalSafety > 0) {
        return null;
      }

      // 2. Fetch Bayesian Rating
      const ratings = await calculateBayesianRating(w.id);

      // 3. Fetch trust score ReputationProfile
      const profile = await prisma.reputationProfile.findUnique({
        where: {
          entityType_entityId: {
            entityType: ReputationEntityType.WEDDING,
            entityId: w.id
          }
        }
      });
      const trustScore = profile ? profile.overallScore : 80;

      // 4. Cap manual trending boost to [0, 5]
      const cappedBoost = Math.max(0.0, Math.min(w.manualTrendingBoost, 5.0));

      // 5. Check if "guest-favorite" badge is active
      const guestFavoriteBadge = await prisma.weddingQualityBadge.findFirst({
        where: {
          weddingId: w.id,
          badge: { key: "guest-favorite" },
          revokedAt: null
        }
      });
      const isGuestFavorite = !!guestFavoriteBadge;

      // 6. Check unresolved critical/high fraud signals
      const unresolvedFraudCount = await prisma.reviewFraudSignal.count({
        where: {
          review: { booking: { weddingId: w.id } },
          severity: { in: ["HIGH", "CRITICAL"] },
          resolvedAt: null
        }
      });
      const hasUnresolvedFraud = unresolvedFraudCount > 0;

      // 7. Calculate relevance score
      const lowTrustPenalty = trustScore < 50 ? 50 : 0;
      const fraudPenalty = hasUnresolvedFraud ? 30 : 0;

      const relevanceScore =
        (w.sponsored ? 1000 : 0) +
        (w.featured ? 500 : 0) +
        (w.featured ? 40 : 0) +
        (cappedBoost * 8) +
        (trustScore * 0.4) +
        (ratings.bayesianRating * 4) +
        (w.bookings.length * 1.5) +
        (isGuestFavorite ? 25 : 0) -
        lowTrustPenalty -
        fraudPenalty;

      return {
        ...w,
        avgRating: ratings.avgRating,
        bayesianRating: ratings.bayesianRating,
        reviewCount: ratings.reviewCount,
        trustScore,
        isGuestFavorite,
        relevanceScore
      };
    })
  );

  // Filter out any safety excluded celebrations (nulls)
  const weddingsWithReviews = mappedWeddings.filter((item): item is NonNullable<typeof item> => item !== null);

  // Apply sorting with deterministic tie-breakers on id
  if (sort === "relevance") {
    weddingsWithReviews.sort((a, b) => (b.relevanceScore - a.relevanceScore) || a.id.localeCompare(b.id));
  } else if (sort === "price_asc") {
    weddingsWithReviews.sort((a, b) => (a.pricePerGuest - b.pricePerGuest) || a.id.localeCompare(b.id));
  } else if (sort === "price_desc") {
    weddingsWithReviews.sort((a, b) => (b.pricePerGuest - a.pricePerGuest) || a.id.localeCompare(b.id));
  } else if (sort === "date_asc") {
    weddingsWithReviews.sort((a, b) => (a.date.getTime() - b.date.getTime()) || a.id.localeCompare(b.id));
  } else if (sort === "rating_desc") {
    weddingsWithReviews.sort((a, b) => (b.avgRating - a.avgRating) || a.id.localeCompare(b.id));
  }

  // Track search analytics asynchronously
  if (filters.query || Object.keys(filters).length > 1) {
    const filtersJson = JSON.stringify(filters);
    await prisma.searchAnalytics.create({
      data: {
        query: filters.query || "Advanced Filters",
        filters: filtersJson,
        resultsCount: weddingsWithReviews.length,
        ctr: weddingsWithReviews.length > 0 ? 0.05 : 0.0, // Initial default CTR calculation
        abandoned: weddingsWithReviews.length === 0,
      },
    });
  }

  return {
    weddings: weddingsWithReviews,
    nextCursor,
  };
}

/**
 * AI-Assisted Recommendation Action (Logical matching advisor)
 */
export async function recommendWeddingAction(preferences: {
  budget: number;
  country: string;
  travelDates: string;
  groupSize: number;
  interests: string; // comma separated keywords
}) {
  const _user = await requireAuth();

  // Parse keywords
  const interestKeywords = preferences.interests
    .toLowerCase()
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  // Query weddings matching budget and capacity limits
  const matches = await prisma.wedding.findMany({
    where: {
      status: "PUBLISHED",
      suspended: false,
      pricePerGuest: { lte: preferences.budget },
      capacity: { gte: preferences.groupSize },
    },
    include: {
      hostCouple: {
        include: { user: true },
      },
    },
  });

  // Score matches by keyword intersections
  const scoredMatches = matches.map((w) => {
    let keywordScore = 0;
    const textToMatch = `${w.title} ${w.description} ${w.category} ${w.location}`.toLowerCase();
    
    interestKeywords.forEach((keyword) => {
      if (textToMatch.includes(keyword)) {
        keywordScore += 10;
      }
    });

    return {
      ...w,
      keywordScore,
    };
  });

  // Sort by keyword match score
  scoredMatches.sort((a, b) => b.keywordScore - a.keywordScore);

  const bestMatch = scoredMatches[0];

  if (!bestMatch) {
    return {
      match: null,
      explanation: "Unfortunately, no current celebrations match your budget or guest count capacity constraints. Try modifying your preferences or raising your budget criteria.",
    };
  }

  // Compile logical match description explanation text
  const explanation = `We selected the "${bestMatch.title}" experience in ${bestMatch.location} for you! It perfectly supports your group of ${preferences.groupSize} attendees (capacity up to ${bestMatch.capacity}) and fits your budget with pricing of $${bestMatch.pricePerGuest} per guest. Furthermore, your interest keywords ("${interestKeywords.join(", ")}") intersect strongly with this wedding's cultural category of ${bestMatch.category}.`;

  return {
    match: bestMatch,
    explanation,
  };
}

/**
 * Returns personalized recommendations based on wishlist, history, and searches.
 */
export async function getPersonalizedRecommendations() {
  try {
    const user = await requireAuth();

    // Fetch traveler profile
    const traveler = await prisma.travelerProfile.findUnique({
      where: { userId: user.id },
      include: {
        wishlists: true,
        bookings: true,
      },
    });

    if (!traveler) {
      // Return trending/featured fallback
      return prisma.wedding.findMany({
        where: { status: "PUBLISHED", suspended: false },
        orderBy: { manualTrendingBoost: "desc" },
        take: 4,
      });
    }

    // Find styles in wishlist or bookings
    const wishlistedIds = traveler.wishlists.map((w) => w.weddingId);
    const bookedIds = traveler.bookings.map((b) => b.weddingId);
    const interactingIds = Array.from(new Set([...wishlistedIds, ...bookedIds]));

    // Query interacting weddings to extract categories/styles
    const interactingWeddings = await prisma.wedding.findMany({
      where: { id: { in: interactingIds } },
    });

    const preferredCategories = Array.from(
      new Set(interactingWeddings.map((w) => w.category).filter(Boolean))
    );

    return prisma.wedding.findMany({
      where: {
        status: "PUBLISHED",
        suspended: false,
        id: { notIn: interactingIds },
        ...(preferredCategories.length > 0
          ? { category: { in: preferredCategories } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
  } catch (err) {
    console.warn("Non-critical getPersonalizedRecommendations failed safely:", err);
    return [];
  }
}

/**
 * Tracks search analytics
 */
export async function trackSearchAnalytics(query: string, filters: any, resultsCount: number) {
  try {
    await prisma.searchAnalytics.create({
      data: {
        query,
        filters: JSON.stringify(filters),
        resultsCount,
        ctr: resultsCount > 0 ? 0.05 : 0.0,
        abandoned: resultsCount === 0,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to log search analytics:", error);
    return { success: false };
  }
}

/**
 * Saved Searches operations
 */
export async function saveSearchAction(name: string, filters: any) {
  const user = await requireAuth();

  const saved = await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name,
      filters: JSON.stringify(filters),
    },
  });

  revalidatePath("/dashboard");
  return saved;
}

export async function deleteSavedSearch(id: string) {
  const _user = await requireAuth();

  await prisma.savedSearch.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function renameSavedSearch(id: string, name: string) {
  const _user = await requireAuth();

  const updated = await prisma.savedSearch.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/dashboard");
  return updated;
}

export async function fetchSavedSearches() {
  try {
    const user = await requireAuth();

    return await prisma.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Non-critical fetchSavedSearches failed safely:", err);
    return [];
  }
}

/**
 * Recently Viewed operations
 */
export async function trackRecentlyViewed(weddingId: string) {
  const user = await requireAuth();

  try {
    const log = await prisma.recentlyViewed.upsert({
      where: {
        userId_weddingId: {
          userId: user.id,
          weddingId,
        },
      },
      create: {
        userId: user.id,
        weddingId,
      },
      update: {
        viewedAt: new Date(),
      },
    });
    return log;
  } catch (error) {
    console.error("Failed to track viewed log:", error);
    return null;
  }
}

export async function fetchRecentlyViewed() {
  try {
    const user = await requireAuth();

    return await prisma.recentlyViewed.findMany({
      where: { userId: user.id },
      take: 6,
      orderBy: { viewedAt: "desc" },
      include: {
        wedding: true,
      },
    });
  } catch (err) {
    console.warn("Non-critical fetchRecentlyViewed failed safely:", err);
    return [];
  }
}

/**
 * Wishlist Custom folders, collections, notes and public status modifications
 */
export async function updateWishlistDetails(
  wishlistId: string,
  data: {
    folder?: string;
    collection?: string;
    notes?: string;
    isPublic?: boolean;
  }
) {
  const user = await requireAuth();

  // Verify wishlist item belongs to traveler
  const traveler = await prisma.travelerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!traveler) throw new Error("Unauthorized: Traveler profile missing.");

  const item = await prisma.wishlist.findUnique({
    where: { id: wishlistId },
  });

  if (!item || item.travelerId !== traveler.id) {
    throw new Error("Unauthorized: Wishlist entry not found.");
  }

  // Generate shareable token if it's set to public and does not have one
  let shareableToken = item.shareableToken;
  if (data.isPublic && !shareableToken) {
    const crypto = require('crypto');
    shareableToken = crypto.randomBytes(16).toString('hex');
  }

  const updated = await prisma.wishlist.update({
    where: { id: wishlistId },
    data: {
      folder: data.folder,
      collection: data.collection,
      notes: data.notes,
      isPublic: data.isPublic,
      shareableToken,
    },
  });

  revalidatePath("/dashboard/wishlist");
  return updated;
}

/**
 * Review Category Ratings Upgrades, Replies, and Helpful votes delegated to the verified reviews layer
 */
export async function submitUpgradedReviewAction(data: {
  bookingId: string;
  rating: number;
  comment: string;
  images: string[];
  ratingFood: number;
  ratingHospitality: number;
  ratingExperience: number;
  ratingCulture: number;
  ratingSafety: number;
  ratingAccommodation: number;
}) {
  return submitReviewAction({
    bookingId: data.bookingId,
    rating: data.rating,
    comment: data.comment,
    images: data.images,
    ratingFood: data.ratingFood,
    ratingHospitality: data.ratingHospitality,
    ratingExperience: data.ratingExperience,
    ratingCulture: data.ratingCulture,
    ratingSafety: data.ratingSafety,
    ratingAccommodation: data.ratingAccommodation
  });
}

export async function voteReviewHelpful(reviewId: string) {
  return voteReviewHelpfulAction(reviewId);
}

export async function replyToReview(reviewId: string, reply: string) {
  return replyToReviewAction({
    reviewId,
    content: reply
  });
}

/**
 * Discovery Admin stats & boosts
 */
export async function adminGetDiscoveryStats() {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) throw new Error("Admin only.");

  const analytics = await prisma.searchAnalytics.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Aggregate popular searches
  const topSearches = await prisma.searchAnalytics.groupBy({
    by: ["query"],
    _count: {
      query: true,
    },
    orderBy: {
      _count: {
        query: "desc",
      },
    },
    take: 10,
  });

  // Failed searches
  const failedSearches = await prisma.searchAnalytics.findMany({
    where: { resultsCount: 0 },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    analytics,
    topSearches: topSearches.map((t) => ({ query: t.query, count: t._count.query })),
    failedSearches,
  };
}

export async function adminSetManualBoost(weddingId: string, boostScore: number) {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) throw new Error("Admin only.");

  const updated = await prisma.wedding.update({
    where: { id: weddingId },
    data: {
      manualTrendingBoost: boostScore,
    },
  });

  revalidatePath(`/weddings`);
  return updated;
}
