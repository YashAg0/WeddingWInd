"use server";

import { prisma } from "../prisma";
import { requireAuth } from "../auth";
import { HostApplicationStatus, UserRole, VerificationStatus, WeddingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface HostDayInput {
  dayNumber: number;
  date: string;
  title: string;
  description?: string;
  expectedInternationalGuests?: number;
  guestExperience?: string;
  foodExperience?: string;
  dressCode?: string;
  specialActivities?: string;
  events?: Array<{
    name: string;
    startTime: string;
    endTime: string;
    location?: string;
    description?: string;
  }>;
}

export interface HostApplicationInput {
  applicationId?: string;
  hostName: string;
  email: string;
  phone?: string;
  preferredContactMethod?: "WHATSAPP" | "PHONE" | "EMAIL";
  brideName?: string;
  groomName?: string;
  coupleNames: string;
  city: string;
  state?: string;
  venueName?: string;
  weddingDate: string;
  durationDays: number;
  tradition?: string;
  weddingScale?: "INTIMATE" | "SMALL" | "MEDIUM" | "LARGE" | "GRAND";
  expectedTotalGuests?: number;
  expectedInternationalGuests?: number;
  requestedTier?: "STANDARD" | "ENHANCED" | "GRAND" | "ROYAL" | "SIGNATURE_ROYAL";
  story?: string;
  days?: HostDayInput[];
}

export interface HostApplicationState {
  exists: boolean;
  mode: "RESUME" | "CREATE";
  weddingId: string | null;
  status: WeddingStatus | null;
  verificationStatus: VerificationStatus | "NOT_SUBMITTED" | "ACTION_REQUIRED" | "NEED_MORE_DOCUMENTS";
  ownerUserId: string;
  hostCoupleId: string | null;
  adminNotes: string | null;
  reviewedBy: string | null;
  hasActiveApplication: boolean;
  application: {
    applicationId: string;
    weddingSlug: string;
    status: any;
    appStatus?: string;
    verificationStatus: any;
    adminNotes: string;
    adminNotesHostFacing?: string;
    reviewedBy: string;
    hostName: string;
    email: string;
    phone: string;
    preferredContactMethod?: string;
    brideName?: string;
    groomName?: string;
    coupleNames: string;
    city: string;
    state: string;
    venue: string;
    venueName?: string;
    weddingDate: string;
    durationDays: string | number;
    religion: string;
    tradition?: string;
    weddingScale?: string;
    expectedTotalGuests?: number;
    expectedInternationalGuests?: number;
    requestedTier?: string;
    verifiedTier?: string | null;
    verifiedDurationDays?: number | null;
    story: string;
    photoUrl: string;
    intlGuestCapacity: number;
    createdAt: Date;
    updatedAt: Date;
    lastSavedAt?: Date;
    gallery: any[];
    events: any[];
    traditions: any[];
    days?: any[];
    documentRequests?: any[];
    documents?: any[];
    auditLogs?: any[];
  } | null;
}

/**
 * Authoritative Server-Side Host Application Resolver.
 * Resolves the authenticated user's database identity -> HostApplication (or legacy CoupleProfile -> Wedding).
 */
export async function resolveHostApplicationState(targetUserId?: string): Promise<HostApplicationState> {
  let user: any = null;
  if (!targetUserId) {
    user = await requireAuth();
  } else {
    user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
  }

  if (!user) {
    throw new Error("UNAUTHORIZED: User identity not found in database.");
  }

  const verification = await prisma.verification.findUnique({
    where: { userId: user.id },
  });

  let hostApp = null;
  if (prisma.hostApplication) {
    try {
      hostApp = await prisma.hostApplication.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { events: { orderBy: { createdAt: "asc" } } },
          },
          documentRequests: {
            orderBy: { requestedAt: "desc" },
            include: { documents: { orderBy: { uploadedAt: "desc" } } },
          },
          documents: { orderBy: { uploadedAt: "desc" } },
          auditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
          wedding: true,
        },
      });
    } catch {
      hostApp = null;
    }
  }

  if (hostApp) {
    let resolvedVerificationStatus = verification?.status || "NOT_SUBMITTED";
    if (hostApp.status === "ACTION_REQUIRED") {
      resolvedVerificationStatus = "NEED_MORE_DOCUMENTS" as any;
    }

    const adminNotes = hostApp.adminNotesHostFacing || verification?.notes || null;
    const reviewedBy = hostApp.reviewedBy || verification?.reviewedBy || null;

    return {
      exists: true,
      mode: "RESUME",
      weddingId: hostApp.weddingId || hostApp.id,
      status: (hostApp.wedding?.status || WeddingStatus.DRAFT) as WeddingStatus,
      verificationStatus: resolvedVerificationStatus,
      ownerUserId: user.id,
      hostCoupleId: hostApp.coupleProfileId,
      adminNotes,
      reviewedBy,
      hasActiveApplication: true,
      application: {
        applicationId: hostApp.id,
        weddingSlug: hostApp.wedding?.slug || `app-${hostApp.id.slice(0, 8)}`,
        status: (hostApp.wedding?.status || "DRAFT") as WeddingStatus,
        appStatus: hostApp.status,
        verificationStatus: resolvedVerificationStatus,
        adminNotes: adminNotes || "",
        adminNotesHostFacing: hostApp.adminNotesHostFacing || "",
        reviewedBy: reviewedBy || "",
        hostName: hostApp.hostName,
        email: hostApp.email,
        phone: hostApp.phone || "",
        preferredContactMethod: hostApp.preferredContactMethod || "WHATSAPP",
        brideName: hostApp.brideName || "",
        groomName: hostApp.groomName || "",
        coupleNames: hostApp.coupleNames,
        city: hostApp.city,
        state: hostApp.state || "",
        venue: hostApp.venueName || "",
        venueName: hostApp.venueName || "",
        weddingDate: hostApp.weddingDate ? hostApp.weddingDate.toISOString().split("T")[0] : "",
        durationDays: hostApp.durationDays,
        religion: hostApp.tradition,
        tradition: hostApp.tradition,
        weddingScale: hostApp.weddingScale,
        expectedTotalGuests: hostApp.expectedTotalGuests,
        expectedInternationalGuests: hostApp.expectedInternationalGuests,
        requestedTier: hostApp.requestedTier,
        verifiedTier: hostApp.verifiedTier,
        verifiedDurationDays: hostApp.verifiedDurationDays,
        story: hostApp.story || "",
        photoUrl: hostApp.wedding?.mainImageUrl || "",
        intlGuestCapacity: hostApp.expectedInternationalGuests,
        createdAt: hostApp.createdAt,
        updatedAt: hostApp.updatedAt,
        lastSavedAt: hostApp.lastSavedAt,
        gallery: (hostApp.wedding as any)?.gallery || [],
        events: (hostApp.wedding as any)?.events || [],
        traditions: (hostApp.wedding as any)?.traditions || [],
        days: hostApp.days.map((d) => ({
          id: d.id,
          dayNumber: d.dayNumber,
          date: d.date ? d.date.toISOString().split("T")[0] : "",
          title: d.title,
          description: d.description || "",
          expectedInternationalGuests: d.expectedInternationalGuests,
          guestExperience: d.guestExperience || "",
          foodExperience: d.foodExperience || "",
          dressCode: d.dressCode || "",
          specialActivities: d.specialActivities || "",
          events: d.events.map((e) => ({
            id: e.id,
            name: e.name,
            startTime: e.startTime,
            endTime: e.endTime,
            location: e.location || "",
            description: e.description || "",
          })),
        })),
        documentRequests: hostApp.documentRequests.map((dr) => ({
          id: dr.id,
          requestType: dr.requestType,
          title: dr.title,
          description: dr.description,
          isRequired: dr.isRequired,
          deadline: dr.deadline ? dr.deadline.toISOString() : null,
          status: dr.status,
          requestedBy: dr.requestedBy,
          requestedAt: dr.requestedAt.toISOString(),
          fulfilledAt: dr.fulfilledAt ? dr.fulfilledAt.toISOString() : null,
          reviewedBy: dr.reviewedBy,
          reviewNotes: dr.reviewNotes,
          documents: dr.documents.map((doc) => ({
            id: doc.id,
            fileUrl: doc.fileUrl,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            uploadedAt: doc.uploadedAt.toISOString(),
            status: doc.status,
            adminFeedback: doc.adminFeedback,
          })),
        })),
        documents: hostApp.documents.map((doc) => ({
          id: doc.id,
          fileUrl: doc.fileUrl,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          uploadedAt: doc.uploadedAt.toISOString(),
          status: doc.status,
          adminFeedback: doc.adminFeedback,
        })),
        auditLogs: hostApp.auditLogs.map((l) => ({
          id: l.id,
          action: l.action,
          actorRole: l.actorRole,
          details: l.details,
          createdAt: l.createdAt.toISOString(),
        })),
      },
    };
  }

  // 2. Legacy fallback: Check CoupleProfile -> Wedding
  const coupleProfile = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
    include: {
      weddings: {
        where: { isDemo: false, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        include: {
          gallery: { orderBy: { order: "asc" } },
          events: { orderBy: { date: "asc" } },
          traditions: true,
        },
      },
    },
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
      application: null,
    };
  }

  const existingWedding = coupleProfile.weddings[0];
  const locParts = existingWedding.location ? existingWedding.location.split(",").map((s) => s.trim()) : [];
  const venue = locParts[0] || "";
  const city = locParts[1] || locParts[0] || "";
  const state = locParts[2] || "";
  const coupleNames = existingWedding.title ? existingWedding.title.replace(/\s+Wedding$/i, "") : "";

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
      appStatus: "SUBMITTED",
      verificationStatus,
      adminNotes: adminNotes || "",
      reviewedBy: reviewedBy || "",
      hostName: user.name || "",
      email: user.email || "",
      phone: "",
      preferredContactMethod: "WHATSAPP",
      coupleNames,
      city,
      state,
      venue,
      venueName: venue,
      weddingDate: existingWedding.date ? existingWedding.date.toISOString().split("T")[0] : "",
      durationDays: String(existingWedding.durationDays || 3),
      religion: existingWedding.category || "Traditional",
      tradition: existingWedding.category || "Traditional",
      weddingScale: existingWedding.weddingScale || "MEDIUM",
      expectedTotalGuests: 200,
      expectedInternationalGuests: existingWedding.capacity || 10,
      requestedTier: existingWedding.tier || "SIGNATURE_ROYAL",
      verifiedTier: existingWedding.tier || null,
      story: existingWedding.description || coupleProfile.familyBio || "",
      photoUrl: existingWedding.mainImageUrl || "",
      intlGuestCapacity: existingWedding.capacity || 10,
      createdAt: existingWedding.createdAt,
      updatedAt: existingWedding.updatedAt,
      gallery: existingWedding.gallery || [],
      events: existingWedding.events || [],
      traditions: existingWedding.traditions || [],
      days: [],
      documentRequests: [],
      documents: [],
      auditLogs: [],
    },
  };
}

