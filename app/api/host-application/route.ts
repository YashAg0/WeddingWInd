import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// POST /api/host-application — submit a new host celebration application
// Creates User + CoupleProfile + Wedding (DRAFT status awaiting admin verification)
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole([UserRole.COUPLE]);
    const body = await req.json();
    const {
      hostName, email, phone: _phone, coupleNames, city, state,
      venue, weddingDate, durationDays, religion, story,
      photoUrl, intlGuestCapacity
    } = body;

    if (!hostName || !email || !coupleNames || !city || !weddingDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Applications belong to the authenticated host; never create a synthetic
    // account from an email supplied in the request.
    if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Use the email on your signed-in account." }, { status: 400 });
    }

    // Ensure couple profile exists
    let coupleProfile = await prisma.coupleProfile.findUnique({ where: { userId: user.id } });
    if (!coupleProfile) {
      coupleProfile = await prisma.coupleProfile.create({
        data: {
          userId: user.id,
          weddingDate: new Date(weddingDate),
          weddingLocation: `${venue}, ${city}, ${state}`,
          expectedGuests: intlGuestCapacity || 10,
          languagesSpoken: "English",
          familyBio: story || ""
        }
      });
    }

    // Create the Indian Wedding Experience in DRAFT status
    const slug = `${coupleNames.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${city.toLowerCase()}-${Date.now()}`;
    const wedding = await prisma.wedding.create({
      data: {
        slug,
        title: `${coupleNames} Wedding`,
        description: story || `A beautiful wedding celebration in ${city}.`,
        location: `${venue}, ${city}, ${state}`,
        category: religion || "Traditional",
        date: new Date(weddingDate),
        pricePerGuest: 16000, // Default to tier 2; admin can update
        capacity: intlGuestCapacity || 10,
        mainImageUrl: photoUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
        status: "DRAFT", // Always starts DRAFT for admin verification
        hostCoupleId: coupleProfile.id
      }
    });

    // Create verification record
    await prisma.verification.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        status: "PENDING",
        submissionDate: new Date(),
        notes: `Host application submitted. Duration: ${durationDays} days.`
      },
      update: { status: "PENDING", submissionDate: new Date(), notes: `Host application submitted. Duration: ${durationDays} days.` }
    });

    // AuditLog
    await prisma.auditLog.create({
      data: {
        action: "HOST_APPLICATION_SUBMITTED",
        entity: "Wedding",
        entityId: wedding.id,
        userId: user.id,
        userName: hostName,
        details: `New host application for ${coupleNames} in ${city}.`
      }
    });

    return NextResponse.json({
      success: true,
      applicationId: wedding.id,
      hostName,
      coupleNames,
      city
    });
  } catch (error: any) {
    console.error("[API /host-application POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
