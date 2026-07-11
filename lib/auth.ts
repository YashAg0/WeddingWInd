import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { UserRole, UserStatus } from "@prisma/client";

/**
 * Gets the current authenticated Clerk user session.
 */
export async function getSession() {
  return await auth();
}

/**
 * Gets the detailed User model from PostgreSQL database using Clerk userId.
 */
export async function getDbUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  return await prisma.user.findUnique({
    where: { clerkUserId: session.userId },
    include: {
      travelerProfile: true,
      coupleProfile: true,
      agentProfile: true
    }
  });
}

/**
 * Syncs the current Clerk user into PostgreSQL if they do not exist.
 * Returns the matched/created database User details.
 */
export async function syncAndGetDbUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  // 1. Check if user already exists
  let dbUser = await prisma.user.findUnique({
    where: { clerkUserId: session.userId },
    include: {
      travelerProfile: true,
      coupleProfile: true,
      agentProfile: true
    }
  });

  if (dbUser) return dbUser;

  // 2. Fetch clerk user details from server
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email.split("@")[0];
  const avatar = clerkUser.imageUrl || `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`;

  // 3. Create user and default TravelerProfile in transaction
  dbUser = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        clerkUserId: clerkUser.id,
        email,
        name,
        avatar,
        role: "TRAVELER",
        status: "ONBOARDING"
      }
    });

    await tx.travelerProfile.create({
      data: {
        userId: createdUser.id,
        fullName: name,
        country: "United States",
        language: "English"
      }
    });

    // Check for referral cookie details
    try {
      const { getAttributionCookie } = require("./attribution");
      const { associateReferralOnSignup } = require("./actions/referrals");
      
      const refCookie = await getAttributionCookie();
      if (refCookie && refCookie.referralCode) {
        // Run association inside transaction context or globally
        await associateReferralOnSignup(createdUser.id, refCookie);
      }
    } catch (err) {
      console.error("Failed to link referral cookie on signup:", err);
    }

    return await tx.user.findUnique({
      where: { id: createdUser.id },
      include: {
        travelerProfile: true,
        coupleProfile: true,
        agentProfile: true
      }
    });
  });

  return dbUser;
}

/**
 * Ensures user is authenticated and returns user details. Throws error if unauthenticated.
 */
export async function requireAuth() {
  const user = await syncAndGetDbUser();
  if (!user) {
    throw new Error("UNAUTHORIZED: Authentication required.");
  }
  if (user.status === UserStatus.BANNED) {
    throw new Error("BANNED: Your account has been suspended for safety/security violations.");
  }
  return user;
}

/**
 * Restricts access to specific roles. Throws if the user does not possess one of the allowed roles.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN: You do not have permissions to access this route.");
  }
  return user;
}

/**
 * Checks if the current authenticated user has an Admin role.
 */
export async function isAdmin() {
  const user = await getDbUser();
  return user?.role === UserRole.ADMIN;
}