function parseSafeDate(val: any, fallback: Date = new Date()): Date {
  if (!val) return fallback;
  const d = new Date(val);
  return isNaN(d.getTime()) ? fallback : d;
}

/**
 * Server Action: Save or Update Draft Host Application with debounced autosave support.
 */
export async function saveHostApplicationDraftAction(
  input: HostApplicationInput,
  options?: { status?: "DRAFT" | "SUBMITTED" }
) {
  const isSubmission = options?.status === "SUBMITTED";
  const user = await requireAuth();
  const userEmail = user.email || input.email;

  const durationDays = Math.max(1, Math.min(5, Number(input.durationDays) || 3));
  const weddingDate = parseSafeDate(input.weddingDate);

  const resolvedCoupleNames =
    input.coupleNames?.trim() ||
    (input.brideName && input.groomName
      ? `${input.brideName.trim()} & ${input.groomName.trim()} Celebration`
      : input.brideName?.trim() || input.hostName?.trim() || user.name || "Couple Celebration");

  const result = await prisma.$transaction(async (tx) => {
    // 1. Resolve or create CoupleProfile
    let coupleProfile = await tx.coupleProfile.findUnique({
      where: { userId: user.id },
    });

    if (!coupleProfile) {
      try {
        coupleProfile = await tx.coupleProfile.create({
          data: {
            userId: user.id,
            weddingLocation: input.city?.trim() || "India",
            weddingDate: input.weddingDate ? parseSafeDate(input.weddingDate) : null,
            expectedGuests: input.expectedTotalGuests || 200,
            traditions: input.tradition || "Traditional / Cultural",
            languagesSpoken: "English, Hindi",
            familyBio: input.story || null,
          },
        });
      } catch {
        coupleProfile = await tx.coupleProfile.findUnique({
          where: { userId: user.id },
        });
      }
    }

    if (!coupleProfile) {
      throw new Error("Unable to initialize host couple profile.");
    }

    const appData = {
      userId: user.id,
      coupleProfileId: coupleProfile.id,
      hostName: input.hostName?.trim() || user.name || "Host",
      email: userEmail,
      phone: input.phone || null,
      preferredContactMethod: input.preferredContactMethod || "WHATSAPP",
      brideName: input.brideName || null,
      groomName: input.groomName || null,
      coupleNames: resolvedCoupleNames,
      city: input.city?.trim() || "India",
      state: input.state || null,
      venueName: input.venueName || null,
      weddingDate,
      durationDays,
      tradition: input.tradition || "Traditional / Cultural",
      weddingScale: input.weddingScale || "MEDIUM",
      expectedTotalGuests: input.expectedTotalGuests || 200,
      expectedInternationalGuests: input.expectedInternationalGuests || 20,
      requestedTier: input.requestedTier || "SIGNATURE_ROYAL",
      story: input.story || null,
      lastSavedAt: new Date(),
      status: isSubmission ? HostApplicationStatus.SUBMITTED : HostApplicationStatus.DRAFT,
      ...(isSubmission ? { submittedAt: new Date() } : {}),
    };

    let appRecord: any = {
      id: input.applicationId || `app-${user.id}`,
      lastSavedAt: new Date(),
      status: isSubmission ? HostApplicationStatus.SUBMITTED : HostApplicationStatus.DRAFT,
    };

    if (tx.hostApplication) {
      // 2. Find existing application by ID or by userId
      let hostApp = null;
      if (input.applicationId) {
        hostApp = await tx.hostApplication.findFirst({
          where: { id: input.applicationId, userId: user.id },
        });
      }

      if (!hostApp) {
        hostApp = await tx.hostApplication.findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
        });
      }

      if (hostApp) {
        appRecord = await tx.hostApplication.update({
          where: { id: hostApp.id },
          data: appData,
        });
      } else {
        try {
          appRecord = await tx.hostApplication.create({
            data: appData,
          });
        } catch (createAppErr: any) {
          // Handle concurrent creation race condition
          const existing = await tx.hostApplication.findFirst({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
          });
          if (existing) {
            appRecord = await tx.hostApplication.update({
              where: { id: existing.id },
              data: appData,
            });
          } else {
            throw createAppErr;
          }
        }
      }
    }

    // 3. Save Day-by-Day schedule if provided
    if (input.days && Array.isArray(input.days) && input.days.length > 0) {
      for (const dayInput of input.days) {
        if (!dayInput.dayNumber || dayInput.dayNumber < 1 || dayInput.dayNumber > 5) continue;

        const dayDate = dayInput.date
          ? parseSafeDate(dayInput.date, new Date(weddingDate.getTime() + (dayInput.dayNumber - 1) * 86400000))
          : new Date(weddingDate.getTime() + (dayInput.dayNumber - 1) * 86400000);

        const dayRecord = await tx.hostApplicationDay.upsert({
          where: {
            applicationId_dayNumber: {
              applicationId: appRecord.id,
              dayNumber: dayInput.dayNumber,
            },
          },
          create: {
            applicationId: appRecord.id,
            dayNumber: dayInput.dayNumber,
            date: dayDate,
            title: dayInput.title || `Day ${dayInput.dayNumber}`,
            description: dayInput.description || null,
            expectedInternationalGuests: dayInput.expectedInternationalGuests || input.expectedInternationalGuests || 20,
            guestExperience: dayInput.guestExperience || null,
            foodExperience: dayInput.foodExperience || null,
            dressCode: dayInput.dressCode || null,
            specialActivities: dayInput.specialActivities || null,
          },
          update: {
            date: dayDate,
            title: dayInput.title || `Day ${dayInput.dayNumber}`,
            description: dayInput.description || null,
            expectedInternationalGuests: dayInput.expectedInternationalGuests || input.expectedInternationalGuests || 20,
            guestExperience: dayInput.guestExperience || null,
            foodExperience: dayInput.foodExperience || null,
            dressCode: dayInput.dressCode || null,
            specialActivities: dayInput.specialActivities || null,
          },
        });

        // Save events for this day
        if (dayInput.events && Array.isArray(dayInput.events) && dayInput.events.length > 0) {
          await tx.hostApplicationEvent.deleteMany({
            where: { dayId: dayRecord.id },
          });

          for (const ev of dayInput.events) {
            if (!ev.name) continue;
            await tx.hostApplicationEvent.create({
              data: {
                dayId: dayRecord.id,
                name: ev.name,
                startTime: ev.startTime || "17:00",
                endTime: ev.endTime || "22:00",
                location: ev.location || null,
                description: ev.description || null,
              },
            });
          }
        }
      }
    }

    if (isSubmission) {
      // 4. Upgrade user role to COUPLE
      await tx.user.update({
        where: { id: user.id },
        data: { role: UserRole.COUPLE },
      });

      // 5. Update Verification record
      try {
        await tx.verification.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            status: VerificationStatus.PENDING,
            submissionDate: new Date(),
            notes: `Host submitted celebration application for ${resolvedCoupleNames} in ${appData.city}. Duration: ${durationDays} days.`,
          },
          update: {
            status: VerificationStatus.PENDING,
            submissionDate: new Date(),
            notes: `Host submitted celebration application for ${resolvedCoupleNames} in ${appData.city}. Duration: ${durationDays} days.`,
          },
        });
      } catch (verifErr) {
        console.warn("[host-application] Verification record notice:", verifErr);
      }
    }

    return {
      applicationId: appRecord.id,
      lastSavedAt: appRecord.lastSavedAt,
      status: appRecord.status,
    };
  }, {
    maxWait: 20000,
    timeout: 60000,
  });

  return {
    success: true,
    applicationId: result.applicationId,
    lastSavedAt: result.lastSavedAt,
    status: result.status,
  };
}

