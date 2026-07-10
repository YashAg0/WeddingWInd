export interface Wedding {
  id: string;
  title: string;
  location: string;
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
  hostName: string;
  hostAvatar: string;
  featured: boolean;
  tags: string[];
  date: string;
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
