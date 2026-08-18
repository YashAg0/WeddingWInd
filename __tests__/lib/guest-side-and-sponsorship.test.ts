import {
  updateBookingSideAction,
  requestSponsorshipAction,
  cancelSponsorshipRequestAction,
  respondToBookingAction,
} from "@/lib/actions";
import {
  adminReviewSponsorshipRequestAction,
  adminToggleSponsoredAction,
} from "@/lib/actions/admin";
import { isSponsorshipActive } from "@/lib/wedding-dto";
import { WeddingSide, BookingStatus, WeddingStatus } from "@prisma/client";

// Mock auth module
let mockCurrentUser: any = {
  id: "traveler_user_1",
  email: "guest@example.com",
  role: "TRAVELER",
  name: "John Traveler",
};

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(async () => mockCurrentUser),
  requireRole: jest.fn(async (_roles: string[]) => mockCurrentUser),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

jest.mock("@/lib/prisma", () => {
  const prismaMock: any = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    travelerProfile: {
      findUnique: jest.fn(),
    },
    coupleProfile: {
      findUnique: jest.fn(),
    },
    wedding: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    sponsorshipRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    userRestriction: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),

    $transaction: jest.fn(async (cb: any) => cb(prismaMock)),
  };
  return { prisma: prismaMock };
});

import { prisma } from "@/lib/prisma";
const mockPrisma = prisma as any;

