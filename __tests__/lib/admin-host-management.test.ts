import {
  adminGetHostApplicationsAction,
  adminGetHostApplicationByIdAction,
  adminReviewHostApplicationAction
} from "@/lib/actions/admin";
import { getWeddings } from "@/lib/actions/wedding";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole, VerificationStatus } from "@prisma/client";

jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    wedding: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    verification: {
      upsert: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/email", () => ({
  sendVerificationApprovedEmail: jest.fn().mockResolvedValue(true),
  sendVerificationRejectedEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Admin Host Applications Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require ADMIN role for adminGetHostApplicationsAction", async () => {
    (requireRole as jest.Mock).mockImplementation(async (roles: UserRole[]) => {
      if (!roles.includes(UserRole.ADMIN)) throw new Error("Forbidden");
      return { id: "admin-1", email: "admin@weddingwithindia.com", role: UserRole.ADMIN };
    });

    (prisma.wedding.findMany as jest.Mock).mockResolvedValue([
      {
        id: "wedding-1",
        title: "Priya & Rahul Wedding",
        status: "DRAFT",
        hostCouple: {
          id: "couple-1",
          userId: "user-1",
          user: {
            id: "user-1",
            name: "Priya Sharma",
            email: "priya@example.com",
            verification: { status: VerificationStatus.PENDING },
          },
        },
      },
    ]);

    const result = await adminGetHostApplicationsAction();

    expect(requireRole).toHaveBeenCalledWith([UserRole.ADMIN]);
    expect(prisma.wedding.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Priya & Rahul Wedding");
  });

  it("should reject non-admin access for host management actions", async () => {
    (requireRole as jest.Mock).mockRejectedValue(new Error("Unauthorized: Admin role required"));

    await expect(adminGetHostApplicationsAction()).rejects.toThrow("Unauthorized: Admin role required");
  });

  it("should retrieve single host application by ID", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin-1",
      email: "admin@weddingwithindia.com",
      role: UserRole.ADMIN,
    });

    const mockWedding = {
      id: "wedding-1",
      title: "Ananya & Dev Wedding",
      status: "DRAFT",
      hostCouple: {
        id: "couple-1",
        user: { id: "user-1", email: "ananya@example.com" },
      },
    };

    (prisma.wedding.findUnique as jest.Mock).mockResolvedValue(mockWedding);

    const result = await adminGetHostApplicationByIdAction("wedding-1");

    expect(prisma.wedding.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "wedding-1" } })
    );
    expect(result).toEqual(mockWedding);
  });

  it("should review and approve host application, setting wedding to PUBLISHED and user/verification to APPROVED/ACTIVE", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin-1",
      name: "Admin User",
      email: "admin@weddingwithindia.com",
      role: UserRole.ADMIN,
    });

    (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
      id: "wedding-1",
      title: "Meera & Vikram Wedding",
      slug: "meera-vikram-wedding",
      hostCoupleId: "couple-1",
      hostCouple: {
        id: "couple-1",
        userId: "user-1",
        user: { id: "user-1", name: "Meera", email: "meera@example.com" },
      },
    });

    (prisma.wedding.update as jest.Mock).mockResolvedValue({
      id: "wedding-1",
      title: "Meera & Vikram Wedding",
      status: "PUBLISHED",
    });

    const result = await adminReviewHostApplicationAction("wedding-1", "APPROVED", "Approved after document audit");

    expect(prisma.wedding.update).toHaveBeenCalledWith({
      where: { id: "wedding-1" },
      data: { status: "PUBLISHED" },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { status: "ACTIVE" },
    });
    expect(prisma.verification.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        create: expect.objectContaining({ status: VerificationStatus.APPROVED }),
      })
    );
    expect(result.success).toBe(true);
    expect(result.wedding.status).toBe("PUBLISHED");
  });

  it("should review and reject host application, setting wedding to REJECTED and verification to REJECTED", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      id: "admin-1",
      email: "admin@weddingwithindia.com",
      role: UserRole.ADMIN,
    });

    (prisma.wedding.findUnique as jest.Mock).mockResolvedValue({
      id: "wedding-2",
      title: "Test Reject Wedding",
      slug: "test-reject-wedding",
      hostCoupleId: "couple-2",
      hostCouple: {
        id: "couple-2",
        userId: "user-2",
        user: { id: "user-2", email: "test@example.com" },
      },
    });

    (prisma.wedding.update as jest.Mock).mockResolvedValue({
      id: "wedding-2",
      status: "REJECTED",
    });

    const result = await adminReviewHostApplicationAction("wedding-2", "REJECTED", "Incomplete venue documents");

    expect(prisma.wedding.update).toHaveBeenCalledWith({
      where: { id: "wedding-2" },
      data: { status: "REJECTED" },
    });
    expect(prisma.verification.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: VerificationStatus.REJECTED }),
      })
    );
    expect(result.success).toBe(true);
  });
});
