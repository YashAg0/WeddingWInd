import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma, withDbRetry } from "./prisma";
import { UserRole, UserStatus } from "@prisma/client";
import { isE2ETestAuthEnabled, verifyE2ETestSessionToken } from "./test-auth";

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

async function safeDbCall<T>(fn: () => Promise<T>, options?: any): Promise<T> {
  if (typeof withDbRetry === "function") {
    return await withDbRetry(fn, options);
  }
  return await fn();
}

/**
 * Resolves an authenticated user from an E2E test session cookie (Local/Test ONLY).
 */
async function getE2ETestDbUser() {
  if (!isE2ETestAuthEnabled()) {
    console.log("[E2E AUTH] isE2ETestAuthEnabled is FALSE (PLAYWRIGHT_TEST:", process.env.PLAYWRIGHT_TEST, "NODE_ENV:", process.env.NODE_ENV, ")");
    return null;
  }
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const e2eToken = cookieStore.get("__wwi_e2e_session")?.value;
    if (!e2eToken) {
      console.log("[E2E AUTH] No __wwi_e2e_session cookie found in cookieStore");
      return null;
    }
    const session = verifyE2ETestSessionToken(e2eToken);
    if (!session?.userId) {
      console.log("[E2E AUTH] Token verification failed or expired");
      return null;
    }

    let user = await safeDbCall(
      () =>
        prisma.user.findFirst({
          where: {
            OR: [
              { id: session.userId },
              session.email ? { email: session.email } : undefined,
            ].filter(Boolean) as any,
          },
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
            coordinatorProfile: true,
            verification: true,
          },
        }),
      { label: "getE2ETestDbUser:find" }
    );

    if (!user && (session.userId || session.email)) {
      try {
        const existing = await safeDbCall(
          () =>
            prisma.user.findFirst({
              where: {
                OR: [
                  ...(session.userId ? [{ id: session.userId }] : []),
                  ...(session.email ? [{ email: session.email }] : []),
                ],
              },
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
                coordinatorProfile: true,
                verification: true,
              },
            }),
          { label: "getE2ETestDbUser:fallbackFind" }
        );

        if (existing) {
          user = existing;
        } else if (session.email) {
          user = await safeDbCall(
            () =>
              prisma.user.create({
                data: {
                  id: session.userId,
                  email: session.email,
                  name: session.email.split("@")[0],
                  role: (session.role as any) || UserRole.TRAVELER,
                  status: UserStatus.ACTIVE,
                  clerkUserId: `clerk_e2e_${session.userId}`,
                },
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
                  coordinatorProfile: true,
                  verification: true,
                },
              }),
            { label: "getE2ETestDbUser:provision" }
          );
        }
      } catch (upsertErr) {
        console.warn("[E2E AUTH] Provision test user fallback warning:", upsertErr);
      }
    }

    if (user && user.status !== UserStatus.BANNED) {
      return user;
    }
    return null;
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
    const testUser = await getE2ETestDbUser();
    if (testUser) return testUser;

    const session = await getSession();
    if (!session?.userId) return null;

    return await safeDbCall(
      () =>
        prisma.user.findUnique({
          where: { clerkUserId: session.userId },
          include: {
            travelerProfile: true,
            coupleProfile: true,
            agentProfile: true,
          },
        }),
      { label: "getDbUser" }
    );
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
 * - Fast-path indexed query for already synced users (zero transaction lock).
 * - Never returns a synthetic user with a granted role.
 */
export async function syncAndGetDbUser() {
  const testUser = await getE2ETestDbUser();
  if (testUser) return testUser;

  let session: any = null;
  try {
    session = await getSession();
  } catch (err) {
    console.warn("[syncAndGetDbUser] Unable to fetch Clerk session:", err);
    return null;
  }

  if (!session?.userId) return null;

  // 1. Fetch Clerk user details
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // FAST PATH: Check if user is already synced by Clerk ID (indexed lookup, zero transaction lock)
  try {
    const fastUser = await safeDbCall(
      () =>
        prisma.user.findUnique({
          where: { clerkUserId: clerkUser.id },
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
            coordinatorProfile: true,
            verification: true,
          },
        }),
      { label: "syncAndGetDbUser:fastPath" }
    );

    if (fastUser && fastUser.status !== UserStatus.BANNED) {
      return fastUser;
    }
  } catch (fastErr) {
    console.warn("[syncAndGetDbUser] Fast path query error, falling back to sync transaction:", fastErr);
  }

  // SLOW PATH: Full synchronization transaction for new users or re-linked accounts
  try {
    const rawEmail = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@guest.weddingwithindia.com`;
    const email = rawEmail.trim().toLowerCase();
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email.split("@")[0];
    const crypto = require('crypto');
    const randomAvatarImg = crypto.randomBytes(1).readUInt8(0) % 70;
    const avatar = clerkUser.imageUrl || `https://i.pravatar.cc/80?img=${randomAvatarImg}`;

    // Resolve external cookies BEFORE entering the database transaction
    let refCookie: any = null;
    try {
      const { getAttributionCookie } = require("./attribution");
      refCookie = await getAttributionCookie();
    } catch (err) {
      console.warn("Failed to read attribution cookie prior to transaction:", err);
    }

    // Upsert the user record in an isolated transaction.
    const dbUser = await prisma.$transaction(async (tx) => {
      const existingByClerkId = await tx.user.findUnique({ where: { clerkUserId: clerkUser.id } });
      const existingByEmail = await tx.user.findUnique({ where: { email } });

      let upsertedUser;
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

      return await tx.user.findUnique({
        where: { id: upsertedUser.id },
        include: {
          travelerProfile: true,
          coupleProfile: {
            include: {
              weddings: {
                where: { isDemo: false },
                orderBy: { createdAt: "desc" },
                take: 1,
              }
            }
          },
          agentProfile: true,
          coordinatorProfile: true,
          verification: true,
        }
      });
    }, {
      maxWait: 10000,
      timeout: 15000
    });

    // Link referral AFTER the transaction is safely committed
    if (dbUser && dbUser.createdAt.getTime() === dbUser.updatedAt.getTime()) {
      if (refCookie && refCookie.referralCode) {
        try {
          const { associateReferralOnSignup } = require("./actions/referrals");
          await associateReferralOnSignup(dbUser.id, refCookie);
        } catch (err) {
          console.error("Failed to link referral cookie on signup:", err);
        }
      }
    }

    return dbUser;
  } catch (err: any) {
    console.error("[AUTH DEBUG] FATAL ERROR IN syncAndGetDbUser:", err);
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
