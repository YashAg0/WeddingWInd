import { Metadata } from "next";
import Link from "next/link";
import { Music, Sparkles, Shirt, Utensils, ArrowRight, HelpCircle } from "lucide-react";
import { getWeddings } from "@/lib/actions";
import type { Wedding } from "@/types";
import { WeddingCard } from "@/components/wedding/WeddingCard";

export const metadata: Metadata = {
  title: "Punjab Indian Wedding Experiences: High-Energy Bhangra & Anand Karaj Celebrations",
  description:
    "Attend authentic Punjabi weddings in Amritsar and Chandigarh. Experience live Dhol processions, Anand Karaj ceremonies, vibrant Sangeet dances, and tandoori feasts with verified hosts.",
  keywords: [
    "Punjab wedding experience",
    "attend Punjabi wedding in India",
    "Anand Karaj wedding experience",
    "Bhangra Sangeet wedding Amritsar",
    "Punjabi wedding traditions for tourists",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/destinations/punjab",
  },
  openGraph: {
    title: "Punjab Indian Wedding Experiences | WeddingWithIndia",
    description:
      "Experience high-energy Punjabi weddings in Amritsar and Chandigarh with verified host families.",
    url: "https://weddingwithindia.com/destinations/punjab",
    siteName: "WeddingWithIndia",
    type: "website",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Punjab Wedding Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Punjab Indian Wedding Experiences | WeddingWithIndia",
    description:
      "Attend vibrant Punjabi wedding celebrations with authentic Dhol, Bhangra, and Anand Karaj ceremonies.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const FAQS = [
  {
    q: "What is an Anand Karaj ceremony?",
    a: "The Anand Karaj (Blissful Union) is the sacred Sikh wedding ceremony held in a Gurdwara in the presence of the Guru Granth Sahib, involving the singing of four sacred hymns (Lavan).",
  },
  {
    q: "Do guests need to cover their heads in Punjab weddings?",
    a: "Yes, when entering a Gurdwara for an Anand Karaj ceremony, all men and women must cover their heads with a scarf or rumal and remove footwear.",
  },
];

export default async function PunjabDestinationPage() {
  const allWeddings: Wedding[] = await getWeddings();
  const punjabWeddings = allWeddings.filter(
    (w) =>
      w.state?.toLowerCase().includes("punjab") ||
      w.location?.toLowerCase().includes("punjab") ||
      w.city?.toLowerCase().includes("amritsar") ||
      w.city?.toLowerCase().includes("chandigarh") ||
      w.region?.toLowerCase().includes("punjab")
  );

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: "Punjab, India",
    description:
      "Vibrant agricultural and cultural heartland of North India, celebrated for infectious music, Dhol rhythms, and grand feasts.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Punjab",
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
        name: "Punjab",
        item: "https://weddingwithindia.com/destinations/punjab",
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
          <span className="text-charcoal-700">Punjab</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Music size={13} /> High-Energy Folk &amp; Sangeet
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            Punjab Indian Wedding Experiences
          </h1>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-3xl">
            Join the most exuberant wedding celebrations in India: live Dhol processions, electric Sangeet dance parties, heartfelt Anand Karaj ceremonies, and legendary tandoori hospitality in Amritsar and Chandigarh.
          </p>
        </header>

        {/* Summary Box */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Destination Highlights</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Punjabi weddings are renowned for unmatched energy, warm hospitality, and open-hearted celebration. Guests dance in the Baraat to thunderous Dhol beats, participate in the colorful Jaggo night, and enjoy generous clay-oven feasts and rich desserts.
          </p>
        </div>

        {/* Specifics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Iconic Rituals</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Jaggo lantern processions, energetic Bhangra &amp; Giddha dance-offs, Chooda ceremony, and the sacred Anand Karaj.
            </p>
          </div>

          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Shirt size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Phulkari &amp; Silk Attire</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Vibrant Patiala suits with hand-embroidered Phulkaris for women; silk Kurta-Pyjamas with matching jackets and bright turbans for men.
            </p>
          </div>

          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Utensils size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Legendary Feasting</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Dal Makhani, Butter Chicken / Paneer Tikka, Amritsari Kulcha, Sarson da Saag &amp; Makki di Roti, and creamy Kheer.
            </p>
          </div>
        </div>

        {/* Available Weddings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-charcoal-900">
                Punjab Wedding Celebrations
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Verified experiences open to international travelers in Punjab.
              </p>
            </div>
            <Link href="/weddings" className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1">
              View All ({allWeddings.length}) <ArrowRight size={12} />
            </Link>
          </div>

          {punjabWeddings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {punjabWeddings.map((wedding) => (
                <WeddingCard key={wedding.id} wedding={wedding} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-warm-200/80 rounded-3xl p-8 text-center space-y-3">
              <p className="text-sm text-charcoal-600">
                New Punjabi celebrations are listed regularly. Explore our full live directory.
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
            <h3 className="font-display font-bold text-xl text-charcoal-900">Read Rituals &amp; Ceremonies Guide</h3>
            <p className="text-xs text-charcoal-600">
              Learn about sacred Sikh, Hindu, and regional wedding ceremonies.
            </p>
          </div>
          <Link href="/learn/indian-wedding-rituals-explained" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            Read Rituals Guide <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
