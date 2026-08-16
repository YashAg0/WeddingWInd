import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelance Referral Agent Programme",
  description:
    "Earn commissions worldwide by referring international guests or Indian host families to WeddingWithIndia.",
  alternates: {
    canonical: "https://weddingwithindia.com/for-agents",
  },
  openGraph: {
    title: "Freelance Referral Agent Programme | WeddingWithIndia",
    description:
      "Earn commissions worldwide by referring international guests or Indian host families to WeddingWithIndia.",
    url: "https://weddingwithindia.com/for-agents",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Referral Agent Programme | WeddingWithIndia",
    description:
      "Earn commissions worldwide by referring international guests or Indian host families to WeddingWithIndia.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ForAgentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
