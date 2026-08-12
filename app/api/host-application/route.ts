import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UserRole, VerificationStatus } from "@prisma/client";
import { resolveHostApplicationState } from "@/lib/actions/host-application";

/**
 * GET /api/host-application
 * Authoritative database-backed resolution of host application state.
 * Detects whether the authenticated user owns an active / in-progress host application.
 * Returns restored form fields, admin notes, and application status.
 */
export async function GET() {
  try {
    const state = await resolveHostApplicationState();
    return NextResponse.json(state);
  } catch (error: any) {
    console.error("[API /host-application GET]", error);
    const message = error?.message || "Internal server error";
    if (message.startsWith("UNAUTHORIZED")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.startsWith("SERVICE_UNAVAILABLE")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/host-application — Submit or Update a host celebration application.
 * Duplicate-safe: Server checks if user owns an existing non-demo wedding and updates
 * it in place, preserving the original Wedding ID.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const {
      hostName,
      email,
      phone: _phone,
      coupleNames,
      city,
      state,
      venue,
      weddingDate,
      durationDays,
      religion,
      story,
      photoUrl,
      intlGuestCapacity,
      existingApplicationId,
    } = body;

    if (!hostName || !email || !coupleNames || !city || !weddingDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (email.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
      return NextResponse.json({ error: "Use the email on your signed-in account." }, { status: 400 });
    }

    // Upgrade TRAVELER to COUPLE role automatically
    if (user.role === UserRole.TRAVELER) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.COUPLE },
      });
    }

    // Ensure couple profile exists
    let coupleProfile = await prisma.coupleProfile.findUnique({
      where: { userId: user.id },
      include: {
        weddings: {
          where: { isDemo: false, deletedAt: null },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!coupleProfile) {
      coupleProfile = await prisma.coupleProfile.create({
        data: {
          userId: user.id,
          weddingDate: new Date(weddingDate),
          weddingLocation: `${venue || city}, ${city}, ${state || ""}`.trim(),
          expectedGuests: intlGuestCapacity || 10,
          languagesSpoken: "English",
          familyBio: story || "",
        },
        include: {
          weddings: {
            where: { isDemo: false, deletedAt: null },
            orderBy: { updatedAt: "desc" },
          },
        },
      });
    } else {
      // Update couple profile fields
      await prisma.coupleProfile.update({
        where: { id: coupleProfile.id },
        data: {
          weddingDate: new Date(weddingDate),
          weddingLocation: `${venue || city}, ${city}, ${state || ""}`.trim(),
          expectedGuests: intlGuestCapacity || 10,
          familyBio: story || "",
        },
      });
    }

    // Check for existing application by ID or by host couple relationship
    let existingWedding = null;
    if (existingApplicationId) {
      existingWedding = await prisma.wedding.findFirst({
        where: {
          id: existingApplicationId,
          hostCoupleId: coupleProfile.id,
          isDemo: false,
        },
      });
    }

    if (!existingWedding && coupleProfile.weddings && coupleProfile.weddings.length > 0) {
      // Pick the active non-demo wedding to update rather than creating a duplicate
      existingWedding = coupleProfile.weddings[0];
    }

    let wedding;
    let isUpdate = false;

    if (existingWedding) {
      // UPDATE EXISTING WEDDING IN PLACE — PRESERVE WEDDING ID
      isUpdate = true;
      wedding = await prisma.wedding.update({
        where: { id: existingWedding.id },
        data: {
          title: `${coupleNames} Wedding`,
          description: story || `A beautiful wedding celebration in ${city}.`,
          location: `${venue || city}, ${city}, ${state || ""}`.trim(),
          category: religion || "Traditional",
          date: new Date(weddingDate),
          capacity: intlGuestCapacity || 10,
          mainImageUrl: photoUrl || existingWedding.mainImageUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
          status: "DRAFT", // Reset status to DRAFT for admin re-review
        },
      });
    } else {
      // CREATE NEW WEDDING ONLY IF NO APPLICATION EXISTS FOR THIS HOST
      const slug = `${coupleNames.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${city.toLowerCase()}-${Date.now()}`;
      wedding = await prisma.wedding.create({
        data: {
          slug,
          title: `${coupleNames} Wedding`,
          description: story || `A beautiful wedding celebration in ${city}.`,
          location: `${venue || city}, ${city}, ${state || ""}`.trim(),
          category: religion || "Traditional",
          date: new Date(weddingDate),
          pricePerGuest: 16000, // Tier 2 default
          capacity: intlGuestCapacity || 10,
          mainImageUrl: photoUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
          status: "DRAFT",
          hostCoupleId: coupleProfile.id,
        },
      });
    }

    // Upsert verification record back to PENDING review status
    const submissionNote = isUpdate
      ? `Host updated and resubmitted application for ${coupleNames}. Duration: ${durationDays} days.`
      : `Host application submitted for ${coupleNames}. Duration: ${durationDays} days.`;

    await prisma.verification.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        status: VerificationStatus.PENDING,
        submissionDate: new Date(),
        notes: submissionNote,
      },
      update: {
        status: VerificationStatus.PENDING,
        submissionDate: new Date(),
        notes: submissionNote,
      },
    });

    // Create AuditLog entry
    await prisma.auditLog.create({
      data: {
        action: isUpdate ? "HOST_APPLICATION_RESUBMITTED" : "HOST_APPLICATION_SUBMITTED",
        entity: "Wedding",
        entityId: wedding.id,
        userId: user.id,
        userName: hostName,
        details: isUpdate
          ? `Updated host application for ${coupleNames} in ${city} (ID: ${wedding.id}).`
          : `New host application for ${coupleNames} in ${city} (ID: ${wedding.id}).`,
      },
    });

    return NextResponse.json({
      success: true,
      isUpdate,
      applicationId: wedding.id,
      hostName,
      coupleNames,
      city,
    });
  } catch (error: any) {
    console.error("[API /host-application POST]", error);
    const message = error?.message || "Internal server error";
    if (message.startsWith("UNAUTHORIZED")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.startsWith("FORBIDDEN") || message.startsWith("BANNED")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.startsWith("SERVICE_UNAVAILABLE")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
