import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Category } from "@/types";

interface CategoriesProps {
  categories: Category[];
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
              className="card group relative overflow-hidden aspect-[4/5] sm:aspect-[3/4]"
              role="listitem"
              aria-label={`${category.name} weddings — ${category.weddingCount} listings`}
            >
              {/* Image */}
              <Image
                src={category.imageUrl}
                alt={`${category.name} wedding style`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                loading={index < 2 ? "eager" : "lazy"}
              />

              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90"
                aria-hidden="true"
              />

              {/* Maroon hover tint */}
              <div
                className="absolute inset-0 bg-[var(--color-brand-primary)]/0 group-hover:bg-[var(--color-brand-primary)]/15 transition-all duration-500"
                aria-hidden="true"
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl mb-3 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {category.icon}
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
