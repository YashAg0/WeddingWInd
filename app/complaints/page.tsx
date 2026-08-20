import { Metadata } from "next";
import Link from "next/link";
import { MessageSquareWarning, RefreshCw, Scale, CheckCircle2, Clock } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Complaints & Dispute Resolution Policy",
  description:
    "Procedures for resolving traveler and host complaints, booking disputes, refund inquiries, and service quality issues on WeddingWithIndia.",
  alternates: {
    canonical: "https://weddingwithindia.com/complaints",
  },
};

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <MessageSquareWarning size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Complaints & Dispute Resolution
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Our structured, fair process for handling booking disagreements, refund inquiries, service complaints, and platform escalations.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Objective */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Scale className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Our Commitment to Fair Resolution
            </h2>
            <p>
              We strive to make every cultural experience enriching and memorable. When expectations are not met or disputes arise regarding celebration details, payments, cancellations, or conduct, we provide a transparent, step-by-step resolution process designed to reach fair outcomes promptly.
            </p>
          </section>

          {/* Section 2: 3-Tier Resolution Process */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <RefreshCw className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. The 3-Tier Dispute Resolution Process
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 text-sm">Tier 1: On-Site / Direct Mediation (During Experience)</h3>
                <p className="text-xs text-charcoal-600 mt-1">
                  For logistical hiccups, dietary misunderstandings, or seating adjustments during an ongoing celebration, your on-site coordinator serves as the immediate liaison between the traveler and host family.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 text-sm">Tier 2: Customer Support & Booking Review (Post-Experience)</h3>
                <p className="text-xs text-charcoal-600 mt-1">
                  If an issue could not be resolved on-site or concerns financial/refund eligibility, submit a written ticket within 7 business days following the event to <a href={`mailto:${LEGAL_CONFIG.PRIMARY_SUPPORT_EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold">{LEGAL_CONFIG.PRIMARY_SUPPORT_EMAIL}</a>. We review coordinator reports, host records, and traveler submissions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h3 className="font-semibold text-charcoal-900 text-sm">Tier 3: Formal Statutory Grievance Redressal</h3>
                <p className="text-xs text-charcoal-600 mt-1">
                  If you are dissatisfied with the Tier 2 outcome or have a regulatory complaint under Indian Consumer Protection or IT rules, you may escalate directly to our designated <Link href="/grievance" className="text-[var(--color-brand-primary)] font-semibold underline">Grievance Officer</Link>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Timelines */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <CheckCircle2 className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Handling Timelines
            </h2>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li><strong>Initial Acknowledgment:</strong> Within 24 to 48 hours of receipt.</li>
              <li><strong>Investigation & Fact-Finding:</strong> Typically completed within 5 to 7 business days.</li>
              <li><strong>Final Determination:</strong> Within 15 calendar days from submission.</li>
            </ul>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Dispute Policies</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/grievance" className="hover:text-[var(--color-brand-primary)] underline">Grievance Officer Contact</Link>
              <Link href="/refund-policy" className="hover:text-[var(--color-brand-primary)] underline">Refund Policy</Link>
              <Link href="/cancellation-policy" className="hover:text-[var(--color-brand-primary)] underline">Cancellation Policy</Link>
              <Link href="/incident-report" className="hover:text-[var(--color-brand-primary)] underline">Incident Reporting</Link>
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
