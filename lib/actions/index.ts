"use server";

import { revalidatePath } from "next/cache";
import { prisma, withDbRetry } from "../prisma";
import { requireAuth, syncAndGetDbUser as authSyncAndGetDbUser } from "../auth";
export async function syncAndGetDbUser() {
  return await authSyncAndGetDbUser();
}
import { UserRole, BookingStatus, PaymentStatus, VerificationStatus, WeddingStatus, ReferralStatus, CancellationReasonCode, CancellationActor, WeddingSide } from "@prisma/client";
import { rateLimit } from "../rate-limit";
import { getBatchWeddingRatingAggregates, getPublishedReviewWhere } from "../services/trust-score";
import {
  sendHostApprovalWithPaymentLinkEmail,
  sendRefundConfirmationEmail,
  sendHostRejectionEmail,
  sendVerificationSubmittedEmail,
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail
} from "../email";
import {
  travelerProfileSchema,
  coupleProfileSchema,
  agentProfileSchema,
  weddingSchema
} from "../validation";
import { unstable_cache } from "next/cache";
import { env } from "../env";
import { toWeddingDTO } from "../wedding-dto";
import { sortWeddingsByDiscoveryPriority } from "../marketplace/ranking";
import {
  CAPACITY_HOLDING_BOOKING_STATUSES,
  ACTIVE_RESERVATION_STATUSES,
} from "../booking-statuses";
import { calculateBookingPricing } from "../services/pricing-engine";

/**
 * 1. Action to update User Role during onboarding or settings.
 */
export async function updateUserRoleAction(role: UserRole) {
  const dbUser = await requireAuth();

  // Security: Prevent self-elevation to ADMIN via client-controlled role update.
  // Admin roles can only be assigned directly in the database by a platform operator.
  if (role === UserRole.ADMIN) {
    throw new Error("FORBIDDEN: Cannot self-assign administrative roles.");
  }

  // Prevent role change if user has already completed onboarding
  if (dbUser.status !== "ONBOARDING") {
    throw new Error("FORBIDDEN: Role cannot be changed after onboarding is complete.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: dbUser.id },
    data: { role }
  });

  return { success: true, user: updatedUser };
}

/**
 * 2. Action to complete onboarding and persist profile details into PostgreSQL.
 */
export async function completeOnboardingAction(data: any) {
  const dbUser = await requireAuth();
  const role = dbUser.role;

  await prisma.$transaction(async (tx) => {
    // A. Update user status to ACTIVE
    await tx.user.update({
      where: { id: dbUser.id },
      data: { status: "ACTIVE" }
    });

    // B. Save correct profile matching the role
    if (role === UserRole.TRAVELER) {
      const parsed = travelerProfileSchema.parse({
        userId: dbUser.id,
        fullName: data.fullName || dbUser.name || "Traveler",
        country: data.country || "United States",
        language: data.language || "English",
        interests: data.interests || "",
        budget: data.budget || "1000",
        preferences: data.preferences || "Traditional",
        foodPreferences: data.foodPreferences || "No Restrictions",
        accessibility: data.accessibility || "None"
      });

      await tx.travelerProfile.upsert({
        where: { userId: dbUser.id },
        create: parsed,
        update: parsed
      });
    } else if (role === UserRole.COUPLE) {
      const parsed = coupleProfileSchema.parse({
        userId: dbUser.id,
        weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
        weddingLocation: data.weddingLocation || "",
        expectedGuests: parseInt(data.expectedGuests || "200"),
        traditions: data.traditions || "",
        languagesSpoken: data.languagesSpoken || "",
        photographyRules: data.photographyRules || "Allowed",
        familyBio: data.familyBio || ""
      });

      await tx.coupleProfile.upsert({
        where: { userId: dbUser.id },
        create: parsed,
        update: parsed
      });
    } else if (role === UserRole.AGENT) {
      const parsed = agentProfileSchema.parse({
        userId: dbUser.id,
        organization: data.organization || "",
        country: data.country || "",
        experienceYears: parseInt(data.experienceYears || "2"),
        targetAudience: data.targetAudience || "",
        verifiedChecks: data.verifiedChecks || false
      });

      // Generate a secure referral code for the new agent
      const { generateReferralCode } = require("./referrals");
      const refCode = await generateReferralCode(dbUser.name || "AGENT");

      await tx.agentProfile.upsert({
        where: { userId: dbUser.id },
        create: {
          ...parsed,
          referralCode: refCode
        },
        update: parsed
      });
    }

    // C. Update lifecycle status of referral if referred by an agent
    const referral = await tx.agentReferral.findFirst({
      where: { referredUserId: dbUser.id, status: ReferralStatus.SIGNED_UP }
    });
    if (referral) {
      await tx.agentReferral.update({
        where: { id: referral.id },
        data: {
          status: ReferralStatus.ONBOARDED,
          onboardedAt: new Date()
        }
      });
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * 3. Update User Profile Settings details.
 */
export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  bio?: string;
  language?: string;
  budget?: string | number;
  preferences?: string | string[];
  foodPreferences?: string | string[];
  accessibility?: string | string[];
  weddingLocation?: string;
  traditions?: string | string[];
  languagesSpoken?: string | string[];
  expectedGuests?: number;
  photographyRules?: string;
  organization?: string;
  experienceYears?: number;
  targetAudience?: string;
}

export async function updateProfileDetails(data: UpdateProfileInput) {
  const dbUser = await requireAuth();

  await prisma.$transaction(async (tx) => {
    // Update base user details
    await tx.user.update({
      where: { id: dbUser.id },
      data: {
        name: data.name ?? dbUser.name,
        email: data.email ?? dbUser.email
      }
    });

    // Update role specific details
    if (dbUser.role === UserRole.TRAVELER && dbUser.travelerProfile) {
      await tx.travelerProfile.update({
        where: { userId: dbUser.id },
        data: {
          fullName: data.name ?? dbUser.travelerProfile.fullName,
          country: data.country ?? dbUser.travelerProfile.country,
          language: data.language ?? dbUser.travelerProfile.language,
          interests: data.bio ?? dbUser.travelerProfile.interests,
          budget: data.budget !== undefined ? String(data.budget) : dbUser.travelerProfile.budget,
          preferences: Array.isArray(data.preferences) ? data.preferences.join(", ") : (data.preferences ?? dbUser.travelerProfile.preferences),
          foodPreferences: Array.isArray(data.foodPreferences) ? data.foodPreferences.join(", ") : (data.foodPreferences ?? dbUser.travelerProfile.foodPreferences),
          accessibility: Array.isArray(data.accessibility) ? data.accessibility.join(", ") : (data.accessibility ?? dbUser.travelerProfile.accessibility)
        }
      });
    } else if (dbUser.role === UserRole.COUPLE && dbUser.coupleProfile) {
      await tx.coupleProfile.update({
        where: { userId: dbUser.id },
        data: {
          weddingLocation: data.weddingLocation ?? data.country ?? dbUser.coupleProfile.weddingLocation,
          familyBio: data.bio ?? dbUser.coupleProfile.familyBio,
          expectedGuests: data.expectedGuests ?? dbUser.coupleProfile.expectedGuests,
          traditions: Array.isArray(data.traditions) ? data.traditions.join(", ") : (data.traditions ?? dbUser.coupleProfile.traditions),
          languagesSpoken: Array.isArray(data.languagesSpoken) ? data.languagesSpoken.join(", ") : (data.languagesSpoken ?? dbUser.coupleProfile.languagesSpoken),
          photographyRules: data.photographyRules ?? dbUser.coupleProfile.photographyRules
        }
      });
    } else if (dbUser.role === UserRole.AGENT && dbUser.agentProfile) {
      await tx.agentProfile.update({
        where: { userId: dbUser.id },
        data: {
          country: data.country ?? dbUser.agentProfile.country,
          organization: data.organization ?? dbUser.agentProfile.organization,
          experienceYears: data.experienceYears ?? dbUser.agentProfile.experienceYears,
          targetAudience: data.targetAudience ?? data.bio ?? dbUser.agentProfile.targetAudience
        }
      });
    }
  });

  revalidatePath("/dashboard/profile");
  return { success: true };
}

/**
 * 4. Wedding Experience CRUD
 */
function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

import crypto from "crypto";

async function generateUniqueWeddingSlug(title: string, excludeWeddingId?: string) {
  const base = slugifyTitle(title) || "wedding";
  let slug = base;
  for (let attempt = 0; attempt < 20; attempt++) {
    const existing = await prisma.wedding.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeWeddingId) return slug;
    slug = `${base}-${crypto.randomInt(1000, 10000)}`;
  }
  return `${base}-${Date.now()}`;
}

export async function createWedding(data: any) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Forbidden: Only host couples can create wedding experiences.");
  }
  const coupleProfile = await prisma.coupleProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, familyBio: "Hosted Couple" },
    update: {}
  });

  // SEC-001: KYC Gate — Enforce host verification before allowing PUBLISHED status.
  // An unverified host can only create experiences in DRAFT mode.
  let resolvedStatus = data.status;
  if (resolvedStatus === "PUBLISHED" || resolvedStatus === WeddingStatus.PUBLISHED) {
    const verification = await prisma.verification.findUnique({
      where: { userId: user.id },
      select: { status: true }
    });
    if (verification?.status !== VerificationStatus.APPROVED) {
      // Silently downgrade to DRAFT rather than throwing, to prevent information leakage
      // about verification state through error messages on public-facing forms.
      resolvedStatus = WeddingStatus.DRAFT;
    }
  }

  const slug = await generateUniqueWeddingSlug(data.title || "wedding");

  const parsed = weddingSchema.parse({
    ...data,
    status: resolvedStatus,
    slug,
    hostCoupleId: coupleProfile.id,
    pricePerGuest: parseFloat(data.pricePerGuest || "1000"),
    capacity: parseInt(data.capacity || "100"),
    requiredGuests: parseInt(data.requiredGuests || "0"),
    date: new Date(data.date || Date.now())
  });

  const wedding = await prisma.wedding.create({
    data: parsed
  });

  revalidatePath("/weddings");
  revalidatePath("/dashboard/celebrations");
  return { success: true, wedding };
}

