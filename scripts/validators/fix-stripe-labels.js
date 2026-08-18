const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixHistoricalStripeLabels() {
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "Payment"
    SET "provider" = 'STRIPE'
    WHERE "stripePaymentIntentId" IS NOT NULL;
  `);
  console.log("Updated historical Stripe payment records to provider='STRIPE':", result);

  const check = await prisma.payment.findMany({
    where: { stripePaymentIntentId: { not: null } },
    select: { id: true, provider: true, stripePaymentIntentId: true }
  });
  console.log("Verification of historical Stripe payment records:", check);

  await prisma.$disconnect();
}

fixHistoricalStripeLabels().catch(console.error);
