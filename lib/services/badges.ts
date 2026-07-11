import { prisma } from "@/lib/prisma";
import { ReputationEntityType } from "@prisma/client";
import { calculateBayesianRating } from "./trust-score";

/**
 * Initializes the default Quality Badges if they don't exist in the database.
 */
export async function initializeDefaultBadges() {
  const defaultBadges = [
    {
      key: "verified-host",
      name: "Verified Host",
      description: "Host identity verified and zero critical safety infractions.",
      entityType: ReputationEntityType.HOST,
      icon: "shield-check",
      criteria: JSON.stringify({ minTrustScore: 80, requireVerification: true, maxSafetyInfractions: 0 }),
      priority: 10
    },
    {
      key: "guest-favorite",
      name: "Guest Favorite",
      description: "Highly-rated wedding experience with excellent traveler feedback.",
      entityType: ReputationEntityType.WEDDING,
      icon: "heart",
      criteria: JSON.stringify({ minBayesianRating: 4.8, minReviewsCount: 5 }),
      priority: 20
    },
    {
      key: "reliable-host",
      name: "Reliable Host",
      description: "Excellent reliability record with zero host cancellations.",
      entityType: ReputationEntityType.HOST,
      icon: "check-circle",
      criteria: JSON.stringify({ minAttendanceRate: 100, maxCancellations: 0 }),
      priority: 5
    },
    {
      key: "trusted-traveler",
      name: "Trusted Traveler",
      description: "Perfect attendance record and exemplary conduct reviews.",
      entityType: ReputationEntityType.TRAVELER,
      icon: "user-check",
      criteria: JSON.stringify({ minAttendanceRate: 100, zeroNoShows: true, minConductScore: 85 }),
      priority: 8
    }
  ];

  for (const b of defaultBadges) {
    await prisma.qualityBadge.upsert({
      where: { key: b.key },
      update: {
        name: b.name,
        description: b.description,
        icon: b.icon,
        criteria: b.criteria,
        priority: b.priority
      },
      create: b
    });
  }
}

/**
 * Evaluates quality badge rules for a host, traveler, or wedding entity.
 * Awards or revokes badges based on criteria benchmarks.
 */
