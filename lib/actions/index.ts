"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireAuth, syncAndGetDbUser } from "../auth";
export { syncAndGetDbUser };
import { UserRole, BookingStatus, PaymentStatus, VerificationStatus, ReferralStatus, CancellationReasonCode, CancellationActor } from "@prisma/client";
import { stripe } from "../stripe";
import { rateLimit } from "../rate-limit";
import { getWeddingRatingAggregate, getPublishedReviewWhere } from "../services/trust-score";
import {
  sendHostApprovalWithPaymentLinkEmail,
  sendInvoiceEmail,
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
  weddingSchema,
  bookingSchema,
  reviewSchema
} from "../validation";

/**
 * 1. Action to update User Role during onboarding or settings.
 */
export async function updateUserRoleAction(role: UserRole) {
  const dbUser = await requireAuth();

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
export async function updateProfileDetails(data: {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  bio?: string;
}) {
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
          interests: data.bio ?? dbUser.travelerProfile.interests
        }
      });
    } else if (dbUser.role === UserRole.COUPLE && dbUser.coupleProfile) {
      await tx.coupleProfile.update({
        where: { userId: dbUser.id },
        data: {
          weddingLocation: data.country ?? dbUser.coupleProfile.weddingLocation,
          familyBio: data.bio ?? dbUser.coupleProfile.familyBio
        }
      });
    } else if (dbUser.role === UserRole.AGENT && dbUser.agentProfile) {
      await tx.agentProfile.update({
        where: { userId: dbUser.id },
        data: {
          country: data.country ?? dbUser.agentProfile.country,
          targetAudience: data.bio ?? dbUser.agentProfile.targetAudience
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
export async function createWedding(data: any) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Forbidden: Only host couples can create wedding experiences.");
  }
  const coupleProfile = await prisma.coupleProfile.findUnique({
    where: { userId: user.id }
  });
  if (!coupleProfile) throw new Error("Couple profile not found.");

  const parsed = weddingSchema.parse({
    ...data,
    hostCoupleId: coupleProfile.id,
    pricePerGuest: parseFloat(data.pricePerGuest || "1000"),
    capacity: parseInt(data.capacity || "100"),
    date: new Date(data.date || Date.now())
  });

  const wedding = await prisma.wedding.create({
    data: parsed
  });

  revalidatePath("/weddings");
  return { success: true, wedding };
}

export async function editWedding(weddingId: string, data: any) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Forbidden: Only host couples can edit wedding experiences.");
  }

  const parsed = weddingSchema.parse({
    ...data,
    pricePerGuest: parseFloat(data.pricePerGuest),
    capacity: parseInt(data.capacity),
    date: new Date(data.date)
  });

  const wedding = await prisma.wedding.update({
    where: { id: weddingId },
    data: parsed
  });

  revalidatePath(`/weddings/${wedding.slug}`);
  revalidatePath("/weddings");
  return { success: true, wedding };
}

