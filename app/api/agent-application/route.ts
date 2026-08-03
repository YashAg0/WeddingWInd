import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/agent-application — submit a new agent application
// Creates User + AgentProfile (not verified yet — admin reviews)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, country, city, focusArea, networkType, networkDetails } = body;

    if (!fullName || !email || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a referral code (pending — admin activates)
    const shortcode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const referralCode = `WWI-AGENT-${shortcode}`;

    // Check if this email already applied
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { agentProfile: true }
    });
    if (existingUser?.agentProfile) {
      return NextResponse.json({ error: "An application already exists for this email address." }, { status: 409 });
    }

    let userId = existingUser?.id;
    if (!userId) {
      const newUser = await prisma.user.create({
        data: {
          clerkUserId: `agent_app_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          email,
          name: fullName,
          role: "AGENT",
          status: "ONBOARDING"
        }
      });
      userId = newUser.id;
    }

    const agentProfile = await prisma.agentProfile.create({
      data: {
        userId,
        organization: `${networkType} / ${city}`,
        country: country || "India",
        experienceYears: 0,
        targetAudience: focusArea === "traveler" ? "Travelers" : focusArea === "host" ? "Host families" : "Both travelers and hosts",
        verifiedChecks: false, // Not verified — admin reviews
        referralCode
      }
    });

    // Create a verification record for admin review
    await prisma.verification.create({
      data: {
        userId,
        status: "PENDING",
        submissionDate: new Date(),
        notes: `Agent application. Network: ${networkDetails}. Focus: ${focusArea}. Phone: ${phone}.`
      }
    });

    // AuditLog
    await prisma.auditLog.create({
      data: {
        action: "AGENT_APPLICATION_SUBMITTED",
        entity: "AgentProfile",
        entityId: agentProfile.id,
        userId,
        userName: fullName,
        details: `Agent application from ${fullName} (${email}) in ${city}, ${country}.`
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
