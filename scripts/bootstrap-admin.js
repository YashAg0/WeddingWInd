const { PrismaClient } = require("@prisma/client");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Error: Please provide the email of the user to bootstrap as ADMIN.");
    console.error("Usage: node scripts/bootstrap-admin.js <email>");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const targetEmail = email.trim().toLowerCase();
    console.log(`Connecting to database to lookup user: ${targetEmail}`);

    const user = await prisma.user.findUnique({
      where: { email: targetEmail }
    });

    if (!user) {
      console.error(`Error: User with email "${targetEmail}" not found in database.`);
      console.error("Please ensure the user has signed up through Clerk and synced their account with the database first.");
      process.exit(1);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "ADMIN",
        status: "ACTIVE" // Admins bypass the onboarding stage and are active immediately
      }
    });

    console.log("--------------------------------------------------");
    console.log(`Success: Admin user successfully bootstrapped!`);
    console.log(`User ID:      ${updated.id}`);
    console.log(`Clerk ID:     ${updated.clerkUserId}`);
    console.log(`Email:        ${updated.email}`);
    console.log(`Name:         ${updated.name || "N/A"}`);
    console.log(`Role:         ${updated.role}`);
    console.log(`Status:       ${updated.status}`);
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("Fatal: Failed to bootstrap admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
