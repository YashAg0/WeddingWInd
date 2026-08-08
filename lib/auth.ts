import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma, isDatabaseAvailable } from "./prisma";
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
  try {
    const session = await getSession();
    if (!session?.userId) return null;
    if (!(await isDatabaseAvailable())) return null;

    return await prisma.user.findUnique({
      where: { clerkUserId: session.userId },
      include: {
        travelerProfile: true,
        coupleProfile: true,
        agentProfile: true
      }
    });
  } catch (err) {
    console.warn("[getDbUser] PostgreSQL unavailable:", err);
    return null;
  }
}

/**
 * Syncs the current Clerk user into PostgreSQL if they do not exist.
 * Returns the matched/created database User details or a safe fallback when DB is offline.
 */
export async function syncAndGetDbUser() {
  let session: any = null;
  try {
    session = await getSession();
  } catch (err) {
    console.warn("[syncAndGetDbUser] Unable to fetch Clerk session:", err);
    return null;
  }

  if (!session?.userId) return null;

  if (!(await isDatabaseAvailable())) {
    return {
      id: `fallback-${session.userId}`,
      clerkUserId: session.userId,
      email: `${session.userId}@guest.weddingwithindia.com`,
      name: "Guest User",
      role: UserRole.TRAVELER,
      status: UserStatus.ACTIVE,
      avatarUrl: "https://i.pravatar.cc/80?img=12",
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  try {
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

    const email = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@guest.weddingwithindia.com`;
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email.split("@")[0];
    const crypto = require('crypto');
    const randomAvatarImg = crypto.randomBytes(1).readUInt8(0) % 70;
    const avatar = clerkUser.imageUrl || `https://i.pravatar.cc/80?img=${randomAvatarImg}`;

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
  } catch (err) {
    console.warn("[syncAndGetDbUser] Database error during sync. Returning transient fallback user.", err);
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;
      const email = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@guest.weddingwithindia.com`;
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email.split("@")[0];
      const avatar = clerkUser.imageUrl || `https://i.pravatar.cc/80?img=1`;

      return {
        id: clerkUser.id,
        clerkUserId: clerkUser.id,
        email,
        name,
        avatar,
        role: UserRole.TRAVELER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        travelerProfile: null,
        coupleProfile: null,
        agentProfile: null,
        dbOffline: true
      } as any;
    } catch {
      return null;
    }
  }
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


