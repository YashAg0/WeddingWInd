"use server";

import { prisma } from "../prisma";
import { requireAuth } from "../auth";
import { VerificationStatus, WeddingStatus } from "@prisma/client";

export interface HostApplicationState {
  exists: boolean;
  mode: "RESUME" | "CREATE";
  weddingId: string | null;
  status: WeddingStatus | null;
  verificationStatus: VerificationStatus | "NOT_SUBMITTED";
  ownerUserId: string;
  hostCoupleId: string | null;
  adminNotes: string | null;
  reviewedBy: string | null;
  hasActiveApplication: boolean;
  application: {
    applicationId: string;
    weddingSlug: string;
    status: WeddingStatus;
    verificationStatus: VerificationStatus | "NOT_SUBMITTED";
    adminNotes: string;
    reviewedBy: string;
    hostName: string;
    email: string;
    phone: string;
    coupleNames: string;
    city: string;
    state: string;
    venue: string;
    weddingDate: string;
    durationDays: string;
    religion: string;
    story: string;
    photoUrl: string;
    intlGuestCapacity: number;
    createdAt: Date;
    updatedAt: Date;
    gallery: any[];
    events: any[];
    traditions: any[];
  } | null;
}

/**
 * Authoritative Server-Side Host Application Resolver.
 * Resolves the authenticated user's database identity -> CoupleProfile -> non-demo Wedding -> Verification.
 * Pure database truth; zero reliance on browser cache or client state.
 */
export async function resolveHostApplicationState(targetUserId?: string): Promise<HostApplicationState> {
  let userId = targetUserId;
  if (!userId) {
    const user = await requireAuth();
    userId = user.id;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, status: true }
  });

  if (!user) {
    throw new Error("UNAUTHORIZED: User identity not found in database.");
  }

  const verification = await prisma.verification.findUnique({
    where: { userId: user.id }
  });

  const coupleProfile = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
    include: {
      weddings: {
        where: { isDemo: false, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        include: {
          gallery: { orderBy: { order: "asc" } },
          events: { orderBy: { date: "asc" } },
          traditions: true
        }
      }
    }
  });

  const verificationStatus = verification?.status || "NOT_SUBMITTED";
  const adminNotes = verification?.notes || null;
  const reviewedBy = verification?.reviewedBy || null;

  if (!coupleProfile || !coupleProfile.weddings || coupleProfile.weddings.length === 0) {
    return {
      exists: false,
      mode: "CREATE",
      weddingId: null,
      status: null,
      verificationStatus,
      ownerUserId: user.id,
      hostCoupleId: coupleProfile?.id || null,
      adminNotes,
      reviewedBy,
      hasActiveApplication: false,
      application: null
    };
  }

  const existingWedding = coupleProfile.weddings[0];

  // Parse location "Venue, City, State"
  const locParts = existingWedding.location ? existingWedding.location.split(",").map((s) => s.trim()) : [];
  const venue = locParts[0] || "";
  const city = locParts[1] || locParts[0] || "";
  const state = locParts[2] || "";

  const coupleNames = existingWedding.title
    ? existingWedding.title.replace(/\s+Wedding$/i, "")
    : "";

  return {
    exists: true,
    mode: "RESUME",
    weddingId: existingWedding.id,
    status: existingWedding.status,
    verificationStatus,
    ownerUserId: user.id,
    hostCoupleId: coupleProfile.id,
    adminNotes,
    reviewedBy,
    hasActiveApplication: true,
    application: {
      applicationId: existingWedding.id,
      weddingSlug: existingWedding.slug,
      status: existingWedding.status,
      verificationStatus,
      adminNotes: adminNotes || "",
      reviewedBy: reviewedBy || "",
      hostName: user.name || "",
      email: user.email || "",
      phone: "",
      coupleNames,
      city,
      state,
      venue,
      weddingDate: existingWedding.date ? existingWedding.date.toISOString().split("T")[0] : "",
      durationDays: "3",
      religion: existingWedding.category || "Traditional",
      story: existingWedding.description || coupleProfile.familyBio || "",
      photoUrl: existingWedding.mainImageUrl || "",
      intlGuestCapacity: existingWedding.capacity || 10,
      createdAt: existingWedding.createdAt,
      updatedAt: existingWedding.updatedAt,
      gallery: existingWedding.gallery || [],
      events: existingWedding.events || [],
      traditions: existingWedding.traditions || []
    }
  };
}

/**
 * Server Action wrapper for client components.
 */
export async function getCurrentHostApplicationAction() {
  return await resolveHostApplicationState();
}
