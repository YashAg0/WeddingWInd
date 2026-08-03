import { Search, CalendarCheck, Plane, Sparkles, Lock, ShieldCheck, Shield, PhoneCall, Award } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { HowItWorksStep } from "@/types";

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

const STEP_ICONS: Record<number, React.ReactNode> = {
  1: <Search size={24} aria-hidden="true" />,
  2: <CalendarCheck size={24} aria-hidden="true" />,
  3: <Plane size={24} aria-hidden="true" />,
  4: <Sparkles size={24} aria-hidden="true" />,
};

const TRUST_ICONS: Record<string, React.ReactNode> = {
  "Secure Payments": <Lock size={18} aria-hidden="true" />,
  "Verified Hosts": <ShieldCheck size={18} aria-hidden="true" />,
  "Guest Protection": <Shield size={18} aria-hidden="true" />,
  "24/7 Support": <PhoneCall size={18} aria-hidden="true" />,
  "Satisfaction Guarantee": <Award size={18} aria-hidden="true" />,
};

export function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <section
      id="how-it-works"
      className="section-padding"
      style={{
        background:
          "linear-gradient(160deg, #fdfaf7 0%, #faf5ef 50%, #fdf2f4 100%)",
      }}
      aria-labelledby="how-it-works-heading"
    >
      <div className="container-luxury">
        <SectionHeader
          id="how-it-works-heading"
          label="How It Works"
          title="Your journey to an authentic Indian wedding"
          highlightedWord="authentic Indian wedding"
          description="From discovery to celebration — we handle every detail so you can simply be present."
          className="mb-16"
        />

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #c9972a 20%, #c9972a 80%, transparent)",
            }}
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative flex flex-col items-center text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step number + icon */}
              <div className="relative mb-6 z-10">
                {/* Background glow */}
                <div
                  className="absolute inset-0 rounded-full blur-lg opacity-30"
                  style={{
                    background: "var(--gradient-gold)",
                    transform: "scale(1.3)",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center text-[var(--color-brand-primary)] shadow-[0_8px_32px_0_rgba(201,151,42,0.25)] border-2 border-[var(--color-gold-200)]"
                  style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" }}
                >
                  {STEP_ICONS[step.step] || <span className="font-display font-bold text-xl">{step.step}</span>}
                </div>
                {/* Step number badge */}
                <span
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{ background: "var(--color-brand-primary)" }}
                  aria-hidden="true"
                >
                  {step.step}
                </span>
              </div>

              <h3 className="font-display font-bold text-xl text-charcoal-900 mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-charcoal-500 leading-relaxed max-w-[220px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            "Secure Payments",
            "Verified Hosts",
            "Guest Protection",
            "24/7 Support",
            "Satisfaction Guarantee",
          ].map((label) => (
            <div
              key={label}
              className="flex items-center gap-2 text-charcoal-600 text-sm font-medium"
            >
              <span className="text-[var(--color-brand-secondary)]">{TRUST_ICONS[label]}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
