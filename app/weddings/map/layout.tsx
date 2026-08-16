import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Wedding Map Discovery",
  description:
    "Explore Indian wedding destinations interactively on the India map. Discover cultural celebrations in Rajasthan, Goa, Kerala, Punjab, and more.",
  alternates: {
    canonical: "https://weddingwithindia.com/weddings/map",
  },
  openGraph: {
    title: "Interactive Wedding Map Discovery | WeddingWithIndia",
    description:
      "Explore Indian wedding destinations interactively on the India map. Discover cultural celebrations across India.",
    url: "https://weddingwithindia.com/weddings/map",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Wedding Map Discovery | WeddingWithIndia",
    description:
      "Explore Indian wedding destinations interactively on the India map.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function WeddingsMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
