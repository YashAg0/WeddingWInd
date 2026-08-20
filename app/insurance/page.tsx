import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, HeartPulse, AlertCircle, FileCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Travel & Medical Insurance Guidance",
  description:
    "Important advice on obtaining comprehensive international travel, medical, baggage, and trip cancellation insurance for Indian wedding journeys.",
  alternates: {
    canonical: "https://weddingwithindia.com/insurance",
  },
};

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Travel & Medical Insurance
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Protect your journey with comprehensive travel, medical, and trip protection insurance before traveling to India.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Important Regulatory Disclaimer */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 text-xs sm:text-sm">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertCircle size={17} /> Important Notice: No Insurance Provided by Platform
            </p>
            <p>
              WeddingWithIndia is an online technology marketplace. We are <strong>not</strong> an insurance company, broker, or agent. WeddingWithIndia does not provide, underwrite, or sell travel, medical, or property insurance. All travelers are strongly advised to purchase comprehensive independent travel and health insurance from a licensed insurer in their home country.
            </p>
          </div>

          {/* Section 1: Recommended Coverages */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <HeartPulse className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Recommended Coverage Checklist
            </h2>
            <p>
              When selecting an international travel insurance policy for your trip to India, ensure your plan includes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 mb-1">Emergency Medical & Hospitalization</h3>
                <p className="text-charcoal-600 text-xs">
                  Covers unexpected illness, accidental injury, emergency doctor visits, prescription medicine, and hospital stays in India.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 mb-1">Emergency Medical Evacuation</h3>
                <p className="text-charcoal-600 text-xs">
                  Covers medical repatriation to your home country or specialized regional trauma centers in case of severe illness.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 mb-1">Trip Cancellation & Interruption</h3>
                <p className="text-charcoal-600 text-xs">
                  Reimburses non-refundable flight, hotel, and experience expenses if you must cancel travel due to illness, injury, or family emergency.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 mb-1">Baggage & Personal Belongings</h3>
                <p className="text-charcoal-600 text-xs">
                  Protects against lost, stolen, or delayed luggage, cameras, mobile devices, and traditional wedding clothing.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: When to Purchase */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <FileCheck className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. When to Purchase Your Policy
            </h2>
            <p>
              We strongly recommend purchasing your travel insurance policy immediately upon confirming your wedding reservation and booking international flights. Many insurance providers offer coverage for pre-existing medical conditions or &ldquo;Cancel for Any Reason&rdquo; (CFAR) benefits only if the policy is purchased within 10 to 14 days of your initial trip payment.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Travel Policies</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/travel-visa" className="hover:text-[var(--color-brand-primary)] underline">Visa Information</Link>
              <Link href="/cancellation-policy" className="hover:text-[var(--color-brand-primary)] underline">Cancellation Policy</Link>
              <Link href="/guest-safety" className="hover:text-[var(--color-brand-primary)] underline">Guest Safety Guide</Link>
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
