"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function submitCoordinatorApplication(formData: {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  availability: string;
  eventExperience: string;
  languages: string;
  interestNote: string;
}) {
  const user = await requireAuth();

  // If the user already has a coordinator profile, throw
  const existingProfile = await prisma.coordinatorProfile.findUnique({
    where: { userId: user.id }
  });

  if (existingProfile) {
    throw new Error("You have already applied as a coordinator.");
  }

  // Create the coordinator profile and upgrade user role
  await prisma.$transaction(async (tx) => {
    await tx.coordinatorProfile.create({
      data: {
        userId: user.id,
        city: formData.city,
        eventExperience: formData.eventExperience,
        availability: formData.availability,
        languages: formData.languages,
        status: "PENDING"
      }
    });

    if (user.role === UserRole.TRAVELER) {
      await tx.user.update({
        where: { id: user.id },
        data: { role: UserRole.COORDINATOR }
      });
    }
  });

  revalidatePath("/coordinators/dashboard");
  return { success: true };
}
