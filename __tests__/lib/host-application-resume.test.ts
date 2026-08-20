import { UserRole, VerificationStatus } from "@prisma/client";

// Mock next/cache revalidatePath
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock auth module
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

// Mock Prisma
const mockPrisma = {
  coupleProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  verification: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  wedding: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  $transaction: jest.fn(async (cb) => {
    if (typeof cb === "function") return cb(mockPrisma);
    return cb;
  }),
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

const { requireAuth, requireRole } = require("@/lib/auth");

describe("Host Application Resume & Duplicate Protection Lifecycle", () => {
  let mockUser: any;
  let mockAdmin: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      id: "user-host-resume-123",
      email: "host.resume@example.com",
      name: "Rajesh & Sunita Mehra",
      role: UserRole.COUPLE,
      status: "ACTIVE",
    };

    mockAdmin = {
      id: "admin-user-456",
      email: "admin@weddingwithindia.com",
      name: "System Admin",
      role: UserRole.ADMIN,
      status: "ACTIVE",
    };

    requireAuth.mockResolvedValue(mockUser);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    requireRole.mockImplementation((roles: UserRole[]) => {
      if (roles.includes(UserRole.ADMIN)) {
        return Promise.resolve(mockAdmin);
      }
      return Promise.resolve(mockUser);
    });
  });

  it("1. Authenticated user with no application receives empty detection state", async () => {
    mockPrisma.coupleProfile.findUnique.mockResolvedValue(null);
    mockPrisma.verification.findUnique.mockResolvedValue(null);

    const { GET } = require("@/app/api/host-application/route");
    const res = await GET();
    const json = await res.json();

    expect(json.hasActiveApplication).toBe(false);
    expect(json.application).toBeNull();
  });

  it("2. Authenticated user with DRAFT detects existing application & restores ID and fields", async () => {
    const existingWedding = {
      id: "wedding-existing-uuid-111",
      slug: "ananya-kabir-udaipur-12345",
      title: "Ananya & Kabir Wedding",
      description: "Our grand royal celebration at Jagmandir Palace.",
      location: "Jagmandir Island Palace, Udaipur, Rajasthan",
      category: "Hinduism",
      date: new Date("2027-02-15"),
      capacity: 15,
      mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a",
      status: "DRAFT",
      hostCoupleId: "couple-profile-111",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const coupleProfile = {
      id: "couple-profile-111",
      userId: mockUser.id,
      familyBio: existingWedding.description,
      weddings: [existingWedding],
    };

    const verification = {
      userId: mockUser.id,
      status: VerificationStatus.PENDING,
      notes: "Host application submitted.",
    };

    mockPrisma.coupleProfile.findUnique.mockResolvedValue(coupleProfile);
    mockPrisma.verification.findUnique.mockResolvedValue(verification);

    const { GET } = require("@/app/api/host-application/route");
    const res = await GET();
    const json = await res.json();

    expect(json.hasActiveApplication).toBe(true);
    expect(json.application.applicationId).toBe("wedding-existing-uuid-111");
    expect(json.application.coupleNames).toBe("Ananya & Kabir");
    expect(json.application.city).toBe("Udaipur");
    expect(json.application.venue).toBe("Jagmandir Island Palace");
    expect(json.application.verificationStatus).toBe("PENDING");
  });

  it("3. Authenticated user with NEED_MORE_DOCUMENTS detects existing application and exposes admin notes", async () => {
    const existingWedding = {
      id: "wedding-need-docs-222",
      title: "Rohan & Alisha Wedding",
      description: "Beach celebration in Goa.",
      location: "Riva Beach Resort, Mandrem, Goa",
      category: "Multicultural",
      date: new Date("2027-03-20"),
      capacity: 20,
      mainImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
      status: "DRAFT",
      hostCoupleId: "couple-profile-222",
    };

    const coupleProfile = {
      id: "couple-profile-222",
      userId: mockUser.id,
      weddings: [existingWedding],
    };

    const verification = {
      userId: mockUser.id,
      status: VerificationStatus.NEED_MORE_DOCUMENTS,
      notes: "Please upload proof of venue reservation and government ID.",
      reviewedBy: "admin@weddingwithindia.com",
    };

    mockPrisma.coupleProfile.findUnique.mockResolvedValue(coupleProfile);
    mockPrisma.verification.findUnique.mockResolvedValue(verification);

    const { GET } = require("@/app/api/host-application/route");
    const res = await GET();
    const json = await res.json();

    expect(json.hasActiveApplication).toBe(true);
    expect(json.application.applicationId).toBe("wedding-need-docs-222");
    expect(json.application.verificationStatus).toBe("NEED_MORE_DOCUMENTS");
    expect(json.application.adminNotes).toBe("Please upload proof of venue reservation and government ID.");
  });

  it("4 & 5 & 6. Resubmission updates existing Wedding in place without creating a duplicate", async () => {
    const existingWedding = {
      id: "wedding-original-id-333",
      title: "Ananya & Kabir Wedding",
      description: "Original description",
      location: "Jagmandir Palace, Udaipur, Rajasthan",
      category: "Hinduism",
      date: new Date("2027-02-15"),
      capacity: 10,
      mainImageUrl: "https://images.unsplash.com/photo-old",
      status: "DRAFT",
      hostCoupleId: "couple-profile-333",
    };

    const coupleProfile = {
      id: "couple-profile-333",
      userId: mockUser.id,
      weddings: [existingWedding],
    };

    mockPrisma.coupleProfile.findUnique.mockResolvedValue(coupleProfile);
    mockPrisma.coupleProfile.update.mockResolvedValue(coupleProfile);
    mockPrisma.wedding.findFirst.mockResolvedValue(existingWedding);
    mockPrisma.wedding.update.mockResolvedValue({
      ...existingWedding,
      title: "Ananya & Kabir Royal Wedding",
      description: "Updated story with additional venue proof.",
      capacity: 25,
    });
    mockPrisma.verification.upsert.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const { POST } = require("@/app/api/host-application/route");
    const req = new Response(
      JSON.stringify({
        hostName: "Rajesh & Sunita Mehra",
        email: "host.resume@example.com",
        phone: "+91 9876543210",
        coupleNames: "Ananya & Kabir Royal",
        city: "Udaipur",
        state: "Rajasthan",
        venue: "Jagmandir Island Palace",
        weddingDate: "2027-02-15",
        durationDays: "3",
        religion: "Hindu Vedic",
        story: "Updated story with additional venue proof.",
        photoUrl: "https://images.unsplash.com/photo-new",
        intlGuestCapacity: 25,
        existingApplicationId: "wedding-original-id-333",
      })
    );

    const res = await POST(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.isUpdate).toBe(true);
    expect(json.applicationId).toBe("wedding-original-id-333");

    // Must update existing wedding, NEVER create a new wedding
    expect(mockPrisma.wedding.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "wedding-original-id-333" },
      })
    );
    expect(mockPrisma.wedding.create).not.toHaveBeenCalled();
  });

  it("7. Unauthorized user cannot update another user's application", async () => {
    const { POST } = require("@/app/api/host-application/route");
    const req = new Response(
      JSON.stringify({
        hostName: "Hacker User",
        email: "victim@example.com",
        coupleNames: "Fake Couple",
        city: "Delhi",
        weddingDate: "2027-01-01",
      })
    );

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Use the email on your signed-in account");
  });

  it("8. Admin review updates state and preserves the same Wedding ID", async () => {
    const existingWedding = {
      id: "wedding-original-id-333",
      title: "Ananya & Kabir Wedding",
      status: "DRAFT",
      hostCoupleId: "couple-profile-333",
      hostCouple: {
        userId: mockUser.id,
        user: {
          email: mockUser.email,
          name: mockUser.name,
          verification: { status: "PENDING" },
        },
      },
    };

    mockPrisma.wedding.findUnique.mockResolvedValue(existingWedding);
    mockPrisma.wedding.update.mockResolvedValue({
      ...existingWedding,
      status: "DRAFT",
    });

    const { adminReviewHostApplicationAction } = require("@/lib/actions/admin");

    const result = await adminReviewHostApplicationAction(
      "wedding-original-id-333",
      "NEED_MORE_DOCUMENTS",
      "Please upload venue contract."
    );

    expect(result.success).toBe(true);
    expect(mockPrisma.wedding.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "wedding-original-id-333" },
        data: { status: "DRAFT" },
      })
    );
  });

  it("9. Toggling duration from 5 days to 3 days and saving preserves Day 4 and Day 5 draft data without loss", async () => {
    // Setup host application mock with 5 days
    const mockAppRecord = {
      id: "host-app-multi-day-123",
      userId: mockUser.id,
      coupleProfileId: "cp-123",
      durationDays: 3, // Toggled down to 3 days
    };

    mockPrisma.hostApplication = {
      findFirst: jest.fn().mockResolvedValue(mockAppRecord),
      update: jest.fn().mockResolvedValue(mockAppRecord),
      create: jest.fn().mockResolvedValue(mockAppRecord),
    };

    mockPrisma.hostApplicationDay = {
      upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve({ id: `day-rec-${create.dayNumber}`, ...create })),
    };

    mockPrisma.hostApplicationEvent = {
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: "ev-1" }),
    };

    const { saveHostApplicationDraftAction } = require("@/lib/actions/host-application");

    const daysInput = [
      { dayNumber: 1, title: "Day 1 Welcome", date: "2027-01-01" },
      { dayNumber: 2, title: "Day 2 Music", date: "2027-01-02" },
      { dayNumber: 3, title: "Day 3 Vows", date: "2027-01-03" },
      { dayNumber: 4, title: "Day 4 Reception", date: "2027-01-04" },
      { dayNumber: 5, title: "Day 5 Farewell Gala", date: "2027-01-05" },
    ];

    const result = await saveHostApplicationDraftAction({
      applicationId: "host-app-multi-day-123",
      hostName: mockUser.name,
      email: mockUser.email,
      coupleNames: "Rajesh & Sunita",
      city: "Jaipur",
      weddingDate: "2027-01-01",
      durationDays: 3, // Active commercial duration is 3
      days: daysInput, // All 5 days provided
    });

    expect(result.success).toBe(true);

    // Verify all 5 days were upserted and Day 5 was NOT dropped
    expect(mockPrisma.hostApplicationDay.upsert).toHaveBeenCalledTimes(5);
    expect(mockPrisma.hostApplicationDay.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          applicationId_dayNumber: {
            applicationId: "host-app-multi-day-123",
            dayNumber: 5,
          },
        },
        create: expect.objectContaining({
          dayNumber: 5,
          title: "Day 5 Farewell Gala",
        }),
      })
    );
  });
});
