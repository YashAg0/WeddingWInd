/**
 * __tests__/lib/auth-founder-empirical.test.ts
 *
 * Empirical verification of Founder DB Row Canonical Truth Protection (M1 Challenge).
 * Stress tests syncAndGetDbUser() for founder@weddingwithindia.com.
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
import { auth, currentUser } from "@clerk/nextjs/server";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

jest.mock("@/lib/attribution", () => ({
  getAttributionCookie: jest.fn().mockResolvedValue(null),
}));

describe("Empirical Challenge: Founder DB Row Canonical Truth Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
  });

  it("EMPIRICAL CHECK 1: Founder login preserves ADMIN role and ACTIVE status without creating duplicates", async () => {
    const founderDbRow = {
      id: "founder_db_id_001",
      clerkUserId: "old_clerk_founder_id",
      email: "founder@weddingwithindia.com",
      name: "WeddingWithIndia Founder",
      avatar: "https://example.com/founder.jpg",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };

    (auth as jest.Mock).mockResolvedValue({ userId: "new_clerk_founder_id_999" });
    (currentUser as jest.Mock).mockResolvedValue({
      id: "new_clerk_founder_id_999",
      emailAddresses: [{ emailAddress: "founder@weddingwithindia.com" }],
      firstName: "Founder",
      lastName: "Admin",
      imageUrl: "https://example.com/new_avatar.jpg",
    });

    let createdUsersCount = 0;
    let updatePayload: any = null;

    jest.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockImplementation(({ where }: any) => {
            if (where.email === "founder@weddingwithindia.com") return Promise.resolve(founderDbRow);
            if (where.clerkUserId === "new_clerk_founder_id_999") return Promise.resolve(null);
            if (where.id === "founder_db_id_001") {
              return Promise.resolve({
                ...founderDbRow,
                clerkUserId: "new_clerk_founder_id_999",
                ...updatePayload,
              });
            }
            return Promise.resolve(null);
          }),
          create: jest.fn().mockImplementation(() => {
            createdUsersCount++;
            return Promise.resolve({});
          }),
          update: jest.fn().mockImplementation(({ data }: any) => {
            updatePayload = data;
            return Promise.resolve({ ...founderDbRow, ...data });
          }),
        },
        travelerProfile: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    const user = await syncAndGetDbUser();

    // 1. Must returned the founder DB row
    expect(user).toBeDefined();
    expect(user?.id).toBe("founder_db_id_001");
    // 2. Role MUST be ADMIN
    expect(user?.role).toBe(UserRole.ADMIN);
    // 3. Status MUST be ACTIVE
    expect(user?.status).toBe(UserStatus.ACTIVE);
    // 4. Zero new users created
    expect(createdUsersCount).toBe(0);
    // 5. Update payload MUST NOT contain role or status
    expect(updatePayload.role).toBeUndefined();
    expect(updatePayload.status).toBeUndefined();
    expect(updatePayload.clerkUserId).toBe("new_clerk_founder_id_999");
  });

  it("EMPIRICAL CHECK 2: Email uppercase/spaces input maps to canonical founder row", async () => {
    const founderDbRow = {
      id: "founder_db_id_001",
      clerkUserId: "clerk_founder_id_100",
      email: "founder@weddingwithindia.com",
      name: "Founder",
      avatar: "https://example.com/founder.jpg",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };

    (auth as jest.Mock).mockResolvedValue({ userId: "clerk_founder_id_100" });
    (currentUser as jest.Mock).mockResolvedValue({
      id: "clerk_founder_id_100",
      emailAddresses: [{ emailAddress: "   FOUNDER@WEDDINGWITHINDIA.COM  " }],
      firstName: "Founder",
      lastName: "Admin",
      imageUrl: "https://example.com/avatar.jpg",
    });

    let searchedEmail = "";
    jest.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockImplementation(({ where }: any) => {
            if (where.email) searchedEmail = where.email;
            if (where.email === "founder@weddingwithindia.com" || where.clerkUserId === "clerk_founder_id_100" || where.id === "founder_db_id_001") {
              return Promise.resolve(founderDbRow);
            }
            return Promise.resolve(null);
          }),
          update: jest.fn().mockResolvedValue(founderDbRow),
        },
        travelerProfile: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    const user = await syncAndGetDbUser();

    expect(searchedEmail).toBe("founder@weddingwithindia.com");
    expect(user?.role).toBe(UserRole.ADMIN);
    expect(user?.status).toBe(UserStatus.ACTIVE);
  });

  it("EMPIRICAL CHECK 3: Mismatch unlinking preserves founder row canonical status & role", async () => {
    const staleUserWithClerkId = {
      id: "stale_user_id_888",
      clerkUserId: "clerk_founder_reused",
      email: "stale@weddingwithindia.com",
      role: UserRole.TRAVELER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const founderDbRow = {
      id: "founder_canonical_id",
      clerkUserId: "old_pending_clerk_id",
      email: "founder@weddingwithindia.com",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };

    (auth as jest.Mock).mockResolvedValue({ userId: "clerk_founder_reused" });
    (currentUser as jest.Mock).mockResolvedValue({
      id: "clerk_founder_reused",
      emailAddresses: [{ emailAddress: "founder@weddingwithindia.com" }],
      firstName: "Founder",
      lastName: "User",
      imageUrl: "https://example.com/avatar.jpg",
    });

    const updates: any[] = [];
    jest.spyOn(prisma, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        user: {
          findUnique: jest.fn().mockImplementation(({ where }: any) => {
            if (where.clerkUserId === "clerk_founder_reused") return Promise.resolve(staleUserWithClerkId);
            if (where.email === "founder@weddingwithindia.com") return Promise.resolve(founderDbRow);
            if (where.id === "founder_canonical_id") return Promise.resolve({ ...founderDbRow, clerkUserId: "clerk_founder_reused" });
            return Promise.resolve(null);
          }),
          update: jest.fn().mockImplementation(({ where, data }: any) => {
            updates.push({ where, data });
            if (where.id === "stale_user_id_888") return Promise.resolve({ ...staleUserWithClerkId, ...data });
            return Promise.resolve({ ...founderDbRow, ...data });
          }),
        },
        travelerProfile: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    const user = await syncAndGetDbUser();

    // Verification 1: Stale record unlinked
    expect(updates[0].where).toEqual({ id: "stale_user_id_888" });
    expect(updates[0].data.clerkUserId).toMatch(/^unlinked_stale_user_id_888_/);

    // Verification 2: Founder record linked to new Clerk ID without mutating role/status
    expect(updates[1].where).toEqual({ id: "founder_canonical_id" });
    expect(updates[1].data.clerkUserId).toBe("clerk_founder_reused");
    expect(updates[1].data.role).toBeUndefined();
    expect(updates[1].data.status).toBeUndefined();

    // Verification 3: Returned user is founder with ADMIN role
    expect(user?.id).toBe("founder_canonical_id");
    expect(user?.role).toBe(UserRole.ADMIN);
    expect(user?.status).toBe(UserStatus.ACTIVE);
  });
});
