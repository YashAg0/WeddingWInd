import { Metadata } from "next";
import Link from "next/link";
import { Sun, Sparkles, Shirt, Utensils, ArrowRight, HelpCircle } from "lucide-react";
import { getWeddings } from "@/lib/actions";
import type { Wedding } from "@/types";
import { WeddingCard } from "@/components/wedding/WeddingCard";

export const metadata: Metadata = {
  title: "Goa Beach Weddings: Attend Coastal Sunset Celebrations in Goa",
  description:
    "Attend authentic beach weddings in Goa. Experience oceanfront mandaps, sunset Sangeet parties, and Indo-Portuguese wedding traditions with verified hosts.",
  keywords: [
    "Goa beach weddings",
    "Goa wedding experience",
    "attend beach wedding in Goa",
    "Indian wedding experience Goa",
    "Goa destination wedding tourist",
    "beachside Indian wedding",
    "goa weddings",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/destinations/goa",
  },
  openGraph: {
    title: "Goa Beach Weddings: Attend Coastal Sunset Celebrations in Goa | WeddingWithIndia",
    description:
      "Attend authentic beach weddings in Goa. Experience oceanfront mandaps, sunset Sangeet parties, and Indo-Portuguese wedding traditions with verified hosts.",
    url: "https://weddingwithindia.com/destinations/goa",
    siteName: "WeddingWithIndia",
    type: "website",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Goa Beach Wedding Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Goa Beach Weddings: Attend Coastal Sunset Celebrations in Goa | WeddingWithIndia",
    description:
      "Attend sunset beach weddings in Goa with verified host families.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const FAQS = [
  {
    q: "What is the dress code for a Goa beach wedding?",
    a: "Goa weddings emphasize breezy, lightweight festive elegance: flowy pastel lehengas and floral sarees for women; lightweight linen or silk kurta-jackets and summer suits for men.",
  },
  {
    q: "When is the peak wedding season in Goa?",
    a: "November through February offers idyllic sunny beach days, cool coastal breezes, and spectacular sunsets.",
  },
];

export default async function GoaDestinationPage() {
  const allWeddings: Wedding[] = await getWeddings();
  const goaWeddings = allWeddings.filter(
    (w) =>
      w.state?.toLowerCase().includes("goa") ||
      w.location?.toLowerCase().includes("goa") ||
      w.city?.toLowerCase().includes("goa") ||
      w.region?.toLowerCase().includes("goa")
  );

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: "Goa, India",
    description:
      "Iconic coastal destination known for sunset beach mandaps, lively Sangeet evenings, and fusion Indo-Portuguese hospitality.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Goa",
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
        name: "Goa",
        item: "https://weddingwithindia.com/destinations/goa",
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
          <span className="text-charcoal-700">Goa</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Sun size={13} /> Coastal &amp; Beach Celebrations
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            Goa Beach Weddings &amp; Coastal Celebrations
          </h1>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-3xl">
            Witness sunset oceanfront mandaps, bohemian beachfront Sangeets, and fusion Indo-Portuguese celebrations in North and South Goa luxury resorts.
          </p>
        </header>

        {/* Direct Answer Summary Box */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Destination Highlights</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Goa provides a relaxed yet vibrant coastal backdrop for Indian weddings. Celebrations merge traditional Vedic or Konkani rites with beach parties, live acoustic and DJ performances, seafood and vegetarian coastal banquets, and breezy sundowner cocktail gatherings.
          </p>
        </div>

        {/* Cultural Specifics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Atmosphere &amp; Vibe</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Golden-hour mandap vows, beachside welcome barbecues, open-air Sangeet dance floors under palm trees.
            </p>
          </div>

          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Shirt size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Resort Festive Attire</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Pastel silks, floral lehengas, linen kurtas with sleeveless Nehru jackets, and chic open-toe formal footwear.
            </p>
          </div>

          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Utensils size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Coastal Culinary Banquets</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Goan fish curries, vegetable Xacuti, coconut rice, tropical fruit cocktails, and multi-layered Bebinca pudding.
            </p>
          </div>
        </div>

        {/* Available Weddings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-charcoal-900">
                Goa Wedding Celebrations
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Verified beach experiences open to international travelers in Goa.
              </p>
            </div>
            <Link href="/weddings" className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1">
              View All ({allWeddings.length}) <ArrowRight size={12} />
            </Link>
          </div>

          {goaWeddings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goaWeddings.map((wedding) => (
                <WeddingCard key={wedding.id} wedding={wedding} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-warm-200/80 rounded-3xl p-8 text-center space-y-3">
              <p className="text-sm text-charcoal-600">
                New coastal beach celebrations are listed regularly. Explore our full wedding directory.
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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Explore Cultural Attire &amp; Guides</h3>
            <p className="text-xs text-charcoal-600">
              Learn what to wear to beachside Indian weddings in our comprehensive guide.
            </p>
          </div>
          <Link href="/learn/what-to-wear-to-an-indian-wedding" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            Read Attire Guide <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
