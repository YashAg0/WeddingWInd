import Image from "next/image";
import Link from "next/link";
import {
  Search,
  CalendarHeart,
  PlaneTakeoff,
  HeartHandshake,
  PartyPopper,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface HowItWorksStepData {
  step: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  imageUrl: string;
}

const FLOW_STEPS: HowItWorksStepData[] = [
  {
    step: "01",
    title: "Discover",
    tagline: "Find your celebration",
    description:
      "Explore weddings by destination, traditions, dates, and celebration style.",
    icon: (
      <Search
        size={18}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    imageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  },
  {
    step: "02",
    title: "Reserve",
    tagline: "Know what to expect",
    description:
      "See the experience, pricing, inclusions, and key details before you book.",
    icon: (
      <CalendarHeart
        size={18}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    imageUrl:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80",
  },
  {
    step: "03",
    title: "Arrive",
    tagline: "Feel ready for India",
    description:
      "Get your schedule, cultural guidance, attire tips, and coordination details.",
    icon: (
      <PlaneTakeoff
        size={18}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    imageUrl:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
  },
  {
    step: "04",
    title: "Experience",
    tagline: "Join at your own pace",
    description:
      "Discover beautiful traditions and join in only where you feel comfortable.",
    icon: (
      <HeartHandshake
        size={18}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    imageUrl:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80",
  },
  {
    step: "05",
    title: "Celebrate",
    tagline: "Share the happiness",
    description:
      "Enjoy the music, food, traditions, and joyful moments included in your experience.",
    icon: (
      <PartyPopper
        size={18}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    imageUrl:
      "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    step: "06",
    title: "Remember",
    tagline: "Take memories home",
    description:
      "Leave with new perspectives, meaningful moments, and memories of India.",
    icon: (
      <Sparkles
        size={18}
        className="text-[var(--color-brand-primary)]"
        aria-hidden="true"
      />
    ),
    imageUrl:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section-padding relative overflow-hidden bg-warm-50/60 border-t border-warm-200/50"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container-luxury relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="section-label mb-2" aria-hidden="true">
              THE GUEST JOURNEY
            </div>

            <h2
              id="how-it-works-heading"
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-charcoal-900 tracking-tight leading-tight"
            >
              From First Look to{" "}
              <span className="text-gradient-brand">
                Lasting Memories
              </span>
            </h2>

            <p className="text-sm sm:text-base text-charcoal-600 mt-2 max-w-xl leading-relaxed">
              Everything you need to experience an Indian wedding with
              confidence, respect, and peace of mind.
            </p>
          </div>

          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--color-brand-primary)] hover:text-maroon-700 transition-colors group flex-shrink-0 self-start sm:self-end"
          >
            <span>Guest Guide</span>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* DESKTOP & TABLET FLOWCHART */}
        <div className="hidden sm:block relative">
          <div
            className="absolute top-[2.75rem] left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-amber-300 via-maroon-400 to-amber-300 hidden lg:block z-0 opacity-40"
            aria-hidden="true"
          />

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-4 lg:gap-3.5 relative z-10"
            role="list"
            aria-label="6-step guest journey"
          >
            {FLOW_STEPS.map((step) => (
              <div
                key={step.step}
                className="group relative flex flex-col bg-white border border-warm-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-lg hover:border-amber-400/80 transition-all duration-300 transform hover:-translate-y-1"
                role="listitem"
              >
                {/* Step Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warm-100/80 text-charcoal-900 text-xs font-extrabold border border-warm-200 group-hover:bg-maroon-50 group-hover:text-[var(--color-brand-primary)] group-hover:border-maroon-200 transition-colors">
                    {step.step}
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
                    {step.icon}
                  </span>
                </div>

                {/* Step Image */}
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-warm-100 mb-3">
                  <Image
                    src={step.imageUrl}
                    alt={`${step.title} step in the WeddingWithIndia guest journey`}
                    fill
                    sizes="(max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <span className="absolute bottom-1.5 left-2 text-[0.625rem] font-bold text-white tracking-wide uppercase">
                    Step {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display font-bold text-base text-charcoal-900 leading-snug mb-1">
                  {step.title}
                </h3>

                <div className="text-[0.6875rem] font-semibold text-[var(--color-brand-primary)] mb-1.5 leading-tight">
                  {step.tagline}
                </div>

                <p className="text-[0.6875rem] text-charcoal-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE VERTICAL TIMELINE */}
        <div
          className="sm:hidden relative pl-6 space-y-4"
          role="list"
          aria-label="Guest journey timeline"
        >
          <div
            className="absolute left-2.5 top-3 bottom-3 w-[2px] bg-gradient-to-b from-amber-400 via-maroon-500 to-amber-400"
            aria-hidden="true"
          />

          {FLOW_STEPS.map((step) => (
            <div
              key={step.step}
              className="relative flex items-start gap-3 bg-white border border-warm-200 rounded-2xl p-4 shadow-xs"
              role="listitem"
            >
              <span
                className="absolute -left-6 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-[var(--color-brand-primary)] shadow-xs"
                aria-hidden="true"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-primary)]" />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[0.6875rem] font-extrabold text-[var(--color-brand-primary)] bg-maroon-50 px-2 py-0.5 rounded-md border border-maroon-100 flex-shrink-0">
                      STEP {step.step}
                    </span>

                    <h3 className="font-display font-bold text-sm text-charcoal-900 truncate">
                      {step.title}
                    </h3>
                  </div>

                  <span className="p-1 rounded-md bg-amber-50 text-amber-700 flex-shrink-0">
                    {step.icon}
                  </span>
                </div>

                <div className="text-[0.6875rem] font-medium text-charcoal-500 mb-1">
                  {step.tagline}
                </div>

                <p className="text-xs text-charcoal-700 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Strip */}
        <div className="mt-8 sm:mt-10 rounded-2xl border border-warm-200/80 bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex-shrink-0">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>

            <div>
              <div className="font-display font-bold text-sm text-charcoal-900">
                Clear details. Genuine hospitality.
              </div>

              <p className="text-xs text-charcoal-600 mt-0.5 leading-relaxed">
                Know what to expect before you reserve, and enjoy the
                celebration at your own pace.
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
      </div>
    </section>
  );
}