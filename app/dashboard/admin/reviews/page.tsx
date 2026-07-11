import React from "react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { ClientAdminReviews } from "./ClientAdminReviews";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  // 1. Authenticate as Admin
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch Flagged and Under-Review Reviews
  const reviews = await prisma.review.findMany({
    where: {
      OR: [
        { status: "UNDER_REVIEW" },
        { reports: { some: {} } },
        { fraudSignals: { some: {} } }
      ]
    },
    include: {
      booking: {
        include: {
          wedding: {
            include: {
              hostCouple: { include: { user: true } }
            }
          }
        }
      },
      traveler: {
        include: {
          user: true
        }
      },
      reports: {
        include: {
          reporter: true
        }
      },
      fraudSignals: true
    },
    orderBy: { createdAt: "desc" }
  });

  // Map to client-friendly data structure
  const mappedReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    type: r.type,
    createdAt: r.createdAt.toISOString(),
    travelerName: r.traveler.fullName,
    travelerEmail: r.traveler.user.email,
    weddingTitle: r.booking.wedding.title,
    hostName: r.booking.wedding.hostCouple.user.name || "Host Couple",
    reports: r.reports.map((rep) => ({
      id: rep.id,
      reason: rep.reason,
      details: rep.details || "",
      reporterName: rep.reporter.name || "Reporter"
    })),
    fraudSignals: r.fraudSignals.map((fs) => ({
      id: fs.id,
      type: fs.type,
      severity: fs.severity,
      score: fs.score,
      metadata: fs.metadata ? JSON.parse(fs.metadata) : null
    }))
  }));

  // 3. Fetch audit logs of moderation actions
  const auditLogs = await prisma.reviewModerationAction.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      review: {
        include: {
          traveler: true
        }
      },
      moderator: true
    }
  });

  const mappedAuditLogs = auditLogs.map((log) => ({
    id: log.id,
    action: log.action,
    reason: log.reason,
    createdAt: log.createdAt.toISOString(),
    moderatorName: log.moderator.name || "Admin",
    reviewAuthor: log.review?.traveler?.fullName || "Deleted Author"
  }));

  return (
    <ClientAdminReviews 
      initialReviews={mappedReviews} 
      auditLogs={mappedAuditLogs} 
    />
  );
}
