const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();
const E2E_SECRET = process.env.E2E_AUTH_SECRET || "e2e-secret-key-wedding-with-india-dev-test-only";

function createE2ETestSessionToken(userId, role, email) {
  const payload = {
    userId,
    role,
    email,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  const jsonStr = JSON.stringify(payload);
  const base64Data = Buffer.from(jsonStr, "utf-8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", E2E_SECRET)
    .update(base64Data)
    .digest("base64url");
  return `${base64Data}.${signature}`;
}

function verifyE2ETestSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [base64Data, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", E2E_SECRET)
    .update(base64Data)
    .digest("base64url");

  if (signature !== expectedSignature) return null;

  try {
    const jsonStr = Buffer.from(base64Data, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr);
    if (!payload.userId || !payload.expiresAt || payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: "admin@weddingwithindia.com" } });
  console.log("Admin user from DB:", admin);
  if (!admin) return;

  const token = createE2ETestSessionToken(admin.id, admin.role, admin.email);
  console.log("Token:", token);
  const verified = verifyE2ETestSessionToken(token);
  console.log("Verified:", verified);

  const weddings = await prisma.wedding.findMany({
    include: {
      hostCouple: { include: { user: true } },
      gallery: true,
      events: true,
      traditions: true,
      _count: {
        select: {
          bookings: {
            where: {
              status: {
                in: ["APPROVED", "PAID", "CONFIRMED", "COMPLETED", "CHECKED_IN", "ATTENDED", "READY_FOR_EVENT"],
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  console.log("Weddings found:", weddings.length);
}

main().finally(() => prisma.$disconnect());
