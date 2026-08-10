import { prisma } from '../lib/prisma';

async function testSync() {
  const email = "founder@weddingwithindia.com";
  const name = "Admin User";
  const avatar = null;
  const clerkUserId = "user_2lV83Lp7F8tYFzI5XQ9W6Kk3aBz"; // A mock Clerk ID

  try {
    const dbUser = await prisma.$transaction(async (tx) => {
      const existingByEmail = await tx.user.findUnique({ where: { email } });
      console.log("existingByEmail:", existingByEmail);
      
      let upsertedUser;
      if (existingByEmail && existingByEmail.clerkUserId.startsWith("pending_admin")) {
        console.log("Linking pending admin...");
        upsertedUser = await tx.user.update({
          where: { id: existingByEmail.id },
          data: {
            clerkUserId,
            name,
            avatar
          }
        });
      } else {
        console.log("Normal upsert...");
        upsertedUser = await tx.user.upsert({
          where: { clerkUserId },
          create: { clerkUserId, email, name, avatar },
          update: { email, name, avatar }
        });
      }

      console.log("upsertedUser:", upsertedUser);

      console.log("Upserting traveler profile...");
      await tx.travelerProfile.upsert({
        where: { userId: upsertedUser.id },
        create: {
          userId: upsertedUser.id,
          fullName: name,
          country: "United States",
          language: "English"
        },
        update: {}
      });

      console.log("Returning upsertedUser...");
      return upsertedUser;
    });

    console.log("Success:", dbUser);
  } catch (err: any) {
    console.error("Database error:", err.name, err.code, err.message);
  }
}

testSync().then(() => console.log("Done")).catch(console.error);
