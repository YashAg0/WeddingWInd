import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Regional Event Coordinators Programme",
  description:
    "Join WeddingWithIndia as a regional event coordinator. Support international guests on celebration days with translation, etiquette, and logistics.",
  alternates: {
    canonical: "https://weddingwithindia.com/coordinators",
  },
  openGraph: {
    title: "Regional Event Coordinators Programme | WeddingWithIndia",
    description:
      "Join WeddingWithIndia as a regional event coordinator. Support international guests on celebration days.",
    url: "https://weddingwithindia.com/coordinators",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regional Event Coordinators Programme | WeddingWithIndia",
    description:
      "Join WeddingWithIndia as a regional event coordinator.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