export async function deleteWedding(weddingId: string) {
  const user = await requireAuth();
  if (user.role !== UserRole.COUPLE) {
    throw new Error("Forbidden: Only host couples can delete wedding experiences.");
  }

  await prisma.wedding.delete({
    where: { id: weddingId }
  });

  revalidatePath("/weddings");
  return { success: true };
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
  pricePerGuest: number;
  totalAmount: number;
}) {
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
    // 1. Fetch wedding with host couple information
    const wedding = await tx.wedding.findUnique({
      where: { id: data.weddingId },
      include: { hostCouple: { include: { user: true } } }
    });
    if (!wedding) throw new Error("Wedding experience not found.");

    if (wedding.suspended) {
      throw new Error("This wedding experience is currently suspended and cannot accept new bookings.");
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

    // 4. No duplicate active booking (PENDING, APPROVED, COMPLETED)
    const existingActive = await tx.booking.findFirst({
      where: {
        travelerId: traveler.id,
        weddingId: data.weddingId,
        status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.COMPLETED] }
      }
    });
    if (existingActive) {
      throw new Error("You already have an active reservation request or booking for this wedding.");
    }

    // 5. Check guest capacity
    const approvedGuests = await tx.booking.aggregate({
      where: {
        weddingId: data.weddingId,
        status: { in: [BookingStatus.APPROVED, BookingStatus.COMPLETED] }
      },
      _sum: {
        guestsCount: true
      }
    });
    const currentBookedCount = approvedGuests._sum.guestsCount || 0;
    if (currentBookedCount + data.guestsCount > wedding.capacity) {
      throw new Error(`Cannot exceed maximum wedding guest capacity. Available spots: ${wedding.capacity - currentBookedCount}.`);
    }

    // 6. Create booking
    const createdBooking = await tx.booking.create({
      data: {
        travelerId: traveler.id,
        weddingId: data.weddingId,
        date: new Date(data.date),
        guestsCount: data.guestsCount,
        pricePerGuest: data.pricePerGuest,
        totalAmount: data.totalAmount,
        status: BookingStatus.PENDING
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

    if (status === "approved") {
      // Check capacity once more before approving
      const approvedGuests = await tx.booking.aggregate({
        where: {
          weddingId: booking.weddingId,
          status: { in: [BookingStatus.APPROVED, BookingStatus.PAID, BookingStatus.COMPLETED] }
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
          title: "Booking Approved! Secure Your Spot 🎉",
          message: `Your reservation request for ${booking.wedding.title} has been approved. Please complete your payment to secure your spot.`,
          type: "BOOKING_APPROVED"
        }
      });

      // Send host approval with payment link email
      const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings`;
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

export async function createCheckoutSessionAction(bookingId: string) {
  const user = await requireAuth();

  // Rate limiting: max 3 checkout attempts per user per 5 minutes
  const { success: rateLimitOk } = await rateLimit("createCheckout", user.id, { limit: 3, window: 300 });
  if (!rateLimitOk) {
    throw new Error("Too many payment attempts. Please wait before trying again.");
  }

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
    throw new Error(`Cannot pay for booking in status: ${booking.status}. It must be approved by the host first.`);
  }

  if (booking.payments.length > 0) {
    throw new Error("This booking has already been paid.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Attending: ${booking.wedding.title}`,
            description: `${booking.guestsCount} guests reservation ticket pass. Date: ${booking.date.toLocaleDateString()}`
          },
          unit_amount: Math.round(booking.totalAmount * 100)
        },
        quantity: 1
      }
    ],
    client_reference_id: booking.id,
    metadata: {
      bookingId: booking.id,
      travelerEmail: booking.traveler.user.email
    },
    success_url: `${appUrl}/dashboard/bookings?session_id={CHECKOUT_SESSION_ID}&success=true`,
    cancel_url: `${appUrl}/dashboard/bookings?cancel=true`,
    expires_at: Math.floor(Date.now() / 1000) + (30 * 60)
  });

  return { success: true, url: session.url };
}

export async function refundBookingAction(bookingId: string) {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden: Only administrators can process refunds.");
  }

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          where: { status: PaymentStatus.PAID }
        },
        traveler: { include: { user: true } }
      }
    });

    if (!booking) throw new Error("Booking not found.");
    if (booking.status !== BookingStatus.PAID) {
      throw new Error("Only paid bookings can be refunded.");
    }

    const payment = booking.payments[0];
    if (!payment || !payment.stripePaymentIntentId) {
      throw new Error("No successful payment transactions found for this booking.");
    }

    const stripeRefund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(payment.amount * 100)
    });

    await tx.refund.create({
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        stripeRefundId: stripeRefund.id,
        status: "SUCCESS",
        reason: "Admin requested refund"
      }
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REFUNDED }
    });

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.REFUNDED }
    });

    await tx.transaction.create({
      data: {
        paymentId: payment.id,
        type: "REFUND",
        amount: payment.amount,
        status: "SUCCESS",
        referenceId: stripeRefund.id
      }
    });

    await sendRefundConfirmationEmail(
      booking.traveler.user.email,
      booking.traveler.fullName,
      booking.weddingId,
      stripeRefund.id,
      payment.amount
    );

    return updatedBooking;
  });
}

