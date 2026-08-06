import { prisma } from "@/lib/prisma";
import { ReputationEntityType } from "@prisma/client";

/**
 * Shared helper defining the authoritative query filter for valid, active, published reviews.
 */
export function getPublishedReviewWhere(extraWhere?: any) {
  return {
    status: "PUBLISHED",
    deletedAt: null,
    ...extraWhere
  };
}


/**
 * Calculates Jaccard/Wilson Jaccard or Bayesian rating for a Indian Wedding Experience.
 * Prior average C = 4.5, prior weight m = 3.
 */
export async function calculateBayesianRating(weddingId: string): Promise<{
  avgRating: number;
  bayesianRating: number;
  reviewCount: number;
}> {
  const aggregate = await getWeddingRatingAggregate(weddingId);
  return {
    avgRating: aggregate.averageRating,
    bayesianRating: aggregate.bayesianRating,
    reviewCount: aggregate.reviewCount
  };
}

/**
 * Recalculates and caches the trust score and dimensional scores for a given entity.
 */
export async function recalculateTrustScore(
  entityType: ReputationEntityType,
  entityId: string
): Promise<number> {
  // 1. Calculate overall score by summing ledger delta effects on top of 80 baseline
  const events = await prisma.reputationEvent.findMany({
    where: { entityType, entityId }
  });

  const scoreEffectSum = events.reduce((sum, e) => sum + e.scoreEffect, 0);
  const baseline = 80;
  const overallScore = Math.max(0, Math.min(100, baseline + Math.round(scoreEffectSum)));

  // 2. Compute dimensional scores depending on entity type
  const dimensionScores: Record<string, number> = {};

  if (entityType === ReputationEntityType.HOST) {
    // A. Check event reliability (host cancellation rate)
    const bookings = await prisma.booking.findMany({
      where: { wedding: { hostCoupleId: entityId } }
    });
    const hostCancellations = await prisma.cancellationRequest.count({
      where: {
        booking: { wedding: { hostCoupleId: entityId } },
        actorRole: "HOST",
        status: "COMPLETED"
      }
    });
    const totalBookings = bookings.length;
    dimensionScores.eventReliability = totalBookings > 0 
      ? Math.max(0, Math.round(((totalBookings - hostCancellations) / totalBookings) * 100))
      : 100;

    // B. Calculate hospitality score from host-to-traveler reviews
    const reviews = await prisma.review.findMany({
      where: getPublishedReviewWhere({
        booking: { wedding: { hostCoupleId: entityId } },
        type: "TRAVELER_TO_WEDDING"
      })
    });
    const avgHospitality = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.ratingHospitality, 0) / reviews.length
      : 5.0;
    dimensionScores.hospitalityRating = Math.round(avgHospitality * 20); // convert to 0-100 scale

    // C. Count safety incidents
    const safetyCount = await prisma.safetyCase.count({
      where: { wedding: { hostCoupleId: entityId }, status: "RESOLVED" }
    });
    dimensionScores.safetyIncidents = Math.max(0, 100 - safetyCount * 25);
  } 
  
  else if (entityType === ReputationEntityType.TRAVELER) {
    // A. Attendance reliability
    const bookings = await prisma.booking.findMany({
      where: { travelerId: entityId }
    });
    const total = bookings.length;
    const noShows = bookings.filter((b) => b.status === "NO_SHOW").length;
    dimensionScores.attendanceReliability = total > 0
      ? Math.round(((total - noShows) / total) * 100)
      : 100;

    // B. Conduct feedback rating
    const hostReviews = await prisma.review.findMany({
      where: getPublishedReviewWhere({
        booking: { travelerId: entityId },
        type: "HOST_TO_TRAVELER"
      })
    });
    const avgConduct = hostReviews.length > 0
      ? hostReviews.reduce((sum, r) => sum + r.rating, 0) / hostReviews.length
      : 5.0;
    dimensionScores.conductRating = Math.round(avgConduct * 20);
  } 
  
  else if (entityType === ReputationEntityType.AGENT) {
    // A. Referral conversion rate
    const referrals = await prisma.agentReferral.findMany({
      where: { agentId: entityId }
    });
    const total = referrals.length;
    const converted = referrals.filter((r) => r.status === "CONVERTED").length;
    dimensionScores.referralConversionRate = total > 0
      ? Math.round((converted / total) * 100)
      : 0;

    // B. Compliance score (deducted by confirmed frauds)
    const fraudSignalsCount = await prisma.reputationEvent.count({
      where: {
        entityType: ReputationEntityType.AGENT,
        entityId,
        type: "REFERRAL_FRAUD_CONFIRMED"
      }
    });
    dimensionScores.complianceRecord = Math.max(0, 100 - fraudSignalsCount * 25);
  } 
  
  else if (entityType === ReputationEntityType.WEDDING) {
    // A. Overall rating conversion
    const ratings = await calculateBayesianRating(entityId);
    dimensionScores.overallRating = Math.round(ratings.bayesianRating * 20);

    // B. Safety incidents count
    const safetyCount = await prisma.safetyCase.count({
      where: { weddingId: entityId, status: "RESOLVED" }
    });
    dimensionScores.safetyIncidents = Math.max(0, 100 - safetyCount * 25);
  }

  // 3. Update or create the ReputationProfile record
  const confidenceScore = events.length > 15 ? 1.0 : parseFloat((0.5 + events.length * 0.033).toFixed(2));

  await prisma.reputationProfile.upsert({
    where: {
      entityType_entityId: { entityType, entityId }
    },
    update: {
      overallScore,
      confidenceScore,
      dimensionScores: JSON.stringify(dimensionScores),
      updatedAt: new Date()
    },
    create: {
      entityType,
      entityId,
      overallScore,
      confidenceScore,
      dimensionScores: JSON.stringify(dimensionScores)
    }
  });

  // 4. Create historic snapshot record for analytic logging if there is a material change (overall score absolute delta >= 1)
  const latestSnapshot = await prisma.trustScoreSnapshot.findFirst({
    where: { entityType, entityId },
    orderBy: { calculatedAt: "desc" }
  });

  if (!latestSnapshot || Math.abs(latestSnapshot.overallScore - overallScore) >= 1) {
    await prisma.trustScoreSnapshot.create({
      data: {
        entityType,
        entityId,
        overallScore,
        confidenceScore,
        dimensionScores: JSON.stringify(dimensionScores),
        eventCount: events.length
      }
    });
  }

  // 5. Trigger badge evaluation checks
  try {
    const { evaluateEntityBadges } = require("./badges");
    await evaluateEntityBadges(entityType, entityId);
  } catch (badgeErr) {
    console.error("Failed to run quality badge evaluation:", badgeErr);
  }

  return overallScore;
}