export async function evaluateEntityBadges(
  entityType: ReputationEntityType,
  entityId: string
): Promise<void> {
  // Ensure default definitions exist
  await initializeDefaultBadges();

  const profile = await prisma.reputationProfile.findUnique({
    where: { entityType_entityId: { entityType, entityId } }
  });

  const overallScore = profile?.overallScore || 80;

  if (entityType === ReputationEntityType.HOST) {
    const couple = await prisma.coupleProfile.findUnique({
      where: { id: entityId },
      include: {
        user: {
          include: {
            verification: true
          }
        }
      }
    });
    if (!couple) return;

    // 1. Evaluate "verified-host"
    const verifiedBadge = await prisma.qualityBadge.findUnique({ where: { key: "verified-host" } });
    if (verifiedBadge && verifiedBadge.active) {
      // Check verification status
      const isVerified = couple.user.verification?.status === "APPROVED";
      const safetyCount = await prisma.safetyCase.count({
        where: {
          wedding: { hostCoupleId: entityId },
          severity: { in: ["HIGH", "CRITICAL"] },
          status: "RESOLVED"
        }
      });

      const meetsVerifiedCriteria = overallScore >= 80 && isVerified && safetyCount === 0;
      await toggleUserBadge(couple.userId, verifiedBadge.id, meetsVerifiedCriteria, "Failed verified-host reputation check.");
    }

    // 2. Evaluate "reliable-host"
    const reliableBadge = await prisma.qualityBadge.findUnique({ where: { key: "reliable-host" } });
    if (reliableBadge && reliableBadge.active) {
      const cancellations = await prisma.cancellationRequest.count({
        where: {
          booking: { wedding: { hostCoupleId: entityId } },
          actorRole: "HOST",
          status: "COMPLETED"
        }
      });
      const completedBookingsCount = await prisma.booking.count({
        where: {
          wedding: { hostCoupleId: entityId },
          status: { in: ["ATTENDED", "COMPLETED"] }
        }
      });
      const meetsReliable = cancellations === 0 && overallScore >= 85 && completedBookingsCount >= 3;
      await toggleUserBadge(couple.userId, reliableBadge.id, meetsReliable, "Host cancellation detected, low trust score, or insufficient completed bookings (< 3).");
    }
  } 
  
  else if (entityType === ReputationEntityType.TRAVELER) {
    const traveler = await prisma.travelerProfile.findUnique({
      where: { id: entityId },
      include: { user: true }
    });
    if (!traveler) return;

    // Evaluate "trusted-traveler"
    const travelerBadge = await prisma.qualityBadge.findUnique({ where: { key: "trusted-traveler" } });
    if (travelerBadge && travelerBadge.active) {
      const bookings = await prisma.booking.findMany({
        where: { travelerId: entityId }
      });
      const noShows = bookings.filter((b) => b.status === "NO_SHOW").length;
      const attendedBookingsCount = await prisma.booking.count({
        where: {
          travelerId: entityId,
          status: { in: ["ATTENDED", "COMPLETED"] }
        }
      });

      const meetsTraveler = attendedBookingsCount >= 3 && noShows === 0 && overallScore >= 85;
      await toggleUserBadge(traveler.userId, travelerBadge.id, meetsTraveler, "Traveler no-show detected, low trust score, or insufficient completed bookings (< 3).");
    }
  } 
  
  else if (entityType === ReputationEntityType.WEDDING) {
    const wedding = await prisma.wedding.findUnique({
      where: { id: entityId }
    });
    if (!wedding) return;

    // Evaluate "guest-favorite"
    const favoriteBadge = await prisma.qualityBadge.findUnique({ where: { key: "guest-favorite" } });
    if (favoriteBadge && favoriteBadge.active) {
      const ratings = await calculateBayesianRating(entityId);
      const meetsFavorite = ratings.bayesianRating >= 4.8 && ratings.reviewCount >= 5;
      await toggleWeddingBadge(entityId, favoriteBadge.id, meetsFavorite, "Bayesian average rating falls below 4.8 or reviews < 5.");
    }
  }
}

async function toggleUserBadge(
  userId: string,
  badgeId: string,
  award: boolean,
  revokeReason: string
) {
  const existing = await prisma.userQualityBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId } }
  });

  if (award) {
    if (existing && existing.revokedAt) {
      // Re-enable revoked badge
      await prisma.userQualityBadge.update({
        where: { id: existing.id },
        data: { revokedAt: null, reason: null, awardedAt: new Date() }
      });
    } else if (!existing) {
      // Create new award
      await prisma.userQualityBadge.create({
        data: { userId, badgeId }
      });
    }
  } else {
    if (existing && !existing.revokedAt) {
      // Soft revoke
      await prisma.userQualityBadge.update({
        where: { id: existing.id },
        data: { revokedAt: new Date(), reason: revokeReason }
      });
    }
  }
}

async function toggleWeddingBadge(
  weddingId: string,
  badgeId: string,
  award: boolean,
  revokeReason: string
) {
  const existing = await prisma.weddingQualityBadge.findUnique({
    where: { weddingId_badgeId: { weddingId, badgeId } }
  });

  if (award) {
    if (existing && existing.revokedAt) {
      await prisma.weddingQualityBadge.update({
        where: { id: existing.id },
        data: { revokedAt: null, reason: null, awardedAt: new Date() }
      });
    } else if (!existing) {
      await prisma.weddingQualityBadge.create({
        data: { weddingId, badgeId }
      });
    }
  } else {
    if (existing && !existing.revokedAt) {
      await prisma.weddingQualityBadge.update({
        where: { id: existing.id },
        data: { revokedAt: new Date(), reason: revokeReason }
      });
    }
  }
}
