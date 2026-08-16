import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Step-by-Step Guide",
  description:
    "Learn how WeddingWithIndia connects international guests, host families, referral agents, and event coordinators for authentic Indian wedding celebrations.",
  alternates: {
    canonical: "https://weddingwithindia.com/how-it-works",
  },
  openGraph: {
    title: "How It Works | WeddingWithIndia",
    description:
      "Learn how WeddingWithIndia connects international guests, host families, referral agents, and event coordinators for authentic Indian wedding celebrations.",
    url: "https://weddingwithindia.com/how-it-works",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works | WeddingWithIndia",
    description:
      "Learn how WeddingWithIndia connects international guests, host families, referral agents, and event coordinators for authentic Indian wedding celebrations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
