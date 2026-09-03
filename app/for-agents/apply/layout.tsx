import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply as Referral Agent | WeddingWithIndia",
  description:
    "Apply to become a freelance referral agent with WeddingWithIndia. Earn commissions connecting travelers and hosts to authentic cultural weddings.",
  alternates: {
    canonical: "https://weddingwithindia.com/for-agents/apply",
  },
  openGraph: {
    title: "Apply as Referral Agent | WeddingWithIndia",
    description:
      "Apply to become a freelance referral agent with WeddingWithIndia.",
    url: "https://weddingwithindia.com/for-agents/apply",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ForAgentsApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
