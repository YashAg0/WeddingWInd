import Image from "next/image";
import Link from "next/link";
import {
  Quote,
  Sparkles,
  Heart,
  ShieldCheck,
  Compass,
  ArrowRight,
  Utensils,
  Camera,
  Users,
  Smile,
  BookOpen,
  Info,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Testimonial } from "@/types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article
      className="card-luxury flex flex-col justify-between gap-5 bg-white p-6 sm:p-8 rounded-2xl border border-warm-200/70 shadow-sm"
      aria-label={`Guest experience from ${testimonial.name}`}
    >
      <div className="space-y-4">
        {/* Decorative quote mark */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-maroon-50 text-[var(--color-brand-primary)]"
          aria-hidden="true"
        >
          <Quote size={20} />
        </div>

        {/* Guest experience text */}
        <blockquote className="text-sm sm:text-base font-medium italic leading-relaxed text-charcoal-800">
          &ldquo;{testimonial.content}&rdquo;
        </blockquote>

        {/* Wedding experience type */}
        {testimonial.weddingType && (
          <div>
            <span className="inline-flex items-center rounded-full border border-maroon-100 bg-maroon-50 px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
              <Sparkles size={11} className="mr-1.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
              {testimonial.weddingType}
            </span>
          </div>
        )}
      </div>

      {/* Guest information */}
      <footer className="flex items-center gap-3 border-t border-warm-100 pt-4 mt-2">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-amber-400/40">
          <Image
            src={testimonial.avatar}
            alt={`${testimonial.name} profile`}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-charcoal-900">
            {testimonial.name}
          </div>
          <div className="text-xs font-medium text-charcoal-500">
            {testimonial.role}
            {testimonial.date ? ` · ${testimonial.date}` : ""}
          </div>
        </div>
      </footer>
    </article>
  );
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const verifiedTestimonials = testimonials.filter(
    (t) => t && t.content && t.name
  );

  return (
    <section
      id="testimonials"
      className="section-padding relative overflow-hidden bg-warm-50/60"
      aria-labelledby="testimonials-heading"
    >
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl opacity-[0.05]"
        style={{ background: "var(--color-brand-primary)" }}
        aria-hidden="true"
      />

      <div className="container-luxury relative z-10 space-y-16">
        {/* Section Header */}
        <SectionHeader
          id="testimonials-heading"
          label="The Guest Journey"
          title="How International Guests Experience Indian Weddings"
          highlightedWord="Indian Weddings"
          description="Every celebration is personal. Learn what to expect as an honoured international guest across diverse Indian cultures, faiths, and regions."
          className="max-w-3xl mx-auto text-center"
          theme="light"
        />

        {/* 1. The 6-Step Guest Experience Journey */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-warm-200/70 p-6 rounded-2xl shadow-xs space-y-3 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-200/50">
              01
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
              <Smile size={18} className="text-[var(--color-brand-primary)]" />
              Warm Welcome & Orientation
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed flex-1">
              You are greeted upon arrival with personal orientation and schedule briefing by your dedicated host family coordinator.
            </p>
          </div>

          <div className="bg-white border border-warm-200/70 p-6 rounded-2xl shadow-xs space-y-3 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-200/50">
              02
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
              <Users size={18} className="text-[var(--color-brand-primary)]" />
              Family & Community Introductions
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed flex-1">
              Meet the couple, their families, and fellow guests in an inclusive, hospitable atmosphere where international visitors are honoured.
            </p>
          </div>

          <div className="bg-white border border-warm-200/70 p-6 rounded-2xl shadow-xs space-y-3 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-200/50">
              03
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--color-brand-primary)]" />
              Cultural Guidance & Attire
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed flex-1">
              Receive guidance on ritual meanings, attire recommendations, and ceremony etiquette tailored to the family&apos;s specific tradition.
            </p>
          </div>

          <div className="bg-white border border-warm-200/70 p-6 rounded-2xl shadow-xs space-y-3 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-200/50">
              04
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
              <BookOpen size={18} className="text-[var(--color-brand-primary)]" />
              Ceremony & Ritual Immersion
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed flex-1">
              Witness sacred vows and vibrant festivities firsthand — from intimate blessing ceremonies to high-energy music and celebrations.
            </p>
          </div>

          <div className="bg-white border border-warm-200/70 p-6 rounded-2xl shadow-xs space-y-3 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-200/50">
              05
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
              <Utensils size={18} className="text-[var(--color-brand-primary)]" />
              Authentic Regional Feasting
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed flex-1">
              Enjoy curated culinary feasts showcasing centuries-old regional recipes, traditional sweets, and multi-course celebratory banquets.
            </p>
          </div>

          <div className="bg-white border border-warm-200/70 p-6 rounded-2xl shadow-xs space-y-3 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm border border-amber-200/50">
              06
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
              <Heart size={18} className="text-[var(--color-brand-primary)]" />
              Lifelong Connection & Memories
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed flex-1">
              Depart with meaningful friendships, shared celebratory moments, and an authentic appreciation for Indian hospitality.
            </p>
          </div>
        </div>

        {/* 2. Cultural Respect & Guest Safety Guidelines */}
        <div className="bg-white border border-warm-200/70 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-warm-100">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-wider">
                <ShieldCheck size={14} className="text-emerald-600" />
                Cultural Harmony & Guest Code
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
                Ethical, Respectful Guest Immersion
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl leading-relaxed">
              Traditions belong to the host family and their community. We ensure clear expectations so hosts feel honoured and guests feel fully supported.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-warm-100 text-charcoal-700 flex-shrink-0">
                <Camera size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-charcoal-900">Thoughtful Photography</h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Always respect private family moments and sacred rituals. Follow your host coordinator&apos;s photo and video guidance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-warm-100 text-charcoal-700 flex-shrink-0">
                <Compass size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-charcoal-900">Cultural Neutrality</h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Indian weddings vary widely across Hindu, Sikh, Muslim, Christian, Jain, Buddhist, and regional customs. Each celebration is unique.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-warm-100 text-charcoal-700 flex-shrink-0">
                <Info size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-charcoal-900">Dedicated Support</h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  From booking confirmation to event conclusion, our platform team and host coordinators are available to answer every query.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Verified Guest Reviews / Truthful Review System */}
        {verifiedTestimonials.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="font-display font-bold text-2xl text-charcoal-900">
                Verified Guest Experiences
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Direct feedback from international travellers who attended verified wedding celebrations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
              {verifiedTestimonials.map((testimonial) => (
                <div key={testimonial.id} role="listitem">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Honest Pre-Launch / Verified Review Pipeline Notice */
          <div className="rounded-3xl border border-warm-200/70 bg-gradient-to-br from-white to-warm-50/80 p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-xs space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/50 mx-auto">
              <Sparkles size={20} />
            </div>

            <h3 className="font-display font-bold text-xl text-charcoal-900">
              Verified Guest Review Guarantee
            </h3>

            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-lg mx-auto">
              We never publish fabricated testimonials or artificial ratings. Reviews on WeddingWithIndia are submitted exclusively by verified international guests following the successful completion of their celebration pass.
            </p>

            <div className="pt-2">
              <Link
                href="/weddings"
                className="btn btn-primary btn-md inline-flex items-center gap-2 font-bold shadow-xs"
              >
                Explore Upcoming Celebrations
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}