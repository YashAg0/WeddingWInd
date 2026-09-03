import { Metadata } from "next";
import Link from "next/link";
import { Compass, Sparkles, HelpCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Attend an Indian Wedding as a Foreigner: Step-by-Step Guide",
  description:
    "Step-by-step guide for international tourists to find, book, and attend authentic Indian weddings. Learn invitation etiquette, ceremony schedules, and safety.",
  keywords: [
    "how to attend an Indian wedding",
    "how to attend an Indian wedding as a foreigner",
    "how can a tourist attend an Indian wedding",
    "attend an Indian wedding in India",
    "how to go to an Indian wedding as a foreigner",
    "Indian wedding booking guide",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/learn/how-to-attend-an-indian-wedding",
  },
  openGraph: {
    title: "How to Attend an Indian Wedding as a Foreigner: Step-by-Step Guide | WeddingWithIndia",
    description:
      "Step-by-step guide for international tourists to find, book, and attend authentic Indian weddings. Learn invitation etiquette, ceremony schedules, and safety.",
    url: "https://weddingwithindia.com/learn/how-to-attend-an-indian-wedding",
    siteName: "WeddingWithIndia",
    type: "article",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "How to Attend an Indian Wedding Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Attend an Indian Wedding as a Foreigner: Step-by-Step Guide | WeddingWithIndia",
    description:
      "Step-by-step guide for international tourists to find, book, and attend authentic Indian weddings.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const STEPS = [
  {
    step: "1",
    title: "Explore Curated Regional Experiences",
    desc: "Browse verified wedding listings across Rajasthan palaces, Goan beaches, Punjabi countryside, or Kerala backwaters. Filter by travel dates, ceremony duration (1 to 5 days), and cultural tradition.",
  },
  {
    step: "2",
    title: "Select Attendance Preferences & Group Size",
    desc: "Choose whether you wish to be seated with the Bride's side (Ladkiwale), Groom's side (Ladkewale), or as a General Honoured Guest. Specify your group size and submit your booking request.",
  },
  {
    step: "3",
    title: "Complete Quick Traveler Verification",
    desc: "Complete simple identity verification to ensure community safety. Once confirmed, you will receive your official invitation itinerary, venue address, and coordinator contact.",
  },
  {
    step: "4",
    title: "Receive Dedicated Cultural Preparation Briefing",
    desc: "Get tailored guidance on event dress codes, local transport, recommended color palettes, and traditional gifting customs.",
  },
  {
    step: "5",
    title: "Attend with On-Site Bilingual Coordinator Support",
    desc: "Meet your on-site coordinator at the venue who guides you through ritual seating, explains symbolic traditions, translates prayers, and ensures you feel welcomed as part of the family.",
  },
];

const FAQS = [
  {
    q: "How far in advance should I reserve an Indian wedding experience?",
    a: "We recommend reserving 4 to 12 weeks in advance to allow adequate time for attire fittings, travel planning, and coordinator matching, although last-minute spots are occasionally available.",
  },
  {
    q: "What is included in the guest experience fee?",
    a: "Your fee covers access to all scheduled wedding events, traditional multi-course wedding feasts, beverages, welcome gifts, and continuous on-site coordinator support.",
  },
  {
    q: "Can solo travelers attend?",
    a: "Yes. Many of our guests are solo cultural travelers. Our on-site coordinators ensure solo visitors are comfortably introduced to the family and feel completely included.",
  },
];

export default function HowToAttendPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Attend an Indian Wedding as a Tourist: Complete Step-by-Step Guide",
    description:
      "A complete walkthrough explaining how international tourists can discover, book, and experience an authentic Indian wedding.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://weddingwithindia.com/learn/how-to-attend-an-indian-wedding",
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
    datePublished: "2026-01-20T00:00:00+05:30",
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
        "@type": "Learn",
        position: 2,
        name: "Learn",
        item: "https://weddingwithindia.com/learn",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "How to Attend an Indian Wedding",
        item: "https://weddingwithindia.com/learn/how-to-attend-an-indian-wedding",
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
          <span className="text-charcoal-700">How to Attend</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Compass size={13} /> Step-by-Step Guest Guide
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            How to Attend an Indian Wedding as an International Guest
          </h1>
          <p className="text-sm text-charcoal-500 font-medium">
            Published by WeddingWithIndia Editorial Team • Updated August 2026
          </p>
        </header>

        {/* Quick Answer Summary for AI Retrieval */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Summary: The 5-Step Process</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Attending an Indian wedding as a tourist involves 5 simple steps: <strong>1)</strong> Browse verified listings on WeddingWithIndia, <strong>2)</strong> Select your desired destination and side preference, <strong>3)</strong> Complete traveler verification, <strong>4)</strong> Receive custom attire and cultural briefings, and <strong>5)</strong> Attend the festivities accompanied by an on-site bilingual coordinator.
          </p>
        </div>

        {/* Step-by-Step Timeline */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-charcoal-900">
            Detailed Step-by-Step Walkthrough
          </h2>
          <div className="space-y-4">
            {STEPS.map((s) => (
              <div key={s.step} className="bg-white border border-warm-200/80 rounded-3xl p-6 flex items-start gap-4 shadow-xs">
                <span className="w-10 h-10 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] font-bold text-lg flex items-center justify-center shrink-0 border border-maroon-100">
                  {s.step}
                </span>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-charcoal-900">{s.title}</h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">{s.desc}</p>
                  {s.step === "1" && (
                    <p className="text-xs text-charcoal-500 pt-1">
                      Explore options in our{" "}
                      <Link href="/weddings" className="text-[var(--color-brand-primary)] font-semibold underline">
                        live weddings directory
                      </Link>{" "}
                      or read our guide on{" "}
                      <Link href="/learn/can-foreigners-attend-indian-weddings" className="text-[var(--color-brand-primary)] font-semibold underline">
                        foreign guest participation
                      </Link>.
                    </p>
                  )}
                  {s.step === "2" && (
                    <p className="text-xs text-charcoal-500 pt-1">
                      Learn how pricing tiers work in our{" "}
                      <Link href="/learn/indian-wedding-experience-cost" className="text-[var(--color-brand-primary)] font-semibold underline">
                        complete cost breakdown guide
                      </Link>.
                    </p>
                  )}
                  {s.step === "3" && (
                    <p className="text-xs text-charcoal-500 pt-1">
                      Review safety verification in our{" "}
                      <Link href="/trust?tab=safety" className="text-[var(--color-brand-primary)] font-semibold underline">
                        Trust &amp; Safety Center
                      </Link>{" "}
                      and visa requirements in our{" "}
                      <Link href="/travel-visa" className="text-[var(--color-brand-primary)] font-semibold underline">
                        travel visa guide
                      </Link>.
                    </p>
                  )}
                  {s.step === "4" && (
                    <p className="text-xs text-charcoal-500 pt-1">
                      Check ceremonial dress codes in our{" "}
                      <Link href="/learn/what-to-wear-to-an-indian-wedding" className="text-[var(--color-brand-primary)] font-semibold underline">
                        what to wear guide
                      </Link>{" "}
                      and review{" "}
                      <Link href="/learn/indian-wedding-etiquette-for-foreigners" className="text-[var(--color-brand-primary)] font-semibold underline">
                        wedding etiquette dos and don&apos;ts
                      </Link>.
                    </p>
                  )}
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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Find Your Indian Wedding Experience</h3>
            <p className="text-xs text-charcoal-600">
              Browse authentic verified celebrations in Rajasthan, Goa, Punjab, Kerala, and across India.
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
