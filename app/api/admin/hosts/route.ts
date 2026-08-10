import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole, WeddingStatus } from "@prisma/client";

// GET /api/admin/hosts — list all host (couple) applications
export async function GET() {
  try {
    await requireRole([UserRole.ADMIN]);

    const weddings = await prisma.wedding.findMany({
      include: {
        hostCouple: {
          include: {
            user: {
              include: { verification: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ weddings });
  } catch (error: any) {
    console.error("[API /admin/hosts GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/hosts — update wedding/host status
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole([UserRole.ADMIN]);

    const body = await req.json();
    const { weddingId, action, reason } = body;

    if (!weddingId || !action) {
      return NextResponse.json({ error: "Missing weddingId or action" }, { status: 400 });
    }

    let newStatus: WeddingStatus;
    switch (action) {
      case "approve":
        newStatus = WeddingStatus.PUBLISHED;
        break;
      case "reject":
        newStatus = WeddingStatus.DRAFT;
        break;
      case "make_live":
        newStatus = WeddingStatus.PUBLISHED;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.wedding.update({
      where: { id: weddingId },
      data: { status: newStatus },
      include: {
        hostCouple: { include: { user: true } }
      }
    });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        action: `ADMIN_HOST_${action.toUpperCase()}`,
        entity: "Wedding",
        entityId: weddingId,
        userId: admin.id,
        userName: admin.name || admin.email,
        details: reason ? `Reason: ${reason}` : `Status changed to ${newStatus}`,
      }
    });

    return NextResponse.json({ wedding: updated });
  } catch (error: any) {
    console.error("[API /admin/hosts PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
