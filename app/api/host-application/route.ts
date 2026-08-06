import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/host-application — submit a new host celebration application
// Creates User + CoupleProfile + Wedding (DRAFT status awaiting admin verification)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      hostName, email, phone, coupleNames, city, state,
      venue, weddingDate, durationDays, religion, story,
      photoUrl, intlGuestCapacity
    } = body;

    if (!hostName || !email || !coupleNames || !city || !weddingDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists with this email
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create a new guest user record for this host application
      user = await prisma.user.create({
        data: {
          clerkUserId: `host_app_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          email,
          name: hostName,
          role: "COUPLE",
          status: "ONBOARDING"
        }
      });
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
    await prisma.verification.create({
      data: {
        userId: user.id,
        status: "PENDING",
        submissionDate: new Date(),
        notes: `Host application submitted. Contact: ${phone}. Duration: ${durationDays} days.`
      }
    });

    // AuditLog
    await prisma.auditLog.create({
      data: {
        action: "HOST_APPLICATION_SUBMITTED",
        entity: "Wedding",
        entityId: wedding.id,
        userId: user.id,
        userName: hostName,
        details: `New host application for ${coupleNames} in ${city}. Email: ${email}.`
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
