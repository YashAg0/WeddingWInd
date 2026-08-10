"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { evaluateReviewEligibility } from "@/lib/services/review-eligibility";
import { evaluateReviewFraud } from "@/lib/services/review-fraud";
import { logReputationEvent } from "@/lib/services/reputation";
import { rateLimit } from "@/lib/rate-limit";
import { ReviewType, ReviewReportReason, ReviewStatus, AppealStatus, ReputationEntityType, ReputationEventType } from "@prisma/client";

/**
 * Helper to adjust reputation scores dynamically based on review direction and action.
 */
async function adjustReviewReputation(
  reviewId: string,
  bookingId: string,
  reviewType: ReviewType,
  oldRating: number,
  newRating: number | null,
  isModeration: boolean = false,
  customActionName?: string
) {
  const oldEffect = oldRating >= 4 ? 3 : oldRating <= 2 ? -5 : 0;
  const newEffect = newRating !== null ? (newRating >= 4 ? 3 : newRating <= 2 ? -5 : 0) : 0;
  const diff = newEffect - oldEffect;

  if (diff === 0) return;

  const bookingDetails = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { traveler: true }
  });
  if (!bookingDetails) return;

  const eventType = newRating === null
    ? ReputationEventType.REVIEW_REMOVED
    : isModeration
      ? ReputationEventType.VERIFIED_REVIEW
      : ReputationEventType.MANUAL_ADMIN_ADJUSTMENT;

  const baseKey = customActionName || (newRating === null ? `REVERT_REVIEW:${reviewId}` : isModeration ? `ADMIN_RESTORE:${reviewId}` : `EDIT_REVIEW:${reviewId}`);

  if (reviewType === ReviewType.TRAVELER_TO_WEDDING) {
    // 1. Wedding Profile
    await logReputationEvent({
      entityType: ReputationEntityType.WEDDING,
      entityId: bookingDetails.weddingId,
      type: eventType,
      scoreEffect: diff,
      referenceId: reviewId,
      idempotencyKey: `${baseKey}:WEDDING`
    });

    // 2. Host Profile
    const weddingDetails = await prisma.wedding.findUnique({
      where: { id: bookingDetails.weddingId }
    });
    if (weddingDetails) {
      await logReputationEvent({
        entityType: ReputationEntityType.HOST,
        entityId: weddingDetails.hostCoupleId,
        type: eventType,
        scoreEffect: diff,
        referenceId: reviewId,
        idempotencyKey: `${baseKey}:HOST`
      });
    }
  } else if (reviewType === ReviewType.HOST_TO_TRAVELER) {
    await logReputationEvent({
      entityType: ReputationEntityType.TRAVELER,
      entityId: bookingDetails.travelerId,
      type: eventType,
      scoreEffect: diff,
      referenceId: reviewId,
      idempotencyKey: `${baseKey}:TRAVELER`
    });
  } else if (reviewType === ReviewType.TRAVELER_TO_AGENT) {
    const referral = await prisma.agentReferral.findFirst({
      where: { referredUserId: bookingDetails.traveler.userId }
    });
    if (referral) {
      await logReputationEvent({
        entityType: ReputationEntityType.AGENT,
        entityId: referral.agentId,
        type: eventType,
        scoreEffect: diff,
        referenceId: reviewId,
        idempotencyKey: `${baseKey}:AGENT`
      });
    }
  }
}

/**
 * Submits a new review.
 */
