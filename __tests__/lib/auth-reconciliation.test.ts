/**
 * __tests__/lib/auth-reconciliation.test.ts
 *
 * Unit & Behavioral tests for syncAndGetDbUser() Identity Reconciliation & Normalization (Requirement R3).
 *
 * Scenarios tested:
 * 1. Email normalization (trim and lowercase) before lookup or store.
 * 2. Reconciliation when existingByEmail and existingByClerkId point to different DB rows.
 *    - Unlinks clerkUserId from stale existingByClerkId record to satisfy unique constraint.
 *    - Updates existingByEmail with clerkUserId without mutating role or status (founder canonical row preservation).
 * 3. Reconciliation when only existingByEmail exists (pre-provisioned user / re-registration).
 * 4. Reconciliation when only existingByClerkId exists.
 * 5. Concurrent signup race condition — handling Prisma P2002 error during tx.user.create().
 */

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/test?pgbouncer=true";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_123";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_123";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_123";
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_123";
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_123";
process.env.UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET || "sk_123";
process.env.UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID || "app_123";
process.env.GUEST_PASS_ENCRYPTION_KEY = process.env.GUEST_PASS_ENCRYPTION_KEY || "378e1bf771d5a5f1c9ab06ed4d48065a3bac7e8a995ef8a0a9437fd40a547a54";
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://weddingwithindia.com";

import { syncAndGetDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";

const mockCurrentUser = {
  id: "clerk_123",
  emailAddresses: [{ emailAddress: " Founder@WeddingWithIndia.COM " }],
  firstName: "Founder",
  lastName: "User",
  imageUrl: "https://example.com/avatar.jpg",
};

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn().mockResolvedValue({ userId: "clerk_123" }),
  currentUser: jest.fn().mockImplementation(() => Promise.resolve(mockCurrentUser)),
}));

jest.mock("@/lib/attribution", () => ({
  getAttributionCookie: jest.fn().mockResolvedValue(null),
}));

