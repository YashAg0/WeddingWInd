import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, HelpCircle, ArrowRight, BookOpen, Flame, Music, Sun } from "lucide-react";

export const metadata: Metadata = {
  title: "Indian Wedding Rituals Explained: From Haldi to Saptapadi (Seven Vows)",
  description:
    "Discover the spiritual and cultural meaning behind sacred Indian wedding ceremonies: Haldi, Mehndi, Sangeet, Baraat, Varmala, Kanyadaan, Saptapadi, and Vidaai.",
  keywords: [
    "Indian wedding rituals explained",
    "Indian wedding ceremonies meaning",
    "Haldi ceremony meaning",
    "Sangeet ceremony explained",
    "what is Baraat at Indian wedding",
    "Saptapadi seven vows Indian wedding",
    "what happens at an Indian wedding",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/learn/indian-wedding-rituals-explained",
  },
  openGraph: {
    title: "Indian Wedding Rituals Explained | WeddingWithIndia",
    description:
      "A complete guide explaining the sacred symbolism and joyous traditions of Indian wedding ceremonies.",
    url: "https://weddingwithindia.com/learn/indian-wedding-rituals-explained",
    siteName: "WeddingWithIndia",
    type: "article",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Indian Wedding Rituals Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Wedding Rituals Explained | WeddingWithIndia",
    description:
      "Complete guide explaining the meaning behind multi-day Indian wedding ceremonies.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const RITUALS = [
  {
    name: "1. Haldi (Turmeric Purification)",
    desc: "A joyful ritual where a fragrant golden paste of turmeric, sandalwood, and rosewater is applied to the bride and groom's face, hands, and feet. Turmeric symbolizes auspicious blessings, physical radiance, and protection from negative energies.",
    icon: Sun,
  },
  {
    name: "2. Mehndi (Henna Artistry)",
    desc: "Intricate herbal henna patterns are drawn on the bride's hands and feet, depicting nature, peacocks, and wedding motifs. Family and guests also receive henna while singing traditional folk melodies.",
    icon: Sparkles,
  },
  {
    name: "3. Sangeet (Musical Dance Celebration)",
    desc: "A massive, energetic evening where families from both sides perform choreographed Bollywood and folk dances, toast the couple, and dance together to live percussion and DJ sets.",
    icon: Music,
  },
  {
    name: "4. Baraat (Groom's Grand Procession)",
    desc: "The groom's arrival accompanied by brass bands, mobile sound systems, dhol drummers, and dancing family members. The bride's family welcomes them warmly at the entrance with floral garlands and sweets.",
    icon: BookOpen,
  },
  {
    name: "5. Varmala / Jaimala (Garland Exchange)",
    desc: "The bride and groom exchange large fragrant floral garlands in front of the entire assembly, symbolizing mutual acceptance and devotion.",
    icon: Sparkles,
  },
  {
    name: "6. Kanyadaan & Panigrahana",
    desc: "The sacred gesture where parents give their daughter's hand in marriage and the couple holds hands in front of the holy fire, symbolizing sacred companionship through all of life's stages.",
    icon: BookOpen,
  },
  {
    name: "7. Saptapadi / Saat Phere (The Seven Sacred Vows)",
    desc: "The spiritual heart of a Hindu wedding. The bride and groom take seven steps (or circumambulate the sacred fire seven times), making seven sacred promises for nourishment, strength, prosperity, family, joy, lifelong friendship, and spiritual unity.",
    icon: Flame,
  },
  {
    name: "8. Vidaai & Reception",
    desc: "The emotional farewell as the bride departs her maternal home, followed by a grand gala reception celebrating the newly married couple with the wider community.",
    icon: Sparkles,
  },
];

const FAQS = [
  {
    q: "Why is the sacred fire (Agni) central to Hindu wedding ceremonies?",
    a: "In Vedic philosophy, Agni (the holy fire) is considered a divine witness that purifies, illuminates, and sanctifies the seven sacred marital vows taken by the couple.",
  },
  {
    q: "Are guests expected to sit through the entire religious ceremony?",
    a: "The main sacred Vedic rituals typically last 1.5 to 2.5 hours. Guests seated under the Mandap enjoy ceremonial commentary from our coordinators, can observe key moments like the garland exchange and seven vows, and can enjoy refreshments freely throughout.",
  },
];

export default function RitualsPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Indian Wedding Rituals Explained: From Haldi to Saptapadi (Seven Vows)",
    description:
      "A complete guide explaining the sacred symbolism and joyous traditions of Indian wedding ceremonies.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://weddingwithindia.com/learn/indian-wedding-rituals-explained",
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
    datePublished: "2026-01-28T00:00:00+05:30",
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
        name: "Rituals Explained",
        item: "https://weddingwithindia.com/learn/indian-wedding-rituals-explained",
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
          <span className="text-charcoal-700">Rituals Explained</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Sparkles size={13} /> Sacred Ceremonies &amp; Symbolism
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            Indian Wedding Rituals Explained: From Haldi to Saptapadi
          </h1>
          <p className="text-sm text-charcoal-500 font-medium">
            Published by WeddingWithIndia Editorial Team • Updated August 2026
          </p>
        </header>

        {/* Quick Answer Summary */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Summary: Key Rituals at a Glance</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Indian weddings consist of distinct, meaningful milestones: <strong>Haldi</strong> (turmeric blessings), <strong>Mehndi</strong> (henna celebration), <strong>Sangeet</strong> (musical dance party), <strong>Baraat</strong> (groom&apos;s procession), <strong>Varmala</strong> (garland exchange), and <strong>Saptapadi</strong> (the seven sacred vows taken around the holy fire).
          </p>
        </div>

        {/* Rituals Detailed Cards */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-charcoal-900">
            The 8 Core Ceremonies Explained
          </h2>
          <div className="space-y-4">
            {RITUALS.map((r, idx) => {
              const Icon = r.icon;
              return (
                <div key={idx} className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-2 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center shrink-0">
                      <Icon size={18} />
                    </span>
                    <h3 className="font-display font-bold text-lg text-charcoal-900">{r.name}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed pl-12">
                    {r.desc}
                  </p>
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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Witness Sacred Ceremonies Firsthand</h3>
            <p className="text-xs text-charcoal-600">
              Join authentic Vedic, Sikh, and regional wedding celebrations with dedicated coordinator commentary.
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
