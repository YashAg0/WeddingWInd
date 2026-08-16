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


