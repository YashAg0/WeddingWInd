import { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Sparkles, Shirt, Utensils, HeartHandshake, Compass, DollarSign, Globe, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Indian Wedding Cultural Guides & Traveler Knowledge Hub",
  description:
    "Explore comprehensive, authoritative guides on attending Indian weddings as a foreign traveler. Learn about traditions, rituals, dress codes, etiquette, food, and costs.",
  keywords: [
    "Indian wedding guide for foreigners",
    "attend Indian wedding guide",
    "Indian wedding traditions explained",
    "what to wear to an Indian wedding",
    "Indian wedding etiquette",
    "Indian wedding food guide",
    "Indian wedding tourism",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/learn",
  },
  openGraph: {
    title: "Indian Wedding Cultural Guides & Traveler Knowledge Hub | WeddingWithIndia",
    description:
      "Explore comprehensive, authoritative guides on attending Indian weddings as a foreign traveler. Learn about traditions, rituals, dress codes, etiquette, food, and costs.",
    url: "https://weddingwithindia.com/learn",
    siteName: "WeddingWithIndia",
    type: "website",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WeddingWithIndia Knowledge Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Wedding Cultural Guides & Knowledge Hub | WeddingWithIndia",
    description:
      "Authoritative cultural guides for international travelers attending Indian weddings.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const ARTICLES = [
  {
    slug: "can-foreigners-attend-indian-weddings",
    title: "Can Foreigners Attend Indian Weddings? A Complete Cultural Guide",
    summary:
      "Yes, international travelers are genuinely welcome at Indian weddings. Understand the cultural philosophy of Atithi Devo Bhava, invitation models, and how to attend respectfully.",
    icon: Globe,
    badge: "Essential Reading",
    readTime: "6 min read",
  },
  {
    slug: "how-to-attend-an-indian-wedding",
    title: "How to Attend an Indian Wedding as a Tourist: Step-by-Step",
    summary:
      "A complete walkthrough from discovering verified host celebrations to attending multi-day rituals with on-site coordinator support.",
    icon: Compass,
    badge: "Step-by-Step Guide",
    readTime: "7 min read",
  },
  {
    slug: "indian-wedding-etiquette-for-foreigners",
    title: "Indian Wedding Etiquette for Foreigners: Customs, Dos & Don'ts",
    summary:
      "Everything you need to know about removing shoes, greeting hosts with Namaste, blessing the couple, gifting customs, photography etiquette, and alcohol norms.",
    icon: HeartHandshake,
    badge: "Etiquette & Customs",
    readTime: "8 min read",
  },
  {
    slug: "what-to-wear-to-an-indian-wedding",
    title: "What to Wear to an Indian Wedding: Guest Attire & Color Guide",
    summary:
      "Comprehensive clothing advice for women and men across Haldi, Mehndi, Sangeet, Ceremony, and Reception. Includes colors to wear and colors to avoid.",
    icon: Shirt,
    badge: "Style & Attire",
    readTime: "7 min read",
  },
  {
    slug: "indian-wedding-rituals-explained",
    title: "Indian Wedding Rituals Explained: From Haldi to Saptapadi",
    summary:
      "Demystifying sacred ceremonies: understand the significance of Haldi, Mehndi, Sangeet, Baraat, Varmala, Kanyadaan, Saat Phere (Seven Vows), and Vidaai.",
    icon: Sparkles,
    badge: "Ceremonies & Meaning",
    readTime: "10 min read",
  },
  {
    slug: "indian-wedding-food-guide",
    title: "Indian Wedding Food & Feasting Guide: Regional Culinary Traditions",
    summary:
      "Explore royal Rajasthani thalis, Punjabi tandoor banquets, Kerala banana leaf Sadyas, and Goan coastal delicacies, with dietary and spice level insights.",
    icon: Utensils,
    badge: "Culinary Traditions",
    readTime: "6 min read",
  },
  {
    slug: "indian-wedding-tourism",
    title: "The Rise of Indian Wedding Tourism: Cultural Immersion in India",
    summary:
      "Discover how wedding tourism is connecting global travelers with authentic Indian communities, fostering meaningful cultural exchange and host empowerment.",
    icon: BookOpen,
    badge: "Tourism Trends",
    readTime: "5 min read",
  },
  {
    slug: "indian-wedding-experience-cost",
    title: "How Much Does an Indian Wedding Experience Cost? Pricing Breakdown",
    summary:
      "Transparent breakdown of guest experience fees, inclusions, accommodation options, on-site coordinator services, and value comparison.",
    icon: DollarSign,
    badge: "Costs & Inclusions",
    readTime: "6 min read",
  },
];

export default function LearnHubPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Indian Wedding Cultural Guides & Knowledge Hub",
    description:
      "Authoritative educational guides on Indian wedding traditions, attire, etiquette, food, rituals, and tourism for international travelers.",
    url: "https://weddingwithindia.com/learn",
    publisher: {
      "@type": "Organization",
      "@id": "https://weddingwithindia.com/#organization",
      name: "WeddingWithIndia",
      url: "https://weddingwithindia.com",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ARTICLES.map((art, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: art.title,
        url: `https://weddingwithindia.com/learn/${art.slug}`,
      })),
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
        name: "Learn",
        item: "https://weddingwithindia.com/learn",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="container-luxury space-y-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-brand-primary)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal-700">Knowledge Hub</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-3xl space-y-4">
          <SectionHeader
            label="Cultural Guides & Knowledge Hub"
            title="The Ultimate Guide to Experiencing Indian Weddings"
            description="Authoritative, step-by-step cultural guides designed to help international travelers understand, prepare for, and respectfully participate in authentic Indian wedding celebrations."
            align="left"
          />
        </div>

        {/* AI Answer / Citability Summary Block */}
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>At a Glance: Attending Indian Weddings as an International Guest</span>
          </div>
          <p className="text-charcoal-800 text-sm sm:text-base leading-relaxed">
            Indian weddings are globally renowned multi-day cultural celebrations centered around sacred rituals, rich cuisine, music, and generous hospitality. Through <strong>WeddingWithIndia</strong>, international visitors can attend real, verified family weddings with dedicated local coordinators, ensuring respectful immersion, complete attire guidance, and transparent participation.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARTICLES.map((article) => {
            const Icon = article.icon;
            return (
              <Link
                key={article.slug}
                href={`/learn/${article.slug}`}
                className="group bg-white border border-warm-200/80 hover:border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-maroon-50 group-hover:text-[var(--color-brand-primary)] transition-colors">
                      <Icon size={22} />
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.6875rem] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {article.badge}
                      </span>
                      <span className="text-xs text-charcoal-400 font-medium">
                        {article.readTime}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-display font-bold text-xl text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-sm text-charcoal-600 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-warm-100 flex items-center justify-between text-sm font-bold text-[var(--color-brand-primary)]">
                  <span>Read Full Guide</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Cross-Link Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-white border border-warm-200/70 rounded-3xl p-6 space-y-3">
            <h3 className="font-display font-bold text-base text-charcoal-900">Explore Regional Destinations</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Discover unique wedding traditions in Rajasthan palaces, Goan beaches, Punjabi farmhouses, and Kerala backwaters.
            </p>
            <Link href="/destinations" className="text-xs font-bold text-[var(--color-brand-primary)] inline-flex items-center gap-1 hover:underline">
              Browse Destination Guides <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white border border-warm-200/70 rounded-3xl p-6 space-y-3">
            <h3 className="font-display font-bold text-base text-charcoal-900">Browse Active Celebrations</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              View upcoming verified Indian wedding experiences open to international travelers across India.
            </p>
            <Link href="/weddings" className="text-xs font-bold text-[var(--color-brand-primary)] inline-flex items-center gap-1 hover:underline">
              View Wedding Directory <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white border border-warm-200/70 rounded-3xl p-6 space-y-3">
            <h3 className="font-display font-bold text-base text-charcoal-900">Verified Safety Standards</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Learn how host identity checks, on-site bilingual coordinators, and emergency protocols protect every guest.
            </p>
            <Link href="/trust?tab=safety" className="text-xs font-bold text-[var(--color-brand-primary)] inline-flex items-center gap-1 hover:underline">
              Read Safety Protocols <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
