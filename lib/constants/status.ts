/**
 * WeddingWithIndia - Centralized Shared Status Model
 * Single Source of Truth for all booking, host celebration, agent application,
 * and coordinator application lifecycle states across the platform.
 */

// 1. BOOKING STATUS
export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "completed"
  | "cleared"
  | "cancelled"
  | "refunded";

export interface StatusMeta<T extends string> {
  value: T;
  label: string;
  description: string;
  badgeClass: string;
  isCommissionPayable?: boolean;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, StatusMeta<BookingStatus>> = {
  pending_payment: {
    value: "pending_payment",
    label: "Pending Payment",
    description: "Reservation requested by traveler; awaiting payment confirmation.",
    badgeClass: "bg-warm-100 text-charcoal-800 border-warm-300 font-bold",
    isCommissionPayable: false,
  },
  confirmed: {
    value: "confirmed",
    label: "Confirmed",
    description: "Booking paid and secured in trust account until event conclusion.",
    badgeClass: "bg-amber-50 text-amber-950 border-amber-300 font-bold",
    isCommissionPayable: false,
  },
  completed: {
    value: "completed",
    label: "Event Completed",
    description: "Wedding event successfully attended; in 3-day clearance window.",
    badgeClass: "bg-blue-50 text-blue-950 border-blue-300 font-bold",
    isCommissionPayable: false,
  },
  cleared: {
    value: "cleared",
    label: "Completed & Cleared",
    description: "Event verified & cleared. Host payout and agent referral commissions released.",
    badgeClass: "bg-emerald-50 text-emerald-950 border-emerald-300 font-bold",
    isCommissionPayable: true,
  },
  cancelled: {
    value: "cancelled",
    label: "Cancelled",
    description: "Booking cancelled prior to event.",
    badgeClass: "bg-rose-50 text-rose-950 border-rose-300 font-bold",
    isCommissionPayable: false,
  },
  refunded: {
    value: "refunded",
    label: "Refunded",
    description: "Payment refunded to guest per policy.",
    badgeClass: "bg-charcoal-100 text-charcoal-900 border-charcoal-300 font-bold",
    isCommissionPayable: false,
  },
};

// 2. HOST LISTING STATUS
export type HostListingStatus =
  | "pending_verification"
  | "verified"
  | "live"
  | "rejected"
  | "suspended";

export const HOST_STATUS_CONFIG: Record<HostListingStatus, StatusMeta<HostListingStatus>> = {
  pending_verification: {
    value: "pending_verification",
    label: "Pending Verification",
    description: "Application under manual review by our regional team. Background and venue verification in progress.",
    badgeClass: "bg-amber-50 text-amber-950 border-amber-300 font-bold",
  },
  verified: {
    value: "verified",
    label: "Verified Host",
    description: "Host background and venue approved. Final schedule setup in progress.",
    badgeClass: "bg-blue-50 text-blue-950 border-blue-300 font-bold",
  },
  live: {
    value: "live",
    label: "Live & Accepting Bookings",
    description: "Celebration active on platform for global guest bookings.",
    badgeClass: "bg-emerald-50 text-emerald-950 border-emerald-300 font-bold",
  },
  rejected: {
    value: "rejected",
    label: "Application Declined",
    description: "Celebration application did not pass host safety or venue criteria.",
    badgeClass: "bg-rose-50 text-rose-950 border-rose-300 font-bold",
  },
  suspended: {
    value: "suspended",
    label: "Celebration Suspended",
    description: "Celebration temporarily paused by operations team.",
    badgeClass: "bg-charcoal-100 text-charcoal-900 border-charcoal-300 font-bold",
  },
};

// 3. AGENT APPLICATION STATUS
export type AgentApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "active"
  | "rejected";

export const AGENT_STATUS_CONFIG: Record<AgentApplicationStatus, StatusMeta<AgentApplicationStatus>> = {
  submitted: {
    value: "submitted",
    label: "Submitted",
    description: "Application received; queued for background verification.",
    badgeClass: "bg-warm-100 text-charcoal-800 border-warm-300 font-bold",
  },
  under_review: {
    value: "under_review",
    label: "Under Review",
    description: "Network details & referral focus currently being evaluated.",
    badgeClass: "bg-amber-50 text-amber-950 border-amber-300 font-bold",
  },
  approved: {
    value: "approved",
    label: "Approved",
    description: "Agent application approved. Unique tracking code generated.",
    badgeClass: "bg-blue-50 text-blue-950 border-blue-300 font-bold",
  },
  active: {
    value: "active",
    label: "Active Partner",
    description: "Active referral partner. Eligible for tiered traveler / 4% host commissions post-clearance.",
    badgeClass: "bg-emerald-50 text-emerald-950 border-emerald-300 font-bold",
  },
  rejected: {
    value: "rejected",
    label: "Application Declined",
    description: "Agent application did not meet program guidelines.",
    badgeClass: "bg-rose-50 text-rose-950 border-rose-300 font-bold",
  },
};

// 4. COORDINATOR APPLICATION STATUS
export type CoordinatorApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved_awaiting_placement"
  | "placed"
  | "rejected"
  | "not_available_in_city";

export const COORDINATOR_STATUS_CONFIG: Record<CoordinatorApplicationStatus, StatusMeta<CoordinatorApplicationStatus>> = {
  submitted: {
    value: "submitted",
    label: "Submitted",
    description: "Application submitted to regional coordinator pool.",
    badgeClass: "bg-warm-100 text-charcoal-800 border-warm-300 font-bold",
  },
  under_review: {
    value: "under_review",
    label: "Under Review",
    description: "Event experience & language qualifications being reviewed.",
    badgeClass: "bg-amber-50 text-amber-950 border-amber-300 font-bold",
  },
  approved_awaiting_placement: {
    value: "approved_awaiting_placement",
    label: "Approved — Awaiting Event Assignment",
    description: "Profile approved. Placements assigned as upcoming weddings in your city confirm bookings.",
    badgeClass: "bg-blue-50 text-blue-950 border-blue-300 font-bold",
  },
  not_available_in_city: {
    value: "not_available_in_city",
    label: "Approved — Awaiting City Activation",
    description: "Your application is approved! Coordinator roles activate once local wedding volume supports it in your city.",
    badgeClass: "bg-purple-50 text-purple-950 border-purple-300 font-bold",
  },
  placed: {
    value: "placed",
    label: "Placed on Active Event",
    description: "Assigned to an active wedding event day as on-ground guest liaison.",
    badgeClass: "bg-emerald-50 text-emerald-950 border-emerald-300 font-bold",
  },
  rejected: {
    value: "rejected",
    label: "Application Declined",
    description: "Application did not meet coordinator experience criteria.",
    badgeClass: "bg-rose-50 text-rose-950 border-rose-300 font-bold",
  },
};
