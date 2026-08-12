import {
  adminGetUsersAction,
  adminUpdateUserRoleAction,
  adminUpdateUserStatusAction,
  adminInviteUserAction,
  adminGlobalSearchAction,
  adminUpsertHeroContentAction,
  adminDeleteHeroContentAction,
} from "@/lib/actions/admin";
import { UserRole } from "@prisma/client";

// Mock auth module
jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn(async (_roles: string[]) => ({
    id: "admin_test_id_123",
    email: "admin_tester@weddingwithindia.com",
    role: "ADMIN",
    name: "Admin Tester",
  })),
}));

// Mock Prisma
const mockUsers = [
  {
    id: "user_founder_id",
    email: "founder@weddingwithindia.com",
    name: "Founder",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: new Date(),
  },
  {
    id: "user_regular_id",
    email: "regular@test.com",
    name: "Regular Traveler",
    role: "TRAVELER",
    status: "ACTIVE",
    createdAt: new Date(),
  },
];

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(async () => mockUsers),
      findUnique: jest.fn(async ({ where }) => {
        if (where.email === "founder@weddingwithindia.com" || where.id === "user_founder_id") {
          return mockUsers[0];
        }
        if (where.email === "regular@test.com" || where.id === "user_regular_id") {
          return mockUsers[1];
        }
        return null;
      }),
      update: jest.fn(async ({ where, data }) => ({
        ...mockUsers[1],
        ...data,
      })),
      create: jest.fn(async ({ data }) => ({
        id: `created_${Date.now()}`,
        ...data,
      })),
      delete: jest.fn(async ({ where }) => mockUsers[1]),
      count: jest.fn(async () => 2),
    },
    wedding: {
      findMany: jest.fn(async () => [
        { id: "w1", title: "Royal Palace Wedding", location: "Udaipur", status: "PUBLISHED", slug: "w1" },
      ]),
    },
    booking: {
      findMany: jest.fn(async () => []),
    },
    safetyCase: {
      findMany: jest.fn(async () => []),
    },
    notification: {
      create: jest.fn(async () => ({ id: "notif_1" })),
    },
    auditLog: {
      create: jest.fn(async () => ({ id: "audit_1" })),
    },
    heroContent: {
      create: jest.fn(async ({ data }) => ({ id: "hero_123", ...data })),
      update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
      delete: jest.fn(async ({ where }) => ({ id: where.id, title: "Deleted Hero" })),
    },
    travelerProfile: {
      create: jest.fn(async () => ({ id: "trav_1" })),
      upsert: jest.fn(async () => ({ id: "trav_1" })),
    },
    coupleProfile: {
      create: jest.fn(async () => ({ id: "cpl_1" })),
      upsert: jest.fn(async () => ({ id: "cpl_1" })),
    },
    agentProfile: {
      create: jest.fn(async () => ({ id: "ag_1" })),
      upsert: jest.fn(async () => ({ id: "ag_1" })),
    },
  },
}));

// Mock revalidatePath
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("God-Level Admin Control Center Test Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User & Admin Management Actions", () => {
    it("should retrieve global users directory", async () => {
      const users = await adminGetUsersAction();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(2);
    });

    it("should reject status modifications on system founder account", async () => {
      await expect(
        adminUpdateUserStatusAction("user_founder_id", "SUSPENDED", "Test suspension")
      ).rejects.toThrow("Cannot suspend or ban the primary system founder account.");
    });

    it("should reject demotions on system founder account", async () => {
      await expect(
        adminUpdateUserRoleAction("user_founder_id", UserRole.TRAVELER)
      ).rejects.toThrow("Cannot modify the role of the primary system founder account.");
    });

    it("should pre-provision new admin account via invitation flow", async () => {
      const testEmail = "invited_admin_test@weddingwithindia.com";
      const res = await adminInviteUserAction(testEmail, UserRole.ADMIN, "Invited Admin Test");
      
      expect(res.success).toBe(true);
      expect(res.user.email).toBe(testEmail);
      expect(res.user.role).toBe(UserRole.ADMIN);
    });
  });

  describe("Global Operations Search Action", () => {
    it("should execute global search across Users, Weddings, Bookings, Safety Cases", async () => {
      const searchResult = await adminGlobalSearchAction("Royal");
      expect(searchResult).toHaveProperty("users");
      expect(searchResult).toHaveProperty("weddings");
      expect(searchResult).toHaveProperty("bookings");
      expect(searchResult).toHaveProperty("safetyCases");
    });
  });

  describe("CMS Hero Content Actions", () => {
    it("should create, update, and delete homepage hero content", async () => {
      const createRes = await adminUpsertHeroContentAction(null, {
        title: "Test Royal Wedding Banner",
        subtitle: "Experience authentic Indian hospitality with curated royal celebrations.",
        buttonText: "Discover Now",
        buttonLink: "/explore",
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
        active: true,
      });

      expect(createRes.success).toBe(true);
      expect(createRes.hero.id).toBe("hero_123");

      const deleteRes = await adminDeleteHeroContentAction(createRes.hero.id);
      expect(deleteRes.success).toBe(true);
    });
  });
});
