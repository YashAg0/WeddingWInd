import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// POST /api/agent-application — submit a new agent application
// Creates User + AgentProfile (not verified yet — admin reviews)
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole([UserRole.AGENT]);
    const body = await req.json();
    const { fullName, email, phone: _phone, country, city, focusArea, networkType, networkDetails } = body;

    if (!fullName || !email || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a referral code (pending — admin activates)
    const crypto = require('crypto');
    const shortcode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const referralCode = `WWI-AGENT-${shortcode}`;

    if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Use the email on your signed-in account." }, { status: 400 });
    }
    if (user.agentProfile) {
      return NextResponse.json({ error: "An application already exists for this email address." }, { status: 409 });
    }

    const agentProfile = await prisma.agentProfile.create({
      data: {
        userId: user.id,
        organization: `${networkType} / ${city}`,
        country: country || "India",
        experienceYears: 0,
        targetAudience: focusArea === "traveler" ? "Travelers" : focusArea === "host" ? "Host families" : "Both travelers and hosts",
        verifiedChecks: false, // Not verified — admin reviews
        referralCode
      }
    });

    // Create a verification record for admin review
    await prisma.verification.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        status: "PENDING",
        submissionDate: new Date(),
        notes: `Agent application. Network: ${networkDetails}. Focus: ${focusArea}.`
      },
      update: { status: "PENDING", submissionDate: new Date(), notes: `Agent application. Network: ${networkDetails}. Focus: ${focusArea}.` }
    });

    // AuditLog
    await prisma.auditLog.create({
      data: {
        action: "AGENT_APPLICATION_SUBMITTED",
        entity: "AgentProfile",
        entityId: agentProfile.id,
        userId: user.id,
        userName: fullName,
        details: `Agent application from ${fullName} in ${city}, ${country}.`
      }
    });

    return NextResponse.json({
      success: true,
      applicationRef: referralCode,
      message: "Application submitted for admin review"
    });
  } catch (error: any) {
    console.error("[API /agent-application POST]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
