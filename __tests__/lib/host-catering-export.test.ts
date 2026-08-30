/**
 * __tests__/lib/host-catering-export.test.ts
 *
 * Unit tests for host catering CSV export route:
 * app/api/reports/host/[weddingId]/route.ts
 */

import { GET } from "@/app/api/reports/host/[weddingId]/route";
import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    wedding: {
      findUnique: jest.fn(),
    },
  },
  isDatabaseAvailable: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
}));

const { prisma } = jest.requireMock("@/lib/prisma");
const { requireAuth } = jest.requireMock("@/lib/auth");

describe("Host Catering Export Route GET /api/reports/host/[weddingId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 when wedding is not found", async () => {
    requireAuth.mockResolvedValueOnce({ id: "user_host_1", role: UserRole.COUPLE });
    prisma.wedding.findUnique.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/reports/host/wedding_missing");
    const res = await GET(req, { params: Promise.resolve({ weddingId: "wedding_missing" }) });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Wedding not found");
  });

  it("returns 403 when user does not own wedding and is not admin", async () => {
    requireAuth.mockResolvedValueOnce({ id: "user_other", role: UserRole.COUPLE });
    prisma.wedding.findUnique.mockResolvedValueOnce({
      id: "wedding_1",
      slug: "royal-palace",
      hostCouple: { userId: "user_host_real" },
      bookings: [],
    });

    const req = new NextRequest("http://localhost:3000/api/reports/host/wedding_1");
    const res = await GET(req, { params: Promise.resolve({ weddingId: "wedding_1" }) });

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("Forbidden");
  });

  it("prioritizes travelDetails.dietaryRequirements, includes accompanying guests, and neutralizes formula triggers", async () => {
    requireAuth.mockResolvedValueOnce({ id: "user_host_1", role: UserRole.COUPLE });
    prisma.wedding.findUnique.mockResolvedValueOnce({
      id: "wedding_1",
      slug: "royal-palace",
      hostCouple: { userId: "user_host_1" },
      bookings: [
        {
          id: "b_1",
          traveler: {
            fullName: "=HYPERLINK(\"http://evil.com\")",
            foodPreferences: "Vegetarian", // Should be overridden by travelDetails
          },
          travelDetails: {
            dietaryRequirements: "Strict Veg, Nut Allergies | Notes: Severe peanut allergy",
          },
          guests: [
            { fullName: "+91 John Guest", foodPreference: "Jain" },
            { fullName: "Bob", foodPreference: "Halal" },
          ],
          guestsCount: 3,
          totalAmount: 1500,
          status: "@APPROVED",
          createdAt: new Date("2026-08-15"),
        },
      ],
    });

    const req = new NextRequest("http://localhost:3000/api/reports/host/wedding_1");
    const res = await GET(req, { params: Promise.resolve({ weddingId: "wedding_1" }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toContain('filename="Guest_Register_royal-palace.csv"');

    const csvText = await res.text();

    // 1. Check formula neutralization
    expect(csvText).toContain("\"'=HYPERLINK(\"\"http://evil.com\"\")\"");
    expect(csvText).toContain("\"'@APPROVED\"");

    // 2. Check dietary prioritization (travelDetails should appear, not raw onboarding fallback)
    expect(csvText).toContain("Strict Veg, Nut Allergies | Notes: Severe peanut allergy");

    // 3. Check accompanying guests inclusion
    expect(csvText).toContain("+91 John Guest (Jain); Bob (Halal)");
  });
});
