const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyFounder() {
  try {
    const email = 'founder@weddingwithindia.com';
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`[VERIFY] No user found with email: ${email}`);
      return;
    }

    console.log(`[VERIFY] Founder User Exists: ${user.id}`);
    console.log(`[VERIFY] Clerk User ID: ${user.clerkUserId}`);
    console.log(`[VERIFY] Role: ${user.role}`);
    console.log(`[VERIFY] Status: ${user.status}`);
    
    if (user.role === 'ADMIN') {
      console.log(`[VERIFY] Role is correct. Admin privileges confirmed.`);
    } else {
      console.log(`[VERIFY] Role is NOT ADMIN.`);
    }

    // Verify there is only one user with this email
    const count = await prisma.user.count({ where: { email } });
    console.log(`[VERIFY] Total users with this email: ${count}`);
    
  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFounder();
