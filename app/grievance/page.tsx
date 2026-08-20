import { Metadata } from "next";
import Link from "next/link";
import { Scale, Clock, ShieldCheck, FileText } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Grievance Redressal Mechanism",
  description:
    "Statutory Grievance Redressal mechanism, Grievance Officer contact details, and compliance disclosures under the Information Technology Rules, 2021 and Consumer Protection (E-Commerce) Rules, 2020.",
  alternates: {
    canonical: "https://weddingwithindia.com/grievance",
  },
};

export default function GrievancePage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Scale size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Grievance Redressal Mechanism
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Statutory disclosures and contact details for the designated Grievance Officer in accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the Consumer Protection (E-Commerce) Rules, 2020.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Statutory Disclosure: 2026</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Designated Grievance Officer */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Designated Grievance Officer Details
            </h2>
            <p>
              In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Rule 4(4) of the Consumer Protection (E-Commerce) Rules, 2020, the contact details of the designated Grievance Officer are set forth below:
            </p>

            <div className="p-6 rounded-2xl bg-warm-50 border border-warm-200/80 space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-charcoal-400 text-xs font-semibold uppercase tracking-wider block">Designated Officer</span>
                  <span className="font-bold text-charcoal-900 text-base">{LEGAL_CONFIG.GRIEVANCE_OFFICER.NAME}</span>
                  <span className="text-xs text-charcoal-500 block">{LEGAL_CONFIG.GRIEVANCE_OFFICER.DEPARTMENT}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 text-xs font-semibold uppercase tracking-wider block">Platform & Entity</span>
                  <span className="font-bold text-charcoal-900 text-base">{LEGAL_CONFIG.GRIEVANCE_OFFICER.ORGANIZATION}</span>
                  <span className="text-xs text-charcoal-500 block">{LEGAL_CONFIG.PLATFORM_ROLE}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-warm-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-charcoal-400 text-xs font-semibold uppercase tracking-wider block">Email Address</span>
                  <a href={`mailto:${LEGAL_CONFIG.GRIEVANCE_OFFICER.EMAIL}`} className="font-semibold text-[var(--color-brand-primary)] underline text-sm">
                    {LEGAL_CONFIG.GRIEVANCE_OFFICER.EMAIL}
                  </a>
                </div>
                <div>
                  <span className="text-charcoal-400 text-xs font-semibold uppercase tracking-wider block">Physical Address</span>
                  <span className="text-charcoal-700 text-xs leading-relaxed block">{LEGAL_CONFIG.GRIEVANCE_OFFICER.ADDRESS}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Statutory Timelines */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Clock className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Statutory Response Timelines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-warm-200">
                <div className="text-2xl font-bold text-[var(--color-brand-primary)]">24 Hours</div>
                <div className="font-semibold text-charcoal-900 text-xs mt-1">Grievance Acknowledgment</div>
                <p className="text-xs text-charcoal-500 mt-1">
                  We provide an official ticket reference number and formal receipt acknowledgment within 24 hours of receiving your written grievance.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-warm-200">
                <div className="text-2xl font-bold text-[var(--color-brand-primary)]">15 Days</div>
                <div className="font-semibold text-charcoal-900 text-xs mt-1">Final Disposal & Remediation</div>
                <p className="text-xs text-charcoal-500 mt-1">
                  All grievances, content removal requests, or user complaints are investigated, decided upon, and formally resolved within 15 calendar days.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Submitting a Grievance */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <FileText className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Requirements for Filing a Grievance
            </h2>
            <p>To enable prompt investigation, please ensure your email or written notice contains:</p>
            <ul className="space-y-1.5 list-disc list-inside text-charcoal-600 text-xs sm:text-sm">
              <li>Your full legal name, phone number, and verified account email address</li>
              <li>Booking confirmation ID, wedding listing URL, or user profile in question (if applicable)</li>
              <li>A clear description of the grievance, alleged legal/contractual violation, or objectionable content</li>
              <li>Any supporting evidence (screenshots, receipts, or message logs)</li>
            </ul>
          </section>

          {/* Section 4: Nodal & Appellate Information */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Scale className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Nodal Officer & Appellate Redressal
            </h2>
            <p>
              For law enforcement coordination, regulatory inquiries, or DPDP Act compliance, reach our legal cell at <a href={`mailto:${LEGAL_CONFIG.DATA_PROTECTION.DPDP_NODAL_EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold">{LEGAL_CONFIG.DATA_PROTECTION.DPDP_NODAL_EMAIL}</a>. Users may also access statutory consumer mediation platforms such as the National Consumer Helpline (NCH, 1915 in India) or the Grievance Appellate Committee (GAC) established under the Information Technology Rules.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Legal Pages</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-[var(--color-brand-primary)] underline">Privacy Policy</Link>
              <Link href="/dpdp" className="hover:text-[var(--color-brand-primary)] underline">DPDP Compliance</Link>
              <Link href="/complaints" className="hover:text-[var(--color-brand-primary)] underline">Complaints Policy</Link>
              <Link href="/incident-report" className="hover:text-[var(--color-brand-primary)] underline">Incident Reporting</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
