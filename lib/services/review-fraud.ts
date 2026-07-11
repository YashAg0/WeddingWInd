import { prisma } from "@/lib/prisma";
import { Review, FraudSignalType } from "@prisma/client";

export interface FraudCheckResult {
  detected: boolean;
  signals: {
    type: FraudSignalType;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    score: number;
    metadata: any;
  }[];
}

/**
 * Calculates Jaccard similarity between two strings at the word level.
 */
function calculateJaccardSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0.0;
  const norm1 = new Set(str1.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));
  const norm2 = new Set(str2.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));
  
  if (norm1.size === 0 && norm2.size === 0) return 1.0;
  
  const intersection = new Set([...norm1].filter(x => norm2.has(x)));
  const union = new Set([...norm1, ...norm2]);
  
  if (union.size === 0) return 0.0;
  
  return intersection.size / union.size;
}

export async function evaluateReviewFraud(
  reviewData: {
    bookingId: string;
    travelerId: string;
    rating: number;
    comment: string;
  },
  userId: string
): Promise<FraudCheckResult> {
  const signals: FraudCheckResult["signals"] = [];
  const normalizedComment = reviewData.comment.toLowerCase().replace(/[^\w]/g, "");

  // Fetch contextual details
  const booking = await prisma.booking.findUnique({
    where: { id: reviewData.bookingId },
    include: {
      wedding: {
        include: {
          hostCouple: { include: { user: true } }
        }
      },
      traveler: { include: { user: true } }
    }
  });

  if (!booking) {
    return { detected: false, signals: [] };
  }

  const wedding = booking.wedding;
  const hostUserId = wedding.hostCouple.userId;

  // Heuristic 1: SELF_REVIEW
  // Traveler is reviewing a wedding where they are the host, or couple accounts are linked
  if (userId === hostUserId || booking.traveler.userId === hostUserId) {
    signals.push({
      type: FraudSignalType.SELF_REVIEW,
      severity: "CRITICAL",
      score: 1.0,
      metadata: { userId, hostUserId }
    });
  }

  // Heuristic 2: DUPLICATE_CONTENT
  // Normalize content using Unicode NFKC and collapse multiple spaces before duplicate check
  const normalizedInput = reviewData.comment.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
  
  if (normalizedInput.length > 0) {
    let duplicateReview = await prisma.review.findFirst({
      where: {
        comment: reviewData.comment,
        deletedAt: null
      }
    });

    if (!duplicateReview) {
      const activeReviews = await prisma.review.findMany({
        where: { deletedAt: null },
        take: 100,
        orderBy: { createdAt: "desc" }
      });
      duplicateReview = activeReviews.find(r => {
        const norm = (r.comment || "").normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
        return norm === normalizedInput;
      }) || null;
    }

    if (duplicateReview) {
      signals.push({
        type: FraudSignalType.DUPLICATE_CONTENT,
        severity: "HIGH",
        score: 0.95,
        metadata: { matchedReviewId: duplicateReview.id }
      });
    }

    // Heuristic 3: REPEATED_TEXT_PATTERN
    // Check similarity against traveler's other reviews
    const otherReviews = await prisma.review.findMany({
      where: {
        travelerId: reviewData.travelerId,
        deletedAt: null
      }
    });
    for (const prev of otherReviews) {
      const similarity = calculateJaccardSimilarity(reviewData.comment, prev.comment || "");
      if (similarity > 0.85) {
        signals.push({
          type: FraudSignalType.REPEATED_TEXT_PATTERN,
          severity: "MEDIUM",
          score: similarity,
          metadata: { matchedReviewId: prev.id, similarity }
        });
        break; // one match is sufficient
      }
    }
  }

  // Heuristic 4: RAPID_REVIEW_BURST
  // Submit multiple reviews within 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentReviewCount = await prisma.review.count({
    where: {
      travelerId: reviewData.travelerId,
      createdAt: { gte: fiveMinutesAgo },
      deletedAt: null
    }
  });
  if (recentReviewCount >= 2) {
    signals.push({
      type: FraudSignalType.RAPID_REVIEW_BURST,
      severity: "HIGH",
      score: Math.min(0.5 + recentReviewCount * 0.15, 1.0),
      metadata: { recentReviewCount }
    });
  }

  // Heuristic 5: RATING_OUTLIER
  // Devise score if rating deviates heavily from wedding average
  const weddingReviews = await prisma.review.findMany({
    where: {
      booking: { weddingId: wedding.id },
      deletedAt: null
    }
  });
  if (weddingReviews.length >= 3) {
    const ratings = weddingReviews.map(r => r.rating);
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const deviation = Math.abs(reviewData.rating - avg);
    if (deviation >= 3.0) {
      signals.push({
        type: FraudSignalType.RATING_OUTLIER,
        severity: "MEDIUM",
        score: deviation / 4.0, // max deviation is 4.0
        metadata: { weddingAverage: avg, currentRating: reviewData.rating }
      });
    }
  }

  // Heuristic 6: RETALIATION_PATTERN
  // Submitted shortly after a safety case is active, or booking cancellation request, or refund issued
  const disputeCount = await prisma.safetyCase.count({
    where: {
      bookingId: reviewData.bookingId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // last 7 days
    }
  });
  const cancellationCount = await prisma.cancellationRequest.count({
    where: {
      bookingId: reviewData.bookingId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  });
  const refundCount = await prisma.refund.count({
    where: {
      payment: { bookingId: reviewData.bookingId },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  });
  if (disputeCount > 0 || cancellationCount > 0 || refundCount > 0) {
    signals.push({
      type: FraudSignalType.RETALIATION_PATTERN,
      severity: "HIGH",
      score: 0.9,
      metadata: {
        activeDisputes: disputeCount,
        cancellationRequests: cancellationCount,
        recentRefunds: refundCount
      }
    });
  }

  // Heuristic 7: CONFLICT_OF_INTEREST
  // Check if traveler is in the host's referral chain or share names
  const hostUser = wedding.hostCouple.user;
  const travelerUser = booking.traveler.user;
  const sameLastName =
    hostUser?.name &&
    travelerUser?.name &&
    hostUser.name.split(" ").pop()?.toLowerCase() === travelerUser.name.split(" ").pop()?.toLowerCase();
  
  if (sameLastName && hostUser && travelerUser && hostUser.name !== travelerUser.name) {
    signals.push({
      type: FraudSignalType.CONFLICT_OF_INTEREST,
      severity: "MEDIUM",
      score: 0.6,
      metadata: { reason: "Shared last name on profiles" }
    });
  }

  // Heuristic 8: UNVERIFIED_EXPERIENCE
  // Booking marked as checked in/attended but without active physical scanning records (manual host override)
  // Let's check if gate scan check-in registers exist in the DB (or check-in event records)
  // In Phase 12 check-in flow, check-ins were registered. We check if guest check-in count is zero.
  const checkInCount = await prisma.guestCheckIn.count({
    where: { bookingId: booking.id }
  });
  if (checkInCount === 0) {
    signals.push({
      type: FraudSignalType.UNVERIFIED_EXPERIENCE,
      severity: "LOW",
      score: 0.4,
      metadata: { checkInCount }
    });
  }

  // Evaluate if the aggregate score or any individual signal triggers fraud resolution
  const detected = signals.some((s) => s.score >= 0.8);

  return { detected, signals };
}
