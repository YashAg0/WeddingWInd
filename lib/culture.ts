/**
 * WeddingWithIndia — Cultural Authenticity & Realism Engine
 *
 * Provides structured cultural configuration, authentic ceremony templates,
 * food/cuisine guidelines, dress expectations, guest participation rules,
 * etiquette guidelines, and strict validation to prevent cross-cultural inaccuracies
 * (e.g., displaying Hindu Pheras or Ganesh Puja on Muslim or Sikh weddings).
 */

export type ReligionType =
  | "Hindu"
  | "Muslim"
  | "Sikh"
  | "Christian"
  | "Jain"
  | "Buddhist"
  | "Interfaith"
  | "Other";

export const CANONICAL_RELIGIONS: ReligionType[] = [
  "Hindu",
  "Muslim",
  "Sikh",
  "Christian",
  "Jain",
  "Buddhist",
  "Interfaith",
  "Other",
];

export function normalizeReligion(input: string | null | undefined): ReligionType {
  if (!input) return "Hindu";
  const clean = input.trim().toLowerCase();
  if (clean.includes("islam") || clean.includes("muslim")) return "Muslim";
  if (clean.includes("hindu")) return "Hindu";
  if (clean.includes("sikh")) return "Sikh";
  if (clean.includes("christian")) return "Christian";
  if (clean.includes("jain")) return "Jain";
  if (clean.includes("buddhist") || clean.includes("buddhism")) return "Buddhist";
  if (clean.includes("interfaith") || clean.includes("multi")) return "Interfaith";
  return "Other";
}

export type RegionType =
  | "Rajasthan"
  | "Punjab"
  | "Gujarat"
  | "Maharashtra"
  | "West Bengal"
  | "Uttar Pradesh"
  | "Delhi"
  | "Kerala"
  | "Tamil Nadu"
  | "Karnataka"
  | "Telangana"
  | "Kashmir"
  | "Goa"
  | "Himachal Pradesh"
  | "Uttarakhand"
  | "Ladakh"
  | "Pondicherry"
  | "Other";

export interface CeremonyTemplate {
  name: string;
  description: string;
  defaultTimeRange: string;
  guestParticipation: "participate" | "observe" | "optional";
}

export interface TraditionTemplate {
  name: string;
  description: string;
}

export interface CulturalProfileDefaults {
  religion: ReligionType;
  region: RegionType;
  community: string;
  foodContext: string;
  dressExpectations: string;
  guestRules: string;
  etiquetteNotes: string;
  defaultCeremonies: CeremonyTemplate[];
  defaultTraditions: TraditionTemplate[];
}

/**
 * Terms that must NEVER appear in ceremonies or traditions of specific religions.
 */
export const PROHIBITED_CEREMONY_TERMS: Record<ReligionType, string[]> = {
  Muslim: [
    "phera",
    "pheray",
    "saptapadi",
    "ganesh puja",
    "ganpati",
    "kanyadaan",
    "sindoor",
    "haldi", // Use Manjha / Henna / Mayun instead
    "mangalsutra",
    "anand karaj",
    "laavan",
    "church mass",
    "sacrament",
    "havan",
  ],
  Sikh: [
    "phera",
    "pheray",
    "saptapadi",
    "ganesh puja",
    "ganpati",
    "nikah",
    "walima",
    "church mass",
    "sacrament",
    "kanyadaan",
    "sindoor",
  ],
  Christian: [
    "phera",
    "pheray",
    "saptapadi",
    "ganesh puja",
    "ganpati",
    "nikah",
    "walima",
    "anand karaj",
    "laavan",
    "kanyadaan",
    "sindoor",
    "mangalsutra",
  ],
  Buddhist: [
    "phera",
    "pheray",
    "saptapadi",
    "ganesh puja",
    "ganpati",
    "nikah",
    "walima",
    "anand karaj",
    "laavan",
    "kanyadaan",
  ],
  Hindu: [
    "nikah",
    "walima",
    "anand karaj",
    "laavan",
    "church mass",
    "sacrament",
  ],
  Jain: [
    "nikah",
    "walima",
    "anand karaj",
    "laavan",
    "church mass",
    "sacrament",
  ],
  Interfaith: [],
  Other: [],
};

/**
 * Cultural profile lookup dictionary for supported religion + region combinations.
 */
