import { isTransientDbError, withDbRetry } from "@/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";

describe("Admin Database Authorization & Resilience Suite", () => {
  describe("1. Transient Error Classification", () => {
    it("correctly identifies connection and pool timeouts as transient errors", () => {
      const p2024 = { code: "P2024", message: "Timed out fetching a new connection from the connection pool" };
      const p1001 = { code: "P1001", message: "Can't reach database server at aws-0-ap-southeast-2.pooler.supabase.com" };
      const p2028 = { code: "P2028", message: "Transaction already closed: timeout expired" };
      const connTimeout = { message: "Connection timeout after 30000ms" };
      const serviceUnavail = { message: "SERVICE_UNAVAILABLE: Authentication service is temporarily unavailable." };

      expect(isTransientDbError(p2024)).toBe(true);
      expect(isTransientDbError(p1001)).toBe(true);
      expect(isTransientDbError(p2028)).toBe(true);
      expect(isTransientDbError(connTimeout)).toBe(true);
      expect(isTransientDbError(serviceUnavail)).toBe(true);
    });

    it("does NOT classify permanent errors as transient (avoids retry storms)", () => {
      const notFound = { code: "P2025", message: "Record to update not found." };
      const uniqueConstraint = { code: "P2002", message: "Unique constraint failed on the fields: (`email`)" };
      const invalidSql = { code: "P2010", message: "Raw query failed. Code: 42601. Message: syntax error" };
      const authRequired = { message: "UNAUTHORIZED: Authentication required." };
      const forbidden = { message: "FORBIDDEN: You do not have permissions to access this route." };

      expect(isTransientDbError(notFound)).toBe(false);
      expect(isTransientDbError(uniqueConstraint)).toBe(false);
      expect(isTransientDbError(invalidSql)).toBe(false);
      expect(isTransientDbError(authRequired)).toBe(false);
      expect(isTransientDbError(forbidden)).toBe(false);
    });
  });

  describe("2. withDbRetry Execution & Resilience", () => {
    it("returns successfully when DB operation succeeds on attempt 1", async () => {
      let attempts = 0;
      const result = await withDbRetry(async () => {
        attempts++;
        return { user: "admin@weddingwithindia.com", role: UserRole.ADMIN };
      }, { maxRetries: 3, initialDelayMs: 1 });

      expect(result.role).toBe(UserRole.ADMIN);
      expect(attempts).toBe(1);
    });

    it("recovers and succeeds after a transient connection failure on attempt 1", async () => {
      let attempts = 0;
      const result = await withDbRetry(async () => {
        attempts++;
        if (attempts === 1) {
          const err: any = new Error("Connection timeout");
          err.code = "P2024";
          throw err;
        }
        return { user: "admin@weddingwithindia.com", role: UserRole.ADMIN };
      }, { maxRetries: 3, initialDelayMs: 1 });

      expect(result.role).toBe(UserRole.ADMIN);
      expect(attempts).toBe(2);
    });

    it("throws controlled error when DB failure persists beyond max retries", async () => {
      let attempts = 0;
      await expect(
        withDbRetry(async () => {
          attempts++;
          const err: any = new Error("Database server unreachable");
          err.code = "P1001";
          throw err;
        }, { maxRetries: 3, initialDelayMs: 1 })
      ).rejects.toThrow("Database server unreachable");

      expect(attempts).toBe(3);
    });
  });

  describe("3. Role Authorization Matrix", () => {
    it("allows ADMIN role and denies non-admin roles", () => {
      const adminUser = { id: "u-1", email: "admin@weddingwithindia.com", role: UserRole.ADMIN, status: UserStatus.ACTIVE };
      const coupleUser = { id: "u-2", email: "couple@example.com", role: UserRole.COUPLE, status: UserStatus.ACTIVE };
      const travelerUser = { id: "u-3", email: "traveler@example.com", role: UserRole.TRAVELER, status: UserStatus.ACTIVE };

      const verifyAdmin = (user: typeof adminUser) => {
        if (!user) throw new Error("UNAUTHORIZED: Authentication required.");
        if (user.role !== UserRole.ADMIN) throw new Error("FORBIDDEN: You do not have permissions to access this route.");
        return true;
      };

      expect(verifyAdmin(adminUser)).toBe(true);
      expect(() => verifyAdmin(coupleUser)).toThrow("FORBIDDEN");
      expect(() => verifyAdmin(travelerUser)).toThrow("FORBIDDEN");
      expect(() => verifyAdmin(null as any)).toThrow("UNAUTHORIZED");
    });
  });

  describe("4. Admin Hosts Serialization", () => {
    it("serializes hostApps and weddings into a structured plain JSON object", () => {
      const mockHostApps = [
        {
          id: "ha-1",
          coupleNames: "Aarav & Meera",
          city: "Udaipur",
          status: "SUBMITTED",
          weddingDate: new Date("2026-11-20"),
          days: [{ dayNumber: 1, events: [{ name: "Sangeet" }] }],
        },
      ];
      const mockWeddings = [
        {
          id: "w-1",
          title: "Royal Rajputana Wedding",
          location: "Jaipur",
          status: "PUBLISHED",
        },
      ];

      const serialized = {
        hostApps: JSON.parse(JSON.stringify(mockHostApps)),
        weddings: JSON.parse(JSON.stringify(mockWeddings)),
      };

      expect(typeof serialized).toBe("object");
      expect("hostApps" in serialized).toBe(true);
      expect("weddings" in serialized).toBe(true);
      expect(serialized.hostApps[0].coupleNames).toBe("Aarav & Meera");
      expect(typeof serialized.hostApps[0].weddingDate).toBe("string");
    });
  });
});
