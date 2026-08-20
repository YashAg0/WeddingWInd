import Link from "next/link";
import { ArrowRight, Quote, Star, Sparkles, Heart } from "lucide-react";
import type { Testimonial } from "@/types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const validTestimonials = testimonials.filter(
    (t) => t && t.content && t.name
  );

  return (
    <section
      id="guest-stories"
      className="section-padding relative overflow-hidden bg-warm-50/60 border-t border-warm-200/50"
      aria-labelledby="guest-stories-heading"
    >
      <div className="container-luxury relative z-10 space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="section-label mb-1" aria-hidden="true">
            GUEST STORIES
          </div>

          <h2
            id="guest-stories-heading"
            className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-charcoal-900 leading-tight"
          >
            They Came for the Wedding.{" "}
            <span className="text-gradient-brand">
              They Left with a Story.
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-charcoal-600">
            Hear what guests shared about their experience.
          </p>
        </div>

        {/* Testimonials */}
        {validTestimonials.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            role="list"
          >
            {validTestimonials.map((testimonial) => {
              const rating = Math.min(
                5,
                Math.max(0, testimonial.rating || 5)
              );

              return (
                <div
                  key={testimonial.id}
                  role="listitem"
                  className="bg-white p-6 rounded-2xl border border-warm-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <div>
                    {/* Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="flex items-center gap-1 text-amber-500"
                        aria-label={`Rating: ${rating} out of 5 stars`}
                      >
                        {[...Array(rating)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            className="fill-amber-400 text-amber-400"
                            aria-hidden="true"
                          />
                        ))}
                      </div>

                      <Quote
                        size={18}
                        className="text-amber-500/40"
                        aria-hidden="true"
                      />
                    </div>

                    <p className="text-xs sm:text-sm italic text-charcoal-700 leading-relaxed mb-4">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </div>

                  {/* Guest */}
                  <div className="pt-3 border-t border-warm-100 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-charcoal-900">
                        {testimonial.name}
                      </div>

                      {testimonial.location && (
                        <div className="text-[0.6875rem] text-charcoal-500">
                          {testimonial.location}
                        </div>
                      )}
                    </div>

                    {testimonial.weddingType && (
                      <span className="text-[0.625rem] font-semibold text-[var(--color-brand-primary)] bg-maroon-50 px-2 py-0.5 rounded-md max-w-[140px] truncate">
                        {testimonial.weddingType}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-warm-200/80 bg-white p-6 sm:p-8 text-center max-w-3xl mx-auto shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 text-left">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex-shrink-0">
                <Sparkles size={22} aria-hidden="true" />
              </span>

              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-charcoal-900">
                  Guest stories are coming soon
                </h3>

                <p className="text-xs sm:text-sm text-charcoal-600 max-w-lg mt-0.5 leading-relaxed">
                  We only want to share genuine guest experiences, so we won&apos;t
                  fill this space with made-up reviews.
                </p>
              </div>
            </div>

            <Link
              href="/weddings"
              className="btn btn-primary text-xs font-bold py-2.5 px-5 rounded-xl inline-flex items-center gap-1.5 shadow-xs flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <span>Explore Weddings</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* Trust Banner */}
        <div className="rounded-2xl border border-warm-200/80 bg-white p-5 sm:p-6 text-center max-w-3xl mx-auto shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-200/50 flex-shrink-0">
              <Heart size={18} aria-hidden="true" />
            </span>

            <div>
              <h4 className="font-display font-bold text-sm text-charcoal-900">
                Your comfort comes first
              </h4>

              <p className="text-xs text-charcoal-600 mt-0.5">
                Clear information, respectful hosting, and support throughout
                your experience.
              </p>
            </div>
          </div>

          <Link
            href="/safety"
            className="btn btn-outline text-xs font-bold py-2 px-4 rounded-lg inline-flex items-center gap-1 flex-shrink-0"
          >
            <span>Safety &amp; Guest Guide</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
