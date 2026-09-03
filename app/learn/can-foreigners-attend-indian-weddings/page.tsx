import { Metadata } from "next";
import Link from "next/link";
import { Globe, Sparkles, HelpCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Can Foreigners Attend Indian Weddings? Cultural Hospitality & Rules",
  description:
    "Yes, international travelers are warmly welcomed at Indian weddings. Discover cultural hospitality traditions, invitation customs, and how guests participate.",
  keywords: [
    "can foreigners attend Indian weddings",
    "can tourists attend Indian weddings",
    "attend Indian wedding as a foreigner",
    "foreigner Indian wedding guest",
    "is it respectful to attend Indian wedding",
    "how can a tourist attend an Indian wedding",
    "indian wedding for foreigners",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/learn/can-foreigners-attend-indian-weddings",
  },
  openGraph: {
    title: "Can Foreigners Attend Indian Weddings? Cultural Hospitality & Rules | WeddingWithIndia",
    description:
      "Yes, international travelers are warmly welcomed at Indian weddings. Discover cultural hospitality traditions, invitation customs, and how guests participate.",
    url: "https://weddingwithindia.com/learn/can-foreigners-attend-indian-weddings",
    siteName: "WeddingWithIndia",
    type: "article",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Foreigners Attending Indian Weddings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Can Foreigners Attend Indian Weddings? Cultural Hospitality & Rules | WeddingWithIndia",
    description:
      "Understand how international travelers can respectfully attend authentic Indian weddings as honoured guests.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const FAQS = [
  {
    q: "Can foreigners attend an Indian wedding if they don't know the couple personally?",
    a: "Yes. Many Indian families intentionally choose to welcome international guests through verified cultural exchange platforms like WeddingWithIndia. This allows couples to share their regional traditions and gives global travelers an authentic, respectful cultural immersion.",
  },
  {
    q: "Is it considered respectful for tourists to attend an Indian wedding?",
    a: "Yes, provided you attend through an official invitation or verified platform where the host family has explicitly opened their celebration to global guests. Respecting dress codes, participating in cultural ceremonies, and following local customs ensures a warm and mutually rewarding experience.",
  },
  {
    q: "Do I need to speak Hindi or the local language to attend?",
    a: "No. Most Indian wedding ceremonies are conducted with family members and guests who speak fluent English. Additionally, experiences booked through WeddingWithIndia include dedicated on-site bilingual cultural coordinators who translate ceremonies, explain rituals, and guide guests.",
  },
  {
    q: "How many days does an Indian wedding last for international guests?",
    a: "Indian weddings typically span 3 to 5 days, encompassing pre-wedding rituals (Haldi, Mehndi, Sangeet), the sacred wedding ceremony (Mandap Pheras), and the grand reception dinner. Guests can choose experiences matching their travel itineraries.",
  },
];

export default function CanForeignersAttendPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Can Foreigners Attend Indian Weddings? A Complete Cultural Guide",
    description:
      "A comprehensive guide answering whether and how international travelers can respectfully attend authentic Indian weddings as honoured guests.",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://weddingwithindia.com/learn/can-foreigners-attend-indian-weddings",
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
    datePublished: "2026-01-15T00:00:00+05:30",
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
        name: "Can Foreigners Attend Indian Weddings?",
        item: "https://weddingwithindia.com/learn/can-foreigners-attend-indian-weddings",
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
          <span className="text-charcoal-700">Can Foreigners Attend?</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Globe size={13} /> Cultural Traveler Guide
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            Can Foreigners Attend Indian Weddings? What You Need to Know
          </h1>
          <p className="text-sm text-charcoal-500 font-medium">
            Published by WeddingWithIndia Editorial Team • Verified Cultural Hospitality Guide
          </p>
        </header>

        {/* Direct Answer Box for GEO / AI Citation */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Direct Answer for Travelers</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            <strong>Yes, foreigners can absolutely attend Indian weddings.</strong> In Indian culture, hospitality is governed by the ancient Sanskrit philosophy <em>&quot;Atithi Devo Bhava&quot;</em> (&quot;The Guest is God&quot;). Through structured platforms like <strong>WeddingWithIndia</strong>, international visitors can attend verified celebrations with participating host families as honoured guests, complete with ceremonial guidance, local coordinators, and authentic feast meals.
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-stone max-w-none text-charcoal-800 space-y-8 text-base leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-charcoal-900">
              The Philosophy of Indian Wedding Hospitality
            </h2>
            <p>
              In India, a wedding is far more than a ceremony between two individuals—it is a sacred alliance of families and communities that celebrates life, spirituality, music, and food. Hospitality holds a central place in Indian social values. When an international traveler attends an Indian wedding, families typically consider it a great privilege and joy to share their heritage with an eager cultural learner.
            </p>
            <p>
              Unlike Western weddings where guest lists are often strictly limited to intimate family circles, traditional Indian weddings commonly host hundreds—sometimes thousands—of guests across several days of celebration.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-charcoal-900">
              The Two Ways Foreigners Attend Indian Weddings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
              <div className="bg-white border border-warm-200/80 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-charcoal-900 text-base">1. Personal Invitation</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Invited directly by Indian friends, colleagues, or extended family members. Guests attend all public ceremonies as personal friends of the family.
                </p>
              </div>
              <div className="bg-white border border-warm-200/80 rounded-2xl p-5 space-y-2">
                <h3 className="font-bold text-charcoal-900 text-base">2. Verified Platform Invitation</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Booked via <strong>WeddingWithIndia</strong>, where participating families formally open guest allocations, providing dedicated on-site coordinators, attire guidance, and verified seating. Follow our <Link href="/learn/how-to-attend-an-indian-wedding" className="text-[var(--color-brand-primary)] font-semibold underline">step-by-step guest booking guide</Link> or view our <Link href="/learn/indian-wedding-experience-cost" className="text-[var(--color-brand-primary)] font-semibold underline">cost breakdown</Link>.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-charcoal-900">
              What International Guests Experience
            </h2>
            <p>
              When you attend through WeddingWithIndia, you participate in authentic multi-day celebrations including:
            </p>
            <ul className="space-y-2">
              <li><strong>Pre-Wedding Sangeet &amp; Mehndi:</strong> High-energy musical dance celebrations and herbal henna artistry.</li>
              <li><strong>The Vibrant Baraat Procession:</strong> Groom&apos;s joyful arrival with dancing family members and brass bands.</li>
              <li><strong>Sacred Mandap Ceremonies:</strong> The seven sacred steps (Saat Phere) around the holy fire with English commentary.</li>
              <li><strong>Royal Regional Feasting:</strong> Multi-course regional banquets prepared by master chefs.</li>
            </ul>
            <p className="text-sm text-charcoal-600 pt-2">
              Preparing your trip? Read our detailed guides on{" "}
              <Link href="/learn/what-to-wear-to-an-indian-wedding" className="text-[var(--color-brand-primary)] font-semibold underline">
                what to wear to an Indian wedding
              </Link>{" "}
              and essential{" "}
              <Link href="/learn/indian-wedding-etiquette-for-foreigners" className="text-[var(--color-brand-primary)] font-semibold underline">
                guest etiquette dos &amp; don&apos;ts
              </Link>, or explore popular celebration regions in{" "}
              <Link href="/destinations/rajasthan" className="text-[var(--color-brand-primary)] font-semibold underline">
                Rajasthan
              </Link>{" "}
              and{" "}
              <Link href="/destinations/goa" className="text-[var(--color-brand-primary)] font-semibold underline">
                Goa
              </Link>.
            </p>
          </section>
        </div>

        {/* FAQs Section */}
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

        {/* Next Steps CTA */}
        <div className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl text-charcoal-900">Ready to Experience an Indian Wedding?</h3>
            <p className="text-xs text-charcoal-600">
              Explore upcoming verified celebrations in Rajasthan, Goa, Punjab, Kerala, and across India.
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
