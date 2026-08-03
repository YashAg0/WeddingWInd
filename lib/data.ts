import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";
import type {
  Wedding,
  Category,
  Testimonial,
  Country,
  FAQItem,
  Stat,
  HowItWorksStep,
} from "@/types";

export const featuredWeddings: Wedding[] = [
  {
    id: "w1",
    slug: "grand-maharaja-wedding",
    title: "The Grand Maharaja Wedding",
    location: "Umaid Bhawan Palace, Jodhpur",
    city: "Jodhpur",
    state: "Rajasthan",
    country: "India",
    countryCode: "IN",
    category: "Royal",
    pricePerGuest: 7499,
    currency: "INR",
    rating: 4.98,
    reviewCount: 124,
    guestsAllowed: 500,
    guestsBooked: 342,
    imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85",
    coupleImage: "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400&q=80",
    coupleName: "Devika & Kaber",
    hostName: "Arjun Mehra",
    hostAvatar: "https://i.pravatar.cc/80?img=7",
    featured: true,
    tags: ["Heritage Palace", "Royal Feast", "Grand Procession"],
    date: "2025-02-14",
    religion: "Hinduism",
    luxuryLevel: "Ultra-Luxury",
    durationDays: 3,
    languages: ["English", "Hindi"],
    isVerified: true,
    gallery: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"
    ],
    story: "Welcome to our royal fairy tale. We are Devika, an art historian, and Kaber, a heritage conservationist. Our wedding is a celebration of centuries-old Marwari traditions set in the golden sands of Jodhpur. We want to welcome global guests to experience the hospitality, folk music, and vibrant colors of Rajasthan.",
    coupleBio: "Devika and Kaber met while working on the restoration of a 15th-century fort in Rajasthan. Their shared love for history, architecture, and classical music led them to plan a wedding that honors royal heritage and classic hospitality.",
    timeline: [
      {
        title: "Mehndi & Welcome Feast",
        time: "16:00 - 22:00",
        date: "Day 1 - Feb 14",
        description: "Intricate henna art, traditional Rajasthani folk dances (Ghoomar), and an outdoor feast overlooking Jodhpur's blue city.",
        icon: "🎨"
      },
      {
        title: "Sangeet Extravaganza",
        time: "18:00 - 23:30",
        date: "Day 2 - Feb 15",
        description: "A grand evening of musical performances, dance-offs between families, and gourmet palace dining.",
        icon: "💃"
      },
      {
        title: "Royal Baraat & Wedding Ceremony",
        time: "15:30 - 20:30",
        date: "Day 3 - Feb 16",
        description: "The groom's arrival on a decorated vintage car accompanied by drums and dancers, followed by the sacred Vedic wedding rituals and reception.",
        icon: "Crown"
      }
    ],
    traditions: [
      {
        title: "Pheras (Seven Vows)",
        description: "The couple walks around the sacred fire seven times, making vows of love, loyalty, health, and mutual respect."
      },
      {
        title: "Baraat Procession",
        description: "A lively parade where the groom, family, and guests dance their way to the wedding venue, celebrating the union."
      }
    ],
    dressCode: "Day 1: Colorful smart casuals. Day 2: Glamorous ethnic or cocktail wear. Day 3: Royal traditional wear (Sherwanis for men, Sarees/Lehengas for women). Heavy embroidery and bright colors are highly recommended!",
    foodDescription: "A curated royal Marwari menu featuring Dal Baati Churma, Laal Maas, and exquisite desserts like Mohan Thal, alongside international gourmet selections.",
    venueDescription: "The iconic Umaid Bhawan Palace, one of the world's largest private residences, constructed with yellow sandstone and boasting art-deco interiors.",
    accommodation: "Premium heritage rooms inside the palace compound with royal hospitality, private lawns, and round-the-clock service.",
    included: [
      "Access to all ceremonies (Mehndi, Sangeet, Wedding Ceremony)",
      "All meals, beverages, and premium spirits during celebrations",
      "Traditional Rajasthani wedding outfits hire coordination",
      "Private luxury transfers from Jodhpur airport",
      "Dedicated bilingual guest liaison manager"
    ],
    notIncluded: [
      "International flights",
      "Travel insurance",
      "Personal shopping and excursions"
    ],
    reviews: [
      {
        id: "r1",
        authorName: "Sarah & James",
        authorAvatar: "https://i.pravatar.cc/80?img=25",
        rating: 5,
        date: "Feb 2025",
        content: "Words cannot describe the magic. Devika's family welcomed us like we were their own relatives. The location was breathtaking, and the food was a culinary journey!"
      }
    ],
    faqs: [
      {
        id: "faq1",
        question: "Is it okay if I don't speak Hindi?",
        answer: "Absolutely! The host family and our liaison team speak fluent English, and weddings are a universal language of joy anyway.",
        category: "General"
      }
    ]
  },
  {
    id: "w2",
    slug: "beachside-goa-celebration",
    title: "Beachside Goa Celebration",
    location: "Cavelossim Beach, Goa",
    city: "Cavelossim",
    state: "Goa",
    country: "India",
    countryCode: "IN",
    category: "Beach",
    pricePerGuest: 7499,
    currency: "INR",
    rating: 4.91,
    reviewCount: 89,
    guestsAllowed: 200,
    guestsBooked: 147,
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=85",
    coupleImage: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&q=80",
    coupleName: "Alisha & Ryan",
    hostName: "Priya Nair",
    hostAvatar: "https://i.pravatar.cc/80?img=47",
    featured: true,
    tags: ["Sunset View", "Open Bar", "DJ Night"],
    date: "2025-01-18",
    religion: "Christianity / Hindu",
    luxuryLevel: "Luxury",
    durationDays: 2,
    languages: ["English", "Malayalam"],
    isVerified: true,
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80"
    ],
    story: "Our love story is a mix of cultures, much like Goa itself. Ryan is from London and Alisha is from Kerala. We're celebrating our wedding on the beautiful white sands of Cavelossim with a beachside fusion ceremony, coastal music, and plenty of sea breezes.",
    coupleBio: "Alisha is a marine biologist and Ryan is a digital designer. They met in Bali and decided to bring their friends and family together in Goa for a relaxed, sun-kissed celebration.",
    timeline: [
      {
        title: "Sunset Sundowner & BBQ",
        time: "17:00 - 22:00",
        date: "Day 1 - Jan 18",
        description: "Cocktails, fresh grilled seafood, acoustic live music, and feet-in-the-sand networking.",
        icon: "🍹"
      },
      {
        title: "Fusion Beach Wedding & Reception",
        time: "16:00 - 23:30",
        date: "Day 2 - Jan 19",
        description: "Exchange of vows under a floral canopy during sunset, followed by a beachfront dance party, champagne toast, and fireworks.",
        icon: "🌊"
      }
    ],
    traditions: [
      {
        title: "Mangalsutra & Ring Exchange",
        description: "A blending of Indian traditions (tying the sacred golden thread) and Western vows on the shoreline."
      }
    ],
    dressCode: "Day 1: Beach casual / linen shirts and sundresses. Day 2: Beach formal / pastel-colored suits, flowy dresses, and light ethnic wear. Leave your stilettoes at home!",
    foodDescription: "A fusion buffet emphasizing fresh Goan seafood, coastal curry dishes, wood-fired pizzas, and tropical desserts.",
    venueDescription: "A private beachfront resort lawn in South Goa, direct access to clean sands, palm tree fringes, and gorgeous sunset vistas.",
    accommodation: "Chic beach bungalows with modern amenities, private decks, and pool access.",
    included: [
      "Access to the Sundowner and Wedding Ceremony",
      "All meals and open bar during celebrations",
      "Welcome Goan hamper",
      "Airport transfers in Goa"
    ],
    notIncluded: [
      "Flight tickets",
      "Traditional clothing rentals"
    ],
    reviews: [
      {
        id: "r2",
        authorName: "John Doe",
        authorAvatar: "https://i.pravatar.cc/80?img=12",
        rating: 5,
        date: "Jan 2025",
        content: "Attending this beach wedding was the highlight of our winter. Perfect sunset views and amazing coastal hospitality!"
      }
    ],
    faqs: [
      {
        id: "faq2",
        question: "Is accommodation included in the price?",
        answer: "Yes, standard accommodation in our partner beach resort is fully covered for the duration of the wedding event.",
        category: "Lodging"
      }
    ]
  },
  {
    id: "w3",
    slug: "punjabi-shaadi-extravaganza",
    title: "Punjabi Shaadi Extravaganza",
    location: "The Oberoi, Amritsar",
    city: "Amritsar",
    state: "Punjab",
    country: "India",
    countryCode: "IN",
    category: "Punjabi",
    pricePerGuest: 7499,
    currency: "INR",
    rating: 4.95,
    reviewCount: 211,
    guestsAllowed: 1000,
    guestsBooked: 876,
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=85",
    coupleImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80",
    coupleName: "Manpreet & Jaspreet",
    hostName: "Harpreet Singh",
    hostAvatar: "https://i.pravatar.cc/80?img=12",
    featured: true,
    tags: ["Bhangra Night", "Gala Dinner", "Fireworks"],
    date: "2025-03-05",
    religion: "Sikhism",
    luxuryLevel: "Luxury",
    durationDays: 3,
    languages: ["English", "Punjabi", "Hindi"],
    isVerified: true,
    gallery: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80",
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80"
    ],
    story: "Get ready for the loudest, most energetic wedding you will ever attend. We are Manpreet and Jaspreet. Our wedding in Amritsar is all about heart, hospitality, bhangra beats, and butter chicken. We are excited to open our gates to guests from all corners of the globe.",
    coupleBio: "Manpreet is a software engineer based in Vancouver and Jaspreet is a fashion designer from Amritsar. They are combining their worlds in a vibrant, musical celebration in their hometown.",
    timeline: [
      {
        title: "Chura & Dhol Night",
        time: "17:00 - 22:00",
        date: "Day 1 - Mar 5",
        description: "Bridal bangle ceremony, high-tempo dhol drumming, and traditional Punjabi village food.",
        icon: "🥁"
      },
      {
        title: "Bhangra & Sangeet",
        time: "18:00 - 23:30",
        date: "Day 2 - Mar 6",
        description: "Heavy dance performances, bhangra show, and a massive tandoori buffet feast.",
        icon: "🕺"
      },
      {
        title: "Anand Karaj (Gurudwara Wedding)",
        time: "09:00 - 14:00",
        date: "Day 3 - Mar 7",
        description: "The serene Sikh wedding ceremony at the Gurudwara, followed by the reception banquet.",
        icon: "Sparkles"
      }
    ],
    traditions: [
      {
        title: "Anand Karaj",
        description: "The blissful union ceremony conducted in the presence of the Guru Granth Sahib, involving four rounds (Laavan)."
      }
    ],
    dressCode: "Day 1: Punjabi traditional / yellow-themed outfits. Day 2: Brightly colored ethnics. Day 3: Conservative, modest attire for the temple (heads must be covered).",
    foodDescription: "Authentic tandoori meats, dal makhani, stuffed naans, and sweets like Jalebi and Kulfi.",
    venueDescription: "The majestic Oberoi resort in Amritsar, blending luxury heritage design with lush green gardens.",
    accommodation: "Luxury rooms inside the resort compound with full access to pool and wellness centers.",
    included: [
      "Access to all ceremonies and feasts",
      "Traditional Punjabi head scarfs / turbans styling",
      "Guided Golden Temple tour before the wedding",
      "All meals and non-alcoholic beverages",
      "Dedicated group guide"
    ],
    notIncluded: [
      "Alcoholic drinks (dry venue during ceremonies)",
      "Flights and visa fees"
    ],
    reviews: [
      {
        id: "r3",
        authorName: "Emily Watson",
        authorAvatar: "https://i.pravatar.cc/80?img=36",
        rating: 5,
        date: "Mar 2025",
        content: "The energy was infectious! We danced for three days straight and tasted the best food in India."
      }
    ],
    faqs: [
      {
        id: "faq3",
        question: "Is alcohol served at the wedding?",
        answer: "No, in keeping with religious traditions, our wedding events are completely dry. However, the mocktail selection is spectacular!",
        category: "Food & Drinks"
      }
    ]
  },
  {
    id: "w4",
    slug: "south-indian-temple-wedding",
    title: "South Indian Temple Wedding",
    location: "Isha Yoga Center, Coimbatore",
    city: "Coimbatore",
    state: "Tamil Nadu",
    country: "India",
    countryCode: "IN",
    category: "South Indian",
    pricePerGuest: 7499,
    currency: "INR",
    rating: 4.89,
    reviewCount: 67,
    guestsAllowed: 300,
    guestsBooked: 201,
    imageUrl: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200&q=85",
    coupleImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80",
    coupleName: "Lakshmi & Srinivas",
    hostName: "Lakshmi Rao",
    hostAvatar: "https://i.pravatar.cc/80?img=49",
    featured: true,
    tags: ["Classical Music", "Silk Sarees", "Sadya Feast"],
    date: "2025-04-10",
    religion: "Hinduism",
    luxuryLevel: "Premium",
    durationDays: 2,
    languages: ["English", "Tamil", "Telugu"],
    isVerified: true,
    gallery: [
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80",
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"
    ],
    story: "Discover the deep spiritual traditions of a classical South Indian wedding. Set in the foothills of the Velliangiri Mountains, our wedding combines ancient temple architecture, Carnatic music, and a traditional meal served on banana leaves.",
    coupleBio: "Lakshmi is a Bharatnatyam dancer and Srinivas is a yoga instructor. They believe in simplicity, spiritual connection, and sharing their culture with seekers from around the world.",
    timeline: [
      {
        title: "Vratham & Traditional Music",
        time: "15:00 - 19:00",
        date: "Day 1 - Apr 10",
        description: "Purifying prayers, classical music recitals, and setting up the floral mandapam.",
        icon: "🪷"
      },
      {
        title: "Muhurtham & Sadya Feast",
        time: "06:00 - 15:00",
        date: "Day 2 - Apr 11",
        description: "Early morning Vedic rituals, exchange of garlands, tying the Thali, and a massive 26-course vegetarian Sadya feast.",
        icon: "🍃"
      }
    ],
    traditions: [
      {
        title: "Kanyadaan",
        description: "The emotional ceremony of the bride's father placing her hand in the groom's, marking the transition."
      },
      {
        title: "Sadya Feast",
        description: "A traditional banquet served on banana leaves, eaten with fingers, featuring 26+ diverse vegetarian dishes."
      }
    ],
    dressCode: "Day 1: Elegant traditional wear. Day 2: Bright silk sarees for women, traditional Veshtis (dhotis) or kurtas for men. Subtle colors and gold accents are preferred.",
    foodDescription: "A legendary 26-course vegetarian Sadya meal featuring Sambar, Rasam, Payasam, and traditional pickles served on banana leaves.",
    venueDescription: "The peaceful, spiritual grounds of the Isha Yoga Center temple complex, surrounded by hills and green forests.",
    accommodation: "Simple, highly comfortable cottage rooms inside the ashram/center, focused on wellness and peace.",
    included: [
      "Ashram cottage accommodation",
      "Full traditional Sadya feast",
      "Silk Veshti/Angavastram (dhotis) provided for male guests",
      "Yoga and meditation session access",
      "Guide explaining the meaning of rituals"
    ],
    notIncluded: [
      "Airport flights",
      "Non-vegetarian meals (strict vegetarian venue)"
    ],
    reviews: [
      {
        id: "r4",
        authorName: "Aline Meier",
        authorAvatar: "https://i.pravatar.cc/80?img=49",
        rating: 5,
        date: "Apr 2025",
        content: "A deeply spiritual, peaceful experience. The music, the temple, the hospitality — it felt like stepping back in time."
      }
    ],
    faqs: [
      {
        id: "faq4",
        question: "Can I get non-vegetarian food?",
        answer: "The venue is a strict vegetarian and spiritual center. No meat or alcohol is permitted on site.",
        category: "Food & Drinks"
      }
    ]
  },
  {
    id: "w5",
    slug: "rajasthan-desert-romance",
    title: "Rajasthan Desert Romance",
    location: "Sam Sand Dunes, Jaisalmer",
    city: "Jaisalmer",
    state: "Rajasthan",
    country: "India",
    countryCode: "IN",
    category: "Destination",
    pricePerGuest: 7499,
    currency: "INR",
    rating: 4.97,
    reviewCount: 153,
    guestsAllowed: 150,
    guestsBooked: 98,
    imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=85",
    coupleImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80",
    coupleName: "Neha & Kabir",
    hostName: "Vikram Rajput",
    hostAvatar: "https://i.pravatar.cc/80?img=15",
    featured: true,
    tags: ["Desert Camp", "Camel Ride", "Stargazing"],
    date: "2025-12-20",
    religion: "Hinduism",
    luxuryLevel: "Luxury",
    durationDays: 2,
    languages: ["English", "Hindi", "Rajasthani"],
    isVerified: true,
    gallery: [
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"
    ],
    story: "Exchange vows under a starry desert canopy. We are Neha and Kabir, and we are hosting a destination desert wedding in the golden dunes of Jaisalmer. Experience camel caravans, vibrant Rajasthani puppet shows, folk musicians, and dinner on the dunes.",
    coupleBio: "Neha is a travel writer and Kabir is an astronomical photographer. Their love for the desert and open skies led them to plan this remote, exotic dune wedding.",
    timeline: [
      {
        title: "Camel Caravan & Sunset Campfire",
        time: "16:00 - 21:30",
        date: "Day 1 - Dec 20",
        description: "Camel rides into the sunset, traditional Manganiyar folk music around the campfire, and desert camping.",
        icon: "🐪"
      },
      {
        title: "Dune Ceremony & Stargazing Feast",
        time: "15:00 - 23:00",
        date: "Day 2 - Dec 21",
        description: "A breathtaking wedding ceremony on a sand dune, followed by a gourmet dinner under the stars, bonfire, and guided stargazing.",
        icon: "Sparkles"
      }
    ],
    traditions: [
      {
        title: "Varmala Exchange",
        description: "The groom and bride exchange beautiful floral garlands, symbolizing acceptance and welcoming each other into their lives."
      }
    ],
    dressCode: "Day 1: Desert comfortable / warm layers for the evening. Day 2: Bright Indian traditional outfits or desert formal wear.",
    foodDescription: "Classic Rajasthani Ker Sangri, Gatte ki Sabzi, barbecued skewers, and warm milk desserts like Rabdi.",
    venueDescription: "A luxury tented camp nestled in the Sam Sand Dunes, offering luxury amenities under a canopy of stars.",
    accommodation: "Luxury Swiss glamping tents with ensuite bathrooms, heating, and private verandahs.",
    included: [
      "Luxury tented glamping accommodation",
      "All meals and traditional snacks",
      "Sunset camel safari",
      "Guided telescope stargazing session",
      "Return transfers from Jaisalmer City"
    ],
    notIncluded: [
      "Flights to Jodhpur/Jaisalmer",
      "Alcoholic beverages"
    ],
    reviews: [
      {
        id: "r5",
        authorName: "Alexander K.",
        authorAvatar: "https://i.pravatar.cc/80?img=15",
        rating: 5,
        date: "Dec 2024",
        content: "Sleeping in luxury tents and dancing on the sand dunes was unforgettable. True desert hospitality!"
      }
    ],
    faqs: [
      {
        id: "faq5",
        question: "Does it get cold in the desert?",
        answer: "Yes, Jaisalmer desert temperatures drop significantly at night in December. Tents have heating, but warm clothes are highly recommended.",
        category: "General"
      }
    ]
  },
  {
    id: "w6",
    slug: "kerala-backwater-wedding",
    title: "Kerala Backwater Wedding",
    location: "Kumarakom Lake Resort, Kerala",
    city: "Kumarakom",
    state: "Kerala",
    country: "India",
    countryCode: "IN",
    category: "Traditional",
    pricePerGuest: 7499,
    currency: "INR",
    rating: 4.93,
    reviewCount: 95,
    guestsAllowed: 200,
    guestsBooked: 134,
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85",
    coupleImage: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=400&q=80",
    coupleName: "Riya & Arjun",
    hostName: "Ananya Krishnan",
    hostAvatar: "https://i.pravatar.cc/80?img=48",
    featured: false,
    tags: ["Houseboat", "Kathakali", "Organic Cuisine"],
    date: "2025-05-22",
    religion: "Hinduism",
    luxuryLevel: "Luxury",
    durationDays: 2,
    languages: ["English", "Malayalam"],
    isVerified: true,
    gallery: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"
    ],
    story: "Experience the serene backwaters of Kerala. We are Riya and Arjun. Our wedding is hosted in a luxury resort on the shores of Lake Vembanad. We'll celebrate with Kathakali dancers, houseboat sunset cruises, and authentic, organic Kerala food.",
    coupleBio: "Riya is an architect and Arjun is a filmmaker. Both grew up visiting the Kerala backwaters and wanted to share this green, tropical paradise with friends from around the world.",
    timeline: [
      {
        title: "Houseboat Cruise & Kathakali",
        time: "15:00 - 20:00",
        date: "Day 1 - May 22",
        description: "Sunset cruise on traditional houseboats, followed by a Kathakali dance recital and coconut-shell mocktails.",
        icon: "🛶"
      },
      {
        title: "Traditional Nair Wedding & Sadya",
        time: "09:00 - 15:00",
        date: "Day 2 - May 23",
        description: "Traditional morning temple ceremony under decorated coconut leaf mandaps, followed by the classic Sadya feast.",
        icon: "🥥"
      }
    ],
    traditions: [
      {
        title: "Thalikettu",
        description: "The groom ties the Mangalsutra (Thali) around the bride's neck, accompanied by traditional blowing of conch shells and nadaswaram music."
      }
    ],
    dressCode: "Day 1: Casual resort wear / light pastels. Day 2: Traditional Kerala wear. Women in Kasavu sarees (white with gold border), men in white Kasavu Mundus and shirts.",
    foodDescription: "Authentic Kerala cuisine highlighting fish pollichathu, appam with stew, and traditional payasam served on banana leaves.",
    venueDescription: "The luxury Kumarakom Lake Resort, situated on the edge of the scenic Vembanad Lake with heritage wood villas.",
    accommodation: "Heritage pool-view wood villas with traditional Keralan architectural design.",
    included: [
      "Luxury pool villa accommodation",
      "Airport transfers from Cochin International",
      "Traditional Kerala clothing styling guides",
      "All meals and sunset houseboat rides",
      "Dedicated guest liaison support"
    ],
    notIncluded: [
      "Flight tickets",
      "Personal ayurvedic spa therapies"
    ],
    reviews: [
      {
        id: "r6",
        authorName: "Chantal L.",
        authorAvatar: "https://i.pravatar.cc/80?img=48",
        rating: 5,
        date: "May 2025",
        content: "An absolute dream. The houseboat sunset cruise and the peaceful resort were incredible. Riya's family made us feel like royalty."
      }
    ],
    faqs: [
      {
        id: "faq6",
        question: "Can the hosts help us buy traditional clothing?",
        answer: "Yes, our guest liaison manager coordinates with local vendors to source sarees and mundus for guests prior to the events.",
        category: "Clothing"
      }
    ]
  }
];

