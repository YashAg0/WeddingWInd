import crypto from "crypto";

const E2E_SECRET = process.env.E2E_AUTH_SECRET || "e2e-secret-key-wedding-with-india-dev-test-only";

export function isE2ETestAuthEnabled(): boolean {
  return process.env.NODE_ENV === "test" && process.env.PLAYWRIGHT_TEST === "true";
}

export interface E2ETestSessionPayload {
  userId: string;
  role: string;
  email: string;
  expiresAt: number;
}

export function createE2ETestSessionToken(userId: string, role: string, email: string): string {
  const payload: E2ETestSessionPayload = {
    userId,
    role,
    email,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const jsonStr = JSON.stringify(payload);
  const base64Data = Buffer.from(jsonStr, "utf-8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", E2E_SECRET)
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${signature}`;
}

export function verifyE2ETestSessionToken(token: string): E2ETestSessionPayload | null {
  if (!token || typeof token !== "string") return null;
  let cleanToken = token.trim();
  if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
    cleanToken = cleanToken.slice(1, -1);
  }
  try {
    cleanToken = decodeURIComponent(cleanToken);
  } catch {}
  const parts = cleanToken.split(".");
  if (parts.length !== 2) return null;
  const [base64Data, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", E2E_SECRET)
    .update(base64Data)
    .digest("base64url");

  if (signature !== expectedSignature) return null;

  try {
    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
    const payload: E2ETestSessionPayload = JSON.parse(jsonStr);
    if (!payload.userId || !payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
