import { Metadata } from "next";
import Link from "next/link";
import { Palmtree, Sparkles, Shirt, Utensils, ArrowRight, HelpCircle } from "lucide-react";
import { getWeddings } from "@/lib/actions";
import type { Wedding } from "@/types";
import { WeddingCard } from "@/components/wedding/WeddingCard";

export const metadata: Metadata = {
  title: "Kerala Indian Wedding Experiences: Backwaters & Traditional Sadya Feasts",
  description:
    "Attend authentic South Indian weddings in Kerala. Experience tranquil backwater ceremonies, traditional gold-bordered Kasavu attire, and 24-dish vegetarian Sadya feasts with verified hosts.",
  keywords: [
    "Kerala wedding experience",
    "attend South Indian wedding in Kerala",
    "Kerala backwater wedding experience",
    "traditional Kerala wedding Sadya",
    "Kochi wedding experience",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/destinations/kerala",
  },
  openGraph: {
    title: "Kerala Indian Wedding Experiences | WeddingWithIndia",
    description:
      "Experience serene backwater ceremonies and authentic 24-dish banana leaf feasts in Kerala.",
    url: "https://weddingwithindia.com/destinations/kerala",
    siteName: "WeddingWithIndia",
    type: "website",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kerala Wedding Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala Indian Wedding Experiences | WeddingWithIndia",
    description:
      "Attend traditional Kerala backwater wedding celebrations with verified host families.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const FAQS = [
  {
    q: "What is a Kerala Sadya feast?",
    a: "A Sadya is a traditional multi-course vegetarian banquet of up to 24 dishes served on a fresh plantain (banana) leaf, featuring Avial, Sambar, Pachadi, Thoran, and sweet Payasam pudding.",
  },
  {
    q: "What is the dress code for a Kerala wedding?",
    a: "Traditional Kasavu white and gold silk sarees (or set-sarees) for women, and traditional Mundu (or dhotis) with silk shirts or jubbas for men.",
  },
];

export default async function KeralaDestinationPage() {
  const allWeddings: Wedding[] = await getWeddings();
  const keralaWeddings = allWeddings.filter(
    (w) =>
      w.state?.toLowerCase().includes("kerala") ||
      w.location?.toLowerCase().includes("kerala") ||
      w.city?.toLowerCase().includes("kochi") ||
      w.city?.toLowerCase().includes("kumarakom") ||
      w.region?.toLowerCase().includes("kerala")
  );

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: "Kerala, India",
    description:
      "God's Own Country, famed for serene tropical backwaters, sacred Hindu and Christian traditions, and banana leaf Sadya banquets.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Kerala",
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
        name: "Kerala",
        item: "https://weddingwithindia.com/destinations/kerala",
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
          <span className="text-charcoal-700">Kerala</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Palmtree size={13} /> Backwaters &amp; Temple Traditions
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            Kerala Indian Wedding Experiences
          </h1>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-3xl">
            Experience the soulful beauty of South India: backwater mandaps surrounded by coconut groves, temple bells, traditional gold Kasavu attire, and the famous 24-dish Sadya in Kochi and Kumarakom.
          </p>
        </header>

        {/* Summary Box */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Destination Highlights</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Kerala weddings combine spiritual elegance with lush natural backdrops. Celebrations feature traditional Sopana Sangeetham music, sacred temple rituals (such as the Thali tying and garland exchange), and an iconic pure vegetarian Sadya served on fresh banana leaves.
          </p>
        </div>

        {/* Specifics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Sacred Ceremonies</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Kalyanam temple rituals, Thali (sacred marital necklace) ceremony, and traditional Christian Syrian church weddings.
            </p>
          </div>

          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Shirt size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Kasavu Gold Attire</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Ivory cotton Kasavu sarees with woven gold borders for women; traditional handwoven Mundu with silk shirts for men.
            </p>
          </div>

          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Utensils size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Banana Leaf Sadya</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              A feast of 24 distinct vegetarian dishes: Avial, Sambar, Olan, Thoran, Kalan, banana chips, and jaggery Payasam.
            </p>
          </div>
        </div>

        {/* Available Weddings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-charcoal-900">
                Kerala Wedding Celebrations
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Verified experiences open to international travelers in Kerala.
              </p>
            </div>
            <Link href="/weddings" className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1">
              View All ({allWeddings.length}) <ArrowRight size={12} />
            </Link>
          </div>

          {keralaWeddings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keralaWeddings.map((wedding) => (
                <WeddingCard key={wedding.id} wedding={wedding} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-warm-200/80 rounded-3xl p-8 text-center space-y-3">
              <p className="text-sm text-charcoal-600">
                New South Indian celebrations are listed regularly. Explore our full live directory.
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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Explore Feasting &amp; Culinary Traditions</h3>
            <p className="text-xs text-charcoal-600">
              Read our full guide to regional Indian wedding feasts and dining etiquette.
            </p>
          </div>
          <Link href="/learn/indian-wedding-food-guide" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            Read Food Guide <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
