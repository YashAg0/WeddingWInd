import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Us — Guest & Host Support",
  description:
    "Get in touch with the WeddingWithIndia team for booking inquiries, host applications, partnerships, and guest support.",
  alternates: {
    canonical: "https://weddingwithindia.com/contact",
  },
  openGraph: {
    title: "Contact Us — Guest & Host Support | WeddingWithIndia",
    description:
      "Get in touch with the WeddingWithIndia team for booking inquiries, host applications, and guest support.",
    url: "https://weddingwithindia.com/contact",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — Guest & Host Support | WeddingWithIndia",
    description:
      "Get in touch with the WeddingWithIndia team for booking inquiries and guest support.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