export async function submitVerificationAction(data: {
  passportUrl?: string;
  govtIdUrl?: string;
  selfieUrl?: string;
  invitationUrl?: string;
  venueConfirmUrl?: string;
  socialLinks?: string;
  orgDetails?: string;
  businessRegUrl?: string;
  linkedinUrl?: string;
}) {
  const user = await requireAuth();

  const verification = await prisma.verification.upsert({
    where: { userId: user.id },
    update: {
      ...data,
      status: VerificationStatus.PENDING,
      submissionDate: new Date(),
    },
    create: {
      userId: user.id,
      ...data,
      status: VerificationStatus.PENDING,
      submissionDate: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Verification Submitted 📄",
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
      title: status === "APPROVED" ? "Profile Verified! ✅" : "Verification Request Declined ❌",
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

  revalidatePath("/dashboard");
  return { success: true, verification: updatedVerification };
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

  const notifications = await prisma.notification.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" }
  });

  const verification = await prisma.verification.findUnique({
    where: { userId: dbUser.id }
  });

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
    bookings = await prisma.booking.findMany({
      where: { travelerId: dbUser.travelerProfile.id },
      include: { wedding: true, payments: { include: { refunds: true } } },
      orderBy: { createdAt: "desc" }
    });

    const wishEntries = await prisma.wishlist.findMany({
      where: { travelerId: dbUser.travelerProfile.id },
      include: { wedding: true }
    });
    wishlist = wishEntries.map((w) => w.wedding.slug);
  } else if (dbUser.role === UserRole.COUPLE && dbUser.coupleProfile) {
    bookings = await prisma.booking.findMany({
      where: { wedding: { hostCoupleId: dbUser.coupleProfile.id } },
      include: { wedding: true, traveler: { include: { user: true } }, payments: true },
      orderBy: { createdAt: "desc" }
    });

    guestApplications = bookings.map((b) => ({
      id: b.id,
      travelerName: b.traveler.fullName,
      travelerCountry: b.traveler.country,
      travelerAvatar: b.traveler.user.avatar || "https://i.pravatar.cc/80?img=5",
      budget: `$${(b.totalAmount).toLocaleString()}`,
      message: `Requested slot for ${b.wedding.title}. Price: $${b.pricePerGuest}/guest.`,
      status: b.status === BookingStatus.PENDING ? "pending" : b.status === BookingStatus.AWAITING_PAYMENT ? "awaiting_payment" : b.status === BookingStatus.PAID ? "approved" : "rejected"
    }));

    const hosted = await prisma.wedding.findFirst({
      where: { hostCoupleId: dbUser.coupleProfile.id }
    });
    if (hosted) {
      hostWedding = {
        id: hosted.id,
        title: hosted.title,
        capacity: hosted.capacity,
        pricePerGuest: hosted.pricePerGuest
      };
    }

    const paidBookings = bookings.filter((b) => 
      b.status === BookingStatus.PAID || 
      b.status === BookingStatus.READY_FOR_EVENT ||
      b.status === BookingStatus.CHECKED_IN ||
      b.status === BookingStatus.ATTENDED ||
      b.status === BookingStatus.COMPLETED
    );
    revenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    pendingPayouts = revenue;

    paidGuests = paidBookings.map((b) => ({
      id: b.id,
      travelerName: b.traveler.fullName,
      guestsCount: b.guestsCount,
      amount: b.totalAmount,
      date: b.date.toISOString().split("T")[0]
    }));
  } else if (dbUser.role === UserRole.ADMIN) {
    allPayments = await prisma.payment.findMany({
      include: { booking: { include: { traveler: true, wedding: true } } },
      orderBy: { createdAt: "desc" }
    });

    refundQueue = await prisma.booking.findMany({
      where: { status: BookingStatus.REFUNDED },
      include: { traveler: true, wedding: true, payments: { include: { refunds: true } } },
      orderBy: { updatedAt: "desc" }
    });

    pendingVerifications = await prisma.verification.findMany({
      where: { status: VerificationStatus.PENDING },
      include: { user: true },
      orderBy: { submissionDate: "desc" }
    });
  }

  return {
    bookings: bookings.map((b) => {
      let mappedStatus: "upcoming" | "pending" | "rejected" | "cancelled" | "past" | "awaiting_payment" | "approved" | "refunded" = "pending";
      if (b.status === BookingStatus.PAID || b.status === BookingStatus.READY_FOR_EVENT || b.status === BookingStatus.CHECKED_IN) mappedStatus = "upcoming";
      else if (b.status === BookingStatus.APPROVED) mappedStatus = "approved";
      else if (b.status === BookingStatus.AWAITING_PAYMENT) mappedStatus = "awaiting_payment";
      else if (b.status === BookingStatus.PENDING) mappedStatus = "pending";
      else if (b.status === BookingStatus.REJECTED) mappedStatus = "rejected";
      else if (b.status === BookingStatus.CANCELLED) mappedStatus = "cancelled";
      else if (b.status === BookingStatus.REFUNDED) mappedStatus = "refunded";
      else if (b.status === BookingStatus.COMPLETED || b.status === BookingStatus.ATTENDED) mappedStatus = "past";

      return {
        id: b.id,
        weddingId: b.wedding.id,
        weddingTitle: b.wedding.title,
        location: b.wedding.location,
        imageUrl: b.wedding.mainImageUrl,
        date: b.date.toISOString().split("T")[0],
        pricePerGuest: b.pricePerGuest,
        guestsCount: b.guestsCount,
        status: mappedStatus,
        payments: b.payments || []
      };
    }),
    wishlist,
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: n.read,
      type: n.type.toLowerCase() as any
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
export async function seedDatabaseIfNeeded() {
  const count = await prisma.wedding.count();
  if (count > 0) return;

  const { featuredWeddings } = await import("../data");

  // Create a mock host couple user
  const mockUser = await prisma.user.create({
    data: {
      clerkUserId: "mock_host_id",
      email: "host@weddingwithindia.com",
      name: "Devika & Kaber",
      role: "COUPLE",
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80"
    }
  });

  const coupleProfile = await prisma.coupleProfile.create({
    data: {
      userId: mockUser.id,
      weddingDate: new Date("2025-02-14"),
      weddingLocation: "Umaid Bhawan Palace, Jodhpur",
      expectedGuests: 500,
      languagesSpoken: "English, Hindi",
      familyBio: "Devika and Kaber met while working on the restoration of a fort. They want to welcome global guests to experience traditional hospitality."
    }
  });

  for (const w of featuredWeddings) {
    await prisma.wedding.create({
      data: {
        id: w.id === "w1" ? "w1" : undefined,
        slug: w.slug,
        title: w.title,
        description: w.story,
        location: w.location,
        category: w.category,
        date: new Date(w.date),
        pricePerGuest: w.pricePerGuest,
        capacity: w.guestsAllowed,
        mainImageUrl: w.imageUrl,
        status: "PUBLISHED",
        hostCoupleId: coupleProfile.id,
        gallery: {
          create: w.gallery.map((url, idx) => ({
            imageUrl: url,
            order: idx
          }))
        },
        events: {
          create: w.timeline.map((evt) => {
            const timeParts = evt.time.split(" - ");
            const startTime = timeParts[0] || "09:00";
            const endTime = timeParts[1] || "17:00";
            return {
              name: evt.title,
              description: evt.description,
              date: new Date(w.date),
              startTime,
              endTime,
              location: w.location,
              dressCode: "Traditional / Festive smart casual"
            };
          })
        },
        traditions: {
          create: w.tags.map((tag) => ({
            name: tag,
            description: "A beautiful, colorful Indian wedding tradition."
          }))
        }
      }
    });
  }
}

export async function getWeddings() {
  try {
    await seedDatabaseIfNeeded();

    const weddings = await prisma.wedding.findMany({
      where: { status: "PUBLISHED" },
      include: {
        hostCouple: {
          include: { user: true }
        },
        gallery: true,
        events: true,
        traditions: true
      }
    });

    const results = await Promise.all(
      weddings.map(async (w) => {
        const ratings = await getWeddingRatingAggregate(w.id);
        return {
          id: w.id,
          slug: w.slug,
          title: w.title,
          location: w.location,
          city: w.location.split(",")[0]?.trim() || "India",
          state: w.location.split(",")[1]?.trim() || "India",
          country: "India",
          countryCode: "IN",
          category: w.category as any,
          pricePerGuest: w.pricePerGuest,
          currency: "USD",
          rating: ratings.bayesianRating,
          reviewCount: ratings.reviewCount,
          guestsAllowed: w.capacity,
          guestsBooked: 24,
          imageUrl: w.mainImageUrl,
          coupleImage: w.hostCouple.user.avatar || "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80",
          coupleName: w.hostCouple.user.name || "Devika & Kaber",
          hostName: w.hostCouple.user.name || "Devika & Kaber",
          hostAvatar: w.hostCouple.user.avatar || "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80",
          featured: true,
          tags: w.traditions.map((t) => t.name),
          date: w.date.toISOString().split("T")[0],
          religion: w.category === "Royal" ? "Hinduism" : "Multicultural",
          luxuryLevel: "Luxury" as const,
          durationDays: 3,
          languages: w.hostCouple.languagesSpoken?.split(",").map((l) => l.trim()) || ["English"],
          isVerified: true,
          gallery: w.gallery.map((g) => g.imageUrl),
          story: w.description,
          coupleBio: w.hostCouple.familyBio || "",
          timeline: w.events.map((evt) => ({
            id: evt.id,
            title: evt.name,
            time: `${evt.startTime} - ${evt.endTime}`,
            date: evt.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            description: evt.description || "",
            icon: "✨"
          })),
          traditions: w.traditions.map((t) => ({
            title: t.name,
            description: t.description
          })),
          dressCode: "Traditional Indian / Festive Smart Casual",
          foodDescription: "Authentic local cuisine with vegetarian and vegan options available.",
          venueDescription: "A gorgeous venue with complete safety check, clean sanitation, and parking.",
          accommodation: "5-star luxury accommodation available nearby (discount rates offered for our guests).",
          included: ["Entry pass", "Food & beverages", "Cultural workshops", "Henna art session"],
          notIncluded: ["Flights", "Personal local transport", "Hotel stay (available as add-on)"],
          reviews: [] as any[],
          faqs: []
        };
      })
    );
    return results;
  } catch (err) {
    console.warn("Database offline, serving static fallback:", err);
    const { featuredWeddings } = await import("../data");
    return featuredWeddings;
  }
}

/**
 * Maps a review record to a public data transfer object, stripping sensitive data.
 */
function mapToPublicReviewDTO(review: any) {
  return {
    id: review.id,
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

export async function getWeddingBySlug(slug: string) {
  try {
    await seedDatabaseIfNeeded();

    const w = await prisma.wedding.findUnique({
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

    if (!w) return null;

    const { calculateBayesianRating } = await import("../services/trust-score");
    const ratings = await calculateBayesianRating(w.id);

    const dbReviews = await prisma.review.findMany({
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
          if (activeBooking) {
            authorized = true;
          }
        }
      } catch (authErr) {
        // Unauthenticated or query error
      }

      if (!authorized) {
        return null;
      }
    }

    return {
      id: w.id,
      slug: w.slug,
      title: w.title,
      location: w.location,
      city: w.location.split(",")[0]?.trim() || "India",
      state: w.location.split(",")[1]?.trim() || "India",
      country: "India",
      countryCode: "IN",
      category: w.category as any,
      pricePerGuest: w.pricePerGuest,
      currency: "USD",
      rating: ratings.bayesianRating,
      reviewCount: ratings.reviewCount,
      guestsAllowed: w.capacity,
      guestsBooked: 24,
      imageUrl: w.mainImageUrl,
      coupleImage: w.hostCouple.user.avatar || "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80",
      coupleName: w.hostCouple.user.name || "Devika & Kaber",
      hostName: w.hostCouple.user.name || "Devika & Kaber",
      hostAvatar: w.hostCouple.user.avatar || "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80",
      featured: true,
      tags: w.traditions.map((t) => t.name),
      date: w.date.toISOString().split("T")[0],
      religion: w.category === "Royal" ? "Hinduism" : "Multicultural",
      luxuryLevel: "Luxury" as const,
      durationDays: 3,
      languages: w.hostCouple.languagesSpoken?.split(",").map((l) => l.trim()) || ["English"],
      isVerified: true,
      gallery: w.gallery.map((g) => g.imageUrl),
      story: w.description,
      coupleBio: w.hostCouple.familyBio || "",
      timeline: w.events.map((evt) => ({
        id: evt.id,
        title: evt.name,
        time: `${evt.startTime} - ${evt.endTime}`,
        date: evt.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        description: evt.description || "",
        icon: "✨"
      })),
      traditions: w.traditions.map((t) => ({
        title: t.name,
        description: t.description
      })),
      dressCode: "Traditional Indian / Festive Smart Casual",
      foodDescription: "Authentic local cuisine with vegetarian and vegan options available.",
      venueDescription: "A gorgeous venue with complete safety check, clean sanitation, and parking.",
      accommodation: "5-star luxury accommodation available nearby (discount rates offered for our guests).",
      included: ["Entry pass", "Food & beverages", "Cultural workshops", "Henna art session"],
      notIncluded: ["Flights", "Personal local transport", "Hotel stay (available as add-on)"],
      reviews: dbReviews.map(mapToPublicReviewDTO) as any,
      faqs: []
    };
  } catch (err) {
    console.warn("Database offline, serving static fallback:", err);
    const { featuredWeddings } = await import("../data");
    return featuredWeddings.find((w) => w.slug === slug) || null;
  }
}