export async function editWedding(weddingId: string, data: any) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Forbidden: Only host couples can edit wedding experiences.");
  }

  const coupleProfile = await prisma.coupleProfile.findUnique({
    where: { userId: user.id }
  });
  if (!coupleProfile) throw new Error("Couple profile not found.");

  const existing = await prisma.wedding.findUnique({ where: { id: weddingId } });
  if (!existing) throw new Error("Wedding experience not found.");
  if (existing.hostCoupleId !== coupleProfile.id) {
    throw new Error("Forbidden: You can only edit wedding experiences you host.");
  }

  // SEC-001: KYC Gate — Enforce host verification before allowing PUBLISHED status.
  // An unverified host editing an existing DRAFT cannot promote it to PUBLISHED.
  let resolvedStatus = data.status;
  if (resolvedStatus === "PUBLISHED" || resolvedStatus === WeddingStatus.PUBLISHED) {
    const verification = await prisma.verification.findUnique({
      where: { userId: user.id },
      select: { status: true }
    });
    if (verification?.status !== VerificationStatus.APPROVED) {
      // Silently downgrade — preserve existing status if it was already DRAFT/PUBLISHED
      resolvedStatus = existing.status === WeddingStatus.PUBLISHED
        ? WeddingStatus.PUBLISHED  // Already published and was approved at publish time
        : WeddingStatus.DRAFT;
    }
  }

  const parsed = weddingSchema.parse({
    ...data,
    status: resolvedStatus,
    slug: existing.slug,
    hostCoupleId: coupleProfile.id,
    pricePerGuest: parseFloat(data.pricePerGuest),
    capacity: parseInt(data.capacity),
    requiredGuests: parseInt(data.requiredGuests || "0"),
    date: new Date(data.date)
  });

  const wedding = await prisma.wedding.update({
    where: { id: weddingId },
    data: parsed
  });

  revalidatePath(`/weddings/${wedding.slug}`);
  revalidatePath("/weddings");
  revalidatePath("/dashboard/celebrations");
  return { success: true, wedding };
}

export async function deleteWedding(weddingId: string) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Forbidden: Only host couples can delete wedding experiences.");
  }

  const coupleProfile = await prisma.coupleProfile.findUnique({
    where: { userId: user.id }
  });
  if (!coupleProfile) throw new Error("Couple profile not found.");

  const existing = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: { bookings: true }
  });
  if (!existing) throw new Error("Wedding experience not found.");
  if (existing.hostCoupleId !== coupleProfile.id) {
    throw new Error("Forbidden: You can only delete wedding experiences you host.");
  }

  const hasActiveBookings = existing.bookings.some((b) =>
    CAPACITY_HOLDING_BOOKING_STATUSES.includes(b.status)
  );

  if (hasActiveBookings) {
    throw new Error("Cannot delete a wedding experience with active, paid, or confirmed guest bookings. Please contact support to cancel or archive this event.");
  }

  if (existing.bookings.length > 0) {
    // Soft delete to maintain historical booking and financial integrity
    await prisma.wedding.update({
      where: { id: weddingId },
      data: {
        status: WeddingStatus.DRAFT,
        deletedAt: new Date(),
        suspended: true,
      }
    });
  } else {
    // Hard delete is safe only when zero historical booking records exist
    await prisma.wedding.delete({
      where: { id: weddingId }
    });
  }

  revalidatePath("/weddings");
  revalidatePath("/dashboard/celebrations");
  return { success: true };
}

/**
 * Returns all Our Indian Weddings hosted by the currently authenticated couple,
 * including live booking counts so the couple can track guest registrations.
 */
export async function getMyWeddings() {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Forbidden: Only host couples can view their Our Indian Weddings.");
  }

  const coupleProfile = await prisma.coupleProfile.findUnique({
    where: { userId: user.id }
  });
  if (!coupleProfile) return [];

  const weddings = await prisma.wedding.findMany({
    where: { hostCoupleId: coupleProfile.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        where: {
          status: {
            in: [BookingStatus.APPROVED, BookingStatus.PAID, BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
          }
        },
        select: { guestsCount: true }
      },
      sponsorshipRequests: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          promotionType: true,
          proposedAmount: true,
          status: true,
          amount: true,
          currency: true,
          durationDays: true,
          paymentRequired: true,
          paymentMethod: true,
          paymentStatus: true,
          paymentReference: true,
          paymentProofUrl: true,
          paymentSubmittedAt: true,
          paymentLink: true,
          startsAt: true,
          endsAt: true,
          adminNotes: true,
          rejectionReason: true,
          requestedAt: true,
          paidAt: true,
          activatedAt: true,
        }
      }
    }
  });

  const { isSponsorshipCurrentlyActive } = await import("../services/sponsorship");

  return weddings.map((w) => {
    const isCurrentlyActive = isSponsorshipCurrentlyActive(w);
    const latestReq = w.sponsorshipRequests[0] || null;

    return {
      id: w.id,
      slug: w.slug,
      title: w.title,
      description: w.description,
      location: w.location,
      category: w.category,
      date: w.date.toISOString(),
      pricePerGuest: w.pricePerGuest,
      capacity: w.capacity,
      requiredGuests: w.requiredGuests,
      theme: w.theme,
      dressCode: w.dressCode,
      ethnicity: w.ethnicity,
      mainImageUrl: w.mainImageUrl,
      status: w.status,
      featured: w.featured,
      sponsored: isCurrentlyActive,
      sponsorshipStart: w.sponsorshipStart?.toISOString() || null,
      sponsorshipEnd: w.sponsorshipEnd?.toISOString() || null,
      totalBookings: w._count.bookings,
      confirmedGuests: w.bookings.reduce((sum, b) => sum + b.guestsCount, 0),
      pendingSponsorshipRequest: latestReq && (latestReq.status === "PENDING" || latestReq.status === "PAYMENT_PENDING") ? latestReq : null,
      latestSponsorshipRequest: latestReq,
    };
  });
}


/**
 * 5. Wishlist Management Action
 */
