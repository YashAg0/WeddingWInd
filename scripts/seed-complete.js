/**
 * WeddingWithIndia — Master Database Seeder
 * Seeds a complete, interconnected demonstration ecosystem with Super Admin, Admin, Host, Guest, Agent, Coordinator,
 * Demo Weddings, Events, Traditions, Galleries, Bookings, Guest Passes, Reviews, Payments, Commissions, and Verifications.
 */

const { PrismaClient } = require("@prisma/client");

const dbUrl = process.env.DATABASE_URL || "";
const connectionUrl = dbUrl + (dbUrl.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function seedMasterData() {
  console.log("==================================================");
  console.log("  WeddingWithIndia — Master Database Seeder");
  console.log("==================================================\n");

  try {
    console.log("[seed] Checking existing database state...");
    const existingWeddings = await prisma.wedding.count();
    if (existingWeddings > 0) {
      console.log(`ℹ️ Database already contains ${existingWeddings} wedding listing(s). Refreshing seed data...\n`);
    }

    // ------------------------------------------------------------------------
    // 1. CREATE RBAC DEMO ACCOUNTS
    // ------------------------------------------------------------------------
    console.log("1. Seeding Core RBAC User Accounts...");

    // Super Admin
    const superAdmin = await prisma.user.upsert({
      where: { email: "superadmin@weddingwithindia.com" },
      update: { role: "ADMIN", status: "ACTIVE" },
      create: {
        clerkUserId: "user_superadmin_seed",
        email: "superadmin@weddingwithindia.com",
        name: "Vikramaditya Roy (Super Admin)",
        role: "ADMIN",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      },
    });
    console.log(`   ✓ Super Admin: ${superAdmin.email} (${superAdmin.id})`);

    // Admin
    const admin = await prisma.user.upsert({
      where: { email: "admin@weddingwithindia.com" },
      update: { role: "ADMIN", status: "ACTIVE" },
      create: {
        clerkUserId: "user_admin_seed",
        email: "admin@weddingwithindia.com",
        name: "Priya Sharma (Operations Manager)",
        role: "ADMIN",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      },
    });
    console.log(`   ✓ Admin: ${admin.email} (${admin.id})`);

    // Host Couple
    const hostUser = await prisma.user.upsert({
      where: { email: "host@weddingwithindia.com" },
      update: { role: "COUPLE", status: "ACTIVE" },
      create: {
        clerkUserId: "user_host_seed",
        email: "host@weddingwithindia.com",
        name: "Devika & Kaber Singhania",
        role: "COUPLE",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80",
      },
    });
    const hostProfile = await prisma.coupleProfile.upsert({
      where: { userId: hostUser.id },
      update: {},
      create: {
        userId: hostUser.id,
        weddingDate: new Date("2025-11-20"),
        weddingLocation: "Umaid Bhawan Palace, Jodhpur",
        expectedGuests: 500,
        languagesSpoken: "English, Hindi, Marwari",
        photographyRules: "Allowed in designated areas",
        familyBio: "The Singhania family welcomes global travelers to experience royal Marwari hospitality and centuries-old wedding traditions.",
      },
    });
    console.log(`   ✓ Host Couple: ${hostUser.email} (Profile ID: ${hostProfile.id})`);

    // Traveler (Guest)
    const guestUser = await prisma.user.upsert({
      where: { email: "guest@weddingwithindia.com" },
      update: { role: "TRAVELER", status: "ACTIVE" },
      create: {
        clerkUserId: "user_guest_seed",
        email: "guest@weddingwithindia.com",
        name: "Sarah & James Whitmore",
        role: "TRAVELER",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
      },
    });
    const guestProfile = await prisma.travelerProfile.upsert({
      where: { userId: guestUser.id },
      update: {},
      create: {
        userId: guestUser.id,
        fullName: "Sarah Whitmore",
        country: "United Kingdom",
        language: "English",
        interests: "Heritage architecture, Indian culinary arts, classical dance",
        budget: "25000",
        preferences: "Royal & Traditional",
        foodPreferences: "Vegetarian Preferred",
        accessibility: "None",
      },
    });
    console.log(`   ✓ Traveler (Guest): ${guestUser.email} (Profile ID: ${guestProfile.id})`);

    // Agent
    const agentUser = await prisma.user.upsert({
      where: { email: "agent@weddingwithindia.com" },
      update: { role: "AGENT", status: "ACTIVE" },
      create: {
        clerkUserId: "user_agent_seed",
        email: "agent@weddingwithindia.com",
        name: "Amir Hussain (Royal Travel Corp)",
        role: "AGENT",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      },
    });
    const agentProfile = await prisma.agentProfile.upsert({
      where: { userId: agentUser.id },
      update: {},
      create: {
        userId: agentUser.id,
        organization: "Royal India Hospitality & Luxury Travel",
        country: "United Arab Emirates",
        experienceYears: 8,
        targetAudience: "High-net-worth cultural enthusiasts",
        verifiedChecks: true,
        referralCode: "WWI-ROYAL-AGENT",
      },
    });
    console.log(`   ✓ Agent: ${agentUser.email} (Referral Code: ${agentProfile.referralCode})`);

    // Coordinator
    const coordinatorUser = await prisma.user.upsert({
      where: { email: "coordinator@weddingwithindia.com" },
      update: { role: "ADMIN", status: "ACTIVE" },
      create: {
        clerkUserId: "user_coordinator_seed",
        email: "coordinator@weddingwithindia.com",
        name: "Rajesh Mehta (Lead On-Site Coordinator)",
        role: "ADMIN",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      },
    });
    console.log(`   ✓ Coordinator: ${coordinatorUser.email} (${coordinatorUser.id})`);

    // ------------------------------------------------------------------------
    // 2. SEED USER VERIFICATIONS
    // ------------------------------------------------------------------------
    console.log("\n2. Seeding Verification Records...");
    const usersToVerify = [superAdmin, admin, hostUser, guestUser, agentUser, coordinatorUser];
    for (const u of usersToVerify) {
      await prisma.verification.upsert({
        where: { userId: u.id },
        update: { status: "APPROVED" },
        create: {
          userId: u.id,
          status: "APPROVED",
          phoneVerified: true,
          emailVerified: true,
          govtIdUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
          selfieUrl: u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
          notes: "Auto-verified via Production Bootstrap Suite.",
          reviewedBy: superAdmin.id,
        },
      });
    }
    console.log(`   ✓ Verified ${usersToVerify.length} user accounts.`);

    // ------------------------------------------------------------------------
    // 3. SEED DEMO WEDDING LISTINGS & CONNECTED CONTENT
    // ------------------------------------------------------------------------
    console.log("\n3. Seeding Connected Demo Weddings & Events...");

    const demoWeddingsData = [
      {
        id: "w1",
        slug: "grand-maharaja-wedding",
        title: "The Grand Maharaja Wedding",
        description: "Experience royal Marwari grandeur at Umaid Bhawan Palace, Jodhpur. Enjoy authentic Sangeet performances, sacred Phera rituals, and a royal procession.",
        location: "Umaid Bhawan Palace, Jodhpur, Rajasthan",
        category: "Royal",
        date: new Date("2025-11-20"),
        pricePerGuest: 17999,
        capacity: 500,
        mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        theme: "Royal Marwari Heritage",
        dressCode: "Festive Indian Royal Attire / Black Tie",
        ethnicity: "Marwari Rajput",
      },
      {
        id: "w2",
        slug: "lakeside-rajput-celebration",
        title: "Lakeside Rajput Celebration",
        description: "A romantic wedding on Lake Pichola, Udaipur featuring sunset boat processions, classical shehnai recitals, and lakeside fine dining.",
        location: "Jagmandir Island Palace, Udaipur, Rajasthan",
        category: "Lakeside",
        date: new Date("2025-12-05"),
        pricePerGuest: 14999,
        capacity: 300,
        mainImageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        theme: "Lakeside Romance & Heritage",
        dressCode: "Traditional Elegant Ethnic",
        ethnicity: "Mewari Rajput",
      },
      {
        id: "w3",
        slug: "kerala-backwater-matrimony",
        title: "Kerala Backwater Matrimony",
        description: "Serene backwater nuptials in Alleppey featuring traditional Kathakali, Sadya feast served on banana leaves, and houseboat tours.",
        location: "Kumarakom Lake Resort, Alleppey, Kerala",
        category: "Destination",
        date: new Date("2026-01-15"),
        pricePerGuest: 9999,
        capacity: 200,
        mainImageUrl: "https://images.unsplash.com/photo-1601379329542-31c59347e2b4?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        theme: "South Indian Coastal Tradition",
        dressCode: "White & Gold Kanjeevaram / Mundu",
        ethnicity: "Malayali Hindu",
      },
      {
        id: "w4",
        slug: "goan-sunset-beach-wedding",
        title: "Goan Sunset Beach Nuptials",
        description: "An oceanfront beach wedding in South Goa featuring live acoustic music, fresh seafood barbeques, and tropical cocktail evenings.",
        location: "The Leela Goa, Cavelossim Beach, Goa",
        category: "Beach",
        date: new Date("2026-02-10"),
        pricePerGuest: 11999,
        capacity: 250,
        mainImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        theme: "Tropical Beach Elegance",
        dressCode: "Resort Chic / Soft Pastels",
        ethnicity: "Indo-Western Fusion",
      },
    ];

    for (const wData of demoWeddingsData) {
      const wedding = await prisma.wedding.upsert({
        where: { slug: wData.slug },
        update: {
          title: wData.title,
          description: wData.description,
          pricePerGuest: wData.pricePerGuest,
          status: wData.status,
          featured: wData.featured,
        },
        create: {
          id: wData.id,
          hostCoupleId: hostProfile.id,
          slug: wData.slug,
          title: wData.title,
          description: wData.description,
          location: wData.location,
          category: wData.category,
          date: wData.date,
          pricePerGuest: wData.pricePerGuest,
          capacity: wData.capacity,
          mainImageUrl: wData.mainImageUrl,
          status: wData.status,
          featured: wData.featured,
          theme: wData.theme,
          dressCode: wData.dressCode,
          ethnicity: wData.ethnicity,
          gallery: {
            create: [
              { imageUrl: wData.mainImageUrl, order: 0 },
              { imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1000&q=80", order: 1 },
              { imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&q=80", order: 2 },
            ],
          },
          events: {
            create: [
              {
                name: "Mehndi & Sangeet Gala",
                description: "Evening of henna art, live folk music, and choreograph dances.",
                date: wData.date,
                startTime: "17:00",
                endTime: "23:00",
                location: wData.location,
                dressCode: "Bright Vibrant Ethnic",
              },
              {
                name: "Sacred Phera Ceremony",
                description: "Traditional Vedic marriage ceremony around the holy fire.",
                date: new Date(wData.date.getTime() + 86400000),
                startTime: "10:00",
                endTime: "14:00",
                location: wData.location,
                dressCode: "Royal Festive Attire",
              },
            ],
          },
          traditions: {
            create: [
              { name: "Baraat Procession", description: "Groom's grand arrival accompanied by brass band and dancers." },
              { name: "Saptapadi", description: "Seven sacred vows taken together around the holy fire." },
            ],
          },
        },
      });
      console.log(`   ✓ Wedding Created/Updated: "${wedding.title}" (${wedding.slug})`);
    }

    // ------------------------------------------------------------------------
    // 4. SEED DEMO BOOKINGS, GUEST PASSES & PREPARATIONS
    // ------------------------------------------------------------------------
    console.log("\n4. Seeding Demo Bookings, Passes & Preparations...");

    const primaryWedding = await prisma.wedding.findUnique({ where: { slug: "grand-maharaja-wedding" } });

    if (primaryWedding) {
      // Booking 1: Attended
      const bookingAttended = await prisma.booking.create({
        data: {
          travelerId: guestProfile.id,
          weddingId: primaryWedding.id,
          date: primaryWedding.date,
          guestsCount: 2,
          pricePerGuest: primaryWedding.pricePerGuest,
          totalAmount: primaryWedding.pricePerGuest * 2,
          status: "ATTENDED",
          guests: {
            create: [
              { fullName: "Sarah Whitmore", email: "sarah@example.com", age: 31, foodPreference: "Vegetarian" },
              { fullName: "James Whitmore", email: "james@example.com", age: 34, foodPreference: "No Restrictions" },
            ],
          },
          guestPasses: {
            create: [
              { passCode: "WWI-PASS-SRH99", qrCode: "QR_DATA_SRH99", status: "CHECKED_IN" },
              { passCode: "WWI-PASS-JMS88", qrCode: "QR_DATA_JMS88", status: "CHECKED_IN" },
            ],
          },
        },
      });
      console.log(`   ✓ Booking #1 Created: ID ${bookingAttended.id} (Status: ATTENDED, Amount: ₹${bookingAttended.totalAmount})`);

      // Payment for Booking 1
      const payment1 = await prisma.payment.create({
        data: {
          bookingId: bookingAttended.id,
          amount: bookingAttended.totalAmount,
          currency: "INR",
          status: "PAID",
          stripePaymentIntentId: "pi_seed_demo_35998",
          stripeChargeId: "ch_seed_demo_35998",
        },
      });

      // Commission for Booking 1
      await prisma.commission.create({
        data: {
          agentId: agentProfile.id,
          bookingId: bookingAttended.id,
          paymentId: payment1.id,
          grossAmount: bookingAttended.totalAmount,
          commissionAmount: bookingAttended.totalAmount * 0.07,
          currency: "INR",
          status: "APPROVED",
          source: "BOOKING_PAYMENT",
          availableAt: new Date(),
        },
      });
      console.log(`   ✓ Linked Payment & Commission (7% = ₹${bookingAttended.totalAmount * 0.07}) to Agent ${agentProfile.referralCode}`);

      // Review for Booking 1
      await prisma.review.create({
        data: {
          bookingId: bookingAttended.id,
          travelerId: guestProfile.id,
          rating: 5,
          comment: "Attending Devika & Kaber's wedding at Umaid Bhawan was the absolute highlight of our trip to India! The warmth of the family, the food, and the cultural immersion were unmatched.",
          reply: "Dear Sarah and James, it was our family's honor to host you both! Wishing you love and light always.",
          status: "PUBLISHED",
          ratingFood: 5,
          ratingHospitality: 5,
          ratingExperience: 5,
          ratingCulture: 5,
          ratingSafety: 5,
          ratingAccommodation: 5,
        },
      });
      console.log("   ✓ Linked Verified 5-Star Review with Host Reply.");
    }

    // ------------------------------------------------------------------------
    // 5. SEED WISHLISTS, NOTIFICATIONS & AUDIT LOGS
    // ------------------------------------------------------------------------
    console.log("\n5. Seeding Wishlists, Notifications & Audit Logs...");

    if (primaryWedding) {
      await prisma.wishlist.upsert({
        where: { travelerId_weddingId: { travelerId: guestProfile.id, weddingId: primaryWedding.id } },
        update: {},
        create: {
          travelerId: guestProfile.id,
          weddingId: primaryWedding.id,
          folder: "Royal Palaces",
          collection: "Favorites",
          notes: "Must attend during our autumn Rajasthan trip!",
        },
      });

      await prisma.notification.create({
        data: {
          userId: guestUser.id,
          title: "Booking Confirmed! 🪔",
          message: "Your attendance at The Grand Maharaja Wedding is confirmed. Check your dashboard for your digital Guest Pass.",
          type: "SUCCESS",
          read: false,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "BOOTSTRAP_SYSTEM_INIT",
          entity: "System",
          entityId: "SYSTEM",
          userId: superAdmin.id,
          userName: superAdmin.name || "Super Admin",
          details: "Master database bootstrapped successfully with RBAC roles and connected demo data.",
        },
      });
    }

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    const finalUsers = await prisma.user.count();
    const finalWeddings = await prisma.wedding.count();
    const finalBookings = await prisma.booking.count();
    const finalReviews = await prisma.review.count();

    console.log("\n--------------------------------------------------");
    console.log("✅ Master Database Seeding Completed Successfully!");
    console.log("--------------------------------------------------");
    console.log(`  Users: ${finalUsers}`);
    console.log(`  Weddings: ${finalWeddings}`);
    console.log(`  Bookings: ${finalBookings}`);
    console.log(`  Reviews: ${finalReviews}`);
    console.log("==================================================\n");

    return true;
  } catch (error) {
    console.error("❌ CRITICAL: Master Seeder encountered an error:");
    console.error(error.message);
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedMasterData().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { seedMasterData };
