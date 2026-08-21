import { Metadata } from "next";
import Link from "next/link";
import { Landmark, Sparkles, Shirt, Utensils, ArrowRight, HelpCircle } from "lucide-react";
import { getWeddings } from "@/lib/actions";
import type { Wedding } from "@/types";
import { WeddingCard } from "@/components/wedding/WeddingCard";

export const metadata: Metadata = {
  title: "Rajasthan Indian Wedding Experiences: Royal Palace & Heritage Celebrations",
  description:
    "Attend authentic royal Indian weddings in Rajasthan. Experience palace heritage celebrations in Jaipur, Udaipur, and Jodhpur with traditional Rajput and Marwari rituals, feasts, and music.",
  keywords: [
    "Rajasthan wedding experience",
    "Indian wedding experience Rajasthan",
    "Jaipur wedding experience",
    "Udaipur wedding experience",
    "Jodhpur royal wedding",
    "attend wedding in Rajasthan",
    "palace wedding India",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/destinations/rajasthan",
  },
  openGraph: {
    title: "Rajasthan Indian Wedding Experiences | WeddingWithIndia",
    description:
      "Experience royal palace wedding celebrations in Jaipur, Udaipur, and Jodhpur as an honoured guest.",
    url: "https://weddingwithindia.com/destinations/rajasthan",
    siteName: "WeddingWithIndia",
    type: "website",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rajasthan Royal Wedding Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rajasthan Indian Wedding Experiences | WeddingWithIndia",
    description:
      "Attend royal palace weddings in Jaipur, Udaipur, and Jodhpur with verified host families.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const FAQS = [
  {
    q: "What makes a Rajasthan wedding unique?",
    a: "Rajasthan weddings are world-famous for their regal heritage settings (forts, palaces, and historic havelis), royal Baraat processions with caparisoned horses and camels, traditional Ghoomar folk dancing, and royal silver thali feasts.",
  },
  {
    q: "When is the best season to attend a wedding in Rajasthan?",
    a: "The peak wedding season in Rajasthan runs from October through March, offering pleasant daytime temperatures and cool, festive desert evenings.",
  },
];

export default async function RajasthanDestinationPage() {
  const allWeddings: Wedding[] = await getWeddings();
  const rajasthanWeddings = allWeddings.filter(
    (w) =>
      w.state?.toLowerCase().includes("rajasthan") ||
      w.location?.toLowerCase().includes("rajasthan") ||
      w.city?.toLowerCase().includes("jaipur") ||
      w.city?.toLowerCase().includes("udaipur") ||
      w.city?.toLowerCase().includes("jodhpur") ||
      w.region?.toLowerCase().includes("rajasthan")
  );

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: "Rajasthan, India",
    description:
      "World-renowned cultural wedding destination featuring royal palace estates, historic havelis, and vibrant Rajput and Marwari traditions.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Rajasthan",
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
        name: "Rajasthan",
        item: "https://weddingwithindia.com/destinations/rajasthan",
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
          <span className="text-charcoal-700">Rajasthan</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Landmark size={13} /> Royal Palace Celebrations
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
            Rajasthan Indian Wedding Experiences
          </h1>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-3xl">
            Immerse yourself in timeless royal splendour across Jaipur, Udaipur, Jodhpur, and Jaisalmer. Attend multi-day palace weddings as an honoured guest with participating Rajput and Marwari families.
          </p>
        </header>

        {/* Direct Answer Summary Box */}
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Destination Highlights</span>
          </div>
          <p className="text-charcoal-900 font-medium text-base sm:text-lg leading-relaxed">
            Rajasthan is the global epicenter of royal Indian destination weddings. Celebrations span 3 to 5 days in heritage forts and lakeside palaces, featuring vibrant Sangeet musical nights, royal elephant and vintage car Baraat processions, sacred Mandap pheras, and authentic Marwari silver thali feasts.
          </p>
        </div>

        {/* Cultural Specifics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Iconic Traditions</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Grand Baraat with royal safas (turbans), Ghoomar and Kalbeliya folk dances, Shehnai musical dawn recitals, and Saptapadi vows.
            </p>
          </div>

          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Shirt size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Dress Expectations</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Royal Lehengas, Bandhani and Leheriya dupattas for women; embroidered Sherwanis, Bandhgalas, and colorful turbans for men.
            </p>
          </div>

          <div className="bg-white border border-warm-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Utensils size={20} />
            </div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">Royal Cuisine</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Dal Baati Churma, Gatte ki Sabzi, Ker Sangri, Paneer Rajwada, and traditional sweets like Ghewar, Malpua, and Mawa Kachori.
            </p>
          </div>
        </div>

        {/* Available Weddings in Rajasthan */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-charcoal-900">
                Current Rajasthan Wedding Celebrations
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Verified heritage experiences open to international travelers in Rajasthan.
              </p>
            </div>
            <Link href="/weddings" className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1">
              View All ({allWeddings.length}) <ArrowRight size={12} />
            </Link>
          </div>

          {rajasthanWeddings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rajasthanWeddings.map((wedding) => (
                <WeddingCard key={wedding.id} wedding={wedding} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-warm-200/80 rounded-3xl p-8 text-center space-y-3">
              <p className="text-sm text-charcoal-600">
                New royal palace celebrations are listed on a rolling basis. Check our full directory for upcoming dates.
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

        {/* Cross-Link Guides */}
        <div className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl text-charcoal-900">Explore Cultural Etiquette &amp; Guides</h3>
            <p className="text-xs text-charcoal-600">
              Read what to wear, etiquette customs, and ceremony rituals in our Knowledge Hub.
            </p>
          </div>
          <Link href="/learn" className="btn-luxury px-6 py-3 shrink-0 inline-flex items-center gap-2 text-sm">
            Read Cultural Guides <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