export async function submitReviewAction(params: {
  bookingId: string;
  rating: number;
  comment: string;
  reviewType?: ReviewType;
  ratingFood?: number;
  ratingHospitality?: number;
  ratingExperience?: number;
  ratingCulture?: number;
  ratingSafety?: number;
  ratingAccommodation?: number;
  ratingOrganization?: number;
  ratingValue?: number;
  ratingCommunication?: number;
  images?: string[];
}) {
  const user = await requireAuth();
  
  const { success } = await rateLimit("submitReview", user.id, { limit: 5, window: 60 });
  if (!success) {
    throw new Error("RATE_LIMIT_EXCEEDED: You are submitting reviews too quickly. Please try again later.");
  }
  
  // Decide review type based on role
  let reviewType: ReviewType = params.reviewType || ReviewType.TRAVELER_TO_WEDDING;
  if (!params.reviewType) {
    if (user.role === "COUPLE") {
      reviewType = ReviewType.HOST_TO_TRAVELER;
    }
  }

  // 1. Evaluate Eligibility
  const eligibility = await evaluateReviewEligibility({
    userId: user.id,
    bookingId: params.bookingId,
    reviewType
  });

  if (!eligibility.eligible) {
    throw new Error(`REVIEW_INELIGIBLE: ${eligibility.reason}`);
  }

  const travelerId = user.travelerProfile?.id || "";

  // 2. Evaluate Fraud Heuristics
  const fraudCheck = await evaluateReviewFraud(
    {
      bookingId: params.bookingId,
      travelerId,
      rating: params.rating,
      comment: params.comment
    },
    user.id
  );

  const status = fraudCheck.detected ? "UNDER_REVIEW" : "PUBLISHED";

  // 3. Database Transaction
  const review = await prisma.$transaction(async (tx) => {
    // Create the review
    const createdReview = await tx.review.create({
      data: {
        bookingId: params.bookingId,
        travelerId: travelerId || (await tx.booking.findUnique({ where: { id: params.bookingId } }))?.travelerId || "",
        rating: params.rating,
        comment: params.comment,
        status,
        type: reviewType,
        images: params.images || [],
        ratingFood: params.ratingFood ?? 5,
        ratingHospitality: params.ratingHospitality ?? 5,
        ratingExperience: params.ratingExperience ?? 5,
        ratingCulture: params.ratingCulture ?? 5,
        ratingSafety: params.ratingSafety ?? 5,
        ratingAccommodation: params.ratingAccommodation ?? 5,
        ratingOrganization: params.ratingOrganization ?? 5,
        ratingValue: params.ratingValue ?? 5,
        ratingCommunication: params.ratingCommunication ?? 5
      }
    });

    // Write fraud signals
    for (const signal of fraudCheck.signals) {
      await tx.reviewFraudSignal.create({
        data: {
          reviewId: createdReview.id,
          type: signal.type,
          severity: signal.severity,
          score: signal.score,
          metadata: JSON.stringify(signal.metadata)
        }
      });
    }

    return createdReview;
  });

  // 4. Log Reputation Event if published
  if (status === "PUBLISHED") {
    // Determine score effect
    const scoreEffect = params.rating >= 4 ? 3 : params.rating <= 2 ? -5 : 0;
    
    // Log event for the appropriate entity type
    const bookingDetails = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { traveler: true }
    });
    if (bookingDetails) {
      if (reviewType === ReviewType.TRAVELER_TO_WEDDING) {
        await logReputationEvent({
          entityType: ReputationEntityType.WEDDING,
          entityId: bookingDetails.weddingId,
          type: ReputationEventType.VERIFIED_REVIEW,
          scoreEffect,
          referenceId: review.id,
          idempotencyKey: `VERIFIED_REVIEW:WEDDING:${params.bookingId}`
        });

        // Also log event for the host couple
        const weddingDetails = await prisma.wedding.findUnique({
          where: { id: bookingDetails.weddingId }
        });
        if (weddingDetails) {
          await logReputationEvent({
            entityType: ReputationEntityType.HOST,
            entityId: weddingDetails.hostCoupleId,
            type: ReputationEventType.VERIFIED_REVIEW,
            scoreEffect,
            referenceId: review.id,
            idempotencyKey: `VERIFIED_REVIEW:HOST:${params.bookingId}`
          });
        }
      } else if (reviewType === ReviewType.HOST_TO_TRAVELER) {
        await logReputationEvent({
          entityType: ReputationEntityType.TRAVELER,
          entityId: bookingDetails.travelerId,
          type: ReputationEventType.VERIFIED_REVIEW,
          scoreEffect,
          referenceId: review.id,
          idempotencyKey: `VERIFIED_REVIEW:TRAVELER:${params.bookingId}`
        });
      } else if (reviewType === ReviewType.TRAVELER_TO_AGENT) {
        const referral = await prisma.agentReferral.findFirst({
          where: { referredUserId: bookingDetails.traveler.userId }
        });
        if (referral) {
          await logReputationEvent({
            entityType: ReputationEntityType.AGENT,
            entityId: referral.agentId,
            type: ReputationEventType.VERIFIED_REVIEW,
            scoreEffect,
            referenceId: review.id,
            idempotencyKey: `VERIFIED_REVIEW:AGENT:${params.bookingId}`
          });
        }
      }
    }
  }

  return { success: true, reviewId: review.id, status };
}

