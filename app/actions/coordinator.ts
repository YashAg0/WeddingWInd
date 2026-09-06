"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const coordinatorApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(5, "Phone number must be at least 5 characters").max(25),
  city: z.string().min(2, "City is required").max(100),
  availability: z.string().min(2, "Availability is required").max(100),
  eventExperience: z.string().min(2, "Event experience is required").max(2000),
  languages: z.string().min(2, "Languages are required").max(500),
  interestNote: z.string().max(2000).optional().default(""),
});

export async function submitCoordinatorApplication(rawFormData: {
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
  const formData = coordinatorApplicationSchema.parse(rawFormData);

  // If the user already has a coordinator profile, throw
  const existingProfile = await prisma.coordinatorProfile.findUnique({
    where: { userId: user.id }
  });

  if (existingProfile) {
    throw new Error("You have already applied as a coordinator.");
  }

  // Create the coordinator profile with PENDING status (role remains unchanged until admin approval)
  await prisma.coordinatorProfile.create({
    data: {
      userId: user.id,
      city: formData.city,
      eventExperience: formData.eventExperience,
      availability: formData.availability,
      languages: formData.languages,
      status: "PENDING"
    }
  });

  revalidatePath("/coordinators/dashboard");
  return { success: true };
}