export const CULTURAL_PROFILES: Record<string, CulturalProfileDefaults> = {
  // 1. Muslim - Mughal / Uttar Pradesh (Agra)
  "Muslim-Uttar Pradesh": {
    religion: "Muslim",
    region: "Uttar Pradesh",
    community: "Mughal Heritage",
    foodContext: "Royal Mughlai & Awadhi Feast: Slow-cooked Dum Pukht Biryani, Galouti & Kakori Kebabs, Shahi Tukda, Sheer Khurma, and seasonal Firni cooked by hereditary Khansamas.",
    dressExpectations: "Imperial Anarkali suits, Shararas, or Lehengas with Dupatta for women; Sherwanis or formal Kurtas with Nehru jackets for men. Modest attire covering shoulders & knees recommended for religious solemnization.",
    guestRules: "International guests are warmly welcomed to attend the Henna/Manjha evening, observe the solemn Nikah vows from designated seating, and actively participate in the royal Qawwali & Walima banquet.",
    etiquetteNotes: "Please remove shoes before stepping onto carpeted prayer arches. Alcohol is not served during religious solemnization. Photography is permitted except during quiet Dua moments.",
    defaultCeremonies: [
      {
        name: "Sufi Qawwali & Henna Evening",
        description: "Enchanting Sufi vocal performances under starlit garden arches while guests enjoy intricate Henna artwork.",
        defaultTimeRange: "18:00 - 22:00",
        guestParticipation: "participate",
      },
      {
        name: "Nikah Solemnization",
        description: "The official marriage contract solemnized by the Qazi in the garden courtyard with mutual consent (Iqrar) and Dua blessings.",
        defaultTimeRange: "11:00 - 13:00",
        guestParticipation: "observe",
      },
      {
        name: "Royal Walima Banquet",
        description: "Grand celebratory reception feast hosted by the groom's family featuring slow-cooked Mughlai delicacies and classical music.",
        defaultTimeRange: "19:00 - 23:00",
        guestParticipation: "participate",
      },
    ],
    defaultTraditions: [
      { name: "Iqrar & Qabul Hai", description: "Mutual affirmation of the marriage contract in the presence of witnesses." },
      { name: "Sufi Qawwali", description: "Traditional spiritual vocal music celebrating divine love and togetherness." },
    ],
  },

  // 2. Muslim - Kashmir (Srinagar)
  "Muslim-Kashmir": {
    religion: "Muslim",
    region: "Kashmir",
    community: "Kashmiri Muslim",
    foodContext: "Traditional 36-Course Kashmiri Wazwan: Rista (meatballs in saffron gravy), Rogan Josh, Tabak Maaz, Gushtaba, and fragrant Kahwa green tea with almonds and cardamom.",
    dressExpectations: "Traditional Kashmiri Pheran with intricate Tilla embroidery, or formal festive wear. Warm layers recommended for cool mountain evenings.",
    guestRules: "Guests arrive in flower-decorated wooden Shikaras across Dal Lake, observe the Nikah ceremony, and join the traditional seated Wazwan feast.",
    etiquetteNotes: "Wazwan is traditionally eaten in groups of four (Trami). Wash hands at the mobile Tash-t-nari basin brought to your table.",
    defaultCeremonies: [
      {
        name: "Manjha Henna Evening",
        description: "Pre-wedding turmeric and henna gathering accompanied by traditional Kashmiri Rouf songs.",
        defaultTimeRange: "17:00 - 21:00",
        guestParticipation: "participate",
      },
      {
        name: "Floating Shikara Baraat & Nikah",
        description: "Groom's arrival in flower-bedecked Shikaras followed by solemn Nikah vows overlooking Dal Lake.",
        defaultTimeRange: "10:30 - 13:00",
        guestParticipation: "observe",
      },
      {
        name: "Wazwan Feast & Celebration",
        description: "Royal 36-dish feast prepared over wood fires by master Ustaads (chefs).",
        defaultTimeRange: "18:30 - 22:30",
        guestParticipation: "participate",
      },
    ],
    defaultTraditions: [
      { name: "Floating Shikara Arrival", description: "Procession across calm lake waters in heritage wooden houseboats." },
      { name: "Wazwan Hospitality", description: "Multi-course feast served on large copper platters (Trami)." },
    ],
  },

  // 3. Muslim - Telangana (Hyderabad)
  "Muslim-Telangana": {
    religion: "Muslim",
    region: "Telangana",
    community: "Hyderabadi Nizam Heritage",
    foodContext: "Opulent Nizam Banquet: Authentic Hyderabadi Dum Biryani, Mirchi Ka Salan, Double Ka Meetha, Khubani Ka Meetha, and Marag soup.",
    dressExpectations: "Formal Royal Attire: Khada Dupatta or Kurti-Sharara for women; Sherwani or Bandhgala for men.",
    guestRules: "Guests attend the Ghazal evening, observe the solemn Nikah at Falaknuma Durbar Hall, and dine at the historic 101-seat dining table.",
    etiquetteNotes: "Strictly formal dress code. Respect palace photography guidelines.",
    defaultCeremonies: [
      {
        name: "Ghazal & Henna Soiree",
        description: "Live ghazal renditions by classical Ustaads accompanied by henna application for guests.",
        defaultTimeRange: "18:30 - 22:30",
        guestParticipation: "participate",
      },
      {
        name: "Nikah Ceremony at Falaknuma",
        description: "Solemnization of wedding vows in the grand Durbar Hall under Belgian crystal chandeliers.",
        defaultTimeRange: "11:00 - 13:30",
        guestParticipation: "observe",
      },
      {
        name: "Grand Nizam Walima",
        description: "Royal banquet featuring 101-seat dining experience and Hyderabadi culinary heritage.",
        defaultTimeRange: "19:30 - 23:30",
        guestParticipation: "participate",
      },
    ],
    defaultTraditions: [
      { name: "Nizami Ghazal Night", description: "Poetic musical night highlighting Hyderabad's royal arts culture." },
      { name: "Khada Dupatta Custom", description: "Traditional 6-yard draped bridal outfit unique to Hyderabadi heritage." },
    ],
  },

  // 4. Sikh - Punjab (Amritsar)
  "Sikh-Punjab": {
    religion: "Sikh",
    region: "Punjab",
    community: "Punjabi Sikh",
    foodContext: "Punjabi Royal & Sacred Cuisine: Amritsari Kulcha, Dal Makhani, Paneer Tikka, Sarson Da Saag & Makki Di Roti, Jalebi, and fresh Kadah Prasad.",
    dressExpectations: "Vibrant Punjabi Attire: Salwar Kameez, Patiala suit, or Lehenga with Dupatta for women; Kurta Pajama with Turban or head scarf for men. Head covering is MANDATORY inside the Gurdwara.",
    guestRules: "Guests participate in the colorful Jaggo night, attend the sacred Anand Karaj ceremony in the Gurdwara as respectful observers, and sit together for Guru Ka Langar.",
    etiquetteNotes: "MANDATORY: Remove shoes and cover head (Rumaal provided) before entering the Gurdwara. No tobacco or alcohol allowed on Gurdwara premises.",
    defaultCeremonies: [
      {
        name: "Jaggo & Sangeet Night",
        description: "Lively Punjabi folk dance, dhol drumming, and carrying illuminated brass copper jugs (Jaggo) through the village streets.",
        defaultTimeRange: "18:00 - 23:00",
        guestParticipation: "participate",
      },
      {
        name: "Milni & Anand Karaj",
        description: "Warm meeting of families (Milni) followed by the sacred Anand Karaj matrimony inside the Gurdwara around Sri Guru Granth Sahib Ji (4 Laavan circumambulations).",
        defaultTimeRange: "09:00 - 12:30",
        guestParticipation: "observe",
      },
      {
        name: "Guru Ka Langar & Reception",
        description: "Community vegetarian meal (Langar) served on the floor followed by a festive royal evening reception.",
        defaultTimeRange: "13:00 - 16:00",
        guestParticipation: "participate",
      },
    ],
    defaultTraditions: [
      { name: "Laavan (Anand Karaj)", description: "Four sacred hymns binding the couple in spiritual and marital union." },
      { name: "Milni Greeting", description: "Corresponding elders from both families exchange flower garlands and warm hugs." },
    ],
  },

  // 5. Christian - Goa
  "Christian-Goa": {
    religion: "Christian",
    region: "Goa",
    community: "Goan Catholic",
    foodContext: "Indo-Portuguese Goan Feast: Sorpotel, Chicken Xacuti, Prawn Balchão, Sannas, Bebinca dessert, and local Goan wine.",
    dressExpectations: "Elegant Western / Formal Wear: Suits or Blazers for men; Gowns, Cocktail Dresses, or Festive Sarees for women.",
    guestRules: "Guests attend the Roce coconut milk ceremony, observe the solemn Church Nuptial Mass, and join the lively beachside reception & brass band dance.",
    etiquetteNotes: "Please maintain silence during church prayer. Turn off camera flash during sacred sacrament moments.",
    defaultCeremonies: [
      {
        name: "Roce & Henna Ceremony",
        description: "Traditional Goan coconut milk blessing (Roce) accompanied by acoustic guitars and henna art.",
        defaultTimeRange: "17:00 - 20:30",
        guestParticipation: "participate",
      },
      {
        name: "Church Nuptial Mass & Vows",
        description: "Solemn Catholic wedding ceremony in a historic heritage church with organ choir and exchange of vows & rings.",
        defaultTimeRange: "15:30 - 17:30",
        guestParticipation: "observe",
      },
      {
        name: "Sunset Beach Reception",
        description: "Cocktail party, first dance, live brass band, wedding cake cutting, and dinner under palm trees.",
        defaultTimeRange: "18:30 - 23:30",
        guestParticipation: "participate",
      },
    ],
    defaultTraditions: [
      { name: "Roce Blessing", description: "Anointing bride and groom with coconut milk and oils by family members." },
      { name: "Nuptial Mass Vows", description: "Sacred Church matrimony with organ hymns and ring exchange." },
    ],
  },

  // 6. Hindu - Rajasthan (Jodhpur / Udaipur / Jaipur)
  "Hindu-Rajasthan": {
    religion: "Hindu",
    region: "Rajasthan",
    community: "Rajput / Marwari",
    foodContext: "Royal Rajasthani Pure Vegetarian Thali: Dal Baati Churma, Gatte Ki Sabzi, Ker Sangri, Pyaaz Kachori, Ghevar, and Malpua cooked in pure Desi Ghee.",
    dressExpectations: "Royal Traditional Attire: Vibrant Lehengas, Bandhani/Poth Sarees with Dupatta for women; Sherwanis or Kurta Pajama with Rajasthani Safa (Turban) for men.",
    guestRules: "Guests join the Ghoomar dance, wear colorful Rajasthani turbans, participate in the lively Baraat procession, and observe the sacred Mandap Pheras.",
    etiquetteNotes: "Remove footwear before entering the sacred Mandap area. Rajasthani Safa turbans will be tied for all international male guests upon arrival.",
    defaultCeremonies: [
      {
        name: "Tel Baan & Sangeet Night",
        description: "Auspicious turmeric oil ceremony followed by Ghoomar folk dance, royal musicians, and buffet dinner.",
        defaultTimeRange: "17:30 - 22:30",
        guestParticipation: "participate",
      },
      {
        name: "Royal Baraat & Mandap Pheras",
        description: "Groom's grand arrival on a decorated horse/elephant with brass band, followed by Vedic Saptapadi (7 sacred vows around holy fire).",
        defaultTimeRange: "10:00 - 14:00",
        guestParticipation: "participate",
      },
      {
        name: "Rajwada Gala Banquet",
        description: "Royal candlelit courtyard dinner with puppet shows, Manganiyar folk singers, and fireworks.",
        defaultTimeRange: "19:00 - 23:00",
        guestParticipation: "participate",
      },
    ],
    defaultTraditions: [
      { name: "Saptapadi (7 Pheras)", description: "Seven sacred vows taken around the holy Agni fire for lifelong union." },
      { name: "Ghoomar Folk Dance", description: "Traditional swirling dance performed by women in flowing ghagras." },
    ],
  },

  // 7. Hindu - Tamil Nadu (Madurai)
  "Hindu-Tamil Nadu": {
    religion: "Hindu",
    region: "Tamil Nadu",
    community: "Tamil Brahmin",
    foodContext: "Pure Vegetarian Tamil Brahmin Ela Sadya served on fresh banana leaves: Sambar, Rasam, Poriyal, Kootu, Vadai, Paal Payasam, and Filter Coffee.",
    dressExpectations: "Traditional South Indian Wear: Kanchipuram Silk Sarees for women; Veshti (Dhoti) & Angavastram shirt for men.",
    guestRules: "Guests participate in the fun Oonjal (swing) ceremony, observe the Mangalya Dharanam & Saptapadi, and enjoy a traditional banana leaf feast.",
    etiquetteNotes: "Eat with your right hand on the banana leaf. Fold the leaf top-to-bottom after finishing to express appreciation to the host family.",
    defaultCeremonies: [
      {
        name: "Vratham & Oonjal Ceremony",
        description: "Morning prayers followed by the couple sitting on a decorated wooden swing while women sing auspicious folk songs.",
        defaultTimeRange: "07:00 - 09:30",
        guestParticipation: "participate",
      },
      {
        name: "Mangalya Dharanam & Pheras",
        description: "Tying of the sacred Thali/Mangalsutra at the precise auspicious Muhurtham moment accompanied by Nadaswaram music.",
        defaultTimeRange: "09:30 - 11:30",
        guestParticipation: "observe",
      },
      {
        name: "Traditional Ela Sadya Feast",
        description: "Multi-course pure vegetarian banquet served on fresh green banana leaves in traditional seated style.",
        defaultTimeRange: "12:00 - 14:30",
        guestParticipation: "participate",
      },
    ],
    defaultTraditions: [
      { name: "Mangalya Dharanam", description: "Sacred tying of the gold Thali thread symbolizing eternal marriage commitment." },
      { name: "Oonjal (Swing)", description: "Gentle swinging ceremony warding off evil eyes with colored rice balls." },
    ],
  },

  // 8. Hindu - West Bengal (Kolkata)
  "Hindu-West Bengal": {
    religion: "Hindu",
    region: "West Bengal",
    community: "Bengali Hindu",
    foodContext: "Traditional Bengali Bhoj: Chingri Malai Curry, Kosha Mangsho, Bhetori Paturi, Cholar Dal, Luchi, Mishti Doi, and Rosogolla.",
    dressExpectations: "Bengali Traditional: Red & White Baluchari or Kanjivaram Silk Saree for women; Kurta with Dhoti (Panjabi) for men.",
    guestRules: "Guests blow conch shells during Subho Drishti, observe the Mala Badal garland exchange, and attend the grand Bou Bhat reception feast.",
    etiquetteNotes: "Conch shells (Shankha) and Ululudhvani sound greetings during auspicious moments.",
    defaultCeremonies: [
      {
        name: "Gaye Holud (Turmeric Ceremony)",
        description: "Applying fresh turmeric paste to the couple amidst Rabindra Sangeet music and floral decorations.",
        defaultTimeRange: "09:30 - 12:00",
        guestParticipation: "participate",
      },
      {
        name: "Subho Drishti & Sampradan",
        description: "Bride covers eyes with betel leaves until auspicious first eye contact (Subho Drishti), followed by garland exchange and Vedic vows.",
        defaultTimeRange: "18:00 - 21:00",
        guestParticipation: "observe",
      },
      {
        name: "Bou Bhat Reception Feast",
        description: "Groom's family hosts grand reception dinner featuring iconic Bengali sweet delicacies and live sitar music.",
        defaultTimeRange: "19:00 - 23:00",
        guestParticipation: "participate",
      },
    ],
    defaultTraditions: [
      { name: "Subho Drishti", description: "First auspicious gaze between bride and groom behind betel leaves." },
      { name: "Mala Badal", description: "Exchange of flower garlands three times signifying mutual acceptance." },
    ],
  },

  // 9. Buddhist - Ladakh (Leh)
  "Buddhist-Ladakh": {
    religion: "Buddhist",
    region: "Ladakh",
    community: "Ladakhi Buddhist",
    foodContext: "Traditional Himalayan Feast: Skyu, Thukpa, Mokmoks (dumplings), Butter Tea (Gur Gur Chai), and local barley beer (Chhang).",
    dressExpectations: "Traditional Ladakhi Goncha with colorful silk sashes (Skerag). Warm woolen layers essential for high altitude.",
    guestRules: "Guests receive ceremonial white silk scarves (Khatak), receive blessings from monastic Rinpoches, and participate in folk dancing.",
    etiquetteNotes: "Walk clockwise around prayer flags and monastic altars. Maintain quiet respect during monk chanting.",
    defaultCeremonies: [
      {
        name: "Monastery Blessing Ceremony",
        description: "Solemn prayer and chanting by Buddhist monks in a high-altitude mountain monastery.",
        defaultTimeRange: "09:00 - 11:30",
        guestParticipation: "observe",
      },
      {
        name: "Khatak Offering & Folk Dance",
        description: "Offering ceremonial silk scarves (Khatak) followed by Jabro folk dances and butter tea.",
        defaultTimeRange: "13:00 - 16:00",
        guestParticipation: "participate",
      },
      {
        name: "Himalayan Cultural Banquet",
        description: "Community banquet with local Ladakhi musical instruments (Damnyan) and bonfire.",
        defaultTimeRange: "18:00 - 21:30",
        guestParticipation: "participate",
      },
    ],
    defaultTraditions: [
      { name: "Khatak Presentation", description: "Bestowing white silk scarves symbolizing purity, goodwill, and auspicious fortune." },
      { name: "Monastic Chanting", description: "Sacred sutra recitation invoking peace and harmony for the couple's life." },
    ],
  },
};