/**
 * Edits an existing review within the 14-day window.
 */
export async function editReviewAction(params: {
  reviewId: string;
  rating: number;
  comment: string;
  ratingFood?: number;
  ratingHospitality?: number;
  ratingExperience?: number;
  ratingCulture?: number;
  ratingSafety?: number;
  ratingAccommodation?: number;
  ratingOrganization?: number;
  ratingValue?: number;
  ratingCommunication?: number;
}) {
  const user = await requireAuth();

  const { success } = await rateLimit("editReview", user.id, { limit: 5, window: 60 });
  if (!success) {
    throw new Error("RATE_LIMIT_EXCEEDED: You are editing reviews too quickly. Please try again later.");
  }

  let attempts = 0;
  const maxAttempts = 5;
  let finalResult: { review: any; status: string; nextEditCount: number } | null = null;

  while (attempts < maxAttempts) {
    attempts++;

    const review = await prisma.review.findUnique({
      where: { id: params.reviewId },
      include: { booking: true }
    });

    if (!review || review.deletedAt) {
      throw new Error("Review not found.");
    }

    // Verify ownership
    const isOwner = user.travelerProfile && review.travelerId === user.travelerProfile.id;
    if (!isOwner) {
      throw new Error("UNAUTHORIZED: You do not own this review.");
    }

    // Verify 14-day window
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(review.createdAt).getTime();
    if (elapsed > fourteenDaysMs) {
      throw new Error("EDIT_WINDOW_EXPIRED: Reviews can only be edited within 14 days of creation.");
    }

    // Recheck fraud signals
    const fraudCheck = await evaluateReviewFraud(
      {
        bookingId: review.bookingId,
        travelerId: review.travelerId,
        rating: params.rating,
        comment: params.comment
      },
      user.id
    );

    const status = fraudCheck.detected ? "UNDER_REVIEW" : review.status;
    const expectedEditCount = review.editCount;
    const nextEditCount = expectedEditCount + 1;

    const updateResult = await prisma.review.updateMany({
      where: {
        id: params.reviewId,
        editCount: expectedEditCount
      },
      data: {
        rating: params.rating,
        comment: params.comment,
        status,
        ratingFood: params.ratingFood ?? review.ratingFood,
        ratingHospitality: params.ratingHospitality ?? review.ratingHospitality,
        ratingExperience: params.ratingExperience ?? review.ratingExperience,
        ratingCulture: params.ratingCulture ?? review.ratingCulture,
        ratingSafety: params.ratingSafety ?? review.ratingSafety,
        ratingAccommodation: params.ratingAccommodation ?? review.ratingAccommodation,
        ratingOrganization: params.ratingOrganization ?? review.ratingOrganization,
        ratingValue: params.ratingValue ?? review.ratingValue,
        ratingCommunication: params.ratingCommunication ?? review.ratingCommunication,
        editedAt: new Date(),
        editCount: nextEditCount
      }
    });

    if (updateResult.count === 1) {
      finalResult = { review, status, nextEditCount };
      break;
    }

    console.warn(`Concurrency conflict detected on review edit (attempt ${attempts}/${maxAttempts}). Retrying...`);
  }

  if (!finalResult) {
    throw new Error("CONCURRENCY_CONFLICT: Unable to update review due to concurrent modifications. Please try again.");
  }

  const result = finalResult;

  // Re-log reputation effects if rating changed and status is published
  if (result.status === "PUBLISHED" && result.review.rating !== params.rating) {
    await adjustReviewReputation(
      result.review.id,
      result.review.bookingId,
      result.review.type,
      result.review.rating,
      params.rating,
      false,
      `EDIT_REVIEW_DIFF:${result.review.id}:${result.nextEditCount}`
    );
  }

  return { success: true, status: result.status };
}

