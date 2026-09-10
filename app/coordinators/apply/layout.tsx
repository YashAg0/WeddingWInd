import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply as Regional Event Coordinator | WeddingWithIndia",
  description:
    "Apply to become a verified regional event coordinator with WeddingWithIndia. Guide international guests through authentic Indian wedding celebrations.",
  alternates: {
    canonical: "https://weddingwithindia.com/coordinators/apply",
  },
  openGraph: {
    title: "Apply as Regional Event Coordinator | WeddingWithIndia",
    description:
      "Apply to become a verified regional event coordinator with WeddingWithIndia.",
    url: "https://weddingwithindia.com/coordinators/apply",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CoordinatorApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