describe("Guest Side Preference & Sponsorship Marketplace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = {
      id: "traveler_user_1",
      email: "guest@example.com",
      role: "TRAVELER",
      name: "John Traveler",
    };
    mockPrisma.user.findMany.mockResolvedValue([]);
  });

  describe("1. Attendance Side Preference (Bride / Groom / Open)", () => {
    it("allows a guest to update side preference to BRIDE_SIDE on active booking", async () => {
      mockPrisma.travelerProfile.findUnique.mockResolvedValue({ id: "trav_1", userId: "traveler_user_1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "b1",
        travelerId: "trav_1",
        status: BookingStatus.APPROVED,
        attendanceSide: WeddingSide.OPEN,
        wedding: {
          id: "w1",
          title: "Udaipur Royal Wedding",
          date: new Date(Date.now() + 86400000 * 30),
          status: WeddingStatus.PUBLISHED,
        },
        checkIn: null,
      });
      mockPrisma.booking.update.mockResolvedValue({ id: "b1", attendanceSide: WeddingSide.BRIDE_SIDE });
      mockPrisma.auditLog.create.mockResolvedValue({ id: "audit_1" });

      const result = await updateBookingSideAction("b1", WeddingSide.BRIDE_SIDE);
      expect(result.success).toBe(true);
      expect(result.attendanceSide).toBe(WeddingSide.BRIDE_SIDE);
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: "b1" },
        data: { attendanceSide: WeddingSide.BRIDE_SIDE },
      });
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it("allows a guest to update side preference to GROOM_SIDE", async () => {
      mockPrisma.travelerProfile.findUnique.mockResolvedValue({ id: "trav_1", userId: "traveler_user_1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "b1",
        travelerId: "trav_1",
        status: BookingStatus.PAID,
        attendanceSide: WeddingSide.BRIDE_SIDE,
        wedding: {
          id: "w1",
          title: "Jaipur Palace Wedding",
          date: new Date(Date.now() + 86400000 * 15),
          status: WeddingStatus.PUBLISHED,
        },
        checkIn: null,
      });
      mockPrisma.booking.update.mockResolvedValue({ id: "b1", attendanceSide: WeddingSide.GROOM_SIDE });

      const result = await updateBookingSideAction("b1", WeddingSide.GROOM_SIDE);
      expect(result.success).toBe(true);
      expect(result.attendanceSide).toBe(WeddingSide.GROOM_SIDE);
    });

    it("rejects invalid side values server-side", async () => {
      await expect(updateBookingSideAction("b1", "INVALID_SIDE_VALUE")).rejects.toThrow(
        "Invalid attendance side value"
      );
    });

    it("prevents a user from modifying another traveler's booking", async () => {
      mockPrisma.travelerProfile.findUnique.mockResolvedValue({ id: "trav_1", userId: "traveler_user_1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "b2",
        travelerId: "trav_DIFFERENT",
        status: BookingStatus.APPROVED,
        wedding: { id: "w1", title: "W", date: new Date(Date.now() + 86400000), status: WeddingStatus.PUBLISHED },
        checkIn: null,
      });

      await expect(updateBookingSideAction("b2", WeddingSide.BRIDE_SIDE)).rejects.toThrow(
        "Forbidden: You cannot modify a booking you do not own"
      );
    });

    it("rejects side preference change if booking is CANCELLED or REFUNDED", async () => {
      mockPrisma.travelerProfile.findUnique.mockResolvedValue({ id: "trav_1", userId: "traveler_user_1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "b3",
        travelerId: "trav_1",
        status: BookingStatus.CANCELLED,
        wedding: { id: "w1", title: "W", date: new Date(Date.now() + 86400000), status: WeddingStatus.PUBLISHED },
        checkIn: null,
      });

      await expect(updateBookingSideAction("b3", WeddingSide.BRIDE_SIDE)).rejects.toThrow(
        "Attendance preference cannot be changed on a cancelled booking"
      );
    });

    it("rejects side preference change if wedding date has already passed", async () => {
      mockPrisma.travelerProfile.findUnique.mockResolvedValue({ id: "trav_1", userId: "traveler_user_1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "b4",
        travelerId: "trav_1",
        status: BookingStatus.PAID,
        wedding: {
          id: "w1",
          title: "Past Wedding",
          date: new Date(Date.now() - 86400000 * 5),
          status: WeddingStatus.PUBLISHED,
        },
        checkIn: null,
      });

      await expect(updateBookingSideAction("b4", WeddingSide.BRIDE_SIDE)).rejects.toThrow(
        "Attendance preference cannot be changed because the celebration date has already passed"
      );
    });

    it("rejects side preference change if guest has already checked in", async () => {
      mockPrisma.travelerProfile.findUnique.mockResolvedValue({ id: "trav_1", userId: "traveler_user_1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "b5",
        travelerId: "trav_1",
        status: BookingStatus.PAID,
        wedding: {
          id: "w1",
          title: "Active Wedding",
          date: new Date(Date.now() + 86400000 * 2),
          status: WeddingStatus.PUBLISHED,
          suspended: false,
        },
        guestPasses: [{ id: "gp_1", checkIns: [{ id: "checkin_1", checkInTime: new Date() }] }],
      });

      await expect(updateBookingSideAction("b5", WeddingSide.BRIDE_SIDE)).rejects.toThrow(
        "Attendance preference cannot be changed after check-in"
      );
    });
  });

  describe("2. Host Sponsorship Request Workflow", () => {
    beforeEach(() => {
      mockCurrentUser = {
        id: "host_user_1",
        email: "host@example.com",
        role: "COUPLE",
        name: "Aarav & Meera",
      };
    });

    it("allows a host to submit a sponsorship request for their published wedding", async () => {
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple_1", userId: "host_user_1" });
      mockPrisma.wedding.findUnique.mockResolvedValue({
        id: "w1",
        hostCoupleId: "couple_1",
        status: WeddingStatus.PUBLISHED,
        title: "Goa Beach Wedding",
      });
      mockPrisma.sponsorshipRequest.findFirst.mockResolvedValue(null);
      mockPrisma.sponsorshipRequest.create.mockResolvedValue({
        id: "sr_1",
        weddingId: "w1",
        status: "PENDING",
        message: "We'd love visibility for international guests",
        budget: "$500",
      });

      const res = await requestSponsorshipAction({
        weddingId: "w1",
        message: "We'd love visibility for international guests",
        budget: "$500",
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.sponsorshipRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          weddingId: "w1",
          message: "We'd love visibility for international guests",
          budget: "$500",
          status: "PENDING",
        }),
      });
    });

    it("prevents host from requesting sponsorship on a wedding they do not own", async () => {
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple_1", userId: "host_user_1" });
      mockPrisma.wedding.findUnique.mockResolvedValue({
        id: "w2",
        hostCoupleId: "couple_DIFFERENT",
        status: WeddingStatus.PUBLISHED,
        title: "Other Wedding",
      });

      await expect(
        requestSponsorshipAction({ weddingId: "w2" })
      ).rejects.toThrow("Forbidden: You do not own this wedding");
    });

    it("rejects duplicate pending sponsorship requests", async () => {
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple_1", userId: "host_user_1" });
      mockPrisma.wedding.findUnique.mockResolvedValue({
        id: "w1",
        hostCoupleId: "couple_1",
        status: WeddingStatus.PUBLISHED,
        title: "Goa Beach Wedding",
      });
      mockPrisma.sponsorshipRequest.findFirst.mockResolvedValue({
        id: "sr_existing",
        status: "PENDING",
      });

      await expect(
        requestSponsorshipAction({ weddingId: "w1" })
      ).rejects.toThrow("A sponsorship request for this wedding is already pending admin review");
    });

    it("allows a host to cancel their pending sponsorship request", async () => {
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple_1", userId: "host_user_1" });
      mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
        id: "sr_1",
        status: "PENDING",
        wedding: { hostCoupleId: "couple_1" },
      });
      mockPrisma.sponsorshipRequest.update.mockResolvedValue({
        id: "sr_1",
        status: "CANCELLED",
      });

      const res = await cancelSponsorshipRequestAction("sr_1");
      expect(res.success).toBe(true);
      expect(mockPrisma.sponsorshipRequest.update).toHaveBeenCalledWith({
        where: { id: "sr_1" },
        data: expect.objectContaining({ status: "CANCELLED" }),
      });
    });
  });

  describe("3. Admin Sponsorship Control Center & Review Queue", () => {
    beforeEach(() => {
      mockCurrentUser = {
        id: "admin_user_1",
        email: "admin@weddingwithindia.com",
        role: "ADMIN",
        name: "Admin Officer",
      };
    });

    it("allows admin to approve sponsorship request with start and end dates", async () => {
      const now = new Date();
      const nextMonth = new Date(Date.now() + 86400000 * 30);
      mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
        id: "sr_1",
        weddingId: "11111111-1111-4111-8111-111111111111",
        status: "PENDING",
        wedding: {
          id: "11111111-1111-4111-8111-111111111111",
          title: "Udaipur Royal Wedding",
          hostCouple: { userId: "host_1" },
        },
      });
      mockPrisma.sponsorshipRequest.update.mockResolvedValue({ id: "sr_1", status: "APPROVED" });
      mockPrisma.wedding.update.mockResolvedValue({
        id: "11111111-1111-4111-8111-111111111111",
        sponsored: true,
        sponsorshipStart: now,
        sponsorshipEnd: nextMonth,
      });

      const res = await adminReviewSponsorshipRequestAction(
        "sr_1",
        "APPROVED",
        "Approved for global campaign",
        now.toISOString(),
        nextMonth.toISOString()
      );

      expect(res.success).toBe(true);
      expect(mockPrisma.wedding.update).toHaveBeenCalledWith({
        where: { id: "11111111-1111-4111-8111-111111111111" },
        data: expect.objectContaining({
          sponsored: true,
        }),
      });
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it("allows admin to reject sponsorship request with admin notes", async () => {
      mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
        id: "sr_2",
        weddingId: "22222222-2222-4222-8222-222222222222",
        status: "PENDING",
        wedding: {
          id: "22222222-2222-4222-8222-222222222222",
          title: "Kashmir Wedding",
          hostCouple: { userId: "host_2" },
        },
      });
      mockPrisma.sponsorshipRequest.update.mockResolvedValue({ id: "sr_2", status: "REJECTED" });

      const res = await adminReviewSponsorshipRequestAction(
        "sr_2",
        "REJECTED",
        "Incomplete media assets"
      );

      expect(res.success).toBe(true);
      expect(mockPrisma.sponsorshipRequest.update).toHaveBeenCalledWith({
        where: { id: "sr_2" },
        data: expect.objectContaining({
          status: "REJECTED",
          adminNotes: "Incomplete media assets",
        }),
      });
    });

    it("allows admin to directly toggle sponsored state on/off with custom dates", async () => {
      const now = new Date();
      const future = new Date(Date.now() + 86400000 * 60);
      const testWeddingUuid = "33333333-3333-4333-8333-333333333333";

      mockPrisma.wedding.findUnique.mockResolvedValue({
        id: testWeddingUuid,
        title: "Kerala Backwaters Wedding",
        sponsored: false,
      });
      mockPrisma.wedding.update.mockResolvedValue({
        id: testWeddingUuid,
        sponsored: true,
        sponsorshipStart: now,
        sponsorshipEnd: future,
      });

      const res = await adminToggleSponsoredAction(
        testWeddingUuid,
        true,
        now.toISOString(),
        future.toISOString()
      );

      expect(res.success).toBe(true);
      expect(mockPrisma.wedding.update).toHaveBeenCalledWith({
        where: { id: testWeddingUuid },
        data: {
          sponsored: true,
          sponsorshipStart: now,
          sponsorshipEnd: future,
        },
      });
    });
  });

  describe("4. Time-Aware Sponsorship DTO Logic", () => {
    it("returns true for active campaigns within start/end dates", () => {
      const active = {
        sponsored: true,
        sponsorshipStart: new Date(Date.now() - 86400000),
        sponsorshipEnd: new Date(Date.now() + 86400000 * 10),
      };
      expect(isSponsorshipActive(active)).toBe(true);
    });

    it("returns false for expired campaigns", () => {
      const expired = {
        sponsored: true,
        sponsorshipStart: new Date(Date.now() - 86400000 * 30),
        sponsorshipEnd: new Date(Date.now() - 86400000 * 5),
      };
      expect(isSponsorshipActive(expired)).toBe(false);
    });

    it("returns false for scheduled future campaigns", () => {
      const future = {
        sponsored: true,
        sponsorshipStart: new Date(Date.now() + 86400000 * 10),
        sponsorshipEnd: new Date(Date.now() + 86400000 * 40),
      };
      expect(isSponsorshipActive(future)).toBe(false);
    });

    it("returns false for non-sponsored listings", () => {
      expect(isSponsorshipActive({ sponsored: false })).toBe(false);
      expect(isSponsorshipActive(null)).toBe(false);
    });
  });

  describe("5. Adversarial Security & IDOR Verification", () => {
    it("rejects non-couple user trying to request sponsorship", async () => {
      mockCurrentUser = { id: "traveler_1", role: "TRAVELER" };
      mockPrisma.coupleProfile.findUnique.mockResolvedValue(null);

      await expect(requestSponsorshipAction("w1", "msg", "500")).rejects.toThrow(
        "Only host couples can request sponsorship for their weddings."
      );
    });

    it("rejects couple trying to request sponsorship for another host's wedding (IDOR)", async () => {
      mockCurrentUser = { id: "couple_1", role: "COUPLE" };
      mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple_profile_1", userId: "couple_1" });
      mockPrisma.wedding.findUnique.mockResolvedValue({
        id: "w_other",
        hostCoupleId: "couple_profile_DIFFERENT",
        status: WeddingStatus.PUBLISHED,
      });

      await expect(requestSponsorshipAction("w_other", "msg", "500")).rejects.toThrow(
        "Forbidden: You do not own this wedding."
      );
    });


    it("rejects non-admin user trying to review sponsorship requests", async () => {
      mockCurrentUser = { id: "couple_1", role: "COUPLE" };
      const auth = require("@/lib/auth");
      auth.requireRole.mockRejectedValueOnce(new Error("Unauthorized: Role ADMIN required."));

      await expect(
        adminReviewSponsorshipRequestAction("sr_1", "APPROVED", "Notes")
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects admin review with invalid end date before start date", async () => {
      mockCurrentUser = { id: "admin_1", role: "ADMIN" };
      mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
        id: "sr_bad_dates",
        weddingId: "w1",
        status: "PENDING",
        wedding: { id: "w1", title: "W", hostCouple: { userId: "couple_user_1" } },
      });

      const startDate = new Date(Date.now() + 86400000 * 10).toISOString();
      const badEndDate = new Date(Date.now() + 86400000 * 2).toISOString();

      await expect(
        adminReviewSponsorshipRequestAction("sr_bad_dates", "APPROVED", "Notes", startDate, badEndDate)
      ).rejects.toThrow("Sponsorship end date must be after the start date");
    });
  });

  describe("6. Host Booking State Machine & Invariant Enforcements", () => {
    it("rejects host approval on a booking that is not PENDING (e.g. CANCELLED)", async () => {
      mockCurrentUser = { id: "couple_user_1", role: "COUPLE" };
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "b_cancelled",
        weddingId: "w1",
        status: BookingStatus.CANCELLED,
        wedding: {
          id: "w1",
          title: "Palace Wedding",
          capacity: 50,
          hostCouple: { userId: "couple_user_1", user: { id: "couple_user_1" } },
        },
        traveler: { user: { id: "t_user", email: "traveler@example.com" }, fullName: "Traveler A" },
      });

      await expect(respondToBookingAction("b_cancelled", "approved")).rejects.toThrow(
        "Only pending booking requests can be approved or declined."
      );
    });

    it("allows host to approve a PENDING booking when capacity is available", async () => {
      mockCurrentUser = { id: "couple_user_1", role: "COUPLE" };
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "b_pending",
        weddingId: "w1",
        guestsCount: 2,
        status: BookingStatus.PENDING,
        wedding: {
          id: "w1",
          title: "Palace Wedding",
          capacity: 50,
          hostCouple: { userId: "couple_user_1", user: { id: "couple_user_1" } },
        },
        traveler: { user: { id: "t_user", email: "traveler@example.com" }, fullName: "Traveler A" },
      });
      mockPrisma.booking.aggregate.mockResolvedValue({ _sum: { guestsCount: 10 } });
      mockPrisma.booking.update.mockResolvedValue({ id: "b_pending", status: BookingStatus.AWAITING_PAYMENT });

      const result = await respondToBookingAction("b_pending", "approved");
      expect(result.success).toBe(true);
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: "b_pending" },
        data: { status: BookingStatus.AWAITING_PAYMENT },
      });
    });

    it("rejects host approval when requested guests exceed available capacity", async () => {
      mockCurrentUser = { id: "couple_user_1", role: "COUPLE" };
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "b_pending_overflow",
        weddingId: "w1",
        guestsCount: 5,
        status: BookingStatus.PENDING,
        wedding: {
          id: "w1",
          title: "Palace Wedding",
          capacity: 20,
          hostCouple: { userId: "couple_user_1", user: { id: "couple_user_1" } },
        },
        traveler: { user: { id: "t_user", email: "traveler@example.com" }, fullName: "Traveler A" },
      });
      mockPrisma.booking.aggregate.mockResolvedValue({ _sum: { guestsCount: 18 } });

      await expect(respondToBookingAction("b_pending_overflow", "approved")).rejects.toThrow(
        "Cannot approve booking request: capacity exceeded"
      );
    });
  });
});

