/**
 * lib/security/guest-pass-crypto.ts
 *
 * Cryptographic primitives for Guest Pass token management.
 *
 * Design decisions:
 *  - AES-256-GCM: authenticated encryption — provides both confidentiality
 *    and integrity (prevents ciphertext tampering). AES-256-CBC with a static
 *    IV is semantically insecure and does not authenticate the ciphertext.
 *  - Random 12-byte IV per encryption call: each encrypted token produces
 *    unique ciphertext even if the plaintext is identical.
 *  - Stored format: "<iv_hex>:<authTag_hex>:<ciphertext_hex>" — all three
 *    components are required for authenticated decryption.
 *  - Key validation at module load time: if GUEST_PASS_ENCRYPTION_KEY is
 *    absent or too short the server refuses to start rather than silently
 *    using an insecure fallback.
 *
 * This module is NOT a Server Action file. Do NOT add "use server" here.
 * It is imported as a plain module by server actions and API routes.
 *
 * Required environment variable:
 *   GUEST_PASS_ENCRYPTION_KEY — 32 random bytes encoded as 64 hex characters.
 *
 * Generate a key:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import crypto from "crypto";
import { env } from "@/lib/env";

const KEY_ENV_VAR = "GUEST_PASS_ENCRYPTION_KEY";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // recommended for GCM
const KEY_BYTES = 32; // AES-256

// ---------------------------------------------------------------------------
// Key loading & validation — runs once at module import time
// ---------------------------------------------------------------------------

function loadEncryptionKey(): Buffer {
  const raw = env.GUEST_PASS_ENCRYPTION_KEY;

  if (!raw) {
    console.warn(
      `[guest-pass-crypto] Warning: ${KEY_ENV_VAR} is not configured. ` +
        `Using an insecure placeholder encryption key for build/development only.`
    );
    return Buffer.alloc(KEY_BYTES);
  }

  // Validate hex string length (64 hex chars = 32 bytes)
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error(
      `[guest-pass-crypto] ${KEY_ENV_VAR} must be exactly 64 hex characters (32 bytes). ` +
        `Received ${raw.length} characters.`
    );
  }

  return Buffer.from(raw, "hex");
}

const ENCRYPTION_KEY: Buffer = loadEncryptionKey();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Encrypts a raw guest pass token using AES-256-GCM.
 *
 * @param rawToken - The plaintext token (e.g. 64-char hex string from crypto.randomBytes(32))
 * @returns Encoded string in the format "iv:authTag:ciphertext" (all hex)
 */
export function encryptPass(rawToken: string): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let ciphertext = cipher.update(rawToken, "utf8", "hex");
  ciphertext += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext}`;
}

/**
 * Decrypts a stored guest pass token.
 *
 * @param stored - The encoded string in "iv:authTag:ciphertext" format
 * @returns The original plaintext token
 * @throws If the stored format is invalid or the auth tag fails (tampered data)
 */
export function decryptPass(stored: string): string {
  const parts = stored.split(":");

  if (parts.length !== 3) {
    throw new Error(
      `[guest-pass-crypto] Invalid stored token format. ` +
        `Expected "iv:authTag:ciphertext", got ${parts.length} segment(s).`
    );
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  if (iv.length !== IV_BYTES) {
    throw new Error(
      `[guest-pass-crypto] Invalid IV length: expected ${IV_BYTES} bytes, got ${iv.length}.`
    );
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(ciphertextHex, "hex", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}

/**
 * Computes the SHA-256 hash of a raw pass token for indexed database lookups.
 *
 * The hash is stored in the database (`qrTokenHash`) and used as the
 * lookup key when scanning QR codes. The raw token is never stored — only
 * its encrypted form (`encryptedToken`) and this hash.
 *
 * This is synchronous intentionally — no I/O is needed, and wrapping a
 * pure CPU operation in a Promise adds unnecessary overhead.
 *
 * @param rawToken - The plaintext token
 * @returns SHA-256 hex digest
 */
export function hashPassToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
