/**
 * __tests__/lib/admin-coordinator-assignment.test.ts
 *
 * Unit & Integration Tests for Admin Coordinator Shift Deployment:
 * 1. Admin Assign Coordinator to Published Wedding.
 * 2. Reject Assigning Coordinator to Non-Published Wedding.
 * 3. Admin Unassign Coordinator from Wedding Shift.
 * 4. RBAC Guards: Reject non-admins from assigning coordinators.
 * 5. Audit Logging & Notification Trigger Invariants.
 */

import {
  adminAssignCoordinatorAction,
  adminUnassignCoordinatorAction,
  adminGetCoordinatorsAction,
} from "@/lib/actions/admin";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// Mocks
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/prisma", () => {
  const mockCoordinator = {
    id: "coord_prof_1",
    userId: "coord_user_1",
    city: "Jaipur",
    availability: "Full-time",
    eventExperience: "5 years wedding coordination",
    status: "ACTIVE",
    assignedWeddingId: null,
    assignedEventTitle: null,
    assignedDate: null,
    user: { id: "coord_user_1", name: "Vikram Singh", email: "vikram@example.com", status: "ACTIVE" },
  };

  const mockWeddingPublished = {
    id: "w_pub_1",
    title: "Grand Royal Palace Celebration",
    location: "Jaipur, Rajasthan",
    date: new Date("2026-11-25"),
    status: "PUBLISHED",
    suspended: false,
    deletedAt: null,
  };

  const mockWeddingDraft = {
    id: "w_draft_1",
    title: "Unpublished Draft Wedding",
    location: "Goa",
    date: new Date("2026-12-01"),
    status: "DRAFT",
    suspended: false,
    deletedAt: null,
  };

  const mockPrismaClient: any = {
    coordinatorProfile: {
      findUnique: jest.fn(async () => mockCoordinator),
      findMany: jest.fn(async () => [mockCoordinator]),
      update: jest.fn(async ({ where, data }: any) => ({ ...mockCoordinator, ...data, id: where.id })),
    },
    wedding: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where.id === "w_draft_1") return mockWeddingDraft;
        return mockWeddingPublished;
      }),
      findMany: jest.fn(async () => [mockWeddingPublished]),
    },
    notification: {
      create: jest.fn(async ({ data }: any) => ({ id: "notif_coord_1", ...data })),
    },
    auditLog: {
      create: jest.fn(async ({ data }: any) => ({ id: "audit_coord_1", ...data })),
    },
  };

  return {
    prisma: mockPrismaClient,
  };
});

describe("Admin Coordinator Assignment Lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin_user_1",
      email: "admin@weddingwithindia.com",
      role: UserRole.ADMIN,
    });
  });

  it("1. Rejects non-admin users from assigning coordinators", async () => {
    (requireRole as jest.Mock).mockRejectedValueOnce(new Error("FORBIDDEN"));

    await expect(
      adminAssignCoordinatorAction("coord_prof_1", "w_pub_1")
    ).rejects.toThrow("FORBIDDEN");
  });

  it("2. Rejects assignment to non-published draft weddings", async () => {
    await expect(
      adminAssignCoordinatorAction("coord_prof_1", "w_draft_1")
    ).rejects.toThrow("Coordinators can only be assigned to published weddings.");
  });

  it("3. Successfully assigns coordinator to published wedding shift", async () => {
    const res = await adminAssignCoordinatorAction("coord_prof_1", "w_pub_1");

    expect(res.success).toBe(true);
    expect(prisma.coordinatorProfile.update).toHaveBeenCalledWith({
      where: { id: "coord_prof_1" },
      data: expect.objectContaining({
        assignedWeddingId: "w_pub_1",
        assignedEventTitle: "Grand Royal Palace Celebration",
      }),
    });
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "coord_user_1",
        type: "INFO",
      }),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "ASSIGN_COORDINATOR",
        entity: "CoordinatorProfile",
        entityId: "coord_prof_1",
      }),
    });
  });

  it("4. Successfully unassigns coordinator from active shift", async () => {
    (prisma.coordinatorProfile.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "coord_prof_1",
      userId: "coord_user_1",
      assignedWeddingId: "w_pub_1",
      assignedEventTitle: "Grand Royal Palace Celebration",
      user: { id: "coord_user_1", email: "vikram@example.com" },
    });

    const res = await adminUnassignCoordinatorAction("coord_prof_1");

    expect(res.success).toBe(true);
    expect(prisma.coordinatorProfile.update).toHaveBeenCalledWith({
      where: { id: "coord_prof_1" },
      data: expect.objectContaining({
        assignedWeddingId: null,
        assignedEventTitle: null,
        assignedDate: null,
      }),
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "UNASSIGN_COORDINATOR",
        entity: "CoordinatorProfile",
        entityId: "coord_prof_1",
      }),
    });
  });

  it("5. Retrieves coordinators and published weddings for admin selector", async () => {
    const res = await adminGetCoordinatorsAction();

    expect(res.coordinators).toHaveLength(1);
    expect(res.publishedWeddings).toHaveLength(1);
    expect(res.publishedWeddings[0].title).toBe("Grand Royal Palace Celebration");
  });
});
