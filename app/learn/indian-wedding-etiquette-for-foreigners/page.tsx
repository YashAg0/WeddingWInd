import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, HeartHandshake, Sparkles, HelpCircle, ArrowRight, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Indian Wedding Etiquette for Foreigners: Customs, Dos & Don'ts",
  description:
    "Master Indian wedding etiquette as an international guest. Learn greeting customs, footwear rules, gifting traditions, photography manners, and dining etiquette.",
  keywords: [
    "Indian wedding etiquette for foreigners",
    "Indian wedding dos and donts",
    "etiquette at Indian weddings",
    "Indian wedding gift etiquette for tourists",
    "what to do at an Indian wedding",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/learn/indian-wedding-etiquette-for-foreigners",
  },
  openGraph: {
    title: "Indian Wedding Etiquette for Foreigners | WeddingWithIndia",
    description:
      "A complete etiquette guide for international travelers attending traditional Indian weddings.",
    url: "https://weddingwithindia.com/learn/indian-wedding-etiquette-for-foreigners",
    siteName: "WeddingWithIndia",
    type: "article",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Indian Wedding Etiquette Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Wedding Etiquette for Foreigners | WeddingWithIndia",
    description:
      "Essential customs, dos, and don'ts for international guests attending an Indian wedding.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const DOS = [
  "Greet elders and family hosts with palms together saying 'Namaste'.",
  "Remove your shoes before entering sacred Mandap pavilions or prayer areas.",
  "Accept food, drinks, and sweets with your right hand as a sign of respect.",
  "Join in the dancing during the Sangeet and Baraat when invited—families love enthusiastic participation.",
  "Congratulate the newlyweds on stage and offer your warm wishes (Shubhkaamnayein).",
];

const DONTS = [
  "Do not wear pure black or plain white (traditionally associated with mourning in Hindu ceremonies).",
  "Do not wear pure bridal red (reserved for the bride).",
  "Do not step into the sacred fire altar (Havan Kund / Mandap) with footwear on.",
  "Do not photograph private family moments or religious rituals without permission.",
  "Do not refuse sweet offerings (Prasad/Mithai) outright; a polite small taste is appreciated.",
];

const FAQS = [
  {
    q: "Do I need to bring a gift to an Indian wedding?",
    a: "If you attend through WeddingWithIndia, your booking fee covers your guest honorarium and a gift is not strictly required. However, presenting a decorative envelope with cash (often in lucky denominations ending in 1, such as ₹501, ₹1101, or ₹2101) or a thoughtful souvenir from your home country is considered very gracious.",
  },
  {
    q: "Is alcohol served at Indian weddings?",
    a: "It depends on the family and cultural tradition. Punjabi, Goan, and contemporary celebrations frequently have open cocktail bars at the Sangeet or Reception. Traditional Hindu temple ceremonies and certain conservative families maintain strictly alcohol-free events. Your experience listing clarifies the specific hospitality format.",
  },
  {
    q: "Will all the food be spicy or strictly vegetarian?",
    a: "Many North Indian and South Indian traditional weddings serve elaborate 100% vegetarian multi-course feasts. Non-vegetarian dishes are common in Punjabi, Goan, and Kashmiri weddings. Food is prepared with rich aromatics rather than extreme heat, and on-site coordinators assist guests with mild options.",
  },
];

export default function EtiquettePage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Indian Wedding Etiquette for Foreigners: Customs, Dos & Don'ts",
    description:
      "A complete guide on etiquette, customs, footwear, greetings, and behavior for international guests attending Indian weddings.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://weddingwithindia.com/learn/indian-wedding-etiquette-for-foreigners",
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
    datePublished: "2026-01-22T00:00:00+05:30",
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
        name: "Indian Wedding Etiquette",
        item: "https://weddingwithindia.com/learn/indian-wedding-etiquette-for-foreigners",
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
          <span className="text-charcoal-700">Etiquette Guide</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <HeartHandshake size={13} /> Cultural Etiquette &amp; Customs
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            Indian Wedding Etiquette for Foreigners: Customs, Dos &amp; Don&apos;ts
          </h1>
          <p className="text-sm text-charcoal-500 font-medium">
            Published by WeddingWithIndia Editorial Team • Updated August 2026
          </p>
        </header>

        {/* Quick Answer Summary */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Summary: Key Etiquette Rules</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Key etiquette rules for attending an Indian wedding include: <strong>1)</strong> Greet hosts with palms together (<em>Namaste</em>), <strong>2)</strong> Remove shoes before entering sacred Mandap areas, <strong>3)</strong> Dress in bright, vibrant festive colors while avoiding solid black, white, or bridal red, <strong>4)</strong> Join joyfully in social celebrations like the Baraat and Sangeet, and <strong>5)</strong> Follow host guidelines regarding photography during religious rites.
          </p>
        </div>

        {/* Dos & Don'ts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-emerald-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <span>What to Do</span>
            </div>
            <ul className="space-y-3">
              {DOS.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-rose-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-lg">
              <XCircle size={20} className="text-rose-600" />
              <span>What to Avoid</span>
            </div>
            <ul className="space-y-3">
              {DONTS.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Deep Dive Sections */}
        <div className="prose prose-stone max-w-none text-charcoal-800 space-y-8 text-base leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-charcoal-900">
              Gifting Customs at Indian Weddings
            </h2>
            <p>
              In Indian tradition, gifts of cash are presented in decorative gift envelopes called <em>Shagun</em> envelopes. It is customary to give amounts ending in the numeral 1 (e.g., ₹501, ₹1101, ₹2101, ₹5001), as odd numbers symbolize continuity, endless prosperity, and that the blessing is indivisible. If attending via WeddingWithIndia, your booking includes the host contribution, so presenting a gift is purely an optional gesture of personal appreciation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-charcoal-900">
              Photography &amp; Social Media Etiquette
            </h2>
            <p>
              Photography during high-energy events like the Baraat procession and Sangeet performances is widely celebrated and welcomed. However, during solemn religious rites—such as the sacred Vedic fire rituals (Havan and Saptapadi)—guests should remain respectful and avoid standing in front of the priest (Pandit) or obstructing official family photographers.
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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Explore Cultural Celebrations</h3>
            <p className="text-xs text-charcoal-600">
              Join respectful, verified wedding celebrations hosted by welcoming families across India.
            </p>
          </div>
          <Link href="/weddings" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            Browse Weddings <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
