import { Metadata } from "next";
import { ShieldCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Safety & Security Standards | Wedding With India",
  description: "Our comprehensive trust, identity verification, and ground liaison safety protocols.",
};

export default function SafetyPolicyPage() {
  return (
    <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20 rounded-[2.5rem]">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Safety & Security Architecture
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} />
            <span>Last Updated: August 2026</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Multi-Role Identity Vetting
            </h2>
            <p>
              Every participant on Wedding With India undergoes strict identity verification:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Global Guests:</strong> Biometric Passport, Government Photo ID, and Live Selfie comparison.</li>
              <li><strong>Hosts:</strong> PAN Card, Aadhaar Card, Venue Booking Proof, and Phone Verification.</li>
              <li><strong>Ground Coordinators:</strong> Background check, Identity verification, and Emergency Training.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. On-Ground Support & SOS Dispatch
            </h2>
            <p>
              Every verified booking includes a dedicated cultural liaison and access to 24/7 Concierge Emergency SOS Hotline. In case of any incident, ground coordinators are dispatched immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  
    </div>);
}