/**
 * Authoritative rating aggregate service for a wedding experience.
 */
export async function getWeddingRatingAggregate(weddingId: string) {
  const reviews = await prisma.review.findMany({
    where: getPublishedReviewWhere({
      booking: { weddingId },
      type: "TRAVELER_TO_WEDDING"
    })
  });

  const reviewCount = reviews.length;
  if (reviewCount === 0) {
    return {
      averageRating: 4.5,
      reviewCount: 0,
      bayesianRating: 4.5,
      starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categoryAverages: {
        culture: null,
        food: null,
        hospitality: null,
        safety: null,
        accommodation: null,
        experience: null
      }
    };
  }

  const averageRating = parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(2));
  
  // Bayesian Formula: W = (R * v + C * m) / (v + m), prior C = 4.5, m = 3
  const C = 4.5;
  const m = 3;
  const bayesianRating = parseFloat(((averageRating * reviewCount + C * m) / (reviewCount + m)).toFixed(2));

  // Star Distribution
  const starDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    starDistribution[star] = (starDistribution[star] || 0) + 1;
  });

  // Safe averages of nullable/optional category ratings
  const getAvg = (field: keyof typeof reviews[0]) => {
    const valid = reviews.filter(r => r[field] !== null && r[field] !== undefined);
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, r) => acc + (r[field] as number), 0);
    return parseFloat((sum / valid.length).toFixed(2));
  };

  const categoryAverages = {
    culture: getAvg("ratingCulture"),
    food: getAvg("ratingFood"),
    hospitality: getAvg("ratingHospitality"),
    safety: getAvg("ratingSafety"),
    accommodation: getAvg("ratingAccommodation"),
    experience: getAvg("ratingExperience")
  };

  return {
    averageRating,
    reviewCount,
    bayesianRating,
    starDistribution,
    categoryAverages
  };
}
