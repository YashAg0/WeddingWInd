import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us — Our Story & Mission",
  description:
    "Learn about WeddingWithIndia's mission to connect international travelers with authentic Indian wedding celebrations through cultural hospitality.",
  alternates: {
    canonical: "https://weddingwithindia.com/about",
  },
  openGraph: {
    title: "About Us — Our Story & Mission | WeddingWithIndia",
    description:
      "Learn about WeddingWithIndia's mission to connect international travelers with authentic Indian wedding celebrations.",
    url: "https://weddingwithindia.com/about",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us — Our Story & Mission | WeddingWithIndia",
    description:
      "Learn about WeddingWithIndia's mission to connect international travelers with authentic Indian wedding celebrations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