export const weddingCategories: Category[] = [
  {
    id: "c1",
    name: "Royal",
    description: "Palace ceremonies with regal grandeur",
    imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=85",
    weddingCount: 48,
    icon: "Crown",
  },
  {
    id: "c2",
    name: "Punjabi",
    description: "Vibrant celebrations full of joy & bhangra",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=85",
    weddingCount: 112,
    icon: "Sparkles",
  },
  {
    id: "c3",
    name: "South Indian",
    description: "Sacred traditions with temple elegance",
    imageUrl: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=600&q=85",
    weddingCount: 87,
    icon: "Flower2",
  },
  {
    id: "c4",
    name: "Beach",
    description: "Ocean-side romance at sunset",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=85",
    weddingCount: 63,
    icon: "Waves",
  },
  {
    id: "c5",
    name: "Destination",
    description: "Exotic locales for unforgettable vows",
    imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=85",
    weddingCount: 34,
    icon: "Compass",
  },
  {
    id: "c6",
    name: "Traditional",
    description: "Time-honoured rituals, timeless memories",
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=85",
    weddingCount: 156,
    icon: "Flame",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sophie & James Laurent",
    role: "Guests from Paris, France",
    avatar: "https://i.pravatar.cc/100?img=25",
    content:
      "Wedding With India gave us the most extraordinary experience of our lives. The Maharaja wedding in Jodhpur was pure magic — we felt like royalty for an entire weekend. Every detail was perfectly curated.",
    rating: 5,
    location: "Paris, France",
    weddingType: "Royal Wedding",
    date: "January 2025",
  },
  {
    id: "t2",
    name: "Michael & Sarah Chen",
    role: "Guests from New York, USA",
    avatar: "https://i.pravatar.cc/100?img=36",
    content:
      "We attended a Punjabi wedding through this platform and it completely changed how we see travel. The energy, the food, the dancing — it was an authentic cultural immersion unlike anything we've experienced.",
    rating: 5,
    location: "New York, USA",
    weddingType: "Punjabi Shaadi",
    date: "March 2025",
  },
  {
    id: "t3",
    name: "Elena Rossi",
    role: "Solo traveller from Milan, Italy",
    avatar: "https://i.pravatar.cc/100?img=20",
    content:
      "As a solo traveller, I was nervous about attending a wedding alone. The platform made everything seamless and welcoming. The Kerala backwater wedding was intimate and breathtakingly beautiful.",
    rating: 5,
    location: "Milan, Italy",
    weddingType: "Kerala Backwater",
    date: "May 2025",
  },
  {
    id: "t4",
    name: "David & Aisha Thompson",
    role: "Guests from London, UK",
    avatar: "https://i.pravatar.cc/100?img=60",
    content:
      "The vetting process gave us complete confidence. Our host family treated us like family from the moment we arrived. This is the future of cultural tourism and we've already booked our second wedding.",
    rating: 5,
    location: "London, UK",
    weddingType: "Destination Wedding",
    date: "December 2024",
  },
];