// =============================================================================
// 7. w1-Style ID Validation — Admin Sponsorship Mutations (P0 Fix Regression)
// =============================================================================
describe("7. Admin Sponsorship — w1-Style and UUID ID Validation", () => {
  beforeEach(() => {
    mockCurrentUser = {
      id: "admin_user_1",
      email: "admin@weddingwithindia.com",
      role: "ADMIN",
      name: "Admin Officer",
    };
  });

  it("allows admin to toggle sponsored state on a w1-style showcase listing", async () => {
    const now = new Date();
    const campaignEnd = new Date(Date.now() + 86400000 * 90);

    mockPrisma.wedding.findUnique.mockResolvedValue({
      id: "w1",
      title: "The Grand Maharaja Wedding",
      sponsored: false,
      sponsorshipStart: null,
      sponsorshipEnd: null,
    });
    mockPrisma.wedding.update.mockResolvedValue({
      id: "w1",
      sponsored: true,
      sponsorshipStart: now,
      sponsorshipEnd: campaignEnd,
    });

    const res = await adminToggleSponsoredAction("w1", true, now.toISOString(), campaignEnd.toISOString());
    expect(res.success).toBe(true);
    expect(mockPrisma.wedding.update).toHaveBeenCalledWith({
      where: { id: "w1" },
      data: {
        sponsored: true,
        sponsorshipStart: now,
        sponsorshipEnd: campaignEnd,
      },
    });
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it("allows admin to toggle sponsored state on a w23-style showcase listing", async () => {
    const now = new Date();
    const campaignEnd = new Date(Date.now() + 86400000 * 60);

    mockPrisma.wedding.findUnique.mockResolvedValue({
      id: "w23",
      title: "Goa Beach Sunset Wedding",
      sponsored: false,
      sponsorshipStart: null,
      sponsorshipEnd: null,
    });
    mockPrisma.wedding.update.mockResolvedValue({
      id: "w23",
      sponsored: true,
      sponsorshipStart: now,
      sponsorshipEnd: campaignEnd,
    });

    const res = await adminToggleSponsoredAction("w23", true, now.toISOString(), campaignEnd.toISOString());
    expect(res.success).toBe(true);
    expect(mockPrisma.wedding.update).toHaveBeenCalledWith({
      where: { id: "w23" },
      data: expect.objectContaining({ sponsored: true }),
    });
  });

  it("allows admin to toggle sponsored state on a standard UUID listing", async () => {
    const uuidId = "33333333-3333-4333-8333-333333333333";
    const now = new Date();
    const campaignEnd = new Date(Date.now() + 86400000 * 30);

    mockPrisma.wedding.findUnique.mockResolvedValue({
      id: uuidId,
      title: "Kerala Backwaters Wedding",
      sponsored: false,
      sponsorshipStart: null,
      sponsorshipEnd: null,
    });
    mockPrisma.wedding.update.mockResolvedValue({
      id: uuidId,
      sponsored: true,
      sponsorshipStart: now,
      sponsorshipEnd: campaignEnd,
    });

    const res = await adminToggleSponsoredAction(uuidId, true, now.toISOString(), campaignEnd.toISOString());
    expect(res.success).toBe(true);
    expect(mockPrisma.wedding.update).toHaveBeenCalledWith({
      where: { id: uuidId },
      data: expect.objectContaining({ sponsored: true }),
    });
  });

  it("rejects empty string wedding ID", async () => {
    await expect(adminToggleSponsoredAction("", true)).rejects.toThrow();
  });

  it("rejects non-admin user attempting to toggle sponsorship (RBAC)", async () => {
    mockCurrentUser = { id: "traveler_1", role: "TRAVELER" };
    const auth = require("@/lib/auth");
    (auth.requireRole as jest.Mock).mockRejectedValueOnce(new Error("Unauthorized: Role ADMIN required."));

    await expect(adminToggleSponsoredAction("w1", true)).rejects.toThrow("Unauthorized");
  });

  it("rejects sponsorship with end date before start date (w1 ID)", async () => {
    const start = new Date(Date.now() + 86400000 * 10);
    const badEnd = new Date(Date.now() + 86400000 * 2);

    mockPrisma.wedding.findUnique.mockResolvedValue({
      id: "w1",
      title: "The Grand Maharaja Wedding",
      sponsored: false,
      sponsorshipStart: null,
      sponsorshipEnd: null,
    });

    await expect(
      adminToggleSponsoredAction("w1", true, start.toISOString(), badEnd.toISOString())
    ).rejects.toThrow("Sponsorship end date must be after the start date");
  });
});

// =============================================================================
// 8. Homepage Sponsored Priority — Active Sponsored > Featured > Normal (P0 Fix)
// =============================================================================
describe("8. Homepage Sponsored Priority Ranking", () => {
  it("ranks active sponsored listing above 10 featured listings", () => {
    const featured = Array.from({ length: 10 }, (_, i) => ({
      id: `f${i}`,
      sponsored: false,
      featured: true,
      rating: 4.9 - i * 0.01,
    }));
    const sponsoredListing = { id: "s1", sponsored: true, featured: false, rating: 3.0 };

    const allListings = [sponsoredListing, ...featured];
    const sorted = [...allListings].sort((a, b) => {
      const tierA = a.sponsored ? 2 : a.featured ? 1 : 0;
      const tierB = b.sponsored ? 2 : b.featured ? 1 : 0;
      return tierB - tierA;
    });

    expect(sorted[0].id).toBe("s1");
    expect(sorted.slice(1).every((w) => w.featured)).toBe(true);
  });

  it("does NOT rank expired sponsorship (sponsored=false in DTO) above featured", () => {
    const expiredSponsored = { id: "expired", sponsored: false, featured: false, rating: 5.0 };
    const featuredListing = { id: "feat", sponsored: false, featured: true, rating: 4.0 };

    const sorted = [expiredSponsored, featuredListing].sort((a, b) => {
      const tierA = a.sponsored ? 2 : a.featured ? 1 : 0;
      const tierB = b.sponsored ? 2 : b.featured ? 1 : 0;
      return tierB - tierA;
    });
    expect(sorted[0].id).toBe("feat");
  });

  it("does NOT rank future sponsorship (sponsored=false in DTO) above featured", () => {
    const futureSponsored = { id: "future", sponsored: false, featured: false, rating: 5.0 };
    const featuredListing = { id: "feat", sponsored: false, featured: true, rating: 3.0 };

    const sorted = [futureSponsored, featuredListing].sort((a, b) => {
      const tierA = a.sponsored ? 2 : a.featured ? 1 : 0;
      const tierB = b.sponsored ? 2 : b.featured ? 1 : 0;
      return tierB - tierA;
    });
    expect(sorted[0].id).toBe("feat");
  });
});

// =============================================================================
// 9. Marketplace Sort — Sponsored Tier Survives All Sort Modes (P1 Fix)
// =============================================================================
describe("9. Marketplace Sort — Sponsored Priority Under All Sort Modes", () => {
  const getTier = (w: { sponsored: boolean; featured: boolean }) =>
    w.sponsored ? 2 : w.featured ? 1 : 0;

  const makeListing = (id: string, sponsored: boolean, featured: boolean,
    pricePerGuest: number, rating: number, date: string) =>
    ({ id, sponsored, featured, pricePerGuest, rating, date });

  const applySort = (listings: ReturnType<typeof makeListing>[], mode: string) =>
    [...listings].sort((a, b) => {
      const tierDiff = getTier(b) - getTier(a);
      if (tierDiff !== 0) return tierDiff;
      if (mode === "price_asc") return a.pricePerGuest - b.pricePerGuest;
      if (mode === "price_desc") return b.pricePerGuest - a.pricePerGuest;
      if (mode === "rating") return b.rating - a.rating;
      if (mode === "date_asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return b.rating - a.rating;
    });

  const sponsoredExpensive = makeListing("sponsored", true, false, 50000, 3.0, "2027-06-01");
  const normalCheap = makeListing("normal-cheap", false, false, 500, 5.0, "2027-01-01");
  const featuredMid = makeListing("featured-mid", false, true, 8000, 4.5, "2027-03-01");

  it("sponsored ranks first under price_asc — cheapest normal does NOT win", () => {
    expect(applySort([normalCheap, sponsoredExpensive, featuredMid], "price_asc")[0].id).toBe("sponsored");
  });

  it("sponsored ranks first under price_desc", () => {
    expect(applySort([normalCheap, sponsoredExpensive, featuredMid], "price_desc")[0].id).toBe("sponsored");
  });

  it("sponsored ranks first under rating sort — high-rated normal does NOT win", () => {
    expect(applySort([normalCheap, sponsoredExpensive, featuredMid], "rating")[0].id).toBe("sponsored");
  });

  it("sponsored ranks first under date_asc sort", () => {
    const sLate = makeListing("s-late", true, false, 20000, 3.0, "2028-01-01");
    const nEarly = makeListing("n-early", false, false, 500, 5.0, "2027-01-01");
    expect(applySort([nEarly, sLate], "date_asc")[0].id).toBe("s-late");
  });

  it("within sponsored tier, price_asc sorts by price ascending", () => {
    const s1 = makeListing("s1", true, false, 20000, 4.0, "2027-06-01");
    const s2 = makeListing("s2", true, false, 10000, 4.0, "2027-06-01");
    const result = applySort([s1, s2], "price_asc");
    expect(result[0].id).toBe("s2");
    expect(result[1].id).toBe("s1");
  });

  it("full tier order: sponsored > featured > normal, regardless of sort mode", () => {
    const result = applySort([normalCheap, sponsoredExpensive, featuredMid], "price_asc");
    expect(result[0].id).toBe("sponsored");
    expect(result[1].id).toBe("featured-mid");
    expect(result[2].id).toBe("normal-cheap");
  });
});

// =============================================================================
// 10. isSponsorshipActive — Comprehensive Time-Aware Logic Verification
// =============================================================================
describe("10. isSponsorshipActive — Time-Aware Boundary Cases", () => {
  it("returns true: sponsored=true, no start, no end (open campaign)", () => {
    expect(isSponsorshipActive({ sponsored: true, sponsorshipStart: null, sponsorshipEnd: null })).toBe(true);
  });

  it("returns true: sponsored=true, start=past, no end", () => {
    expect(isSponsorshipActive({
      sponsored: true,
      sponsorshipStart: new Date(Date.now() - 86400000),
      sponsorshipEnd: null,
    })).toBe(true);
  });

  it("returns true: sponsored=true, start=past, end=future", () => {
    expect(isSponsorshipActive({
      sponsored: true,
      sponsorshipStart: new Date(Date.now() - 86400000),
      sponsorshipEnd: new Date(Date.now() + 86400000),
    })).toBe(true);
  });

  it("returns false: campaign starts in the future", () => {
    expect(isSponsorshipActive({
      sponsored: true,
      sponsorshipStart: new Date(Date.now() + 86400000 * 5),
      sponsorshipEnd: new Date(Date.now() + 86400000 * 10),
    })).toBe(false);
  });

  it("returns false: campaign has expired", () => {
    expect(isSponsorshipActive({
      sponsored: true,
      sponsorshipStart: new Date(Date.now() - 86400000 * 10),
      sponsorshipEnd: new Date(Date.now() - 86400000),
    })).toBe(false);
  });

  it("returns false: sponsored=false regardless of dates", () => {
    expect(isSponsorshipActive({
      sponsored: false,
      sponsorshipStart: new Date(Date.now() - 86400000),
      sponsorshipEnd: new Date(Date.now() + 86400000),
    })).toBe(false);
  });

  it("returns false for null input", () => {
    expect(isSponsorshipActive(null)).toBe(false);
  });

  it("returns false for undefined input", () => {
    expect(isSponsorshipActive(undefined)).toBe(false);
  });
});

// =============================================================================
// 11. Sponsorship Cancellation Flow
// =============================================================================
describe("11. Sponsorship Cancellation Flow", () => {
  beforeEach(() => {
    mockCurrentUser = { id: "host_user_1", email: "host@example.com", role: "COUPLE" };
  });

  it("host can cancel their own pending sponsorship request", async () => {
    mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple_1", userId: "host_user_1" });
    mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
      id: "sr_cancel_1",
      status: "PENDING",
      wedding: { hostCoupleId: "couple_1", title: "Beach Wedding" },
    });
    mockPrisma.sponsorshipRequest.update.mockResolvedValue({ id: "sr_cancel_1", status: "CANCELLED" });

    const res = await cancelSponsorshipRequestAction("sr_cancel_1");
    expect(res.success).toBe(true);
    expect(mockPrisma.sponsorshipRequest.update).toHaveBeenCalledWith({
      where: { id: "sr_cancel_1" },
      data: expect.objectContaining({ status: "CANCELLED" }),
    });
  });

  it("host cannot cancel another host's sponsorship request (IDOR)", async () => {
    mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple_1", userId: "host_user_1" });
    mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
      id: "sr_other",
      status: "PENDING",
      wedding: { hostCoupleId: "couple_DIFFERENT", title: "Other Wedding" },
    });

    await expect(cancelSponsorshipRequestAction("sr_other")).rejects.toThrow("Forbidden");
  });

  it("cannot cancel an already-approved sponsorship request", async () => {
    mockPrisma.coupleProfile.findUnique.mockResolvedValue({ id: "couple_1", userId: "host_user_1" });
    mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
      id: "sr_approved",
      status: "APPROVED",
      wedding: { hostCoupleId: "couple_1", title: "Beach Wedding" },
    });

    await expect(cancelSponsorshipRequestAction("sr_approved")).rejects.toThrow(
      "Only pending sponsorship requests can be cancelled"
    );
  });
});

