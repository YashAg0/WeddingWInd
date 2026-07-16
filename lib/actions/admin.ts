"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireRole } from "../auth";
import { UserRole, BookingStatus, PaymentStatus, VerificationStatus, ReputationEntityType, ReputationEventType } from "@prisma/client";
import { z } from "zod";
import { sendVerificationApprovedEmail, sendVerificationRejectedEmail } from "../email";
import crypto from "crypto";
import { logReputationEvent } from "../services/reputation";

// Helper function to log audit events
export async function createAuditLog(
  action: string,
  entity: string,
  entityId: string | null,
  details: string
) {
  try {
    const adminUser = await requireRole([UserRole.ADMIN]);
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: adminUser.id,
        userName: adminUser.name || adminUser.email,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Dashboard Stats
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetDashboardStatsAction() {
  await requireRole([UserRole.ADMIN]);

  const allPayments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = allPayments
    .filter((p) => p.status === PaymentStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0);

  const activeWeddingsCount = await prisma.wedding.count({
    where: { status: "PUBLISHED" },
  });

  const pendingBookingsCount = await prisma.booking.count({
    where: { status: BookingStatus.PENDING },
  });

  const pendingVerificationsCount = await prisma.verification.count({
    where: { status: VerificationStatus.PENDING },
  });

  // Calculate growth data (last 6 months payments volume)
  const monthlyData: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString("default", { month: "short" });
    monthlyData[monthName] = 0;
  }

  allPayments.forEach((p) => {
    if (p.status === PaymentStatus.PAID) {
      const monthName = p.createdAt.toLocaleString("default", { month: "short" });
      if (monthName in monthlyData) {
        monthlyData[monthName] += p.amount;
      }
    }
  });

  const growthCharts = Object.entries(monthlyData).map(([name, amount]) => ({
    name,
    amount,
  }));

  // Stripe Statistics Mock calculations matching real system volumes
  const stripeVolume = totalRevenue;
  const stripeFees = totalRevenue * 0.029 + allPayments.length * 0.3;
  const netRevenue = stripeVolume - stripeFees;

  return {
    revenue: totalRevenue,
    activeWeddings: activeWeddingsCount,
    pendingBookings: pendingBookingsCount,
    verificationQueueCount: pendingVerificationsCount,
    stripeStats: {
      volume: stripeVolume,
      fees: stripeFees,
      net: netRevenue,
    },
    growthCharts,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Wedding Management
// ─────────────────────────────────────────────────────────────────────────────

const adminWeddingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string(),
  pricePerGuest: z.number().positive(),
  capacity: z.number().int().positive(),
  requiredGuests: z.number().int().nonnegative().default(0),
  theme: z.string().nullable().optional(),
  dressCode: z.string().nullable().optional(),
  ethnicity: z.string().nullable().optional(),
  mainImageUrl: z.string().url("Invalid image URL"),
  hostCoupleId: z.string().uuid("Invalid Host Couple Profile ID"),
  status: z.enum(["DRAFT", "PUBLISHED", "COMPLETED"]).default("DRAFT"),
  featured: z.boolean().default(false),
});

export async function adminGetWeddingsAction() {
  await requireRole([UserRole.ADMIN]);
  return await prisma.wedding.findMany({
    include: {
      hostCouple: { include: { user: true } },
      gallery: true,
      events: true,
      traditions: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminCreateWeddingAction(data: any) {
  const admin = await requireRole([UserRole.ADMIN]);
  const parsed = adminWeddingSchema.parse({
    ...data,
    pricePerGuest: parseFloat(data.pricePerGuest),
    capacity: parseInt(data.capacity),
    featured: !!data.featured,
  });

  // Autogenerate unique slug from title
  let slug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const existing = await prisma.wedding.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  const wedding = await prisma.wedding.create({
    data: {
      ...parsed,
      slug,
      date: new Date(parsed.date),
    },
  });

  await createAuditLog("CREATE_WEDDING", "Wedding", wedding.id, `Created wedding experience: "${wedding.title}"`);
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/weddings");
  return { success: true, wedding };
}

export async function adminUpdateWeddingAction(weddingId: string, data: any) {
  const admin = await requireRole([UserRole.ADMIN]);
  const parsed = adminWeddingSchema.parse({
    ...data,
    pricePerGuest: parseFloat(data.pricePerGuest),
    capacity: parseInt(data.capacity),
    featured: !!data.featured,
  });

  const wedding = await prisma.wedding.update({
    where: { id: weddingId },
    data: {
      ...parsed,
      date: new Date(parsed.date),
    },
  });

  await createAuditLog("UPDATE_WEDDING", "Wedding", wedding.id, `Updated wedding details for: "${wedding.title}"`);
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath(`/weddings/${wedding.slug}`);
  revalidatePath("/weddings");
  return { success: true, wedding };
}

export async function adminDeleteWeddingAction(weddingId: string) {
  const admin = await requireRole([UserRole.ADMIN]);
  const deleted = await prisma.wedding.delete({
    where: { id: weddingId },
  });

  await createAuditLog("DELETE_WEDDING", "Wedding", weddingId, `Deleted wedding experience: "${deleted.title}"`);
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/weddings");
  return { success: true };
}

export async function adminToggleWeddingStatusAction(weddingId: string, status: any) {
  const admin = await requireRole([UserRole.ADMIN]);
  const updated = await prisma.wedding.update({
    where: { id: weddingId },
    data: { status },
  });

  await createAuditLog("TOGGLE_WEDDING_STATUS", "Wedding", weddingId, `Changed status of "${updated.title}" to ${status}`);
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/weddings");
  return { success: true };
}

export async function adminToggleWeddingFeaturedAction(weddingId: string, featured: boolean) {
  const admin = await requireRole([UserRole.ADMIN]);
  const updated = await prisma.wedding.update({
    where: { id: weddingId },
    data: { featured },
  });

  await createAuditLog("TOGGLE_WEDDING_FEATURED", "Wedding", weddingId, `Set featured flag for "${updated.title}" to ${featured}`);
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/weddings");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. User Management
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetUsersAction() {
  await requireRole([UserRole.ADMIN]);
  return await prisma.user.findMany({
    include: {
      travelerProfile: true,
      coupleProfile: true,
      agentProfile: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminUpdateUserRoleAction(userId: string, role: UserRole) {
  const admin = await requireRole([UserRole.ADMIN]);

  // Prevent self-role modification to prevent locked-out admin scenario
  if (userId === admin.id) {
    throw new Error("Cannot change your own role settings.");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  // Ensure default profiles exist if missing
  if (role === UserRole.TRAVELER) {
    await prisma.travelerProfile.upsert({
      where: { userId },
      create: {
        fullName: updated.name || "New Traveler",
        country: "United States",
        language: "English",
        user: { connect: { id: userId } },
      },
      update: {},
    });
  } else if (role === UserRole.COUPLE) {
    await prisma.coupleProfile.upsert({
      where: { userId },
      create: {
        expectedGuests: 200,
        familyBio: "Hosted Couple",
        user: { connect: { id: userId } },
      },
      update: {},
    });
  } else if (role === UserRole.AGENT) {
    const { generateReferralCode } = require("./referrals");
    const refCode = await generateReferralCode(updated.name || "AGENT");

    await prisma.agentProfile.upsert({
      where: { userId },
      create: {
        organization: "Wedding Planners Ltd",
        country: "India",
        referralCode: refCode,
        user: { connect: { id: userId } },
      },
      update: {},
    });
  }

  await createAuditLog("UPDATE_USER_ROLE", "User", userId, `Updated user ${updated.email} role to ${role}`);
  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function adminDeleteUserAction(userId: string) {
  const admin = await requireRole([UserRole.ADMIN]);
  if (userId === admin.id) {
    throw new Error("Cannot delete your own admin account.");
  }

  const deleted = await prisma.user.delete({
    where: { id: userId },
  });

  await createAuditLog("DELETE_USER", "User", userId, `Deleted user account: ${deleted.email}`);
  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Verification Queue
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetVerificationsAction() {
  await requireRole([UserRole.ADMIN]);
  return await prisma.verification.findMany({
    include: { user: true },
    orderBy: { submissionDate: "desc" },
  });
}

export async function adminReviewVerificationAction(
  verificationId: string,
  status: VerificationStatus,
  notes: string
) {
  const admin = await requireRole([UserRole.ADMIN]);

  const updated = await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status,
      notes,
      reviewedBy: admin.name || admin.email,
    },
    include: {
      user: {
        include: {
          travelerProfile: true,
          coupleProfile: true,
          agentProfile: true
        }
      }
    },
  });

  // Update user status if approved or rejected
  await prisma.user.update({
    where: { id: updated.userId },
    data: {
      status: status === VerificationStatus.APPROVED ? "ACTIVE" : "ONBOARDING",
    },
  });

  // Log Verification Approved Reputation Event if approved
  let entityType: ReputationEntityType | null = null;
  let entityId: string | null = null;

  if (updated.user.role === UserRole.TRAVELER && updated.user.travelerProfile) {
    entityType = ReputationEntityType.TRAVELER;
    entityId = updated.user.travelerProfile.id;
  } else if (updated.user.role === UserRole.COUPLE && updated.user.coupleProfile) {
    entityType = ReputationEntityType.HOST;
    entityId = updated.user.coupleProfile.id;
  } else if (updated.user.role === UserRole.AGENT && updated.user.agentProfile) {
    entityType = ReputationEntityType.AGENT;
    entityId = updated.user.agentProfile.id;
  }

  if (status === VerificationStatus.APPROVED && entityType && entityId) {
    await logReputationEvent({
      entityType,
      entityId,
      type: ReputationEventType.VERIFICATION_APPROVED,
      scoreEffect: 10,
      referenceId: verificationId,
      idempotencyKey: `VERIFICATION_APPROVED:${updated.userId}`
    });
  }

  // Create Notification
  const notifyType = status === VerificationStatus.APPROVED ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED";
  const notifyTitle = status === VerificationStatus.APPROVED ? "Verification Approved! ✅" : "Verification Request Declined ❌";
  const notifyMessage = status === VerificationStatus.APPROVED 
    ? "Your identity verification checks passed! A trust badge has been linked to your profile." 
    : `Your trust verification request was declined. Notes: ${notes || "Invalid/blurred docs."}`;

  await prisma.notification.create({
    data: {
      userId: updated.userId,
      title: notifyTitle,
      message: notifyMessage,
      type: notifyType,
    },
  });

  // Send Email
  if (updated.user.email) {
    const userName = updated.user.name || updated.user.email.split("@")[0];
    if (status === VerificationStatus.APPROVED) {
      await sendVerificationApprovedEmail(updated.user.email, userName, updated.user.role);
    } else if (status === VerificationStatus.REJECTED) {
      await sendVerificationRejectedEmail(updated.user.email, userName, notes);
    }
  }

  // Sync quality badges on status change
  if (entityType && entityId) {
    const { evaluateEntityBadges } = require("../services/badges");
    await evaluateEntityBadges(entityType, entityId);
  }

  await createAuditLog("REVIEW_VERIFICATION", "Verification", verificationId, `Reviewed verification status for ${updated.user.email} to ${status}. Notes: "${notes}"`);
  revalidatePath("/dashboard/admin/verifications");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Booking Management
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetBookingsAction() {
  await requireRole([UserRole.ADMIN]);
  return await prisma.booking.findMany({
    include: {
      traveler: { include: { user: true } },
      wedding: { include: { hostCouple: { include: { user: true } } } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminOverrideBookingStatusAction(
  bookingId: string,
  status: BookingStatus,
  reason: string = "Admin override via dashboard",
  caseId?: string
) {
  const admin = await requireRole([UserRole.ADMIN]);

  if (!reason || reason.trim().length < 5) {
    throw new Error("An override reason must be provided (minimum 5 characters).");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { traveler: true },
    });

    if (!booking) throw new Error("Booking not found.");

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // Write timeline and override audit details if linked to a case
    if (caseId) {
      await tx.caseTimelineEvent.create({
        data: {
          caseId,
          actorId: admin.id,
          eventType: "OVERRIDE_BOOKING_STATUS",
          safeSummary: `Admin overrode booking status of ${booking.id} from ${booking.status} to ${status}.`,
          metadata: JSON.stringify({
            bookingId,
            previousStatus: booking.status,
            newStatus: status,
            reason,
          }),
        },
      });
    }

    return updatedBooking;
  });

  await createAuditLog(
    "OVERRIDE_BOOKING_STATUS",
    "Booking",
    bookingId,
    `Overrode booking status to ${status}. Reason: "${reason}". CaseId: ${caseId || "None"}`
  );

  revalidatePath("/dashboard/admin/bookings");
  return { success: true };
}

export async function adminExportBookingsCSVAction() {
  await requireRole([UserRole.ADMIN]);
  const bookings = await prisma.booking.findMany({
    include: {
      traveler: true,
      wedding: true,
    },
  });

  const header = "Booking ID,Traveler Name,Wedding,Date,Guests,Amount,Status\n";
  const rows = bookings
    .map(
      (b) =>
        `"${b.id}","${b.traveler.fullName}","${b.wedding.title}","${b.date.toISOString().split("T")[0]}",${b.guestsCount},${b.totalAmount},"${b.status}"`
    )
    .join("\n");

  await createAuditLog("EXPORT_BOOKINGS", "Booking", null, "Exported booking register to CSV");
  return { success: true, csv: header + rows };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Payments, Refund Queue, Payout Queue
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetPaymentsAndQueuesAction() {
  await requireRole([UserRole.ADMIN]);

  const transactions = await prisma.transaction.findMany({
    include: {
      payment: {
        include: {
          booking: {
            include: { traveler: true, wedding: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const refundQueue = await prisma.refund.findMany({
    include: {
      payment: {
        include: {
          booking: {
            include: { traveler: true, wedding: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const payoutQueue = await prisma.payout.findMany({
    include: {
      payment: {
        include: {
          booking: {
            include: {
              wedding: {
                include: {
                  hostCouple: {
                    include: { user: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    transactions,
    refundQueue,
    payoutQueue,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CMS (FAQ, Blog, Hero Content, Homepage Stats, Testimonials)
// ─────────────────────────────────────────────────────────────────────────────

const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
  category: z.string().min(1),
  order: z.number().int().nonnegative().default(0),
});

export async function adminUpsertFAQAction(faqId: string | null, data: any) {
  await requireRole([UserRole.ADMIN]);
  const parsed = faqSchema.parse({
    ...data,
    order: parseInt(data.order || "0"),
  });

  let faq;
  if (faqId) {
    faq = await prisma.fAQ.update({
      where: { id: faqId },
      data: parsed,
    });
    await createAuditLog("UPDATE_FAQ", "FAQ", faq.id, `Updated FAQ item: "${faq.question}"`);
  } else {
    faq = await prisma.fAQ.create({
      data: parsed,
    });
    await createAuditLog("CREATE_FAQ", "FAQ", faq.id, `Created FAQ item: "${faq.question}"`);
  }

  revalidatePath("/how-it-works");
  revalidatePath("/dashboard/admin/cms");
  return { success: true, faq };
}

export async function adminDeleteFAQAction(faqId: string) {
  await requireRole([UserRole.ADMIN]);
  const deleted = await prisma.fAQ.delete({
    where: { id: faqId },
  });

  await createAuditLog("DELETE_FAQ", "FAQ", faqId, `Deleted FAQ item: "${deleted.question}"`);
  revalidatePath("/how-it-works");
  revalidatePath("/dashboard/admin/cms");
  return { success: true };
}

const blogPostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(false),
});

export async function adminUpsertBlogPostAction(blogId: string | null, data: any) {
  const admin = await requireRole([UserRole.ADMIN]);
  const parsed = blogPostSchema.parse({
    ...data,
    published: !!data.published,
  });

  let slug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const existing = await prisma.blogPost.findFirst({ where: { slug, NOT: blogId ? { id: blogId } : undefined } });
  if (existing) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  let post;
  if (blogId) {
    post = await prisma.blogPost.update({
      where: { id: blogId },
      data: {
        ...parsed,
        slug,
      },
    });
    await createAuditLog("UPDATE_BLOG", "BlogPost", post.id, `Updated blog post: "${post.title}"`);
  } else {
    post = await prisma.blogPost.create({
      data: {
        ...parsed,
        slug,
        authorId: admin.id,
        authorName: admin.name || admin.email,
      },
    });
    await createAuditLog("CREATE_BLOG", "BlogPost", post.id, `Created blog post: "${post.title}"`);
  }

  revalidatePath("/dashboard/admin/cms");
  return { success: true, post };
}

export async function adminDeleteBlogPostAction(blogId: string) {
  await requireRole([UserRole.ADMIN]);
  const deleted = await prisma.blogPost.delete({
    where: { id: blogId },
  });

  await createAuditLog("DELETE_BLOG", "BlogPost", blogId, `Deleted blog post: "${deleted.title}"`);
  revalidatePath("/dashboard/admin/cms");
  return { success: true };
}

const testimonialSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  avatar: z.string().url().optional().or(z.literal("")),
  quote: z.string().min(10),
  rating: z.number().int().min(1).max(5).default(5),
  featured: z.boolean().default(false),
});

export async function adminUpsertTestimonialAction(testimonialId: string | null, data: any) {
  await requireRole([UserRole.ADMIN]);
  const parsed = testimonialSchema.parse({
    ...data,
    rating: parseInt(data.rating || "5"),
    featured: !!data.featured,
  });

  let t;
  if (testimonialId) {
    t = await prisma.testimonial.update({
      where: { id: testimonialId },
      data: parsed,
    });
    await createAuditLog("UPDATE_TESTIMONIAL", "Testimonial", t.id, `Updated testimonial from "${t.name}"`);
  } else {
    t = await prisma.testimonial.create({
      data: parsed,
    });
    await createAuditLog("CREATE_TESTIMONIAL", "Testimonial", t.id, `Created testimonial from "${t.name}"`);
  }

  revalidatePath("/dashboard/admin/cms");
  return { success: true, testimonial: t };
}

export async function adminDeleteTestimonialAction(testimonialId: string) {
  await requireRole([UserRole.ADMIN]);
  const deleted = await prisma.testimonial.delete({
    where: { id: testimonialId },
  });

  await createAuditLog("DELETE_TESTIMONIAL", "Testimonial", testimonialId, `Deleted testimonial from "${deleted.name}"`);
  revalidatePath("/dashboard/admin/cms");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Analytics & Audit Logs
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetAuditLogsAction() {
  await requireRole([UserRole.ADMIN]);
  return await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Couple Payout Processing & Trust & Safety Metrics (Phase 13)
// ─────────────────────────────────────────────────────────────────────────────

export async function adminProcessHostPayoutAction(paymentId: string) {
  const admin = await requireRole([UserRole.ADMIN]);

  const { isFinanciallyHeld } = require("./safety");
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          traveler: true,
          wedding: {
            include: {
              hostCouple: true
            }
          }
        }
      }
    },
  });

  if (!payment) throw new Error("Payment not found.");

  // Check safety holds for traveler and host couple
  const travelerHeld = await isFinanciallyHeld({
    bookingId: payment.bookingId,
    weddingId: payment.booking.weddingId,
    userId: payment.booking.traveler.userId,
  });

  const hostHeld = await isFinanciallyHeld({
    bookingId: payment.bookingId,
    weddingId: payment.booking.weddingId,
    userId: payment.booking.wedding.hostCouple.userId,
  });

  if (travelerHeld || hostHeld) {
    throw new Error("Cannot process payout: This transaction, traveler, or host couple is subject to an active safety hold.");
  }

  // Check if payout already exists
  const existing = await prisma.payout.findFirst({
    where: { paymentId },
  });
  if (existing) {
    throw new Error("Payout has already been processed for this transaction.");
  }

  const payout = await prisma.payout.create({
    data: {
      paymentId,
      amount: payment.amount,
      status: "CLEARED",
      stripeTransferId: `tr_${crypto.randomBytes(12).toString("hex")}`,
    },
  });

  await createAuditLog("PROCESS_PAYOUT", "Payout", payout.id, `Admin processed host payout of $${payment.amount} for payment ${paymentId}`);

  // Log PAYOUT_COMPLETED event for host
  const { logReputationEvent } = require("../services/reputation");
  await logReputationEvent({
    entityType: ReputationEntityType.HOST,
    entityId: payment.booking.wedding.hostCoupleId,
    type: ReputationEventType.PAYOUT_COMPLETED,
    scoreEffect: 5,
    referenceId: payout.id,
    idempotencyKey: `PAYOUT_COMPLETED:HOST:${payout.id}`
  });

  revalidatePath("/dashboard/admin/payments");
  return { success: true, payout };
}

export async function adminGetSafetyMetricsAction() {
  await requireRole([UserRole.ADMIN]);

  const openCasesCount = await prisma.safetyCase.count({
    where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
  });

  const criticalCasesCount = await prisma.safetyCase.count({
    where: { severity: "CRITICAL", status: { notIn: ["RESOLVED", "CLOSED"] } },
  });

  const activeRestrictionsCount = await prisma.userRestriction.count({
    where: { revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
  });

  const suspendedWeddingsCount = await prisma.wedding.count({
    where: { suspended: true },
  });

  const casesByType = await prisma.safetyCase.groupBy({
    by: ["type"],
    _count: {
      id: true,
    },
  });

  const totalCancellations = await prisma.cancellationRequest.count();
  const completedCancellations = await prisma.cancellationRequest.count({
    where: { status: "COMPLETED" },
  });

  const refundRequestRate = totalCancellations > 0 ? (totalCancellations / (await prisma.booking.count())) * 100 : 0;
  const refundApprovalRate = totalCancellations > 0 ? (completedCancellations / totalCancellations) * 100 : 0;

  return {
    openCases: openCasesCount,
    criticalCases: criticalCasesCount,
    activeRestrictions: activeRestrictionsCount,
    suspendedWeddings: suspendedWeddingsCount,
    casesByType: casesByType.map((c) => ({ type: c.type, count: c._count.id })),
    refundRequestRate,
    refundApprovalRate,
  };
}

/**
 * Creates a manual reputation score adjustment.
 */
export async function adminCreateManualReputationAdjustmentAction(params: {
  entityType: ReputationEntityType;
  entityId: string;
  scoreEffect: number;
  reason: string;
  mutationId: string;
}) {
  const adminUser = await requireRole([UserRole.ADMIN]);

  if (!params.mutationId || typeof params.mutationId !== "string" || params.mutationId.trim() === "") {
    throw new Error("INVALID_MUTATION_ID: A stable mutation identifier must be provided.");
  }

  if (Math.abs(params.scoreEffect) > 50) {
    throw new Error("INVALID_ADJUSTMENT: Manual adjustments are capped at +/- 50 points.");
  }

  if (!params.reason || params.reason.trim().length < 5) {
    throw new Error("An adjustment reason must be provided (minimum 5 characters).");
  }

  const idempotencyKey = `MANUAL_ADJUSTMENT:${adminUser.id}:${params.mutationId}:${params.entityType}:${params.entityId}`;

  const event = await logReputationEvent({
    entityType: params.entityType,
    entityId: params.entityId,
    type: ReputationEventType.MANUAL_ADMIN_ADJUSTMENT,
    scoreEffect: params.scoreEffect,
    referenceId: adminUser.id,
    idempotencyKey
  });

  if (event) {
    await createAuditLog(
      "MANUAL_REPUTATION_ADJUSTMENT",
      params.entityType,
      params.entityId,
      `Admin manually adjusted reputation score by ${params.scoreEffect > 0 ? "+" : ""}${params.scoreEffect}. Reason: "${params.reason}"`
    );
  }

  return { success: event };
}

