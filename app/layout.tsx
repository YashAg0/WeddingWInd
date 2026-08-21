import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import LayoutVisibilityWrapper from "@/components/layout/LayoutVisibilityWrapper";
import CookieConsent from "@/components/ui/CookieConsent";
import Script from "next/script";
import { Toaster } from "sonner";
import { RoyalBackground } from "@/components/ui/RoyalBackground";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

// Fonts disabled via Next.js builder due to Turbopack network failures
// Using native <link> tags in the head instead.
const interVariable = "font-inter";
const playfairVariable = "font-playfair";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const APP_URL = "https://weddingwithindia.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7B1113",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "WeddingWithIndia — Attend Authentic Indian Weddings",
    template: "%s | WeddingWithIndia",
  },
  description:
    "WeddingWithIndia is a platform connecting travelers with authentic Indian wedding experiences and participating hosts across India. Join celebrations in Rajasthan, Goa, Punjab, Kerala, and across India as an honoured guest.",
  keywords: [
    "Indian wedding tourism",
    "attend Indian wedding",
    "Indian wedding experience",
    "attend Indian wedding as a foreigner",
    "Rajasthan wedding experience",
    "destination wedding India",
    "cultural travel India",
    "wedding guest experience India",
    "authentic Indian wedding traditions",
  ],
  authors: [{ name: "WeddingWithIndia", url: APP_URL }],
  creator: "WeddingWithIndia",
  publisher: "WeddingWithIndia",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "WeddingWithIndia",
    title: "WeddingWithIndia — Attend Authentic Indian Weddings",
    description:
      "Connect with participating Indian host families to attend authentic cultural wedding celebrations across Rajasthan, Goa, Punjab, Kerala, and India.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WeddingWithIndia — Authentic Indian Wedding Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WeddingWithIndia — Attend Authentic Indian Weddings",
    description:
      "Connect with participating Indian host families to attend authentic cultural wedding celebrations across India.",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  applicationName: "WeddingWithIndia",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WeddingWithIndia",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    // Add Google Search Console verification token when available
    // google: "YOUR_VERIFICATION_TOKEN",
  },
};

// JSON-LD: Organization structured data (Authoritative Knowledge Graph Entity)
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${APP_URL}/#organization`,
  name: "WeddingWithIndia",
  alternateName: ["Wedding With India"],
  url: APP_URL,
  logo: `${APP_URL}/images/logos/logo.png`,
  image: `${APP_URL}/og-image.jpg`,
  description:
    "WeddingWithIndia is a platform connecting international travelers with authentic Indian wedding experiences and participating host families across India.",
  founder: {
    "@type": "Person",
    "@id": `${APP_URL}/founder/tanishq-gupta#person`,
    name: "Tanishq Gupta",
    url: `${APP_URL}/founder/tanishq-gupta`,
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  knowsAbout: [
    "Indian Weddings",
    "Indian Wedding Traditions",
    "Indian Wedding Tourism",
    "Cultural Immersion Travel",
    "Rajasthan Palace Weddings",
    "Goa Beach Weddings",
    "Punjabi Anand Karaj Celebrations",
    "Kerala Traditional Weddings",
    "Guest Etiquette at Indian Weddings",
  ],
  sameAs: [
    "https://www.instagram.com/weddingwithindia",
    "https://www.facebook.com/weddingwithindia",
    "https://twitter.com/weddingwithindia",
    "https://www.linkedin.com/company/weddingwithindia",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "contact@weddingwithindia.com",
    availableLanguage: ["English", "Hindi"],
  },
};

// JSON-LD: WebSite structured data (enables Google Sitelinks Searchbox)
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${APP_URL}/#website`,
  name: "WeddingWithIndia",
  alternateName: ["Wedding With India"],
  url: APP_URL,
  publisher: {
    "@id": `${APP_URL}/#organization`,
  },
  description:
    "Discover and attend authentic Indian wedding celebrations as an honoured guest with participating host families across India.",
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
              For the complete Wedding With India experience, please enable JavaScript in your browser.
            </div>
          </noscript>

          <RoyalBackground />
          <PwaProvider>
            <AuthProvider>
              <CurrencyProvider>
                <LayoutVisibilityWrapper>{children}</LayoutVisibilityWrapper>
              </CurrencyProvider>
            </AuthProvider>
            <InstallPrompt />
          </PwaProvider>

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