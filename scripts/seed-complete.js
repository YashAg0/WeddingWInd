/**
 * WeddingWithIndia — Master Database Seeder
 * Seeds a complete, interconnected demonstration ecosystem with Super Admin, Admin, 21 Unique Hosts, Guest, Agent, Coordinator,
 * 21 Unique Curated Multi-Day Weddings, Events, Traditions, Galleries, Bookings, Guest Passes, Reviews, Payments, Commissions, and Verifications.
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

const DEMO_WEDDINGS = [
  {
    id: "w1",
    slug: "grand-maharaja-wedding",
    title: "Rajasthan Royal Heritage Celebration",
    description: "Spend five days alongside an authentic family celebration in Jodhpur. Experience welcome gatherings, traditional folk performances, and sacred wedding ceremonies in a heritage palace setting.",
    location: "Umaid Bhawan Palace, Jodhpur, Rajasthan",
    category: "Royal",
    tier: "SIGNATURE_ROYAL",
    durationDays: 5,
    religion: "Hindu",
    region: "Rajasthan",
    community: "Marwari Rajput",
    capacity: 20,
    pricePerGuest: 1199,
    status: "PUBLISHED",
    featured: true,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Devika & Kaber Singhania",
    hostEmail: "host_w1@weddingwithindia.com",
    hostAvatar: "https://plus.unsplash.com/premium_photo-1691030255435-c1f4c3f5542e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mainImageUrl: "https://plus.unsplash.com/premium_photo-1691030255435-c1f4c3f5542e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    theme: "Royal Marwari Heritage",
    dressCode: "Festive Indian Royal Attire / Black Tie",
    ethnicity: "Marwari Rajput",
    events: [
      { name: "Day 1: Family Welcome & Evening Gathering", description: "Arrival of guests, welcome tea, traditional folk musicians, and courtyard dinner.", startTime: "16:00", endTime: "21:00", dayOffset: 0 },
      { name: "Day 2: Pre-Wedding Cultural Celebrations", description: "Daytime cultural activities, floral decorations, and regional culinary stalls.", startTime: "11:00", endTime: "15:00", dayOffset: 1 },
      { name: "Day 3: Musical Evening & Sangeet", description: "Choreographed family dances, live folk orchestra, and evening banquet.", startTime: "18:00", endTime: "23:00", dayOffset: 2 },
      { name: "Day 4: Traditional Baraat & Mandap Pheras", description: "Baraat assembly, sacred vows around the holy fire with English cultural commentary, and dinner.", startTime: "16:30", endTime: "22:00", dayOffset: 3 },
      { name: "Day 5: Royal Gala Banquet & Farewell", description: "Congratulatory dinner, toasts, fireworks, and farewell blessing.", startTime: "19:00", endTime: "23:30", dayOffset: 4 }
    ],
    traditions: [
      { name: "Baraat Procession", description: "Groom's grand arrival accompanied by brass band and dancing family." },
      { name: "Saptapadi Vows", description: "Seven sacred vows taken together around the holy Agni fire." }
    ]
  },
  {
    id: "w23",
    slug: "shimla-himalayan-pine-royal-wedding",
    title: "Shimla Himalayan Pine Forest Royal Celebration",
    description: "A highland royal wedding at Wildflower Hall, Shimla amidst pine forests, featuring Himachali Nati folk dances, cedar grove pheras, and Oberoi Dham banquets across 5 unforgettable days.",
    location: "Wildflower Hall, An Oberoi Resort, Shimla, Himachal Pradesh",
    category: "Royal",
    tier: "SIGNATURE_ROYAL",
    durationDays: 5,
    religion: "Regional / Cultural",
    region: "Himachal Pradesh",
    community: "Himachali Rajput",
    capacity: 16,
    pricePerGuest: 1199,
    status: "PUBLISHED",
    featured: true,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Vikramaditya & Gayatri",
    hostEmail: "host_w23@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1694712282503-0d6dc921cfdd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mainImageUrl: "https://images.unsplash.com/photo-1694712282503-0d6dc921cfdd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    theme: "Pahadi Royal Pine Forest",
    dressCode: "Festive Velvet Sherwani / Silk Dhatu Saree",
    ethnicity: "Himachali Rajput",
    events: [
      { name: "Day 1: Himalayan Welcome High Tea", description: "Arrival tea with mountain views and acoustic Himachali flute.", startTime: "15:00", endTime: "18:30", dayOffset: 0 },
      { name: "Day 2: Pine Forest Meadow Gathering", description: "Cultural storytelling and Pahari folk music under cedar trees.", startTime: "11:00", endTime: "15:00", dayOffset: 1 },
      { name: "Day 3: Himachali Nati Sangeet Night", description: "Nati folk dance circle around pine forest bonfire.", startTime: "17:30", endTime: "21:30", dayOffset: 2 },
      { name: "Day 4: Cedar Grove Mandap Pheras", description: "Vedic vows in open cedar grove overlooking snow peaks.", startTime: "10:30", endTime: "13:30", dayOffset: 3 },
      { name: "Day 5: Oberoi Estate Dham Banquet", description: "Authentic multi-course Himachali Dham feast served on brass thalis.", startTime: "18:30", endTime: "22:30", dayOffset: 4 }
    ],
    traditions: [
      { name: "Himachali Nati Dance", description: "Folk dance celebrating harvest and union." },
      { name: "Dham Banquet", description: "Traditional seated brass plate feast." }
    ]
  },
  {
    id: "w6",
    slug: "punjabi-amritsar-golden-wedding",
    title: "Punjabi Sikh Wedding Experience",
    description: "Four days of vibrant Punjabi warmth in Amritsar, featuring lively Dhol drumming, colorful family folk dances, the sacred Anand Karaj ceremony in a Gurdwara, and celebratory banquets.",
    location: "Welcomhotel by ITC Hotels, Amritsar, Punjab",
    category: "Traditional",
    tier: "ROYAL",
    durationDays: 4,
    religion: "Sikh",
    region: "Punjab",
    community: "Punjabi Sikh",
    capacity: 16,
    pricePerGuest: 799,
    status: "PUBLISHED",
    featured: true,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Gurpreet & Harleen Dhillon",
    hostEmail: "host_w6@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1671531776382-f32dff368120?q=80&w=734&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mainImageUrl: "https://images.unsplash.com/photo-1671531776382-f32dff368120?q=80&w=734&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    theme: "Sacred Punjabi Heritage",
    dressCode: "Punjabi Kurta Pajama / Turban / Salwar Kameez",
    ethnicity: "Punjabi Sikh",
    events: [
      { name: "Day 1: Farmstead Welcome Dinner", description: "Traditional tandoori dinner and Punjabi folk welcome.", startTime: "17:00", endTime: "22:00", dayOffset: 0 },
      { name: "Day 2: Jaggo & Sangeet Night", description: "High-energy Dhol beats, Jaggo procession, and family choreography.", startTime: "18:00", endTime: "23:30", dayOffset: 1 },
      { name: "Day 3: Sacred Anand Karaj & Langar", description: "Solemn four Laavan hymns in the Gurdwara followed by equality community Langar.", startTime: "09:00", endTime: "14:00", dayOffset: 2 },
      { name: "Day 4: Grand Reception Banquet", description: "Celebratory banquet dinner, toasts, and cultural music.", startTime: "19:00", endTime: "23:45", dayOffset: 3 }
    ],
    traditions: [
      { name: "Laavan (Anand Karaj)", description: "Four sacred hymns binding the couple in spiritual matrimony." },
      { name: "Guru Ka Langar", description: "Equality community meal served in the Gurdwara." }
    ]
  },
  {
    id: "w14",
    slug: "hyderabad-nizam-wedding",
    title: "Hyderabad Nizam Heritage Wedding",
    description: "An opulent Nizami celebration at Taj Falaknuma Palace across 4 days, featuring 101-seat dining table banquets, Hyderabadi Dum Biryani, and classical Ghazal performances.",
    location: "Taj Falaknuma Palace, Hyderabad, Telangana",
    category: "Royal",
    tier: "ROYAL",
    durationDays: 4,
    religion: "Muslim",
    region: "Telangana",
    community: "Hyderabadi Nizam Heritage",
    capacity: 14,
    pricePerGuest: 799,
    status: "PUBLISHED",
    featured: true,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Zaid & Nusrat Farooqui",
    hostEmail: "host_w14@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1726694064556-c9565e8e81c9?q=80&w=696&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mainImageUrl: "https://images.unsplash.com/photo-1726694064556-c9565e8e81c9?q=80&w=696&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    theme: "Royal Nizami Splendor",
    dressCode: "Sherwani / Khada Dupatta / Royal Silk",
    ethnicity: "Hyderabadi Muslim",
    events: [
      { name: "Day 1: Falaknuma Palace Dastarkhwan Welcome", description: "Palace terrace welcome tea overlooking old Hyderabad.", startTime: "17:30", endTime: "21:30", dayOffset: 0 },
      { name: "Day 2: Manjha & Classical Ghazal Night", description: "Live sarangi and ghazal recitals in the Jade Room.", startTime: "18:30", endTime: "23:00", dayOffset: 1 },
      { name: "Day 3: Sacred Nikah & Arsi Mushaf Ceremony", description: "Traditional wedding vows and mirror ceremony.", startTime: "16:00", endTime: "20:00", dayOffset: 2 },
      { name: "Day 4: Grand Dawat-e-Walima", description: "Grand banquet at the world-famous 101-seat table.", startTime: "19:00", endTime: "23:30", dayOffset: 3 }
    ],
    traditions: [
      { name: "Nikah Ceremony", description: "Sacred Islamic matrimonial contract with mutual consent." },
      { name: "Dawat-e-Walima", description: "Sumptuous host wedding banquet." }
    ]
  },
  {
    id: "w17",
    slug: "ladakh-monastery-mountain-wedding",
    title: "Ladakh Monastery Mountain Wedding",
    description: "A sacred Buddhist celebration in Leh overlooking snow peaks across 4 days, featuring monastic chants, Khatak silk scarf blessings, and authentic Ladakhi banquets.",
    location: "The Grand Dragon Ladakh & Thiksey Monastery, Leh, Ladakh",
    category: "Destination",
    tier: "ROYAL",
    durationDays: 4,
    religion: "Buddhist",
    region: "Ladakh",
    community: "Ladakhi Buddhist",
    capacity: 12,
    pricePerGuest: 799,
    status: "PUBLISHED",
    featured: true,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Stanzin & Rigzin Norbu",
    hostEmail: "host_w17@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1781015878406-39a0008389b7?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1781015878406-39a0008389b7?w=1200&q=80&auto=format&fit=crop",
    theme: "High Altitude Monastic Blessing",
    dressCode: "Traditional Ladakhi Goncha / Warm Formalwear",
    ethnicity: "Ladakhi Buddhist",
    events: [
      { name: "Day 1: High-Altitude Acclimatization High Tea", description: "Warm butter tea and Apricot kernel snacks in Leh.", startTime: "15:00", endTime: "18:00", dayOffset: 0 },
      { name: "Day 2: Thiksey Monastery Blessing & Chants", description: "Sacred prayers by Buddhist monks inside century-old gompa.", startTime: "09:00", endTime: "12:30", dayOffset: 1 },
      { name: "Day 3: Khatak Offering & Jabro Folk Dance", description: "Silk scarf offerings and community circle dance.", startTime: "14:00", endTime: "18:00", dayOffset: 2 },
      { name: "Day 4: Himalayan Sunset Cultural Banquet", description: "Traditional Ladakhi Feast under starry trans-Himalayan skies.", startTime: "18:00", endTime: "22:00", dayOffset: 3 }
    ],
    traditions: [
      { name: "Khatak Presentation", description: "White silk scarf blessing signifying purity and auspiciousness." },
      { name: "Monastic Sutra Chanting", description: "Ancient Buddhist harmonic blessings." }
    ]
  },
  {
    id: "02f25432-f475-49d4-99ca-b88258a86711",
    slug: "lakeside-rajput-celebration",
    title: "Lakeside Rajput Celebration",
    description: "A romantic 3-day wedding on Lake Pichola, Udaipur featuring sunset boat processions, classical shehnai recitals, and lakeside fine dining under the stars.",
    location: "Jagmandir Island Palace, Udaipur, Rajasthan",
    category: "Royal",
    tier: "GRAND",
    durationDays: 3,
    religion: "Hindu",
    region: "Rajasthan",
    community: "Mewari Rajput",
    capacity: 16,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: true,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Aditya & Sanjana Rathore",
    hostEmail: "host_w2@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1598875206191-5f88198c0a35?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1598875206191-5f88198c0a35?w=1200&q=80&auto=format&fit=crop",
    theme: "Lakeside Romance & Heritage",
    dressCode: "Traditional Elegant Ethnic",
    ethnicity: "Mewari Rajput",
    events: [
      { name: "Day 1: Lake Pichola Sunset Boat Procession", description: "Boat transfer and shehnai musical welcome.", startTime: "17:00", endTime: "21:00", dayOffset: 0 },
      { name: "Day 2: Royal Sangeet & Ghoomar Night", description: "Choreographed folk performances under palace arches.", startTime: "18:30", endTime: "23:00", dayOffset: 1 },
      { name: "Day 3: Lakeside Pheras & Gala Dinner", description: "Sacred vows by the water followed by candlelit island feast.", startTime: "17:00", endTime: "22:30", dayOffset: 2 }
    ],
    traditions: [
      { name: "Sunset Boat Procession", description: "Arrival across calm waters of Lake Pichola." },
      { name: "Ghoomar Performance", description: "Imperial Rajasthani dance by court artists." }
    ]
  },
  {
    id: "w3",
    slug: "kerala-coastal-christian-matrimony",
    title: "Kerala Coastal Christian Matrimony",
    description: "An elegant 3-day Syrian Christian wedding in Kumarakom featuring backwater houseboats, church choir nuptials, Margamkali folk dance, and a 28-course coastal banquet.",
    location: "Kumarakom Lake Resort, Alleppey, Kerala",
    category: "Nature",
    tier: "GRAND",
    durationDays: 3,
    religion: "Christian",
    region: "Kerala",
    community: "Saint Thomas Christian",
    capacity: 12,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: true,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Karan & Meera Nambiar",
    hostEmail: "host_w3@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1581704723043-70c2216277de?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mainImageUrl: "https://images.unsplash.com/photo-1581704723043-70c2216277de?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    theme: "Backwater Serenity & Ancient Heritage",
    dressCode: "Kasavu Silk / Pastel Formal",
    ethnicity: "Malayali Christian",
    events: [
      { name: "Day 1: Sunset Houseboat Welcome Cruise", description: "Cruise through palm-lined backwaters with tender coconut welcome.", startTime: "16:00", endTime: "20:00", dayOffset: 0 },
      { name: "Day 2: Traditional Church Nuptials & Minnu", description: "Solemn church service and tying of the sacred Minnu pendant.", startTime: "10:30", endTime: "14:30", dayOffset: 1 },
      { name: "Day 3: Lakeside Grand Reception & Margamkali", description: "Live Christian folk dance, violin orchestra, and coastal banquet.", startTime: "18:00", endTime: "22:30", dayOffset: 2 }
    ],
    traditions: [
      { name: "Minnu Tying", description: "Tying of the leaf-shaped gold pendant containing 21 tiny beads." },
      { name: "Margamkali Dance", description: "Ancient devotional Syrian Christian circle dance." }
    ]
  },
  {
    id: "w10",
    slug: "kolkata-bengali-heritage-wedding",
    title: "Kolkata Bengali Heritage Wedding",
    description: "A cultural 3-day celebration in a North Kolkata Rajbari, featuring the famous Shubho Drishti eye-contact ritual, Saat Paake Ghorar circles, and a 6-course royal Bengali feast.",
    location: "Sovabazar Rajbari, Kolkata, West Bengal",
    category: "Traditional",
    tier: "GRAND",
    durationDays: 3,
    religion: "Hindu",
    region: "West Bengal",
    community: "Bengali",
    capacity: 12,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Sourav & Rupa Banerjee",
    hostEmail: "host_w10@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1720105761851-fa63513a1941?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1720105761851-fa63513a1941?w=1200&q=80&auto=format&fit=crop",
    theme: "Vintage Rajbari Nobility",
    dressCode: "Dhakai Jamdani / Tussar Silk Panjabi",
    ethnicity: "Bengali",
    events: [
      { name: "Day 1: Aiburobhat Family Welcome", description: "Traditional pre-wedding bachelor meal and Rabindrasangeet recital.", startTime: "17:00", endTime: "21:00", dayOffset: 0 },
      { name: "Day 2: Gaye Holud & Sangeet", description: "Turmeric ceremony and Kolkata Baul folk music night.", startTime: "10:00", endTime: "15:00", dayOffset: 1 },
      { name: "Day 3: Sacred Saat Paake Ghora & Feast", description: "Shubho Drishti, Saat Paake Ghora, Sindoor Daan, and royal multi-course dinner.", startTime: "17:30", endTime: "23:00", dayOffset: 2 }
    ],
    traditions: [
      { name: "Shubho Drishti", description: "First auspicious eye contact between bride and groom amidst betel leaf unveiling." },
      { name: "Saat Paake Ghora", description: "Bride carried around the groom seven times on a wooden piri stool." }
    ]
  },
  {
    id: "w12",
    slug: "kashmir-dal-lake-houseboat-wedding",
    title: "Kashmir Dal Lake Houseboat Wedding",
    description: "A tranquil 3-day paradise celebration on Dal Lake with carved Shikaras, floating lotus flower mandaps, Sufiana Kalam music, and an elaborate 36-course Kashmiri Wazwan feast.",
    location: "The Lalit Grand Palace & Dal Lake, Srinagar, Kashmir",
    category: "Destination",
    tier: "GRAND",
    durationDays: 3,
    religion: "Interfaith / Multicultural",
    region: "Kashmir",
    community: "Kashmiri",
    capacity: 12,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Tariq & Bushra Dar",
    hostEmail: "host_w12@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1719857646787-38c9c5f79312?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mainImageUrl: "https://images.unsplash.com/photo-1719857646787-38c9c5f79312?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    theme: "Floating Heaven on Dal Lake",
    dressCode: "Embroidered Kashmiri Pheran / Silk Tilla Formal",
    ethnicity: "Kashmiri",
    events: [
      { name: "Day 1: Sunset Shikara Welcome & Kahwa Tea", description: "Dal Lake canal cruise with saffron tea and walnut cookies.", startTime: "16:00", endTime: "19:00", dayOffset: 0 },
      { name: "Day 2: Sufiana Kalam Musical Evening", description: "Live Santoor and Rabab recitals with evening appetizers.", startTime: "18:00", endTime: "22:00", dayOffset: 1 },
      { name: "Day 3: Lakeside Nikkah & Royal Wazwan Banquet", description: "Floating mandap vows followed by authentic 36-dish Wazwan feast served in copper Traami.", startTime: "15:00", endTime: "22:30", dayOffset: 2 }
    ],
    traditions: [
      { name: "Kashmiri Wazwan Feast", description: "Lavish royal multi-dish culinary feast cooked by master Wazas." },
      { name: "Shikara Flotilla", description: "Bridal procession on flower-bedecked cedar wood boats." }
    ]
  },
  {
    id: "w15",
    slug: "uttarakhand-himalayan-meadow-wedding",
    title: "Uttarakhand Mountain Meadow Wedding",
    description: "An alpine Himalayan wedding in Mussoorie amidst rolling pine forests and wildflower meadows across 3 days, featuring Garhwali folk dances, open-sky Vedic vows, and mountain Dham feasts.",
    location: "JW Marriott Walnut Grove, Mussoorie, Uttarakhand",
    category: "Nature",
    tier: "GRAND",
    durationDays: 3,
    religion: "Regional / Cultural",
    region: "Uttarakhand",
    community: "Garhwali",
    capacity: 14,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Devendra & Smriti Rawat",
    hostEmail: "host_w15@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1648724145806-2dd46cd02ea6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mainImageUrl: "https://images.unsplash.com/photo-1648724145806-2dd46cd02ea6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    theme: "Garhwali Alpine Serenity",
    dressCode: "Pahari Woolen Velvet / Gold Nath Attire",
    ethnicity: "Garhwali",
    events: [
      { name: "Day 1: Alpine Meadow Welcome & Herbal Tea", description: "Mountain welcome gathering with fresh rhododendron drinks.", startTime: "15:30", endTime: "19:00", dayOffset: 0 },
      { name: "Day 2: Pine Forest Sangeet & Folk Dance", description: "Garhwali Jhora and Chholiya folk dancers with live dhol-damau.", startTime: "17:00", endTime: "21:30", dayOffset: 1 },
      { name: "Day 3: Mountain Meadow Pheras & Garhwali Feast", description: "Sacred fire vows overlooking Doon valley followed by mountain feast.", startTime: "10:30", endTime: "15:30", dayOffset: 2 }
    ],
    traditions: [
      { name: "Chholiya Sword Dance", description: "Ancient martial folk dance performed to ward off evil spirits." },
      { name: "Pahari Kanyadaan", description: "Sacred wedding blessings amidst Himalayan vistas." }
    ]
  },
  {
    id: "w18",
    slug: "ooty-nilgiris-tea-garden-wedding",
    title: "Ooty Nilgiris Tea Garden Wedding",
    description: "A heritage British colonial era tea plantation wedding in the misty Nilgiris of Ooty across 3 days, with vintage carriage arrivals, tea estate walks, and Badaga cultural dances.",
    location: "Savoy - IHCL SeleQtions, Ooty, Tamil Nadu",
    category: "Nature",
    tier: "GRAND",
    durationDays: 3,
    religion: "Regional / Cultural",
    region: "Tamil Nadu",
    community: "Badaga / Anglo-Indian",
    capacity: 10,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Clarence & Ananya Stirling",
    hostEmail: "host_w18@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1727430256509-0f897d6f4765?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1727430256509-0f897d6f4765?w=1200&q=80&auto=format&fit=crop",
    theme: "Colonial High Tea & Nilgiri Mist",
    dressCode: "Vintage Tweed / Pastel Chiffon Saree",
    ethnicity: "Anglo-Tamil",
    events: [
      { name: "Day 1: Tea Garden High Tea & Lawn Croquet", description: "Fresh Nilgiri single-estate tea, scones, and vintage lawn gathering.", startTime: "15:00", endTime: "18:30", dayOffset: 0 },
      { name: "Day 2: Nilgiri Mist Dinner & Acoustic Jazz", description: "Candlelit fireplace dinner with live acoustic strings.", startTime: "18:30", endTime: "22:30", dayOffset: 1 },
      { name: "Day 3: Heritage Chapel Vows & Garden Soiree", description: "Historic stone church ceremony followed by open garden banquet.", startTime: "11:00", endTime: "16:00", dayOffset: 2 }
    ],
    traditions: [
      { name: "Victorian High Tea Reception", description: "Classic tea service celebrating Anglo-Indian heritage." },
      { name: "Badaga Folk Blessing", description: "Indigenous Nilgiri community songs and blessings." }
    ]
  },
  {
    id: "w4",
    slug: "goan-sunset-beach-nuptials",
    title: "Goan Sunset Beach Nuptials",
    description: "A lively 2-day beach wedding in North Goa featuring barefoot sunset vows, live jazz & fado music, and a beachside seafood barbecue banquet.",
    location: "Riva Beach Resort, Mandrem, Goa",
    category: "Beach",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Christian",
    region: "Goa",
    community: "Goan Catholic",
    capacity: 10,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: true,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Rohan & Alisha D'Souza",
    hostEmail: "host_w4@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1728348471845-c7ffa602161a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mainImageUrl: "https://images.unsplash.com/photo-1728348471845-c7ffa602161a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    theme: "Bohemian Coastal Breeze",
    dressCode: "Linen Beach Formal / Flowy Pastel",
    ethnicity: "Goan Catholic",
    events: [
      { name: "Day 1: Sunset Beachside Vows & Toast", description: "Barefoot ceremony on Mandrem beach with violin duet.", startTime: "16:30", endTime: "19:30", dayOffset: 0 },
      { name: "Day 2: Beach Bonfire, Live Band & Barbecue", description: "Fresh Goan seafood grill, fado music, and seaside dancing.", startTime: "18:00", endTime: "23:00", dayOffset: 1 }
    ],
    traditions: [
      { name: "Beachside Ring Exchange", description: "Nuptial vows taken on the sand under a floral drift-wood altar." },
      { name: "Goan Fado & Mandó", description: "Traditional Portuguese-influenced Goan music and dancing." }
    ]
  },
  {
    id: "w13",
    slug: "coorg-coffee-plantation-wedding",
    title: "Coorg Coffee Plantation Wedding",
    description: "An authentic Kodava wedding in a lush Coorg coffee estate across 2 days, featuring the famous Ganga Pooje river ritual and authentic Pandi Curry feasts.",
    location: "Evolve Back, Chikkana Halli Estate, Coorg, Karnataka",
    category: "Nature",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Regional / Cultural",
    region: "Karnataka",
    community: "Kodava",
    capacity: 10,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Bopanna & Thanusha Muttappa",
    hostEmail: "host_w13@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1515766024017-689e434ef22b?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mainImageUrl: "https://images.unsplash.com/photo-1515766024017-689e434ef22b?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    theme: "Kodava Martial Grace & Coffee Fragrance",
    dressCode: "Kupya Chele / Kodagu Saree",
    ethnicity: "Kodava",
    events: [
      { name: "Day 1: Oorukooduva Family Dinner", description: "Welcome feast under canopy of tall shade trees.", startTime: "18:00", endTime: "22:00", dayOffset: 0 },
      { name: "Day 2: Dampathi Muhurtham & Ganga Pooje", description: "Sacred Kodava ceremony without priests, led by village elders.", startTime: "10:00", endTime: "15:00", dayOffset: 1 }
    ],
    traditions: [
      { name: "Dampathi Muhurtham", description: "Elders bless couple directly with rice shower." },
      { name: "Ganga Pooje", description: "Bride draws water from well and balances brass pots." }
    ]
  },
  {
    id: "w16",
    slug: "mumbai-skyline-rooftop-wedding",
    title: "Mumbai Marine Drive Rooftop Wedding",
    description: "A chic 2-day celebration at The Taj Mahal Palace, Mumbai featuring Arabian Sea sunset views, contemporary cocktail reception, and fine dining.",
    location: "The Taj Mahal Palace, Colaba, Mumbai",
    category: "Destination",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Interfaith / Multicultural",
    region: "Maharashtra",
    community: "Cosmopolitan Mumbai",
    capacity: 12,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Rohan & Rhea Mehta",
    hostEmail: "host_w16@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1776964176663-1a25a5bec514?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1776964176663-1a25a5bec514?w=1200&q=80&auto=format&fit=crop",
    theme: "Art Deco Chic & Sea Breeze",
    dressCode: "Black Tie / Indo-Western Fusion",
    ethnicity: "Urban Cosmopolitan",
    events: [
      { name: "Day 1: Gateway of India Sunset Soiree", description: "Rooftop gathering overlooking Arabian Sea.", startTime: "18:30", endTime: "22:30", dayOffset: 0 },
      { name: "Day 2: Grand Ballroom Reception & Dinner", description: "Modern fusion vows and ballroom banquet.", startTime: "19:00", endTime: "23:45", dayOffset: 1 }
    ],
    traditions: [
      { name: "Seafront Toast", description: "Champagne toast as the Sun sets behind the Gateway of India." },
      { name: "Indo-Western Fusion Vows", description: "Bespoke ceremony celebrating diverse heritages." }
    ]
  },
  {
    id: "w20",
    slug: "rajasthan-desert-camp-wedding",
    title: "Rajasthan Desert Camp Night Wedding",
    description: "A desert celebration in the golden dunes of Jaisalmer across 2 days, featuring camel caravans, Kalbelia fire dancers, and bonfire banquets under starry skies.",
    location: "Suryagarh Desert Resort, Jaisalmer, Rajasthan",
    category: "Destination",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Hindu",
    region: "Rajasthan",
    community: "Thar Desert Rajput",
    capacity: 12,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Kunal & Tanvi Bhati",
    hostEmail: "host_w20@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1640953146604-2596432ee1eb?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1640953146604-2596432ee1eb?w=1200&q=80&auto=format&fit=crop",
    theme: "Golden Oasis Dunes",
    dressCode: "Desert Royal / Vibrant Bandhej",
    ethnicity: "Rajasthani",
    events: [
      { name: "Day 1: Thar Sunset Caravan & Welcome", description: "Camel caravan arrival and folk dance around dunes.", startTime: "16:30", endTime: "21:00", dayOffset: 0 },
      { name: "Day 2: Desert Fort Pheras & Bonfire Feast", description: "Vows in illuminated sandstone courtyard and feast.", startTime: "17:00", endTime: "23:00", dayOffset: 1 }
    ],
    traditions: [
      { name: "Dune Caravan", description: "Spectacular guest caravan to desert pavilion." },
      { name: "Kalbelia Fire Dance", description: "Ancient Thar desert folk fire dance." }
    ]
  },
  {
    id: "w22",
    slug: "ahmedabad-heritage-pol-wedding",
    title: "Ahmedabad Heritage Pol Haveli Wedding",
    description: "A traditional Gujarati Jain wedding in a 300-year-old carved wooden haveli across 2 days, featuring vibrant Garba Raas and grand Gujarati Thalis.",
    location: "The House of MG, Old Ahmedabad, Gujarat",
    category: "Traditional",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Jain",
    region: "Gujarat",
    community: "Gujarati Jain",
    capacity: 8,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Chirag & Mansi Shah",
    hostEmail: "host_w22@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1735052712489-f45220126a0c?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1735052712489-f45220126a0c?w=1200&q=80&auto=format&fit=crop",
    theme: "UNESCO Pol Heritage Grace",
    dressCode: "Bandhani / Chaniya Choli / Kurta Kediya",
    ethnicity: "Gujarati Jain",
    events: [
      { name: "Day 1: Heritage Pol Garba & Raas Night", description: "High-energy circle dance with sticks in open courtyard.", startTime: "19:00", endTime: "23:00", dayOffset: 0 },
      { name: "Day 2: Sacred Jain Vivaha & Thali Feast", description: "Auspicious wedding vows and pure vegetarian Jain Thali.", startTime: "09:30", endTime: "15:00", dayOffset: 1 }
    ],
    traditions: [
      { name: "Garba Raas", description: "Traditional Gujarati circle dance celebrating union." },
      { name: "Pokhanu Welcome", description: "Joyous mother-in-law welcome at the entrance." }
    ]
  },
  {
    id: "w9",
    slug: "andaman-island-tropical-wedding",
    title: "Andaman Islands Tropical Beach Wedding",
    description: "An exotic island wedding on Havelock Island across 2 days, featuring sunset beach vows, seafood barbecues, and clear coral coastlines.",
    location: "Taj Exotica Resort & Spa, Havelock Island, Andaman",
    category: "Beach",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Interfaith / Multicultural",
    region: "Andaman and Nicobar Islands",
    community: "Coastal Island",
    capacity: 8,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Varun & Tanya D'Souza",
    hostEmail: "host_w9@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1682089781034-a214f5768d58?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1682089781034-a214f5768d58?w=1200&q=80&auto=format&fit=crop",
    theme: "Emerald Waters & Tropical Palms",
    dressCode: "Linen Beach Formal / Island Chic",
    ethnicity: "Coastal Island",
    events: [
      { name: "Day 1: Sunset Beach Vows & Barbecue", description: "Sunset vows on white sands with fresh tropical barbecue.", startTime: "16:30", endTime: "21:30", dayOffset: 0 },
      { name: "Day 2: Island Morning Coral Excursion & Brunch", description: "Reef boat excursion and farewell brunch.", startTime: "09:30", endTime: "13:30", dayOffset: 1 }
    ],
    traditions: [
      { name: "Beachside Ring Vows", description: "Matrimonial blessing on the secluded coastline." },
      { name: "Island Coconut Toast", description: "Traditional fresh coconut water toast to new beginnings." }
    ]
  },
  {
    id: "w8",
    slug: "tamil-brahmin-wedding-madurai",
    title: "Tamil Brahmin Madurai Meenakshi Wedding",
    description: "A sacred 1-day Tamil Brahmin wedding in Madurai featuring morning Vratham prayers, Oonjal swing ceremonies, Mangalya Dharanam, and banana leaf Ela Sadya.",
    location: "Heritage Madurai, Madurai, Tamil Nadu",
    category: "Traditional",
    tier: "STANDARD",
    durationDays: 1,
    religion: "Hindu",
    region: "Tamil Nadu",
    community: "Tamil Brahmin",
    capacity: 8,
    pricePerGuest: 149,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Karthik & Deepa Iyer",
    hostEmail: "host_w8@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1728221052130-810b42a6130e?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1728221052130-810b42a6130e?w=1200&q=80&auto=format&fit=crop",
    theme: "Dravidian Temple Grace",
    dressCode: "Kanchipuram Silk Saree / Veshti Dhoti",
    ethnicity: "Tamil Brahmin",
    events: [
      { name: "Day 1: Oonjal Swing & Mangalya Dharanam", description: "Swing ritual, tying of sacred Thali thread, and traditional Ela Sadya.", startTime: "07:30", endTime: "14:30", dayOffset: 0 }
    ],
    traditions: [
      { name: "Mangalya Dharanam", description: "Sacred tying of the golden Thali at auspicious Muhurtham." },
      { name: "Oonjal Swing", description: "Joyous singing and swinging of couple by family women." }
    ]
  },
  {
    id: "w11",
    slug: "mughal-garden-wedding-agra",
    title: "Mughal Garden Wedding at Agra",
    description: "A 1-day garden wedding in Agra overlooking the Taj Mahal, featuring Shehnai recitals, Mughal courtly banquets, and sunset nuptials.",
    location: "The Oberoi Amarvilas, Agra, Uttar Pradesh",
    category: "Destination",
    tier: "STANDARD",
    durationDays: 1,
    religion: "Interfaith / Multicultural",
    region: "Uttar Pradesh",
    community: "Mughal Heritage",
    capacity: 8,
    pricePerGuest: 149,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Arman & Sara Qureshi",
    hostEmail: "host_w11@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1756304598536-560096376e49?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1756304598536-560096376e49?w=1200&q=80&auto=format&fit=crop",
    theme: "Mughal Architecture & Monumental Romance",
    dressCode: "Chikankari Kurta / Pastel Formal",
    ethnicity: "Mughal Heritage",
    events: [
      { name: "Day 1: Taj View Sunset Nuptials & Banquet", description: "Sunset vows on marble terrace followed by Awadhi dinner.", startTime: "16:00", endTime: "22:00", dayOffset: 0 }
    ],
    traditions: [
      { name: "Attar Welcome", description: "Fragrant rose and sandalwood attar greeting." },
      { name: "Awadhi Dastarkhwan", description: "Centuries-old slow-cooked Lucknowi banquet." }
    ]
  },
  {
    id: "w19",
    slug: "pondicherry-french-quarter-wedding",
    title: "Pondicherry French Quarter Wedding",
    description: "A Franco-Tamil heritage 1-day wedding in Pondicherry's French Quarter, featuring villa courtyard vows and Franco-Tamil seafood feasts.",
    location: "La Villa & Palais de Mahe, Pondicherry",
    category: "Destination",
    tier: "STANDARD",
    durationDays: 1,
    religion: "Regional / Cultural",
    region: "Pondicherry",
    community: "Franco-Tamil",
    capacity: 6,
    pricePerGuest: 149,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Pierre & Lakshmi Gautier",
    hostEmail: "host_w19@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1774814327717-44ffb5936631?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1774814327717-44ffb5936631?w=1200&q=80&auto=format&fit=crop",
    theme: "Franco-Tamil Coastal Heritage",
    dressCode: "Resort Chic / Pastel Linen",
    ethnicity: "Franco-Tamil",
    events: [
      { name: "Day 1: French Villa Nuptials & Fusion Dinner", description: "Courtyard ceremony followed by Franco-Tamil seafood banquet.", startTime: "16:00", endTime: "22:00", dayOffset: 0 }
    ],
    traditions: [
      { name: "Franco-Tamil Blessing", description: "Blended cross-cultural wedding vows." },
      { name: "Courtyard Soiree", description: "Charming heritage villa cocktail reception." }
    ]
  },
  {
    id: "w5",
    slug: "varanasi-ganges-spiritual-wedding",
    title: "Varanasi Ganges Spiritual Union",
    description: "A sacred 1-day spiritual union on the Ghats of Varanasi, featuring Vedic chanting by senior priests, sunset boat rides, and the grand Ganga Aarti.",
    location: "BrijRama Palace, Darbhanga Ghat, Varanasi, Uttar Pradesh",
    category: "Traditional",
    tier: "STANDARD",
    durationDays: 1,
    religion: "Hindu",
    region: "Uttar Pradesh",
    community: "Kashi Brahmin",
    capacity: 8,
    pricePerGuest: 149,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    hostCoupleName: "Aalok & Shambhavi Mishra",
    hostEmail: "host_w5@weddingwithindia.com",
    hostAvatar: "https://images.unsplash.com/photo-1735052711950-c31c729c2a4e?w=1200&q=80&auto=format&fit=crop",
    mainImageUrl: "https://images.unsplash.com/photo-1735052711950-c31c729c2a4e?w=1200&q=80&auto=format&fit=crop",
    theme: "Ancient Spiritual Sacred Vows",
    dressCode: "Traditional Benarasi Silk / Dhoti Kurta",
    ethnicity: "Kashi Heritage",
    events: [
      { name: "Day 1: Ganga Aarti & Vedic Ghat Ceremony", description: "Sacred fire vows on riverside palace terrace with evening Aarti.", startTime: "15:00", endTime: "21:30", dayOffset: 0 }
    ],
    traditions: [
      { name: "Maha Aarti Participation", description: "Participating in the divine Ganga evening lamp ceremony." },
      { name: "Vedic Chanting", description: "Ancient Sanskrit mantras chanted by hereditary priests." }
    ]
  }
];

async function seedMasterData() {
  console.log("==================================================");
  console.log("  WeddingWithIndia — Master Database Seeder");
  console.log("==================================================\n");

  try {
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

    console.log("\n2. Seeding 21 Authoritative Multi-Day Celebrations in Database...");

    for (const wData of DEMO_WEDDINGS) {
      // Find or create host user & couple profile
      const hUser = await prisma.user.upsert({
        where: { email: wData.hostEmail },
        update: { role: "COUPLE", status: "ACTIVE", name: wData.hostCoupleName, avatar: wData.mainImageUrl },
        create: {
          clerkUserId: `user_host_${wData.id}_seed`,
          email: wData.hostEmail,
          name: wData.hostCoupleName,
          role: "COUPLE",
          status: "ACTIVE",
          avatar: wData.hostAvatar,
        },
      });

      const startDate = new Date(Date.now() + 30 * 86400000);

      const hProfile = await prisma.coupleProfile.upsert({
        where: { userId: hUser.id },
        update: {
          weddingDate: startDate,
          weddingLocation: wData.location,
          familyBio: `${wData.hostCoupleName} welcome global travelers to experience authentic ${wData.ethnicity} wedding traditions.`,
        },
        create: {
          userId: hUser.id,
          weddingDate: startDate,
          weddingLocation: wData.location,
          expectedGuests: 200,
          languagesSpoken: "English, Hindi",
          photographyRules: "Allowed",
          familyBio: `${wData.hostCoupleName} welcome global travelers to experience authentic ${wData.ethnicity} wedding traditions.`,
        },
      });

      // Match existing wedding by slug or ID
      const existingBySlug = await prisma.wedding.findUnique({ where: { slug: wData.slug } });
      const targetId = existingBySlug ? existingBySlug.id : wData.id;

      // Clear old events and traditions to guarantee zero stale generic events
      await prisma.weddingEvent.deleteMany({ where: { weddingId: targetId } });
      await prisma.weddingTradition.deleteMany({ where: { weddingId: targetId } });

      const wedding = await prisma.wedding.upsert({
        where: { id: targetId },
        update: {
          title: wData.title,
          slug: wData.slug,
          description: wData.description,
          location: wData.location,
          category: wData.category,
          tier: wData.tier,
          durationDays: wData.durationDays,
          religion: wData.religion || "Hindu",
          region: wData.region || null,
          community: wData.community || null,
          date: startDate,
          pricePerGuest: wData.pricePerGuest,
          capacity: wData.capacity,
          mainImageUrl: wData.mainImageUrl,
          status: wData.status,
          featured: wData.featured,
          sponsored: wData.sponsored ?? false,
          isDemo: true,
          theme: wData.theme,
          dressCode: wData.dressCode,
          ethnicity: wData.ethnicity,
          events: {
            create: (wData.events || []).map((e) => ({
              name: e.name,
              description: e.description,
              date: new Date(startDate.getTime() + (e.dayOffset || 0) * 86400000),
              startTime: e.startTime || "17:00",
              endTime: e.endTime || "22:00",
              location: wData.location,
            })),
          },
          traditions: {
            create: (wData.traditions || []).map((t) => ({
              name: t.name,
              description: t.description,
            })),
          },
        },
        create: {
          id: wData.id,
          hostCoupleId: hProfile.id,
          slug: wData.slug,
          title: wData.title,
          description: wData.description,
          location: wData.location,
          category: wData.category,
          tier: wData.tier,
          durationDays: wData.durationDays,
          religion: wData.religion || "Hindu",
          region: wData.region || null,
          community: wData.community || null,
          date: startDate,
          pricePerGuest: wData.pricePerGuest,
          capacity: wData.capacity,
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
            create: (wData.events || []).map((e) => ({
              name: e.name,
              description: e.description,
              date: new Date(startDate.getTime() + (e.dayOffset || 0) * 86400000),
              startTime: e.startTime || "17:00",
              endTime: e.endTime || "22:00",
              location: wData.location,
            })),
          },
          traditions: {
            create: (wData.traditions || []).map((t) => ({
              name: t.name,
              description: t.description,
            })),
          },
        },
      });

      console.log(`   ✓ [${wData.durationDays}d] [${wData.tier}] ${wedding.title} ($${wData.pricePerGuest}/guest, capacity: ${wData.capacity})`);
    }

    console.log("\n==================================================");
    console.log("  Master Seed Completed Successfully!");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ Master Seeder Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedMasterData();
}

module.exports = { seedMasterData };
