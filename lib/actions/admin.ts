"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../auth";
import { UserRole, BookingStatus, PaymentStatus, VerificationStatus, WeddingStatus, ReputationEntityType, ReputationEventType } from "@prisma/client";
import { z } from "zod";
import { sendVerificationApprovedEmail, sendVerificationRejectedEmail } from "../email";
import crypto from "crypto";
import { logReputationEvent } from "../services/reputation";
import { CAPACITY_HOLDING_BOOKING_STATUSES } from "../booking-statuses";

// Helper function to log audit events
export async function createAuditLog(
  action: string,
  entity: string,
  entityId: string | null,
  details: string,
  actorOverride?: { id: string; name?: string | null; email?: string }
) {
  try {
    let actorId = actorOverride?.id;
    let actorName = actorOverride?.name || actorOverride?.email;

    if (!actorId) {
      try {
        const user = await requireAuth();
        actorId = user.id;
        actorName = user.name || user.email;
      } catch {
        actorId = "SYSTEM";
        actorName = "SYSTEM / AUTOMATION";
      }
    }

    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: actorId || "SYSTEM",
        userName: actorName || "SYSTEM",
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

  const [allPayments, activeWeddingsCount, pendingBookingsCount, pendingVerificationsCount] = await Promise.all([
    prisma.payment.findMany({
      where: { status: PaymentStatus.PAID },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.wedding.count({
      where: { status: "PUBLISHED", deletedAt: null },
    }),
    prisma.booking.count({
      where: { status: BookingStatus.PENDING },
    }),
    prisma.verification.count({
      where: { status: VerificationStatus.PENDING },
    }),
  ]);

  const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate growth data (last 6 months payments volume)
  const monthlyData: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString("default", { month: "short" });
    monthlyData[monthName] = 0;
  }

  allPayments.forEach((p) => {
    const monthName = p.createdAt.toLocaleString("default", { month: "short" });
    if (monthName in monthlyData) {
      monthlyData[monthName] += p.amount;
    }
  });

  const growthCharts = Object.entries(monthlyData).map(([name, amount]) => ({
    name,
    amount,
  }));

  // Processing Fee & Volume calculations (configurable ~3.5% + fixed)
  const totalVolume = totalRevenue;
  const estimatedFees = totalRevenue * 0.035;
  const netRevenue = totalVolume - estimatedFees;

  return {
    revenue: totalRevenue,
    activeWeddings: activeWeddingsCount,
    pendingBookings: pendingBookingsCount,
    verificationQueueCount: pendingVerificationsCount,
    stripeStats: {
      volume: totalVolume,
      fees: estimatedFees,
      net: netRevenue,
    },
    paymentStats: {
      volume: totalVolume,
      fees: estimatedFees,
      net: netRevenue,
    },
    growthCharts,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Wedding Management
// ─────────────────────────────────────────────────────────────────────────────

const adminWeddingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  religion: z.string().default("Hindu"),
  region: z.string().nullable().optional(),
  community: z.string().nullable().optional(),
  foodContext: z.string().nullable().optional(),
  dressExpectations: z.string().nullable().optional(),
  guestRules: z.string().nullable().optional(),
  etiquetteNotes: z.string().nullable().optional(),
  tier: z.enum(["STANDARD", "ENHANCED", "GRAND", "ROYAL", "SIGNATURE_ROYAL"]).default("STANDARD"),
  durationDays: z.number().int().min(1).max(5).default(3),
  ceremoniesCount: z.number().int().min(1).max(15).default(3),
  experienceIntensity: z.string().default("TRADITIONAL"),
  weddingScale: z.string().default("MEDIUM"),
  date: z.string(),
  pricePerGuest: z.number().positive().default(149),
  capacity: z.number().int().positive(),
  requiredGuests: z.number().int().nonnegative().default(0),
  theme: z.string().nullable().optional(),
  dressCode: z.string().nullable().optional(),
  ethnicity: z.string().nullable().optional(),
  mainImageUrl: z.string().url("Invalid image URL"),
  hostCoupleId: z.string().uuid("Invalid Host Couple Profile ID"),
  status: z.enum(["DRAFT", "PUBLISHED", "COMPLETED", "UNDER_REVIEW", "ACTION_REQUIRED", "VERIFIED", "ARCHIVED", "REJECTED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  sponsored: z.boolean().default(false),
  sponsorshipStart: z.string().nullable().optional(),
  sponsorshipEnd: z.string().nullable().optional(),
  isDemo: z.boolean().default(false),
  events: z.array(z.any()).optional(),
  traditions: z.array(z.any()).optional(),
  gallery: z.array(z.string()).optional(),
});

export async function adminGetWeddingsAction() {
  await requireRole([UserRole.ADMIN]);
  return await prisma.wedding.findMany({
    include: {
      hostCouple: { include: { user: true } },
      gallery: true,
      events: true,
      traditions: true,
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
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminCreateWeddingAction(data: any) {
  const { getCustomerPriceUSD, normalizeWeddingTier, normalizeDurationDays } = await import("../services/pricing-engine");
  const admin = await requireRole([UserRole.ADMIN]);
  const tier = normalizeWeddingTier(data.tier || "STANDARD");
  const durationDays = normalizeDurationDays(parseInt(data.durationDays) || 3);
  const derivedPricePerGuest = getCustomerPriceUSD(tier, durationDays);

  const parsed = adminWeddingSchema.parse({
    ...data,
    tier,
    durationDays,
    ceremoniesCount: parseInt(data.ceremoniesCount) || 3,
    pricePerGuest: derivedPricePerGuest,
    capacity: parseInt(data.capacity),
    featured: data.featured === true || data.featured === "true",
    sponsored: data.sponsored === true || data.sponsored === "true",
  });

  // Autogenerate unique slug from title
  let slug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const existing = await prisma.wedding.findUnique({ where: { slug } });
  if (existing) {
    const crypto = require('crypto');
    const randomSuffix = crypto.randomBytes(2).readUInt16LE(0) % 1000;
    slug = `${slug}-${randomSuffix}`;
  }

  const sponsorshipStart = parsed.sponsorshipStart ? new Date(parsed.sponsorshipStart) : null;
  const sponsorshipEnd = parsed.sponsorshipEnd ? new Date(parsed.sponsorshipEnd) : null;

  const wedding = await prisma.wedding.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      location: parsed.location,
      category: parsed.category,
      religion: parsed.religion,
      region: parsed.region || null,
      community: parsed.community || null,
      foodContext: parsed.foodContext || null,
      dressExpectations: parsed.dressExpectations || null,
      guestRules: parsed.guestRules || null,
      etiquetteNotes: parsed.etiquetteNotes || null,
      tier: parsed.tier,
      durationDays: parsed.durationDays,
      ceremoniesCount: parsed.ceremoniesCount,
      experienceIntensity: parsed.experienceIntensity,
      weddingScale: parsed.weddingScale,
      date: new Date(parsed.date),
      pricePerGuest: parsed.pricePerGuest,
      capacity: parsed.capacity,
      requiredGuests: parsed.requiredGuests,
      theme: parsed.theme,
      dressCode: parsed.dressCode,
      ethnicity: parsed.ethnicity,
      mainImageUrl: parsed.mainImageUrl,
      hostCoupleId: parsed.hostCoupleId,
      status: parsed.status as WeddingStatus,
      featured: parsed.featured,
      sponsored: parsed.sponsored,
      sponsorshipStart,
      sponsorshipEnd,
      slug,
      isDemo: parsed.isDemo || false,
    },
  });

  // Sync child records on create if provided
  if (Array.isArray(data.events) && data.events.length > 0) {
    await prisma.weddingEvent.createMany({
      data: data.events.map((evt: any) => ({
        weddingId: wedding.id,
        name: evt.name || evt.title || "Ceremony",
        description: evt.description || null,
        date: evt.date ? new Date(evt.date) : new Date(parsed.date),
        startTime: evt.startTime || "10:00",
        endTime: evt.endTime || "13:00",
        location: evt.location || parsed.location,
        dressCode: evt.dressCode || null,
      })),
    });
  }

  if (Array.isArray(data.traditions) && data.traditions.length > 0) {
    await prisma.weddingTradition.createMany({
      data: data.traditions.map((t: any) => ({
        weddingId: wedding.id,
        name: t.name || t.title || "Tradition",
        description: t.description || "",
      })),
    });
  }

  if (Array.isArray(data.gallery) && data.gallery.length > 0) {
    await prisma.weddingGallery.createMany({
      data: data.gallery.map((url: string, idx: number) => ({
        weddingId: wedding.id,
        imageUrl: url,
        order: idx,
      })),
    });
  }

  await createAuditLog("CREATE_WEDDING", "Wedding", wedding.id, `Admin (${admin.email}) created wedding: "${wedding.title}" (Tier: ${parsed.tier}, ${parsed.durationDays} Days, $${parsed.pricePerGuest}/guest)`);
  if (parsed.featured) {
    await createAuditLog("ADMIN_FEATURED_ENABLED", "Wedding", wedding.id, `Admin (${admin.email}) enabled featured on creation for "${wedding.title}"`);
  }
  if (parsed.sponsored) {
    await createAuditLog("ADMIN_SPONSORED_ENABLED", "Wedding", wedding.id, `Admin (${admin.email}) enabled sponsored on creation for "${wedding.title}"`);
  }
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/weddings");
  revalidatePath("/");
  return { success: true, wedding };
}

export async function adminUpdateWeddingAction(weddingId: string, data: any) {
  const { getCustomerPriceUSD, normalizeWeddingTier, normalizeDurationDays } = await import("../services/pricing-engine");
  const admin = await requireRole([UserRole.ADMIN]);
  const existing = await prisma.wedding.findUnique({
    where: { id: weddingId },
  });
  if (!existing) throw new Error("Wedding not found.");

  const tier = normalizeWeddingTier(data.tier || existing.tier || "STANDARD");
  const durationDays = normalizeDurationDays(parseInt(data.durationDays) || existing.durationDays || 3);
  const derivedPricePerGuest = getCustomerPriceUSD(tier, durationDays);

  const parsed = adminWeddingSchema.parse({
    ...data,
    tier,
    durationDays,
    ceremoniesCount: parseInt(data.ceremoniesCount) || existing.ceremoniesCount || 3,
    pricePerGuest: derivedPricePerGuest,
    capacity: parseInt(data.capacity),
    featured: data.featured === true || data.featured === "true",
    sponsored: data.sponsored === true || data.sponsored === "true",
    isDemo: data.isDemo === true || data.isDemo === "true" || existing.isDemo,
  });

  const sponsorshipStart = parsed.sponsorshipStart ? new Date(parsed.sponsorshipStart) : null;
  const sponsorshipEnd = parsed.sponsorshipEnd ? new Date(parsed.sponsorshipEnd) : null;

  const wedding = await prisma.wedding.update({
    where: { id: weddingId },
    data: {
      title: parsed.title,
      description: parsed.description,
      location: parsed.location,
      category: parsed.category,
      religion: parsed.religion,
      region: parsed.region !== undefined ? parsed.region : existing.region,
      community: parsed.community !== undefined ? parsed.community : existing.community,
      foodContext: parsed.foodContext !== undefined ? parsed.foodContext : existing.foodContext,
      dressExpectations: parsed.dressExpectations !== undefined ? parsed.dressExpectations : existing.dressExpectations,
      guestRules: parsed.guestRules !== undefined ? parsed.guestRules : existing.guestRules,
      etiquetteNotes: parsed.etiquetteNotes !== undefined ? parsed.etiquetteNotes : existing.etiquetteNotes,
      tier: parsed.tier,
      durationDays: parsed.durationDays,
      ceremoniesCount: parsed.ceremoniesCount,
      experienceIntensity: parsed.experienceIntensity,
      weddingScale: parsed.weddingScale,
      date: new Date(parsed.date),
      pricePerGuest: parsed.pricePerGuest,
      capacity: parsed.capacity,
      requiredGuests: parsed.requiredGuests,
      theme: parsed.theme,
      dressCode: parsed.dressCode,
      ethnicity: parsed.ethnicity,
      mainImageUrl: parsed.mainImageUrl,
      hostCoupleId: parsed.hostCoupleId,
      status: parsed.status as WeddingStatus,
      featured: parsed.featured,
      sponsored: parsed.sponsored,
      sponsorshipStart,
      sponsorshipEnd,
      isDemo: parsed.isDemo,
    },
  });

  // Sync child records if provided
  if (Array.isArray(data.events)) {
    await prisma.weddingEvent.deleteMany({ where: { weddingId } });
    if (data.events.length > 0) {
      await prisma.weddingEvent.createMany({
        data: data.events.map((evt: any) => ({
          weddingId,
          name: evt.name || evt.title || "Ceremony",
          description: evt.description || null,
          date: evt.date ? new Date(evt.date) : new Date(parsed.date),
          startTime: evt.startTime || "10:00",
          endTime: evt.endTime || "13:00",
          location: evt.location || parsed.location,
          dressCode: evt.dressCode || null,
        })),
      });
    }
  }

  if (Array.isArray(data.traditions)) {
    await prisma.weddingTradition.deleteMany({ where: { weddingId } });
    if (data.traditions.length > 0) {
      await prisma.weddingTradition.createMany({
        data: data.traditions.map((t: any) => ({
          weddingId,
          name: t.name || t.title || "Tradition",
          description: t.description || "",
        })),
      });
    }
  }

  if (Array.isArray(data.gallery)) {
    await prisma.weddingGallery.deleteMany({ where: { weddingId } });
    if (data.gallery.length > 0) {
      await prisma.weddingGallery.createMany({
        data: data.gallery.map((url: string, idx: number) => ({
          weddingId,
          imageUrl: url,
          order: idx,
        })),
      });
    }
  }

  // Track featured audit
  if (existing.featured !== parsed.featured) {
    const action = parsed.featured ? "ADMIN_FEATURED_ENABLED" : "ADMIN_FEATURED_DISABLED";
    await createAuditLog(
      action,
      "Wedding",
      wedding.id,
      `Admin (${admin.email}) changed featured from ${existing.featured} to ${parsed.featured} for "${wedding.title}".`
    );
  }

  // Track sponsored audit
  if (
    existing.sponsored !== parsed.sponsored ||
    existing.sponsorshipStart?.toISOString() !== sponsorshipStart?.toISOString() ||
    existing.sponsorshipEnd?.toISOString() !== sponsorshipEnd?.toISOString()
  ) {
    const action = parsed.sponsored !== existing.sponsored
      ? (parsed.sponsored ? "ADMIN_SPONSORED_ENABLED" : "ADMIN_SPONSORED_DISABLED")
      : "ADMIN_SPONSORSHIP_UPDATED";
    await createAuditLog(
      action,
      "Wedding",
      wedding.id,
      `Admin (${admin.email}) updated sponsorship for "${wedding.title}": sponsored=${parsed.sponsored} (prev=${existing.sponsored}), start=${sponsorshipStart?.toISOString() || "null"}, end=${sponsorshipEnd?.toISOString() || "null"}`
    );
  }

  await createAuditLog("UPDATE_WEDDING", "Wedding", wedding.id, `Updated wedding details for: "${wedding.title}" (Tier: ${parsed.tier}, Duration: ${parsed.durationDays}d, Price: $${parsed.pricePerGuest})`);
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath(`/weddings/${wedding.slug}`);
  revalidatePath("/weddings");
  revalidatePath("/weddings/map");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");
  return { success: true, wedding };
}

export async function adminDeleteWeddingAction(weddingId: string) {
  const admin = await requireRole([UserRole.ADMIN]);
  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: { bookings: true }
  });
  if (!wedding) throw new Error("Wedding not found.");

  if (wedding.bookings && wedding.bookings.length > 0) {
    await prisma.wedding.update({
      where: { id: weddingId },
      data: {
        status: WeddingStatus.DRAFT,
        deletedAt: new Date(),
        suspended: true,
      }
    });
  } else {
    await prisma.wedding.delete({
      where: { id: weddingId },
    });
  }

  await createAuditLog("DELETE_WEDDING", "Wedding", weddingId, `Admin (${admin.email}) deleted/archived wedding: "${wedding.title}"`);
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/weddings");
  revalidatePath("/weddings/map");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");
  return { success: true };
}

export async function adminToggleWeddingStatusAction(weddingId: string, status: any) {
  const admin = await requireRole([UserRole.ADMIN]);
  const updated = await prisma.wedding.update({
    where: { id: weddingId },
    data: { status },
  });

  await createAuditLog("TOGGLE_WEDDING_STATUS", "Wedding", weddingId, `Admin (${admin.email}) changed status of "${updated.title}" to ${status}`);
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/weddings");
  revalidatePath("/weddings/map");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");
  return { success: true };
}

export async function adminToggleWeddingFeaturedAction(weddingId: string, featured: boolean) {
  const admin = await requireRole([UserRole.ADMIN]);
  const existing = await prisma.wedding.findUnique({ where: { id: weddingId }, select: { id: true, title: true, featured: true } });
  if (!existing) throw new Error("Wedding not found.");

  const updated = await prisma.wedding.update({
    where: { id: weddingId },
    data: { featured },
  });

  const action = featured ? "ADMIN_FEATURED_ENABLED" : "ADMIN_FEATURED_DISABLED";
  await createAuditLog(
    action,
    "Wedding",
    weddingId,
    `Admin (${admin.email}) set featured flag for "${updated.title}" from ${existing.featured} to ${featured}`
  );
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/weddings");
  revalidatePath("/weddings/map");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");
  return { success: true, wedding: updated };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. User Management
// ─────────────────────────────────────────────────────────────────────────────

const PROTECTED_FOUNDER_EMAIL = "founder@weddingwithindia.com";

export async function adminGetUsersAction() {
  await requireRole([UserRole.ADMIN]);
  return await prisma.user.findMany({
    include: {
      travelerProfile: true,
      coupleProfile: true,
      agentProfile: true,
      verification: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminUpdateUserRoleAction(userId: string, role: UserRole) {
  const admin = await requireRole([UserRole.ADMIN]);

  // Prevent self-role modification
  if (userId === admin.id) {
    throw new Error("Cannot change your own role settings.");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error("User not found.");

  // Protect founder email
  if (targetUser.email === PROTECTED_FOUNDER_EMAIL && role !== UserRole.ADMIN) {
    throw new Error("Cannot modify the role of the primary system founder account.");
  }

  // Prevent removing the last active administrator
  if (targetUser.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });
    if (adminCount <= 1) {
      throw new Error("Cannot demote the last active administrator account.");
    }
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

export async function adminUpdateUserStatusAction(
  userId: string,
  status: "ACTIVE" | "ONBOARDING" | "SUSPENDED" | "BANNED",
  reason?: string
) {
  const admin = await requireRole([UserRole.ADMIN]);

  if (userId === admin.id) {
    throw new Error("Cannot change your own account status.");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error("User not found.");

  if (targetUser.email === PROTECTED_FOUNDER_EMAIL && status !== "ACTIVE") {
    throw new Error("Cannot suspend or ban the primary system founder account.");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: status as any },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: "Account Status Updated",
      message: reason || `Your account status has been updated to ${status}.`,
      type: status === "ACTIVE" ? "SUCCESS" : "ALERT",
    },
  });

  await createAuditLog(
    "UPDATE_USER_STATUS",
    "User",
    userId,
    `Admin ${admin.email} updated user ${updated.email} status to ${status}. Reason: "${reason || 'N/A'}"`
  );

  revalidatePath("/dashboard/admin/users");
  return { success: true, user: updated };
}

export async function adminInviteUserAction(email: string, role: UserRole, name?: string) {
  const admin = await requireRole([UserRole.ADMIN]);
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("A valid email address is required for admin invitation.");
  }

  let user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  if (user) {
    // User already exists; grant assigned role
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role },
    });
  } else {
    // Pre-provision user account for Clerk authentication sync
    const tempClerkId = `invited_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    user = await prisma.user.create({
      data: {
        clerkUserId: tempClerkId,
        email: cleanEmail,
        name: name || cleanEmail.split("@")[0],
        role,
        status: "ONBOARDING",
      },
    });

    if (role === UserRole.TRAVELER) {
      await prisma.travelerProfile.create({
        data: {
          userId: user.id,
          fullName: user.name || "New Traveler",
          country: "United States",
          language: "English",
        },
      });
    } else if (role === UserRole.COUPLE) {
      await prisma.coupleProfile.create({
        data: {
          userId: user.id,
          expectedGuests: 200,
          familyBio: "Hosted Couple",
        },
      });
    } else if (role === UserRole.AGENT) {
      const { generateReferralCode } = require("./referrals");
      const refCode = await generateReferralCode(user.name || "AGENT");
      await prisma.agentProfile.create({
        data: {
          userId: user.id,
          organization: "Pre-provisioned Agent",
          country: "India",
          referralCode: refCode,
        },
      });
    }
  }

  await createAuditLog(
    "INVITE_USER",
    "User",
    user.id,
    `Admin ${admin.email} invited user ${cleanEmail} with role ${role}`
  );

  revalidatePath("/dashboard/admin/users");
  return { success: true, user };
}

export async function adminDeleteUserAction(userId: string) {
  const admin = await requireRole([UserRole.ADMIN]);
  if (userId === admin.id) {
    throw new Error("Cannot delete your own admin account.");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error("User not found.");

  if (targetUser.email === PROTECTED_FOUNDER_EMAIL) {
    throw new Error("Cannot delete the primary system founder account.");
  }

  if (targetUser.role === UserRole.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });
    if (adminCount <= 1) {
      throw new Error("Cannot delete the last remaining administrator account.");
    }
  }

  const deleted = await prisma.user.delete({
    where: { id: userId },
  });

  await createAuditLog("DELETE_USER", "User", userId, `Deleted user account: ${deleted.email}`);
  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function adminGlobalSearchAction(query: string) {
  await requireRole([UserRole.ADMIN]);
  const term = query.trim().toLowerCase();
  if (!term || term.length < 2) return { results: [] };

  const [users, weddings, bookings, safetyCases] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, name: true, email: true, role: true, status: true },
    }),
    prisma.wedding.findMany({
      where: {
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { location: { contains: term, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, title: true, location: true, status: true, slug: true },
    }),
    prisma.booking.findMany({
      where: {
        OR: [
          { id: { contains: term, mode: "insensitive" } },
          { traveler: { fullName: { contains: term, mode: "insensitive" } } },
        ],
      },
      take: 5,
      select: { id: true, status: true, totalAmount: true, traveler: { select: { fullName: true } }, wedding: { select: { title: true } } },
    }),
    prisma.safetyCase.findMany({
      where: {
        OR: [
          { caseNumber: { contains: term, mode: "insensitive" } },
          { title: { contains: term, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, caseNumber: true, title: true, status: true, severity: true },
    }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      title: u.name || u.email,
      subtitle: `${u.role} · ${u.email}`,
      type: "User",
      url: `/dashboard/admin/users?search=${encodeURIComponent(u.email)}`,
    })),
    weddings: weddings.map((w) => ({
      id: w.id,
      title: w.title,
      subtitle: `${w.location} · ${w.status}`,
      type: "Wedding",
      url: `/dashboard/admin/hosts/${w.id}`,
    })),
    bookings: bookings.map((b) => ({
      id: b.id,
      title: `Booking #${b.id.slice(-6).toUpperCase()} — ${b.wedding?.title}`,
      subtitle: `Guest: ${b.traveler?.fullName} · Status: ${b.status}`,
      type: "Booking",
      url: `/dashboard/admin/bookings?search=${b.id}`,
    })),
    safetyCases: safetyCases.map((s) => ({
      id: s.id,
      title: `${s.caseNumber}: ${s.title}`,
      subtitle: `Severity: ${s.severity} · Status: ${s.status}`,
      type: "SafetyCase",
      url: `/dashboard/admin/safety/${s.id}`,
    })),
  };
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

/**
 * Admin-controlled verification request gate.
 * Admin must explicitly request a user's verification before the user can upload KYC documents.
 * This creates a Verification record with PENDING status (or updates NOT_SUBMITTED → PENDING).
 * The `requiredDocuments` note tells the user exactly which documents to upload.
 */
export async function adminRequestVerificationAction(
  userId: string,
  requiredDocuments: string,
  adminNotes?: string
) {
  const admin = await requireRole([UserRole.ADMIN]);

  // Prevent admin from acting on themselves for verification purposes
  if (userId === admin.id) {
    throw new Error("Forbidden: Admins cannot request verification on themselves.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { verification: true },
  });

  if (!targetUser) {
    throw new Error("User not found.");
  }

  // Upsert: create if none exists, or update if still NOT_SUBMITTED
  const existing = targetUser.verification;
  let verification;

  if (!existing) {
    verification = await prisma.verification.create({
      data: {
        userId,
        status: VerificationStatus.PENDING,
        notes: `[VERIFICATION REQUESTED]\nRequired: ${requiredDocuments}${adminNotes ? `\n\nAdmin notes: ${adminNotes}` : ""}`,
        submissionDate: null, // not yet submitted by user
      },
    });
  } else if (
    existing.status === VerificationStatus.NOT_SUBMITTED ||
    existing.status === VerificationStatus.NEED_MORE_DOCUMENTS
  ) {
    verification = await prisma.verification.update({
      where: { userId },
      data: {
        status: VerificationStatus.PENDING,
        notes: `[VERIFICATION REQUESTED]\nRequired: ${requiredDocuments}${adminNotes ? `\n\nAdmin notes: ${adminNotes}` : ""}`,
        submissionDate: null,
      },
    });
  } else {
    throw new Error(
      `Cannot request verification: current status is ${existing.status}. ` +
      "Use the review action to change status from an active verification state."
    );
  }

  // Notify the user
  await prisma.notification.create({
    data: {
      userId,
      title: "Verification Documents Requested",
      message: `Our trust team has reviewed your application and is requesting the following documents: ${requiredDocuments}. Please log in to your dashboard to upload them.`,
      type: "REQUEST",
    },
  });

  await createAuditLog(
    "REQUEST_VERIFICATION",
    "Verification",
    verification.id,
    `Admin requested verification for user ${targetUser.email}. Required: ${requiredDocuments}`
  );

  revalidatePath("/dashboard/admin/verifications");
  revalidatePath("/dashboard/admin/users");
  return { success: true, verificationId: verification.id };
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
      expiryDate: status === VerificationStatus.APPROVED ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
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
  let notifyTitle = "Verification Status Update";
  let notifyMessage = notes || "Your verification status has been updated.";
  let notifyType: any = "INFO";

  if (status === VerificationStatus.APPROVED) {
    notifyTitle = "Profile Verified!";
    notifyMessage = "Your identity verification checks passed! A trust badge has been linked to your profile.";
    notifyType = "SUCCESS";
  } else if (status === VerificationStatus.REJECTED) {
    notifyTitle = "Verification Request Declined";
    notifyMessage = `Your trust verification request was declined. Notes: ${notes || "Invalid/blurred docs."}`;
    notifyType = "ALERT";
  } else if (status === VerificationStatus.NEED_MORE_DOCUMENTS) {
    notifyTitle = "Action Required: Additional Verification Documents Requested";
    notifyMessage = `Our trust team needs additional documents or clearer scans. Notes: ${notes || "Please re-upload clearer files."}`;
    notifyType = "ALERT";
  } else if (status === VerificationStatus.UNDER_REVIEW) {
    notifyTitle = "Verification Under Review";
    notifyMessage = `Your verification documents are currently being audited by our trust & safety team.`;
    notifyType = "INFO";
  }

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
    } else if (status === VerificationStatus.NEED_MORE_DOCUMENTS) {
      await sendVerificationRejectedEmail(updated.user.email, userName, `Additional Documents Required: ${notes || "Please log into your dashboard to update your files."}`);
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

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { traveler: true, wedding: true },
    });

    if (!booking) throw new Error("Booking not found.");

    // If transitioning from a non-capacity-holding status to a capacity-holding status, enforce capacity limit
    if (
      CAPACITY_HOLDING_BOOKING_STATUSES.includes(status) &&
      !CAPACITY_HOLDING_BOOKING_STATUSES.includes(booking.status)
    ) {
      await tx.$queryRaw`SELECT id FROM "Wedding" WHERE id = ${booking.weddingId} FOR UPDATE`;

      const currentHeld = await tx.booking.aggregate({
        where: {
          weddingId: booking.weddingId,
          status: { in: CAPACITY_HOLDING_BOOKING_STATUSES },
          id: { not: booking.id },
        },
        _sum: { guestsCount: true },
      });
      const currentBookedCount = currentHeld._sum.guestsCount || 0;
      if (currentBookedCount + booking.guestsCount > booking.wedding.capacity) {
        throw new Error(
          `Cannot override booking status: wedding capacity exceeded. Available spots: ${
            booking.wedding.capacity - currentBookedCount
          }.`
        );
      }
    }

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // Invalidate active guest passes if booking is cancelled, rejected, or refunded
    if (
      status === BookingStatus.CANCELLED ||
      status === BookingStatus.REJECTED ||
      status === BookingStatus.REFUNDED
    ) {
      await tx.guestPass.updateMany({
        where: { bookingId, status: "ACTIVE" },
        data: { status: "REVOKED" },
      });
    }

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

  const escapeCsv = (value: unknown) => {
    if (value === null || value === undefined) return '""';
    let str = String(value);
    const trimmed = str.trimStart();
    const dangerousChars = ["=", "+", "-", "@", "\t", "\r"];
    if (
      dangerousChars.some((ch) => str.startsWith(ch)) ||
      (trimmed.length > 0 && dangerousChars.some((ch) => trimmed.startsWith(ch)))
    ) {
      str = `'${str}`;
    }
    return `"${str.replace(/"/g, '""')}"`;
  };

  const header = "Booking ID,Traveler Name,Wedding,Date,Guests,Amount,Status\n";
  const rows = bookings
    .map((b) =>
      [
        b.id,
        b.traveler.fullName,
        b.wedding.title,
        b.date.toISOString().split("T")[0],
        b.guestsCount,
        b.totalAmount,
        b.status,
      ]
        .map(escapeCsv)
        .join(",")
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

  const webhookEvents = await prisma.stripeWebhookEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    transactions: JSON.parse(JSON.stringify(transactions)),
    refundQueue: JSON.parse(JSON.stringify(refundQueue)),
    payoutQueue: JSON.parse(JSON.stringify(payoutQueue)),
    webhookEvents: JSON.parse(JSON.stringify(webhookEvents)),
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
    const crypto = require('crypto');
    const randomSuffix = crypto.randomBytes(2).readUInt16LE(0) % 1000;
    slug = `${slug}-${randomSuffix}`;
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

const heroContentSchema = z.object({
  title: z.string().min(5),
  subtitle: z.string().min(10),
  buttonText: z.string().default("Explore Celebrations"),
  buttonLink: z.string().default("/explore"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export async function adminUpsertHeroContentAction(heroId: string | null, data: any) {
  await requireRole([UserRole.ADMIN]);
  const parsed = heroContentSchema.parse({
    ...data,
    active: !!data.active,
  });

  let hero;
  if (heroId) {
    hero = await prisma.heroContent.update({
      where: { id: heroId },
      data: parsed,
    });
    await createAuditLog("UPDATE_HERO_CONTENT", "HeroContent", hero.id, `Updated homepage hero slide: "${hero.title}"`);
  } else {
    hero = await prisma.heroContent.create({
      data: parsed,
    });
    await createAuditLog("CREATE_HERO_CONTENT", "HeroContent", hero.id, `Created homepage hero slide: "${hero.title}"`);
  }

  revalidatePath("/");
  revalidatePath("/dashboard/admin/cms");
  return { success: true, hero };
}

export async function adminDeleteHeroContentAction(heroId: string) {
  await requireRole([UserRole.ADMIN]);
  const deleted = await prisma.heroContent.delete({
    where: { id: heroId },
  });

  await createAuditLog("DELETE_HERO_CONTENT", "HeroContent", heroId, `Deleted hero slide: "${deleted.title}"`);
  revalidatePath("/");
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
  const _admin = await requireRole([UserRole.ADMIN]);

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

  const payoutReference = `PAYOUT-HOST-${Date.now()}`;

  const { getHostPayoutPerGuestINR, normalizeWeddingTier, normalizeDurationDays } = require("../services/pricing-engine");
  const booking = payment.booking;
  const tier = normalizeWeddingTier(booking.weddingTier || booking.wedding?.tier || "STANDARD");
  const duration = normalizeDurationDays(booking.durationDays || booking.wedding?.durationDays || 3);
  const hostRatePerGuestINR = booking.hostPayoutPerGuestINR || getHostPayoutPerGuestINR(tier, duration);
  const eligibleGuests = booking.eligibleInternationalGuestCount || booking.guestsCount || 1;
  const hostPayoutAmountINR = booking.totalHostPayoutINR || (hostRatePerGuestINR * eligibleGuests);

  const payout = await prisma.payout.create({
    data: {
      paymentId,
      amount: hostPayoutAmountINR,
      status: "CLEARED",
      stripeTransferId: payoutReference,
    },
  });

  // Mark host payout transferred flag on payment
  await prisma.payment.update({
    where: { id: paymentId },
    data: { hostPayoutTransferred: true },
  });

  await createAuditLog(
    "PROCESS_PAYOUT",
    "Payout",
    payout.id,
    `Admin processed fixed host payout of ₹${hostPayoutAmountINR.toLocaleString("en-IN")} INR for payment ${paymentId} (Booking ${booking.id})`
  );

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

// ─────────────────────────────────────────────────────────────────────────────
// WEDDING DISCOVERY CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

// Accepts both standard UUIDs (dynamically registered weddings) and short string IDs
// (e.g. 'w1'–'w23' for seeded showcase listings). Authorization is enforced by
// requireRole and per-record ownership checks — NOT by ID format.
const weddingDiscoveryUpdateSchema = z.object({
  weddingId: z.string().min(1, "Wedding ID required").max(100, "Wedding ID too long"),
});

export async function adminToggleSponsoredAction(
  weddingId: string,
  isSponsored: boolean,
  sponsorshipStart?: Date | string | null,
  sponsorshipEnd?: Date | string | null
) {
  const admin = await requireRole([UserRole.ADMIN]);

  const { weddingId: validId } = weddingDiscoveryUpdateSchema.parse({ weddingId });

  const wedding = await prisma.wedding.findUnique({
    where: { id: validId },
    select: { id: true, title: true, sponsored: true, sponsorshipStart: true, sponsorshipEnd: true }
  });
  if (!wedding) throw new Error("Wedding not found.");

  const start = sponsorshipStart ? new Date(sponsorshipStart) : (isSponsored ? (wedding.sponsorshipStart || new Date()) : null);
  const end = sponsorshipEnd ? new Date(sponsorshipEnd) : (isSponsored ? wedding.sponsorshipEnd : null);

  if (isSponsored && start && end && end <= start) {
    throw new Error("Sponsorship end date must be after the start date.");
  }

  const updated = await prisma.wedding.update({
    where: { id: validId },
    data: {
      sponsored: isSponsored,
      sponsorshipStart: isSponsored ? start : null,
      sponsorshipEnd: isSponsored ? end : null,
    },
  });

  const action = isSponsored ? "ADMIN_SPONSORED_ENABLED" : "ADMIN_SPONSORED_DISABLED";
  await createAuditLog(
    action,
    "Wedding",
    validId,
    `Admin (${admin.email}) ${isSponsored ? "enabled" : "disabled"} sponsored status for wedding: "${wedding.title}" (prev=${wedding.sponsored}, start=${start?.toISOString() || "null"}, end=${end?.toISOString() || "null"})`
  );

  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/weddings");
  revalidatePath("/weddings/map");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");
  return { success: true, wedding: updated };
}

export async function adminUpdateSponsorshipDatesAction(
  weddingId: string,
  sponsorshipStart: Date | string | null,
  sponsorshipEnd: Date | string | null
) {
  const admin = await requireRole([UserRole.ADMIN]);
  const { weddingId: validId } = weddingDiscoveryUpdateSchema.parse({ weddingId });

  const wedding = await prisma.wedding.findUnique({
    where: { id: validId },
    select: { id: true, title: true, sponsored: true, sponsorshipStart: true, sponsorshipEnd: true }
  });
  if (!wedding) throw new Error("Wedding not found.");

  const start = sponsorshipStart ? new Date(sponsorshipStart) : null;
  const end = sponsorshipEnd ? new Date(sponsorshipEnd) : null;

  if (start && end && end <= start) {
    throw new Error("Sponsorship end date must be after the start date.");
  }

  const updated = await prisma.wedding.update({
    where: { id: validId },
    data: {
      sponsorshipStart: start,
      sponsorshipEnd: end,
    },
  });

  await createAuditLog(
    "ADMIN_SPONSORSHIP_UPDATED",
    "Wedding",
    validId,
    `Admin (${admin.email}) updated sponsorship schedule for "${wedding.title}": start=${start?.toISOString() || "null"}, end=${end?.toISOString() || "null"}`
  );

  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/dashboard/admin/weddings/sponsorship");
  revalidatePath("/weddings");
  revalidatePath("/weddings/map");
  revalidatePath("/");
  revalidateTag("weddings", "max");
  revalidateTag("homepage", "max");
  return { success: true, wedding: updated };
}

export async function adminToggleFeaturedAction(weddingId: string, isFeatured: boolean) {
  return await adminToggleWeddingFeaturedAction(weddingId, isFeatured);
}

export async function adminSetTrendingBoostAction(weddingId: string, boostScore: number) {
  await requireRole([UserRole.ADMIN]);

  const { weddingId: validId } = weddingDiscoveryUpdateSchema.parse({ weddingId });
  const clampedBoost = Math.max(0.0, Math.min(5.0, Number(boostScore)));

  const wedding = await prisma.wedding.findUnique({ where: { id: validId }, select: { id: true, title: true } });
  if (!wedding) throw new Error("Wedding not found.");

  const updated = await prisma.wedding.update({
    where: { id: validId },
    data: { manualTrendingBoost: clampedBoost },
  });

  await createAuditLog(
    "WEDDING_TRENDING_BOOST_SET",
    "Wedding",
    validId,
    `Admin set manualTrendingBoost to ${clampedBoost} for wedding: "${wedding.title}"`
  );

  revalidatePath("/weddings");
  revalidatePath("/");
  return { success: true, wedding: updated };
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Host Application Management & Review
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetHostApplicationsAction() {
  await requireRole([UserRole.ADMIN]);

  // Fetch legacy weddings
  const weddings = await prisma.wedding.findMany({
    include: {
      hostCouple: {
        include: {
          user: {
            include: {
              verification: true,
            },
          },
        },
      },
      gallery: true,
      events: true,
      traditions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  let hostApps: any[] = [];
  if (prisma.hostApplication) {
    try {
      hostApps = await prisma.hostApplication.findMany({
        include: {
          days: {
            include: { events: true },
            orderBy: { dayNumber: "asc" },
          },
          documentRequests: {
            include: { documents: true },
            orderBy: { requestedAt: "desc" },
          },
          documents: true,
          wedding: true,
          user: {
            include: { verification: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    } catch {
      hostApps = [];
    }
  }

  return {
    hostApps: JSON.parse(JSON.stringify(hostApps)),
    weddings: JSON.parse(JSON.stringify(weddings)),
  };
}

export async function adminGetHostApplicationByIdAction(id: string) {
  await requireRole([UserRole.ADMIN]);

  const includeConfig = {
    days: {
      include: { events: true },
      orderBy: { dayNumber: "asc" as const },
    },
    documentRequests: {
      include: { documents: true },
      orderBy: { requestedAt: "desc" as const },
    },
    documents: true,
    auditLogs: { orderBy: { createdAt: "desc" as const } },
    wedding: {
      include: {
        bookings: {
          include: {
            traveler: { include: { user: true } },
            payments: true,
          },
        },
        sponsorshipRequests: {
          orderBy: { requestedAt: "desc" as const },
        },
      },
    },
    user: {
      include: {
        verification: true,
        travelerProfile: true,
        agentProfile: true,
      },
    },
  };

  // 1. Query HostApplication by ID or by weddingId/coupleProfileId/userId
  let hostApp: any = null;
  if (prisma.hostApplication) {
    try {
      hostApp = await prisma.hostApplication.findUnique({
        where: { id },
        include: includeConfig,
      });

      if (!hostApp) {
        hostApp = await prisma.hostApplication.findFirst({
          where: {
            OR: [
              { weddingId: id },
              { coupleProfileId: id },
              { userId: id },
            ],
          },
          include: includeConfig,
          orderBy: { updatedAt: "desc" },
        });
      }
    } catch {
      hostApp = null;
    }
  }

  if (hostApp) {
    const combined: any = hostApp.wedding ? { ...hostApp.wedding, ...hostApp } : { ...hostApp };
    combined.isHostApp = true;
    combined.hostApp = hostApp;
    combined.wedding = hostApp.wedding;
    return JSON.parse(JSON.stringify(combined));
  }

  // 2. Legacy fallback: Query Wedding by ID or hostCoupleId
  let wedding: any = await prisma.wedding.findUnique({
    where: { id },
    include: {
      hostCouple: {
        include: {
          user: {
            include: {
              verification: true,
              travelerProfile: true,
              agentProfile: true,
            },
          },
        },
      },
      gallery: true,
      events: true,
      traditions: true,
      sponsorshipRequests: {
        orderBy: { requestedAt: "desc" },
      },
      bookings: {
        include: {
          traveler: { include: { user: true } },
          payments: true,
        },
      },
    },
  });

  if (!wedding) {
    wedding = await prisma.wedding.findFirst({
      where: { hostCoupleId: id },
      include: {
        hostCouple: {
          include: {
            user: {
              include: {
                verification: true,
                travelerProfile: true,
                agentProfile: true,
              },
            },
          },
        },
        gallery: true,
        events: true,
        traditions: true,
        bookings: {
          include: {
            traveler: { include: { user: true } },
            payments: true,
          },
        },
      },
    });
  }

  if (wedding) {
    wedding.isHostApp = false;
    wedding.hostApp = null;
    wedding.wedding = wedding;
  }

  return wedding;
}

export async function adminCreateDocumentRequestAction(data: {
  applicationId: string;
  requestType: string;
  title: string;
  description: string;
  isRequired?: boolean;
  deadline?: string;
}) {
  const admin = await requireRole([UserRole.ADMIN]);

  let hostApp = await prisma.hostApplication.findUnique({
    where: { id: data.applicationId },
  });

  if (!hostApp) {
    hostApp = await prisma.hostApplication.findFirst({
      where: { weddingId: data.applicationId },
    });
  }

  if (!hostApp) {
    const legacyWedding = await prisma.wedding.findUnique({
      where: { id: data.applicationId },
      include: { hostCouple: { include: { user: true } } },
    });

    if (!legacyWedding || !legacyWedding.hostCouple) {
      throw new Error("Host application not found.");
    }

    hostApp = await prisma.hostApplication.create({
      data: {
        id: legacyWedding.id,
        userId: legacyWedding.hostCouple.userId,
        coupleProfileId: legacyWedding.hostCoupleId,
        weddingId: legacyWedding.id,
        status: "ACTION_REQUIRED",
        hostName: legacyWedding.hostCouple.user?.name || legacyWedding.title,
        email: legacyWedding.hostCouple.user?.email || "host@example.com",
        coupleNames: legacyWedding.title,
        city: legacyWedding.location.split(",")[0]?.trim() || "City",
        weddingDate: legacyWedding.date,
        durationDays: legacyWedding.durationDays || 3,
        requestedTier: legacyWedding.tier || "ROYAL",
      },
    });
  }

  const docReq = await prisma.$transaction(async (tx) => {
    const createdReq = await tx.hostDocumentRequest.create({
      data: {
        applicationId: hostApp.id,
        userId: hostApp.userId,
        requestType: data.requestType || "OTHER",
        title: data.title,
        description: data.description,
        isRequired: data.isRequired ?? true,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: "PENDING",
        requestedBy: admin.name || admin.email,
      },
    });

    await tx.hostApplication.update({
      where: { id: hostApp.id },
      data: {
        status: "ACTION_REQUIRED",
        adminNotesHostFacing: `Document requested: ${data.title}`,
      },
    });

    await tx.verification.upsert({
      where: { userId: hostApp.userId },
      create: {
        userId: hostApp.userId,
        status: VerificationStatus.NEED_MORE_DOCUMENTS,
        notes: `Additional document requested: ${data.title}. ${data.description}`,
        reviewedBy: admin.name || admin.email,
      },
      update: {
        status: VerificationStatus.NEED_MORE_DOCUMENTS,
        notes: `Additional document requested: ${data.title}. ${data.description}`,
        reviewedBy: admin.name || admin.email,
      },
    });

    await tx.notification.create({
      data: {
        userId: hostApp.userId,
        title: "Action Required: Document Requested",
        message: `WeddingWithIndia verification team requested: "${data.title}". Please upload the requested file.`,
        type: "ALERT",
      },
    });

    await tx.hostApplicationAuditLog.create({
      data: {
        applicationId: hostApp.id,
        action: "DOCUMENT_REQUESTED",
        actorId: admin.id,
        actorRole: "ADMIN",
        details: `Admin requested document "${data.title}" (Type: ${data.requestType}).`,
      },
    });

    return createdReq;
  }, { timeout: 30000, maxWait: 10000 });

  try {
    revalidatePath("/dashboard/admin/hosts");
    revalidatePath(`/dashboard/admin/hosts/${hostApp.id}`);
    revalidatePath("/dashboard");
    revalidatePath("/list-wedding");
  } catch {}

  return { success: true, documentRequest: docReq };
}

export async function adminReviewDocumentAction(data: {
  documentId: string;
  status: "APPROVED" | "REJECTED";
  adminFeedback?: string;
}) {
  const admin = await requireRole([UserRole.ADMIN]);

  const doc = await prisma.hostDocument.findUnique({
    where: { id: data.documentId },
    include: { request: true, application: true },
  });

  if (!doc) throw new Error("Document record not found.");

  const updatedDoc = await prisma.$transaction(async (tx) => {
    const updated = await tx.hostDocument.update({
      where: { id: data.documentId },
      data: {
        status: data.status,
        adminFeedback: data.adminFeedback || null,
      },
    });

    if (data.status === "APPROVED") {
      await tx.hostDocumentRequest.update({
        where: { id: doc.requestId },
        data: {
          status: "APPROVED",
          reviewedBy: admin.name || admin.email,
          reviewedAt: new Date(),
          reviewNotes: data.adminFeedback || "Approved by admin",
        },
      });
    } else {
      // Rejection: reset request to PENDING and set application & verification status back to ACTION_REQUIRED / NEED_MORE_DOCUMENTS
      await tx.hostDocumentRequest.update({
        where: { id: doc.requestId },
        data: {
          status: "PENDING",
          reviewedBy: admin.name || admin.email,
          reviewedAt: new Date(),
          reviewNotes: data.adminFeedback || "Document rejected. Please re-upload.",
        },
      });

      await tx.hostApplication.update({
        where: { id: doc.applicationId },
        data: {
          status: "ACTION_REQUIRED",
          adminNotesHostFacing: `Document revision requested: ${data.adminFeedback || "Please re-upload a clear copy."}`,
        },
      });

      await tx.verification.upsert({
        where: { userId: doc.userId },
        create: {
          userId: doc.userId,
          status: VerificationStatus.NEED_MORE_DOCUMENTS,
          notes: `Document '${doc.fileName}' rejected: ${data.adminFeedback || "Please re-upload a clear copy."}`,
          reviewedBy: admin.name || admin.email,
        },
        update: {
          status: VerificationStatus.NEED_MORE_DOCUMENTS,
          notes: `Document '${doc.fileName}' rejected: ${data.adminFeedback || "Please re-upload a clear copy."}`,
          reviewedBy: admin.name || admin.email,
        },
      });

      await tx.notification.create({
        data: {
          userId: doc.userId,
          title: "Document Needs Revision",
          message: `Uploaded file '${doc.fileName}' was not accepted. Feedback: ${data.adminFeedback || "Please upload a clearer copy."}`,
          type: "ALERT",
        },
      });
    }

    await tx.hostApplicationAuditLog.create({
      data: {
        applicationId: doc.applicationId,
        action: data.status === "APPROVED" ? "DOCUMENT_APPROVED" : "DOCUMENT_REJECTED",
        actorId: admin.id,
        actorRole: "ADMIN",
        details: `Admin ${data.status.toLowerCase()} document '${doc.fileName}'. Feedback: "${data.adminFeedback || "N/A"}"`,
      },
    });

    return updated;
  }, { timeout: 30000, maxWait: 10000 });

  try {
    revalidatePath("/dashboard/admin/hosts");
    revalidatePath(`/dashboard/admin/hosts/${doc.applicationId}`);
    revalidatePath("/dashboard");
    revalidatePath("/list-wedding");
  } catch {}

  return { success: true, document: updatedDoc };
}

export async function adminVerifyHostApplicationAction(data: {
  applicationId: string;
  verifiedTier: string;
  verifiedDurationDays: number;
  status: "APPROVED_FOR_LISTING" | "VERIFIED" | "ACTION_REQUIRED" | "REJECTED" | "UNDER_REVIEW";
  adminNotesInternal?: string;
  adminNotesHostFacing?: string;
  publishImmediately?: boolean;
}) {
  const admin = await requireRole([UserRole.ADMIN]);
  const { getCustomerPriceUSD, normalizeWeddingTier, normalizeDurationDays } = await import("../services/pricing-engine");

  const tier = normalizeWeddingTier(data.verifiedTier);
  const duration = normalizeDurationDays(data.verifiedDurationDays);
  const customerPriceUSD = getCustomerPriceUSD(tier, duration);

  const hostApp = await prisma.hostApplication.findUnique({
    where: { id: data.applicationId },
    include: {
      days: { include: { events: true }, orderBy: { dayNumber: "asc" } },
      coupleProfile: true,
      user: true,
      wedding: true,
    },
  });

  if (!hostApp) {
    const legacyWedding = await prisma.wedding.findUnique({
      where: { id: data.applicationId },
      include: {
        hostCouple: { include: { user: true } },
        events: true,
        traditions: true,
      },
    });

    if (!legacyWedding) {
      throw new Error("Host application not found.");
    }

    const legacyReviewStatus = data.status === "APPROVED_FOR_LISTING" ? "APPROVED" : data.status === "REJECTED" ? "REJECTED" : data.status === "ACTION_REQUIRED" ? "NEED_MORE_DOCUMENTS" : "UNDER_REVIEW";
    return await adminReviewHostApplicationAction(legacyWedding.id, legacyReviewStatus as any, data.adminNotesHostFacing || data.adminNotesInternal);
  }

  const isApproved = data.status === "APPROVED_FOR_LISTING" || (data.publishImmediately && data.status === "VERIFIED");
  const targetWeddingStatus = isApproved ? WeddingStatus.PUBLISHED : WeddingStatus.DRAFT;
  const targetVerifStatus = isApproved
    ? VerificationStatus.APPROVED
    : data.status === "REJECTED"
    ? VerificationStatus.REJECTED
    : data.status === "ACTION_REQUIRED"
    ? VerificationStatus.NEED_MORE_DOCUMENTS
    : VerificationStatus.UNDER_REVIEW;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Ensure CoupleProfile exists
    let coupleProfileId = hostApp.coupleProfileId;
    if (!coupleProfileId) {
      let cp = await tx.coupleProfile.findUnique({
        where: { userId: hostApp.userId },
      });
      if (!cp) {
        cp = await tx.coupleProfile.create({
          data: {
            userId: hostApp.userId,
            weddingDate: hostApp.weddingDate,
            weddingLocation: `${hostApp.venueName || hostApp.city}, ${hostApp.city}, ${hostApp.state || ""}`.trim(),
            expectedGuests: hostApp.expectedTotalGuests || 200,
            familyBio: hostApp.story || "",
          },
        });
      }
      coupleProfileId = cp.id;
    }

    // 2. Resolve or create Wedding record
    let weddingRecord = hostApp.wedding;
    const weddingTitle = `${hostApp.coupleNames} Wedding`;
    const venueLoc = `${hostApp.venueName || hostApp.city}, ${hostApp.city}, ${hostApp.state || ""}`.trim();

    if (!weddingRecord && coupleProfileId) {
      weddingRecord = await tx.wedding.findFirst({
        where: { hostCoupleId: coupleProfileId, isDemo: false, deletedAt: null },
      });
    }

    if (weddingRecord) {
      weddingRecord = await tx.wedding.update({
        where: { id: weddingRecord.id },
        data: {
          title: weddingTitle,
          location: venueLoc,
          tier,
          durationDays: duration,
          pricePerGuest: customerPriceUSD,
          capacity: hostApp.expectedInternationalGuests,
          weddingScale: hostApp.weddingScale,
          religion: hostApp.tradition,
          category: hostApp.tradition,
          date: hostApp.weddingDate,
          status: targetWeddingStatus,
        },
      });
    } else if (coupleProfileId) {
      const slug = `${hostApp.coupleNames.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${hostApp.city.toLowerCase()}-${Date.now()}`;
      weddingRecord = await tx.wedding.create({
        data: {
          slug,
          title: weddingTitle,
          description: hostApp.story || `Authentic celebration in ${hostApp.city}.`,
          location: venueLoc,
          category: hostApp.tradition,
          religion: hostApp.tradition,
          date: hostApp.weddingDate,
          pricePerGuest: customerPriceUSD,
          capacity: hostApp.expectedInternationalGuests,
          weddingScale: hostApp.weddingScale,
          tier,
          durationDays: duration,
          mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
          status: targetWeddingStatus,
          hostCoupleId: coupleProfileId,
        },
      });

      // Synchronize day-by-day ceremonies to WeddingEvent records
      if (hostApp.days && hostApp.days.length > 0) {
        for (const day of hostApp.days) {
          if (day.events && day.events.length > 0) {
            for (const ev of day.events) {
              await tx.weddingEvent.create({
                data: {
                  weddingId: weddingRecord.id,
                  name: ev.name,
                  description: ev.description || day.title,
                  date: day.date || hostApp.weddingDate,
                  startTime: ev.startTime || "17:00",
                  endTime: ev.endTime || "22:00",
                  location: ev.location || venueLoc,
                },
              });
            }
          }
        }
      }
    }

    const updatedApp = await tx.hostApplication.update({
      where: { id: hostApp.id },
      data: {
        verifiedTier: tier,
        verifiedDurationDays: duration,
        status: data.status as any,
        adminNotesInternal: data.adminNotesInternal || null,
        adminNotesHostFacing: data.adminNotesHostFacing || null,
        reviewedBy: admin.name || admin.email,
        reviewedAt: new Date(),
        verifiedAt: isApproved ? new Date() : null,
        weddingId: weddingRecord?.id || null,
        coupleProfileId,
      },
    });

    await tx.user.update({
      where: { id: hostApp.userId },
      data: { status: isApproved ? "ACTIVE" : "ONBOARDING" },
    });

    await tx.verification.upsert({
      where: { userId: hostApp.userId },
      create: {
        userId: hostApp.userId,
        status: targetVerifStatus,
        notes: data.adminNotesHostFacing || data.adminNotesInternal || `Application verified as ${tier} (${duration} days).`,
        reviewedBy: admin.name || admin.email,
        expiryDate: isApproved ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
      },
      update: {
        status: targetVerifStatus,
        notes: data.adminNotesHostFacing || data.adminNotesInternal || `Application verified as ${tier} (${duration} days).`,
        reviewedBy: admin.name || admin.email,
        expiryDate: isApproved ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
      },
    });

    await tx.notification.create({
      data: {
        userId: hostApp.userId,
        title: isApproved ? "Celebration Verified & Approved!" : "Host Application Status Update",
        message: data.adminNotesHostFacing || `Your celebration has been reviewed and marked as ${data.status}. Verified Tier: ${tier}.`,
        type: isApproved ? "SUCCESS" : data.status === "REJECTED" ? "ALERT" : "INFO",
      },
    });

    await tx.hostApplicationAuditLog.create({
      data: {
        applicationId: hostApp.id,
        action: `APPLICATION_VERIFIED_${data.status}`,
        actorId: admin.id,
        actorRole: "ADMIN",
        details: `Verified Tier: ${tier}, Verified Duration: ${duration} days, Price/Guest: $${customerPriceUSD} USD, Status: ${data.status}.`,
      },
    });

    return { updatedApp, weddingRecord };
  }, { timeout: 30000, maxWait: 10000 });

  try {
    revalidatePath("/dashboard/admin/hosts");
    revalidatePath(`/dashboard/admin/hosts/${hostApp.id}`);
    revalidatePath("/dashboard/admin/weddings");
    revalidatePath("/weddings");
    if (result.weddingRecord?.slug) {
      revalidatePath(`/weddings/${result.weddingRecord.slug}`);
    }
    revalidatePath("/dashboard");
    revalidatePath("/list-wedding");
    revalidateTag("weddings", "max");
    revalidateTag("homepage", "max");
  } catch {}

  return { success: true, application: result.updatedApp, wedding: result.weddingRecord };
}

export async function adminReviewHostApplicationAction(
  weddingId: string,
  reviewStatus: "APPROVED" | "REJECTED" | "NEED_MORE_DOCUMENTS" | "UNDER_REVIEW",
  notes?: string
) {
  const admin = await requireRole([UserRole.ADMIN]);

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: {
      hostCouple: {
        include: {
          user: {
            include: {
              verification: true,
            },
          },
        },
      },
    },
  });

  if (!wedding) {
    throw new Error("Host application wedding record not found.");
  }

  const hostUserId = wedding.hostCouple?.userId;
  const reviewNote = notes || `Host application review: status set to ${reviewStatus}`;

  // Map review status to database enums
  let targetWeddingStatus: WeddingStatus = WeddingStatus.DRAFT;
  let targetVerificationStatus: VerificationStatus = VerificationStatus.PENDING;
  let targetUserStatus: any = "ONBOARDING";

  if (reviewStatus === "APPROVED") {
    targetWeddingStatus = WeddingStatus.PUBLISHED;
    targetVerificationStatus = VerificationStatus.APPROVED;
    targetUserStatus = "ACTIVE";
  } else if (reviewStatus === "REJECTED") {
    targetWeddingStatus = WeddingStatus.DRAFT;
    targetVerificationStatus = VerificationStatus.REJECTED;
    targetUserStatus = "ONBOARDING";
  } else if (reviewStatus === "NEED_MORE_DOCUMENTS") {
    targetWeddingStatus = WeddingStatus.DRAFT;
    targetVerificationStatus = VerificationStatus.NEED_MORE_DOCUMENTS;
    targetUserStatus = "ONBOARDING";
  } else if (reviewStatus === "UNDER_REVIEW") {
    targetWeddingStatus = WeddingStatus.DRAFT;
    targetVerificationStatus = VerificationStatus.UNDER_REVIEW;
    targetUserStatus = "ONBOARDING";
  }

  // Atomically persist Wedding, User, Verification and Notification updates
  const updatedWedding = await prisma.$transaction(async (tx) => {
    const updated = await tx.wedding.update({
      where: { id: weddingId },
      data: { status: targetWeddingStatus },
    });

    if (hostUserId) {
      await tx.user.update({
        where: { id: hostUserId },
        data: { status: targetUserStatus },
      });

      await tx.verification.upsert({
        where: { userId: hostUserId },
        create: {
          userId: hostUserId,
          status: targetVerificationStatus,
          notes: reviewNote,
          reviewedBy: admin.name || admin.email,
          expiryDate: reviewStatus === "APPROVED" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
        },
        update: {
          status: targetVerificationStatus,
          notes: reviewNote,
          reviewedBy: admin.name || admin.email,
          expiryDate: reviewStatus === "APPROVED" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
        },
      });

      await tx.notification.create({
        data: {
          userId: hostUserId,
          title: reviewStatus === "APPROVED" ? "Host Application Approved!" : "Host Application Update",
          message: reviewNote,
          type: reviewStatus === "APPROVED" ? "SUCCESS" : reviewStatus === "REJECTED" ? "ALERT" : "INFO",
        },
      });

      // Synchronize HostApplication record if present
      if (tx.hostApplication) {
        const hostApp = await tx.hostApplication.findFirst({
          where: {
            OR: [
              { weddingId },
              { coupleProfileId: wedding.hostCoupleId },
              { userId: hostUserId },
            ],
          },
        });

        if (hostApp) {
          const targetHostAppStatus = reviewStatus === "APPROVED" 
            ? "APPROVED_FOR_LISTING" 
            : reviewStatus === "REJECTED" 
            ? "REJECTED" 
            : reviewStatus === "NEED_MORE_DOCUMENTS" 
            ? "ACTION_REQUIRED" 
            : "UNDER_REVIEW";

          await tx.hostApplication.update({
            where: { id: hostApp.id },
            data: {
              status: targetHostAppStatus as any,
              adminNotesHostFacing: reviewNote,
              reviewedBy: admin.name || admin.email,
              reviewedAt: new Date(),
              verifiedAt: reviewStatus === "APPROVED" ? new Date() : null,
            },
          });
        }
      }
    }

    return updated;
  }, { timeout: 30000, maxWait: 10000 });

  // Send Emails
  const hostUser = wedding.hostCouple?.user;
  if (hostUser?.email) {
    const userName = hostUser.name || hostUser.email.split("@")[0];
    if (reviewStatus === "APPROVED") {
      await sendVerificationApprovedEmail(hostUser.email, userName, UserRole.COUPLE);
    } else if (reviewStatus === "REJECTED") {
      await sendVerificationRejectedEmail(hostUser.email, userName, reviewNote);
    }
  }

  // Evaluate Quality Badges for Host
  if (wedding.hostCoupleId) {
    try {
      const { evaluateEntityBadges } = require("../services/badges");
      await evaluateEntityBadges(ReputationEntityType.HOST, wedding.hostCoupleId);
    } catch (err) {
      console.warn("Badge evaluation warning on host review:", err);
    }
  }

  await createAuditLog(
    "REVIEW_HOST_APPLICATION",
    "Wedding",
    weddingId,
    `Admin ${admin.email} reviewed host application for "${wedding.title}". Set status to ${reviewStatus}. Notes: "${reviewNote}"`
  );

  try {
    revalidatePath("/dashboard/admin/hosts");
    revalidatePath(`/dashboard/admin/hosts/${weddingId}`);
    revalidatePath("/dashboard/admin/weddings");
    revalidatePath("/dashboard/admin/verifications");
    revalidatePath("/weddings");
    revalidatePath(`/weddings/${wedding.slug}`);
    revalidatePath("/dashboard");
    revalidatePath("/list-wedding");
    revalidateTag("weddings", "max");
    revalidateTag("homepage", "max");
  } catch {}

  return { success: true, wedding: updatedWedding };
}

// ─── Admin: Sponsorship Request Review & CRM ─────────────────────────────────

/**
 * Admin reviews a pending host sponsorship request.
 * Supports configurable pricing, duration, payment method (UPI / PayPal / Bank), and payment requirements.
 */
export async function adminReviewSponsorshipRequestAction(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  adminNotes?: string,
  sponsorshipStart?: string | null,
  sponsorshipEnd?: string | null,
  options?: {
    promotionType?: "SPONSORED" | "FEATURED";
    amount?: number;
    currency?: string;
    durationDays?: number;
    paymentMethod?: "UPI" | "PAYPAL" | "BANK_TRANSFER" | "CASH" | "OTHER" | "WAIVED";
    paymentRequired?: boolean;
    rejectionReason?: string;
  }
) {
  const { adminReviewSponsorshipRequest } = await import("../services/sponsorship");
  return adminReviewSponsorshipRequest({
    requestId,
    decision,
    adminNotes,
    sponsorshipStart,
    sponsorshipEnd,
    promotionType: options?.promotionType,
    amount: options?.amount,
    currency: options?.currency,
    durationDays: options?.durationDays,
    paymentMethod: options?.paymentMethod,
    paymentRequired: options?.paymentRequired,
    rejectionReason: options?.rejectionReason,
  });
}

/**
 * Admin directly creates and activates/schedules sponsored or featured placement on any published wedding.
 * Supports direct outreach details, contact tracking, external payment methods, and immediate activation.
 */
export async function adminDirectAddSponsorshipAction(input: {
  weddingId: string;
  promotionType?: "SPONSORED" | "FEATURED";
  source?: "HOST_REQUEST" | "ADMIN_OUTREACH" | "PARTNER" | "MANUAL" | "OTHER";
  contactMethod?: "WHATSAPP" | "PHONE" | "EMAIL" | "IN_PERSON" | "WEBSITE" | "OTHER";
  contactDate?: string | null;
  contactNotes?: string;
  agreementNotes?: string;
  amount?: number;
  currency?: string;
  durationDays?: number;
  paymentMethod?: "UPI" | "PAYPAL" | "BANK_TRANSFER" | "CASH" | "OTHER" | "WAIVED";
  paymentStatus?: "NOT_REQUESTED" | "PAYMENT_REQUESTED" | "PAYMENT_SUBMITTED" | "PAYMENT_VERIFIED" | "REJECTED" | "WAIVED";
  paymentRequired?: boolean;
  sponsorshipStart?: string | null;
  sponsorshipEnd?: string | null;
  adminNotes?: string;
  completedChecklistKeys?: string[];
}) {
  const { adminDirectAddSponsorship } = await import("../services/sponsorship");
  return adminDirectAddSponsorship(input);
}

/**
 * Admin updates promotion parameters (pricing, duration, dates, notes, payment status).
 */
export async function adminUpdatePromotionParametersAction(input: {
  sponsorshipId: string;
  amount?: number;
  currency?: string;
  durationDays?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  promotionType?: "SPONSORED" | "FEATURED";
  paymentMethod?: "UPI" | "PAYPAL" | "BANK_TRANSFER" | "CASH" | "OTHER" | "WAIVED";
  paymentStatus?: "NOT_REQUESTED" | "PAYMENT_REQUESTED" | "PAYMENT_SUBMITTED" | "PAYMENT_VERIFIED" | "REJECTED" | "WAIVED";
  adminNotes?: string;
}) {
  const { adminUpdatePromotionParameters } = await import("../services/sponsorship");
  return adminUpdatePromotionParameters(input);
}

/**
 * Admin manually verifies that payment was received and activates placement.
 */
export async function adminVerifyPaymentAndActivateAction(input: {
  sponsorshipId: string;
  transactionReference?: string;
  paymentMethod?: "UPI" | "PAYPAL" | "BANK_TRANSFER" | "CASH" | "OTHER" | "WAIVED";
  verifiedAmount?: number;
  currency?: string;
  notes?: string;
}) {
  const { adminVerifyAndActivatePayment } = await import("../services/sponsorship");
  return adminVerifyAndActivatePayment(input);
}

/**
 * Admin updates a checklist item on a sponsorship request.
 */
export async function adminUpdateChecklistAction(
  sponsorshipId: string,
  itemKey: string,
  completed: boolean
) {
  const { adminUpdateChecklist } = await import("../services/sponsorship");
  return adminUpdateChecklist(sponsorshipId, itemKey, completed);
}

/**
 * Admin gets the current sponsorship payment configuration.
 */
export async function adminGetPaymentConfigAction() {
  const { getSponsorshipPaymentConfig } = await import("../services/sponsorship");
  return getSponsorshipPaymentConfig();
}

/**
 * Admin updates the sponsorship payment configuration (UPI QR, UPI ID, PayPal URL, Bank details).
 */
export async function adminUpdatePaymentConfigAction(input: {
  upiId?: string;
  upiName?: string;
  upiQrImageUrl?: string | null;
  upiPaymentLink?: string | null;
  upiInstructions?: string;
  paypalPaymentLink?: string;
  paypalDisplayName?: string;
  paypalInstructions?: string;
  bankTransferInstructions?: string;
  otherPaymentInstructions?: string;
}) {
  const { adminUpdatePaymentConfig } = await import("../services/sponsorship");
  return adminUpdatePaymentConfig(input);
}

/**
 * Admin revokes an active sponsorship with mandatory reason and full audit logging.
 */
export async function adminRevokeSponsorshipAction(sponsorshipId: string, reason: string) {
  const { adminRevokeSponsorship } = await import("../services/sponsorship");
  return adminRevokeSponsorship(sponsorshipId, reason);
}

/**
 * Admin extends duration of an active sponsorship by X days.
 */
export async function adminExtendSponsorshipAction(
  sponsorshipId: string,
  extensionDays: number,
  adminNotes?: string
) {
  const { adminExtendSponsorship } = await import("../services/sponsorship");
  return adminExtendSponsorship(sponsorshipId, extensionDays, adminNotes);
}

/**
 * Server-authoritative / Webhook verified payment execution to activate a paid sponsorship.
 */
export async function verifyAndActivateSponsorshipPaymentAction(params: {
  sponsorshipId: string;
  transactionReference: string;
  provider?: string;
  paymentNotes?: string;
}) {
  const { verifyAndActivateSponsorshipPayment } = await import("../services/sponsorship");
  return verifyAndActivateSponsorshipPayment(params);
}

/**
 * Fetch all sponsorship & promotion requests for the admin CRM queue, with comprehensive filter options.
 */
export async function adminGetSponsorshipRequestsAction(filter?: string) {
  await requireRole([UserRole.ADMIN]);

  const now = new Date();
  let where: any = {};

  if (filter === "SPONSORED_REQUESTS" || filter === "SPONSORED") {
    where = {
      OR: [
        { promotionType: "SPONSORED" },
        { promotionType: null },
      ],
    };
  } else if (filter === "FEATURED_REQUESTS" || filter === "FEATURED") {
    where = {
      promotionType: "FEATURED",
    };
  } else if (filter === "PAYMENT_SUBMITTED") {
    where = {
      OR: [
        { paymentStatus: "PAYMENT_SUBMITTED" },
        { status: "PAYMENT_PENDING", paymentStatus: "PAYMENT_SUBMITTED" },
      ],
    };
  } else if (filter === "PAYMENT_PENDING") {
    where = {
      status: "PAYMENT_PENDING",
      paymentStatus: { in: ["PENDING", "PAYMENT_REQUESTED"] },
    };
  } else if (filter === "PAYMENT_VERIFIED") {
    where = {
      paymentStatus: "PAYMENT_VERIFIED",
    };
  } else if (filter === "ACTIVE") {
    where = {
      status: "ACTIVE",
      revokedAt: null,
      endsAt: { gt: now },
    };
  } else if (filter === "EXPIRING_SOON") {
    const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    where = {
      status: "ACTIVE",
      revokedAt: null,
      endsAt: { gt: now, lte: soon },
    };
  } else if (filter === "EXPIRED") {
    where = {
      OR: [
        { status: "EXPIRED" },
        { status: "ACTIVE", endsAt: { lte: now } },
      ],
    };
  } else if (filter === "REVOKED") {
    where = {
      OR: [
        { status: "REVOKED" },
        { revokedAt: { not: null } },
      ],
    };
  } else if (filter === "REJECTED") {
    where = {
      status: "REJECTED",
    };
  } else if (filter === "PENDING") {
    where = {
      status: "PENDING",
    };
  } else if (filter && filter !== "ALL") {
    where = { status: filter as any };
  }

  const requests = await prisma.sponsorshipRequest.findMany({
    where,
    include: {
      wedding: {
        include: {
          hostCouple: { include: { user: true } },
          _count: { select: { bookings: { where: { status: { in: ["APPROVED", "PAID", "CONFIRMED", "COMPLETED"] } } } } }
        }
      }
    },
    orderBy: { requestedAt: "desc" }
  });

  return requests;
}

/**
 * 14. Coordinator Assignment Management
 */
export async function adminAssignCoordinatorAction(
  coordinatorProfileId: string,
  weddingId: string
) {
  const admin = await requireRole([UserRole.ADMIN]);

  const coordinator = await prisma.coordinatorProfile.findUnique({
    where: { id: coordinatorProfileId },
    include: { user: true },
  });
  if (!coordinator) throw new Error("Coordinator profile not found.");

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { id: true, title: true, date: true, status: true },
  });
  if (!wedding) throw new Error("Wedding not found.");
  if (wedding.status !== WeddingStatus.PUBLISHED) {
    throw new Error("Coordinators can only be assigned to published weddings.");
  }

  const updated = await prisma.coordinatorProfile.update({
    where: { id: coordinatorProfileId },
    data: {
      assignedWeddingId: wedding.id,
      assignedEventTitle: wedding.title,
      assignedDate: wedding.date.toISOString(),
    },
  });

  // Notify coordinator user
  if (coordinator.user?.id) {
    await prisma.notification.create({
      data: {
        userId: coordinator.user.id,
        title: "New Wedding Shift Assignment",
        message: `You have been assigned as event coordinator for "${wedding.title}". Check your coordinator dashboard for attendee details and gate check-in controls.`,
        type: "INFO",
      },
    });
  }

  await createAuditLog(
    "ASSIGN_COORDINATOR",
    "CoordinatorProfile",
    coordinatorProfileId,
    `Admin (${admin.email}) assigned coordinator ${coordinator.user?.email || coordinator.id} to wedding "${wedding.title}" (${wedding.id})`
  );

  revalidatePath("/dashboard/admin/coordinators");
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/coordinators/dashboard");

  return { success: true, coordinator: updated };
}

export async function adminUnassignCoordinatorAction(coordinatorProfileId: string) {
  const admin = await requireRole([UserRole.ADMIN]);

  const coordinator = await prisma.coordinatorProfile.findUnique({
    where: { id: coordinatorProfileId },
    include: { user: true },
  });
  if (!coordinator) throw new Error("Coordinator profile not found.");

  const prevWeddingTitle = coordinator.assignedEventTitle || "assigned event";

  const updated = await prisma.coordinatorProfile.update({
    where: { id: coordinatorProfileId },
    data: {
      assignedWeddingId: null,
      assignedEventTitle: null,
      assignedDate: null,
    },
  });

  if (coordinator.user?.id) {
    await prisma.notification.create({
      data: {
        userId: coordinator.user.id,
        title: "Assignment Removed",
        message: `Your shift assignment for "${prevWeddingTitle}" has been unassigned by platform administration.`,
        type: "INFO",
      },
    });
  }

  await createAuditLog(
    "UNASSIGN_COORDINATOR",
    "CoordinatorProfile",
    coordinatorProfileId,
    `Admin (${admin.email}) unassigned coordinator ${coordinator.user?.email || coordinator.id} from "${prevWeddingTitle}"`
  );

  revalidatePath("/dashboard/admin/coordinators");
  revalidatePath("/dashboard/admin/weddings");
  revalidatePath("/coordinators/dashboard");

  return { success: true, coordinator: updated };
}

export async function adminGetCoordinatorsAction() {
  await requireRole([UserRole.ADMIN]);

  const coordinators = await prisma.coordinatorProfile.findMany({
    where: { deletedAt: null },
    include: {
      user: {
        select: { id: true, name: true, email: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const publishedWeddings = await prisma.wedding.findMany({
    where: { status: WeddingStatus.PUBLISHED, deletedAt: null, suspended: false },
    select: { id: true, title: true, location: true, date: true },
    orderBy: { date: "asc" },
  });

  return { coordinators, publishedWeddings };
}
