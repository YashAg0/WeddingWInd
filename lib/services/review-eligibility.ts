import { prisma } from "@/lib/prisma";
import { BookingStatus, ReviewType, UserStatus, RestrictionType } from "@prisma/client";
import { checkUserRestriction } from "@/lib/actions/safety";

export interface EligibilityResult {
  eligible: boolean;
  reasonCode: string;
  reason: string;
}

export async function evaluateReviewEligibility(params: {
  userId: string;
  bookingId: string;
  reviewType: ReviewType;
}): Promise<EligibilityResult> {
  const { userId, bookingId, reviewType } = params;

  // 1. Resolve User and verify they are not BANNED
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { travelerProfile: true, coupleProfile: true, agentProfile: true }
  });

  if (!user) {
    return { eligible: false, reasonCode: "USER_NOT_FOUND", reason: "User not found." };
  }

  if (user.status === UserStatus.BANNED) {
    return { eligible: false, reasonCode: "USER_BANNED", reason: "Your account is permanently suspended." };
  }

  // 2. Verify user is not REVIEW_RESTRICTED
  const restricted = await checkUserRestriction(userId, RestrictionType.REVIEW_RESTRICTED);
  if (restricted) {
    return { eligible: false, reasonCode: "REVIEW_RESTRICTED", reason: "Your review writing privileges are temporarily restricted." };
  }

  // 3. Retrieve booking context
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      traveler: { include: { user: true } },
      wedding: { include: { hostCouple: { include: { user: true } } } },
      payments: true
    }
  });

  if (!booking) {
    return { eligible: false, reasonCode: "BOOKING_NOT_FOUND", reason: "Booking not found." };
  }

  const refunds = await prisma.refund.findMany({
    where: { payment: { bookingId } }
  });

  // 4. Branch by ReviewType
  if (reviewType === ReviewType.TRAVELER_TO_WEDDING) {
    // A. Verify user is the traveler of the booking
    if (!user.travelerProfile || booking.travelerId !== user.travelerProfile.id) {
      return { eligible: false, reasonCode: "NOT_BOOKING_OWNER", reason: "You do not own this booking." };
    }

    // B. Verify booking attendance state
    const validStates: BookingStatus[] = [
      BookingStatus.CHECKED_IN,
      BookingStatus.ATTENDED,
      BookingStatus.COMPLETED,
    ];
    if (!validStates.includes(booking.status)) {
      return {
        eligible: false,
        reasonCode: "INVALID_ATTENDANCE",
        reason: `You can only review weddings you have attended or completed. Current status: ${booking.status}.`
      };
    }

    // C. Verify event timing (must have started)
    if (booking.wedding.date > new Date()) {
      return { eligible: false, reasonCode: "EVENT_NOT_STARTED", reason: "You cannot review a wedding before it starts." };
    }

    // D. Verify refund status (fully refunded bookings due to invalid attendance/disputes are ineligible)
    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunded = refunds
      .filter((r) => r.status === "SUCCEEDED" || r.status === "COMPLETED")
      .reduce((sum, r) => sum + r.amount, 0);

    if (totalPaid > 0 && totalRefunded >= totalPaid) {
      return { eligible: false, reasonCode: "FULLY_REFUNDED", reason: "Fully refunded disputes or cancellations are ineligible for reviews." };
    }

    // E. Verify no existing review of this type exists for the booking
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId,
        type: ReviewType.TRAVELER_TO_WEDDING,
        deletedAt: null
      }
    });

    if (existingReview) {
      return { eligible: false, reasonCode: "DUPLICATE_REVIEW", reason: "You have already reviewed this wedding." };
    }

    return { eligible: true, reasonCode: "ELIGIBLE", reason: "Eligible." };
  } 
  
  if (reviewType === ReviewType.HOST_TO_TRAVELER) {
    // A. Verify user is the host couple of the wedding
    if (!user.coupleProfile || booking.wedding.hostCoupleId !== user.coupleProfile.id) {
      return { eligible: false, reasonCode: "NOT_WEDDING_HOST", reason: "You are not the host of this wedding." };
    }

    // B. Verify booking state for host review (attended, completed, or no-show)
    const hostReviewStates: BookingStatus[] = [
      BookingStatus.CHECKED_IN,
      BookingStatus.ATTENDED,
      BookingStatus.COMPLETED,
      BookingStatus.NO_SHOW
    ];
    if (!hostReviewStates.includes(booking.status)) {
      return {
        eligible: false,
        reasonCode: "INVALID_GUEST_STATE",
        reason: "You can only review travelers after check-in, completion, or a documented no-show."
      };
    }

    // C. Verify no existing host-to-traveler review for this booking
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId,
        type: ReviewType.HOST_TO_TRAVELER,
        deletedAt: null
      }
    });

    if (existingReview) {
      return { eligible: false, reasonCode: "DUPLICATE_REVIEW", reason: "You have already reviewed this guest." };
    }

    return { eligible: true, reasonCode: "ELIGIBLE", reason: "Eligible." };
  } 
  
  if (reviewType === ReviewType.TRAVELER_TO_AGENT) {
    // A. Verify traveler owned the booking
    if (!user.travelerProfile || booking.travelerId !== user.travelerProfile.id) {
      return { eligible: false, reasonCode: "NOT_BOOKING_OWNER", reason: "You do not own this booking." };
    }

    // B. Verify referral attribution exists for this traveler
    const referral = await prisma.agentReferral.findFirst({
      where: { referredUserId: userId }
    });

    if (!referral) {
      return { eligible: false, reasonCode: "NO_AGENT_ATTRIBUTION", reason: "You were not referred by an agent." };
    }

    // C. Verify the traveler completed a qualifying booking
    const completedBooking = await prisma.booking.findFirst({
      where: {
        travelerId: user.travelerProfile.id,
        status: {
          in: [BookingStatus.CHECKED_IN, BookingStatus.ATTENDED, BookingStatus.COMPLETED]
        }
      }
    });

    if (!completedBooking) {
      return { eligible: false, reasonCode: "NO_QUALIFYING_COMPLETED_BOOKINGS", reason: "You must complete at least one wedding before reviewing your agent." };
    }

    // D. Verify no existing review for this agent by this traveler
    const existingReview = await prisma.review.findFirst({
      where: {
        travelerId: user.travelerProfile.id,
        type: ReviewType.TRAVELER_TO_AGENT,
        bookingId, // check per-booking/referral conversion
        deletedAt: null
      }
    });

    if (existingReview) {
      return { eligible: false, reasonCode: "DUPLICATE_REVIEW", reason: "You have already reviewed this agent." };
    }

    return { eligible: true, reasonCode: "ELIGIBLE", reason: "Eligible." };
  }

  if (reviewType === ReviewType.SYSTEM_FEEDBACK) {
    // Only Admin can submit system feedback
    if (user.role !== "ADMIN") {
      return { eligible: false, reasonCode: "UNAUTHORIZED_FEEDBACK", reason: "Only administrators can submit system feedback reviews." };
    }

    // Verify no existing system feedback for this booking
    const existingReview = await prisma.review.findFirst({
      where: {
        bookingId,
        type: ReviewType.SYSTEM_FEEDBACK,
        deletedAt: null
      }
    });

    if (existingReview) {
      return { eligible: false, reasonCode: "DUPLICATE_REVIEW", reason: "System feedback already exists for this booking." };
    }

    return { eligible: true, reasonCode: "ELIGIBLE", reason: "Eligible." };
  }

  return { eligible: false, reasonCode: "UNSUPPORTED_TYPE", reason: "Unsupported review type." };
}
