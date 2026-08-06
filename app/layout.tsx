import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import LayoutVisibilityWrapper from "@/components/layout/LayoutVisibilityWrapper";
import CookieConsent from "@/components/ui/CookieConsent";
import Script from "next/script";
import { Toaster } from "sonner";
import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";
import { RoyalBackground } from "@/components/ui/RoyalBackground";

// Fonts disabled via Next.js builder due to Turbopack network failures
// Using native <link> tags in the head instead.
const interVariable = "font-inter";
const playfairVariable = "font-playfair";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const APP_URL = "https://weddingwithindia.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6b1026",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Wedding With India — Attend Authentic Indian Weddings",
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
    url: APP_URL,
    siteName: "Wedding With India",
    title: "Wedding With India — Attend Authentic Indian Weddings",
    description:
      `Experience the magic of authentic Indian weddings as an honoured guest. Browse ${BUSINESS_METRICS.WEDDINGS_HOSTED} verified Our Indian Weddings across India.`,
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
    title: "Wedding With India — Attend Authentic Indian Weddings",
    description:
      "Experience the magic of authentic Indian weddings. Browse verified celebrations across India.",
    images: ["/og-image.jpg"],
    creator: "@weddingwithindia",
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
    canonical: APP_URL,
  },
  verification: {
    // Add Google Search Console verification token when available
    // google: "YOUR_VERIFICATION_TOKEN",
  },
};

// JSON-LD: Organization structured data
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Wedding With India",
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  description:
    "The world's first marketplace to attend authentic Indian weddings as an honoured guest.",
  sameAs: [
    "https://www.instagram.com/weddingwithindia",
    "https://www.facebook.com/weddingwithindia",
    "https://twitter.com/weddingwithindia",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "guest support",
    email: "contact@weddingwithindia.com",
    availableLanguage: ["English", "Hindi"],
  },
};

// JSON-LD: WebSite structured data (enables Google Sitelinks Searchbox)
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Wedding With India",
  url: APP_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${APP_URL}/weddings?destination={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" className={`${interVariable} ${playfairVariable} scroll-smooth`}>
        <head>
          {/* Native Google Fonts loading */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
          
          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
            }}
          />
        </head>
        <body className="min-h-screen flex flex-col antialiased">
          {/* No-JavaScript fallback */}
          <noscript>
            <div
              style={{
                background: "#6b1026",
                color: "white",
                textAlign: "center",
                padding: "12px 16px",
                fontSize: "14px",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
              }}
            >
              JavaScript is required for Wedding With India to function correctly. Please enable JavaScript in your browser.
            </div>
          </noscript>

          <RoyalBackground />
          <AuthProvider>
            <CurrencyProvider>
              <LayoutVisibilityWrapper>{children}</LayoutVisibilityWrapper>
            </CurrencyProvider>
          </AuthProvider>

          {/* Cookie Consent — loads before analytics */}
          <CookieConsent gaId={GA_ID} />
          <Toaster position="top-right" richColors closeButton />

          {/* Google Analytics 4 — only loads after cookie consent is granted */}
          {GA_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
                id="ga-script"
              />
              <Script id="ga-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    anonymize_ip: true,
                    cookie_flags: 'SameSite=None;Secure'
                  });
                `}
              </Script>
            </>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}