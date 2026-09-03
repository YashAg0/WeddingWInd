import { Metadata } from "next";
import Link from "next/link";
import { DollarSign, Sparkles, HelpCircle, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "How Much Does an Indian Wedding Experience Cost? Complete Pricing Breakdown",
  description:
    "Explore transparent pricing for attending an authentic Indian wedding as a tourist. Understand tier packages, inclusions (food, ceremonies, coordinators), and value breakdown.",
  keywords: [
    "how much does an Indian wedding experience cost",
    "cost to attend Indian wedding",
    "Indian wedding tourist ticket price",
    "Indian wedding experience pricing",
    "attend Indian wedding package cost",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/learn/indian-wedding-experience-cost",
  },
  openGraph: {
    title: "How Much Does an Indian Wedding Experience Cost? | WeddingWithIndia",
    description:
      "A complete, transparent pricing breakdown of attending verified Indian wedding celebrations as an international guest.",
    url: "https://weddingwithindia.com/learn/indian-wedding-experience-cost",
    siteName: "WeddingWithIndia",
    type: "article",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Indian Wedding Experience Cost Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Much Does an Indian Wedding Experience Cost? | WeddingWithIndia",
    description:
      "Transparent pricing guide and inclusions for international guests attending Indian weddings.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const TIERS = [
  {
    tier: "Signature Royal Palace Heritage",
    range: "$800 – $1,400 per guest (3 to 5 Days)",
    location: "Palaces & Heritage Haveli Estates (Jaipur, Udaipur, Jodhpur)",
    inclusions: [
      "Access to 4–5 multi-day royal ceremonies (Haldi, Mehndi, Sangeet, Mandap, Royal Banquet)",
      "Multi-course royal silver thali feasts and live gourmet culinary stalls",
      "Dedicated senior bilingual cultural coordinator for continuous ritual translation",
      "Traditional welcome gifts, safa (turban) tying, and ceremonial seating",
    ],
  },
  {
    tier: "Coastal Beach & Sun Nuptials",
    range: "$600 – $1,100 per guest (2 to 4 Days)",
    location: "Goa & Kerala Coastal Luxury Resorts",
    inclusions: [
      "Access to coastal sunset Sangeet, beachside mandap ceremonies, and reception dinner",
      "Authentic coastal feasts, live seafood and vegetarian counters, and refreshments",
      "Local coordinator guiding guests through coastal and fusion customs",
      "Welcome floral leis, refreshments, and reserved guest seating",
    ],
  },
  {
    tier: "Vibrant Folk & Countryside Celebrations",
    range: "$450 – $850 per guest (2 to 3 Days)",
    location: "Punjab, Delhi NCR & Gujarat Celebrations",
    inclusions: [
      "Access to Jaggo night, high-energy Sangeet with Bhangra, and Anand Karaj / Mandap ceremonies",
      "Authentic clay-oven tandoor feasts and traditional sweets",
      "On-site coordinator for translations and guest introductions",
    ],
  },
];

const FAQS = [
  {
    q: "Are there any hidden fees or mandatory on-site cash payments?",
    a: "No. All guest fees on WeddingWithIndia are 100% transparent and all-inclusive of event access, dining, beverages, welcome gifts, and coordinator services. Presenting an optional personal monetary gift (Shagun) to the couple is purely at your discretion.",
  },
  {
    q: "Does the experience fee include international flights or hotel accommodation?",
    a: "Unless explicitly specified as an all-inclusive palace stay package on the listing, guest tickets cover all scheduled wedding celebrations, dining, and on-site hospitality, while guests arrange their own hotel lodging and transportation. Our coordinators are happy to recommend nearby preferred hotels.",
  },
  {
    q: "What is the cancellation policy?",
    a: "WeddingWithIndia provides clear cancellation protections. Cancellations made well in advance receive full or partial refunds according to the published cancellation policy on the listing.",
  },
];

export default function ExperienceCostPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Much Does an Indian Wedding Experience Cost? Complete Pricing Breakdown",
    description:
      "A transparent pricing guide detailing tier costs, inclusions, and value for international guests attending Indian weddings.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://weddingwithindia.com/learn/indian-wedding-experience-cost",
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
    datePublished: "2026-02-08T00:00:00+05:30",
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
        name: "Experience Cost",
        item: "https://weddingwithindia.com/learn/indian-wedding-experience-cost",
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
          <span className="text-charcoal-700">Experience Cost</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <DollarSign size={13} /> Transparent Pricing Breakdown
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            How Much Does an Indian Wedding Experience Cost? Complete Pricing Breakdown
          </h1>
          <p className="text-sm text-charcoal-500 font-medium">
            Published by WeddingWithIndia Editorial Team • Updated August 2026
          </p>
        </header>

        {/* Quick Answer Summary */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Pricing Overview</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Attending an authentic multi-day Indian wedding experience typically ranges from <strong>$450 to $1,400 USD per guest</strong>, depending on celebration duration (2 to 5 days), destination (Royal Palace, Beachfront Resort, or Countryside), and luxury tier. All packages are all-inclusive of event access, multi-course feasts, beverages, welcome gifts, and continuous on-site bilingual coordinator support.
          </p>
        </div>

        {/* Contextual Guide Navigation */}
        <div className="bg-warm-100/70 border border-warm-200/80 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-charcoal-700 leading-relaxed space-y-1">
          <p>
            <strong>Plan Your Experience:</strong> Ready to start planning your journey? Walk through the reservation process in our{" "}
            <Link href="/learn/how-to-attend-an-indian-wedding" className="text-[var(--color-brand-primary)] font-semibold underline underline-offset-2">
              step-by-step guest guide
            </Link>. For outfit budgeting (rental vs buying in India), review our{" "}
            <Link href="/learn/what-to-wear-to-an-indian-wedding" className="text-[var(--color-brand-primary)] font-semibold underline underline-offset-2">
              wedding attire guide
            </Link>.
          </p>
          <p>
            Compare destinations: explore luxury heritage packages in{" "}
            <Link href="/destinations/rajasthan" className="text-[var(--color-brand-primary)] font-semibold underline underline-offset-2">
              Rajasthan
            </Link>{" "}
            or coastal sunset retreats in{" "}
            <Link href="/destinations/goa" className="text-[var(--color-brand-primary)] font-semibold underline underline-offset-2">
              Goa
            </Link>.
          </p>
        </div>

        {/* Tiers Breakdown */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-charcoal-900">
            Experience Tiers &amp; What Is Included
          </h2>
          <div className="space-y-4">
            {TIERS.map((t, idx) => (
              <div key={idx} className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-xl text-charcoal-900">{t.tier}</h3>
                    <p className="text-xs text-charcoal-500">{t.location}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-brand-primary)] bg-maroon-50 px-3 py-1 rounded-full border border-maroon-100/50 self-start sm:self-auto">
                    {t.range}
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">Inclusions:</h4>
                  <ul className="space-y-1.5">
                    {t.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                        <CheckCircle2 size={14} className="text-emerald-600 mt-1 shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Explore Current Available Celebrations</h3>
            <p className="text-xs text-charcoal-600">
              View live wedding dates, destination venues, and exact guest pricing.
            </p>
          </div>
          <Link href="/weddings" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            View Wedding Pricing <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
