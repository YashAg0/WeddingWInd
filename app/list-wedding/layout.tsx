import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Wedding — Host Application",
  description:
    "Apply to list your Indian wedding celebration on WeddingWithIndia and welcome verified international guests to your special day.",
  alternates: {
    canonical: "https://weddingwithindia.com/list-wedding",
  },
  openGraph: {
    title: "List Your Wedding | WeddingWithIndia",
    description:
      "Apply to list your Indian wedding celebration on WeddingWithIndia and welcome verified international guests.",
    url: "https://weddingwithindia.com/list-wedding",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "List Your Wedding | WeddingWithIndia",
    description:
      "Apply to list your Indian wedding celebration on WeddingWithIndia and welcome verified international guests.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ListWeddingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
