import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

// GET /api/admin/agents — list all agent applications
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const agents = await prisma.agentProfile.findMany({
      include: {
        user: {
          include: { verification: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error("[API /admin/agents GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/agents — approve or reject an agent
export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { agentProfileId, action } = body;

    if (!agentProfileId || !action) {
      return NextResponse.json({ error: "Missing agentProfileId or action" }, { status: 400 });
    }

    const agentProfile = await prisma.agentProfile.findUnique({
      where: { id: agentProfileId },
      include: { user: true }
    });
    if (!agentProfile) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Set verifiedChecks = true on AgentProfile, set user.status = ACTIVE
      const [updatedProfile] = await Promise.all([
        prisma.agentProfile.update({
          where: { id: agentProfileId },
          data: { verifiedChecks: true },
          include: { user: true }
        }),
        prisma.user.update({
          where: { id: agentProfile.userId },
          data: { status: "ACTIVE" }
        })
      ]);

      await prisma.auditLog.create({
        data: {
          action: "ADMIN_AGENT_APPROVE",
          entity: "AgentProfile",
          entityId: agentProfileId,
          userId: "admin",
          userName: "Platform Admin",
          details: `Agent ${agentProfile.user.name} approved. Referral code: ${agentProfile.referralCode}`,
        }
      });

      return NextResponse.json({ agent: updatedProfile, referralCode: agentProfile.referralCode });

    } else if (action === "reject") {
      const [updatedProfile] = await Promise.all([
        prisma.agentProfile.update({
          where: { id: agentProfileId },
          data: { verifiedChecks: false },
          include: { user: true }
        }),
        prisma.user.update({
          where: { id: agentProfile.userId },
          data: { status: "BANNED" }
        })
      ]);

      await prisma.auditLog.create({
        data: {
          action: "ADMIN_AGENT_REJECT",
          entity: "AgentProfile",
          entityId: agentProfileId,
          userId: "admin",
          userName: "Platform Admin",
          details: `Agent ${agentProfile.user.name} application declined.`,
        }
      });

      return NextResponse.json({ agent: updatedProfile });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[API /admin/agents PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
