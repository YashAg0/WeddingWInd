import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6b1026",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://weddingwithindia.com"),
  title: {
    default: "Wedding With India — Attend Real Indian Weddings",
    template: "%s | Wedding With India",
  },
  description:
    "The world's first marketplace to attend authentic Indian weddings. Join real celebrations in Rajasthan, Goa, Punjab, and Kerala as an honoured guest. Book your spot today.",
  keywords: [
    "Indian wedding tourism",
    "attend Indian wedding",
    "Indian wedding experience",
    "Rajasthan wedding",
    "destination wedding India",
    "cultural travel India",
    "wedding guest experience",
  ],
  authors: [{ name: "Wedding With India" }],
  creator: "Wedding With India",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://weddingwithindia.com",
    siteName: "Wedding With India",
    title: "Wedding With India — Attend Real Indian Weddings",
    description:
      "Experience the magic of authentic Indian weddings as an honoured guest. Browse 1,400+ verified wedding listings across India.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Wedding With India — Authentic Indian Wedding Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding With India — Attend Real Indian Weddings",
    description:
      "Experience the magic of authentic Indian weddings. Browse verified listings across India.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://weddingwithindia.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
