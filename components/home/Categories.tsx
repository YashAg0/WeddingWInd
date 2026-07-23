import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, Sparkles, Flower2, Waves, Compass, Flame } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Category } from "@/types";

interface CategoriesProps {
  categories: Category[];
}

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("royal")) return <Crown size={18} className="text-[var(--color-gold-300)]" />;
  if (lower.includes("punjabi")) return <Sparkles size={18} className="text-[var(--color-gold-300)]" />;
  if (lower.includes("south")) return <Flower2 size={18} className="text-[var(--color-gold-300)]" />;
  if (lower.includes("beach")) return <Waves size={18} className="text-[var(--color-gold-300)]" />;
  if (lower.includes("destination")) return <Compass size={18} className="text-[var(--color-gold-300)]" />;
  return <Flame size={18} className="text-[var(--color-gold-300)]" />;
}

export function Categories({ categories }: CategoriesProps) {
  return (
    <section
      id="categories"
      className="section-padding bg-[var(--color-warm-50)]"
      aria-labelledby="categories-heading"
    >
      <div className="container-luxury">
        <SectionHeader
          id="categories-heading"
          label="Wedding Styles"
          title="Find your perfect celebration"
          highlightedWord="perfect celebration"
          description="From royal palaces to beach shores — choose the wedding experience that speaks to your soul."
          className="mb-14"
        />

        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
          role="list"
          aria-label="Wedding categories"
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/weddings?category=${category.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="card group relative overflow-hidden aspect-[4/5] sm:aspect-[3/4] hover:shadow-[0_16px_48px_-12px_rgba(107,16,38,0.15)] transition-shadow duration-500 rounded-3xl"
              role="listitem"
              aria-label={`${category.name} weddings — ${category.weddingCount} listings`}
            >
              {/* Image */}
              <Image
                src={category.imageUrl}
                alt={`${category.name} wedding style`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                loading={index < 2 ? "eager" : "lazy"}
              />

              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-charcoal-950/95 via-charcoal-950/20 to-transparent transition-opacity duration-500 opacity-80 group-hover:opacity-100"
                aria-hidden="true"
              />

              {/* Maroon hover tint */}
              <div
                className="absolute inset-0 bg-[var(--color-brand-primary)]/0 group-hover:bg-[var(--color-brand-primary)]/20 transition-all duration-700"
                aria-hidden="true"
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {getCategoryIcon(category.name)}
                </div>

                <h3 className="font-display font-bold text-white text-lg sm:text-xl leading-tight mb-1">
                  {category.name}
                </h3>

                <p className="text-white/70 text-xs sm:text-sm leading-snug mb-2 line-clamp-2 group-hover:text-white/90 transition-colors">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-gold-300)] text-xs font-semibold">
                    {category.weddingCount} weddings
                  </span>
                  <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight size={12} className="text-white" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