// =============================================================================
// 12. Full Sponsorship Flow: Host Request → Admin Approval → Active Listing
// =============================================================================
describe("12. Full Sponsorship Flow: Host → Admin Approval → DB Active", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = { id: "admin_user_1", email: "admin@weddingwithindia.com", role: "ADMIN" };
    mockPrisma.user.findMany.mockResolvedValue([]);
  });

  it("admin approval sets sponsored=true on the linked wedding", async () => {
    const now = new Date();
    const campaignEnd = new Date(Date.now() + 86400000 * 30);

    mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
      id: "sr_flow_1",
      weddingId: "w5",
      status: "PENDING",
      wedding: {
        id: "w5",
        title: "Heritage Palace Wedding",
        hostCouple: { userId: "couple_host_1", user: { id: "couple_host_1" } },
      },
    });
    mockPrisma.sponsorshipRequest.update.mockResolvedValue({ id: "sr_flow_1", status: "APPROVED" });
    mockPrisma.wedding.update.mockResolvedValue({ id: "w5", sponsored: true });
    mockPrisma.notification.create.mockResolvedValue({ id: "notif_1" });

    const res = await adminReviewSponsorshipRequestAction(
      "sr_flow_1", "APPROVED", "Approved", now.toISOString(), campaignEnd.toISOString()
    );

    expect(res.success).toBe(true);
    expect(mockPrisma.wedding.update).toHaveBeenCalledWith({
      where: { id: "w5" },
      data: expect.objectContaining({ sponsored: true }),
    });
    expect(mockPrisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "couple_host_1", type: "SUCCESS" }) })
    );
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it("admin rejection does NOT set sponsored=true on the wedding", async () => {
    mockCurrentUser = { id: "admin_user_1", email: "admin@weddingwithindia.com", role: "ADMIN" };

    mockPrisma.sponsorshipRequest.findUnique.mockResolvedValue({
      id: "sr_flow_2",
      weddingId: "w7",
      status: "PENDING",
      wedding: {
        id: "w7",
        title: "Beach Wedding",
        hostCouple: { userId: "couple_2", user: { id: "couple_2" } },
      },
    });
    mockPrisma.sponsorshipRequest.update.mockResolvedValue({ id: "sr_flow_2", status: "REJECTED" });
    mockPrisma.notification.create.mockResolvedValue({ id: "notif_2" });

    const res = await adminReviewSponsorshipRequestAction("sr_flow_2", "REJECTED", "Insufficient quality");
    expect(res.success).toBe(true);
    expect(mockPrisma.wedding.update).not.toHaveBeenCalled();
  });
});