/**
 * Soft deletes a review.
 */
export async function deleteReviewAction(reviewId: string) {
  const user = await requireAuth();

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { booking: true }
  });

  if (!review || review.deletedAt) {
    throw new Error("Review not found.");
  }

  const isModerator = user.role === "ADMIN";
  const isOwner = user.travelerProfile && review.travelerId === user.travelerProfile.id;

  if (!isOwner && !isModerator) {
    throw new Error("UNAUTHORIZED: You do not have permission to delete this review.");
  }

  // Traveler deletion restraint: Check for active safety disputes on the booking
  if (isOwner) {
    const activeSafetyCase = await prisma.safetyCase.findFirst({
      where: {
        bookingId: review.bookingId,
        status: { notIn: ["RESOLVED", "CLOSED"] }
      }
    });

    if (activeSafetyCase) {
      throw new Error("DELETION_LOCKED: You cannot delete your review while there is an active safety dispute case open for this booking.");
    }
  }

  // Soft Delete
  await prisma.review.update({
    where: { id: reviewId },
    data: {
      deletedAt: new Date(),
      status: "HIDDEN"
    }
  });

  // Revert reputation scores
  if (review.status === "PUBLISHED") {
    await adjustReviewReputation(
      review.id,
      review.bookingId,
      review.type,
      review.rating,
      null,
      false,
      `REVERT_REVIEW:${review.id}`
    );
  }

  return { success: true };
}

/**
 * Submits a report against a review.
 */
export async function reportReviewAction(params: {
  reviewId: string;
  reason: ReviewReportReason;
  details?: string;
}) {
  const user = await requireAuth();

  if (params.details && params.details.length > 500) {
    throw new Error("DETAILS_TOO_LONG: Report details must be 500 characters or less.");
  }

  const { success } = await rateLimit("reportReview", user.id, { limit: 5, window: 60 });
  if (!success) {
    throw new Error("RATE_LIMIT_EXCEEDED: You are reporting reviews too quickly. Please try again later.");
  }

  // Prevent double report per user-review
  const existing = await prisma.reviewReport.findUnique({
    where: {
      reviewId_reporterId: { reviewId: params.reviewId, reporterId: user.id }
    }
  });

  if (existing) {
    throw new Error("DUPLICATE_REPORT: You have already reported this review.");
  }

  await prisma.reviewReport.create({
    data: {
      reviewId: params.reviewId,
      reporterId: user.id,
      reason: params.reason,
      details: params.details
    }
  });

  // Check if reported threshold has been reached (e.g. 3 reports triggers auto-moderation)
  const reportCount = await prisma.reviewReport.count({
    where: { reviewId: params.reviewId }
  });

  if (reportCount >= 3) {
    await prisma.review.update({
      where: { id: params.reviewId },
      data: { status: "UNDER_REVIEW" }
    });
  }

  return { success: true, flagged: reportCount >= 3 };
}

/**
 * Votes a review as helpful.
 */
/**
 * Reconciles the denormalized helpfulVotes count on a Review with actual DB records.
 */
export async function reconcileReviewHelpfulCount(reviewId: string): Promise<number> {
  const actualCount = await prisma.reviewHelpfulVote.count({
    where: { reviewId }
  });

  await prisma.review.update({
    where: { id: reviewId },
    data: { helpfulVotes: actualCount }
  });

  return actualCount;
}

export async function voteReviewHelpfulAction(reviewId: string) {
  const user = await requireAuth();

  const { success } = await rateLimit("voteReviewHelpful", user.id, { limit: 10, window: 60 });
  if (!success) {
    throw new Error("RATE_LIMIT_EXCEEDED: You are voting reviews too quickly. Please try again later.");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });
  if (!review || review.deletedAt || review.status === "HIDDEN" || review.status === "UNDER_REVIEW") {
    throw new Error("UNAVAILABLE: Cannot vote on a deleted or hidden review.");
  }

  const existing = await prisma.reviewHelpfulVote.findUnique({
    where: {
      reviewId_userId: { reviewId, userId: user.id }
    }
  });

  if (existing) {
    // Unlike / revoke vote
    await prisma.reviewHelpfulVote.delete({
      where: { id: existing.id }
    });

    const helpfulVotes = await reconcileReviewHelpfulCount(reviewId);

    return { success: true, helpfulVotes, voted: false };
  }

  await prisma.reviewHelpfulVote.create({
    data: { reviewId, userId: user.id }
  });

  const helpfulVotes = await reconcileReviewHelpfulCount(reviewId);

  return { success: true, helpfulVotes, voted: true };
}

