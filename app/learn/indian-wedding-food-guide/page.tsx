import { Metadata } from "next";
import Link from "next/link";
import { Utensils, Sparkles, HelpCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Indian Wedding Food & Feasting Guide: Regional Culinary Traditions",
  description:
    "Explore the culinary wonders of Indian weddings. From royal Rajasthani thalis and Punjabi tandoor banquets to South Indian banana leaf Sadyas, learn what to expect as a guest.",
  keywords: [
    "Indian wedding food guide",
    "what food is served at Indian weddings",
    "Indian wedding feast",
    "is Indian wedding food vegetarian",
    "Indian wedding regional cuisine",
    "Rajasthani wedding food",
    "Kerala wedding Sadya",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/learn/indian-wedding-food-guide",
  },
  openGraph: {
    title: "Indian Wedding Food & Feasting Guide | WeddingWithIndia",
    description:
      "A complete guide to royal, regional, and sacred wedding feasts across India for international guests.",
    url: "https://weddingwithindia.com/learn/indian-wedding-food-guide",
    siteName: "WeddingWithIndia",
    type: "article",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Indian Wedding Food Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Wedding Food & Feasting Guide | WeddingWithIndia",
    description:
      "Explore regional feast menus, dietary options, and culinary customs at Indian weddings.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const REGIONAL_FEASTS = [
  {
    region: "Rajasthan Royal Feasts",
    highlights: "Dal Baati Churma, Gatte ki Sabzi, Ker Sangri, Paneer Rajwada, and rich saffron sweets like Ghewar and Mawa Kachori.",
    style: "Royal palace silver thali service and opulent multi-course banquets.",
  },
  {
    region: "Punjab Tandoori Celebrations",
    highlights: "Paneer Tikka, Dal Makhani, Sarson ka Saag & Makki di Roti, Butter Chicken (where non-veg), Amritsari Kulcha, and Gulab Jamun.",
    style: "Live interactive tandoors, clay oven breads, and celebratory cocktail snacks.",
  },
  {
    region: "Kerala Traditional Sadya",
    highlights: "Up to 24 pure vegetarian dishes served on fresh banana leaves including Avial, Sambar, Olan, Thoran, Kalan, and Payasam.",
    style: "Seated traditional dining on handwoven floor mats or banquet tables.",
  },
  {
    region: "Goan Coastal & Festive",
    highlights: "Goan fish curry, vegetarian Xacuti, coconut-coriander curries, vegetable caldin, and multi-layered Bebinca pudding.",
    style: "Breezy coastal buffet stations and sunset beach dining.",
  },
];

const FAQS = [
  {
    q: "Is Indian wedding food always vegetarian?",
    a: "No, but vegetarianism is very prominent. Traditional Hindu weddings in Gujarat, Rajasthan, and South India are almost exclusively 100% vegetarian. Punjabi, Goan, Bengali, and Muslim weddings feature abundant non-vegetarian dishes. All celebrations cater extensively to vegetarian and vegan diets.",
  },
  {
    q: "Is the food too spicy for foreign travelers?",
    a: "Wedding banquet food focuses on complex aromatic spices (cardamom, saffron, cinnamon, cloves, cumin) rather than pure chili heat. Live counters also allow guests to customize their spice preference, and coordinators help point out mild dishes.",
  },
];

export default function FoodGuidePage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Indian Wedding Food & Feasting Guide: Regional Culinary Traditions",
    description:
      "A complete guide to traditional wedding feasts, regional menus, dietary considerations, and dining customs across India.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://weddingwithindia.com/learn/indian-wedding-food-guide",
    },
    author: {
      "@type": "Organization",
      "@id": "https://weddingwithindia.com/#organization",
      name: "WeddingWithIndia",
      url: "https://weddingwithindia.com",
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://weddingwithindia.com/#organization",
      name: "WeddingWithIndia",
      url: "https://weddingwithindia.com",
    },
    datePublished: "2026-02-01T00:00:00+05:30",
    dateModified: "2026-08-20T00:00:00+05:30",
    image: "https://weddingwithindia.com/og-image.jpg",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
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
        name: "Learn",
        item: "https://weddingwithindia.com/learn",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Food Guide",
        item: "https://weddingwithindia.com/learn/indian-wedding-food-guide",
      },
    ],
  };

  return (
    <article className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container-luxury max-w-4xl space-y-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-brand-primary)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-[var(--color-brand-primary)] transition-colors">Learn</Link>
          <span>/</span>
          <span className="text-charcoal-700">Food &amp; Feasting</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Utensils size={13} /> Regional Feasting Guide
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            Indian Wedding Food &amp; Feasting Guide: Regional Culinary Traditions
          </h1>
          <p className="text-sm text-charcoal-500 font-medium">
            Published by WeddingWithIndia Editorial Team • Updated August 2026
          </p>
        </header>

        {/* Direct Answer Summary */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Summary: The Wedding Dining Experience</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Feasting is the gastronomic highlight of any Indian wedding. Guests enjoy multi-course meals featuring live chaat bazaars, regional specialties (such as Rajasthani Dal Baati Churma, Punjabi Tandoor delicacies, or Kerala banana-leaf Sadyas), and lavish dessert counters. All guest bookings include unlimited ceremonial dining and beverages.
          </p>
        </div>

        {/* Contextual Guide Navigation */}
        <div className="bg-warm-100/70 border border-warm-200/80 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-charcoal-700 leading-relaxed space-y-1">
          <p>
            <strong>Dining Etiquette:</strong> Traditional banquets often observe specific social customs, such as eating with your right hand and respecting vegetarian sanctity. Read our{" "}
            <Link href="/learn/indian-wedding-etiquette-for-foreigners" className="text-[var(--color-brand-primary)] font-semibold underline underline-offset-2">
              Indian wedding etiquette guide
            </Link>{" "}
            to learn more, or see our{" "}
            <Link href="/learn/what-to-wear-to-an-indian-wedding" className="text-[var(--color-brand-primary)] font-semibold underline underline-offset-2">
              what to wear guide
            </Link>{" "}
            for comfortable banquet attire.
          </p>
        </div>

        {/* Regional Feasts Breakdown */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-charcoal-900">
            Regional Feasts Across India
          </h2>
          <div className="space-y-4">
            {REGIONAL_FEASTS.map((rf, idx) => {
              const destLink =
                rf.region.includes("Rajasthan") ? "/destinations/rajasthan" :
                rf.region.includes("Punjab") ? "/destinations/punjab" :
                rf.region.includes("Kerala") ? "/destinations/kerala" :
                rf.region.includes("Goa") ? "/destinations/goa" : "/destinations";

              return (
                <div key={idx} className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-lg text-charcoal-900">{rf.region}</h3>
                    <Link href={destLink} className="text-xs font-semibold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1">
                      Explore Region <ArrowRight size={11} />
                    </Link>
                  </div>
                  <p className="text-xs sm:text-sm text-charcoal-700"><strong>Key Dishes:</strong> {rf.highlights}</p>
                  <p className="text-xs text-charcoal-500"><strong>Dining Format:</strong> {rf.style}</p>
                </div>
              );
            })}
          </div>
        </div>

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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Taste Authentic Regional Feasts</h3>
            <p className="text-xs text-charcoal-600">
              Browse upcoming Indian wedding experiences featuring world-class culinary banquets.
            </p>
          </div>
          <Link href="/weddings" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            Browse Experiences <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
