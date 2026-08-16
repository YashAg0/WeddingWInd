import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Couples & Host Families — Welcome Global Guests",
  description:
    "Open your Indian wedding celebration to verified international guests with WeddingWithIndia. Share your culture and traditions while earning hosting payouts.",
  alternates: {
    canonical: "https://weddingwithindia.com/for-couples",
  },
  openGraph: {
    title: "For Couples & Host Families | WeddingWithIndia",
    description:
      "Open your Indian wedding celebration to verified international guests with WeddingWithIndia. Share your culture and traditions while earning hosting payouts.",
    url: "https://weddingwithindia.com/for-couples",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Couples & Host Families | WeddingWithIndia",
    description:
      "Open your Indian wedding celebration to verified international guests with WeddingWithIndia.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ForCouplesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
