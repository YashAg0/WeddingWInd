"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export interface ProfileCompletionItem {
  id: string;
  label: string;
  completed: boolean;
  href: string;
  xp: number;
}

export interface ProfileCompletionResult {
  percent: number;
  completedCount: number;
  totalCount: number;
  totalXp: number;
  maxXp: number;
  levelTitle: string;
  nextLevelTitle: string | null;
  nextLevelXp: number;
  items: ProfileCompletionItem[];
  nextIncomplete: ProfileCompletionItem | null;
}

export async function getProfileCompletion(): Promise<ProfileCompletionResult> {
  const user = await requireAuth();

  const items: ProfileCompletionItem[] = [];

  if (user.role === UserRole.TRAVELER) {
    const profile = await prisma.travelerProfile.findUnique({
      where: { userId: user.id },
    });

    items.push(
      {
        id: "name",
        label: "Add your full name",
        completed: !!(user.name && user.name.trim().length > 1),
        href: "/dashboard/profile",
        xp: 100,
      },
      {
        id: "avatar",
        label: "Upload a profile photo",
        completed: !!(user.avatar && user.avatar.trim().length > 0),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "country",
        label: "Set your home country",
        completed: !!(profile?.country && profile.country.trim().length > 0),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "interests",
        label: "Share your cultural interests",
        completed: !!(profile?.interests && profile.interests.trim().length > 3),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "preferences",
        label: "Set wedding style preferences",
        completed:
          !!(profile?.preferences &&
            profile.preferences !== "Traditional" &&
            profile.preferences.trim().length > 0),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "verification",
        label: "Complete identity verification",
        completed: false,
        href: "/dashboard/verification",
        xp: 150,
      }
    );

    // Check verification status separately
    const verification = await prisma.verification.findUnique({
      where: { userId: user.id },
      select: { status: true },
    });
    const verificationItem = items.find((i) => i.id === "verification");
    if (verificationItem) {
      verificationItem.completed =
        verification?.status === "APPROVED" ||
        verification?.status === "UNDER_REVIEW";
    }
  } else if (user.role === UserRole.COUPLE) {
    const profile = await prisma.coupleProfile.findUnique({
      where: { userId: user.id },
    });

    items.push(
      {
        id: "name",
        label: "Add your couple name",
        completed: !!(user.name && user.name.trim().length > 1),
        href: "/dashboard/profile",
        xp: 100,
      },
      {
        id: "avatar",
        label: "Upload a profile photo",
        completed: !!(user.avatar && user.avatar.trim().length > 0),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "weddingLocation",
        label: "Set your wedding location",
        completed: !!(
          profile?.weddingLocation && profile.weddingLocation.trim().length > 0
        ),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "traditions",
        label: "Describe your wedding traditions",
        completed: !!(
          profile?.traditions && profile.traditions.trim().length > 3
        ),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "familyBio",
        label: "Write a family bio for guests",
        completed: !!(
          profile?.familyBio && profile.familyBio.trim().length > 10
        ),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "verification",
        label: "Complete host verification",
        completed: false,
        href: "/dashboard/verification",
        xp: 150,
      }
    );

    const verification = await prisma.verification.findUnique({
      where: { userId: user.id },
      select: { status: true },
    });
    const verificationItem = items.find((i) => i.id === "verification");
    if (verificationItem) {
      verificationItem.completed =
        verification?.status === "APPROVED" ||
        verification?.status === "UNDER_REVIEW";
    }
  } else if (user.role === UserRole.AGENT) {
    const profile = await prisma.agentProfile.findUnique({
      where: { userId: user.id },
    });

    items.push(
      {
        id: "name",
        label: "Add your full name",
        completed: !!(user.name && user.name.trim().length > 1),
        href: "/dashboard/profile",
        xp: 100,
      },
      {
        id: "organization",
        label: "Set your organization name",
        completed: !!(
          profile?.organization && profile.organization.trim().length > 0
        ),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "country",
        label: "Set your country",
        completed: !!(profile?.country && profile.country.trim().length > 0),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "targetAudience",
        label: "Describe your target audience",
        completed: !!(
          profile?.targetAudience && profile.targetAudience.trim().length > 3
        ),
        href: "/dashboard/profile",
        xp: 50,
      },
      {
        id: "verification",
        label: "Complete agent verification",
        completed: false,
        href: "/dashboard/verification",
        xp: 150,
      }
    );

    const verification = await prisma.verification.findUnique({
      where: { userId: user.id },
      select: { status: true },
    });
    const verificationItem = items.find((i) => i.id === "verification");
    if (verificationItem) {
      verificationItem.completed =
        verification?.status === "APPROVED" ||
        verification?.status === "UNDER_REVIEW";
    }
  }

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const percent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalXp = items.reduce((acc, item) => acc + (item.completed ? item.xp : 0), 0);
  const maxXp = items.reduce((acc, item) => acc + item.xp, 0);

  let levelTitle = "Explorer";
  let nextLevelTitle: string | null = "Culture Seeker";
  let nextLevelXp = 100;

  if (totalXp >= 450) {
    levelTitle = "India Wedding Ambassador";
    nextLevelTitle = null;
    nextLevelXp = 450;
  } else if (totalXp >= 300) {
    levelTitle = "Wedding Insider";
    nextLevelTitle = "India Wedding Ambassador";
    nextLevelXp = 450;
  } else if (totalXp >= 200) {
    levelTitle = "India Enthusiast";
    nextLevelTitle = "Wedding Insider";
    nextLevelXp = 300;
  } else if (totalXp >= 100) {
    levelTitle = "Culture Seeker";
    nextLevelTitle = "India Enthusiast";
    nextLevelXp = 200;
  }

  const nextIncomplete = items.find((i) => !i.completed) || null;

  return {
    percent,
    completedCount,
    totalCount,
    totalXp,
    maxXp,
    levelTitle,
    nextLevelTitle,
    nextLevelXp,
    items,
    nextIncomplete,
  };
}
