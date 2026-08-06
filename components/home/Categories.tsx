import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Crown,
  Sparkles,
  Sparkle,
  Flower2,
  Waves,
  Compass,
  Flame,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Category } from "@/types";

interface CategoriesProps {
  categories: Category[];
}

// Hoisted to module scope so icons aren't rebuilt every render.
const ICON_MAP: Record<string, ReactNode> = {
  Crown: <Crown size={18} strokeWidth={1.75} className="text-white" />,
  Sparkles: <Sparkles size={18} strokeWidth={1.75} className="text-white" />,
  Flower2: <Flower2 size={18} strokeWidth={1.75} className="text-white" />,
  Waves: <Waves size={18} strokeWidth={1.75} className="text-white" />,
  Compass: <Compass size={18} strokeWidth={1.75} className="text-white" />,
  Flame: <Flame size={18} strokeWidth={1.75} className="text-white" />,
};

const FALLBACK_ICON = (
  <Sparkle size={18} strokeWidth={1.75} className="text-white" />
);

export function Categories({ categories }: CategoriesProps) {
  return (
    <>
      <section
        id="categories"
        className="relative section-padding overflow-hidden"
        aria-labelledby="categories-heading"
      >
          {/* Faint dotted lattice texture — a quiet nod to palace jali screenwork */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, var(--color-brand-primary) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden="true"
          />

          {/* One shared arch clip, referenced by every card (jharokha / palace-window silhouette) */}
          <svg width="0" height="0" aria-hidden="true" focusable="false">
            <defs>
              <clipPath id="jharokha-arch" clipPathUnits="objectBoundingBox">
                <path d="M0,1 L0,0.34 C0,0.13 0.22,0 0.5,0 C0.78,0 1,0.13 1,0.34 L1,1 Z" />
              </clipPath>
            </defs>
          </svg>

          <style>{`
            @keyframes categoriesCardIn {
              from { opacity: 0; transform: translateY(28px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .categories-card-reveal {
              opacity: 0;
              animation: categoriesCardIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @media (prefers-reduced-motion: reduce) {
              .categories-card-reveal {
                animation: none;
                opacity: 1;
                transform: none;
              }
            }
          `}</style>

          <div className="container-luxury relative">
            <SectionHeader
              id="categories-heading"
              label="Wedding Styles"
              title="Find your Perfect Celebration"
              highlightedWord="Perfect Celebration"
              description="From royal palaces to golden shores, choose the celebration that speaks to your soul."
              className="mb-14"
              theme="dark"
            />

            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
              role="list"
              aria-label="Wedding categories"
            >
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/weddings?category=${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="categories-card-reveal group relative block rounded-2xl transition-[filter] duration-500 ease-out hover:drop-shadow-[0_18px_32px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold-300)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-warm-50)] motion-reduce:transition-none"
                  role="listitem"
                  aria-label={`${category.name} weddings — ${
                    category.weddingCount > 0
                      ? `${category.weddingCount} celebrations`
                      : "new destination"
                  }`}
                  style={{ animationDelay: `${Math.min(index, 9) * 90}ms` }}
                >
                  <div
                    className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden"
                    style={{
                      clipPath: "url(#jharokha-arch)",
                      WebkitClipPath: "url(#jharokha-arch)",
                    }}
                  >
                    <Image
                      src={category.imageUrl}
                      alt={`${category.name} wedding style`}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110 motion-reduce:transition-none"
                      loading={index < 3 ? "eager" : "lazy"}
                    />

                    {/* Gradient for text legibility */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-maroon-900/90 via-maroon-900/40 to-transparent transition-opacity duration-500 group-hover:opacity-80"
                      aria-hidden="true"
                    />

                    {/* Maroon wash on hover, ties back to the brand color */}
                    <div
                      className="absolute inset-0 bg-[var(--color-brand-primary)]/0 transition-colors duration-500 group-hover:bg-[var(--color-brand-primary)]/20"
                      aria-hidden="true"
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                      <div
                        className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gold-300)] to-[#9c6f19] shadow-lg shadow-black/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none"
                        aria-hidden="true"
                      >
                        {ICON_MAP[category.icon] ?? FALLBACK_ICON}
                      </div>

                      <h3 className="mb-1.5 font-display text-lg font-bold leading-tight text-white sm:text-xl">
                        {category.name}
                      </h3>

                      <span
                        className="mb-2 block h-px w-8 bg-[var(--color-gold-300)] transition-all duration-500 group-hover:w-14"
                        aria-hidden="true"
                      />

                      <p className="mb-3 line-clamp-2 text-xs leading-snug text-white/70 transition-colors group-hover:text-white/90 sm:text-sm">
                        {category.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wide text-[var(--color-gold-300)]">
                          {category.weddingCount > 0
                            ? `${category.weddingCount} celebrations`
                            : "Awaiting celebrations"}
                        </span>
                        <span className="flex h-7 w-7 translate-x-2 items-center justify-center rounded-full border border-white/20 bg-white/10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                          <ArrowRight size={12} className="text-white" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
    </>
  );
}
