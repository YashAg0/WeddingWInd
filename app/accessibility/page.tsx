import { Metadata } from "next";
import Link from "next/link";
import { Eye, Monitor, Keyboard, CheckCircle2, Mail, Clock } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description:
    "Our commitment to digital accessibility, inclusive design standards, WCAG 2.1 Level AA conformance, and accessibility feedback channels for WeddingWithIndia.",
  alternates: {
    canonical: "https://weddingwithindia.com/accessibility",
  },
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Eye size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Accessibility Statement
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            We are committed to ensuring digital accessibility for people of all abilities, adhering to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Accessibility Standards */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <CheckCircle2 className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Our Accessibility Commitment
            </h2>
            <p>
              WeddingWithIndia believes that cultural travel should be accessible, inclusive, and welcoming to everyone. We continually enhance our digital experience by applying relevant accessibility standards across our public catalog, reservation flows, and dashboards.
            </p>
          </section>

          {/* Section 2: Technical Measures Implemented */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Monitor className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Technical Measures & Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 mb-1 flex items-center gap-1.5">
                  <Keyboard size={16} /> Keyboard Navigation
                </h3>
                <p className="text-charcoal-600 text-xs">
                  All interactive elements, forms, search dropdowns, and modal dialogs are fully navigable using standard keyboard inputs (Tab, Shift+Tab, Enter, Escape).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 mb-1 flex items-center gap-1.5">
                  <Eye size={16} /> Contrast & Typography
                </h3>
                <p className="text-charcoal-600 text-xs">
                  High-contrast color palettes meeting WCAG AA ratios (minimum 4.5:1 for body text) with scalable fonts and clear visual hierarchies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 mb-1">Reduced Motion Respect</h3>
                <p className="text-charcoal-600 text-xs">
                  Our interfaces respect the <code>prefers-reduced-motion</code> browser setting, automatically disabling continuous background animations and transitions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 mb-1">Screen Reader Compatibility</h3>
                <p className="text-charcoal-600 text-xs">
                  Semantic HTML tags, descriptive <code>alt</code> text on wedding photographs, and ARIA labels on custom interactive components.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Physical Accessibility at Weddings */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <CheckCircle2 className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Physical Venue Accessibility Information
            </h2>
            <p>
              Because Indian weddings take place across diverse historic venues, heritage palaces, temples, and private estates, physical accessibility features (wheelchair ramps, elevators, ground-floor seating) vary by listing. We encourage travelers to review the accessibility notes on each wedding listing or reach out to our concierge before reserving.
            </p>
          </section>

          {/* Section 4: Feedback */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Mail className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Accessibility Feedback & Assistance
            </h2>
            <p>
              If you encounter an accessibility barrier or need assistance completing a reservation, please contact our Accessibility Coordinator at <a href={`mailto:${LEGAL_CONFIG.PRIMARY_SUPPORT_EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold">{LEGAL_CONFIG.PRIMARY_SUPPORT_EMAIL}</a>. We respond to accessibility inquiries within 2 business days.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Pages</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
              <Link href="/contact" className="hover:text-[var(--color-brand-primary)] underline">Contact Support</Link>
              <Link href="/guest-safety" className="hover:text-[var(--color-brand-primary)] underline">Guest Safety Guide</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
