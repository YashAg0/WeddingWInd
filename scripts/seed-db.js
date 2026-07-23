const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("--------------------------------------------------");
  console.log("WeddingWithIndia — Standalone Database Seeder");
  console.log("--------------------------------------------------");

  try {
    const count = await prisma.wedding.count();
    if (count > 0) {
      console.log(`[seed-db] Database already contains ${count} wedding listings. Skipping seed.`);
      process.exit(0);
    }

    const { featuredWeddings } = require("../lib/data");

    console.log("[seed-db] Creating mock host couple account...");
    const mockUser = await prisma.user.create({
      data: {
        clerkUserId: "mock_host_id",
        email: "host@weddingwithindia.com",
        name: "Devika & Kaber",
        role: "COUPLE",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80"
      }
    });

    const coupleProfile = await prisma.coupleProfile.create({
      data: {
        userId: mockUser.id,
        weddingDate: new Date("2025-02-14"),
        weddingLocation: "Umaid Bhawan Palace, Jodhpur",
        expectedGuests: 500,
        languagesSpoken: "English, Hindi",
        familyBio: "Devika and Kaber met while working on the restoration of a fort. They want to welcome global guests to experience traditional hospitality."
      }
    });

    console.log(`[seed-db] Seeding ${featuredWeddings.length} featured weddings into database...`);
    for (const w of featuredWeddings) {
      await prisma.wedding.create({
        data: {
          id: w.id === "w1" ? "w1" : undefined,
          slug: w.slug,
          title: w.title,
          description: w.story,
          location: w.location,
          category: w.category,
          date: new Date(w.date),
          pricePerGuest: w.pricePerGuest,
          capacity: w.guestsAllowed,
          mainImageUrl: w.imageUrl,
          status: "PUBLISHED",
          hostCoupleId: coupleProfile.id,
          gallery: {
            create: w.gallery.map((url, idx) => ({
              imageUrl: url,
              order: idx
            }))
          },
          events: {
            create: w.timeline.map((evt) => {
              const timeParts = evt.time.split(" - ");
              const startTime = timeParts[0] || "09:00";
              const endTime = timeParts[1] || "17:00";
              return {
                name: evt.title,
                description: evt.description,
                date: new Date(w.date),
                startTime,
                endTime,
                location: w.location,
                dressCode: "Traditional / Festive smart casual"
              };
            })
          },
          traditions: {
            create: w.tags.map((tag) => ({
              name: tag,
              description: "A beautiful, colorful Indian wedding tradition."
            }))
          }
        }
      });
      console.log(`  ✓ Created wedding: ${w.title} (${w.slug})`);
    }

    console.log("--------------------------------------------------");
    console.log("Successfully seeded database with initial wedding marketplace listings!");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("Fatal: Failed to seed database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
