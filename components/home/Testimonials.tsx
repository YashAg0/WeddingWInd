import Image from "next/image";
import { Star, Quote, Sparkles, Heart } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Testimonial } from "@/types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article
      className="card-luxury p-6 sm:p-8 flex flex-col gap-5 bg-white"
      aria-label={`Testimonial from ${testimonial.name}`}
    >
      {/* Large decorative quote mark */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, var(--color-maroon-50) 0%, var(--color-warm-100) 100%)",
        }}
        aria-hidden="true"
      >
        <Quote
          size={22}
          className="text-[var(--color-brand-primary)]"
        />
      </div>

      {/* Stars */}
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
                ? "text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]"
                : "text-charcoal-200 fill-charcoal-200"
            }
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-charcoal-900 text-base font-medium leading-relaxed flex-1 italic">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>

      {/* Wedding type tag */}
      <div>
        <span className="inline-flex items-center text-xs font-semibold text-[var(--color-brand-primary)] bg-maroon-50 px-3 py-1.5 rounded-full border border-maroon-100">
          <Sparkles size={12} className="mr-1.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
          {testimonial.weddingType}
        </span>
      </div>

      {/* Author */}
      <footer className="flex items-center gap-3 pt-4 border-t border-warm-100">
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
          <div className="text-sm font-medium text-charcoal-500 mt-0.5">
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
        className="section-padding relative overflow-hidden"
        aria-labelledby="testimonials-heading"
        style={{
          background: "linear-gradient(180deg, var(--color-warm-50) 0%, var(--color-warm-100) 50%, var(--color-warm-50) 100%)",
        }}
      >
        {/* Subtle brand glow */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-[0.06]"
          style={{ background: "var(--color-brand-primary)" }}
          aria-hidden="true"
        />

        <div className="container-luxury relative z-10">
          <SectionHeader
            id="testimonials-heading"
            label="Guest Stories"
            title="Voices from Our Celebrations"
            highlightedWord="Celebrations"
            description="Real experiences from travellers who stepped into an Indian family celebration they'll never forget."
            className="mb-14"
            theme="light"
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

          {/* Pre-launch trust editorial note — honest and premium-feeling */}
          <div
            className="mt-14 rounded-2xl border border-warm-200 p-8 flex flex-col sm:flex-row items-center gap-6"
            style={{
              background: "linear-gradient(135deg, white 0%, var(--color-warm-50) 100%)",
            }}
          >
            <div
              className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--color-maroon-50), var(--color-warm-100))" }}
              aria-hidden="true"
            >
              <Heart size={24} className="text-[var(--color-brand-primary)]" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-charcoal-900 text-lg mb-1">
                Be among the first to experience this
              </p>
              <p className="text-charcoal-500 text-sm leading-relaxed max-w-xl">
                WeddingWithIndia is now welcoming its founding guests. Every review and story
                shared here comes from a real celebration. Yours could be next.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
