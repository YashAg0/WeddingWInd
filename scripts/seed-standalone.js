// Standalone seed script using plain PrismaClient with extended timeout
// Run: node scripts/seed-standalone.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Hardcoded seed data (mirrors lib/data.ts featuredWeddings)
const seedWeddings = [
  {
    id: "w1",
    slug: "grand-maharaja-wedding",
    title: "The Grand Maharaja Wedding",
    description: "Experience the grandeur of a royal Marwari wedding at the magnificent Umaid Bhawan Palace. Join Devika and Kaber as they celebrate their union with centuries-old traditions, including the vibrant Mehndi ceremony, sacred Saptapadi fire ritual, and a stunning Baraat procession through Jodhpur's Blue City.",
    location: "Umaid Bhawan Palace, Jodhpur, Rajasthan",
    category: "Royal",
    date: new Date("2025-02-14"),
    pricePerGuest: 17999,
    capacity: 20,
    mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80",
    status: "PUBLISHED",
    featured: true
  },
  {
    slug: "lakeside-rajput-celebration",
    title: "Lakeside Rajput Celebration",
    description: "A breathtaking wedding set against the shimmering waters of Lake Pichola. Meera and Aditya invite you to witness a magical Sikh Anand Karaj ceremony followed by a grand lakeside reception with traditional Ghoomar dancers.",
    location: "Jagmandir Island Palace, Udaipur, Rajasthan",
    category: "Lakeside",
    date: new Date("2025-03-20"),
    pricePerGuest: 11999,
    capacity: 15,
    mainImageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80",
    status: "PUBLISHED",
    featured: true
  },
  {
    slug: "kerala-backwater-wedding",
    title: "Kerala Backwater Wedding",
    description: "Set along the tranquil backwaters of Kerala, this intimate Christian matrimony ceremony blends traditional Malayali customs with serene natural beauty. Float along the canals on a decorated houseboat and witness ancient rituals.",
    location: "Alleppey Backwaters, Kerala",
    category: "Destination",
    date: new Date("2025-04-10"),
    pricePerGuest: 7499,
    capacity: 12,
    mainImageUrl: "https://images.unsplash.com/photo-1601379329542-31c59347e2b4?w=1200&q=80",
    status: "PUBLISHED",
    featured: false
  }
];

async function main() {
  console.log("--------------------------------------------------");
  console.log("WeddingWithIndia — Standalone Database Seeder");
  console.log("Connecting to:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
  console.log("--------------------------------------------------");

  try {
    // Test connection first with longer timeout
    console.log("[seed] Testing connection...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("[seed] ✅ Connection confirmed.");

    const count = await prisma.wedding.count();
    if (count > 0) {
      console.log(`[seed] Database already contains ${count} wedding listings. Skipping seed.`);
      const userCount = await prisma.user.count();
      const agentCount = await prisma.agentProfile.count();
      console.log(`[seed] Users: ${userCount}, Agents: ${agentCount}`);
      process.exit(0);
    }

    // 1. Create host couple
    console.log("[seed] Creating host couple account...");
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
    console.log(`  ✓ Host user: ${mockUser.email} (id: ${mockUser.id})`);

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
    console.log(`  ✓ Couple profile: ${coupleProfile.id}`);

    // 2. Seed weddings
    console.log(`[seed] Seeding ${seedWeddings.length} wedding listings...`);
    for (const w of seedWeddings) {
      const created = await prisma.wedding.create({
        data: {
          id: w.id,
          slug: w.slug,
          title: w.title,
          description: w.description,
          location: w.location,
          category: w.category,
          date: w.date,
          pricePerGuest: w.pricePerGuest,
          capacity: w.capacity,
          mainImageUrl: w.mainImageUrl,
          status: w.status,
          featured: w.featured || false,
          hostCoupleId: coupleProfile.id
        }
      });
      console.log(`  ✓ Wedding: "${created.title}" (slug: ${created.slug})`);
    }

    // 3. Create admin user
    console.log("[seed] Creating admin user...");
    const adminUser = await prisma.user.create({
      data: {
        clerkUserId: "admin_bootstrap_id",
        email: "admin@weddingwithindia.com",
        name: "Platform Admin",
        role: "ADMIN",
        status: "ACTIVE"
      }
    });
    console.log(`  ✓ Admin: ${adminUser.email} (role: ${adminUser.role}, id: ${adminUser.id})`);

    // 4. Create sample agent
    console.log("[seed] Creating sample agent...");
    const agentUser = await prisma.user.create({
      data: {
        clerkUserId: "agent_sample_id",
        email: "agent@weddingwithindia.com",
        name: "Amir Hussain",
        role: "AGENT",
        status: "ACTIVE"
      }
    });
    const agentProfile = await prisma.agentProfile.create({
      data: {
        userId: agentUser.id,
        organization: "Mumbai Hospitality Network",
        country: "India",
        experienceYears: 5,
        targetAudience: "Luxury travelers",
        verifiedChecks: true,
        referralCode: "WWI-AGENT-8921X"
      }
    });
    console.log(`  ✓ Agent: ${agentUser.email} (code: ${agentProfile.referralCode})`);

    // 5. Create sample traveler + booking against the first wedding
    console.log("[seed] Creating sample traveler & booking...");
    const travelerUser = await prisma.user.create({
      data: {
        clerkUserId: "traveler_sample_id",
        email: "traveler@example.com",
        name: "Sarah & James Whitmore",
        role: "TRAVELER",
        status: "ACTIVE"
      }
    });
    const travelerProfile = await prisma.travelerProfile.create({
      data: {
        userId: travelerUser.id,
        fullName: "Sarah Whitmore",
        country: "United Kingdom",
        language: "English",
        budget: "17999"
      }
    });
    const booking = await prisma.booking.create({
      data: {
        travelerId: travelerProfile.id,
        weddingId: "w1",
        date: new Date("2025-02-14"),
        guestsCount: 2,
        pricePerGuest: 17999,
        totalAmount: 35998,
        status: "ATTENDED"
      }
    });
    console.log(`  ✓ Traveler: ${travelerUser.email}`);
    console.log(`  ✓ Booking: ${booking.id} (status: ${booking.status}, total: ₹${booking.totalAmount})`);

    // Final counts
    console.log("--------------------------------------------------");
    const finalUsers = await prisma.user.count();
    const finalWeddings = await prisma.wedding.count();
    const finalAgents = await prisma.agentProfile.count();
    const finalBookings = await prisma.booking.count();
    console.log("✅ Seed complete!");
    console.log(`  Users: ${finalUsers}`);
    console.log(`  Weddings: ${finalWeddings}`);
    console.log(`  Agent Profiles: ${finalAgents}`);
    console.log(`  Bookings: ${finalBookings}`);
    console.log("--------------------------------------------------");

  } catch (error) {
    console.error("Fatal: Failed to seed database:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