export const countries: Country[] = [
  {
    code: "IN",
    name: "India",
    weddingCount: 1247,
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=85",
    description: "Rajasthan, Goa, Kerala, Punjab & more",
  },
  {
    code: "NP",
    name: "Nepal",
    weddingCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&q=85",
    description: "Himalayan backdrops, ancient temples",
  },
  {
    code: "LK",
    name: "Sri Lanka",
    weddingCount: 143,
    imageUrl: "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=600&q=85",
    description: "Colonial heritage, tropical beaches",
  },
  {
    code: "TH",
    name: "Thailand",
    weddingCount: 67,
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=85",
    description: "Buddhist ceremonies, island escapes",
  },
];

export const faqItems: FAQItem[] = [
  {
    id: "f1",
    question: "How does Wedding With India work?",
    answer:
      "Wedding With India connects international travellers with authentic Indian wedding hosts. Families who wish to share their wedding list available dates and guest slots. You browse, choose, and book your seat at a real wedding celebration — experiencing one of the world's most vibrant cultural events as an honoured guest.",
    category: "General",
  },
  {
    id: "f2",
    question: "Are these real weddings or arranged experiences?",
    answer:
      "Every wedding on our platform is 100% real. We work with genuine families who are hosting their weddings and wish to share the experience with international guests. Our team vets each listing to ensure authenticity, safety, and a welcoming atmosphere for all visitors.",
    category: "General",
  },
  {
    id: "f3",
    question: "What does the price per guest include?",
    answer:
      "The price typically includes participation in all wedding ceremonies and celebrations, all meals and refreshments during the event, local transport on wedding days, traditional welcome gifts, and dedicated guest liaison support. Specific inclusions vary by wedding and are clearly listed on each listing page.",
    category: "Pricing",
  },
  {
    id: "f4",
    question: "Is it safe and respectful to attend someone else's wedding?",
    answer:
      "Absolutely. All participating families genuinely want international guests and are culturally inclusive. We brief every guest on local customs, appropriate attire, and etiquette before arrival. Our guest experience team is available throughout your stay. Safety and mutual respect are our top priorities.",
    category: "Safety",
  },
  {
    id: "f5",
    question: "What should I wear to an Indian wedding?",
    answer:
      "We recommend traditional Indian attire such as kurta-pajama for men or salwar-kameez / saree for women, which many hosts can help arrange locally. Smart Western formal wear is also widely accepted. We provide detailed cultural guidelines after booking, including colour preferences and ceremony-specific dress codes.",
    category: "Culture",
  },
  {
    id: "f6",
    question: "Can I cancel or reschedule my booking?",
    answer:
      "We offer a full refund if you cancel more than 30 days before the wedding date. Cancellations within 15–30 days receive a 50% refund. We cannot offer refunds within 14 days as families make firm arrangements. We encourage travel insurance and are happy to help with rescheduling where possible.",
    category: "Booking",
  },
];

