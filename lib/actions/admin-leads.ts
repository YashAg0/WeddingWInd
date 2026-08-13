"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UserRole, ContactStatus } from "@prisma/client";

export async function getAdminContactSubmissionsAction() {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Only administrators can view contact submissions.");
  }

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return submissions.map((sub) => ({
    id: sub.id,
    name: sub.name,
    email: sub.email,
    subject: sub.subject,
    message: sub.message,
    status: sub.status,
    createdAt: sub.createdAt.toISOString(),
  }));
}

export async function updateContactSubmissionStatusAction(
  submissionId: string,
  status: ContactStatus
) {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Only administrators can update submission status.");
  }

  const updated = await prisma.contactSubmission.update({
    where: { id: submissionId },
    data: { status },
  });

  return {
    id: updated.id,
    status: updated.status,
    updatedAt: new Date().toISOString(),
  };
}
