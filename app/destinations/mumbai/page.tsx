import { Metadata } from "next";
import Link from "next/link";
import { Compass, Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { getWeddings } from "@/lib/actions";
import type { Wedding } from "@/types";
import { WeddingCard } from "@/components/wedding/WeddingCard";

export const metadata: Metadata = {
  title: "Mumbai & Maharashtra Indian Wedding Experiences: Coastal Glamour & Heritage Lagna",
  description:
    "Attend authentic Maharashtrian and luxury coastal weddings in Mumbai and Pune. Experience traditional Lagna rituals, Bollywood-inspired Sangeet nights, and coastal feasts with verified hosts.",
  keywords: [
    "Mumbai wedding experience",
    "attend wedding in Mumbai",
    "Maharashtrian wedding experience",
    "Pune Indian wedding tourist",
    "Mumbai destination wedding guest",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/destinations/mumbai",
  },
  openGraph: {
    title: "Mumbai & Maharashtra Indian Wedding Experiences | WeddingWithIndia",
    description:
      "Experience oceanfront luxury and traditional Maharashtrian wedding celebrations in Mumbai and Pune.",
    url: "https://weddingwithindia.com/destinations/mumbai",
    siteName: "WeddingWithIndia",
    type: "website",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mumbai Wedding Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mumbai & Maharashtra Indian Wedding Experiences | WeddingWithIndia",
    description:
      "Attend coastal luxury and traditional Maharashtrian weddings in Mumbai with verified host families.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const FAQS = [
  {
    q: "What are traditional Maharashtrian wedding rituals?",
    a: "Maharashtrian weddings (Lagna) feature the Antarpat (silk cloth held between the couple), Mangalashtak hymns, Kanyadaan, and the tying of the sacred Mundavalya (pearl headband).",
  },
];

export default async function MumbaiDestinationPage() {
  const allWeddings: Wedding[] = await getWeddings();
  const mumbaiWeddings = allWeddings.filter(
    (w) =>
      w.state?.toLowerCase().includes("maharashtra") ||
      w.location?.toLowerCase().includes("mumbai") ||
      w.city?.toLowerCase().includes("mumbai") ||
      w.city?.toLowerCase().includes("pune") ||
      w.region?.toLowerCase().includes("mumbai")
  );

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: "Mumbai & Maharashtra, India",
    description:
      "India's financial and entertainment capital featuring oceanfront glamour, Bollywood energy, and sacred Maharashtrian heritage.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://weddingwithindia.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Destinations",
        item: "https://weddingwithindia.com/destinations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Mumbai & Maharashtra",
        item: "https://weddingwithindia.com/destinations/mumbai",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container-luxury space-y-12 max-w-5xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-brand-primary)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/destinations" className="hover:text-[var(--color-brand-primary)] transition-colors">Destinations</Link>
          <span>/</span>
          <span className="text-charcoal-700">Mumbai &amp; Maharashtra</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Compass size={13} /> Coastal Glamour &amp; Heritage Lagna
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            Mumbai &amp; Maharashtra Indian Wedding Experiences
          </h1>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-3xl">
            Experience coastal celebrations along the Arabian Sea: traditional Maharashtrian Lagna ceremonies, vibrant Bollywood-inspired Sangeet nights, and chic luxury gatherings in Mumbai, Pune, and Alibaug.
          </p>
        </header>

        {/* Highlights Box */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Destination Highlights</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Mumbai offers a captivating fusion of ancient Maharashtrian cultural heritage and modern glamour. Guests witness sacred rituals with pearl headbands (Mundavalya) and Paithani silk sarees, enjoy Bollywood-style musical performances, and savor coastal Maharashtrian cuisine.
          </p>
        </div>

        {/* Available Weddings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-charcoal-900">
                Mumbai &amp; Maharashtra Wedding Celebrations
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Verified experiences open to international travelers in Maharashtra.
              </p>
            </div>
            <Link href="/weddings" className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1">
              View All ({allWeddings.length}) <ArrowRight size={12} />
            </Link>
          </div>

          {mumbaiWeddings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mumbaiWeddings.map((wedding) => (
                <WeddingCard key={wedding.id} wedding={wedding} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-warm-200/80 rounded-3xl p-8 text-center space-y-3">
              <p className="text-sm text-charcoal-600">
                New celebrations are listed regularly. Explore our full live directory.
              </p>
              <Link href="/weddings" className="btn-luxury px-6 py-2.5 inline-flex items-center gap-2 text-xs">
                Browse Live Directory <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-warm-200">
          <h2 className="font-display font-bold text-2xl text-charcoal-900 flex items-center gap-2">
            <HelpCircle size={22} className="text-[var(--color-brand-primary)]" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-warm-200/70 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-charcoal-900">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl text-charcoal-900">Explore Cultural Etiquette &amp; Guides</h3>
            <p className="text-xs text-charcoal-600">
              Read what to wear and ceremony rituals in our Knowledge Hub.
            </p>
          </div>
          <Link href="/learn" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            Read Knowledge Hub <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
