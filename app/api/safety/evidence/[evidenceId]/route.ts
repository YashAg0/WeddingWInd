import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ evidenceId: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const evidenceId = resolvedParams.evidenceId;

    // Fetch the evidence
    const evidence = await prisma.caseEvidence.findUnique({
      where: { id: evidenceId },
      include: {
        case: {
          include: {
            participants: true
          }
        }
      }
    });

    if (!evidence) {
      return new NextResponse("Evidence not found.", { status: 404 });
    }

    // Auth check: Admin is always allowed
    let authorized = false;
    if (user.role === UserRole.ADMIN) {
      authorized = true;
    } else {
      // User must be one of:
      // 1. The uploader of the evidence
      // 2. The case reporter
      // 3. The case subject user
      // 4. A participant in the case
      if (
        evidence.uploadedById === user.id ||
        evidence.case.reportedById === user.id ||
        evidence.case.subjectUserId === user.id ||
        evidence.case.participants.some(p => p.userId === user.id)
      ) {
        authorized = true;
      }
    }

    if (!authorized) {
      return new NextResponse("Forbidden: You do not have permission to access this evidence.", { status: 403 });
    }

    // Securely redirect to the actual fileUrl (UploadThing URL)
    return NextResponse.redirect(evidence.fileUrl);
  } catch (err: any) {
    return new NextResponse(`Error retrieving evidence: ${err.message}`, { status: 500 });
  }
}