describe("syncAndGetDbUser Identity Reconciliation (R3)", () => {
  beforeEach(() => {
    jest.setTimeout(20000);
    jest.clearAllMocks();
  });

  it("normalizes email to lowercase and trimmed before DB lookup", async () => {
    let queriedEmail = "";
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null as any);
    jest.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockImplementation(({ where }: any) => {
            if (where.email) queriedEmail = where.email;
            return Promise.resolve(null);
          }),
          create: jest.fn().mockResolvedValue({
            id: "new_user_1",
            clerkUserId: "clerk_123",
            email: "founder@weddingwithindia.com",
            role: UserRole.TRAVELER,
            status: UserStatus.ONBOARDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          update: jest.fn(),
        },
        travelerProfile: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    await syncAndGetDbUser();
    expect(queriedEmail).toBe("founder@weddingwithindia.com");
  });

  it("reconciles when existingByEmail and existingByClerkId belong to different records (unlinking stale clerkUserId, preserving canonical row role/status)", async () => {
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null as any);
    const existingByClerkId = {
      id: "user_a",
      clerkUserId: "clerk_123",
      email: "old_a@weddingwithindia.com",
      role: UserRole.TRAVELER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const existingByEmail = {
      id: "user_b",
      clerkUserId: "pending_founder_id",
      email: "founder@weddingwithindia.com",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userUpdates: any[] = [];
    jest.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockImplementation(({ where }: any) => {
            if (where.clerkUserId === "clerk_123") return Promise.resolve(existingByClerkId);
            if (where.email === "founder@weddingwithindia.com") return Promise.resolve(existingByEmail);
            if (where.id === "user_b") return Promise.resolve({ ...existingByEmail, clerkUserId: "clerk_123" });
            return Promise.resolve(null);
          }),
          update: jest.fn().mockImplementation(({ where, data }: any) => {
            userUpdates.push({ where, data });
            if (where.id === "user_b") {
              return Promise.resolve({ ...existingByEmail, ...data });
            }
            return Promise.resolve({ ...existingByClerkId, ...data });
          }),
        },
        travelerProfile: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    const user = await syncAndGetDbUser();

    // Verification: user_a clerkUserId unlinked
    expect(userUpdates[0].where).toEqual({ id: "user_a" });
    expect(userUpdates[0].data.clerkUserId).toContain("unlinked_user_a_");

    // Verification: user_b updated with clerkUserId, name, avatar — role & status NOT in update payload
    expect(userUpdates[1].where).toEqual({ id: "user_b" });
    expect(userUpdates[1].data).toEqual({
      clerkUserId: "clerk_123",
      name: "Founder User",
      avatar: "https://example.com/avatar.jpg",
    });
    expect(userUpdates[1].data.role).toBeUndefined();
    expect(userUpdates[1].data.status).toBeUndefined();

    // Returned user is canonical founder row with ADMIN role
    expect(user?.role).toBe(UserRole.ADMIN);
  });

  it("reconciles when only existingByEmail exists (preserves role and status)", async () => {
    const existingByEmail = {
      id: "user_preprovisioned",
      clerkUserId: "pending_123",
      email: "founder@weddingwithindia.com",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let updatePayload: any = null;
    jest.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockImplementation(({ where }: any) => {
            if (where.email === "founder@weddingwithindia.com") return Promise.resolve(existingByEmail);
            if (where.id === "user_preprovisioned") return Promise.resolve({ ...existingByEmail, clerkUserId: "clerk_123" });
            return Promise.resolve(null);
          }),
          update: jest.fn().mockImplementation(({ data }: any) => {
            updatePayload = data;
            return Promise.resolve({ ...existingByEmail, ...data });
          }),
        },
        travelerProfile: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    const user = await syncAndGetDbUser();

    expect(updatePayload).toEqual({
      clerkUserId: "clerk_123",
      name: "Founder User",
      avatar: "https://example.com/avatar.jpg",
    });
    expect(updatePayload.role).toBeUndefined();
    expect(updatePayload.status).toBeUndefined();
    expect(user?.role).toBe(UserRole.ADMIN);
  });

  it("reconciles when only existingByClerkId exists", async () => {
    const existingByClerkId = {
      id: "user_by_clerk",
      clerkUserId: "clerk_123",
      email: "old_email@weddingwithindia.com",
      role: UserRole.TRAVELER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let updatePayload: any = null;
    jest.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockImplementation(({ where }: any) => {
            if (where.clerkUserId === "clerk_123") return Promise.resolve(existingByClerkId);
            if (where.id === "user_by_clerk") return Promise.resolve({ ...existingByClerkId, email: "founder@weddingwithindia.com" });
            return Promise.resolve(null);
          }),
          update: jest.fn().mockImplementation(({ data }: any) => {
            updatePayload = data;
            return Promise.resolve({ ...existingByClerkId, ...data });
          }),
        },
        travelerProfile: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    const user = await syncAndGetDbUser();

    expect(updatePayload).toEqual({
      email: "founder@weddingwithindia.com",
      name: "Founder User",
      avatar: "https://example.com/avatar.jpg",
    });
    expect(user?.email).toBe("founder@weddingwithindia.com");
  });

  it("handles concurrent signup race condition (Prisma P2002 error on tx.user.create)", async () => {
    const racedUser = {
      id: "raced_user_123",
      clerkUserId: "clerk_123",
      email: "founder@weddingwithindia.com",
      role: UserRole.TRAVELER,
      status: UserStatus.ONBOARDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let findCount = 0;
    jest.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockImplementation(() => {
            findCount++;
            if (findCount > 2) {
              return Promise.resolve(racedUser);
            }
            return Promise.resolve(null);
          }),
          create: jest.fn().mockRejectedValue({ code: "P2002", message: "Unique constraint failed" }),
          update: jest.fn(),
        },
        travelerProfile: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    // Should NOT throw SERVICE_UNAVAILABLE or P2002 — must recover raced user
    const user = await syncAndGetDbUser();
    expect(user).toBeDefined();
    expect(user?.id).toBe("raced_user_123");
  });
});
