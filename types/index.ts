export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  date: string;
  content: string;
}

export interface WeddingEvent {
  title: string;
  time: string;
  date: string;
  description: string;
  icon?: string;
}

export interface WeddingTradition {
  title: string;
  description: string;
}

export interface Wedding {
  id: string;
  slug: string;
  title: string;
  location: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  category: WeddingCategory;
  pricePerGuest: number;
  currency: string;
  rating: number;
  reviewCount: number;
  guestsAllowed: number;
  guestsBooked: number;
  imageUrl: string;
  coupleImage: string;
  coupleName: string;
  hostName: string;
  hostAvatar: string;
  featured: boolean;
  tags: string[];
  date: string;
  religion: string;
  luxuryLevel: "Premium" | "Luxury" | "Ultra-Luxury";
  durationDays: number;
  languages: string[];
  isVerified: boolean;
  isCurated?: boolean;
  curatedBadge?: string;
  
  // Detailed fields for detail page
  gallery: string[];
  story: string;
  coupleBio: string;
  timeline: WeddingEvent[];
  traditions: WeddingTradition[];
  dressCode: string;
  theme?: string;
  ethnicity?: string;
  requiredGuests?: number;
  foodDescription: string;
  venueDescription: string;
  accommodation: string;
  included: string[];
  notIncluded: string[];
  reviews: Review[];
  faqs: FAQItem[];
}

export type WeddingCategory =
  | "Royal"
  | "Punjabi"
  | "South Indian"
  | "Beach"
  | "Destination"
  | "Traditional";

export interface Category {
  id: string;
  name: WeddingCategory;
  description: string;
  imageUrl: string;
  weddingCount: number;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  location: string;
  weddingType: string;
  date: string;
}

export interface Country {
  code: string;
  name: string;
  weddingCount: number;
  imageUrl: string;
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Stat {
  value: string;
  label: string;
  description: string;
}

export interface HowItWorksStep {
  step: number;
  icon: string;
  title: string;
  description: string;
}
