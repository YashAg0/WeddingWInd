/**
 * WeddingWithIndia — Master Database Seeder
 * Seeds a complete, interconnected demonstration ecosystem with Super Admin, Admin, 22 Unique Hosts, Guest, Agent, Coordinator,
 * 22 Unique Curated Weddings, Events, Traditions, Galleries, Bookings, Guest Passes, Reviews, Payments, Commissions, and Verifications.
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

    // Primary Host Couple
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
        weddingDate: new Date("2026-11-18"),
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
        description: "Experience royal Marwari grandeur at Umaid Bhawan Palace, Jodhpur. Enjoy authentic Sangeet performances, sacred Phera rituals, and a royal procession through the Blue City.",
        location: "Umaid Bhawan Palace, Jodhpur, Rajasthan",
        category: "Royal",
        date: new Date("2026-11-18"),
        pricePerGuest: 17999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        sponsored: true,
        isDemo: true,
        hostCoupleName: "Devika & Kaber Singhania",
        hostEmail: "host_w1@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80",
        theme: "Royal Marwari Heritage",
        dressCode: "Festive Indian Royal Attire / Black Tie",
        ethnicity: "Marwari Rajput",
        traditions: [
          { name: "Baraat Procession", description: "Groom's grand arrival on an elephant accompanied by brass band and 200 dancers." },
          { name: "Saptapadi", description: "Seven sacred vows taken together around the holy fire by the sacred lake." },
          { name: "Tilak Ceremony", description: "Traditional tilak ceremony performed by the bride's family to welcome the groom." },
        ],
      },
      {
        id: "w2",
        slug: "lakeside-rajput-celebration",
        title: "Lakeside Rajput Celebration",
        description: "A romantic wedding on Lake Pichola, Udaipur featuring sunset boat processions, classical shehnai recitals, and lakeside fine dining under the stars.",
        location: "Jagmandir Island Palace, Udaipur, Rajasthan",
        category: "Royal",
        date: new Date("2026-12-04"),
        pricePerGuest: 14999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Aditya & Sanjana Rathore",
        hostEmail: "host_w2@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
        theme: "Lakeside Romance & Heritage",
        dressCode: "Traditional Elegant Ethnic",
        ethnicity: "Mewari Rajput",
        traditions: [
          { name: "Boat Procession", description: "Traditional boat procession across Lake Pichola at sunset." },
          { name: "Ghoomar Performance", description: "Imperial Rajasthani Ghoomar dance presented by classical court artists." },
        ],
      },
      {
        id: "w3",
        slug: "kerala-backwater-matrimony",
        title: "Kerala Backwater Matrimony",
        description: "Serene backwater matrimony amidst palm groves in Alleppey. Features traditional Kerala Sadya on banana leaves and Kathakali cultural performances.",
        location: "Kumarakom Lake Resort, Alleppey, Kerala",
        category: "Nature",
        date: new Date("2027-01-14"),
        pricePerGuest: 11499,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Karan & Meera Nambiar",
        hostEmail: "host_w3@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        theme: "Backwater Serenade",
        dressCode: "Traditional Kerala Kasavu Saree / Mundu",
        ethnicity: "Malayali Hindu",
        traditions: [
          { name: "Traditional Sadya", description: "Authentic 24-dish vegetarian feast served on fresh banana leaves." },
          { name: "Kathakali Recital", description: "Enchanting twilight Kathakali storytelling performance." },
        ],
      },
      {
        id: "w4",
        slug: "goan-sunset-beach-wedding",
        title: "Goan Sunset Beach Nuptials",
        description: "A vibrant beachfront celebration on Mandrem Beach with sunset ocean views, live Goan brass music, fresh seafood banquets, and floral mandap ceremonies.",
        location: "Riva Beach Resort, Mandrem, Goa",
        category: "Beach",
        date: new Date("2027-02-12"),
        pricePerGuest: 12999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Rohan & Alisha D'Souza",
        hostEmail: "host_w4@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
        theme: "Tropical Beach Romance",
        dressCode: "Beach Formal / Pastel Linen",
        ethnicity: "Goan Catholic & Hindu Fusion",
        traditions: [
          { name: "Roce Blessing", description: "Traditional Goan coconut milk anointing ritual for prosperity." },
          { name: "Sunset Mandap Vows", description: "Sacred oceanfront vows against the glowing Arabian sea horizon." },
        ],
      },
      {
        id: "w5",
        slug: "varanasi-ganges-spiritual-union",
        title: "Varanasi Ganges Spiritual Union",
        description: "A sacred heritage wedding overlooking the holy Ganges River at Darbhanga Ghat. Features private Ganga Aarti, classical sitar recitals, and traditional Vedic chants.",
        location: "BrijRama Palace, Darbhanga Ghat, Varanasi, Uttar Pradesh",
        category: "Traditional",
        date: new Date("2027-03-05"),
        pricePerGuest: 10999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Shivam & Priya Tripathi",
        hostEmail: "host_w5@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
        theme: "Ganges Vedic Devotion",
        dressCode: "Traditional Banarasi Silk",
        ethnicity: "Varanasi Brahmin Hindu",
        traditions: [
          { name: "Private Ganga Aarti", description: "Exclusive evening flame ceremony conducted by senior Vedic priests." },
          { name: "Sitar & Shehnai Recital", description: "Classical Hindustani musical raga for morning muhurtham." },
        ],
      },
      {
        id: "w6",
        slug: "punjabi-amritsar-golden-wedding",
        title: "Amritsar Golden Temple Wedding",
        description: "High-energy Punjabi wedding starting with sacred Anand Karaj near the Golden Temple, followed by Dhol drumming, Bhangra dances, and authentic Punjabi feasts.",
        location: "Welcomhotel by ITC Hotels, Amritsar, Punjab",
        category: "Traditional",
        date: new Date("2027-04-12"),
        pricePerGuest: 13999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Gurpreet & Harleen Dhillon",
        hostEmail: "host_w6@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80",
        theme: "Vibrant Punjabi Hospitality",
        dressCode: "Punjabi Kurta Pajama & Turban / Heavy Phulkari Lehenga",
        ethnicity: "Punjabi Sikh",
        traditions: [
          { name: "Anand Karaj", description: "Sacred Sikh marriage ceremony at the Gurdwara." },
          { name: "Live Bhangra & Dhol", description: "Electrifying folk dance with dhol drum masters." },
        ],
      },
      {
        id: "w7",
        slug: "jaipur-havelis-rajwada-wedding",
        title: "Jaipur Havelis Rajwada Wedding",
        description: "An authentic Pink City celebration at Samode Palace with royal elephant welcomes, folk puppets, Shekhawati Haveli tours, and royal Rajasthani banquets.",
        location: "Samode Palace, Jaipur, Rajasthan",
        category: "Royal",
        date: new Date("2027-05-08"),
        pricePerGuest: 15499,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Ranveer & Kavya Shekhawat",
        hostEmail: "host_w7@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
        theme: "Pink City Haveli Glamour",
        dressCode: "Heritage Bandhgala / Zardosi Lehenga",
        ethnicity: "Shekhawati Rajput",
        traditions: [
          { name: "Rajwada Welcome", description: "Royal trumpets, rose petal showers, and traditional dholak welcome." },
          { name: "Phera Rituals", description: "Vedic vows in the 400-year-old painted mirror hall of Samode Palace." },
        ],
      },
      {
        id: "w8",
        slug: "tamil-brahmin-wedding-madurai",
        title: "Tamil Brahmin Madurai Meenakshi Wedding",
        description: "A traditional South Indian Kalyanam in Madurai featuring Nadaswaram musical ragas, floral kolam decorations, banana leaf feasts, and sacred Oonjal rituals.",
        location: "Heritage Madurai Resort, Madurai, Tamil Nadu",
        category: "Traditional",
        date: new Date("2027-06-11"),
        pricePerGuest: 9999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Karthik & Deepa Iyer",
        hostEmail: "host_w8@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
        theme: "Tamil Temple Heritage",
        dressCode: "Kanchipuram Silk Saree / Veshti",
        ethnicity: "Tamil Brahmin",
        traditions: [
          { name: "Oonjal Swing Ceremony", description: "Couple seated on a floral swing surrounded by singing elders." },
          { name: "Kanyadaan & Muhurtham", description: "Sacred tying of the Mangalsutra at dawn Muhurtham." },
        ],
      },
      {
        id: "w9",
        slug: "andaman-island-tropical-wedding",
        title: "Andaman Islands Tropical Wedding",
        description: "An exclusive island celebration on Radhanagar Beach, Havelock. Turquoise waters, white sands, fresh coconut bars, seafood BBQs, and barefoot sunset vows.",
        location: "Taj Exotica Resort & Spa, Havelock Island, Andaman",
        category: "Beach",
        date: new Date("2027-07-16"),
        pricePerGuest: 16999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Varun & Sneha Roy",
        hostEmail: "host_w9@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80",
        theme: "Tropical Island Paradise",
        dressCode: "Island Chic / Flowy Linen Attire",
        ethnicity: "Multicultural Coastal",
        traditions: [
          { name: "Sunset Mandap Vows", description: "Mandap constructed from driftwood and native orchids on white coral sand." },
          { name: "Seafood & Grill Gala", description: "Fresh island seafood feast under hanging coconut lanterns." },
        ],
      },
      {
        id: "w10",
        slug: "bengali-durga-puja-wedding",
        title: "Kolkata Bengali Heritage Wedding",
        description: "Authentic Bengali Rajbari celebration in Kolkata featuring traditional Gaye Holud, Uludhani chanting, Shankh blowing, and 30-course Bengali gourmet dining.",
        location: "The Rajbari Bawali, Kolkata, West Bengal",
        category: "Traditional",
        date: new Date("2027-08-20"),
        pricePerGuest: 11999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Aritra & Pooja Mukherjee",
        hostEmail: "host_w10@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&q=80",
        theme: "Bengali Rajbari Nostalgia",
        dressCode: "Red & White Baluchari Silk Saree / Dhoti Panjabi",
        ethnicity: "Bengali Hindu",
        traditions: [
          { name: "Subho Drishti", description: "First auspicious eye contact between bride and groom behind betel leaves." },
          { name: "Gaye Holud", description: "Turmeric ceremony accompanied by traditional Rabindra Sangeet." },
        ],
      },
      {
        id: "w11",
        slug: "mughal-agra-taj-wedding",
        title: "Mughal Garden Wedding at Agra",
        description: "A majestic garden celebration overlooking the iconic Taj Mahal, featuring classical Qawwali performances, royal Mughlai cuisine, and lighted fountain displays.",
        location: "ITC Mughal, Agra, Uttar Pradesh",
        category: "Royal",
        date: new Date("2027-09-18"),
        pricePerGuest: 14499,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Tariq & Zoya Mirza",
        hostEmail: "host_w11@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80",
        theme: "Mughal Garden Elegance",
        dressCode: "Imperial Anarkali / Sherwani with Emerald Accents",
        ethnicity: "Mughal Heritage",
        traditions: [
          { name: "Sufi Qawwali Night", description: "Enchanting Sufi vocal music under starlit garden arches." },
          { name: "Nikah & Feast", description: "Solemn vows followed by slow-cooked Biryani & Shahi Tukda banquet." },
        ],
      },
      {
        id: "w12",
        slug: "kashmiri-dal-lake-wedding",
        title: "Kashmir Dal Lake Houseboat Wedding",
        description: "Enchanting Himalayan wedding on Dal Lake houseboats, Srinagar. Floating flower shikaras, traditional Wazwan 36-course feast, and Kahwa tea ceremony.",
        location: "Luxury Houseboats, Dal Lake, Srinagar, Kashmir",
        category: "Nature",
        date: new Date("2027-10-10"),
        pricePerGuest: 13499,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Tariq & Bushra Dar",
        hostEmail: "host_w12@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80",
        theme: "Kashmiri Valley Romance",
        dressCode: "Traditional Pheran with Tilla Embroidery",
        ethnicity: "Kashmiri",
        traditions: [
          { name: "Floating Shikara Baraat", description: "Groom's arrival across Dal Lake in flower-bedecked wooden boats." },
          { name: "Wazwan Banquet", description: "Royal 36-dish feast cooked by master Ustaads." },
        ],
      },
      {
        id: "w13",
        slug: "coorg-plantation-wedding",
        title: "Coorg Coffee Plantation Wedding",
        description: "A lush highland wedding nestled in the misty coffee hills of Coorg. Features Kodava sword dance ceremonies, traditional pork & bamboo shoot banquets, and estate bonfires.",
        location: "Evolve Back Resort, Siddapur, Coorg, Karnataka",
        category: "Nature",
        date: new Date("2027-10-28"),
        pricePerGuest: 10499,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Bopanna & Thanusha Muttappa",
        hostEmail: "host_w13@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80",
        theme: "Highland Coffee Estate Serenity",
        dressCode: "Kodava Style Back-Draped Saree / Kupya",
        ethnicity: "Kodava Hindu",
        traditions: [
          { name: "Valagaga Dance", description: "High-energy Kodava sword and drum dance around plantation bonfire." },
          { name: "Dampathi Muhurtham", description: "Blessing ceremony with fresh coffee leaves and holy water." },
        ],
      },
      {
        id: "w14",
        slug: "hyderabad-nizam-wedding",
        title: "Hyderabad Nizam Heritage Wedding",
        description: "An opulent Nizami celebration at Taj Falaknuma Palace, featuring 101-seat dining table banquets, Hyderabadi Dum Biryani, and classical Ghazal performances.",
        location: "Taj Falaknuma Palace, Hyderabad, Telangana",
        category: "Royal",
        date: new Date("2027-11-12"),
        pricePerGuest: 18999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Zaid & Nusrat Farooqui",
        hostEmail: "host_w14@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
        theme: "Nizami Opulence & Pearls",
        dressCode: "Khada Dupatta / Royal Sherwani with Pearl Strings",
        ethnicity: "Hyderabadi Muslim",
        traditions: [
          { name: "101-Seat Grand Dining", description: "Banquet served at the world's longest historic dining table." },
          { name: "Late-Night Ghazal Lounge", description: "Soothing classical Urdu poetry and Ghazals under palace chandeliers." },
        ],
      },
      {
        id: "w15",
        slug: "uttarakhand-hills-wedding",
        title: "Uttarakhand Mountain Meadow Wedding",
        description: "A scenic Himalayan hill wedding in Mussoorie with oak forest views, Garhwali folk songs, local rhododendron wine toasts, and sacred mountain pheras.",
        location: "JW Marriott Walnut Grove Resort, Mussoorie, Uttarakhand",
        category: "Nature",
        date: new Date("2027-11-26"),
        pricePerGuest: 11999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Devendra & Smriti Rawat",
        hostEmail: "host_w15@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
        theme: "Himalayan Forest Romance",
        dressCode: "Warm Pahadi Ethnic / Shawls & Woolen Kurta",
        ethnicity: "Garhwali Hindu",
        traditions: [
          { name: "Jhora Folk Dance", description: "Community circle dance celebrating mountain harvest and new union." },
          { name: "Pahadi Feast", description: "Authentic Kumaoni/Garhwali thali featuring Kafuli and Bal Mithai." },
        ],
      },
      {
        id: "w16",
        slug: "mumbai-marine-drive-wedding",
        title: "Mumbai Marine Drive Rooftop Wedding",
        description: "A sleek cosmopolitan wedding overlooking Mumbai's Queens Necklace at Marine Drive. Skyline cocktail lounge, Bollywood celebrity DJ, and gourmet global dining.",
        location: "The InterContinental, Marine Drive, Mumbai, Maharashtra",
        category: "Destination",
        date: new Date("2027-12-10"),
        pricePerGuest: 15999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Sameer & Neha Deshmukh",
        hostEmail: "host_w16@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
        theme: "Mumbai Skyline Glamour",
        dressCode: "Modern Designer Indo-Western / Cocktail Gown",
        ethnicity: "Maharashtrian Cosmopolitan",
        traditions: [
          { name: "Sunset Rooftop Vows", description: "Ceremony against the glowing Arabian Sea and Mumbai city lights." },
          { name: "Bollywood Sangeet Night", description: "Choreographed celebrity-style dance night with live saxophonist." },
        ],
      },
      {
        id: "w17",
        slug: "ladakh-mountain-monastery-wedding",
        title: "Ladakh Monastery Mountain Wedding",
        description: "An extraordinary high-altitude wedding in the Himalayan valley of Leh. Buddhist monk blessings at Thiksey Monastery, butter tea toasts, and starry mountain campfires.",
        location: "The Grand Dragon & Thiksey Monastery, Leh, Ladakh",
        category: "Nature",
        date: new Date("2027-12-28"),
        pricePerGuest: 17499,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Stanzin & Sonam Namgyal",
        hostEmail: "host_w17@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
        theme: "Himalayan Spiritual Mystique",
        dressCode: "Ladakhi Goncha with Turquoise Jewelry",
        ethnicity: "Ladakhi Buddhist",
        traditions: [
          { name: "Monastery Blessing", description: "Chanting and silk scarf (Khata) offering by senior Buddhist lamas." },
          { name: "Stargazing Campfire", description: "Night bonfire at 11,000 feet under the Milky Way." },
        ],
      },
      {
        id: "w18",
        slug: "ooty-nilgiris-tea-garden-wedding",
        title: "Ooty Nilgiris Tea Garden Wedding",
        description: "A colonial-charm hill station wedding amidst rolling tea gardens in Ooty. British-era estate lawns, homemade chocolates, eucalyptus fires, and South Indian fusion banquets.",
        location: "Savoy - IHCL SeleQtions, Ooty, Tamil Nadu",
        category: "Nature",
        date: new Date("2028-01-15"),
        pricePerGuest: 10999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Nitin & Radhika Gowder",
        hostEmail: "host_w18@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80",
        theme: "Nilgiri Estate Elegance",
        dressCode: "Pastel Silk Saree / Suit with Tweed Jacket",
        ethnicity: "Badaga & Tamil Heritage",
        traditions: [
          { name: "Tea Garden High Tea", description: "Artisanal Nilgiri tea tasting and homemade chocolate fountain." },
          { name: "Lawn Mandap Vows", description: "Garden arbor vows framed by cedar trees and tea plantations." },
        ],
      },
      {
        id: "w19",
        slug: "pondicherry-french-quarter-wedding",
        title: "Pondicherry French Quarter Wedding",
        description: "A chic Franco-Tamil fusion wedding in the yellow cobblestone streets of White Town, Pondicherry. Bougainvillea courtyards, French wine toasts, and Chettinad gourmet dining.",
        location: "La Villa & Palais de Mahe, Pondicherry",
        category: "Destination",
        date: new Date("2028-02-04"),
        pricePerGuest: 12499,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Pierre & Lakshmi Gautier",
        hostEmail: "host_w19@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80",
        theme: "Franco-Tamil Creole Romance",
        dressCode: "Chic Indo-French Smart Casual / Silk Gown",
        ethnicity: "Franco-Tamil Creole",
        traditions: [
          { name: "French Quarter Parade", description: "Bicycle and vintage car procession through historic White Town." },
          { name: "Creole Banquet", description: "Fusion feast combining French culinary technique with Chettinad spices." },
        ],
      },
      {
        id: "w20",
        slug: "rajasthan-desert-camp-wedding",
        title: "Rajasthan Desert Camp Night Wedding",
        description: "An enchanting night wedding in the Thar Desert — luxury tented camps at Sam Sand Dunes, folk puppet shows, camel safaris, and a bonfire celebration under a billion desert stars.",
        location: "Sam Sand Dunes, Jaisalmer, Rajasthan",
        category: "Royal",
        date: new Date("2028-02-22"),
        pricePerGuest: 13499,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=1200&q=80",
        status: "PUBLISHED",
        featured: false,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Yuvraj & Divya Bhati",
        hostEmail: "host_w20@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
        theme: "Desert Night Mystique",
        dressCode: "Rajasthani Ethnic / Bohemian Desert Chic",
        ethnicity: "Rajasthani Bhati",
        traditions: [
          { name: "Puppet Theater", description: "Traditional Rajasthani Kathputli puppet show narrating the couple's love story." },
          { name: "Desert Baraat", description: "Groom's arrival on camelback through the golden dunes at sunset." },
          { name: "Bonfire Pheras", description: "Sacred vows around a desert bonfire with 500 lanterns released into the night sky." },
        ],
      },
      {
        id: "w21",
        slug: "kerala-backwater-wedding",
        title: "Kerala Backwater Luxury Palms Matrimony",
        description: "An authentic coastal Kerala matrimony experience on coconut-palm fringed houseboats in Kumarakom with traditional Sadya, Kathakali, and temple rituals.",
        location: "Zuri Kumarakom Resort & Spa, Kottayam, Kerala",
        category: "Destination",
        date: new Date("2028-03-14"),
        pricePerGuest: 11999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80",
        status: "PUBLISHED",
        featured: true,
        sponsored: false,
        isDemo: true,
        hostCoupleName: "Rahul & Sunitha Menon",
        hostEmail: "host_w21@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80",
        theme: "Kerala Palm Grove Romance",
        dressCode: "Kasavu Saree / Cream Mundu with Gold Border",
        ethnicity: "Malayali Hindu",
        traditions: [
          { name: "Thalikettu", description: "Sacred tying of the thali necklace at auspicious Muhurtham." },
          { name: "Sadya Banquet", description: "Traditional 24-item vegetarian feast served on banana leaves." },
        ],
      },
      {
        id: "w23",
        slug: "shimla-himalayan-pine-royal-wedding",
        title: "Shimla Himalayan Pine Forest Royal Celebration",
        description: "An extraordinary mountain luxury wedding set amidst the fragrant pine forests and colonial heritage estates of Shimla. Features Pahadi royal rituals, apple orchard dining, live Sitar melodies, and star-lit hill campfires.",
        location: "Wildflower Hall, An Oberoi Resort, Shimla, Himachal Pradesh",
        category: "Royal",
        date: new Date("2028-05-18"),
        pricePerGuest: 16999,
        capacity: 0,
        mainImageUrl: "https://images.unsplash.com/photo-1640953148126-1962ec17a92b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        status: "PUBLISHED",
        featured: true,
        sponsored: true,
        isDemo: true,
        hostCoupleName: "Vikramaditya & Gayatri Himachal",
        hostEmail: "host_w23@weddingwithindia.com",
        hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        theme: "Himalayan Pine & Gold Royalty",
        dressCode: "Velvet Sherwani & Traditional Himachali Dhatu / Silk Saree",
        ethnicity: "Himachali Rajput Royalty",
        traditions: [
          { name: "Pahadi Royal Procession", description: "Groom's grand arrival accompanied by traditional Karnal trumpets and dhol drums." },
          { name: "Dham Culinary Feast", description: "Authentic multi-course Himachali Dham cooked by traditional Botis in brass cauldrons." },
          { name: "Pine Forest Pheras", description: "Sacred fire pheras framed by ancient cedar trees overlooking snow-capped peaks." },
        ],
      },
    ];

    // Bulk reconcile all existing non-demo records so 100% of marketplace inventory is isDemo=true & capacity=0
    await prisma.wedding.updateMany({
      data: { isDemo: true, capacity: 0 }
    });

    for (const wData of demoWeddingsData) {
      // 1. Create/Upsert Unique Host User & Couple Profile
      const hUser = await prisma.user.upsert({
        where: { email: wData.hostEmail },
        update: { name: wData.hostCoupleName, avatar: wData.hostAvatar },
        create: {
          clerkUserId: `user_${wData.id}_seed`,
          email: wData.hostEmail,
          name: wData.hostCoupleName,
          role: "COUPLE",
          status: "ACTIVE",
          avatar: wData.hostAvatar,
        },
      });

      const hProfile = await prisma.coupleProfile.upsert({
        where: { userId: hUser.id },
        update: {},
        create: {
          userId: hUser.id,
          weddingDate: wData.date,
          weddingLocation: wData.location,
          expectedGuests: 300,
          languagesSpoken: "English, Hindi",
          familyBio: `The ${wData.hostCoupleName} family welcomes global guests to experience authentic ${wData.ethnicity} hospitality.`,
        },
      });

      // 2. Upsert Wedding linked to its UNIQUE Host Profile
      const wedding = await prisma.wedding.upsert({
        where: { slug: wData.slug },
        update: {
          hostCoupleId: hProfile.id,
          title: wData.title,
          description: wData.description,
          location: wData.location,
          category: wData.category,
          date: wData.date,
          pricePerGuest: wData.pricePerGuest,
          mainImageUrl: wData.mainImageUrl,
          status: wData.status,
          featured: wData.featured,
          sponsored: wData.sponsored ?? false,
          isDemo: true,
          capacity: 0,
        },
        create: {
          id: wData.id,
          hostCoupleId: hProfile.id,
          slug: wData.slug,
          title: wData.title,
          description: wData.description,
          location: wData.location,
          category: wData.category,
          date: wData.date,
          pricePerGuest: wData.pricePerGuest,
          capacity: 0,
          mainImageUrl: wData.mainImageUrl,
          status: wData.status,
          featured: wData.featured,
          sponsored: wData.sponsored ?? false,
          isDemo: true,
          theme: wData.theme,
          dressCode: wData.dressCode,
          ethnicity: wData.ethnicity,
          gallery: {
            create: [
              { imageUrl: wData.mainImageUrl, order: 0 },
            ],
          },
          events: {
            create: [
              {
                name: "Mehndi & Sangeet Gala",
                description: "Evening of henna art, live folk music, and choreographed dances.",
                date: wData.date,
                startTime: "17:00",
                endTime: "22:00",
                location: wData.location,
              },
            ],
          },
          traditions: {
            create: wData.traditions.map((t) => ({
              name: t.name,
              description: t.description,
            })),
          },
        },
      });

      console.log(`   ✓ Curated Wedding Created/Updated: "${wedding.title}" (${wedding.slug}) — host: ${wData.hostCoupleName}, date: ${wData.date.toISOString().split("T")[0]}, isDemo: true, capacity: 0`);
    }

    // ------------------------------------------------------------------------
    // 4. SEED DEMO BOOKINGS & GUEST PASSES
    // ------------------------------------------------------------------------
    console.log("\n4. Seeding Demo Bookings, Passes & Preparations...");
    const targetWedding = await prisma.wedding.findFirst({ where: { slug: "grand-maharaja-wedding" } });
    if (targetWedding) {
      const demoBooking = await prisma.booking.upsert({
        where: { id: "booking-demo-1" },
        update: {},
        create: {
          id: "booking-demo-1",
          weddingId: targetWedding.id,
          travelerId: guestProfile.id,
          date: targetWedding.date,
          guestsCount: 2,
          pricePerGuest: targetWedding.pricePerGuest,
          totalAmount: targetWedding.pricePerGuest * 2,
          status: "APPROVED",
        },
      });

      await prisma.guestPass.upsert({
        where: { id: "pass-demo-1" },
        update: {},
        create: {
          id: "pass-demo-1",
          bookingId: demoBooking.id,
          passCode: "PASS-VIP-999",
          qrTokenHash: "TOKEN_HASH_DEMO_999",
          status: "ACTIVE",
        },
      });

      // Demo Review
      await prisma.review.upsert({
        where: { id: "rev-demo-1" },
        update: {},
        create: {
          id: "rev-demo-1",
          booking: { connect: { id: demoBooking.id } },
          traveler: { connect: { id: guestProfile.id } },
          rating: 5,
          comment: "Attending the wedding at Umaid Bhawan was the absolute highlight of our trip to India! The warmth of the family, the food, and the cultural immersion were unmatched.",
          ratingCulture: 5,
          ratingHospitality: 5,
          ratingSafety: 5,
          status: "APPROVED",
        },
      });
    }

    // ------------------------------------------------------------------------
    // 5. SEED WISHLISTS, NOTIFICATIONS & AUDIT LOGS
    // ------------------------------------------------------------------------
    console.log("\n5. Seeding Wishlists, Notifications & Audit Logs...");
    if (targetWedding) {
      await prisma.wishlist.upsert({
        where: {
          travelerId_weddingId: {
            travelerId: guestProfile.id,
            weddingId: targetWedding.id,
          },
        },
        update: {},
        create: {
          traveler: { connect: { id: guestProfile.id } },
          wedding: { connect: { id: targetWedding.id } },
        },
      });
    }

    await prisma.notification.upsert({
      where: { id: "notif-demo-1" },
      update: {},
      create: {
        id: "notif-demo-1",
        userId: guestUser.id,
        title: "Pass Approved!",
        message: "Your guest pass for The Grand Maharaja Wedding has been approved by the host.",
        type: "BOOKING_APPROVED",
        read: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: superAdmin.id,
        userName: superAdmin.name || "Super Admin",
        action: "SEED_MASTER_BOOTSTRAP",
        entity: "SYSTEM",
        entityId: "SYSTEM_GLOBAL",
        details: JSON.stringify({ message: "Master Database Seed execution completed with 22 unique curated listings." }),
      },
    });

    console.log("\n--------------------------------------------------");
    console.log("✅ Master Database Seeding Completed Successfully!");
    console.log("--------------------------------------------------");
    const finalUserCount = await prisma.user.count();
    const finalWeddingCount = await prisma.wedding.count();
    const finalBookingCount = await prisma.booking.count();
    const finalReviewCount = await prisma.review.count();

    console.log(`  Users: ${finalUserCount}`);
    console.log(`  Weddings: ${finalWeddingCount}`);
    console.log(`  Bookings: ${finalBookingCount}`);
    console.log(`  Reviews: ${finalReviewCount}`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMasterData();
