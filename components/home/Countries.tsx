import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Country } from "@/types";

interface CountriesProps {
  countries: Country[];
}

export function Countries({ countries }: CountriesProps) {
  const [featured, ...rest] = countries;

  return (
    <>
      <section
        id="countries"
        className="section-padding relative overflow-hidden"
        aria-labelledby="countries-heading"
        style={{
          background: "linear-gradient(180deg, var(--color-warm-50) 0%, var(--color-warm-100) 50%, var(--color-warm-50) 100%)",
        }}
      >
      <div className="container-luxury">
        <SectionHeader
          id="countries-heading"
          label="Destinations"
          title="Where will you celebrate?"
          highlightedWord="celebrate"
          description="Explore weddings from iconic Indian regions and surrounding South Asian destinations."
          className="mb-14"
          theme="light"
        />

        {/* Asymmetric grid: big card + 3 smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5" role="list" aria-label="Countries">
          {/* Featured large card */}
          {featured && (
            <Link
              href={`/weddings?country=${featured.code}`}
              className="lg:col-span-3 card group relative overflow-hidden aspect-[16/9] lg:aspect-auto lg:min-h-[420px]"
              role="listitem"
              aria-label={`Weddings in ${featured.name} — ${featured.weddingCount} listings`}
            >
              <Image
                src={featured.imageUrl}
                alt={`${featured.name} weddings`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-maroon-900/90 via-maroon-900/40 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-[var(--color-gold-300)]" aria-hidden="true" />
                  <span className="text-[var(--color-gold-300)] text-xs font-semibold uppercase tracking-widest">
                    Top Destination
                  </span>
                </div>
                <h3 className="font-display font-bold text-white text-3xl sm:text-4xl mb-2">
                  {featured.name}
                </h3>
                <p className="text-white/90 text-sm mb-4 drop-shadow-sm font-medium">{featured.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-[var(--color-gold-300)]">
                    {featured.weddingCount.toLocaleString()} weddings
                  </span>
                  <span className="flex items-center gap-1.5 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    Explore <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Smaller cards column */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-5">
            {rest.map((country) => (
              <Link
                key={country.code}
                href={`/weddings?country=${country.code}`}
                className="card group relative overflow-hidden aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-[120px]"
                role="listitem"
                aria-label={`Weddings in ${country.name} — ${country.weddingCount} listings`}
              >
                <Image
                  src={country.imageUrl}
                  alt={`${country.name} weddings`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-maroon-900/90 via-maroon-900/40 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="font-display font-bold text-white text-lg leading-tight">
                    {country.name}
                  </h3>
                  <p className="text-white/90 text-sm mt-1 drop-shadow-sm">{country.description}</p>
                  <span className="text-[var(--color-gold-300)] text-xs font-semibold mt-1">
                    {country.weddingCount} listings
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