/**
 * Adds a host reply to a review.
 */
export async function replyToReviewAction(params: {
  reviewId: string;
  content: string;
}) {
  const user = await requireAuth();

  const { success } = await rateLimit("replyToReview", user.id, { limit: 5, window: 60 });
  if (!success) {
    throw new Error("RATE_LIMIT_EXCEEDED: You are replying to reviews too quickly. Please try again later.");
  }

  const review = await prisma.review.findUnique({
    where: { id: params.reviewId },
    include: { booking: { include: { wedding: true } } }
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  // Verify that the user is the wedding host couple
  const wedding = review.booking.wedding;
  if (!user.coupleProfile || wedding.hostCoupleId !== user.coupleProfile.id) {
    throw new Error("UNAUTHORIZED: Only the host of this wedding can reply to this review.");
  }

  // Enforce single active reply policy
  const existingReply = await prisma.reviewReply.findFirst({
    where: { reviewId: params.reviewId, deletedAt: null }
  });
  if (existingReply) {
    throw new Error("DUPLICATE_REPLY: You have already replied to this review.");
  }

  const reply = await prisma.reviewReply.create({
    data: {
      reviewId: params.reviewId,
      userId: user.id,
      content: params.content
    }
  });

  // Keep legacy field in review for compatibility
  await prisma.review.update({
    where: { id: params.reviewId },
    data: { reply: params.content }
  });

  return { success: true, reply };
}

/**
 * Removes a host reply.
 */
export async function removeReviewReplyAction(replyId: string) {
  const user = await requireAuth();

  const reply = await prisma.reviewReply.findUnique({
    where: { id: replyId },
    include: { review: { include: { booking: { include: { wedding: true } } } } }
  });

  if (!reply) {
    throw new Error("Reply not found.");
  }

  const isModerator = user.role === "ADMIN";
  const isHost = user.coupleProfile && reply.review.booking.wedding.hostCoupleId === user.coupleProfile.id;

  if (!isHost && !isModerator) {
    throw new Error("UNAUTHORIZED: Only the host or an administrator can delete this reply.");
  }

  await prisma.reviewReply.update({
    where: { id: replyId },
    data: { deletedAt: new Date() }
  });

  // Clear legacy field
  await prisma.review.update({
    where: { id: reply.reviewId },
    data: { reply: null }
  });

  return { success: true };
}

/**
 * Admin action to moderate review status.
 */
export async function adminModerateReviewAction(params: {
  reviewId: string;
  action: "PUBLISH" | "HIDE" | "REMOVE" | "RESTORE";
  reason: string;
}) {
  const adminUser = await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("UNAUTHORIZED: Administrative privileges required.");
  }

  const review = await prisma.review.findUnique({
    where: { id: params.reviewId },
    include: { booking: true }
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  let status: string = review.status;
  let deletedAt = review.deletedAt;

  if (params.action === "PUBLISH" || params.action === "RESTORE") {
    status = "PUBLISHED";
    deletedAt = null;
  } else if (params.action === "HIDE") {
    status = "HIDDEN";
  } else if (params.action === "REMOVE") {
    status = "REMOVED";
    deletedAt = new Date();
  }

  // Create audit log
  await prisma.reviewModerationAction.create({
    data: {
      reviewId: params.reviewId,
      moderatorId: adminUser.id,
      action: params.action,
      reason: params.reason
    }
  });

  await prisma.review.update({
    where: { id: params.reviewId },
    data: { status: status as ReviewStatus, deletedAt }
  });

  // Re-evaluate trust score
  const isAdding = status === "PUBLISHED";
  const wasAdding = review.status === "PUBLISHED" && !review.deletedAt;

  if (isAdding && !wasAdding) {
    await adjustReviewReputation(
      review.id,
      review.bookingId,
      review.type,
      0,
      review.rating,
      true,
      `ADMIN_RESTORE_REVIEW:${review.id}`
    );
  } else if (!isAdding && wasAdding) {
    await adjustReviewReputation(
      review.id,
      review.bookingId,
      review.type,
      review.rating,
      null,
      true,
      `ADMIN_REMOVE_REVIEW:${review.id}`
    );
  }

  return { success: true };
}

/**
 * Submits an appeal against review moderation.
 */
export async function submitReviewAppealAction(params: {
  reviewId: string;
  reason: string;
}) {
  const user = await requireAuth();

  const { success } = await rateLimit("submitReviewAppeal", user.id, { limit: 3, window: 60 });
  if (!success) {
    throw new Error("RATE_LIMIT_EXCEEDED: You are submitting appeals too quickly. Please try again later.");
  }

  const review = await prisma.review.findUnique({
    where: { id: params.reviewId },
    include: {
      traveler: { include: { user: true } },
      booking: { include: { wedding: { include: { hostCouple: { include: { user: true } } } } } }
    }
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  // Verify that the user is either the traveler who wrote it, or the host couple of the booking
  const isTraveler = review.traveler.user.id === user.id;
  const isHost = review.booking.wedding.hostCouple.user.id === user.id;

  if (!isTraveler && !isHost) {
    throw new Error("UNAUTHORIZED: Only the reviewer or the wedding host can appeal this review.");
  }

  // Create the appeal
  const appeal = await prisma.reviewAppeal.create({
    data: {
      reviewId: params.reviewId,
      submittedById: user.id,
      reason: params.reason,
      status: "SUBMITTED"
    }
  });

  // Update review status to indicate it is appealed
  await prisma.review.update({
    where: { id: params.reviewId },
    data: { status: "APPEALED" }
  });

  return { success: true, appealId: appeal.id };
}

/**
 * Admin action to decide a review appeal with reviewer separation.
 */
export async function adminReviewReviewAppealAction(params: {
  appealId: string;
  action: "UPHELD" | "OVERTURNED" | "REJECTED";
  notes: string;
}) {
  const adminUser = await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("UNAUTHORIZED: Administrative privileges required.");
  }

  const appeal = await prisma.reviewAppeal.findUnique({
    where: { id: params.appealId },
    include: {
      review: {
        include: {
          moderationActions: { orderBy: { createdAt: "desc" }, take: 1 }
        }
      }
    }
  });

  if (!appeal) {
    throw new Error("Appeal not found.");
  }

  // Enforce reviewer separation: The admin reviewing the appeal must NOT be the admin who moderated the review
  const latestModerationAction = appeal.review.moderationActions[0];
  if (latestModerationAction && latestModerationAction.moderatorId === adminUser.id) {
    throw new Error("REVIEWER_SEPARATION_VIOLATION: You cannot rule on the appeal of your own moderation decision.");
  }

  // Update appeal status
  await prisma.reviewAppeal.update({
    where: { id: params.appealId },
    data: {
      status: params.action as AppealStatus,
      reviewedById: adminUser.id,
      reviewNotes: params.notes,
      reviewedAt: new Date()
    }
  });

  // Apply resolution effects to the review
  if (params.action === "OVERTURNED") {
    // Overturned means the appeal was successful, restore review to PUBLISHED
    await prisma.review.update({
      where: { id: appeal.reviewId },
      data: { status: "PUBLISHED", deletedAt: null }
    });

    // Re-evaluate trust score
    const reviewDetails = await prisma.review.findUnique({
      where: { id: appeal.reviewId },
      include: { booking: true }
    });
    if (reviewDetails) {
      await adjustReviewReputation(
        reviewDetails.id,
        reviewDetails.bookingId,
        reviewDetails.type,
        0,
        reviewDetails.rating,
        true,
        `APPEAL_RESTORE_REVIEW:${reviewDetails.id}`
      );
    }
  } else if (params.action === "UPHELD" || params.action === "REJECTED") {
    // Upheld or Rejected means the appeal failed, keep it hidden/removed
    await prisma.review.update({
      where: { id: appeal.reviewId },
      data: { status: "REMOVED", deletedAt: new Date() }
    });
  }

  return { success: true };
}
