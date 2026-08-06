import Image from "next/image";
import { Star, Quote, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";
import type { Testimonial } from "@/types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article
      className="card-luxury p-6 sm:p-8 flex flex-col gap-5"
      aria-label={`Testimonial from ${testimonial.name}`}
    >
      {/* Quote icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #fdf2f4 0%, #fbe6ea 100%)" }}
        aria-hidden="true"
      >
        <Quote
          size={18}
          className="text-[var(--color-brand-primary)]"
        />
      </div>

      {/* Stars */}
      <div
        className="flex items-center gap-0.5"
        aria-label={`${testimonial.rating} out of 5 stars`}
        role="img"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < testimonial.rating
                ? "text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]"
                : "text-charcoal-200 fill-charcoal-200"
            }
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-charcoal-900 text-base font-medium leading-relaxed flex-1">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>

      {/* Wedding type tag */}
      <div>
        <span className="inline-flex items-center text-xs font-semibold text-[var(--color-brand-primary)] bg-maroon-50 px-3 py-1 rounded-full border border-maroon-100">
          <Sparkles size={12} className="mr-1.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
          {testimonial.weddingType}
        </span>
      </div>

      {/* Author */}
      <footer className="flex items-center gap-3 pt-2 border-t border-warm-100">
        <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--color-brand-secondary)]/30">
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
        <div>
          <div className="font-bold text-charcoal-900 text-base">
            {testimonial.name}
          </div>
          <div className="text-sm font-medium text-charcoal-600 mt-0.5">
            {testimonial.role} · {testimonial.date}
          </div>
        </div>
      </footer>
    </article>
  );
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <>
      <section
        id="testimonials"
        className="section-padding"
        aria-labelledby="testimonials-heading"
      >
      <div className="container-luxury">
        <SectionHeader
          id="testimonials-heading"
          label="Guest Stories"
          title="What Our Guests Say"
          highlightedWord="Guests"
          description="Real experiences from travellers who stepped into a celebration they'll never forget."
          className="mb-14"
          theme="dark"
        />

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          role="list"
          aria-label="Guest testimonials"
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} role="listitem">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>

        {/* Trust stats bar */}
        <div
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
          aria-label="Platform trust statistics"
        >
          {[
            { value: BUSINESS_METRICS.AVERAGE_RATING_LABEL, label: "Average Guest Rating" },
            { value: `${BUSINESS_METRICS.WOULD_RECOMMEND_PERCENT}%`, label: "Would Recommend" },
            { value: BUSINESS_METRICS.GUESTS_ATTENDED, label: "Experiences Delivered" },
            { value: BUSINESS_METRICS.COUNTRIES_REPRESENTED, label: "Countries Represented" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div
                className="font-display font-bold text-2xl sm:text-3xl mb-1"
                style={{
                  background: "linear-gradient(135deg, #fcd34d, #c9972a)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {value}
              </div>
              <div className="text-white/90 text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
      </section>
    </>
  );
}
