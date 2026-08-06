import { Metadata } from "next";
import { Scale, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "DPDP Act Compliance (India) | Wedding With India",
  description: "Digital Personal Data Protection (DPDP) Act 2023 compliance statement for Indian hosts and users.",
};

export default function DPDPPage() {
  return (
    <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20 rounded-[2.5rem]">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Scale size={22} />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            DPDP Act (India) Compliance
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} />
            <span>Last Updated: August 2026</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Digital Personal Data Protection Compliance
            </h2>
            <p>
              In accordance with India&apos;s Digital Personal Data Protection (DPDP) Act 2023, Wedding With India operates as a Data Fiduciary. Personal data (such as PAN, Aadhaar, and identity scans) is processed strictly with explicit consent for identity verification and host payout processing.
            </p>
          </section>
        </div>
      </div>
    </div>
  
    </div>);
}
