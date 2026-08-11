import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { UserRole, UserStatus } from "@prisma/client";

/**
 * Gets the current authenticated Clerk user session.
 */
export async function getSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}

/**
 * Gets the detailed User model from PostgreSQL database using Clerk userId.
 * Returns null if user is not authenticated or not found in DB.
 * Returns null (not throws) on DB errors — callers should handle null gracefully.
 */
export async function getDbUser() {
  try {
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
  } catch (err) {
    console.warn("[getDbUser] PostgreSQL unavailable:", err);
    return null;
  }
}

/**
 * Syncs the current Clerk user into PostgreSQL if they do not exist.
 * Returns the matched/created database User, or null if unauthenticated.
 *
 * SEC-002: Fail-closed on DB errors.
 * - Does NOT pre-ping the database separately (avoids double-connections).
 * - Attempts the operation directly; propagates DB errors as SERVICE_UNAVAILABLE.
 * - Never returns a synthetic user with a granted role.
 * - Never silently converts an authenticated user to TRAVELER on DB failure.
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

  try {
    const startTime = Date.now();
    console.log(`[AUTH DEBUG] STAGE 1 (Clerk user lookup) START`);
    // 1. Fetch clerk user details from server
    const clerkUser = await currentUser();
    if (!clerkUser) return null;
    
    console.log(`[AUTH DEBUG] STAGE 1 (Clerk user lookup) SUCCESS durationMs=${Date.now() - startTime}`);

    const rawEmail = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@guest.weddingwithindia.com`;
    const email = rawEmail.trim().toLowerCase();
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email.split("@")[0];
    const crypto = require('crypto');
    const randomAvatarImg = crypto.randomBytes(1).readUInt8(0) % 70;
    const avatar = clerkUser.imageUrl || `https://i.pravatar.cc/80?img=${randomAvatarImg}`;

    // 2. Resolve external cookies BEFORE entering the database transaction
    let refCookie: any = null;
    try {
      const { getAttributionCookie } = require("./attribution");
      refCookie = await getAttributionCookie();
    } catch (err) {
      console.warn("Failed to read attribution cookie prior to transaction:", err);
    }

    // 3. Upsert the user record in an isolated transaction.
    console.log(`[AUTH DEBUG] STAGE 3 (Transaction acquisition) START`);
    const txStart = Date.now();
    const dbUser = await prisma.$transaction(async (tx) => {
      console.log(`[AUTH DEBUG] STAGE 3 (Transaction acquisition) SUCCESS durationMs=${Date.now() - txStart}`);
      
      console.log(`[AUTH DEBUG] STAGE 2 (Initial user lookup) START`);
      const stage2Start = Date.now();
      
      const existingByClerkId = await tx.user.findUnique({ where: { clerkUserId: clerkUser.id } });
      const existingByEmail = await tx.user.findUnique({ where: { email } });
      
      console.log(`[AUTH DEBUG] STAGE 2 (Initial user lookup) SUCCESS durationMs=${Date.now() - stage2Start}`);

      let upsertedUser;
      console.log(`[AUTH DEBUG] STAGE 4 (user.upsert) START`);
      const stage4Start = Date.now();
      
      if (existingByEmail && existingByClerkId) {
        if (existingByEmail.id !== existingByClerkId.id) {
          // Unlink stale clerkUserId from existingByClerkId row to prevent unique constraint error
          await tx.user.update({
            where: { id: existingByClerkId.id },
            data: { clerkUserId: `unlinked_${existingByClerkId.id}_${Date.now()}` }
          });
          // Update existingByEmail row with current Clerk ID
          upsertedUser = await tx.user.update({
            where: { id: existingByEmail.id },
            data: { clerkUserId: clerkUser.id, name, avatar }
          });
        } else {
          // Both match same row; update name & avatar
          upsertedUser = await tx.user.update({
            where: { id: existingByEmail.id },
            data: { name, avatar }
          });
        }
      } else if (existingByEmail) {
        // Only email matches existing record (e.g. pre-provisioned email or re-registered user)
        upsertedUser = await tx.user.update({
          where: { id: existingByEmail.id },
          data: { clerkUserId: clerkUser.id, name, avatar }
        });
      } else if (existingByClerkId) {
        // Only Clerk ID matches existing record; update email, name, avatar
        upsertedUser = await tx.user.update({
          where: { id: existingByClerkId.id },
          data: { email, name, avatar }
        });
      } else {
        // Brand new user
        try {
          upsertedUser = await tx.user.create({
            data: {
              clerkUserId: clerkUser.id,
              email,
              name,
              avatar,
              role: "TRAVELER",
              status: "ONBOARDING"
            }
          });
        } catch (createErr: any) {
          if (createErr?.code === "P2002") {
            const racedUser =
              (await tx.user.findUnique({ where: { email } })) ||
              (await tx.user.findUnique({ where: { clerkUserId: clerkUser.id } }));
            if (racedUser) {
              upsertedUser = racedUser;
            } else {
              throw createErr;
            }
          } else {
            throw createErr;
          }
        }
      }
      
      console.log(`[AUTH DEBUG] STAGE 4 (user.upsert) SUCCESS durationMs=${Date.now() - stage4Start}`);

      console.log(`[AUTH DEBUG] STAGE 5 (travelerProfile.upsert) START`);
      const stage5Start = Date.now();
      await tx.travelerProfile.upsert({
        where: { userId: upsertedUser.id },
        create: {
          userId: upsertedUser.id,
          fullName: name,
          country: "United States",
          language: "English"
        },
        update: {}
      });
      console.log(`[AUTH DEBUG] STAGE 5 (travelerProfile.upsert) SUCCESS durationMs=${Date.now() - stage5Start}`);

      console.log(`[AUTH DEBUG] STAGE 8 (final returned user) START`);
      const stage8Start = Date.now();
      const finalUser = await tx.user.findUnique({
        where: { id: upsertedUser.id },
        include: {
          travelerProfile: true,
          coupleProfile: true,
          agentProfile: true
        }
      });
      console.log(`[AUTH DEBUG] STAGE 8 (final returned user) SUCCESS durationMs=${Date.now() - stage8Start}`);
      
      console.log(`[AUTH DEBUG] STAGE 6 (Transaction commit) START`);
      return finalUser;
    }, {
      maxWait: 10000,
      timeout: 15000
    });
    console.log(`[AUTH DEBUG] STAGE 6 (Transaction commit) SUCCESS durationMs=${Date.now() - txStart}`);

    // 4. Link referral AFTER the transaction is safely committed
    if (dbUser && dbUser.createdAt.getTime() === dbUser.updatedAt.getTime()) {
      if (refCookie && refCookie.referralCode) {
        try {
          console.log(`[AUTH DEBUG] STAGE 7 (associateReferralOnSignup) START`);
          const stage7Start = Date.now();
          const { associateReferralOnSignup } = require("./actions/referrals");
          await associateReferralOnSignup(dbUser.id, refCookie);
          console.log(`[AUTH DEBUG] STAGE 7 (associateReferralOnSignup) SUCCESS durationMs=${Date.now() - stage7Start}`);
        } catch (err) {
          console.error("Failed to link referral cookie on signup:", err);
        }
      }
    }

    return dbUser;
  } catch (err: any) {
    // Extensive diagnostic logging as requested by user
    console.error("[AUTH DEBUG] FATAL ERROR IN syncAndGetDbUser");
    console.error(`[AUTH DEBUG] errorName=${err?.name}`);
    console.error(`[AUTH DEBUG] errorCode=${err?.code}`);
    console.error(`[AUTH DEBUG] message=${err?.message}`);
    console.error(`[AUTH DEBUG] meta=${JSON.stringify(err?.meta)}`);
    console.error(`[AUTH DEBUG] stack=${err?.stack}`);
    
    // SEC-002: Do not return a mock user with granted roles on DB errors.
    throw new Error("SERVICE_UNAVAILABLE: Authentication service is temporarily unavailable. Please try again shortly.");
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
