/**
 * __tests__/lib/sec-02-csv-injection.test.ts
 *
 * Unit tests for SEC-02: CSV Formula Injection Neutralization
 * Verifies that spreadsheet formula triggers (=, +, -, @, \t, \r) are neutralized with single-quote escaping.
 */

import { adminExportBookingsCSVAction } from "@/lib/actions/admin";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    booking: {
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: "log_1" }),
    },
  },
  isDatabaseAvailable: jest.fn().mockResolvedValue(true),
}));

// Mock Auth
jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn().mockResolvedValue({ id: "admin_1", role: "ADMIN" }),
  requireAuth: jest.fn().mockResolvedValue({ id: "admin_1", role: "ADMIN" }),
}));

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: any) => fn,
}));

const { prisma } = jest.requireMock("@/lib/prisma");

describe("SEC-02: CSV Formula Injection Neutralization", () => {
  const escapeCsv = (value: unknown) => {
    if (value === null || value === undefined) return '""';
    let str = String(value);
    const trimmed = str.trimStart();
    const dangerousChars = ["=", "+", "-", "@", "\t", "\r"];
    if (
      dangerousChars.some((ch) => str.startsWith(ch)) ||
      (trimmed.length > 0 && dangerousChars.some((ch) => trimmed.startsWith(ch)))
    ) {
      str = `'${str}`;
    }
    return `"${str.replace(/"/g, '""')}"`;
  };

  it.each([
    ["=SUM(A1:A10)", "\"'=SUM(A1:A10)\""],
    ["+919876543210", "\"'+919876543210\""],
    ["-10% Discount", "\"'-10% Discount\""],
    ["@mention", "\"'@mention\""],
    ["\t=cmd|' /C calc'!A0", "\"'\t=cmd|' /C calc'!A0\""],
    ["\r=1+1", "\"'\r=1+1\""],
    ["   =HYPERLINK(\"http://evil.com\")", "\"'   =HYPERLINK(\"\"http://evil.com\"\")\""],
    ['Normal Guest "VIP"', '"Normal Guest ""VIP"""'],
    [150, '"150"'],
    [null, '""'],
    [undefined, '""'],
  ])("correctly sanitizes %s -> %s", (input, expected) => {
    expect(escapeCsv(input)).toBe(expected);
  });

  it("neutralizes formula injections when admin exports bookings CSV", async () => {
    prisma.booking.findMany.mockResolvedValueOnce([
      {
        id: "b_1",
        traveler: { fullName: "=cmd|' /C calc'!A0" },
        wedding: { title: "+91 99999 88888 Luxury Wedding" },
        date: new Date("2026-11-20"),
        guestsCount: 2,
        totalAmount: 1200,
        status: "@CONFIRMED",
      },
      {
        id: "b_2",
        traveler: { fullName: "Jane Doe" },
        wedding: { title: "Royal Palace" },
        date: new Date("2026-12-05"),
        guestsCount: 1,
        totalAmount: 600,
        status: "PAID",
      },
    ]);

    const result = await adminExportBookingsCSVAction();
    expect(result.success).toBe(true);
    expect(result.csv).toBeDefined();

    // Verify formula prefixes are prepended with single quotes
    expect(result.csv).toContain("\"'=cmd|' /C calc'!A0\"");
    expect(result.csv).toContain("\"'+91 99999 88888 Luxury Wedding\"");
    expect(result.csv).toContain("\"'@CONFIRMED\"");

    // Safe values are preserved normally
    expect(result.csv).toContain('"Jane Doe"');
    expect(result.csv).toContain('"Royal Palace"');
    expect(result.csv).toContain('"PAID"');
  });
});
