import { UserRole, VerificationStatus, WeddingStatus } from "@prisma/client";
import {
  WeddingTier,
  WeddingDurationDays,
  getHostPayoutPerGuestINR,
  getCustomerPriceUSD,
  calculateHostPotentialEarnings,
  calculateBookingPricing,
} from "@/lib/services/pricing-engine";
import { formatPsychologicalLakh } from "@/components/wedding/HostEarningsCalculator";

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Mock auth module
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  coupleProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  hostApplication: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  hostApplicationDay: {
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  hostApplicationEvent: {
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
  hostDocumentRequest: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  hostDocument: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  hostApplicationAuditLog: {
    create: jest.fn(),
  },
  verification: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  wedding: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  auditLog: {
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

describe("God-Level Host Experience & Pricing Engine Invariants", () => {
  let mockHostUser: any;
  let mockAdminUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockHostUser = {
      id: "user-host-101",
      email: "host.family@example.com",
      name: "Rajesh Mehra",
      role: UserRole.COUPLE,
      status: "ACTIVE",
    };

    mockAdminUser = {
      id: "admin-user-202",
      email: "admin@weddingwithindia.com",
      name: "Lead Verifier",
      role: UserRole.ADMIN,
      status: "ACTIVE",
    };

    requireAuth.mockResolvedValue(mockHostUser);
    mockPrisma.user.findUnique.mockResolvedValue(mockHostUser);
    mockPrisma.user.findMany.mockResolvedValue([mockAdminUser]);
    requireRole.mockImplementation((roles: UserRole[]) => {
      if (roles.includes(UserRole.ADMIN)) {
        return Promise.resolve(mockAdminUser);
      }
      return Promise.resolve(mockHostUser);
    });
  });

  describe("1. Authoritative Pricing Matrix & Benchmark Verification", () => {
    it("Verifies 1 day / Standard / 1 guest = Host ₹5,101", () => {
      const hostRate = getHostPayoutPerGuestINR("STANDARD", 1);
      expect(hostRate).toBe(5101);
      const total = hostRate * 1;
      expect(total).toBe(5101);
      expect(formatPsychologicalLakh(total)).toBe("₹5,101");
    });

    it("Verifies 3 days / Grand / 20 guests = Host ₹4,02,020", () => {
      const hostRate = getHostPayoutPerGuestINR("GRAND", 3);
      expect(hostRate).toBe(20101);
      const total = hostRate * 20;
      expect(total).toBe(402020);
      expect(formatPsychologicalLakh(total)).toBe("₹4.02 Lakh");
    });

    it("Verifies 4 days / Royal / 20 guests = Host ₹8,22,020", () => {
      const hostRate = getHostPayoutPerGuestINR("ROYAL", 4);
      expect(hostRate).toBe(41101);
      const total = hostRate * 20;
      expect(total).toBe(822020);
      expect(formatPsychologicalLakh(total)).toBe("₹8.22 Lakh");
    });

    it("Verifies 4 days / Signature Royal / 20 guests = Customer $19,980, Host ₹10,22,020, Agent ₹50,220", () => {
      const pricing = calculateBookingPricing({
        tier: "SIGNATURE_ROYAL",
        durationDays: 4,
        guestCount: 20,
        isAgentAttributed: true,
      });

      expect(pricing.customerPricePerGuestUSD).toBe(999);
      expect(pricing.customerTotalAmountUSD).toBe(19980);
      expect(pricing.hostPayoutPerGuestINR).toBe(51101);
      expect(pricing.totalHostPayoutINR).toBe(1022020);
      expect(pricing.agentPayoutPerGuestINR).toBe(2511);
      expect(pricing.totalAgentPayoutINR).toBe(50220);
      expect(formatPsychologicalLakh(pricing.totalHostPayoutINR)).toBe("₹10.22 Lakh");
    });

    it("Verifies 5 days / Signature Royal / 20 guests = Host ₹12,22,020", () => {
      const hostRate = getHostPayoutPerGuestINR("SIGNATURE_ROYAL", 5);
      expect(hostRate).toBe(61101);
      const total = hostRate * 20;
      expect(total).toBe(1222020);
      expect(formatPsychologicalLakh(total)).toBe("₹12.22 Lakh");
    });

    it("Verifies 5 days / Signature Royal / 50 guests = Host ₹30,55,050", () => {
      const hostRate = getHostPayoutPerGuestINR("SIGNATURE_ROYAL", 5);
      expect(hostRate).toBe(61101);
      const total = hostRate * 50;
      expect(total).toBe(3055050);
      expect(formatPsychologicalLakh(total)).toBe("₹30.55 Lakh");
    });
  });

  describe("2. Psychological Lakh Headline Formatter", () => {
    it("formats 25505 to '₹25.5 Thousand'", () => {
      expect(formatPsychologicalLakh(25505)).toBe("₹25.5 Thousand");
    });

    it("formats 201010 to '₹2.01 Lakh'", () => {
      expect(formatPsychologicalLakh(201010)).toBe("₹2.01 Lakh");
    });

    it("formats 1222020 to '₹12.22 Lakh'", () => {
      expect(formatPsychologicalLakh(1222020)).toBe("₹12.22 Lakh");
    });

    it("formats 10500000 to '₹1.05 Crore'", () => {
      expect(formatPsychologicalLakh(10500000)).toBe("₹1.05 Crore");
    });
  });

  describe("3. Multi-Day Host Application Draft Saving & Server Persistence", () => {
    it("Saves draft application with 3 days of ceremonies without requiring images", async () => {
      const { saveHostApplicationDraftAction } = require("@/lib/actions/host-application");

      const mockSavedApp = {
        id: "app-draft-uuid-1",
        userId: mockHostUser.id,
        coupleNames: "Ananya & Kabir",
        city: "Udaipur",
        durationDays: 3,
        status: "DRAFT",
        lastSavedAt: new Date(),
      };

      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple-1", userId: mockHostUser.id });
      mockPrisma.hostApplication.findFirst.mockResolvedValue(null);
      mockPrisma.hostApplication.create.mockResolvedValue(mockSavedApp);
      mockPrisma.hostApplicationDay.upsert.mockResolvedValue({ id: "day-1" });
      mockPrisma.hostApplicationEvent.create.mockResolvedValue({ id: "ev-1" });

      const res = await saveHostApplicationDraftAction({
        hostName: "Rajesh Mehra",
        email: mockHostUser.email,
        coupleNames: "Ananya & Kabir",
        city: "Udaipur",
        weddingDate: "2027-02-15",
        durationDays: 3,
        requestedTier: "ROYAL",
        days: [
          {
            dayNumber: 1,
            date: "2027-02-15",
            title: "Welcome & Mehndi",
            events: [{ name: "Mehndi Ceremony", startTime: "16:00", endTime: "20:00" }],
          },
          {
            dayNumber: 2,
            date: "2027-02-16",
            title: "Haldi & Sangeet",
            events: [{ name: "Sangeet Musical Night", startTime: "19:00", endTime: "23:00" }],
          },
          {
            dayNumber: 3,
            date: "2027-02-17",
            title: "Vedic Wedding & Reception",
            events: [{ name: "Pheras", startTime: "18:00", endTime: "20:00" }],
          },
        ],
      });

      expect(res.success).toBe(true);
      expect(res.applicationId).toBe("app-draft-uuid-1");
      expect(mockPrisma.hostApplication.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            coupleNames: "Ananya & Kabir",
            city: "Udaipur",
            durationDays: 3,
            status: "DRAFT",
          }),
        })
      );
    });

    it("Submitting application transitions status to SUBMITTED and notifies admin", async () => {
      const { submitHostApplicationAction } = require("@/lib/actions/host-application");

      const mockApp = {
        id: "app-draft-uuid-1",
        userId: mockHostUser.id,
        coupleNames: "Ananya & Kabir",
        city: "Udaipur",
        durationDays: 3,
        status: "DRAFT",
        lastSavedAt: new Date(),
      };

      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple-1", userId: mockHostUser.id });
      mockPrisma.hostApplication.findFirst.mockResolvedValue(mockApp);
      mockPrisma.hostApplication.update.mockResolvedValue({
        ...mockApp,
        status: "SUBMITTED",
      });
      mockPrisma.verification.upsert.mockResolvedValue({});
      mockPrisma.hostApplicationAuditLog.create.mockResolvedValue({});
      mockPrisma.notification.create.mockResolvedValue({});

      const res = await submitHostApplicationAction({
        applicationId: "app-draft-uuid-1",
        hostName: "Rajesh Mehra",
        email: mockHostUser.email,
        coupleNames: "Ananya & Kabir",
        city: "Udaipur",
        weddingDate: "2027-02-15",
        durationDays: 3,
        requestedTier: "SIGNATURE_ROYAL",
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.hostApplication.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "app-draft-uuid-1" },
          data: expect.objectContaining({
            status: "SUBMITTED",
          }),
        })
      );
      expect(mockPrisma.notification.create).toHaveBeenCalled();
    });
  });

  describe("4. Admin Document Request & Verification Workflow", () => {
    it("Admin requests venue confirmation photo, moving app status to ACTION_REQUIRED", async () => {
      const { adminCreateDocumentRequestAction } = require("@/lib/actions/admin");

      const mockApp = {
        id: "app-submitted-uuid-2",
        userId: mockHostUser.id,
        status: "SUBMITTED",
      };

      mockPrisma.hostApplication.findUnique.mockResolvedValue(mockApp);
      mockPrisma.hostDocumentRequest.create.mockResolvedValue({
        id: "doc-req-1",
        applicationId: mockApp.id,
        title: "Venue Confirmation Photo",
      });
      mockPrisma.hostApplication.update.mockResolvedValue({
        ...mockApp,
        status: "ACTION_REQUIRED",
      });
      mockPrisma.verification.upsert.mockResolvedValue({});
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.hostApplicationAuditLog.create.mockResolvedValue({});

      const res = await adminCreateDocumentRequestAction({
        applicationId: mockApp.id,
        requestType: "VENUE_PHOTO",
        title: "Venue Confirmation Photo",
        description: "Please upload official venue contract or photo.",
        isRequired: true,
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.hostApplication.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockApp.id },
          data: expect.objectContaining({
            status: "ACTION_REQUIRED",
          }),
        })
      );
      expect(mockPrisma.verification.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockHostUser.id },
          update: expect.objectContaining({
            status: VerificationStatus.NEED_MORE_DOCUMENTS,
          }),
        })
      );
    });

    it("Host uploads requested document and moves request to FULFILLED", async () => {
      const { uploadHostRequestedDocumentAction } = require("@/lib/actions/host-application");

      const mockReq = {
        id: "doc-req-1",
        applicationId: "app-submitted-uuid-2",
        userId: mockHostUser.id,
        title: "Venue Confirmation Photo",
        application: {
          userId: mockHostUser.id,
        },
      };

      mockPrisma.hostDocumentRequest.findUnique.mockResolvedValue(mockReq);
      mockPrisma.hostDocument.create.mockResolvedValue({ id: "doc-file-1" });
      mockPrisma.hostDocumentRequest.update.mockResolvedValue({});
      mockPrisma.hostDocumentRequest.findMany.mockResolvedValue([]); // zero remaining pending
      mockPrisma.hostApplication.update.mockResolvedValue({});
      mockPrisma.hostApplicationAuditLog.create.mockResolvedValue({});

      const res = await uploadHostRequestedDocumentAction({
        requestId: "doc-req-1",
        fileUrl: "https://storage.weddingwithindia.com/docs/venue-proof.pdf",
        fileName: "venue-contract.pdf",
        fileSize: 1024000,
        mimeType: "application/pdf",
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.hostDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fileName: "venue-contract.pdf",
            status: "SUBMITTED",
          }),
        })
      );
      expect(mockPrisma.hostDocumentRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "doc-req-1" },
          data: expect.objectContaining({ status: "FULFILLED" }),
        })
      );
    });

    it("Admin verifies tier (e.g. Host requested Signature Royal -> Admin verifies Royal) and publishes wedding", async () => {
      const { adminVerifyHostApplicationAction } = require("@/lib/actions/admin");

      const mockApp = {
        id: "app-submitted-uuid-2",
        userId: mockHostUser.id,
        coupleProfileId: "couple-1",
        coupleNames: "Ananya & Kabir",
        city: "Udaipur",
        weddingDate: new Date("2027-02-15"),
        durationDays: 4,
        requestedTier: "SIGNATURE_ROYAL",
        expectedInternationalGuests: 20,
        weddingScale: "GRAND",
        tradition: "Hinduism",
        wedding: null,
      };

      mockPrisma.hostApplication.findUnique.mockResolvedValue(mockApp);
      mockPrisma.wedding.findFirst.mockResolvedValue(null);
      mockPrisma.wedding.create.mockResolvedValue({
        id: "wedding-pub-1",
        slug: "ananya-kabir-udaipur-12345",
        status: WeddingStatus.PUBLISHED,
        pricePerGuest: 799, // Royal 4-day customer price in USD
      });
      mockPrisma.hostApplication.update.mockResolvedValue({
        ...mockApp,
        verifiedTier: "ROYAL",
        status: "APPROVED_FOR_LISTING",
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.verification.upsert.mockResolvedValue({});
      mockPrisma.notification.create.mockResolvedValue({});
      mockPrisma.hostApplicationAuditLog.create.mockResolvedValue({});

      const res = await adminVerifyHostApplicationAction({
        applicationId: mockApp.id,
        verifiedTier: "ROYAL",
        verifiedDurationDays: 4,
        status: "APPROVED_FOR_LISTING",
        adminNotesHostFacing: "Verified celebration as Royal Tier for 4 days.",
        publishImmediately: true,
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.wedding.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tier: "ROYAL",
            durationDays: 4,
            pricePerGuest: 799, // Authoritative $799 USD from pricing engine
            status: WeddingStatus.PUBLISHED,
          }),
        })
      );
    });

    it("Preserves neutral traditions (e.g. Interfaith, Muslim, Christian, Sikh, Custom) without bias", async () => {
      const { saveHostApplicationDraftAction } = require("@/lib/actions/host-application");

      const mockSavedApp = {
        id: "app-draft-neutral-1",
        userId: mockHostUser.id,
        coupleNames: "Sara & Michael Celebration",
        city: "Kochi",
        durationDays: 2,
        tradition: "Interfaith / Multicultural",
        status: "DRAFT",
        lastSavedAt: new Date(),
      };

      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple-1", userId: mockHostUser.id });
      mockPrisma.hostApplication.findFirst.mockResolvedValue(null);
      mockPrisma.hostApplication.create.mockResolvedValue(mockSavedApp);
      mockPrisma.hostApplicationDay.upsert.mockResolvedValue({ id: "day-1" });

      const res = await saveHostApplicationDraftAction({
        hostName: "Michael Fernandez",
        email: mockHostUser.email,
        coupleNames: "Sara & Michael Celebration",
        city: "Kochi",
        weddingDate: "2027-04-10",
        durationDays: 2,
        tradition: "Interfaith / Multicultural",
        requestedTier: "ENHANCED",
        expectedInternationalGuests: 15,
        days: [
          {
            dayNumber: 1,
            date: "2027-04-10",
            title: "Welcome Dinner",
            events: [{ name: "Family Welcome Dinner", startTime: "18:00", endTime: "22:00" }],
          },
          {
            dayNumber: 2,
            date: "2027-04-11",
            title: "Celebration Ceremony & Banquet",
            events: [{ name: "Ceremony & Reception", startTime: "16:00", endTime: "23:00" }],
          },
        ],
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.hostApplication.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tradition: "Interfaith / Multicultural",
            durationDays: 2,
          }),
        })
      );
    });

    it("Verifies Royal 5-day and Signature Royal 4-day both equal ₹10,22,020 for 20 guests but differ in duration/tier rates", () => {
      const royal5dRate = getHostPayoutPerGuestINR("ROYAL", 5);
      expect(royal5dRate).toBe(51101);
      const royal5dTotal = royal5dRate * 20;
      expect(royal5dTotal).toBe(1022020);
      expect(formatPsychologicalLakh(royal5dTotal)).toBe("₹10.22 Lakh");

      const sigRoyal4dRate = getHostPayoutPerGuestINR("SIGNATURE_ROYAL", 4);
      expect(sigRoyal4dRate).toBe(51101);
      const sigRoyal4dTotal = sigRoyal4dRate * 20;
      expect(sigRoyal4dTotal).toBe(1022020);
      expect(formatPsychologicalLakh(sigRoyal4dTotal)).toBe("₹10.22 Lakh");

      const sigRoyal5dRate = getHostPayoutPerGuestINR("SIGNATURE_ROYAL", 5);
      expect(sigRoyal5dRate).toBe(61101);
      const sigRoyal5dTotal = sigRoyal5dRate * 20;
      expect(sigRoyal5dTotal).toBe(1222020);
      expect(formatPsychologicalLakh(sigRoyal5dTotal)).toBe("₹12.22 Lakh");

      const royal4dRate = getHostPayoutPerGuestINR("ROYAL", 4);
      expect(royal4dRate).toBe(41101);
      const royal4dTotal = royal4dRate * 20;
      expect(royal4dTotal).toBe(822020);
      expect(formatPsychologicalLakh(royal4dTotal)).toBe("₹8.22 Lakh");
    });
  });
});

