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

describe("Challenger Empirical Stress Tests — syncAndGetDbUser()", () => {
  const mockAuth = auth as jest.MockedFunction<typeof auth>;
  const mockCurrentUser = currentUser as jest.MockedFunction<typeof currentUser>;

  beforeEach(() => {
    jest.setTimeout(20000);
    jest.clearAllMocks();
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null as any);
  });

  describe("1. Email Normalization & Trimming", () => {
    it("handles extreme whitespace, mixed casing, and special characters", async () => {
      mockAuth.mockResolvedValue({ userId: "clerk_norm_1" } as any);
      mockCurrentUser.mockResolvedValue({
        id: "clerk_norm_1",
        emailAddresses: [{ emailAddress: "\t  TEST.User+Tag@WeddingWithIndia.COM \n " }],
        firstName: null,
        lastName: null,
        imageUrl: null,
      } as any);

      let searchedEmail = "";
      let createdUserRecord: any = null;
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
              if (where.email) searchedEmail = where.email;
              if (where.id && createdUserRecord && where.id === createdUserRecord.id) {
                return Promise.resolve(createdUserRecord);
              }
              return Promise.resolve(null);
            }),
            create: jest.fn().mockImplementation(({ data }: any) => {
              createdUserRecord = {
                ...data,
                id: "user_created_1",
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              return Promise.resolve(createdUserRecord);
            }),
          },
          travelerProfile: { upsert: jest.fn().mockResolvedValue({}) },
        };
        return cb(mockTx);
      });

      const user = await syncAndGetDbUser();
      expect(searchedEmail).toBe("test.user+tag@weddingwithindia.com");
      expect(user?.email).toBe("test.user+tag@weddingwithindia.com");
      expect(user?.name).toBe("test.user+tag"); // Fallback name from email prefix
      expect(user?.avatar).toMatch(/^https:\/\/i\.pravatar\.cc\/80\?img=\d+$/);
    });

    it("handles missing emailAddresses array by constructing fallback email", async () => {
      mockAuth.mockResolvedValue({ userId: "clerk_no_email" } as any);
      mockCurrentUser.mockResolvedValue({
        id: "clerk_no_email",
        emailAddresses: [],
        firstName: "Guest",
        lastName: "User",
        imageUrl: "https://example.com/guest.png",
      } as any);

      let searchedEmail = "";
      let createdUserRecord: any = null;
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
              if (where.email) searchedEmail = where.email;
              if (where.id && createdUserRecord && where.id === createdUserRecord.id) {
                return Promise.resolve(createdUserRecord);
              }
              return Promise.resolve(null);
            }),
            create: jest.fn().mockImplementation(({ data }: any) => {
              createdUserRecord = {
                ...data,
                id: "guest_id_1",
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              return Promise.resolve(createdUserRecord);
            }),
          },
          travelerProfile: { upsert: jest.fn().mockResolvedValue({}) },
        };
        return cb(mockTx);
      });

      const user = await syncAndGetDbUser();
      expect(searchedEmail).toBe("clerk_no_email@guest.weddingwithindia.com");
      expect(user?.email).toBe("clerk_no_email@guest.weddingwithindia.com");
      expect(user?.name).toBe("Guest User");
      expect(user?.avatar).toBe("https://example.com/guest.png");
    });
  });

  describe("2. Conflicting Clerk ID vs Email Scenarios (Identity Conflict Matrix)", () => {
    it("handles branch 1: both existingByEmail and existingByClerkId exist on different rows", async () => {
      mockAuth.mockResolvedValue({ userId: "clerk_new_id" } as any);
      mockCurrentUser.mockResolvedValue({
        id: "clerk_new_id",
        emailAddresses: [{ emailAddress: "founder@weddingwithindia.com" }],
        firstName: "Founder",
        lastName: "Owner",
        imageUrl: "https://example.com/new_founder.png",
      } as any);

      const oldUserWithSameClerkId = {
        id: "user_old_clerk",
        clerkUserId: "clerk_new_id",
        email: "old_email@domain.com",
        role: UserRole.TRAVELER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(1000),
        updatedAt: new Date(2000),
      };

      const founderRowWithEmail = {
        id: "user_founder_row",
        clerkUserId: "old_clerk_placeholder",
        email: "founder@weddingwithindia.com",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: new Date(1000),
        updatedAt: new Date(2000),
      };

      const updateLog: any[] = [];

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
              if (where.clerkUserId === "clerk_new_id") return Promise.resolve(oldUserWithSameClerkId);
              if (where.email === "founder@weddingwithindia.com") return Promise.resolve(founderRowWithEmail);
              if (where.id === "user_founder_row") {
                return Promise.resolve({
                  ...founderRowWithEmail,
                  clerkUserId: "clerk_new_id",
                  name: "Founder Owner",
                  avatar: "https://example.com/new_founder.png",
                });
              }
              return Promise.resolve(null);
            }),
            update: jest.fn().mockImplementation(({ where, data }: any) => {
              updateLog.push({ where, data });
              if (where.id === "user_old_clerk") {
                return Promise.resolve({ ...oldUserWithSameClerkId, ...data });
              }
              return Promise.resolve({ ...founderRowWithEmail, ...data });
            }),
          },
          travelerProfile: { upsert: jest.fn().mockResolvedValue({}) },
        };
        return cb(mockTx);
      });

      const result = await syncAndGetDbUser();

      // Unlinks old user's clerkUserId with unlinked_<id>_<timestamp>
      expect(updateLog[0].where).toEqual({ id: "user_old_clerk" });
      expect(updateLog[0].data.clerkUserId).toMatch(/^unlinked_user_old_clerk_\d+$/);

      // Updates founder row with new clerkUserId, name, avatar
      expect(updateLog[1].where).toEqual({ id: "user_founder_row" });
      expect(updateLog[1].data).toEqual({
        clerkUserId: "clerk_new_id",
        name: "Founder Owner",
        avatar: "https://example.com/new_founder.png",
      });

      // Role and status MUST NOT be overwritten in update payload
      expect(updateLog[1].data.role).toBeUndefined();
      expect(updateLog[1].data.status).toBeUndefined();

      // Returned user is canonical founder row with ADMIN role intact
      expect(result?.id).toBe("user_founder_row");
      expect(result?.role).toBe(UserRole.ADMIN);
    });

    it("handles branch 2: existingByEmail and existingByClerkId point to SAME row", async () => {
      mockAuth.mockResolvedValue({ userId: "clerk_same" } as any);
      mockCurrentUser.mockResolvedValue({
        id: "clerk_same",
        emailAddresses: [{ emailAddress: "same@weddingwithindia.com" }],
        firstName: "Same",
        lastName: "User",
        imageUrl: "https://example.com/same.png",
      } as any);

      const existingUser = {
        id: "user_same_123",
        clerkUserId: "clerk_same",
        email: "same@weddingwithindia.com",
        role: UserRole.TRAVELER,
        status: UserStatus.ACTIVE,
        createdAt: new Date(1000),
        updatedAt: new Date(2000),
      };

      const updateLog: any[] = [];
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
              if (where.clerkUserId === "clerk_same" || where.email === "same@weddingwithindia.com" || where.id === "user_same_123") {
                return Promise.resolve(existingUser);
              }
              return Promise.resolve(null);
            }),
            update: jest.fn().mockImplementation(({ where, data }: any) => {
              updateLog.push({ where, data });
              return Promise.resolve({ ...existingUser, ...data });
            }),
          },
          travelerProfile: { upsert: jest.fn().mockResolvedValue({}) },
        };
        return cb(mockTx);
      });

      const result = await syncAndGetDbUser();

      expect(updateLog.length).toBe(1);
      expect(updateLog[0].where).toEqual({ id: "user_same_123" });
      expect(updateLog[0].data).toEqual({
        name: "Same User",
        avatar: "https://example.com/same.png",
      });
      expect(result?.id).toBe("user_same_123");
    });
  });

  describe("3. Prisma P2002 Error Handling & Concurrent Signup Recovery", () => {
    it("recovers gracefully when tx.user.create throws P2002 and raced user is found by email", async () => {
      mockAuth.mockResolvedValue({ userId: "clerk_race_1" } as any);
      mockCurrentUser.mockResolvedValue({
        id: "clerk_race_1",
        emailAddresses: [{ emailAddress: "raced@weddingwithindia.com" }],
        firstName: "Raced",
        lastName: "User",
        imageUrl: "https://example.com/raced.png",
      } as any);

      const racedDbUser = {
        id: "raced_user_id",
        clerkUserId: "clerk_race_1",
        email: "raced@weddingwithindia.com",
        role: UserRole.TRAVELER,
        status: UserStatus.ONBOARDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      let findUniqueCalls = 0;
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockImplementation(({ where }: any) => {
              findUniqueCalls++;
              // Initial checks (calls 1 & 2) return null to simulate race condition where lookup missed creation
              if (findUniqueCalls <= 2) return Promise.resolve(null);
              // Post-P2002 lookup returns raced user
              if (where.email === "raced@weddingwithindia.com" || where.id === "raced_user_id") {
                return Promise.resolve(racedDbUser);
              }
              return Promise.resolve(null);
            }),
            create: jest.fn().mockRejectedValue({
              code: "P2002",
              message: "Unique constraint failed on email",
            }),
          },
          travelerProfile: { upsert: jest.fn().mockResolvedValue({}) },
        };
        return cb(mockTx);
      });

      const user = await syncAndGetDbUser();
      expect(user?.id).toBe("raced_user_id");
      expect(user?.email).toBe("raced@weddingwithindia.com");
    });

    it("rethrows P2002 error if raced user cannot be found, triggering SERVICE_UNAVAILABLE", async () => {
      mockAuth.mockResolvedValue({ userId: "clerk_race_fail" } as any);
      mockCurrentUser.mockResolvedValue({
        id: "clerk_race_fail",
        emailAddresses: [{ emailAddress: "racefail@weddingwithindia.com" }],
        firstName: "Race",
        lastName: "Fail",
        imageUrl: "https://example.com/fail.png",
      } as any);

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockRejectedValue({
              code: "P2002",
              message: "Unique constraint failed on unknown_field",
            }),
          },
          travelerProfile: { upsert: jest.fn().mockResolvedValue({}) },
        };
        return cb(mockTx);
      });

      await expect(syncAndGetDbUser()).rejects.toThrow("SERVICE_UNAVAILABLE");
    });
  });

  describe("4. Fail-Closed Security (SEC-002)", () => {
    it("fails closed with SERVICE_UNAVAILABLE when database throws connection error", async () => {
      mockAuth.mockResolvedValue({ userId: "clerk_db_err" } as any);
      mockCurrentUser.mockResolvedValue({
        id: "clerk_db_err",
        emailAddresses: [{ emailAddress: "dberr@weddingwithindia.com" }],
        firstName: "DB",
        lastName: "Err",
      } as any);

      jest.spyOn(prisma, "$transaction").mockRejectedValue(new Error("P1001: Cannot connect to database server"));

      await expect(syncAndGetDbUser()).rejects.toThrow(
        "SERVICE_UNAVAILABLE: Authentication service is temporarily unavailable. Please try again shortly."
      );
    });

    it("returns null when Clerk session is missing or unauthenticated", async () => {
      mockAuth.mockResolvedValue(null as any);
      const user = await syncAndGetDbUser();
      expect(user).toBeNull();
    });

    it("returns null when Clerk currentUser() returns null", async () => {
      mockAuth.mockResolvedValue({ userId: "clerk_no_user" } as any);
      mockCurrentUser.mockResolvedValue(null as any);
      const user = await syncAndGetDbUser();
      expect(user).toBeNull();
    });
  });
});