export async function toggleWishlistAction(slug: string) {
  const user = await requireAuth();
  if (user.role !== UserRole.TRAVELER) {
    throw new Error("Only travelers can save weddings to wishlists.");
  }

  const traveler = await prisma.travelerProfile.findUnique({
    where: { userId: user.id }
  });
  if (!traveler) throw new Error("Traveler profile not found.");

  const wedding = await prisma.wedding.findUnique({
    where: { slug }
  });
  if (!wedding) throw new Error("Wedding not found.");

  const existing = await prisma.wishlist.findUnique({
    where: {
      travelerId_weddingId: {
        travelerId: traveler.id,
        weddingId: wedding.id
      }
    }
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.wishlist.create({
      data: {
        travelerId: traveler.id,
        weddingId: wedding.id
      }
    });
  }

  revalidatePath("/dashboard/wishlist");
  return { success: true };
}

/**
 * 6. Bookings & Applications Toggles
 */
export async function createBookingAction(data: {
  weddingId: string;
  date: string;
  guestsCount: number;
  attendanceSide?: string;
  // NOTE: pricePerGuest and totalAmount are intentionally NOT accepted from the client.
  // The server recalculates authoritative pricing from the database to prevent price injection.
}) {
  if (typeof data.guestsCount !== "number" || !Number.isInteger(data.guestsCount) || data.guestsCount < 1) {
    throw new Error("INVALID_GUEST_COUNT: Guest count must be a positive integer greater than or equal to 1.");
  }

  const user = await requireAuth();

  // Rate limiting: max 5 booking attempts per user per 10 minutes
  const { success: rateLimitOk } = await rateLimit("createBooking", user.id, { limit: 5, window: 600 });
  if (!rateLimitOk) {
    throw new Error("Too many booking requests. Please wait a few minutes before trying again.");
  }

  if (user.role !== UserRole.TRAVELER) {
    throw new Error("Only travelers can book wedding experiences.");
  }

  const traveler = await prisma.travelerProfile.findUnique({
    where: { userId: user.id }
  });
  if (!traveler) throw new Error("Traveler profile not found.");

  const { assertCanBook } = require("./safety");
  await assertCanBook(user.id);

  const booking = await prisma.$transaction(async (tx) => {
    // 0. Concurrency lock on Wedding row to serialize simultaneous booking attempts
    await tx.$queryRaw`SELECT id FROM "Wedding" WHERE id = ${data.weddingId} FOR UPDATE`;

    // 1. Fetch wedding with host couple information
    const wedding = await tx.wedding.findUnique({
      where: { id: data.weddingId },
      include: { hostCouple: { include: { user: true } } }
    });
    if (!wedding) throw new Error("Wedding experience not found.");

    if (wedding.suspended) {
      throw new Error("This wedding experience is currently suspended and cannot accept new bookings.");
    }

    if (wedding.status !== WeddingStatus.PUBLISHED) {
      throw new Error("This wedding experience is not currently open for bookings.");
    }

    // SEC-DEMO: Server-side invariant — demo weddings must NEVER be bookable.
    // A malicious client cannot bypass this by manipulating availability state.
    if (wedding.isDemo) {
      throw new Error("This is a demonstration wedding experience and cannot be booked.");
    }

    // 2. Cannot book own wedding
    if (wedding.hostCouple.userId === user.id) {
      throw new Error("Cannot book your own hosted wedding experience.");
    }

    // 3. Cannot book past dates
    const weddingDate = new Date(wedding.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (weddingDate < today) {
      throw new Error("Cannot book a wedding experience that occurred in the past.");
    }

    // 4. No duplicate active booking (PENDING, AWAITING_PAYMENT, APPROVED, PAID, CONFIRMED, etc.)
    const existingActive = await tx.booking.findFirst({
      where: {
        travelerId: traveler.id,
        weddingId: data.weddingId,
        status: {
          in: ACTIVE_RESERVATION_STATUSES,
        },
      },
    });
    if (existingActive) {
      throw new Error("You already have an active reservation request or booking for this wedding.");
    }

    // 5. Check guest capacity across all capacity-holding statuses
    const approvedGuests = await tx.booking.aggregate({
      where: {
        weddingId: data.weddingId,
        status: {
          in: CAPACITY_HOLDING_BOOKING_STATUSES,
        },
      },
      _sum: {
        guestsCount: true,
      },
    });
    const currentBookedCount = approvedGuests._sum.guestsCount || 0;
    if (currentBookedCount + data.guestsCount > wedding.capacity) {
      throw new Error(`Cannot exceed maximum wedding guest capacity. Available spots: ${wedding.capacity - currentBookedCount}.`);
    }

    // 6. Server-authoritative pricing: derive centrally from authoritative Wedding tier and duration.
    // P0 Security: Client cannot inject a false price.
    const pricing = calculateBookingPricing({
      tier: wedding.tier,
      durationDays: wedding.durationDays,
      guestCount: data.guestsCount,
      isAgentAttributed: false,
    });

    // 7. Validate and sanitize attendanceSide — never trust client enum strings directly.
    const VALID_SIDES: WeddingSide[] = [WeddingSide.BRIDE_SIDE, WeddingSide.GROOM_SIDE, WeddingSide.OPEN];
    const sanitizedSide: WeddingSide = (
      data.attendanceSide && VALID_SIDES.includes(data.attendanceSide as WeddingSide)
        ? (data.attendanceSide as WeddingSide)
        : WeddingSide.BRIDE_SIDE
    );

    const createdBooking = await tx.booking.create({
      data: {
        travelerId: traveler.id,
        weddingId: data.weddingId,
        date: new Date(data.date),
        guestsCount: data.guestsCount,
        pricePerGuest: pricing.customerPricePerGuestUSD,
        totalAmount: pricing.customerTotalAmountUSD,
        weddingTier: pricing.tier,
        durationDays: pricing.durationDays,
        customerPricePerGuestUSD: pricing.customerPricePerGuestUSD,
        hostPayoutPerGuestINR: pricing.hostPayoutPerGuestINR,
        agentPayoutPerGuestINR: pricing.agentPayoutPerGuestINR,
        eligibleInternationalGuestCount: pricing.eligibleInternationalGuestCount,
        totalHostPayoutINR: pricing.totalHostPayoutINR,
        totalAgentPayoutINR: pricing.totalAgentPayoutINR,
        pricingVersion: pricing.pricingVersion,
        baseCustomerAmountUSD: pricing.baseCustomerAmountUSD,
        paymentFeeAmount: 0,
        customerTotalAmount: pricing.customerTotalAmountUSD,
        currency: "USD",
        status: BookingStatus.PENDING,
        attendanceSide: sanitizedSide,
      }
    });

    // 7. Dispatch Notification to Host Couple
    await tx.notification.create({
      data: {
        userId: wedding.hostCouple.user.id,
        title: "New Booking Request",
        message: `${traveler.fullName} has requested ${data.guestsCount} spot(s) for your wedding: ${wedding.title}.`,
        type: "REQUEST"
      }
    });

    return createdBooking;
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true, booking };
}

export async function cancelBookingAction(
  bookingId: string,
  reasonCode: CancellationReasonCode = CancellationReasonCode.CHANGE_OF_PLANS,
  reasonText?: string
) {
  const user = await requireAuth();

  const { assertCanBook } = require("./safety");
  await assertCanBook(user.id);

  // 1. Fetch booking with traveler profile to verify ownership
  const dbBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      traveler: { include: { user: true } },
      wedding: { include: { hostCouple: { include: { user: true } } } }
    }
  });

  if (!dbBooking) throw new Error("Booking not found.");

  // Validate ownership: only the traveler who booked can cancel it
  if (dbBooking.traveler.userId !== user.id) {
    throw new Error("Forbidden: You cannot cancel a booking request you do not own.");
  }

  const { createCancellationRequest, processApprovedRefund } = require("../services/refunds");
  const request = await createCancellationRequest({
    bookingId,
    requestedById: user.id,
    actorRole: CancellationActor.TRAVELER,
    reasonCode,
    reasonText,
  });

  // If auto-approved (e.g. no refund, or auto-approved policy), process the refund (if any)
  if (request.status === "AUTO_APPROVED") {
    await processApprovedRefund(request.id, user.id);
  }

  // Notify host couple
  await prisma.notification.create({
    data: {
      userId: dbBooking.wedding.hostCouple.user.id,
      title: "Booking Cancelled Request",
      message: `${dbBooking.traveler.fullName} has cancelled/requested cancellation for their booking: ${dbBooking.wedding.title}.`,
      type: "ALERT"
    }
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true, cancellationRequestId: request.id };
}

/**
 * Allow a traveler to update their attendance-side preference on an existing booking.
 * Guests can update this anytime up until check-in or event completion.
 */
export async function updateBookingSideAction(bookingId: string, attendanceSide: string) {
  const user = await requireAuth();

  // Validate the side value server-side
  const VALID_SIDES: WeddingSide[] = [WeddingSide.BRIDE_SIDE, WeddingSide.GROOM_SIDE, WeddingSide.OPEN];
  if (!VALID_SIDES.includes(attendanceSide as WeddingSide)) {
    throw new Error("Invalid attendance side value. Must be BRIDE_SIDE, GROOM_SIDE, or OPEN.");
  }

  const traveler = await prisma.travelerProfile.findUnique({ where: { userId: user.id } });
  if (!traveler) throw new Error("Traveler profile not found.");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      wedding: { select: { id: true, title: true, date: true, status: true, suspended: true } },
      guestPasses: { include: { checkIns: true } },
    }
  });
  if (!booking) throw new Error("Booking not found.");

  // Ownership check
  if (booking.travelerId !== traveler.id) {
    throw new Error("Forbidden: You cannot modify a booking you do not own.");
  }

  // Check ineligible booking states
  if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REFUNDED || booking.status === BookingStatus.REJECTED) {
    throw new Error(`Attendance preference cannot be changed on a ${booking.status.toLowerCase()} booking.`);
  }

  // Check event lifecycle
  if (booking.wedding.status === WeddingStatus.COMPLETED || booking.wedding.suspended) {
    throw new Error("Attendance preference cannot be changed because this wedding celebration is no longer active.");
  }

  const eventDate = new Date(booking.wedding.date);
  const now = new Date();
  if (eventDate < now) {
    throw new Error("Attendance preference cannot be changed because the celebration date has already passed.");
  }

  // Check if guest has already checked in
  const hasCheckedIn = booking.guestPasses?.some((gp) => gp.checkIns && gp.checkIns.length > 0);
  if (hasCheckedIn) {
    throw new Error("Attendance preference cannot be changed after check-in at the wedding venue.");
  }

  const previousSide = booking.attendanceSide;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { attendanceSide: attendanceSide as WeddingSide }
  });

  // Audit trail
  try {
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_ATTENDANCE_SIDE",
        entity: "Booking",
        entityId: bookingId,
        userId: user.id,
        userName: user.name || user.email || "Guest",
        details: JSON.stringify({
          weddingId: booking.wedding.id,
          weddingTitle: booking.wedding.title,
          previousSide,
          newSide: attendanceSide,
        }),
      },
    });
  } catch (auditErr) {
    console.warn("[updateBookingSideAction] Audit log write failed:", auditErr);
  }

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true, attendanceSide };
}