/**
 * Validates a wedding's cultural configuration and returns any critical contradictions.
 */
export function validateWeddingAuthenticity(data: {
  religion?: string;
  region?: string;
  community?: string;
  title?: string;
  description?: string;
  events?: { name: string; description?: string }[];
  traditions?: { name: string; description?: string }[];
}): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const religion = (data.religion || "Hindu") as ReligionType;
  const prohibitedTerms = PROHIBITED_CEREMONY_TERMS[religion] || [];

  const allText = [
    data.title || "",
    data.description || "",
    ...(data.events || []).flatMap((e) => [e.name, e.description || ""]),
    ...(data.traditions || []).flatMap((t) => [t.name, t.description || ""]),
  ]
    .join(" ")
    .toLowerCase();

  for (const term of prohibitedTerms) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(allText)) {
      errors.push(
        `CULTURAL CONTRADICTION: A ${religion} wedding cannot contain Hindu/Sikh/Christian specific ceremony term '${term}'.`
      );
    }
  }

  // Warning checks for generic food / dress descriptions
  if (data.description && data.description.includes("generic Indian wedding")) {
    warnings.push("Avoid using generic terms like 'generic Indian wedding'. Specify region & community.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Resolves comprehensive cultural defaults for a given religion, region, and community.
 */
export function resolveCulturalProfileDefaults(
  religion: string = "Hindu",
  region?: string,
  community?: string
): CulturalProfileDefaults {
  const key = `${religion}-${region || ""}`;
  if (CULTURAL_PROFILES[key]) {
    return CULTURAL_PROFILES[key];
  }

  // Fallbacks by religion
  switch (religion) {
    case "Muslim":
      return {
        religion: "Muslim",
        region: (region as RegionType) || "Uttar Pradesh",
        community: community || "Muslim Heritage",
        foodContext: "Authentic Halal Cuisine: Rich Dum Biryani, Kebabs, Sheer Khurma, and traditional sweets.",
        dressExpectations: "Anarkali / Sharara suits for women; Sherwani or formal Kurta Pajama for men. Modest dress for Nikah.",
        guestRules: "Guests observe the Nikah ceremony and join the main Walima reception banquet.",
        etiquetteNotes: "Please remove shoes prior to stepping into prayer areas. Alcohol is not served during religious solemnization.",
        defaultCeremonies: [
          { name: "Mehndi & Henna Gathering", description: "Evening of intricate henna artwork and live music.", defaultTimeRange: "18:00 - 22:00", guestParticipation: "participate" },
          { name: "Nikah Solemnization", description: "Solemn marital contract and Dua blessings in the presence of Qazi.", defaultTimeRange: "11:00 - 13:00", guestParticipation: "observe" },
          { name: "Walima Banquet", description: "Grand festive reception feast hosted by the groom's family.", defaultTimeRange: "19:00 - 23:00", guestParticipation: "participate" },
        ],
        defaultTraditions: [
          { name: "Nikah Vows (Qabul Hai)", description: "Solemn affirmation of the marriage contract." },
          { name: "Walima Hospitality", description: "Festive celebration banquet sharing joy with friends and family." },
        ],
      };

    case "Sikh":
      return {
        religion: "Sikh",
        region: (region as RegionType) || "Punjab",
        community: community || "Punjabi Sikh",
        foodContext: "Punjabi Vegetarian Cuisine & Guru Ka Langar: Dal Makhani, Paneer Tikka, Amritsari Kulcha, and fresh Kadah Prasad.",
        dressExpectations: "Punjabi Suits / Lehengas for women; Kurta Pajama with Turban for men. MANDATORY head covering inside Gurdwara.",
        guestRules: "Guests attend Gurdwara Anand Karaj ceremony as respectful observers and sit together for Guru Ka Langar.",
        etiquetteNotes: "Remove shoes and cover head (Rumaal provided) before entering Gurdwara main hall.",
        defaultCeremonies: [
          { name: "Jaggo & Sangeet Night", description: "Lively Punjabi folk dance and dhol music.", defaultTimeRange: "18:00 - 23:00", guestParticipation: "participate" },
          { name: "Milni & Anand Karaj", description: "Meeting of families followed by Anand Karaj in Gurdwara around Sri Guru Granth Sahib Ji.", defaultTimeRange: "09:00 - 12:30", guestParticipation: "observe" },
          { name: "Guru Ka Langar & Reception", description: "Community vegetarian meal followed by celebratory evening reception.", defaultTimeRange: "13:00 - 16:00", guestParticipation: "participate" },
        ],
        defaultTraditions: [
          { name: "Laavan", description: "Four sacred hymns binding the couple in spiritual and marital union." },
          { name: "Guru Ka Langar", description: "Equality community meal served in the Gurdwara." },
        ],
      };

    case "Christian":
      return {
        religion: "Christian",
        region: (region as RegionType) || "Goa",
        community: community || "Indian Christian",
        foodContext: "Festive Christian Banquet: Regional delicacies, roasted meats, wedding cake, and wine.",
        dressExpectations: "Formal Western Wear: Tuxedo / Suit for men; Gown or Festive Saree for women.",
        guestRules: "Guests attend Church Nuptial Mass as respectful observers and join the reception dance.",
        etiquetteNotes: "Please maintain silence during church mass. Photography permitted in designated areas.",
        defaultCeremonies: [
          { name: "Roce / Henna Evening", description: "Coconut milk blessing and pre-wedding gathering.", defaultTimeRange: "17:00 - 20:30", guestParticipation: "participate" },
          { name: "Church Nuptial Mass", description: "Solemn marriage vows and nuptial mass in church.", defaultTimeRange: "15:00 - 17:00", guestParticipation: "observe" },
          { name: "Wedding Reception", description: "Toast, first dance, cake cutting, and dinner.", defaultTimeRange: "18:30 - 23:00", guestParticipation: "participate" },
        ],
        defaultTraditions: [
          { name: "Nuptial Mass", description: "Church solemnization of holy matrimony." },
          { name: "Toast & First Dance", description: "Reception tradition celebrating the couple." },
        ],
      };

    default:
      return {
        religion: "Hindu",
        region: (region as RegionType) || "Rajasthan",
        community: community || "Rajput / Marwari",
        foodContext: "Authentic Regional Indian Cuisine: Vegetarian & Vegan options thoughtfully prepared.",
        dressExpectations: "Traditional Festive Wear (Lehenga, Saree, Kurta Pajama) or Smart Casual.",
        guestRules: "Guests actively join the Sangeet dance and observe sacred Mandap rituals.",
        etiquetteNotes: "Remove footwear before entering sacred Mandap areas.",
        defaultCeremonies: [
          { name: "Sangeet & Henna Night", description: "Evening of dance, music, and henna artwork.", defaultTimeRange: "18:00 - 22:30", guestParticipation: "participate" },
          { name: "Baraat & Mandap Pheras", description: "Festive procession followed by sacred wedding vows around Agni fire.", defaultTimeRange: "10:00 - 14:00", guestParticipation: "participate" },
          { name: "Celebratory Reception", description: "Grand celebratory dinner and cultural performances.", defaultTimeRange: "19:00 - 23:00", guestParticipation: "participate" },
        ],
        defaultTraditions: [
          { name: "Saptapadi (7 Pheras)", description: "Seven sacred vows taken around the holy fire." },
          { name: "Baraat Procession", description: "Groom's arrival with music and dancing family." },
        ],
      };
  }
}
