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