export async function handleGuestApplicationAction(appId: string, status: "approved" | "rejected") {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Forbidden: Only couples can manage guest applications.");
  }

  const { assertCanHost } = require("./safety");
  await assertCanHost(user.id);

  await prisma.$transaction(async (tx) => {
    // 1. Fetch booking with wedding
    const booking = await tx.booking.findUnique({
      where: { id: appId },
      include: {
        wedding: {
          include: { hostCouple: true }
        },
        traveler: {
          include: { user: true }
        }
      }
    });
    if (!booking) throw new Error("Booking application not found.");

    // Verify host couple ownership
    if (booking.wedding.hostCouple.userId !== user.id) {
      throw new Error("Forbidden: You are not the host couple of this wedding experience.");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new Error("Only pending booking requests can be approved or declined.");
    }


    if (status === "approved") {
      // Concurrency lock on Wedding row to serialize simultaneous approvals
      await tx.$queryRaw`SELECT id FROM "Wedding" WHERE id = ${booking.weddingId} FOR UPDATE`;

      // Check capacity atomically across all capacity-holding statuses before approving
      const approvedGuests = await tx.booking.aggregate({
        where: {
          weddingId: booking.weddingId,
          status: { in: CAPACITY_HOLDING_BOOKING_STATUSES }
        },
        _sum: {
          guestsCount: true
        }
      });
      const currentBookedCount = approvedGuests._sum.guestsCount || 0;
      if (currentBookedCount + booking.guestsCount > booking.wedding.capacity) {
        throw new Error(`Cannot approve booking request: capacity exceeded. Available spots: ${booking.wedding.capacity - currentBookedCount}.`);
      }

      await tx.booking.update({
        where: { id: appId },
        data: { status: BookingStatus.AWAITING_PAYMENT }
      });

      // Notify Traveler
      await tx.notification.create({
        data: {
          userId: booking.traveler.user.id,
          title: "Booking Approved! Secure Your Spot",
          message: `Your reservation request for ${booking.wedding.title} has been approved. Please complete your payment to secure your spot.`,
          type: "BOOKING_APPROVED"
        }
      });

      // Send host approval with payment link email
      // ENV-001: Use validated env to prevent localhost URLs in production transactional emails.
      const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/bookings`;
      await sendHostApprovalWithPaymentLinkEmail(
        booking.traveler.user.email,
        booking.traveler.fullName,
        booking.wedding.title,
        dashboardUrl
      );
    } else {
      await tx.booking.update({
        where: { id: appId },
        data: { status: BookingStatus.REJECTED }
      });

      // Notify Traveler
      await tx.notification.create({
        data: {
          userId: booking.traveler.user.id,
          title: "Booking Request Declined",
          message: `Your reservation request for ${booking.wedding.title} was declined by the host family.`,
          type: "BOOKING_REJECTED"
        }
      });

      await sendHostRejectionEmail(
        booking.traveler.user.email,
        booking.traveler.fullName,
        booking.wedding.title
      );
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  return { success: true };
}

export const respondToBookingAction = handleGuestApplicationAction;


export async function createCheckoutSessionAction(bookingId: string) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      traveler: { include: { user: true } },
      wedding: true,
      payments: {
        where: { status: PaymentStatus.PAID }
      }
    }
  });

  if (!booking) throw new Error("Booking request not found.");

  if (booking.wedding.suspended) {
    throw new Error("This wedding experience is currently suspended and cannot accept payments.");
  }

  if (booking.traveler.userId !== user.id) {
    throw new Error("Forbidden: You cannot pay for a booking you do not own.");
  }

  if (booking.status !== BookingStatus.AWAITING_PAYMENT) {
    throw new Error(`Cannot pay for booking in status: ${booking.status}. It must be approved by the host/admin first.`);
  }

  if (booking.payments.length > 0) {
    throw new Error("This booking has already been paid.");
  }

  const latestPayment = await prisma.payment.findFirst({
    where: { bookingId: booking.id },
    orderBy: { createdAt: "desc" }
  });

  return {
    success: true,
    url: latestPayment?.paymentLink || null,
    payment: latestPayment ? JSON.parse(JSON.stringify(latestPayment)) : null,
  };
}

export async function refundBookingAction(bookingId: string, reason?: string, refundTxnId?: string) {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden: Only administrators can process refunds.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payments: {
        where: { status: PaymentStatus.PAID }
      },
      traveler: { include: { user: true } },
      wedding: true,
    }
  });

  if (!booking) throw new Error("Booking not found.");
  if (booking.status !== BookingStatus.PAID) {
    throw new Error("Only paid bookings can be refunded.");
  }

  const payment = booking.payments[0];
  if (!payment) {
    throw new Error("No successful payment transactions found for this booking.");
  }

  const { recordManualRefundAtomic } = await import("../services/payments");

  const result = await prisma.$transaction(async (tx) => {
    return await recordManualRefundAtomic(tx, {
      paymentId: payment.id,
      refundAmount: payment.amount,
      reason: reason || "Admin manual refund",
      refundTransactionId: refundTxnId || `REF-ADMIN-${Date.now()}`,
      refundNotes: "Admin executed refund via dashboard",
      adminUserId: user.id,
      adminEmail: user.email,
    });
  }, { maxWait: 10000, timeout: 15000 });

  try {
    await sendRefundConfirmationEmail(
      booking.traveler.user.email,
      booking.traveler.fullName,
      booking.wedding.title,
      result.refundTxnId,
      payment.amount
    );
  } catch {
    // Non-blocking email dispatch failure
  }

  revalidatePath("/dashboard/admin/bookings");
  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/bookings");

  return result.refund;
}

export async function submitVerificationAction(data: Record<string, any>) {
  const user = await requireAuth();

  // SECURITY: Admin must have explicitly requested verification before a user
  // can upload documents. If no Verification record exists, or the status is
  // NOT_SUBMITTED, the user must wait for admin to trigger the verification
  // request — they cannot self-initiate document uploads.
  const existingVerification = await prisma.verification.findUnique({
    where: { userId: user.id },
  });

  if (!existingVerification || existingVerification.status === VerificationStatus.NOT_SUBMITTED) {
    throw new Error(
      "VERIFICATION_NOT_REQUESTED: Your verification has not been requested yet. " +
      "Our team will reach out to you once your application has been reviewed."
    );
  }

  // Sanitize empty string fields to null to eliminate Zod URL errors and clean DB state
  const sanitizedData: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === "string" && val.trim() === "") {
      sanitizedData[key] = null;
    } else {
      sanitizedData[key] = val;
    }
  }

  const verification = await prisma.verification.update({
    where: { userId: user.id },
    data: {
      ...sanitizedData,
      status: VerificationStatus.PENDING,
      submissionDate: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Verification Submitted",
      message: "Your trust verification documents have been received and are under review.",
      type: "INFO",
    },
  });

  const userName = user.name || user.email.split("@")[0];
  await sendVerificationSubmittedEmail(user.email, userName, user.role);

  revalidatePath("/dashboard");
  return { success: true, verification };
}

export async function reviewVerificationAction(
  verificationId: string,
  status: "APPROVED" | "REJECTED" | "UNDER_REVIEW",
  notes?: string
) {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden: Only administrators can review trust verification files.");
  }

  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { user: true },
  });

  if (!verification) throw new Error("Verification record not found.");

  const updatedVerification = await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: status === "APPROVED" ? VerificationStatus.APPROVED : status === "REJECTED" ? VerificationStatus.REJECTED : VerificationStatus.UNDER_REVIEW,
      notes,
      reviewedBy: user.name || user.email,
      expiryDate: status === "APPROVED" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: verification.userId,
      title: status === "APPROVED" ? "Profile Verified!" : "Verification Request Declined",
      message: status === "APPROVED"
        ? "Your identity verification checks passed! A trust badge has been linked to your profile."
        : `Your trust verification request was declined. Notes: ${notes || "Invalid/blurred docs."}`,
      type: status === "APPROVED" ? "SUCCESS" : "ALERT",
    },
  });

  const targetUserName = verification.user.name || verification.user.email.split("@")[0];
  if (status === "APPROVED") {
    await sendVerificationApprovedEmail(verification.user.email, targetUserName, verification.user.role);
  } else if (status === "REJECTED") {
    await sendVerificationRejectedEmail(verification.user.email, targetUserName, notes || "Uploaded documents are blurred or invalid.");
  }

  // Update user status if approved or rejected
  await prisma.user.update({
    where: { id: verification.userId },
    data: {
      status: status === "APPROVED" ? "ACTIVE" : "ONBOARDING",
    },
  });

  // Resolve entity details for reputation
  let entityType: any = null;
  let entityId: string | null = null;
  const dbUser = await prisma.user.findUnique({
    where: { id: verification.userId },
    include: { travelerProfile: true, coupleProfile: true, agentProfile: true }
  });
  if (dbUser) {
    if (dbUser.role === "TRAVELER" && dbUser.travelerProfile) {
      entityType = "TRAVELER";
      entityId = dbUser.travelerProfile.id;
    } else if (dbUser.role === "COUPLE" && dbUser.coupleProfile) {
      entityType = "HOST";
      entityId = dbUser.coupleProfile.id;
    } else if (dbUser.role === "AGENT" && dbUser.agentProfile) {
      entityType = "AGENT";
      entityId = dbUser.agentProfile.id;
    }
  }

  if (status === "APPROVED" && entityType && entityId) {
    const { logReputationEvent } = require("../services/reputation");
    await logReputationEvent({
      entityType,
      entityId,
      type: "VERIFICATION_APPROVED",
      scoreEffect: 10,
      referenceId: verificationId,
      idempotencyKey: `VERIFICATION_APPROVED:${verification.userId}`
    });
  }

  if (entityType && entityId) {
    const { evaluateEntityBadges } = require("../services/badges");
    await evaluateEntityBadges(entityType, entityId);
  }

  revalidatePath("/dashboard/admin/verifications");
  revalidatePath("/dashboard");
  return { success: true, verification: updatedVerification };
}

export async function approveVerificationAction(verificationId: string, notes?: string) {
  return reviewVerificationAction(verificationId, "APPROVED", notes);
}

export async function rejectVerificationAction(verificationId: string, notes?: string) {
  return reviewVerificationAction(verificationId, "REJECTED", notes);
}

/**
 * 7. Notifications helpers
 */
export async function markNotificationsReadAction() {
  const user = await requireAuth();

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * 8. Fetch complete Dashboard data in one roundtrip
 */
export async function fetchDashboardDataAction() {
  const dbUser = await requireAuth();

  const [notifications, verification] = await Promise.all([
    withDbRetry(() => prisma.notification.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }), { label: "fetchDash:notifs" }).catch(() => []),
    withDbRetry(() => prisma.verification.findUnique({
      where: { userId: dbUser.id },
    }), { label: "fetchDash:verif" }).catch(() => null),
  ]);

  let bookings: any[] = [];
  let wishlist: string[] = [];
  let guestApplications: any[] = [];
  let hostWedding: any = null;

  let revenue = 0;
  let pendingPayouts = 0;
  let paidGuests: any[] = [];
  let allPayments: any[] = [];
  let refundQueue: any[] = [];
  let pendingVerifications: any[] = [];

  if (dbUser.role === UserRole.TRAVELER && dbUser.travelerProfile) {
    const [travelerBookings, wishEntries] = await Promise.all([
      withDbRetry(() => prisma.booking.findMany({
        where: { travelerId: dbUser.travelerProfile!.id },
        include: { wedding: true, payments: { include: { refunds: true } } },
        orderBy: { createdAt: "desc" },
      }), { label: "fetchDash:travelerBookings" }).catch(() => []),
      withDbRetry(() => prisma.wishlist.findMany({
        where: { travelerId: dbUser.travelerProfile!.id },
        include: { wedding: true },
      }), { label: "fetchDash:wishlist" }).catch(() => []),
    ]);

    bookings = travelerBookings;
    wishlist = wishEntries.map((w: any) => w.wedding.slug);
  } else if (dbUser.role === UserRole.COUPLE) {
    let coupleProfileId = dbUser.coupleProfile?.id;
    if (!coupleProfileId) {
      const cp = await prisma.coupleProfile.findUnique({ where: { userId: dbUser.id } });
      coupleProfileId = cp?.id;
    }
    const [coupleBookings, hosted] = coupleProfileId ? await Promise.all([
      withDbRetry(() => prisma.booking.findMany({
        where: { wedding: { hostCoupleId: coupleProfileId } },
        include: { wedding: true, traveler: { include: { user: true } }, payments: true },
        orderBy: { createdAt: "desc" },
      }), { label: "fetchDash:coupleBookings" }).catch(() => []),
      withDbRetry(() => prisma.wedding.findFirst({
        where: { hostCoupleId: coupleProfileId },
      }), { label: "fetchDash:hosted" }).catch(() => null),
    ]) : [[], null];

    const { getHostPayoutPerGuestINR, normalizeWeddingTier, normalizeDurationDays } = require("../services/pricing-engine");

    bookings = coupleBookings;
    guestApplications = bookings.map((b: any) => {
      const tier = normalizeWeddingTier(b.weddingTier || b.wedding?.tier || "STANDARD");
      const duration = normalizeDurationDays(b.durationDays || b.wedding?.durationDays || 3);
      const hostRate = b.hostPayoutPerGuestINR || getHostPayoutPerGuestINR(tier, duration);
      const guests = b.eligibleInternationalGuestCount || b.guestsCount || 1;
      const hostEarningsINR = b.totalHostPayoutINR || (hostRate * guests);

      return {
        id: b.id,
        travelerName: b.traveler?.fullName || "Guest",
        travelerCountry: b.traveler?.country || "",
        travelerAvatar: b.traveler?.user?.avatar || "https://i.pravatar.cc/80?img=5",
        budget: `₹${hostEarningsINR.toLocaleString("en-IN")}`,
        message: `Reservation request for ${b.guestsCount} guest(s) at "${b.wedding.title}".`,
        status: b.status === BookingStatus.PENDING ? "pending" : b.status === BookingStatus.AWAITING_PAYMENT ? "awaiting_payment" : b.status === BookingStatus.PAID ? "approved" : "rejected"
      };
    });

    if (hosted) {
      hostWedding = {
        id: hosted.id,
        title: hosted.title,
        capacity: hosted.capacity,
        pricePerGuest: hosted.pricePerGuest
      };
    }

    const paidBookings = bookings.filter((b: any) => 
      b.status === BookingStatus.PAID || 
      b.status === BookingStatus.READY_FOR_EVENT ||
      b.status === BookingStatus.CHECKED_IN ||
      b.status === BookingStatus.ATTENDED ||
      b.status === BookingStatus.COMPLETED
    );

    // Calculate fixed INR host earnings
    revenue = paidBookings.reduce((sum: number, b: any) => {
      const tier = normalizeWeddingTier(b.weddingTier || b.wedding?.tier || "STANDARD");
      const duration = normalizeDurationDays(b.durationDays || b.wedding?.durationDays || 3);
      const hostRate = b.hostPayoutPerGuestINR || getHostPayoutPerGuestINR(tier, duration);
      const guests = b.eligibleInternationalGuestCount || b.guestsCount || 1;
      const hostEarnings = b.totalHostPayoutINR || (hostRate * guests);
      return sum + hostEarnings;
    }, 0);

    // Pending payouts: paid bookings where host payout has not been transferred yet
    pendingPayouts = paidBookings.reduce((sum: number, b: any) => {
      const isTransferred = b.payments?.some((p: any) => p.hostPayoutTransferred);
      if (isTransferred) return sum;
      const tier = normalizeWeddingTier(b.weddingTier || b.wedding?.tier || "STANDARD");
      const duration = normalizeDurationDays(b.durationDays || b.wedding?.durationDays || 3);
      const hostRate = b.hostPayoutPerGuestINR || getHostPayoutPerGuestINR(tier, duration);
      const guests = b.eligibleInternationalGuestCount || b.guestsCount || 1;
      const hostEarnings = b.totalHostPayoutINR || (hostRate * guests);
      return sum + hostEarnings;
    }, 0);

    paidGuests = paidBookings.map((b: any) => {
      const tier = normalizeWeddingTier(b.weddingTier || b.wedding?.tier || "STANDARD");
      const duration = normalizeDurationDays(b.durationDays || b.wedding?.durationDays || 3);
      const hostRate = b.hostPayoutPerGuestINR || getHostPayoutPerGuestINR(tier, duration);
      const guests = b.eligibleInternationalGuestCount || b.guestsCount || 1;
      const hostEarnings = b.totalHostPayoutINR || (hostRate * guests);

      let dateStr = "";
      if (b.date) {
        dateStr = b.date instanceof Date ? b.date.toISOString().split("T")[0] : String(b.date).split("T")[0];
      }

      return {
        id: b.id,
        travelerName: b.traveler?.fullName || "Guest",
        guestsCount: b.guestsCount,
        amount: hostEarnings,
        date: dateStr
      };
    });
  } else if (dbUser.role === UserRole.ADMIN) {
    const [adminPayments, adminRefunds, adminVerifs] = await Promise.all([
      withDbRetry(() => prisma.payment.findMany({
        include: { booking: { include: { traveler: true, wedding: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }), { label: "fetchDash:adminPayments" }).catch(() => []),
      withDbRetry(() => prisma.booking.findMany({
        where: { status: BookingStatus.REFUNDED },
        include: { traveler: true, wedding: true, payments: { include: { refunds: true } } },
        orderBy: { updatedAt: "desc" },
        take: 30,
      }), { label: "fetchDash:adminRefunds" }).catch(() => []),
      withDbRetry(() => prisma.verification.findMany({
        where: { status: VerificationStatus.PENDING },
        include: { user: true },
        orderBy: { submissionDate: "desc" },
        take: 30,
      }), { label: "fetchDash:adminVerifs" }).catch(() => []),
    ]);

    allPayments = adminPayments;
    refundQueue = adminRefunds;
    pendingVerifications = adminVerifs;
  }


  return {
    bookings: bookings.map((b) => {
      let mappedStatus: "upcoming" | "pending" | "rejected" | "cancelled" | "past" | "awaiting_payment" | "approved" | "refunded" = "pending";
      if (
        b.status === BookingStatus.PAID ||
        b.status === BookingStatus.CONFIRMED ||
        b.status === BookingStatus.READY_FOR_EVENT ||
        b.status === BookingStatus.CHECKED_IN
      ) {
        mappedStatus = "upcoming";
      } else if (b.status === BookingStatus.APPROVED) {
        mappedStatus = "approved";
      } else if (b.status === BookingStatus.AWAITING_PAYMENT) {
        mappedStatus = "awaiting_payment";
      } else if (b.status === BookingStatus.PENDING) {
        mappedStatus = "pending";
      } else if (b.status === BookingStatus.REJECTED) {
        mappedStatus = "rejected";
      } else if (b.status === BookingStatus.CANCELLED) {
        mappedStatus = "cancelled";
      } else if (b.status === BookingStatus.REFUNDED) {
        mappedStatus = "refunded";
      } else if (b.status === BookingStatus.COMPLETED || b.status === BookingStatus.ATTENDED) {
        mappedStatus = "past";
      }

      let dateStr = "";
      if (b.date) {
        dateStr = b.date instanceof Date ? b.date.toISOString().split("T")[0] : String(b.date).split("T")[0];
      }

      return {
        id: b.id,
        weddingId: b.wedding?.id || "",
        weddingTitle: b.wedding?.title || "Wedding Celebration",
        location: b.wedding?.location || "",
        imageUrl: b.wedding?.mainImageUrl || "",
        date: dateStr,
        pricePerGuest: b.pricePerGuest,
        guestsCount: b.guestsCount,
        attendanceSide: b.attendanceSide,
        status: mappedStatus,
        payments: b.payments || [],
        guestName: (b as any).traveler ? (b as any).traveler.fullName : undefined,
        guestCountry: (b as any).traveler ? (b as any).traveler.country : undefined,
      };
    }),
    wishlist: Array.isArray(wishlist) ? wishlist.filter(Boolean) : [],
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.createdAt instanceof Date ? n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : String(n.createdAt || ""),
      read: n.read,
      type: (n.type && n.type.toLowerCase() === "payment_received" ? "success" : "info") as "info" | "request" | "alert" | "success"
    })),
    guestApplications,
    hostWedding,
    verification: verification ? {
      id: verification.id,
      status: verification.status.toLowerCase(),
      passportUrl: verification.passportUrl,
      govtIdUrl: verification.govtIdUrl,
      selfieUrl: verification.selfieUrl,
      invitationUrl: verification.invitationUrl,
      venueConfirmUrl: verification.venueConfirmUrl,
      orgDetails: verification.orgDetails,
      businessRegUrl: verification.businessRegUrl,
      linkedinUrl: verification.linkedinUrl,
      notes: verification.notes,
      reviewedBy: verification.reviewedBy,
      submissionDate: verification.submissionDate?.toISOString().split("T")[0]
    } : null,
    coupleStats: {
      revenue,
      pendingPayouts,
      paidGuests
    },
    adminStats: {
      allPayments: allPayments.map((p) => ({
        id: p.id,
        bookingId: p.bookingId,
        travelerName: p.booking.traveler.fullName,
        weddingTitle: p.booking.wedding.title,
        amount: p.amount,
        status: p.status,
        date: p.createdAt.toISOString().split("T")[0]
      })),
      refundQueue: refundQueue.map((b) => ({
        id: b.id,
        travelerName: b.traveler.fullName,
        weddingTitle: b.wedding.title,
        amount: b.totalAmount,
        refundId: b.payments[0]?.refunds[0]?.id || "N/A",
        date: b.updatedAt.toISOString().split("T")[0]
      })),
      pendingVerifications: pendingVerifications.map((v) => ({
        id: v.id,
        travelerName: v.user.name || v.user.email.split("@")[0],
        email: v.user.email,
        role: v.user.role,
        passportUrl: v.passportUrl,
        govtIdUrl: v.govtIdUrl,
        selfieUrl: v.selfieUrl,
        invitationUrl: v.invitationUrl,
        venueConfirmUrl: v.venueConfirmUrl,
        orgDetails: v.orgDetails,
        businessRegUrl: v.businessRegUrl,
        linkedinUrl: v.linkedinUrl,
        date: v.submissionDate?.toISOString().split("T")[0] || v.createdAt.toISOString().split("T")[0]
      }))
    }
  };
}

/**
 * 9. Seeding & Querying Weddings in PostgreSQL
 */


export const getWeddings = unstable_cache(
  async () => {
    try {
      const weddings = await withDbRetry(
        () =>
          prisma.wedding.findMany({
            where: { status: "PUBLISHED", suspended: false, deletedAt: null },
            orderBy: [
              { sponsored: "desc" },
              { featured: "desc" },
              { manualTrendingBoost: "desc" },
              { createdAt: "desc" },
            ],
            include: {
              hostCouple: {
                include: { user: true }
              },
              gallery: true,
              events: true,
              traditions: true,
              sponsorshipRequests: {
                where: {
                  status: { in: ["ACTIVE", "PAID"] },
                },
                select: {
                  id: true,
                  status: true,
                  promotionType: true,
                  paymentRequired: true,
                  paymentStatus: true,
                  startsAt: true,
                  endsAt: true,
                  revokedAt: true,
                },
              },
              _count: {
                select: {
                  bookings: {
                    where: {
                      status: {
                        in: ["APPROVED", "PAID", "CONFIRMED", "COMPLETED", "CHECKED_IN", "ATTENDED", "READY_FOR_EVENT"]
                      }
                    }
                  }
                }
              }
            }
          }),
        { label: "getWeddings", maxRetries: 3 }
      );

      if (!weddings || weddings.length === 0) {
        console.info("[getWeddings] No weddings in database. Serving static fallback featured weddings.");
        const { featuredWeddings } = await import("../data");
        return sortWeddingsByDiscoveryPriority(featuredWeddings);
      }

      const weddingIds = weddings.map((w) => w.id);
      const ratingsMap = await getBatchWeddingRatingAggregates(weddingIds);

      const results = weddings.map((w) => {
        const ratings = ratingsMap.get(w.id) || { bayesianRating: 0, reviewCount: 0 };
        return toWeddingDTO({
          ...w,
          rating: ratings.reviewCount > 0 ? ratings.bayesianRating : 0,
          reviewCount: ratings.reviewCount,
          guestsBooked: w._count.bookings,
        });
      });

      return sortWeddingsByDiscoveryPriority(results);
    } catch (err) {
      console.warn("[getWeddings] Database unreachable or uninitialized. Serving static fallback featured weddings.", err);
      const { featuredWeddings } = await import("../data");
      return sortWeddingsByDiscoveryPriority(featuredWeddings);
    }
  },
  ["published-weddings"],
  { revalidate: 60, tags: ["weddings"] }
);

export const getHomepageWeddings = unstable_cache(
  async (limit: number = 6) => {
    try {
      const now = new Date();
      const weddings = await withDbRetry(
        () =>
          prisma.wedding.findMany({
            where: {
              status: "PUBLISHED",
              suspended: false,
              deletedAt: null,
              date: { gte: now },
            },
            take: limit * 2, // Fetch slightly wider candidate pool so Priority 1/2 sort correctly before slicing
            orderBy: [
              // DB-level hint: sponsored listings first, then featured.
              { sponsored: "desc" },
              { featured: "desc" },
              { createdAt: "desc" },
            ],
            include: {
              hostCouple: {
                include: { user: true },
              },
              gallery: true,
              events: true,
              traditions: true,
              sponsorshipRequests: {
                where: {
                  status: { in: ["ACTIVE", "PAID"] },
                },
                select: {
                  id: true,
                  status: true,
                  promotionType: true,
                  paymentRequired: true,
                  paymentStatus: true,
                  startsAt: true,
                  endsAt: true,
                  revokedAt: true,
                },
              },
              _count: {
                select: {
                  bookings: {
                    where: {
                      status: {
                        in: ["APPROVED", "PAID", "CONFIRMED", "COMPLETED", "CHECKED_IN", "ATTENDED", "READY_FOR_EVENT"],
                      },
                    },
                  },
                },
              },
            },
          }),
        { label: "getHomepageWeddings", maxRetries: 3 }
      );

      if (!weddings || weddings.length === 0) {
        console.info("[getHomepageWeddings] No weddings in database. Serving static fallback.");
        const { featuredWeddings } = await import("../data");
        return sortWeddingsByDiscoveryPriority(featuredWeddings).slice(0, limit);
      }

      const weddingIds = weddings.map((w) => w.id);
      const ratingsMap = await getBatchWeddingRatingAggregates(weddingIds);

      const results = weddings.map((w) => {
        const ratings = ratingsMap.get(w.id) || { bayesianRating: 0, reviewCount: 0 };
        return toWeddingDTO({
          ...w,
          rating: ratings.reviewCount > 0 ? ratings.bayesianRating : 0,
          reviewCount: ratings.reviewCount,
          guestsBooked: w._count.bookings,
        });
      });

      return sortWeddingsByDiscoveryPriority(results).slice(0, limit);
    } catch (err) {
      console.warn("[getHomepageWeddings] Database unreachable. Serving static fallback.", err);
      const { featuredWeddings } = await import("../data");
      return sortWeddingsByDiscoveryPriority(featuredWeddings).slice(0, limit);
    }
  },
  ["homepage-featured-weddings"],
  { revalidate: 60, tags: ["weddings", "homepage"] }
);

/**
 * Bounded query for related weddings on detail pages, eliminating catalog-wide waterfalls.
 */
export async function getRelatedWeddings(category: string, excludeWeddingId: string, limit: number = 3) {
  try {
    const weddings = await withDbRetry(
      () =>
        prisma.wedding.findMany({
          where: {
            status: "PUBLISHED",
            suspended: false,
            deletedAt: null,
            id: { not: excludeWeddingId },
          },
          take: limit * 2,
          orderBy: [
            { category: category ? "asc" : "desc" },
            { sponsored: "desc" },
            { featured: "desc" },
            { createdAt: "desc" },
          ],
          include: {
            hostCouple: { include: { user: true } },
            gallery: true,
            events: true,
            traditions: true,
            sponsorshipRequests: {
              where: {
                status: { in: ["ACTIVE", "PAID"] },
              },
              select: {
                id: true,
                status: true,
                promotionType: true,
                paymentRequired: true,
                paymentStatus: true,
                startsAt: true,
                endsAt: true,
                revokedAt: true,
              },
            },
            _count: {
              select: {
                bookings: {
                  where: {
                    status: {
                      in: ["APPROVED", "PAID", "CONFIRMED", "COMPLETED", "CHECKED_IN", "ATTENDED", "READY_FOR_EVENT"]
                    }
                  }
                }
              }
            }
          }
        }),
      { label: "getRelatedWeddings", maxRetries: 3 }
    );

    if (!weddings || weddings.length === 0) {
      const { featuredWeddings } = await import("../data");
      return sortWeddingsByDiscoveryPriority(featuredWeddings.filter((w) => w.id !== excludeWeddingId)).slice(0, limit);
    }

    const weddingIds = weddings.map((w) => w.id);
    const ratingsMap = await getBatchWeddingRatingAggregates(weddingIds);

    const mapped = weddings.map((w) => {
      const ratings = ratingsMap.get(w.id) || { bayesianRating: 0, reviewCount: 0 };
      return toWeddingDTO({
        ...w,
        rating: ratings.reviewCount > 0 ? ratings.bayesianRating : 0,
        reviewCount: ratings.reviewCount,
        guestsBooked: w._count.bookings,
      });
    });

    return sortWeddingsByDiscoveryPriority(mapped).slice(0, limit);
  } catch (err) {
    console.warn("[getRelatedWeddings] DB query failed, falling back to static:", err);
    const { featuredWeddings } = await import("../data");
    return sortWeddingsByDiscoveryPriority(featuredWeddings.filter((w) => w.id !== excludeWeddingId)).slice(0, limit);
  }
}

/**
 * Maps a review record to a public data transfer object, stripping sensitive data.
 */
function mapToPublicReviewDTO(review: any) {
  const authorName = review.traveler?.fullName || review.traveler?.user?.name || "Verified Traveler";
  const authorAvatar = review.traveler?.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80";
  const content = review.comment || "";
  const date = review.createdAt ? new Date(review.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  return {
    id: review.id,
    authorName,
    authorAvatar,
    content,
    date,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    helpfulVotes: review.helpfulVotes,
    ratingFood: review.ratingFood,
    ratingHospitality: review.ratingHospitality,
    ratingExperience: review.ratingExperience,
    ratingCulture: review.ratingCulture,
    ratingSafety: review.ratingSafety,
    ratingAccommodation: review.ratingAccommodation,
    ratingOrganization: review.ratingOrganization,
    ratingValue: review.ratingValue,
    ratingCommunication: review.ratingCommunication,
    status: review.status,
    traveler: review.traveler ? {
      fullName: review.traveler.fullName,
      user: review.traveler.user ? {
        name: review.traveler.user.name,
        avatar: review.traveler.user.avatar,
        status: review.traveler.user.status === "BANNED" ? "BANNED" : "ACTIVE"
      } : null
    } : null,
    repliesList: (review.repliesList || []).map((reply: any) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      user: reply.user ? {
        name: reply.user.name,
        avatar: reply.user.avatar
      } : null
    }))
  };
}

const SLUG_ALIASES: Record<string, string> = {
  "rajasthan-royal-family-celebration": "grand-maharaja-wedding",
  "shimla-himalayan-meadow-celebration": "shimla-himalayan-pine-royal-wedding",
  "punjabi-sikh-anand-karaj-experience": "punjabi-amritsar-golden-wedding",
  "kerala-coastal-christian-celebration": "kerala-coastal-christian-matrimony",
  "goa-coastal-family-wedding": "goan-sunset-beach-nuptials",
  "gujarat-jain-family-matrimony": "ahmedabad-heritage-pol-wedding",
  "delhi-interfaith-multicultural-celebration": "mughal-garden-wedding-agra",
  "chennai-coastal-temple-wedding": "tamil-brahmin-wedding-madurai",
};

export const getWeddingBySlug = unstable_cache(
  async (slug: string) => {
  try {
    const effectiveSlug = SLUG_ALIASES[slug] || slug;
    let w = await prisma.wedding.findUnique({
      where: { slug: effectiveSlug },
      include: {
        hostCouple: {
          include: { user: true }
        },
        gallery: true,
        events: true,
        traditions: true
      }
    });

    if (!w && effectiveSlug !== slug) {
      w = await prisma.wedding.findUnique({
        where: { slug },
        include: {
          hostCouple: {
            include: { user: true }
          },
          gallery: true,
          events: true,
          traditions: true
        }
      });
    }

    if (w && Boolean(w.deletedAt)) {
      return null;
    }

    if (!w) {
      const { featuredWeddings } = await import("../data");
      return featuredWeddings.find((fw) => fw.slug === effectiveSlug || fw.slug === slug) || null;
    }

    if (w.status && w.status !== WeddingStatus.PUBLISHED && (w.status as string) !== "PUBLISHED") {

      let authorized = false;
      try {
        const user = await requireAuth();
        if (user.role === UserRole.ADMIN) {
          authorized = true;
        } else if (user.role === UserRole.COUPLE && w.hostCouple?.userId === user.id) {
          authorized = true;
        }
      } catch {
        authorized = false;
      }
      if (!authorized) return null;
    }


    let ratings = { bayesianRating: 0, reviewCount: 0 };
    try {
      const { calculateBayesianRating } = await import("../services/trust-score");
      ratings = await calculateBayesianRating(w.id);
    } catch {}

    let dbReviews: any[] = [];
    try {
      dbReviews = await prisma.review.findMany({
        where: getPublishedReviewWhere({
          booking: { weddingId: w.id },
          type: "TRAVELER_TO_WEDDING"
        }),
        include: {
          traveler: {
            include: {
              user: true
            }
          },
          repliesList: {
            where: { deletedAt: null },
            include: {
              user: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    } catch {}

    // Real confirmed guests booked count
    let confirmedGuestsBooked = 0;
    try {
      const agg = await prisma.booking.aggregate({
        where: {
          weddingId: w.id,
          status: { in: [BookingStatus.APPROVED, BookingStatus.PAID, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CHECKED_IN, BookingStatus.ATTENDED, BookingStatus.READY_FOR_EVENT] }
        },
        _sum: { guestsCount: true }
      });
      confirmedGuestsBooked = agg._sum.guestsCount || 0;
    } catch {}

    if (w.suspended) {
      let authorized = false;
      try {
        const user = await requireAuth();
        if (user.role === UserRole.ADMIN) {
          authorized = true;
        } else if (user.role === UserRole.COUPLE && w.hostCouple.userId === user.id) {
          authorized = true;
        } else {
          const activeBooking = await prisma.booking.findFirst({
            where: {
              weddingId: w.id,
              traveler: { userId: user.id },
              status: {
                in: [
                  BookingStatus.PAID,
                  BookingStatus.APPROVED,
                  BookingStatus.CHECKED_IN,
                  BookingStatus.COMPLETED
                ]
              }
            }
          });
          if (activeBooking) authorized = true;
        }
      } catch {
        authorized = false;
      }
      if (!authorized) return null;
    }

    const reviews = dbReviews.map(mapToPublicReviewDTO);

    const authenticInclusions = [
      "Honorary guest entry pass",
      "Celebration banquets & beverage service",
      "Dedicated English-speaking cultural host/concierge",
    ];
    if (w.religion === "Muslim") {
      authenticInclusions.push("Qawwali / Henna evening access", "Royal Walima banquet");
    } else if (w.religion === "Sikh") {
      authenticInclusions.push("Gurdwara Anand Karaj access", "Guru Ka Langar & head scarf (Rumaal)");
    } else if (w.religion === "Christian") {
      authenticInclusions.push("Church Nuptial mass access", "Sunset reception & cocktail dance");
    } else {
      authenticInclusions.push("Henna / Sangeet evening access", "Baraat procession participation");
    }

    return toWeddingDTO({
      ...w,
      rating: ratings.reviewCount > 0 ? ratings.bayesianRating : 0,
      reviewCount: ratings.reviewCount,
      guestsBooked: confirmedGuestsBooked,
      included: authenticInclusions,
      reviews,
    });
  } catch (err) {
    console.warn(`[getWeddingBySlug] Database query failed for slug '${slug}'. Serving static fallback.`, err);
    const { featuredWeddings } = await import("../data");
    const effectiveSlug = SLUG_ALIASES[slug] || slug;
    return featuredWeddings.find((fw) => fw.slug === effectiveSlug || fw.slug === slug) || null;
  }
}, ["wedding-by-slug"], { revalidate: 3600, tags: ["weddings"] });

// ─── Sponsorship Request Actions ──────────────────────────────────────────────

/**
 * Host couple requests marketplace sponsorship for one of their weddings.
 */
export async function requestSponsorshipAction(data: {
  weddingId: string;
  promotionType?: "SPONSORED" | "FEATURED";
  proposedAmount?: number;
  message?: string;
  budget?: string;
  requestedDurationDays?: number;
}) {
  const { requestSponsorship } = await import("../services/sponsorship");
  return requestSponsorship(data);
}

/**
 * Host couple cancels their pending sponsorship request.
 */
export async function cancelSponsorshipRequestAction(requestId: string) {
  const { cancelSponsorshipRequest } = await import("../services/sponsorship");
  return cancelSponsorshipRequest(requestId);
}

/**
 * Host couple gets payment instructions (UPI QR/ID and PayPal links) for approved sponsorship.
 */
export async function getSponsorshipPaymentInstructionsAction(sponsorshipId: string) {
  const { getSponsorshipPaymentInstructions } = await import("../services/sponsorship");
  return getSponsorshipPaymentInstructions(sponsorshipId);
}

export const getSponsorshipPaymentOptionsAction = getSponsorshipPaymentInstructionsAction;
export const createSponsorshipCheckoutSessionAction = getSponsorshipPaymentInstructionsAction;

/**
 * Host couple submits UTR / transaction reference and optional payment proof after completing external payment.
 */
export async function submitHostPaymentProofAction(data: {
  sponsorshipId: string;
  transactionReference: string;
  paymentProofUrl?: string;
  paymentNotes?: string;
}) {
  const { submitHostPaymentProof } = await import("../services/sponsorship");
  return submitHostPaymentProof(data);
}

/**
 * Get public payment configuration for sponsorship (UPI QR/ID and PayPal links).
 */
export async function getSponsorshipPaymentConfigAction() {
  const { getSponsorshipPaymentConfig } = await import("../services/sponsorship");
  return getSponsorshipPaymentConfig();
}

