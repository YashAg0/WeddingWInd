import { Metadata } from "next";
import Link from "next/link";
import { AlertOctagon, ShieldAlert, FileText, CheckCircle2, Clock } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Incident Reporting & Safety Protocol",
  description:
    "How to report safety incidents, misconduct, boundary violations, or urgent concerns during a WeddingWithIndia experience.",
  alternates: {
    canonical: "https://weddingwithindia.com/trust?tab=safety#emergency",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function IncidentReportPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center shadow-sm">
            <AlertOctagon size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Incident Reporting Protocol
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            If you experience or witness an incident, safety concern, or violation of community standards, here is how to get immediate help and file an official report.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Protocol</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Priority Box: Immediate Danger */}
          <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-200 text-red-950 space-y-3">
            <div className="flex items-center gap-2 font-bold text-base text-red-900">
              <ShieldAlert size={20} />
              Immediate Danger or Medical Emergency?
            </div>
            <p className="text-xs sm:text-sm">
              WeddingWithIndia is an online technology intermediary and does not operate emergency dispatch services. If you are in immediate physical danger or need urgent medical attention in India, call local emergency services immediately:
            </p>
            <div className="flex flex-wrap gap-4 pt-1 font-bold text-sm">
              <span className="px-3 py-1.5 bg-white rounded-lg border border-red-200">National Emergency: {LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.NATIONAL_EMERGENCY}</span>
              <span className="px-3 py-1.5 bg-white rounded-lg border border-red-200">Police: {LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.POLICE}</span>
              <span className="px-3 py-1.5 bg-white rounded-lg border border-red-200">Ambulance: {LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.AMBULANCE}</span>
              <span className="px-3 py-1.5 bg-white rounded-lg border border-red-200">Tourist Helpline: {LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.TOURIST_HELPLINE_24X7}</span>
            </div>
          </div>

          {/* Section 1: Step-by-Step Reporting */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <FileText className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. How to File an Incident Report with Our Safety Team
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-warm-50 border border-warm-200">
                <div className="w-7 h-7 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">Online Safety Dashboard (Fastest)</h3>
                  <p className="text-xs text-charcoal-600 mt-1">
                    If you have a registered account, file a formal safety report directly through your dashboard at <Link href="/dashboard/safety/report" className="text-[var(--color-brand-primary)] font-semibold underline">Safety Incident Portal</Link>. You can attach photos, documents, and timestamped details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-warm-50 border border-warm-200">
                <div className="w-7 h-7 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">Email Trust & Safety</h3>
                  <p className="text-xs text-charcoal-600 mt-1">
                    Email our dedicated Trust & Safety cell at <a href={`mailto:${LEGAL_CONFIG.SAFETY_EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold underline">{LEGAL_CONFIG.SAFETY_EMAIL}</a> with your booking reference ID, celebration details, and a clear description of the incident.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-warm-50 border border-warm-200">
                <div className="w-7 h-7 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">Alert Your On-Site Coordinator</h3>
                  <p className="text-xs text-charcoal-600 mt-1">
                    If you are currently on-site at a wedding venue, notify your designated cultural coordinator immediately for discreet, in-person assistance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Investigation & Triage */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <CheckCircle2 className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. What Happens After You Submit a Report
            </h2>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li><strong>Immediate Acknowledgment:</strong> Our team acknowledges safety submissions within 24 hours.</li>
              <li><strong>Impartial Fact-Finding:</strong> We review timeline evidence, coordinator notes, and participant statements.</li>
              <li><strong>Precautionary Measures:</strong> We may suspend listings, freeze pending payouts, or revoke user access while an investigation is underway.</li>
              <li><strong>Resolution:</strong> We communicate the outcome and remedial actions taken, including refund recommendations where appropriate.</li>
            </ul>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Resources</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/guest-safety" className="hover:text-[var(--color-brand-primary)] underline">Guest Safety Guide</Link>
              <Link href="/host-safety" className="hover:text-[var(--color-brand-primary)] underline">Host Safety Guide</Link>
              <Link href="/community-guidelines" className="hover:text-[var(--color-brand-primary)] underline">Community Guidelines</Link>
              <Link href="/complaints" className="hover:text-[var(--color-brand-primary)] underline">Complaints Policy</Link>
              <Link href="/grievance" className="hover:text-[var(--color-brand-primary)] underline">Grievance Redressal</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
