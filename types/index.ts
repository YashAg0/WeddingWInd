export type Role = "SUPER_ADMIN" | "ADMIN" | "COUPLE" | "TRAVELER" | "AGENT" | "COORDINATOR";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  createdAt: Date;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Review {
  id: string;
  userName?: string;
  authorName?: string;
  authorAvatar?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  country?: string;
  createdAt?: any;
  helpfulVotes?: any;
  ratingFood?: any;
  ratingHospitality?: any;
  ratingExperience?: any;
  ratingCulture?: any;
  ratingSafety?: any;
  ratingAccommodation?: any;
  ratingOrganization?: any;
  ratingValue?: any;
  ratingCommunication?: any;
  repliesList?: any;
}

export interface WeddingTimelineEvent {
  time: string;
  title: string;
  description: string;
  icon?: string;
  date?: string;
}

export interface WeddingTradition {
  name?: string;
  title?: string;
  description: string;
}

export interface DemoWedding {
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
  sponsored: boolean;
  sponsorshipStart?: string | null;
  sponsorshipEnd?: string | null;
  isDemo: boolean;
  tags: string[];
  date: string;
  religion: string;
  luxuryLevel: string;
  durationDays: number;
  languages: string[];
  isVerified: boolean;
  isCurated: boolean;
  gallery: string[];
  story: string;
  coupleBio: string;
  timeline: WeddingTimelineEvent[];
  traditions: WeddingTradition[];
  dressCode: string;
  foodDescription: string;
  venueDescription: string;
  accommodation: string;
  included: string[];
  notIncluded: string[];
  reviews: Review[];
  faqs: FAQItem[];
  theme?: string;
  ethnicity?: string;
  region?: string;
  community?: string;
  foodContext?: string;
  dressExpectations?: string;
  guestRules?: string;
  etiquetteNotes?: string;
  curatedBadge?: string;
}

export type WeddingCategory =
  | "Royal"
  | "Punjabi"
  | "South Indian"
  | "Beach"
  | "Destination"
  | "Traditional"
  | "Nature";

export interface Category {
  id: string;
  name: WeddingCategory;
  description?: string;
  imageUrl?: string;
  weddingCount?: number;
  icon?: string;
  slug?: string;
  count?: number;
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
  description?: string;
}

export interface HowItWorksStep {
  step: number;
  icon: string;
  title: string;
  description: string;
}

export type Wedding = DemoWedding;
export type WeddingEvent = WeddingTimelineEvent;
