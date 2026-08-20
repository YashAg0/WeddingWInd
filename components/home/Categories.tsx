import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ScrollText,
  Utensils,
  Music,
  Shirt,
  Users,
} from "lucide-react";
import type { Category } from "@/types";

interface CategoriesProps {
  categories?: Category[];
}

const FEATURED_STYLES = [
  {
    id: "royal",
    name: "Royal Heritage",
    filterParam: "royal",
    filterKey: "category",
    count: 5,
    tagline: "Palaces, heritage havelis & grand celebrations",
    imageUrl:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    gradient: "from-amber-950/85 via-black/40 to-transparent",
  },
  {
    id: "punjabi",
    name: "Punjabi",
    filterParam: "Punjab",
    filterKey: "destinations",
    count: 2,
    tagline: "Music, family celebrations & vibrant traditions",
    imageUrl:
      "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=800&q=80",
    gradient: "from-red-950/85 via-black/40 to-transparent",
  },
  {
    id: "south-indian",
    name: "South Indian",
    filterParam: "Tamil Nadu",
    filterKey: "destinations",
    count: 3,
    tagline: "Regional traditions, cuisine & beautiful ceremonies",
    imageUrl:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
    gradient: "from-emerald-950/85 via-black/40 to-transparent",
  },
  {
    id: "muslim",
    name: "Muslim / Nikah",
    filterParam: "Muslim",
    filterKey: "religions",
    count: 2,
    tagline: "Nikah, family gatherings & warm hospitality",
    imageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    gradient: "from-teal-950/85 via-black/40 to-transparent",
  },
];

const EXPERIENCE_HIGHLIGHTS = [
  {
    icon: (
      <ScrollText
        size={16}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Traditions & Rituals",
    short: "Discover ceremonies, blessings, vows & customs",
  },
  {
    icon: (
      <Utensils
        size={16}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Regional Food",
    short: "Taste local dishes, sweets & family favourites",
  },
  {
    icon: (
      <Music
        size={16}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Music & Dance",
    short: "From Dhol beats to Sangeet celebrations",
  },
  {
    icon: (
      <Shirt
        size={16}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Attire Guidance",
    short: "Simple tips on dress, colours & etiquette",
  },
  {
    icon: (
      <Users
        size={16}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Meet the Family",
    short: "Share genuine moments with your host family",
  },
  {
    icon: (
      <Sparkles
        size={16}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    title: "Guest Support",
    short: "Helpful guidance before and during your experience",
  },
];

export function Categories({ categories: _categories }: CategoriesProps) {
  return (
    <section
      id="wedding-styles"
      className="section-padding relative overflow-hidden bg-white border-t border-warm-200/50"
      aria-labelledby="wedding-styles-heading"
    >
      <div className="container-luxury relative z-10 space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="section-label mb-2" aria-hidden="true">
              CULTURAL TRADITIONS
            </div>

            <h2
              id="wedding-styles-heading"
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-charcoal-900 tracking-tight leading-tight"
            >
              Explore by{" "}
              <span className="text-gradient-brand">Wedding Style</span>
            </h2>

            <p className="text-sm sm:text-base text-charcoal-600 mt-1.5 max-w-xl leading-relaxed">
              Discover weddings through different regions, traditions, food,
              music, and family customs.
            </p>
          </div>

          <Link
            href="/weddings"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[var(--color-brand-primary)] hover:text-maroon-700 transition-colors group flex-shrink-0 self-start md:self-end"
            aria-label="View all wedding traditions"
          >
            <span>Explore All</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Featured Styles */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
          role="list"
          aria-label="Featured wedding styles"
        >
          {FEATURED_STYLES.map((style) => (
            <Link
              key={style.id}
              href={`/weddings?${style.filterKey}=${encodeURIComponent(
                style.filterParam
              )}`}
              className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-warm-900 aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5] p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              role="listitem"
              aria-label={`${style.name} weddings, ${style.count} available ${
                style.count === 1 ? "celebration" : "celebrations"
              }`}
            >
              <Image
                src={style.imageUrl}
                alt={`${style.name} Indian wedding`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              <div
                className={`absolute inset-0 bg-gradient-to-t ${style.gradient}`}
              />

              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Count Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-black/60 backdrop-blur-md text-amber-300 text-[0.6875rem] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                  {style.count}{" "}
                  {style.count === 1 ? "celebration" : "celebrations"}
                </span>
              </div>

              {/* Card Content */}
              <div className="relative z-10 space-y-1 text-white">
                <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-amber-200 transition-colors leading-tight">
                  {style.name}
                </h3>

                <p className="text-xs text-warm-100/90 line-clamp-2 leading-relaxed">
                  {style.tagline}
                </p>

                <div className="pt-1.5 flex items-center gap-1 text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  <span>Explore</span>
                  <ArrowRight
                    size={12}
                    className="group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Experience Highlights */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-widest mb-1">
                WHAT YOU CAN EXPERIENCE
              </div>

              <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900 leading-tight">
                More than a ceremony.
              </h3>

              <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-lg leading-relaxed">
                Every celebration is different, shaped by its family, region,
                and traditions.
              </p>
            </div>

            <Link
              href="/weddings"
              className="btn btn-primary text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl inline-flex items-center gap-1.5 shadow-xs flex-shrink-0 self-start sm:self-end"
            >
              <span>Explore Weddings</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {EXPERIENCE_HIGHLIGHTS.map((highlight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-warm-50/70 border border-warm-200/60 rounded-xl p-4 hover:border-warm-300 hover:bg-white transition-all duration-200"
              >
                <div className="p-2 rounded-lg bg-white border border-warm-200/60 flex-shrink-0 shadow-xs">
                  {highlight.icon}
                </div>

                <div className="min-w-0">
                  <h4 className="font-display font-bold text-sm text-charcoal-900 leading-snug">
                    {highlight.title}
                  </h4>

                  <p className="text-xs text-charcoal-600 mt-0.5 leading-relaxed">
                    {highlight.short}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[0.6875rem] text-charcoal-400 italic mt-4">
            Experiences, food, rituals, and schedules vary by celebration.
            Details are provided before attendance.
          </p>
        </div>
      </div>
    </section>
  );
}