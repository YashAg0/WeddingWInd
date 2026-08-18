import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UserRole, VerificationStatus } from "@prisma/client";
import {
  resolveHostApplicationState,
  saveHostApplicationDraftAction,
  submitHostApplicationAction,
} from "@/lib/actions/host-application";

/**
 * GET /api/host-application
 * Authoritative database-backed resolution of host application state.
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
 * Duplicate-safe: Updates in place and creates/updates both HostApplication and Wedding records.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const {
      hostName,
      email,
      phone,
      preferredContactMethod,
      brideName,
      groomName,
      coupleNames,
      city,
      state,
      venue,
      venueName,
      weddingDate,
      durationDays,
      religion,
      tradition,
      weddingScale,
      expectedTotalGuests,
      expectedInternationalGuests,
      requestedTier,
      story,
      photoUrl,
      intlGuestCapacity,
      existingApplicationId,
      days,
      isDraft,
    } = body;

    const resolvedEmail = email || user.email;
    const resolvedHostName = hostName || user.name || "Host";
    const resolvedCoupleNames = coupleNames || (brideName && groomName ? `${brideName} & ${groomName}` : "Our Wedding");
    const resolvedCity = city || "City";
    const resolvedDate = weddingDate || new Date().toISOString().split("T")[0];

    if (!resolvedHostName || !resolvedEmail || !resolvedCoupleNames || !resolvedCity || !resolvedDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (resolvedEmail.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
      return NextResponse.json({ error: "Use the email on your signed-in account." }, { status: 400 });
    }

    // Upgrade TRAVELER to COUPLE role automatically
    if (user.role === UserRole.TRAVELER) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.COUPLE },
      });
    }

    // Ensure couple profile exists with P2002 race protection
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
      try {
        coupleProfile = await prisma.coupleProfile.create({
          data: {
            userId: user.id,
            weddingDate: new Date(resolvedDate),
            weddingLocation: `${venueName || venue || resolvedCity}, ${resolvedCity}, ${state || ""}`.trim(),
            expectedGuests: expectedInternationalGuests || intlGuestCapacity || 10,
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
      } catch (createErr: any) {
        if (createErr?.code === "P2002") {
          coupleProfile = await prisma.coupleProfile.findUnique({
            where: { userId: user.id },
            include: {
              weddings: {
                where: { isDemo: false, deletedAt: null },
                orderBy: { updatedAt: "desc" },
              },
            },
          });
        } else {
          throw createErr;
        }
      }
    } else {
      await prisma.coupleProfile.update({
        where: { id: coupleProfile.id },
        data: {
          weddingDate: new Date(resolvedDate),
          weddingLocation: `${venueName || venue || resolvedCity}, ${resolvedCity}, ${state || ""}`.trim(),
          expectedGuests: expectedInternationalGuests || intlGuestCapacity || 10,
          familyBio: story || "",
        },
      });
    }

    if (!coupleProfile) {
      return NextResponse.json({ error: "Failed to resolve couple profile." }, { status: 500 });
    }

    // Check for existing wedding by ID or by host couple relationship
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
      existingWedding = coupleProfile.weddings[0];
    }

    if (!existingWedding) {
      existingWedding = await prisma.wedding.findFirst({
        where: {
          hostCoupleId: coupleProfile.id,
          isDemo: false,
          deletedAt: null,
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    const { resolveCulturalProfileDefaults, validateWeddingAuthenticity } = await import("@/lib/culture");
    const parsedReligion = tradition || religion || "Hindu";
    const cultDefaults = resolveCulturalProfileDefaults(parsedReligion, state || resolvedCity, undefined);

    const cultValidation = validateWeddingAuthenticity({
      religion: parsedReligion,
      title: `${resolvedCoupleNames} Wedding`,
      description: story || "",
    });

    if (!cultValidation.isValid) {
      return NextResponse.json(
        { error: `Cultural Authenticity Error: ${cultValidation.errors.join("; ")}` },
        { status: 400 }
      );
    }

    let wedding;
    let isUpdate = false;

    if (existingWedding) {
      isUpdate = true;
      wedding = await prisma.wedding.update({
        where: { id: existingWedding.id },
        data: {
          title: `${resolvedCoupleNames} Wedding`,
          description: story || `A beautiful wedding celebration in ${resolvedCity}.`,
          location: `${venueName || venue || resolvedCity}, ${resolvedCity}, ${state || ""}`.trim(),
          category: tradition || religion || "Traditional",
          religion: parsedReligion,
          region: state || resolvedCity || cultDefaults.region,
          community: cultDefaults.community,
          foodContext: cultDefaults.foodContext,
          dressExpectations: cultDefaults.dressExpectations,
          guestRules: cultDefaults.guestRules,
          etiquetteNotes: cultDefaults.etiquetteNotes,
          date: new Date(resolvedDate),
          capacity: expectedInternationalGuests || intlGuestCapacity || 10,
          mainImageUrl: photoUrl || existingWedding.mainImageUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
          status: "DRAFT",
        },
      });
    } else {
      const slug = `${resolvedCoupleNames.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${resolvedCity.toLowerCase()}-${Date.now()}`;
      wedding = await prisma.wedding.create({
        data: {
          slug,
          title: `${resolvedCoupleNames} Wedding`,
          description: story || `A beautiful wedding celebration in ${resolvedCity}.`,
          location: `${venueName || venue || resolvedCity}, ${resolvedCity}, ${state || ""}`.trim(),
          category: tradition || religion || "Traditional",
          religion: parsedReligion,
          region: state || resolvedCity || cultDefaults.region,
          community: cultDefaults.community,
          foodContext: cultDefaults.foodContext,
          dressExpectations: cultDefaults.dressExpectations,
          guestRules: cultDefaults.guestRules,
          etiquetteNotes: cultDefaults.etiquetteNotes,
          date: new Date(resolvedDate),
          pricePerGuest: 16000,
          capacity: expectedInternationalGuests || intlGuestCapacity || 10,
          mainImageUrl: photoUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
          status: "DRAFT",
          hostCoupleId: coupleProfile.id,
          events: {
            create: cultDefaults.defaultCeremonies.map((c) => ({
              name: c.name,
              description: c.description,
              date: new Date(resolvedDate),
              startTime: c.defaultTimeRange.split("-")[0]?.trim() || "17:00",
              endTime: c.defaultTimeRange.split("-")[1]?.trim() || "22:00",
              location: `${venueName || venue || resolvedCity}, ${resolvedCity}`,
            })),
          },
          traditions: {
            create: cultDefaults.defaultTraditions.map((t) => ({
              name: t.name,
              description: t.description,
            })),
          },
        },
      });
    }

    // Save structured HostApplication record
    try {
      const appInput = {
        applicationId: existingApplicationId || wedding.id,
        hostName: resolvedHostName,
        email: resolvedEmail,
        phone,
        preferredContactMethod,
        brideName,
        groomName,
        coupleNames: resolvedCoupleNames,
        city: resolvedCity,
        state,
        venueName: venueName || venue,
        weddingDate: resolvedDate,
        durationDays: Number(durationDays) || 3,
        tradition: parsedReligion,
        weddingScale,
        expectedTotalGuests: Number(expectedTotalGuests) || 200,
        expectedInternationalGuests: Number(expectedInternationalGuests || intlGuestCapacity) || 20,
        requestedTier: requestedTier || "SIGNATURE_ROYAL",
        story,
        days: days || [],
      };

      if (isDraft) {
        await saveHostApplicationDraftAction(appInput);
      } else {
        await submitHostApplicationAction(appInput);
      }
    } catch (appErr) {
      console.warn("[POST /host-application] HostApplication save warning:", appErr);
    }

    // Upsert verification record back to PENDING review status
    const submissionNote = isUpdate
      ? `Host updated and resubmitted application for ${resolvedCoupleNames}. Duration: ${durationDays || 3} days.`
      : `Host application submitted for ${resolvedCoupleNames}. Duration: ${durationDays || 3} days.`;

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
        userName: resolvedHostName,
        details: isUpdate
          ? `Updated host application for ${resolvedCoupleNames} in ${resolvedCity} (ID: ${wedding.id}).`
          : `New host application for ${resolvedCoupleNames} in ${resolvedCity} (ID: ${wedding.id}).`,
      },
    });

    return NextResponse.json({
      success: true,
      isUpdate,
      applicationId: wedding.id,
      hostName: resolvedHostName,
      coupleNames: resolvedCoupleNames,
      city: resolvedCity,
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
