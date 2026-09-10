import type {
  Category,
  Testimonial,
  Country,
  FAQItem,
  Stat,
  HowItWorksStep,
} from "@/types";

export const categories: Category[] = [
  {
    id: "royal",
    name: "Royal",
    slug: "royal",
    count: 6,
    weddingCount: 6,
    icon: "Crown",
    description: "Grand palaces, regal traditions & Maharaja heritage",
    imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
  },
  {
    id: "punjabi",
    name: "Punjabi",
    slug: "punjabi",
    count: 3,
    weddingCount: 3,
    icon: "Flame",
    description: "Vibrant celebrations full of joy, dhol & bhangra",
    imageUrl: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=800&q=80",
  },
  {
    id: "south-indian",
    name: "South Indian",
    slug: "south-indian",
    count: 4,
    weddingCount: 4,
    icon: "Flower2",
    description: "Sacred traditions with temple elegance & banana leaf sadyas",
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  },
  {
    id: "beach",
    name: "Beach",
    slug: "beach",
    count: 3,
    weddingCount: 3,
    icon: "Waves",
    description: "Ocean-side romance at sunset along coastal shores",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  },
  {
    id: "destination",
    name: "Destination",
    slug: "destination",
    count: 4,
    weddingCount: 4,
    icon: "Compass",
    description: "Exotic locales from Himalayan peaks to tea estates",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    id: "traditional",
    name: "Traditional",
    slug: "traditional",
    count: 5,
    weddingCount: 5,
    icon: "Sparkles",
    description: "Time-honoured rituals, spiritual unions & rich heritage",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
  },
  {
    id: "nature",
    name: "Nature",
    slug: "nature",
    count: 3,
    weddingCount: 3,
    icon: "Trees",
    description: "Backwater groves, mountain meadows & pine valleys",
    imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80",
  },
];

export const weddingCategories = categories;

export const stats: Stat[] = [
  { label: "Curated Celebrations", value: "Multi-Day" },
  { label: "Partner Regions", value: "12+" },
  { label: "Cultural Traditions", value: "Diverse" },
];

export const heroStats = stats;

export const testimonials: Testimonial[] = [];

export const countries: Country[] = [
  {
    code: "RJ",
    name: "Rajasthan",
    weddingCount: 5,
    imageUrl: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Palaces, golden dunes, and grand haveli celebrations in Jodhpur, Jaipur & Udaipur.",
  },
  {
    code: "GA",
    name: "Goa",
    weddingCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    description: "Coastal celebrations, oceanfront mandaps, and tropical sunset receptions.",
  },
  {
    code: "KL",
    name: "Kerala",
    weddingCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    description: "Serene backwater houseboats, banana leaf Sadya feasts, and palm-shaded rituals.",
  },
  {
    code: "PB",
    name: "Punjab",
    weddingCount: 2,
    imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
    description: "Vibrant Anand Karaj ceremonies, Golden Temple heritage, and high-energy Dhol bhangra.",
  },
  {
    code: "DL",
    name: "Delhi & North",
    weddingCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Sprawling garden estates, multicultural unions, and imperial heritage banquets.",
  },
  {
    code: "SI",
    name: "South India & Hills",
    weddingCount: 4,
    imageUrl: "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&q=80",
    description: "Coastal temple mandapams, Himalayan pine valleys, and classical music ceremonies.",
  },
];

export const faqItems: FAQItem[] = [
  {
    id: "f1",
    question: "What is WeddingWithIndia?",
    answer: "WeddingWithIndia is a premier cultural platform connecting international travelers and cultural enthusiasts with real Indian families hosting authentic wedding celebrations across India.",
    category: "General",
  },
  {
    id: "f2",
    question: "How are hosts and weddings verified?",
    answer: "Every wedding host undergoes strict identity verification, profile screening, and ceremony schedule review by our admin team before listing their celebration.",
    category: "Verification",
  },
  {
    id: "f3",
    question: "What is included with a Guest Pass?",
    answer: "A Guest Pass includes access to scheduled ceremonial events, authentic wedding feasts, cultural performances, and assigned wedding buddy support.",
    category: "Experience",
  },
  {
    id: "f4",
    question: "What traditions and celebration durations are available?",
    answer: "WeddingWithIndia offers 1-day, 2-day, 3-day, 4-day, and 5-day wedding experiences across diverse traditions including Hindu, Muslim, Sikh, Christian, Jain, Buddhist, and Interfaith celebrations.",
    category: "Experience",
  },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: 1,
    icon: "Compass",
    title: "Browse Curated Celebrations",
    description: "Explore 1-day to 5-day authentic wedding experiences across Rajasthan, Kerala, Punjab, and Goa.",
  },
  {
    step: 2,
    icon: "UserCheck",
    title: "Request Host Approval",
    description: "Submit your guest profile for host review and receive personalized event details upon verification.",
  },
  {
    step: 3,
    icon: "PlaneTakeoff",
    title: "Prepare & Travel Support",
    description: "Your dedicated guest liaison assists with airport pickup, hotel coordination, and traditional attire guidance.",
  },
  {
    step: 4,
    icon: "Sparkles",
    title: "Attend as an Honoured Guest",
    description: "Receive your digital VIP Guest Pass, step inside sacred rituals, feast, dance, and celebrate as family.",
  },
];
