import { Metadata } from "next";
import Link from "next/link";
import { Shirt, Sparkles, HelpCircle, ArrowRight, XCircle, Palette } from "lucide-react";

export const metadata: Metadata = {
  title: "What to Wear to an Indian Wedding: Guest Attire & Color Guide for Foreigners",
  description:
    "Complete attire guide for international guests at Indian weddings. Learn what women and men should wear for Haldi, Mehndi, Sangeet, Ceremony, and Reception, plus colors to choose or avoid.",
  keywords: [
    "what to wear to an Indian wedding",
    "what should foreigners wear to an Indian wedding",
    "Indian wedding dress code",
    "Indian wedding guest attire",
    "colors to wear to Indian wedding",
    "colors to avoid at Indian wedding",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/learn/what-to-wear-to-an-indian-wedding",
  },
  openGraph: {
    title: "What to Wear to an Indian Wedding: Guest Attire & Color Guide | WeddingWithIndia",
    description:
      "Essential clothing advice and color rules for international guests attending multi-day Indian weddings.",
    url: "https://weddingwithindia.com/learn/what-to-wear-to-an-indian-wedding",
    siteName: "WeddingWithIndia",
    type: "article",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "What to Wear to an Indian Wedding Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What to Wear to an Indian Wedding | WeddingWithIndia",
    description:
      "Complete attire and color guide for women and men attending Indian wedding celebrations.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const CEREMONY_ATTIRE = [
  {
    ceremony: "Haldi (Turmeric Ceremony)",
    women: "Bright yellow or mustard Kurti, simple Lehenga, or floral festive dress.",
    men: "Yellow, gold, or beige Kurta-Pyjama.",
    vibe: "Playful, colorful, and joyous (turmeric paste will be applied).",
  },
  {
    ceremony: "Mehndi (Henna Gathering)",
    women: "Green, teal, or vibrant printed Lehenga / Anarkali with short sleeves for henna application.",
    men: "Pastel or printed Kurta-Pyjama or linen festive shirt.",
    vibe: "Relaxed, musical afternoon celebration.",
  },
  {
    ceremony: "Sangeet (Musical Night)",
    women: "Glittering Lehenga, shimmering Saree, or Indo-Western fusion gown.",
    men: "Bandhgala jacket, embroidered Sherwani, or formal dark suit.",
    vibe: "High glamour, Bollywood dancing, and stage performances.",
  },
  {
    ceremony: "Main Wedding (Mandap Rituals)",
    women: "Rich traditional Silk Saree, royal Lehenga, or formal Anarkali.",
    men: "Traditional Sherwani, Kurta with Nehru Jacket, or formal suit.",
    vibe: "Sacred, traditional, and auspicious.",
  },
  {
    ceremony: "Grand Reception",
    women: "Contemporary couture Lehenga, elegant designer Saree, or Western evening gown.",
    men: "Black-tie tuxedo, classic dark suit, or bespoke royal Bandhgala.",
    vibe: "Formal, celebratory dinner.",
  },
];

const FAQS = [
  {
    q: "What colors should I wear to an Indian wedding?",
    a: "Vibrant jewel tones are ideal: emerald green, royal blue, mustard yellow, rani pink, turquoise, plum, and warm gold. Bright, joyful colors celebrate the prosperity and happiness of the couple.",
  },
  {
    q: "What colors should I avoid wearing?",
    a: "Avoid solid black and plain white, which are traditionally associated with mourning and funerals in Hindu rites. Also avoid pure bridal red, as crimson red is traditionally reserved for the bride.",
  },
  {
    q: "Do I have to wear traditional Indian clothes?",
    a: "No, traditional clothing is not strictly mandatory, but it is warmly welcomed and deeply appreciated by host families. If you prefer Western attire, wear formal and modest clothing (such as a long cocktail dress or formal suit).",
  },
  {
    q: "Can I rent or purchase Indian wedding attire in India?",
    a: "Yes. Many travelers purchase or rent outfits upon arrival in cities like Jaipur, Delhi, or Mumbai. WeddingWithIndia coordinators also assist in arranging pre-fitted outfits or recommending trusted local boutiques.",
  },
];

export default function WhatToWearPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What to Wear to an Indian Wedding: Guest Attire & Color Guide for Foreigners",
    description:
      "A complete guide on traditional Indian wedding attire, dress codes by ceremony, and color etiquette for international guests.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://weddingwithindia.com/learn/what-to-wear-to-an-indian-wedding",
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
    datePublished: "2026-01-25T00:00:00+05:30",
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
        name: "What to Wear Guide",
        item: "https://weddingwithindia.com/learn/what-to-wear-to-an-indian-wedding",
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
          <span className="text-charcoal-700">What to Wear</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Shirt size={13} /> Attire &amp; Style Guide
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            What to Wear to an Indian Wedding: Guest Attire &amp; Color Guide
          </h1>
          <p className="text-sm text-charcoal-500 font-medium">
            Published by WeddingWithIndia Editorial Team • Updated August 2026
          </p>
        </header>

        {/* Quick Answer Summary */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Summary: Indian Wedding Attire Rules</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            International guests are encouraged to wear festive Indian attire: <strong>women</strong> look stunning in Lehengas, Sarees, or Anarkali suits; <strong>men</strong> look sharp in Kurta-Pyjama sets with Nehru jackets or Sherwanis. Opt for vibrant jewel tones (emerald, royal blue, gold, yellow, pink). <strong>Avoid pure black, plain white, and bridal red.</strong>
          </p>
        </div>

        {/* Color Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-emerald-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
              <Palette size={20} className="text-emerald-600" />
              <span>Recommended Colors to Wear</span>
            </div>
            <p className="text-xs text-charcoal-600">
              Bright, celebratory shades symbolize joy, prosperity, and auspicious new beginnings:
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Emerald Green", "Royal Blue", "Mustard Yellow", "Rani Pink", "Warm Gold", "Teal", "Purple", "Orange"].map((c) => (
                <span key={c} className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-900 rounded-full border border-emerald-100">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-rose-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-lg">
              <XCircle size={20} className="text-rose-600" />
              <span>Colors to Avoid</span>
            </div>
            <p className="text-xs text-charcoal-600">
              Certain colors hold ceremonial taboos in traditional Hindu celebrations:
            </p>
            <div className="space-y-2 pt-2 text-xs text-charcoal-700">
              <p><strong>Solid Black:</strong> Associated with mourning and negative energy in Hindu rituals.</p>
              <p><strong>Plain White:</strong> Traditionally worn at funerals in many Indian communities.</p>
              <p><strong>Pure Bridal Red:</strong> Traditionally reserved for the bride on her wedding day.</p>
            </div>
          </div>
        </div>

        {/* Breakdown by Ceremony */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-charcoal-900">
            Dress Code Breakdown by Ceremony
          </h2>
          <div className="space-y-4">
            {CEREMONY_ATTIRE.map((c, idx) => (
              <div key={idx} className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-charcoal-900">{c.ceremony}</h3>
                  <span className="text-[0.6875rem] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {c.vibe}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-charcoal-700 pt-1">
                  <p><strong>Women:</strong> {c.women}</p>
                  <p><strong>Men:</strong> {c.men}</p>
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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Experience the Pageantry</h3>
            <p className="text-xs text-charcoal-600">
              Browse upcoming royal, beach, and countryside Indian weddings open to global guests.
            </p>
          </div>
          <Link href="/weddings" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            Explore Weddings <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
