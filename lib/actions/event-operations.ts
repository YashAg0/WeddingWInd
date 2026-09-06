"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireAuth } from "../auth";
import { BookingStatus, Prisma, UserRole, ReputationEntityType, ReputationEventType } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";
import { createAuditLog } from "./admin";
import { logReputationEvent } from "../services/reputation";
import {
  encryptPass,
  decryptPass,
  hashPassToken,
} from "@/lib/security/guest-pass-crypto";
import {
  canIssueGuestPass,
  canAdmitGuest,
  canMarkAttendance,
} from "@/lib/booking-statuses";

// Zod validation schemas
const itineraryItemSchema = z.object({
  weddingId: z.string().uuid(),
  title: z.string().min(2).max(100),
  description: z.string().max(1000).optional().nullable(),
  eventType: z.string().min(2).max(50),
  startAt: z.string().transform((val) => new Date(val)),
  endAt: z.string().transform((val) => new Date(val)),
  venueName: z.string().min(2).max(100),
  venueAddress: z.string().min(2).max(200),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  dressCode: z.string().max(100).optional().nullable(),
  culturalNotes: z.string().max(2000).optional().nullable(),
  guestInstructions: z.string().max(2000).optional().nullable(),
  sortOrder: z.number().default(0),
  visibleToGuests: z.boolean().default(true),
});

const announcementSchema = z.object({
  weddingId: z.string().uuid(),
  title: z.string().min(2).max(100),
  message: z.string().min(5).max(2000),
  priority: z.enum(["NORMAL", "IMPORTANT", "URGENT"]),
});

const emergencyContactSchema = z.object({
  bookingId: z.string().uuid(),
  name: z.string().min(2).max(100),
  relationship: z.string().min(2).max(50),
  phone: z.string().min(5).max(20),
  countryCode: z.string().min(1).max(5),
  email: z.string().email().optional().nullable(),
});

const travelDetailSchema = z.object({
  bookingId: z.string().uuid(),
  arrivalDate: z.string().transform((val) => new Date(val)),
  departureDate: z.string().transform((val) => new Date(val)),
  arrivalCity: z.string().min(2).max(100),
  flightNumber: z.string().max(20).optional().nullable(),
  hotelName: z.string().max(100).optional().nullable(),
  transportRequired: z.boolean().default(false),
  dietaryRequirements: z.string().max(1000).optional().nullable(),
  accessibilityRequirements: z.string().max(1000).optional().nullable(),
  medicalNotes: z.string().max(2000).optional().nullable(),
});

// Crypto primitives are in lib/security/guest-pass-crypto.ts (AES-256-GCM).
// They are imported above. This file contains no crypto implementation.

/**
 * Issues a Guest Pass for a confirmed/paid booking.
 */
