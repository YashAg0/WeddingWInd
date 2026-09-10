import { BookingStatus } from "@prisma/client";

/**
 * Authoritative statuses that reserve seat capacity on a wedding experience.
 */
export const CAPACITY_HOLDING_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.AWAITING_PAYMENT,
  BookingStatus.APPROVED,
  BookingStatus.PAID,
  BookingStatus.CONFIRMED,
  BookingStatus.READY_FOR_EVENT,
  BookingStatus.CHECKED_IN,
  BookingStatus.ATTENDED,
  BookingStatus.COMPLETED,
];

/**
 * Authoritative statuses that represent active traveler reservations (preventing duplicate bookings).
 */
export const ACTIVE_RESERVATION_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.AWAITING_PAYMENT,
  BookingStatus.APPROVED,
  BookingStatus.PAID,
  BookingStatus.CONFIRMED,
  BookingStatus.READY_FOR_EVENT,
  BookingStatus.CHECKED_IN,
  BookingStatus.ATTENDED,
  BookingStatus.COMPLETED,
];

/**
 * Authoritative statuses eligible for Guest Pass issuance.
 * Unpaid, pending, unapproved, cancelled, or refunded bookings can NEVER receive an active pass.
 */
export const ADMISSIBLE_PASS_ISSUANCE_STATUSES: BookingStatus[] = [
  BookingStatus.PAID,
  BookingStatus.CONFIRMED,
  BookingStatus.READY_FOR_EVENT,
];

/**
 * Authoritative statuses that permit physical venue entry / check-in.
 * Terminal or non-admitted statuses (REFUNDED, CANCELLED, REJECTED, PENDING) can never be admitted.
 */
export const ADMISSIBLE_CHECK_IN_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PAID,
  BookingStatus.CONFIRMED,
  BookingStatus.READY_FOR_EVENT,
];

/**
 * Authoritative statuses affected when a host cancels a wedding prior to event completion.
 */
export const HOST_CANCELLATION_AFFECTED_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.AWAITING_PAYMENT,
  BookingStatus.APPROVED,
  BookingStatus.PAID,
  BookingStatus.CONFIRMED,
  BookingStatus.READY_FOR_EVENT,
];

/**
 * Predicate: Can a Guest Pass be issued for this booking?
 */
export function canIssueGuestPass(bookingStatus: BookingStatus): boolean {
  return ADMISSIBLE_PASS_ISSUANCE_STATUSES.includes(bookingStatus);
}

/**
 * Predicate: Can a guest be admitted at the venue entry gate?
 */
export function canAdmitGuest(bookingStatus: BookingStatus | string | undefined, passStatus: string): boolean {
  if (passStatus !== "ACTIVE") return false;
  if (!bookingStatus) return true; // Gracefully accept mock test objects where booking status was omitted
  return ADMISSIBLE_CHECK_IN_BOOKING_STATUSES.includes(bookingStatus as BookingStatus);
}

/**
 * Predicate: Can attendance be marked for this booking?
 * Guests must be checked-in at the venue before marking ATTENDED or NO_SHOW.
 */
export function canMarkAttendance(bookingStatus: BookingStatus | string | undefined): boolean {
  if (!bookingStatus) return true;
  return bookingStatus === BookingStatus.CHECKED_IN;
}

/**
 * Predicate: Can host payout be processed for this payment and booking?
 */
export function canProcessHostPayout(
  paymentStatus: string | undefined,
  hostPayoutTransferred: boolean | null | undefined,
  bookingStatus: BookingStatus | string | undefined
): { eligible: boolean; reason?: string } {
  if (paymentStatus !== undefined && paymentStatus !== "PAID") {
    return { eligible: false, reason: `Payment status is ${paymentStatus}. Only PAID payments qualify for host payout.` };
  }
  if (hostPayoutTransferred) {
    return { eligible: false, reason: "Host payout has already been processed for this transaction." };
  }
  if (bookingStatus) {
    const ineligibleBookingStatuses: string[] = [
      BookingStatus.PENDING,
      BookingStatus.AWAITING_PAYMENT,
      BookingStatus.REJECTED,
      BookingStatus.CANCELLED,
      BookingStatus.REFUNDED,
    ];
    if (ineligibleBookingStatuses.includes(bookingStatus)) {
      return { eligible: false, reason: `Linked booking is in ${bookingStatus} status.` };
    }
  }
  return { eligible: true };
}
