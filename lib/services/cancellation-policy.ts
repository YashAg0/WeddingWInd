/**
 * lib/services/cancellation-policy.ts
 *
 * Centralized policy engine for calculating booking cancellation refund eligibility.
 * All calculations use integer minor units (cents) internally to avoid floating-point errors.
 */

import { BookingStatus, CancellationActor, CancellationReasonCode } from "@prisma/client";

export interface CancellationPolicyResult {
  eligible: boolean;
  refundPercentage: number; // e.g. 90, 70, 40, 0, 100
  refundableAmount: number; // in float (main currency unit, e.g. USD)
  platformFeeRefundable: boolean;
  reasonCode: CancellationReasonCode;
  explanation: string;
}

/**
 * Calculates the refund details for a cancellation.
 * 
 * @param eventDate The start date/time of the wedding event
 * @param totalAmount The total amount paid for the booking (in float, e.g. USD)
 * @param actor The initiator of the cancellation
 * @param status The current booking status
 * @param reasonCode The reason for cancellation
 * @param cancellationDate Optional cancellation timestamp (defaults to current date)
 * @param overrideRefundAmount Optional admin override amount (in float, e.g. USD)
 */
export function calculateCancellationPolicy({
  eventDate,
  totalAmount,
  actor,
  status,
  reasonCode,
  cancellationDate = new Date(),
  overrideRefundAmount,
}: {
  eventDate: Date;
  totalAmount: number;
  actor: CancellationActor;
  status: BookingStatus;
  reasonCode: CancellationReasonCode;
  cancellationDate?: Date;
  overrideRefundAmount?: number;
}): CancellationPolicyResult {
  // Convert float to minor unit cents (integer)
  const totalCents = Math.round(totalAmount * 100);

  // 1. Validate if booking status is allowed to be cancelled
  const uncancelableStates: BookingStatus[] = [
    BookingStatus.CHECKED_IN,
    BookingStatus.ATTENDED,
    BookingStatus.COMPLETED,
    BookingStatus.NO_SHOW,
    BookingStatus.REFUNDED,
    BookingStatus.CANCELLED,
  ];

  if (uncancelableStates.includes(status)) {
    return {
      eligible: false,
      refundPercentage: 0,
      refundableAmount: 0,
      platformFeeRefundable: false,
      reasonCode,
      explanation: `Bookings with status ${status} cannot be cancelled.`,
    };
  }

  // 2. Admin / Safety Cancellation
  if (actor === CancellationActor.ADMIN || actor === CancellationActor.SAFETY) {
    if (overrideRefundAmount !== undefined) {
      const overrideCents = Math.round(overrideRefundAmount * 100);
      if (overrideCents < 0 || overrideCents > totalCents) {
        throw new Error("Invalid admin refund override amount. Must be between 0 and total booking amount.");
      }
      return {
        eligible: true,
        refundPercentage: Math.round((overrideCents / totalCents) * 100),
        refundableAmount: overrideRefundAmount,
        platformFeeRefundable: true, // admin overrides can refund fees
        reasonCode,
        explanation: `Cancellation requested by ${actor} with custom refund amount of $${overrideRefundAmount.toFixed(2)}.`,
      };
    }

    // Default admin refund is 100%
    return {
      eligible: true,
      refundPercentage: 100,
      refundableAmount: totalAmount,
      platformFeeRefundable: true,
      reasonCode,
      explanation: `Cancellation requested by ${actor}. Full 100% refund approved.`,
    };
  }

  // 3. Host Cancellation
  if (actor === CancellationActor.HOST) {
    return {
      eligible: true,
      refundPercentage: 100,
      refundableAmount: totalAmount,
      platformFeeRefundable: true, // Hosts canceling implies full traveler refund including fees
      reasonCode: CancellationReasonCode.HOST_CANCELLED,
      explanation: "Event cancelled by the host couple. Traveler is entitled to a full 100% refund.",
    };
  }

  // 4. Traveler Cancellation Policy
  // Strip time components to compare calendar days in UTC (immune to timezone offset shifts)
  const eventUtc = Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate());
  const cancelUtc = Date.UTC(cancellationDate.getUTCFullYear(), cancellationDate.getUTCMonth(), cancellationDate.getUTCDate());
  const diffDays = Math.ceil((eventUtc - cancelUtc) / (1000 * 60 * 60 * 24));

  if (diffDays >= 30) {
    // 30+ days: 90% refund (9000 basis points)
    const refundCents = Math.floor((totalCents * 9000) / 10000);
    return {
      eligible: true,
      refundPercentage: 90,
      refundableAmount: refundCents / 100,
      platformFeeRefundable: false, // Platform fee retained
      reasonCode,
      explanation: `Cancellation requested ${diffDays} calendar days before event. Eligible for a 90% refund.`,
    };
  } else if (diffDays >= 15) {
    // 15-29 days: 70% refund (7000 basis points)
    const refundCents = Math.floor((totalCents * 7000) / 10000);
    return {
      eligible: true,
      refundPercentage: 70,
      refundableAmount: refundCents / 100,
      platformFeeRefundable: false,
      reasonCode,
      explanation: `Cancellation requested ${diffDays} calendar days before event. Eligible for a 70% refund.`,
    };
  } else if (diffDays >= 7) {
    // 7-14 days: 40% refund (4000 basis points)
    const refundCents = Math.floor((totalCents * 4000) / 10000);
    return {
      eligible: true,
      refundPercentage: 40,
      refundableAmount: refundCents / 100,
      platformFeeRefundable: false,
      reasonCode,
      explanation: `Cancellation requested ${diffDays} calendar days before event. Eligible for a 40% refund.`,
    };
  } else {
    // Less than 7 days: 0% refund
    return {
      eligible: true,
      refundPercentage: 0,
      refundableAmount: 0,
      platformFeeRefundable: false,
      reasonCode,
      explanation: `Cancellation requested ${diffDays} calendar days before event (less than 7 days). Not eligible for a refund.`,
    };
  }
}