export async function issueGuestPassAction(bookingId: string) {
  const user = await requireAuth();

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { traveler: { include: { user: true } }, wedding: true },
    });

    if (!booking) throw new Error("Booking not found.");

    // Verify authorized user
    if (booking.traveler.user.id !== user.id && user.role !== UserRole.ADMIN) {
      // Also allow the host couple
      const couple = await tx.coupleProfile.findUnique({
        where: { userId: user.id },
      });
      if (!couple || couple.id !== booking.wedding.hostCoupleId) {
        throw new Error("Unauthorized access.");
      }
    }

    // Enforce authoritative business predicate: booking must be in paid/confirmed/ready state
    if (!canIssueGuestPass(booking.status)) {
      throw new Error(`Cannot issue Guest Pass for booking in ${booking.status} status. Payment must be verified first.`);
    }

    // Check if pass already exists
    const existing = await tx.guestPass.findFirst({
      where: { bookingId },
    });
    if (existing) return existing;

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashPassToken(rawToken);
    const passCode = `WWI-PASS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const encrypted = encryptPass(rawToken);

    const pass = await tx.guestPass.create({
      data: {
        bookingId,
        passCode,
        qrTokenHash: tokenHash,
        encryptedToken: encrypted,
        status: "ACTIVE",
      },
    });

    // Initialize traveler readiness checklist
    await tx.travelerPreparation.upsert({
      where: { bookingId },
      create: {
        bookingId,
        identityVerified: true, // verification checks
      },
      update: {},
    });

    // Send notification
    await tx.notification.create({
      data: {
        userId: booking.traveler.user.id,
        title: "Your Digital Pass is Ready!",
        message: `Your digital entry code for ${booking.wedding.title} has been generated. View it in your Event Hub.`,
        type: "INFO",
      },
    });

    return { ...pass, rawToken };
  }, { maxWait: 20000, timeout: 35000 });
}

/**
 * Retrieves and decrypts Guest Pass for authorized users.
 */
export async function getGuestPassAction(bookingId: string) {
  const user = await requireAuth();

  const pass = await prisma.guestPass.findFirst({
    where: { bookingId },
    include: {
      booking: {
        include: {
          traveler: { include: { user: true } },
          wedding: true,
        },
      },
    },
  });

  if (!pass) return null;

  // Verify authorized user
  if (pass.booking.traveler.user.id !== user.id && user.role !== UserRole.ADMIN) {
    const couple = await prisma.coupleProfile.findUnique({
      where: { userId: user.id },
    });
    if (!couple || couple.id !== pass.booking.wedding.hostCoupleId) {
      throw new Error("Unauthorized access.");
    }
  }

  const rawToken = pass.encryptedToken ? decryptPass(pass.encryptedToken) : "";

  return {
    pass,
    rawToken,
  };
}

/**
 * Validates a scanned QR pass token.
 */
export async function validateGuestPassAction(rawToken: string, weddingId: string) {
  const tokenHash = hashPassToken(rawToken);

  const pass = await prisma.guestPass.findUnique({
    where: { qrTokenHash: tokenHash },
    include: {
      booking: {
        include: {
          traveler: { include: { user: true } },
          wedding: true,
        },
      },
    },
  });

  if (!pass) return { result: "INVALID" };
  if (pass.booking.weddingId !== weddingId) return { result: "WRONG_EVENT" };
  if (pass.status === "REVOKED") return { result: "REVOKED" };
  if (pass.status === "EXPIRED") return { result: "EXPIRED" };
  if (pass.scanCount > 0 && pass.status === "USED") return { result: "ALREADY_USED", pass };

  return { result: "SUCCESS", pass };
}

/**
 * Checks in a traveler at entry gate.
 */
export async function checkInGuestAction(rawToken: string, weddingId: string, deviceMetadata?: string) {
  const user = await requireAuth();

  // Validate scanner role: Admin, Host Couple, or Coordinator
  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
  });
  const coordinator = await prisma.coordinatorProfile.findUnique({
    where: { userId: user.id },
  });
  const isAdmin = user.role === UserRole.ADMIN;
  const isCoordinator = !!coordinator || user.role === UserRole.COORDINATOR;

  if (!couple && !isCoordinator && !isAdmin) {
    throw new Error("Unauthorized check-in scanning privileges.");
  }

  const tokenHash = hashPassToken(rawToken);

  return await prisma.$transaction(async (tx) => {
    const pass = await tx.guestPass.findUnique({
      where: { qrTokenHash: tokenHash },
      include: {
        booking: {
          include: {
            traveler: { include: { user: true } },
            wedding: true,
          },
        },
      },
    });

    if (!pass) {
      return { success: false, result: "INVALID" };
    }

    if (pass.booking.weddingId !== weddingId) {
      return { success: false, result: "WRONG_EVENT" };
    }

    // Verify authorized scanner for this specific event
    const isAuthorizedHost = couple && couple.id === pass.booking.wedding.hostCoupleId;
    const isAuthorizedCoordinator = coordinator && (
      coordinator.assignedWeddingId === weddingId ||
      coordinator.assignedEventTitle === pass.booking.wedding.title
    );

    if (!isAdmin && !isAuthorizedHost && !isAuthorizedCoordinator) {
      throw new Error("Unauthorized for this wedding event.");
    }

    // Handle non-ACTIVE pass statuses (REVOKED)
    if (pass.status === "REVOKED") {
      await tx.guestCheckIn.create({
        data: {
          guestPassId: pass.id,
          bookingId: pass.bookingId,
          weddingId,
          scannedByUserId: user.id,
          scanType: "ENTRY",
          result: "REVOKED",
          deviceMetadata,
        },
      });
      return { success: false, result: "REVOKED", pass };
    }

    // Handle pass expiration
    const isPassExpired = pass.status === "EXPIRED" || (pass.expiresAt && new Date(pass.expiresAt).getTime() < Date.now());
    if (isPassExpired) {
      if (pass.status === "ACTIVE") {
        await tx.guestPass.update({
          where: { id: pass.id },
          data: { status: "EXPIRED" },
        });
      }
      await tx.guestCheckIn.create({
        data: {
          guestPassId: pass.id,
          bookingId: pass.bookingId,
          weddingId,
          scannedByUserId: user.id,
          scanType: "ENTRY",
          result: "EXPIRED",
          deviceMetadata,
        },
      });
      return { success: false, result: "EXPIRED", pass };
    }

    // Enforce authoritative business predicate: booking must be in an admissible state (PAID, CONFIRMED, READY_FOR_EVENT)
    // Terminal or refunded bookings can NEVER be admitted.
    if (!canAdmitGuest(pass.booking.status, pass.status)) {
      await tx.guestCheckIn.create({
        data: {
          guestPassId: pass.id,
          bookingId: pass.bookingId,
          weddingId,
          scannedByUserId: user.id,
          scanType: "ENTRY",
          result: "BOOKING_INELIGIBLE",
          deviceMetadata,
        },
      });
      return {
        success: false,
        result: "BOOKING_INELIGIBLE",
        reason: `Booking is in ${pass.booking.status} status. Only valid active bookings can be admitted.`,
        pass,
      };
    }

    // ATOMIC check-in: only updates the pass when its current status is ACTIVE AND not expired.
    // If two scanners race on the same token, only one updateMany can match
    // and return count = 1. The other gets count = 0 and correctly returns ALREADY_USED.
    const now = new Date();
    const updated = await tx.guestPass.updateMany({
      where: {
        id: pass.id,
        status: "ACTIVE",
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      data: {
        status: "USED",
        scanCount: { increment: 1 },
        firstScannedAt: now,
        lastScannedAt: now,
      },
    });

    if (updated.count === 0) {
      // Another request won the race — pass is already used
      await tx.guestCheckIn.create({
        data: {
          guestPassId: pass.id,
          bookingId: pass.bookingId,
          weddingId,
          scannedByUserId: user.id,
          scanType: "ENTRY",
          result: "ALREADY_USED",
          deviceMetadata,
        },
      });
      return { success: false, result: "ALREADY_USED", pass };
    }

    // Successful first check-in
    await tx.guestCheckIn.create({
      data: {
        guestPassId: pass.id,
        bookingId: pass.bookingId,
        weddingId,
        scannedByUserId: user.id,
        scanType: "ENTRY",
        result: "SUCCESS",
        deviceMetadata,
      },
    });

    // Update Booking lifecycle status to CHECKED_IN
    await tx.booking.update({
      where: { id: pass.bookingId },
      data: { status: BookingStatus.CHECKED_IN },
    });

    await logReputationEvent({
      entityType: ReputationEntityType.TRAVELER,
      entityId: pass.booking.travelerId,
      type: ReputationEventType.SUCCESSFUL_CHECK_IN,
      scoreEffect: 2,
      referenceId: pass.bookingId,
      idempotencyKey: `SUCCESSFUL_CHECK_IN:${pass.bookingId}`
    });

    await createAuditLog(
      "CHECK_IN_PASS",
      "GuestPass",
      pass.id,
      `Traveler ${pass.booking.traveler.fullName} checked-in at entry gate.`
    );

    return { success: true, result: "SUCCESS", pass };
  }, { maxWait: 20000, timeout: 35000 });
}

/**
 * Host manual override bypass check-in.
 */
export async function manualCheckInAction(bookingId: string, notes?: string) {
  const user = await requireAuth();

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
  });
  const coordinator = await prisma.coordinatorProfile.findUnique({
    where: { userId: user.id },
  });
  const isAdmin = user.role === UserRole.ADMIN;
  const isCoordinator = !!coordinator || user.role === UserRole.COORDINATOR;

  if (!couple && !isCoordinator && !isAdmin) throw new Error("Unauthorized.");

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { wedding: true, traveler: { include: { user: true } } },
    });

    if (!booking) throw new Error("Booking not found.");

    const isAuthorizedHost = couple && couple.id === booking.wedding.hostCoupleId;
    const isAuthorizedCoordinator = coordinator && (
      coordinator.assignedWeddingId === booking.weddingId ||
      coordinator.assignedEventTitle === booking.wedding.title
    );

    if (!isAdmin && !isAuthorizedHost && !isAuthorizedCoordinator) {
      throw new Error("Unauthorized.");
    }

    // Enforce authoritative business predicate: booking must be in an admissible state
    if (!canAdmitGuest(booking.status, "ACTIVE")) {
      throw new Error(`Cannot manually check in booking in ${booking.status} status. Only valid paid bookings can be checked in.`);
    }

    // Invalidate/consume any active guest pass to prevent subsequent replay at gate
    await tx.guestPass.updateMany({
      where: { bookingId, status: "ACTIVE" },
      data: {
        status: "USED",
        scanCount: { increment: 1 },
        firstScannedAt: new Date(),
        lastScannedAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CHECKED_IN },
    });

    await logReputationEvent({
      entityType: ReputationEntityType.TRAVELER,
      entityId: booking.travelerId,
      type: ReputationEventType.SUCCESSFUL_CHECK_IN,
      scoreEffect: 2,
      referenceId: bookingId,
      idempotencyKey: `SUCCESSFUL_CHECK_IN:${bookingId}`
    });

    await tx.notification.create({
      data: {
        userId: booking.traveler.user.id,
        title: "Checked In (Manual)",
        message: "You have been marked as checked-in by the host.",
        type: "SUCCESS",
      },
    });

    await createAuditLog(
      "MANUAL_CHECK_IN",
      "Booking",
      bookingId,
      `Host manually marked booking ${bookingId} checked-in. Notes: ${notes || "None"}`
    );

    return { success: true };
  }, { maxWait: 20000, timeout: 35000 });
}

/**
 * Marks attendance confirmation or no-show.
 */
export async function markAttendanceAction(bookingId: string, status: "ATTENDED" | "NO_SHOW") {
  const user = await requireAuth();

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
  });
  const coordinator = await prisma.coordinatorProfile.findUnique({
    where: { userId: user.id },
  });
  const isAdmin = user.role === UserRole.ADMIN;
  const isCoordinator = !!coordinator || user.role === UserRole.COORDINATOR;

  if (!couple && !isCoordinator && !isAdmin) throw new Error("Unauthorized.");

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { wedding: true, traveler: { include: { user: true } } },
    });

    if (!booking) throw new Error("Booking not found.");

    const isAuthorizedHost = couple && couple.id === booking.wedding.hostCoupleId;
    const isAuthorizedCoordinator = coordinator && (
      coordinator.assignedWeddingId === booking.weddingId ||
      coordinator.assignedEventTitle === booking.wedding.title
    );

    if (!isAdmin && !isAuthorizedHost && !isAuthorizedCoordinator) {
      throw new Error("Unauthorized.");
    }

    // Enforce authoritative business predicate: booking must be CHECKED_IN first
    if (!canMarkAttendance(booking.status)) {
      throw new Error(`Cannot mark attendance for booking in ${booking.status} status. Booking must be CHECKED_IN first.`);
    }

    const nextStatus = status === "ATTENDED" ? BookingStatus.ATTENDED : BookingStatus.NO_SHOW;

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: nextStatus },
    });

    if (status === "ATTENDED") {
      await logReputationEvent({
        entityType: ReputationEntityType.TRAVELER,
        entityId: booking.travelerId,
        type: ReputationEventType.BOOKING_COMPLETED,
        scoreEffect: 5,
        referenceId: bookingId,
        idempotencyKey: `BOOKING_COMPLETED:TRAVELER:${bookingId}`
      });

      await logReputationEvent({
        entityType: ReputationEntityType.HOST,
        entityId: booking.wedding.hostCoupleId,
        type: ReputationEventType.BOOKING_COMPLETED,
        scoreEffect: 5,
        referenceId: bookingId,
        idempotencyKey: `BOOKING_COMPLETED:HOST:${bookingId}`
      });

      await logReputationEvent({
        entityType: ReputationEntityType.WEDDING,
        entityId: booking.weddingId,
        type: ReputationEventType.BOOKING_COMPLETED,
        scoreEffect: 5,
        referenceId: bookingId,
        idempotencyKey: `BOOKING_COMPLETED:WEDDING:${bookingId}`
      });
    } else if (status === "NO_SHOW") {
      await logReputationEvent({
        entityType: ReputationEntityType.TRAVELER,
        entityId: booking.travelerId,
        type: ReputationEventType.NO_SHOW,
        scoreEffect: -20,
        referenceId: bookingId,
        idempotencyKey: `NO_SHOW:TRAVELER:${bookingId}`
      });
    }

    await createAuditLog(
      "MARK_ATTENDANCE",
      "Booking",
      bookingId,
      `Attendance status updated to ${status} for booking ${bookingId}`
    );

    return { success: true };
  }, { maxWait: 20000, timeout: 35000 });
}

/**
 * Traveler submits emergency contact details.
 */
export async function saveEmergencyContactAction(data: z.infer<typeof emergencyContactSchema>) {
  const user = await requireAuth();
  const payload = emergencyContactSchema.parse(data);

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { traveler: { include: { user: true } } },
  });

  if (!booking || booking.traveler.user.id !== user.id) {
    throw new Error("Unauthorized.");
  }

  return await prisma.$transaction(async (tx) => {
    const contact = await tx.emergencyContact.upsert({
      where: { bookingId: payload.bookingId },
      create: payload,
      update: payload,
    });

    // Checkoff readiness checklist item
    await tx.travelerPreparation.update({
      where: { bookingId: payload.bookingId },
      data: { emergencyContactCompleted: true },
    });

    // Auto calculate preparation updates
    await calculateTravelerReadiness(tx, payload.bookingId);

    return contact;
  }, { maxWait: 20000, timeout: 35000 });
}

/**
 * Traveler submits travel and accommodation details.
 */
export async function saveTravelDetailsAction(data: z.input<typeof travelDetailSchema>) {
  const user = await requireAuth();
  const payload = travelDetailSchema.parse(data);

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { traveler: { include: { user: true } } },
  });

  if (!booking || booking.traveler.user.id !== user.id) {
    throw new Error("Unauthorized.");
  }

  return await prisma.$transaction(async (tx) => {
    const detail = await tx.travelDetail.upsert({
      where: { bookingId: payload.bookingId },
      create: payload,
      update: payload,
    });

    await tx.travelerPreparation.update({
      where: { bookingId: payload.bookingId },
      data: { travelDetailsCompleted: true },
    });

    await calculateTravelerReadiness(tx, payload.bookingId);

    return detail;
  }, { maxWait: 20000, timeout: 35000 });
}

/**
 * Checks and updates traveler checklist acknowledgement items.
 */
export async function updateTravelerPreparationAction(bookingId: string, updates: {
  culturalGuideViewed?: boolean;
  dressCodeAcknowledged?: boolean;
  itineraryViewed?: boolean;
  venueInstructionsViewed?: boolean;
}) {
  const user = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { traveler: { include: { user: true } } },
  });

  if (!booking || booking.traveler.user.id !== user.id) {
    throw new Error("Unauthorized.");
  }

  return await prisma.$transaction(async (tx) => {
    const prep = await tx.travelerPreparation.update({
      where: { bookingId },
      data: updates,
    });

    await calculateTravelerReadiness(tx, bookingId);

    return prep;
  }, { maxWait: 20000, timeout: 35000 });
}

/**
 * Center calculation weights to update traveler readiness percentage.
 */
async function calculateTravelerReadiness(tx: Prisma.TransactionClient, bookingId: string) {
  const prep = await tx.travelerPreparation.findUnique({
    where: { bookingId },
  });
  if (!prep) return;

  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking) return;

  // Checklist items
  // Required: emergency contact, dress code acknowledgement
  const requiredTasks = [prep.emergencyContactCompleted, prep.dressCodeAcknowledged];
  const recommendedTasks = [prep.culturalGuideViewed, prep.itineraryViewed, prep.venueInstructionsViewed];
  const optionalTasks = [prep.travelDetailsCompleted];

  const totalTasksCount = requiredTasks.length + recommendedTasks.length + optionalTasks.length;
  const completedTasksCount =
    requiredTasks.filter(Boolean).length +
    recommendedTasks.filter(Boolean).length +
    optionalTasks.filter(Boolean).length;

  const _percentage = Math.round((completedTasksCount / totalTasksCount) * 100);

  const allRequiredComplete = requiredTasks.every(Boolean);

  // If all required tasks completed, transition booking status to READY_FOR_EVENT
  if (allRequiredComplete && booking.status === BookingStatus.PAID) {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.READY_FOR_EVENT },
    });
  } else if (!allRequiredComplete && booking.status === BookingStatus.READY_FOR_EVENT) {
    // If a mandatory task was unchecked, drop back to PAID/CONFIRMED
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.PAID },
    });
  }

  await tx.travelerPreparation.update({
    where: { bookingId },
    data: {
      completedAt: allRequiredComplete ? new Date() : null,
    },
  });
}

/**
 * Hosts manages itinerary items schedules.
 */
export async function createItineraryItemAction(data: z.input<typeof itineraryItemSchema>) {
  const user = await requireAuth();

  const { assertCanHost } = require("./safety");
  await assertCanHost(user.id);

  const payload = itineraryItemSchema.parse(data);

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
  });
  if (!couple) throw new Error("Unauthorized.");

  const wedding = await prisma.wedding.findFirst({
    where: { id: payload.weddingId, hostCoupleId: couple.id },
  });
  if (!wedding) throw new Error("Wedding not found or unauthorized.");

  const item = await prisma.weddingItineraryItem.create({
    data: payload,
  });

  revalidatePath(`/dashboard/operations`);
  return item;
}

export async function deleteItineraryItemAction(itemId: string) {
  const user = await requireAuth();

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
  });
  if (!couple && user.role !== UserRole.ADMIN) throw new Error("Unauthorized.");

  const item = await prisma.weddingItineraryItem.findUnique({
    where: { id: itemId },
    include: { wedding: true },
  });
  if (!item) throw new Error("Itinerary item not found.");

  if (user.role !== UserRole.ADMIN && item.wedding.hostCoupleId !== couple?.id) {
    throw new Error("Unauthorized.");
  }

  await prisma.weddingItineraryItem.delete({
    where: { id: itemId },
  });

  revalidatePath(`/dashboard/operations`);
  return { success: true };
}

/**
 * Broadcaster announcements for guests.
 */
export async function publishWeddingAnnouncementAction(data: z.infer<typeof announcementSchema>) {
  const user = await requireAuth();

  const { assertCanHost } = require("./safety");
  await assertCanHost(user.id);

  const payload = announcementSchema.parse(data);

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
  });
  if (!couple) throw new Error("Unauthorized.");

  const wedding = await prisma.wedding.findFirst({
    where: { id: payload.weddingId, hostCoupleId: couple.id },
  });
  if (!wedding) throw new Error("Wedding not found.");

  const announcement = await prisma.weddingAnnouncement.create({
    data: {
      ...payload,
      authorId: user.id,
    },
  });

  // Find all active/paid/confirmed bookings to notify
  const bookings = await prisma.booking.findMany({
    where: {
      weddingId: payload.weddingId,
      status: { in: [BookingStatus.PAID, BookingStatus.READY_FOR_EVENT, BookingStatus.CHECKED_IN] },
    },
    include: { traveler: { include: { user: true } } },
  });

  // Notify travelers
  for (const b of bookings) {
    await prisma.notification.create({
      data: {
        userId: b.traveler.user.id,
        title: `Announcement: ${payload.title}`,
        message: payload.message,
        type: payload.priority === "URGENT" ? "ALERT" : "INFO",
      },
    });

    if (payload.priority === "URGENT" || payload.priority === "IMPORTANT") {
      try {
        const { sendWeddingAnnouncementEmail } = require("../email");
        await sendWeddingAnnouncementEmail(
          b.traveler.user.email,
          b.traveler.fullName,
          wedding.title,
          payload.title,
          payload.message
        );
      } catch (err) {
        console.error("Failed to send announcement email:", err);
      }
    }
  }

  revalidatePath(`/dashboard/operations`);
  return announcement;
}

/**
 * Saves or updates accompanying BookingGuest records for a booking manifest.
 */
export async function saveBookingGuestsAction(
  bookingId: string,
  guests: Array<{
    id?: string;
    fullName: string;
    email?: string | null;
    age?: number | null;
    gender?: string | null;
    foodPreference?: string;
    accessibilityNeed?: string;
  }>
) {
  const user = await requireAuth();

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { traveler: { include: { user: true } } },
    });

    if (!booking) throw new Error("Booking not found.");
    if (booking.traveler.user.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new Error("Unauthorized access to booking.");
    }

    if (guests.length > Math.max(0, booking.guestsCount - 1)) {
      throw new Error(`Cannot register more than ${Math.max(0, booking.guestsCount - 1)} accompanying guests.`);
    }

    // Delete existing accompanying guest records for this booking and re-create cleanly
    await tx.bookingGuest.deleteMany({
      where: { bookingId },
    });

    const sanitized = (guests || [])
      .slice(0, Math.max(0, booking.guestsCount - 1))
      .filter((g) => g && typeof g.fullName === "string" && g.fullName.trim().length > 0)
      .map((g) => ({
        bookingId,
        fullName: g.fullName.trim().slice(0, 100),
        email: typeof g.email === "string" && g.email.trim().length > 0 ? g.email.trim().slice(0, 150) : null,
        age: typeof g.age === "number" && !isNaN(g.age) && g.age > 0 && g.age < 120 ? Math.floor(g.age) : null,
        gender: typeof g.gender === "string" && g.gender.trim().length > 0 ? g.gender.trim().slice(0, 30) : null,
        foodPreference: typeof g.foodPreference === "string" && g.foodPreference.trim().length > 0 ? g.foodPreference.trim().slice(0, 500) : "No Restrictions",
        accessibilityNeed: typeof g.accessibilityNeed === "string" && g.accessibilityNeed.trim().length > 0 ? g.accessibilityNeed.trim().slice(0, 500) : "None",
      }));

    if (sanitized.length > 0) {
      await tx.bookingGuest.createMany({
        data: sanitized,
      });
    }

    try {
      revalidatePath(`/dashboard/events/${bookingId}`);
    } catch {}
    return { success: true, count: sanitized.length };
  }, { maxWait: 20000, timeout: 35000 });
}