export const heroStats: Stat[] = [
  {
    value: BUSINESS_METRICS.WEDDINGS_HOSTED,
    label: "Weddings Listed",
    description: "Across 6 countries",
  },
  {
    value: BUSINESS_METRICS.GLOBAL_GUESTS,
    label: "Happy Guests",
    description: `From ${BUSINESS_METRICS.COUNTRIES_REPRESENTED_NUM} countries`,
  },
  {
    value: BUSINESS_METRICS.AVERAGE_RATING,
    label: "Average Rating",
    description: "Out of 5.0 stars",
  },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: 1,
    icon: "🔍",
    title: "Discover",
    description:
      "Browse verified Indian weddings by style, location, and date. Filter by your travel dates and preferred wedding type.",
  },
  {
    step: 2,
    icon: "📋",
    title: "Book Your Spot",
    description:
      "Reserve your guest slot with a simple, secure checkout. Receive your cultural welcome kit instantly.",
  },
  {
    step: 3,
    icon: "✈️",
    title: "Travel & Arrive",
    description:
      "Your dedicated guest liaison greets you and helps you navigate the celebrations from start to finish.",
  },
  {
    step: 4,
    icon: "🎊",
    title: "Celebrate",
    description:
      "Dance, feast, and form bonds with a family that opens its heart and home to the world.",
  },
];
