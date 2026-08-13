import Image from "next/image";
import { Star, Quote, Sparkles, Heart } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Testimonial } from "@/types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <article
      className="card-luxury flex flex-col gap-5 bg-white p-6 sm:p-8"
      aria-label={`Guest experience from ${testimonial.name}`}
    >
      {/* Decorative quote mark */}
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, var(--color-maroon-50) 0%, var(--color-warm-100) 100%)",
        }}
        aria-hidden="true"
      >
        <Quote
          size={22}
          className="text-[var(--color-brand-primary)]"
        />
      </div>

      {/* Rating */}
      <div
        className="flex items-center gap-1"
        aria-label={`${testimonial.rating} out of 5 stars`}
        role="img"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < testimonial.rating
                ? "fill-[var(--color-brand-secondary)] text-[var(--color-brand-secondary)]"
                : "fill-charcoal-200 text-charcoal-200"
            }
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Guest experience */}
      <blockquote className="flex-1 text-base font-medium italic leading-relaxed text-charcoal-900">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>

      {/* Wedding experience type */}
      {testimonial.weddingType && (
        <div>
          <span className="inline-flex items-center rounded-full border border-maroon-100 bg-maroon-50 px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-primary)]">
            <Sparkles
              size={12}
              className="mr-1.5 text-[var(--color-brand-primary)]"
              aria-hidden="true"
            />
            {testimonial.weddingType}
          </span>
        </div>
      )}

      {/* Guest information */}
      <footer className="flex items-center gap-3 border-t border-warm-100 pt-4">
        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border-2 border-[var(--color-brand-secondary)]/30">
          <Image
            src={testimonial.avatar}
            alt={`${testimonial.name} profile`}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-base font-bold text-charcoal-900">
            {testimonial.name}
          </div>

          <div className="mt-0.5 text-sm font-medium text-charcoal-500">
            {testimonial.role}
            {testimonial.date ? ` · ${testimonial.date}` : ""}
          </div>
        </div>
      </footer>
    </article>
  );
}

export function Testimonials({
  testimonials,
}: TestimonialsProps) {
  return (
    <section
      id="testimonials"
      className="section-padding relative overflow-hidden"
      aria-labelledby="testimonials-heading"
      style={{
        background:
          "linear-gradient(180deg, var(--color-warm-50) 0%, var(--color-warm-100) 50%, var(--color-warm-50) 100%)",
      }}
    >
      {/* Subtle brand glow */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl opacity-[0.06]"
        style={{
          background: "var(--color-brand-primary)",
        }}
        aria-hidden="true"
      />

      <div className="container-luxury relative z-10">
        <SectionHeader
          id="testimonials-heading"
          label="Guest Experiences"
          title="Stories From Indian Weddings"
          highlightedWord="Indian Weddings"
          description="Discover what guests have to say about experiencing Indian wedding traditions, celebrations and hospitality through WeddingWithIndia."
          className="mb-14"
          theme="light"
        />

        {testimonials.length > 0 ? (
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            role="list"
            aria-label="Guest experiences"
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                role="listitem"
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="mx-auto max-w-2xl rounded-2xl border border-warm-200 bg-white p-8 text-center sm:p-10"
            role="status"
          >
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-maroon-50), var(--color-warm-100))",
              }}
              aria-hidden="true"
            >
              <Heart
                size={24}
                className="text-[var(--color-brand-primary)]"
              />
            </div>

            <h3 className="mb-2 text-lg font-bold text-charcoal-900">
              Guest stories are coming soon
            </h3>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-charcoal-500">
              As more international guests experience Indian weddings through
              WeddingWithIndia, their stories and feedback will appear here.
            </p>
          </div>
        )}

        {/* Transparent trust message */}
        <div
          className="mt-14 flex flex-col items-center gap-6 rounded-2xl border border-warm-200 p-8 sm:flex-row"
          style={{
            background:
              "linear-gradient(135deg, white 0%, var(--color-warm-50) 100%)",
          }}
        >
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, var(--color-maroon-50), var(--color-warm-100))",
            }}
            aria-hidden="true"
          >
            <Heart
              size={24}
              className="text-[var(--color-brand-primary)]"
            />
          </div>

          <div className="text-center sm:text-left">
            <p className="mb-1 text-lg font-bold text-charcoal-900">
              Every wedding creates a story
            </p>

            <p className="max-w-xl text-sm leading-relaxed text-charcoal-500">
              WeddingWithIndia connects international guests with Indian
              wedding experiences. Guest feedback helps future visitors
              understand what it is like to take part in these celebrations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}