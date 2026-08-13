"use server";

import { prisma } from "../prisma";
import { requireAuth } from "../auth";
import { UserRole } from "@prisma/client";

export type UserExperienceState =
  | "AUTH_LOADING"
  | "DB_UNAVAILABLE"
  | "NEW_USER"
  | "EXISTING_TRAVELER"
  | "EXISTING_COUPLE"
  | "EXISTING_AGENT"
  | "EXISTING_ADMIN"
  | "EXISTING_COORDINATOR";

export interface AuthenticatedUserExperience {
  state: UserExperienceState;
  role: string;
  onboardingRequired: boolean;
  hasHostApplication: boolean;
  weddingId?: string;
  verificationStatus?: string;
  reviewerNotes?: string;
}

/**
 * Authoritative Server-Side User Experience Resolver.
 * Reconstructs exact user experience state from database identity.
 * 
 * CORE RULE:
 * - State A (NEW_USER): Authenticated identity exists, but no persisted role/profile/application state.
 * - State B (EXISTING_USER): Authenticated identity maps to an existing User record with a persisted role/profile.
 *   EXISTING_USERS MUST NEVER be forced through role-selection onboarding.
 */
export async function resolveAuthenticatedUserExperience(): Promise<AuthenticatedUserExperience> {
  try {
    const dbUser = await requireAuth();

    if (!dbUser) {
      return {
        state: "NEW_USER",
        role: "traveler",
        onboardingRequired: true,
        hasHostApplication: false,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: dbUser.id },
      include: {
        travelerProfile: true,
        coupleProfile: {
          include: {
            weddings: {
              where: { isDemo: false },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        agentProfile: true,
        verification: true,
      },
    });

    if (!user) {
      return {
        state: "NEW_USER",
        role: "traveler",
        onboardingRequired: true,
        hasHostApplication: false,
      };
    }

    // ADMIN or COORDINATOR
    if (user.role === UserRole.ADMIN) {
      return {
        state: "EXISTING_ADMIN",
        role: "admin",
        onboardingRequired: false,
        hasHostApplication: false,
      };
    }

    if (user.role === UserRole.COORDINATOR) {
      return {
        state: "EXISTING_COORDINATOR",
        role: "coordinator",
        onboardingRequired: false,
        hasHostApplication: false,
      };
    }

    // COUPLE / HOST
    if (user.role === UserRole.COUPLE) {
      const ownedWedding = user.coupleProfile?.weddings?.[0] || null;
      const verificationStatus = user.verification?.status || (ownedWedding ? "PENDING" : undefined);
      const reviewerNotes = user.verification?.notes || undefined;

      return {
        state: "EXISTING_COUPLE",
        role: "couple",
        onboardingRequired: false,
        hasHostApplication: !!ownedWedding || !!user.coupleProfile || !!user.verification,
        weddingId: ownedWedding?.id || undefined,
        verificationStatus,
        reviewerNotes,
      };
    }

    // AGENT
    if (user.role === UserRole.AGENT) {
      return {
        state: "EXISTING_AGENT",
        role: "agent",
        onboardingRequired: false,
        hasHostApplication: false,
      };
    }

    // TRAVELER
    if (user.role === UserRole.TRAVELER) {
      const isCompleted = user.status === "ACTIVE";
      return {
        state: isCompleted ? "EXISTING_TRAVELER" : "NEW_USER",
        role: "traveler",
        onboardingRequired: !isCompleted,
        hasHostApplication: false,
      };
    }

    // ACTIVE status fallback
    if (user.status === "ACTIVE") {
      return {
        state: "EXISTING_TRAVELER",
        role: (user.role as string).toLowerCase(),
        onboardingRequired: false,
        hasHostApplication: false,
      };
    }

    return {
      state: "NEW_USER",
      role: "traveler",
      onboardingRequired: true,
      hasHostApplication: false,
    };
  } catch (err) {
    console.error("[resolveAuthenticatedUserExperience] Database lookup failed:", err);
    return {
      state: "DB_UNAVAILABLE",
      role: "traveler",
      onboardingRequired: false,
      hasHostApplication: false,
    };
  }
}
