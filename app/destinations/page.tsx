import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Sparkles, ArrowRight, Building, Sun, Music, Palmtree, Landmark, Compass } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Indian Wedding Destinations: Explore Regional Wedding Traditions",
  description:
    "Discover authentic Indian wedding experiences across iconic destinations: Rajasthan royal palaces, Goa coastal beaches, Punjab countryside, and Kerala backwaters.",
  keywords: [
    "Indian wedding destinations",
    "destination wedding India",
    "Rajasthan wedding experience",
    "Goa wedding experience",
    "Punjab wedding experience",
    "Kerala wedding experience",
    "Indian wedding locations",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/destinations",
  },
  openGraph: {
    title: "Indian Wedding Destinations | WeddingWithIndia",
    description:
      "Explore regional wedding traditions and experiences across iconic destinations in India.",
    url: "https://weddingwithindia.com/destinations",
    siteName: "WeddingWithIndia",
    type: "website",
    images: [
      {
        url: "https://weddingwithindia.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WeddingWithIndia Destinations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Wedding Destinations | WeddingWithIndia",
    description:
      "Explore regional wedding traditions across Rajasthan, Goa, Punjab, Kerala, and across India.",
    images: ["https://weddingwithindia.com/og-image.jpg"],
  },
};

const DESTINATIONS = [
  {
    slug: "rajasthan",
    name: "Rajasthan",
    cities: "Jaipur, Udaipur, Jodhpur, Jaisalmer",
    tagline: "Royal Palaces, Heritage Havelis & Desert Fortresses",
    description:
      "Experience grand royal weddings in historic palaces. Witness regal Baraats with caparisoned horses, Shehnai melodies, folk Ghoomar dances, and lavish royal thalis.",
    icon: Landmark,
    bestSeason: "October to March",
  },
  {
    slug: "goa",
    name: "Goa",
    cities: "North Goa, South Goa Coastal Resorts",
    tagline: "Sun-Kissed Beach Nuptials & Coastal Celebrations",
    description:
      "Celebrate beachfront weddings with oceanview mandaps, sunset Sangeet parties, Indo-Portuguese heritage, and fresh coastal delicacies.",
    icon: Sun,
    bestSeason: "November to February",
  },
  {
    slug: "punjab",
    name: "Punjab",
    cities: "Amritsar, Chandigarh, Ludhiana",
    tagline: "High-Energy Folk, Sangeet Nights & Anand Karaj",
    description:
      "Immerse yourself in joyous Punjabi celebrations: live Dhol drummers, high-energy Bhangra and Giddha, sacred Gurdwara ceremonies, and rich tandoori feasts.",
    icon: Music,
    bestSeason: "October to March",
  },
  {
    slug: "kerala",
    name: "Kerala",
    cities: "Kochi, Kumarakom, Alleppey, Kovalam",
    tagline: "Serene Backwaters, Temple Traditions & Traditional Sadya",
    description:
      "Experience the spiritual elegance of South India: coconut grove backwaters, traditional gold-bordered Kasavu attire, and 24-dish feasts served on fresh banana leaves.",
    icon: Palmtree,
    bestSeason: "September to March",
  },
  {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    cities: "New Delhi, Gurugram, Noida",
    tagline: "Opulent Farmhouse Palaces & Haute Couture Glamour",
    description:
      "Witness grand North Indian celebrations in sprawling farm palace estates featuring celebrity entertainment, designer couture, and live gourmet culinary bazaars.",
    icon: Building,
    bestSeason: "October to March",
  },
  {
    slug: "mumbai",
    name: "Mumbai & Maharashtra",
    cities: "Mumbai, Pune, Alibaug",
    tagline: "Oceanfront Luxury, Bollywood Energy & Heritage Lagna",
    description:
      "Celebrate against the Arabian Sea: vibrant Maharashtrian wedding customs, Bollywood-inspired Sangeet nights, and chic coastal soirees.",
    icon: Compass,
    bestSeason: "November to March",
  },
];

export default function DestinationsHubPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Indian Wedding Destinations Hub",
    description:
      "A comprehensive guide to regional Indian wedding destinations, traditions, and experiences across Rajasthan, Goa, Punjab, Kerala, Delhi NCR, and Mumbai.",
    url: "https://weddingwithindia.com/destinations",
    publisher: {
      "@type": "Organization",
      "@id": "https://weddingwithindia.com/#organization",
      name: "WeddingWithIndia",
      url: "https://weddingwithindia.com",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: DESTINATIONS.map((dest, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `${dest.name} Wedding Experiences`,
        url: `https://weddingwithindia.com/destinations/${dest.slug}`,
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
        name: "Destinations",
        item: "https://weddingwithindia.com/destinations",
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
          <span className="text-charcoal-700">Destinations</span>
        </nav>

        {/* Hero Section */}
        <div className="max-w-3xl space-y-4">
          <SectionHeader
            label="Iconic Cultural Regions"
            title="Explore Indian Wedding Destinations"
            description="India's wedding traditions vary profoundly by geography, culture, and architecture. Discover what makes celebrations in each iconic region uniquely magical."
            align="left"
          />
        </div>

        {/* Quick Citability Summary Box */}
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-700" />
            <span>Regional Diversity in Indian Wedding Tourism</span>
          </div>
          <p className="text-charcoal-800 text-sm sm:text-base leading-relaxed">
            From the majestic royal palaces of <strong>Rajasthan</strong> and the sun-drenched beaches of <strong>Goa</strong> to the energetic folk beats of <strong>Punjab</strong> and the tranquil backwaters of <strong>Kerala</strong>, WeddingWithIndia connects travelers to verified wedding celebrations rooted in rich regional heritage.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS.map((dest) => {
            const Icon = dest.icon;
            return (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.slug}`}
                className="group bg-white border border-warm-200/80 hover:border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-maroon-50 group-hover:text-[var(--color-brand-primary)] transition-colors">
                      <Icon size={22} />
                    </span>
                    <span className="text-[0.6875rem] font-bold text-charcoal-500 bg-warm-100 px-2.5 py-1 rounded-full">
                      {dest.bestSeason}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-400">
                      <MapPin size={12} />
                      <span>{dest.cities}</span>
                    </div>
                    <h2 className="font-display font-bold text-2xl text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors">
                      {dest.name}
                    </h2>
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      {dest.tagline}
                    </p>
                    <p className="text-sm text-charcoal-600 leading-relaxed pt-1">
                      {dest.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-warm-100 flex items-center justify-between text-sm font-bold text-[var(--color-brand-primary)]">
                  <span>Explore {dest.name} Weddings</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Cross-Link Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <div className="bg-white border border-warm-200/70 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <h3 className="font-display font-bold text-xl text-charcoal-900">Explore Educational Guides</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Learn about Indian wedding rituals, attire, etiquette, food, and step-by-step guest journey guides in our Knowledge Hub.
            </p>
            <Link href="/learn" className="btn-luxury px-5 py-2.5 inline-flex items-center gap-2 text-xs">
              View Knowledge Hub <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white border border-warm-200/70 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <h3 className="font-display font-bold text-xl text-charcoal-900">Interactive Map View</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              View geographic wedding distribution across India with our interactive wedding experience map.
            </p>
            <Link href="/weddings/map" className="btn-luxury px-5 py-2.5 inline-flex items-center gap-2 text-xs">
              Open Experience Map <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
