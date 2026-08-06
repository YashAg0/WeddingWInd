import { Metadata } from "next";
import { ShieldAlert, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy | Wedding With India",
  description: "Official Refund & Escrow Protection Policy for Wedding With India travelers and hosts.",
};

export default function RefundPolicyPage() {
  return (
    <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20 rounded-[2.5rem]">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <ShieldAlert size={22} />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Refund & Escrow Guarantee Policy
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} />
            <span>Last Updated: August 2026</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Escrow Protection Mechanism
            </h2>
            <p>
              All guest booking funds are held securely in Stripe Escrow until 24 hours after the conclusion of the scheduled wedding event. Funds are released to the host family only after verifying event attendance and gate check-in validity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Full Refund Eligibility
            </h2>
            <p>
              Travelers are eligible for a 100% full refund under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Host cancels or postpones the wedding event at least 48 hours prior.</li>
              <li>Host rejects guest verification or booking application prior to gate pass issuance.</li>
              <li>Traveler cancels booking 14 days or more before the event start date.</li>
              <li>Visa rejection (with official proof submitted to Concierge 7 days prior).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Partial Refund Schedule
            </h2>
            <p>
              Cancellations initiated by the traveler between 7 and 13 days prior to the event are subject to a 50% refund to offset host family catering and venue reservation commitments.
            </p>
          </section>
        </div>
      </div>
    </div>
  
    </div>);
}
