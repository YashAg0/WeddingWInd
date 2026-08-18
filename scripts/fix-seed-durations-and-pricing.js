const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80",
    theme: "Royal Marwari Heritage",
    dressCode: "Festive Indian Royal Attire / Black Tie",
    ethnicity: "Marwari Rajput",
    events: [
      { name: "Day 1: Family Welcome & Evening Gathering", description: "Arrival of guests, welcome tea, traditional folk musicians, and courtyard dinner.", startTime: "16:00", endTime: "21:00", dayNumber: 1 },
      { name: "Day 2: Pre-Wedding Cultural Celebrations", description: "Daytime cultural activities, floral decorations, and regional culinary stalls.", startTime: "11:00", endTime: "15:00", dayNumber: 2 },
      { name: "Day 3: Musical Evening & Sangeet", description: "Choreographed family dances, live folk orchestra, and evening banquet.", startTime: "18:00", endTime: "23:00", dayNumber: 3 },
      { name: "Day 4: Traditional Baraat & Mandap Pheras", description: "Baraat assembly, sacred vows around the holy fire with English cultural commentary, and dinner.", startTime: "16:30", endTime: "22:00", dayNumber: 4 },
      { name: "Day 5: Royal Gala Banquet & Farewell", description: "Congratulatory dinner, toasts, fireworks, and farewell blessing.", startTime: "19:00", endTime: "23:30", dayNumber: 5 }
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
    mainImageUrl: "https://images.unsplash.com/photo-1640953148126-1962ec17a92b?w=1200&q=80",
    theme: "Pahadi Royal Pine Forest",
    dressCode: "Festive Velvet Sherwani / Silk Dhatu Saree",
    ethnicity: "Himachali Rajput",
    events: [
      { name: "Day 1: Himalayan Welcome High Tea", description: "Arrival tea with mountain views and acoustic Himachali flute.", startTime: "15:00", endTime: "18:30", dayNumber: 1 },
      { name: "Day 2: Pine Forest Meadow Gathering", description: "Cultural storytelling and Pahari folk music under cedar trees.", startTime: "11:00", endTime: "15:00", dayNumber: 2 },
      { name: "Day 3: Himachali Nati Sangeet Night", description: "Nati folk dance circle around pine forest bonfire.", startTime: "17:30", endTime: "21:30", dayNumber: 3 },
      { name: "Day 4: Cedar Grove Mandap Pheras", description: "Vedic vows in open cedar grove overlooking snow peaks.", startTime: "10:30", endTime: "13:30", dayNumber: 4 },
      { name: "Day 5: Oberoi Estate Dham Banquet", description: "Authentic multi-course Himachali Dham feast served on brass thalis.", startTime: "18:30", endTime: "22:30", dayNumber: 5 }
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
    mainImageUrl: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1200&q=80",
    theme: "Sacred Punjabi Heritage",
    dressCode: "Punjabi Kurta Pajama / Turban / Salwar Kameez",
    ethnicity: "Punjabi Sikh",
    events: [
      { name: "Day 1: Farmstead Welcome Dinner", description: "Traditional tandoori dinner and Punjabi folk welcome.", startTime: "17:00", endTime: "22:00", dayNumber: 1 },
      { name: "Day 2: Jaggo & Sangeet Night", description: "High-energy Dhol beats, Jaggo procession, and family choreography.", startTime: "18:00", endTime: "23:30", dayNumber: 2 },
      { name: "Day 3: Sacred Anand Karaj & Langar", description: "Solemn four Laavan hymns in the Gurdwara followed by equality community Langar.", startTime: "09:00", endTime: "14:00", dayNumber: 3 },
      { name: "Day 4: Grand Reception Banquet", description: "Celebratory banquet dinner, toasts, and cultural music.", startTime: "19:00", endTime: "23:45", dayNumber: 4 }
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
    mainImageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    theme: "Nizami Palace Splendor",
    dressCode: "Khada Dupatta / Royal Sherwani",
    ethnicity: "Hyderabadi Nizam Heritage",
    events: [
      { name: "Day 1: Falaknuma Carriage Welcome", description: "Horse carriage arrival and high tea at Jade Room.", startTime: "16:00", endTime: "19:30", dayNumber: 1 },
      { name: "Day 2: Ghazal & Henna Soiree", description: "Classical ghazals by master artists in palace courtyard.", startTime: "18:30", endTime: "22:30", dayNumber: 2 },
      { name: "Day 3: Nikah Ceremony at Durbar Hall", description: "Solemn Nikah in Belgian crystal Durbar hall.", startTime: "11:00", endTime: "13:30", dayNumber: 3 },
      { name: "Day 4: Grand Nizam Walima Banquet", description: "101-seat dining table banquet with royal Hyderabadi cuisine.", startTime: "19:30", endTime: "23:30", dayNumber: 4 }
    ],
    traditions: [
      { name: "Nizami Ghazal Night", description: "Poetic musical night." },
      { name: "Khada Dupatta Custom", description: "Heritage 6-yard draped bridal outfit." }
    ]
  },
  {
    id: "w17",
    slug: "ladakh-mountain-monastery-wedding",
    title: "Ladakh Monastery Mountain Wedding",
    description: "A 4-day high-altitude Buddhist wedding blessing at Thiksey Monastery in Leh. Features monastic prayers, ceremonial Khatak silk scarf offerings, and Jabro folk dances.",
    location: "The Grand Dragon & Thiksey Monastery, Leh, Ladakh",
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
    mainImageUrl: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1200&q=80",
    theme: "Himalayan Monastic Grace",
    dressCode: "Traditional Ladakhi Goncha / Warm Layers",
    ethnicity: "Ladakhi Buddhist",
    events: [
      { name: "Day 1: High Altitude Welcome & Acclimatization", description: "Warm butter tea and introduction to Ladakhi customs.", startTime: "14:00", endTime: "18:00", dayNumber: 1 },
      { name: "Day 2: Khatak Offering & Folk Dance", description: "Ceremonial silk scarf blessings and Jabro community dance.", startTime: "13:00", endTime: "16:30", dayNumber: 2 },
      { name: "Day 3: Thiksey Monastery Blessing Ceremony", description: "Monk chanting and sacred sutra blessing in ancient monastery shrine.", startTime: "09:00", endTime: "12:00", dayNumber: 3 },
      { name: "Day 4: Himalayan Cultural Banquet", description: "Celebratory feast with local music and farewell toast.", startTime: "18:00", endTime: "21:30", dayNumber: 4 }
    ],
    traditions: [
      { name: "Khatak Presentation", description: "White silk scarf blessing." },
      { name: "Monastic Chanting", description: "Sacred sutra recitation." }
    ]
  },
  {
    id: "w3",
    slug: "kerala-backwater-matrimony",
    title: "Kerala Coastal Christian Matrimony",
    description: "Experience three days of serene coastal hospitality in Alleppey, featuring a sunset backwater gathering, a solemn church matrimony mass, and an authentic banana leaf Sadya feast.",
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
    mainImageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80",
    theme: "Backwater Serenade",
    dressCode: "Kasavu Saree / Mundu with Shirt / Smart Linen",
    ethnicity: "Saint Thomas Christian",
    events: [
      { name: "Day 1: Sunset Backwater Cruise & Welcome", description: "Arrival boat cruise across canals with fresh coconut refreshments.", startTime: "16:30", endTime: "20:30", dayNumber: 1 },
      { name: "Day 2: Church Matrimony & Nuptial Blessing", description: "Solemn Catholic marriage mass in a heritage stone church.", startTime: "10:30", endTime: "15:00", dayNumber: 2 },
      { name: "Day 3: Traditional Ela Sadya Feast & Reception", description: "24-item vegetarian feast served on banana leaves with instrumental music.", startTime: "12:00", endTime: "16:30", dayNumber: 3 }
    ],
    traditions: [
      { name: "Nuptial Mass", description: "Solemn church matrimony with choir hymns and vows." },
      { name: "Traditional Ela Sadya", description: "Multi-course feast served on fresh green banana leaves." }
    ]
  },
  {
    id: "w2",
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
    mainImageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80",
    theme: "Lakeside Romance & Heritage",
    dressCode: "Traditional Elegant Ethnic / Bandhgala",
    ethnicity: "Mewari Rajput",
    events: [
      { name: "Day 1: Lake Pichola Sunset Boat Welcome", description: "Sunset boat arrival across Lake Pichola with Shehnai recitals.", startTime: "17:00", endTime: "20:00", dayNumber: 1 },
      { name: "Day 2: Lakeside Sangeet & Folk Performances", description: "Mewari Ghoomar dance and royal palace courtyard dinner.", startTime: "18:30", endTime: "23:00", dayNumber: 2 },
      { name: "Day 3: Island Palace Mandap Pheras & Gala", description: "Vedic vows by the lake followed by island candlelit banquet.", startTime: "16:30", endTime: "22:30", dayNumber: 3 }
    ],
    traditions: [
      { name: "Sunset Boat Procession", description: "Arrival across calm waters of Lake Pichola." },
      { name: "Ghoomar Performance", description: "Imperial Rajasthani dance by court artists." }
    ]
  },
  {
    id: "w10",
    slug: "bengali-durga-puja-wedding",
    title: "Kolkata Bengali Heritage Wedding",
    description: "A 3-day cultural immersion in Kolkata featuring Rabindra Sangeet music, traditional Gaye Holud turmeric ceremony, and authentic Bengali fish banquets in a colonial Rajbari.",
    location: "Sovabazar Rajbari, Kolkata, West Bengal",
    category: "Traditional",
    tier: "GRAND",
    durationDays: 3,
    religion: "Hindu",
    region: "West Bengal",
    community: "Bengali Traditional",
    capacity: 12,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80",
    theme: "Kolkata Rajbari Grandeur",
    dressCode: "Red/White Bengali Silk Saree / Dhoti Kurta",
    ethnicity: "Bengali Traditional",
    events: [
      { name: "Day 1: Rajbari Welcome & Rabindra Sangeet", description: "Courtyard reception with sitar and Rabindrasangeet.", startTime: "17:00", endTime: "21:00", dayNumber: 1 },
      { name: "Day 2: Gaye Holud Turmeric Blessing", description: "Lively turmeric blessing with sweet distribution.", startTime: "10:30", endTime: "14:00", dayNumber: 2 },
      { name: "Day 3: Saat Paake Bandha & Bhoj", description: "Seven circles on wooden peerha and grand Bengali feast.", startTime: "17:30", endTime: "22:30", dayNumber: 3 }
    ],
    traditions: [
      { name: "Saat Paake Bandha", description: "Bride circles groom 7 times while carried on wooden stool." },
      { name: "Shubho Drishti", description: "First auspicious eye contact through betel leaves." }
    ]
  },
  {
    id: "w12",
    slug: "kashmiri-dal-lake-wedding",
    title: "Kashmir Dal Lake Houseboat Wedding",
    description: "A 3-day fairytale celebration on Dal Lake houseboats in Srinagar, featuring shikara boat processions, traditional Wazwan 36-course banquets, and Kashmiri Santoor recitals.",
    location: "Mascot Houseboats, Nigeen Lake, Srinagar, Kashmir",
    category: "Nature",
    tier: "GRAND",
    durationDays: 3,
    religion: "Interfaith / Multicultural",
    region: "Kashmir",
    community: "Kashmiri Heritage",
    capacity: 10,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80",
    theme: "Kashmir Floating Paradise",
    dressCode: "Embroidered Kashmiri Pheran / Pashmina Stole",
    ethnicity: "Kashmiri Heritage",
    events: [
      { name: "Day 1: Shikara Sunset Welcome & Kahwa", description: "Boat ride across Dal Lake with saffron Kahwa tea.", startTime: "16:00", endTime: "19:30", dayNumber: 1 },
      { name: "Day 2: Sufiana Kalam Music & Henna", description: "Kashmiri Santoor melodies and delicate saffron henna.", startTime: "17:00", endTime: "21:30", dayNumber: 2 },
      { name: "Day 3: Houseboat Vows & Grand Wazwan", description: "Lakeside matrimonial blessing followed by authentic Wazwan feast.", startTime: "12:00", endTime: "17:00", dayNumber: 3 }
    ],
    traditions: [
      { name: "Shikara Procession", description: "Floral boat flotilla on mountain lake." },
      { name: "Wazwan Feast", description: "Royal multi-dish banquet served in copper Tarami." }
    ]
  },
  {
    id: "w15",
    slug: "uttarakhand-hills-wedding",
    title: "Uttarakhand Mountain Meadow Wedding",
    description: "A 3-day mountain meadow celebration in Mussoorie featuring Garhwali Pahari folk dances, cedar forest pheras, and Himalayan ridge views.",
    location: "JW Marriott Walnut Grove, Mussoorie, Uttarakhand",
    category: "Nature",
    tier: "GRAND",
    durationDays: 3,
    religion: "Regional / Cultural",
    region: "Uttarakhand",
    community: "Garhwali Pahari",
    capacity: 14,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    theme: "Himalayan Ridge Tranquility",
    dressCode: "Pahari Traditional / Warm Woolen Festive",
    ethnicity: "Garhwali Pahari",
    events: [
      { name: "Day 1: Mountain Pine Welcome Gathering", description: "High altitude tea and Garhwali welcome songs.", startTime: "15:30", endTime: "19:00", dayNumber: 1 },
      { name: "Day 2: Pahari Sangeet & Bonfire Night", description: "Garhwali folk dances and acoustic music around bonfire.", startTime: "17:30", endTime: "21:30", dayNumber: 2 },
      { name: "Day 3: Meadow Pheras & Pahari Feast", description: "Vedic vows overlooking Himalayan peaks followed by regional feast.", startTime: "10:30", endTime: "15:00", dayNumber: 3 }
    ],
    traditions: [
      { name: "Pahari Sangeet", description: "Folk songs celebrating nature and community." },
      { name: "Mandap Pheras", description: "Vedic vows in crisp mountain air." }
    ]
  },
  {
    id: "w18",
    slug: "ooty-nilgiris-tea-garden-wedding",
    title: "Ooty Nilgiris Tea Garden Wedding",
    description: "A heritage colonial tea estate wedding in Ooty across 3 days, featuring tea garden Haldi, outdoor high teas, and South Indian banquets amidst misty green hills.",
    location: "Savoy - IHCL SeleQtions, Ooty, Tamil Nadu",
    category: "Nature",
    tier: "GRAND",
    durationDays: 3,
    religion: "Regional / Cultural",
    region: "Tamil Nadu",
    community: "Nilgiri Highland",
    capacity: 12,
    pricePerGuest: 449,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80",
    theme: "Colonial Tea Estate Charm",
    dressCode: "Pastel Silk Saree / Heritage Blazer",
    ethnicity: "Nilgiri Highland",
    events: [
      { name: "Day 1: Tea Tasting Welcome & High Tea", description: "Estate tea tasting and welcome evening.", startTime: "16:00", endTime: "19:30", dayNumber: 1 },
      { name: "Day 2: Tea Garden Haldi & Sangeet", description: "Turmeric blessing among tea bushes followed by evening dinner.", startTime: "10:30", endTime: "14:00", dayNumber: 2 },
      { name: "Day 3: Highland Garden Vows & Dinner", description: "Garden matrimony ceremony and celebratory dinner.", startTime: "16:00", endTime: "22:00", dayNumber: 3 }
    ],
    traditions: [
      { name: "Tea Garden Haldi", description: "Turmeric ceremony in tea estate." },
      { name: "Highland Mandap", description: "Floral garden mandap." }
    ]
  },
  {
    id: "w4",
    slug: "goan-sunset-beach-wedding",
    title: "Goan Sunset Beach Nuptials",
    description: "A vibrant 2-day beachfront celebration on Mandrem Beach with sunset ocean views, live Goan brass music, fresh seafood banquets, and floral ceremony arches.",
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
    mainImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    theme: "Tropical Beach Romance",
    dressCode: "Beach Formal / Pastel Linen",
    ethnicity: "Goan Catholic",
    events: [
      { name: "Day 1: Roce & Henna Sunset Beach Party", description: "Coconut milk blessing (Roce), acoustic guitar music, and beach henna art.", startTime: "17:00", endTime: "21:00", dayNumber: 1 },
      { name: "Day 2: Church Nuptials & Sunset Beach Reception", description: "Heritage church vows followed by live Goan brass band and seaside banquet.", startTime: "15:30", endTime: "23:00", dayNumber: 2 }
    ],
    traditions: [
      { name: "Roce Blessing", description: "Anointing couple with fresh coconut milk for prosperity." },
      { name: "Nuptial Mass", description: "Church matrimony with sacred hymns and ring exchange." }
    ]
  },
  {
    id: "w22",
    slug: "ahmedabad-heritage-pol-wedding",
    title: "Ahmedabad Heritage Pol Haveli Wedding",
    description: "A 2-day heritage haveli celebration in Ahmedabad's ancient Pols, featuring Garba & Dandiya Raas dance nights, Pokhanu welcomes, and authentic Gujarati Thali banquets.",
    location: "House of MG Heritage Hotel, Ahmedabad, Gujarat",
    category: "Traditional",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Jain",
    region: "Gujarat",
    community: "Jain Shwetambar",
    capacity: 8,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80",
    theme: "Gujarati Heritage Pol",
    dressCode: "Bandhani / Chaniya Choli / Kurta Kediya",
    ethnicity: "Jain Shwetambar",
    events: [
      { name: "Day 1: Garba & Dandiya Raas Night", description: "High-energy traditional Gujarati circle dance with sticks.", startTime: "19:00", endTime: "23:30", dayNumber: 1 },
      { name: "Day 2: Lagna Pheras & Heritage Thali Feast", description: "Pokhanu mother-in-law welcome, sacred Pheras, and grand Gujarati feast.", startTime: "09:30", endTime: "15:00", dayNumber: 2 }
    ],
    traditions: [
      { name: "Garba Raas", description: "Traditional Gujarati circle dance." },
      { name: "Pokhanu Welcome", description: "Playful nose-pulling welcome by bride's mother." }
    ]
  },
  {
    id: "w9",
    slug: "andaman-island-tropical-wedding",
    title: "Andaman Islands Tropical Beach Wedding",
    description: "A 2-day tropical island wedding on Havelock Beach with turquoise water vows, barefoot beach cocktail parties, and fresh seafood barbecue feasts.",
    location: "Taj Exotica Resort & Spa, Havelock Island, Andaman",
    category: "Beach",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Interfaith / Multicultural",
    region: "Andaman and Nicobar Islands",
    community: "Island Traditional",
    capacity: 8,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80",
    theme: "Tropical Island Bliss",
    dressCode: "Barefoot Beach Chic / Tropical Linen",
    ethnicity: "Island Traditional",
    events: [
      { name: "Day 1: Sunset Island Cocktails & Barbecue", description: "Barefoot welcome party with live acoustic guitar.", startTime: "17:00", endTime: "21:30", dayNumber: 1 },
      { name: "Day 2: Beachfront Matrimonial Vows & Dinner", description: "Floral arch vows by the sea followed by candlelit dinner.", startTime: "16:30", endTime: "22:00", dayNumber: 2 }
    ],
    traditions: [
      { name: "Floral Arch Vows", description: "Beachfront wedding vows." },
      { name: "Island Feast", description: "Fresh tropical seafood dining." }
    ]
  },
  {
    id: "w13",
    slug: "coorg-plantation-wedding",
    title: "Coorg Coffee Plantation Wedding",
    description: "A 2-day lush highland wedding in the coffee hills of Coorg featuring Kodava sword dances, Dampathi Muhurtham blessings, and estate bonfires.",
    location: "Evolve Back Resort, Siddapur, Coorg, Karnataka",
    category: "Nature",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Regional / Cultural",
    region: "Karnataka",
    community: "Kodava Hindu",
    capacity: 10,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    theme: "Highland Coffee Estate Serenity",
    dressCode: "Kodava Style Back-Draped Saree / Kupya",
    ethnicity: "Kodava Hindu",
    events: [
      { name: "Day 1: Valagaga Sword Dance & Bonfire", description: "High-energy Kodava drum and sword dance around estate fire.", startTime: "18:00", endTime: "21:30", dayNumber: 1 },
      { name: "Day 2: Dampathi Muhurtham & Estate Feast", description: "Blessing ceremony with fresh coffee leaves followed by Kodava feast.", startTime: "10:00", endTime: "15:00", dayNumber: 2 }
    ],
    traditions: [
      { name: "Valagaga Dance", description: "Highland Kodava sword dance." },
      { name: "Dampathi Muhurtham", description: "Coffee leaf family blessing." }
    ]
  },
  {
    id: "w16",
    slug: "mumbai-marine-drive-wedding",
    title: "Mumbai Marine Drive Rooftop Wedding",
    description: "An urban 2-day sunset celebration overlooking Mumbai's Queen's Necklace at Marine Drive. Features DJ sangeet, rooftop mandap, and modern coastal cuisine.",
    location: "The InterContinental, Marine Drive, Mumbai, Maharashtra",
    category: "Destination",
    tier: "ENHANCED",
    durationDays: 2,
    religion: "Interfaith / Multicultural",
    region: "Maharashtra",
    community: "Contemporary Urban",
    capacity: 12,
    pricePerGuest: 249,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&q=80",
    theme: "Mumbai Skyline Glamour",
    dressCode: "Black Tie / High-Fashion Ethnic",
    ethnicity: "Contemporary Urban",
    events: [
      { name: "Day 1: Rooftop Sangeet & Cocktails", description: "DJ set, cocktails, and choreographed family dance-off.", startTime: "19:00", endTime: "23:30", dayNumber: 1 },
      { name: "Day 2: Sunset Ocean Vows & Reception Gala", description: "Matrimonial ceremony against sunset followed by skyline gala.", startTime: "17:00", endTime: "23:45", dayNumber: 2 }
    ],
    traditions: [
      { name: "Rooftop Mandap", description: "Oceanfront urban wedding mandap." },
      { name: "Sangeet Dance Off", description: "Choreographed family dances." }
    ]
  },
  {
    id: "w20",
    slug: "rajasthan-desert-camp-wedding",
    title: "Rajasthan Desert Camp Night Wedding",
    description: "A magical 2-day desert camp wedding in Jaisalmer under starry skies, featuring camel Baraats, Kalbelia fire dances, and moonlight sand dune pheras.",
    location: "Sam Sand Dunes, Jaisalmer, Rajasthan",
    category: "Royal",
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
    mainImageUrl: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=1200&q=80",
    theme: "Thar Desert Moonlight Romance",
    dressCode: "Vibrant Rajasthani Ethnic",
    ethnicity: "Thar Desert Rajput",
    events: [
      { name: "Day 1: Kalbelia Fire Dance & Camp Bonfire", description: "Folk music, fire dance, and desert camp feast under stars.", startTime: "18:00", endTime: "22:00", dayNumber: 1 },
      { name: "Day 2: Camel Baraat & Dune Moonlight Pheras", description: "Camel procession, sunset Saptapadi vows, and candlelit feast.", startTime: "16:30", endTime: "23:00", dayNumber: 2 }
    ],
    traditions: [
      { name: "Camel Baraat", description: "Desert procession on camels." },
      { name: "Dune Pheras", description: "Moonlight vows in desert sands." }
    ]
  },
  {
    id: "w8",
    slug: "tamil-brahmin-wedding-madurai",
    title: "Tamil Brahmin Madurai Meenakshi Wedding",
    description: "An authentic 1-day traditional Vedic wedding in Madurai featuring Nadaswaram classical music, Oonjal swing songs, Kanyadaan rituals, and traditional banana leaf Sadya.",
    location: "Heritage Madurai, Madurai, Tamil Nadu",
    category: "Traditional",
    tier: "STANDARD",
    durationDays: 1,
    religion: "Hindu",
    region: "Tamil Nadu",
    community: "Tamil Traditional",
    capacity: 8,
    pricePerGuest: 149,
    status: "PUBLISHED",
    featured: true,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80",
    theme: "Madurai Temple Heritage",
    dressCode: "Kanjeevaram Silk Saree / Veshti with Angavastram",
    ethnicity: "Tamil Traditional",
    events: [
      { name: "Day 1: Oonjal Swing, Muhurtham & Sadya Feast", description: "Morning Nadaswaram music, Oonjal swing ceremony, sacred Kanyadaan, and banana leaf feast.", startTime: "07:30", endTime: "15:00", dayNumber: 1 }
    ],
    traditions: [
      { name: "Oonjal Ceremony", description: "Couple seated on swing while women sing auspicious songs." },
      { name: "Kanyadaan", description: "Giving away of the bride with Vedic chants." }
    ]
  },
  {
    id: "w5",
    slug: "varanasi-ganges-spiritual-union",
    title: "Varanasi Ganges Spiritual Union",
    description: "A sacred 1-day heritage wedding overlooking the holy Ganges River at Darbhanga Ghat. Features private Ganga Aarti, classical sitar recitals, and traditional Vedic chants.",
    location: "BrijRama Palace, Darbhanga Ghat, Varanasi, Uttar Pradesh",
    category: "Traditional",
    tier: "STANDARD",
    durationDays: 1,
    religion: "Hindu",
    region: "Uttar Pradesh",
    community: "Vedic Heritage",
    capacity: 8,
    pricePerGuest: 149,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=1200&q=80",
    theme: "Spiritual Ganges Heritage",
    dressCode: "Traditional Banarasi Silk",
    ethnicity: "Vedic Heritage",
    events: [
      { name: "Day 1: Sunrise Ghat Pheras & Ganga Aarti", description: "Vedic morning vows overlooking holy river, Sattvic feast, and sunset boat Aarti.", startTime: "06:30", endTime: "20:00", dayNumber: 1 }
    ],
    traditions: [
      { name: "Ganga Aarti Blessing", description: "Fire lamp offering to the sacred Ganges River." },
      { name: "Vedic Saptapadi", description: "Ancient Sanskrit chanting during 7 vows around the holy fire." }
    ]
  },
  {
    id: "w11",
    slug: "mughal-agra-taj-wedding",
    title: "Mughal Garden Wedding at Agra",
    description: "A 1-day celebration with views of the Taj Mahal, featuring classical sitar recitals, rose petal showers, and royal Mughlai banquets.",
    location: "ITC Mughal, Agra, Uttar Pradesh",
    category: "Royal",
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
    mainImageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80",
    theme: "Mughal Court Elegance",
    dressCode: "Royal Anarkali / Embroidered Sherwani",
    ethnicity: "Mughal Heritage",
    events: [
      { name: "Day 1: Mughal Courtyard Vows & Gala", description: "Rose petal welcome, evening vows with sitar music, and candlelit Mughlai banquet.", startTime: "16:00", endTime: "22:30", dayNumber: 1 }
    ],
    traditions: [
      { name: "Rose Petal Welcome", description: "Traditional courtly greeting." },
      { name: "Mughlai Feast", description: "Heritage imperial recipes." }
    ]
  },
  {
    id: "w19",
    slug: "pondicherry-french-quarter-wedding",
    title: "Pondicherry French Quarter Wedding",
    description: "A 1-day Franco-Tamil heritage celebration in Pondicherry's French Quarter, featuring villa courtyard cocktail soirees, garden vows, and seafood fusion feasts.",
    location: "La Villa & Palais de Mahe, Pondicherry",
    category: "Destination",
    tier: "STANDARD",
    durationDays: 1,
    religion: "Regional / Cultural",
    region: "Pondicherry",
    community: "Franco-Tamil Traditional",
    capacity: 6,
    pricePerGuest: 149,
    status: "PUBLISHED",
    featured: false,
    sponsored: false,
    isDemo: true,
    mainImageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&q=80",
    theme: "Franco-Tamil Coastal Heritage",
    dressCode: "Resort Chic / Pastel Linen",
    ethnicity: "Franco-Tamil Traditional",
    events: [
      { name: "Day 1: Villa Garden Blessing & Gala Dinner", description: "Afternoon garden nuptial blessing followed by Franco-Tamil seafood fusion feast.", startTime: "15:30", endTime: "22:00", dayNumber: 1 }
    ],
    traditions: [
      { name: "Franco-Tamil Blessing", description: "Blended cultural wedding vows." },
      { name: "Courtyard Soiree", description: "Charming heritage villa reception." }
    ]
  }
];

async function applyMasterSeedUpdate() {
  console.log("=== APPLYING GOD-LEVEL MULTI-DAY MARKETPLACE DATABASE MIGRATION ===");

  for (const wData of DEMO_WEDDINGS) {
    // 1. Locate existing wedding by id or slug
    let wedding = await prisma.wedding.findFirst({
      where: {
        OR: [{ id: wData.id }, { slug: wData.slug }]
      }
    });

    if (!wedding) {
      console.log(`Wedding ${wData.id} (${wData.slug}) not found. Skipping...`);
      continue;
    }

    // 2. Update all attributes on the Wedding record
    await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        title: wData.title,
        slug: wData.slug,
        description: wData.description,
        location: wData.location,
        category: wData.category,
        tier: wData.tier,
        durationDays: wData.durationDays,
        religion: wData.religion,
        region: wData.region,
        community: wData.community,
        capacity: wData.capacity,
        pricePerGuest: wData.pricePerGuest,
        ceremoniesCount: wData.events.length,
        status: wData.status,
        featured: wData.featured,
        sponsored: wData.sponsored,
        isDemo: true,
        mainImageUrl: wData.mainImageUrl,
        theme: wData.theme,
        dressCode: wData.dressCode,
        ethnicity: wData.ethnicity
      }
    });

    // 3. Clear and re-populate WeddingEvents
    await prisma.weddingEvent.deleteMany({ where: { weddingId: wedding.id } });
    for (const ev of wData.events) {
      const eventDate = new Date(wedding.date.getTime() + ((ev.dayNumber || 1) - 1) * 86400000);
      await prisma.weddingEvent.create({
        data: {
          weddingId: wedding.id,
          name: ev.name,
          description: ev.description,
          date: eventDate,
          startTime: ev.startTime,
          endTime: ev.endTime,
          location: ev.location || wedding.location
        }
      });
    }

    // 4. Clear and re-populate Traditions
    await prisma.weddingTradition.deleteMany({ where: { weddingId: wedding.id } });
    for (const tr of wData.traditions) {
      await prisma.weddingTradition.create({
        data: {
          weddingId: wedding.id,
          name: tr.name,
          description: tr.description
        }
      });
    }

    console.log(`✓ Updated [${wedding.id}] "${wData.title}" -> ${wData.durationDays} DAYS, Tier: ${wData.tier}, Price: $${wData.pricePerGuest}, Capacity: ${wData.capacity}, Events: ${wData.events.length}`);
  }

  // Delete unwanted / duplicate test demo listings (e.g., '02f25432-f475-49d4-99ca-b88258a86711', '40522576-c6fd-4708-8d55-206b13c6eaa5')
  const unwantedDemos = await prisma.wedding.findMany({
    where: {
      isDemo: true,
      id: { notIn: DEMO_WEDDINGS.map((d) => d.id) },
      slug: { notIn: DEMO_WEDDINGS.map((d) => d.slug) }
    }
  });

  for (const unw of unwantedDemos) {
    await prisma.weddingEvent.deleteMany({ where: { weddingId: unw.id } });
    await prisma.weddingTradition.deleteMany({ where: { weddingId: unw.id } });
    await prisma.weddingGallery.deleteMany({ where: { weddingId: unw.id } });
    await prisma.booking.deleteMany({ where: { weddingId: unw.id } });
    await prisma.wedding.delete({ where: { id: unw.id } });
    console.log(`✓ Cleaned up duplicate demo listing: ${unw.id} (${unw.slug})`);
  }

  console.log("\n=== MASTER SEED UPDATE COMPLETED SUCCESSFULLY ===");
}

applyMasterSeedUpdate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
