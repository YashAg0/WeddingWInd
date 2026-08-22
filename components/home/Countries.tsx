import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Country } from "@/types";

interface CountriesProps {
  countries?: Country[];
}

const FEATURED_DESTINATIONS = [
  {
    code: "RJ",
    name: "Rajasthan",
    weddingCount: 5,
    imageUrl: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Palaces, grand havelis, and regal desert celebrations in Jodhpur, Jaipur & Udaipur.",
  },
  {
    code: "GA",
    name: "Goa",
    weddingCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    description: "Oceanfront sunset mandaps, coastal music, and tropical beach celebrations.",
  },
  {
    code: "KL",
    name: "Kerala",
    weddingCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    description: "Backwater houseboats, palm-shaded rituals, and traditional banana leaf Sadya feasts.",
  },
  {
    code: "HP",
    name: "Himachal Pradesh",
    weddingCount: 2,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    description: "Pine forest mountain ceremonies, acoustic folk songs, and serene Himalayan vistas.",
  },
];

function DestinationCard({ dest }: { dest: typeof FEATURED_DESTINATIONS[0] }) {
  return (
    <Link
      href={`/weddings?destinations=${encodeURIComponent(dest.name.split(" ")[0])}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-warm-950 aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5] p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      role="listitem"
      aria-label={`Weddings in ${dest.name} — ${dest.weddingCount} celebrations`}
    >
      <Image
        src={dest.imageUrl}
        alt={`${dest.name} wedding destination`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

      {/* Top Count Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
          {dest.weddingCount} {dest.weddingCount === 1 ? "celebration" : "celebrations"}
        </span>
      </div>

      {/* Bottom Content */}
      <div className="relative z-10 space-y-1.5 text-white">
        <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <MapPin size={13} className="text-amber-300 flex-shrink-0" aria-hidden="true" />
          <span>{dest.name}</span>
        </div>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-white group-hover:text-amber-200 transition-colors leading-tight">
          {dest.name}
        </h3>
        <p className="text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed">
          {dest.description}
        </p>

        <div className="pt-2 flex items-center gap-1 text-xs font-bold text-amber-300 group-hover:text-amber-200">
          <span>Explore Weddings</span>
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export function Countries({ countries: _countries }: CountriesProps) {
  return (
    <section
      id="destinations"
      className="section-padding relative overflow-hidden bg-white border-t border-warm-200/50"
      aria-labelledby="destinations-heading"
    >
      <span id="countries" className="absolute -top-20" aria-hidden="true" />
      <div className="container-luxury relative z-10">
        {/* Header: Left = Heading + Subtitle, Right = View all destinations */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="section-label mb-2" aria-hidden="true">
              ICONIC REGIONS
            </div>
            <h2
              id="destinations-heading"
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-charcoal-900 tracking-tight leading-tight"
            >
              Celebration <span className="text-gradient-brand">Destinations</span>
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 mt-1.5 max-w-xl leading-relaxed">
              Explore wedding experiences across India’s most scenic regions and cultural capitals.
            </p>
          </div>

          <Link
            href="/weddings"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[var(--color-brand-primary)] hover:text-maroon-700 transition-colors group flex-shrink-0 self-start md:self-end"
            aria-label="View all destination regions"
          >
            <span>View all destinations</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </div>

        {/* 4 Featured Destination Cards (4 cols Desktop, 2x2 Tablet, 1 Mobile) */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch"
          role="list"
          aria-label="Featured destinations"
        >
          {FEATURED_DESTINATIONS.map((dest) => (
            <DestinationCard key={dest.code} dest={dest} />
          ))}
        </div>
      </div>
    </section>
  );
}
