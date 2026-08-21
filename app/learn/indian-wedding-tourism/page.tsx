import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Sparkles, ArrowRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "The Rise of Indian Wedding Tourism: Authentic Cultural Immersion in India",
  description:
    "Explore how Indian wedding tourism allows global travelers to experience the cultural heritage, traditions, and hospitality of Indian weddings while supporting host communities.",
  keywords: [
    "Indian wedding tourism",
    "wedding tourism in India",
    "cultural wedding tourism",
    "attend Indian wedding tourism",
    "cultural immersion travel India",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/learn/indian-wedding-tourism",
  },
  openGraph: {
    title: "The Rise of Indian Wedding Tourism | WeddingWithIndia",
    description:
      "Understanding the emergence of Indian wedding tourism as one of the world's most immersive cultural travel experiences.",
    url: "https://weddingwithindia.com/learn/indian-wedding-tourism",
    siteName: "WeddingWithIndia",
    type: "article",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Indian Wedding Tourism Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Rise of Indian Wedding Tourism | WeddingWithIndia",
    description:
      "How cultural wedding tourism connects international visitors with authentic Indian celebrations.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const FAQS = [
  {
    q: "What is Indian wedding tourism?",
    a: "Indian wedding tourism is a specialized form of cultural immersion travel where international tourists participate as invited guests in real Indian wedding celebrations, experiencing traditional rituals, music, attire, and feasts firsthand.",
  },
  {
    q: "How does wedding tourism benefit host families and communities in India?",
    a: "Wedding tourism provides host families with meaningful cross-cultural exchanges, offsets wedding hosting costs through guest honorariums, and creates economic opportunities for local artisanal caterers, mehndi artists, folk musicians, and coordinators.",
  },
];

export default function WeddingTourismPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The Rise of Indian Wedding Tourism: Authentic Cultural Immersion in India",
    description:
      "An in-depth editorial exploring the emergence, cultural significance, and ethical framework of Indian wedding tourism.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://weddingwithindia.com/learn/indian-wedding-tourism",
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
    datePublished: "2026-02-05T00:00:00+05:30",
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
        name: "Wedding Tourism",
        item: "https://weddingwithindia.com/learn/indian-wedding-tourism",
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
          <span className="text-charcoal-700">Wedding Tourism</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <BookOpen size={13} /> Cultural Tourism Industry Analysis
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            The Rise of Indian Wedding Tourism: Authentic Cultural Immersion
          </h1>
          <p className="text-sm text-charcoal-500 font-medium">
            Published by WeddingWithIndia Editorial Team • Updated August 2026
          </p>
        </header>

        {/* Quick Answer Summary */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Definition &amp; Concept</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            <strong>Indian wedding tourism</strong> is an experiential travel movement enabling international tourists to legitimately attend traditional Indian weddings as verified guests. Rather than observing Indian culture from tourist sidelines, travelers participate directly in multi-day sacred rituals, music, dance, and banquets alongside host families.
          </p>
        </div>

        {/* Editorial Body */}
        <div className="prose prose-stone max-w-none text-charcoal-800 space-y-8 text-base leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-charcoal-900">
              Why Indian Weddings are a Magnet for Cultural Travelers
            </h2>
            <p>
              India’s wedding industry is one of the most vibrant cultural phenomena on Earth, blending thousands of years of Vedic traditions, regional folklore, haute couture fashion, and opulent feasts. For international visitors who previously had no avenue to attend without personal local connections, wedding tourism provides a structured, safe, and mutually respectful bridge.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-charcoal-900">
              Ethical Standards &amp; Verified Hospitality
            </h2>
            <p>
              Platforms like <strong>WeddingWithIndia</strong> operate on strict ethical community standards: host families voluntarily opt-in, guest capacities are limited, on-site bilingual coordinators ensure smooth translation, and guests undergo verification to maintain the sacred sanctity and safety of every celebration.
            </p>
          </section>
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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Experience Indian Wedding Tourism</h3>
            <p className="text-xs text-charcoal-600">
              Browse real, verified wedding celebrations hosted by welcoming families across India.
            </p>
          </div>
          <Link href="/weddings" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            View Live Directory <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
