import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
      <blockquote className="text-charcoal-700 text-base leading-relaxed flex-1">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>

      {/* Wedding type tag */}
      <div>
        <span className="inline-flex items-center text-xs font-semibold text-[var(--color-brand-primary)] bg-maroon-50 px-3 py-1 rounded-full border border-maroon-100">
          🪔 {testimonial.weddingType}
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
          <div className="font-semibold text-charcoal-900 text-sm">
            {testimonial.name}
          </div>
          <div className="text-xs text-charcoal-400">
            {testimonial.role} · {testimonial.date}
          </div>
        </div>
      </footer>
    </article>
  );
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  return (
    <section
      id="testimonials"
      className="section-padding"
      style={{
        background:
          "linear-gradient(160deg, #fdf2f4 0%, #fdfaf7 60%, #fffbeb 100%)",
      }}
      aria-labelledby="testimonials-heading"
    >
      <div className="container-luxury">
        <SectionHeader
          id="testimonials-heading"
          label="Guest Stories"
          title="What our guests say"
          highlightedWord="guests"
          description="Real experiences from travellers who stepped into a celebration they'll never forget."
          className="mb-14"
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
          className="mt-14 rounded-2xl p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
          style={{
            background: "linear-gradient(135deg, #6b1026 0%, #8b1630 100%)",
          }}
          aria-label="Platform trust statistics"
        >
          {[
            { value: "4.96/5", label: "Average Guest Rating" },
            { value: "98%", label: "Would Recommend" },
            { value: "12,000+", label: "Experiences Delivered" },
            { value: "80+", label: "Countries Represented" },
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
              <div className="text-white/70 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
