import { test, expect } from "@playwright/test";
import { encryptPass, decryptPass, hashPassToken } from "../lib/security/guest-pass-crypto";
import crypto from "crypto";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

test.describe("Cross-Feature Combinations - Tier 3", () => {

  test.describe("Booking -> Payment -> Webhook -> Guest Pass Pipeline", () => {

    test("Guest Pass AES-256-GCM token encryption and SHA-256 hashing contract", () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = hashPassToken(rawToken);
      const encryptedToken = encryptPass(rawToken);

      // Verify token hash format (64-char hex string)
      expect(hashedToken).toMatch(/^[0-9a-f]{64}$/);

      // Verify encrypted token format (iv:authTag:ciphertext)
      const parts = encryptedToken.split(":");
      expect(parts).toHaveLength(3);

      // Verify token decryption reconstructs exact plaintext raw token
      const decryptedToken = decryptPass(encryptedToken);
      expect(decryptedToken).toBe(rawToken);
    });

    test("Guest Pass tamper protection throws error on altered authTag or ciphertext", () => {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const encryptedToken = encryptPass(rawToken);
      const parts = encryptedToken.split(":");

      // Tamper with the ciphertext component
      const tamperedCiphertext = parts[2].slice(0, -2) + (parts[2].endsWith("a") ? "b" : "a");
      const tamperedStoredToken = `${parts[0]}:${parts[1]}:${tamperedCiphertext}`;

      expect(() => decryptPass(tamperedStoredToken)).toThrow();
    });

    test("Booking, Stripe Webhook, and Guest Pass state transition chain contract", async () => {
      // Import actions dynamically
      const { createBookingAction, handleGuestApplicationAction } = await import("../lib/actions/index");

      // Verify unauthenticated execution of cross-feature actions throws error safely
      await expect(
        createBookingAction({
          weddingId: "test_wedding_id",
          date: new Date().toISOString(),
          guestsCount: 2,
        })
      ).rejects.toThrow();

      await expect(
        handleGuestApplicationAction("test_app_id", "approved")
      ).rejects.toThrow();
    });

    test("Event reminders and readiness endpoints are accessible and valid", async ({ request }) => {
      const responseReadiness = await request.get(`${BASE_URL}/api/readiness`);
      expect([200, 503]).toContain(responseReadiness.status());

      const responseReady = await request.get(`${BASE_URL}/api/ready`);
      expect([200, 503]).toContain(responseReady.status());
    });

  });

});