/**
 * Server Action: Submit Host Application for Admin Verification.
 * Executes as a SINGLE atomic database transaction.
 */
export async function submitHostApplicationAction(input: HostApplicationInput) {
  const result = await saveHostApplicationDraftAction(input, { status: "SUBMITTED" });
  const user = await requireAuth();

  // Dispatch Notifications (non-blocking outside transaction)
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true },
    });

    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        try {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              title: "New Host Application Submitted",
              message: `${input.hostName} submitted an application for ${input.coupleNames} in ${input.city}.`,
              type: "INFO",
            },
          });
        } catch {}
      }
    } else {
      try {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Application Received",
            message: `Your celebration ${input.coupleNames} has been submitted for verification.`,
            type: "INFO",
          },
        });
      } catch {}
    }
  } catch (notifErr) {
    console.warn("Failed to dispatch notification on host application submit:", notifErr);
  }

  revalidatePath("/dashboard");
  revalidatePath("/list-wedding");

  return {
    success: true,
    applicationId: result.applicationId,
    status: "SUBMITTED",
  };
}

/**
 * Server Action: Upload Host Requested Document.
 */
export async function uploadHostRequestedDocumentAction(data: {
  requestId: string;
  fileUrl: string;
  fileKey?: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}) {
  const user = await requireAuth();

  const reqRecord = await prisma.hostDocumentRequest.findUnique({
    where: { id: data.requestId },
    include: { application: true },
  });

  if (!reqRecord) {
    throw new Error("Document request not found.");
  }

  if (reqRecord.userId !== user.id && reqRecord.application.userId !== user.id) {
    throw new Error("Forbidden: You cannot upload documents for another user's request.");
  }

  const doc = await prisma.$transaction(async (tx) => {
    // 1. Create Document record
    const createdDoc = await tx.hostDocument.create({
      data: {
        requestId: reqRecord.id,
        applicationId: reqRecord.applicationId,
        userId: user.id,
        fileUrl: data.fileUrl,
        fileKey: data.fileKey || null,
        fileName: data.fileName,
        fileSize: data.fileSize || 0,
        mimeType: data.mimeType || "application/octet-stream",
        status: "SUBMITTED",
      },
    });

    // 2. Mark request fulfilled
    await tx.hostDocumentRequest.update({
      where: { id: reqRecord.id },
      data: {
        status: "FULFILLED",
        fulfilledAt: new Date(),
      },
    });

    // 3. Check if any remaining pending required requests
    const pendingRequired = await tx.hostDocumentRequest.findMany({
      where: {
        applicationId: reqRecord.applicationId,
        isRequired: true,
        status: "PENDING",
      },
    });

    if (pendingRequired.length === 0) {
      // Transition application status back to UNDER_REVIEW
      await tx.hostApplication.update({
        where: { id: reqRecord.applicationId },
        data: { status: "UNDER_REVIEW" },
      });
    }

    // 4. Audit Log
    await tx.hostApplicationAuditLog.create({
      data: {
        applicationId: reqRecord.applicationId,
        action: "DOCUMENT_UPLOADED",
        actorId: user.id,
        actorRole: "COUPLE",
        details: `Host uploaded document '${data.fileName}' for request '${reqRecord.title}'.`,
      },
    });

    return createdDoc;
  });

  revalidatePath("/dashboard");
  revalidatePath("/list-wedding");

  return { success: true, document: doc };
}

/**
 * Server Action wrapper for client components.
 */
export async function getCurrentHostApplicationAction() {
  return await resolveHostApplicationState();
}
