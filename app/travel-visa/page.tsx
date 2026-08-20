import { Metadata } from "next";
import Link from "next/link";
import { Plane, Globe, ExternalLink, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Travel & Visa Information for India",
  description:
    "Essential information on Indian e-Visas, passport validity, customs regulations, and official government application portals for international wedding guests.",
  alternates: {
    canonical: "https://weddingwithindia.com/travel-visa",
  },
};

export default function TravelVisaPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Plane size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Travel & Visa Information
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Essential entry guidance for international travelers visiting India. Learn about the official Indian e-Visa process, passport requirements, and travel readiness.
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
              <AlertTriangle size={17} /> Important Immigration & Legal Notice
            </p>
            <p>
              WeddingWithIndia is an online technology marketplace connecting travelers with cultural wedding experiences. We are <strong>not</strong> an immigration advisory firm, travel agency, or government agency. We do not issue visas, guarantee visa approvals, or guarantee border entry into India. All international travelers are solely responsible for obtaining the appropriate travel documentation.
            </p>
          </div>

          {/* Section 1: Official Indian e-Visa */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Globe className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Official Indian e-Tourist Visa Portal
            </h2>
            <p>
              Most international travelers visiting India for tourism and cultural events are eligible to apply for an Indian e-Tourist Visa online prior to travel.
            </p>
            <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-charcoal-900 text-sm">Official Government of India e-Visa Portal</h3>
                <p className="text-xs text-charcoal-500">Apply only through the official Government portal to avoid third-party agency surcharges.</p>
              </div>
              <a
                href={LEGAL_CONFIG.OFFICIAL_VISA_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary text-xs shrink-0 flex items-center gap-1.5 px-4 py-2"
              >
                <span>Visit Official Portal</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </section>

          {/* Section 2: Key Requirements */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <CheckCircle2 className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Checklist for Travelers
            </h2>
            <ul className="space-y-2.5 list-disc list-inside text-charcoal-600 text-xs sm:text-sm">
              <li><strong>Passport Validity:</strong> Your passport must be valid for at least 6 months beyond your date of arrival in India and contain at least 2 blank pages.</li>
              <li><strong>Application Timing:</strong> We recommend submitting your e-Visa application at least 7 to 14 days before your scheduled departure date.</li>
              <li><strong>Printed Electronic Travel Authorization (ETA):</strong> Print a physical copy of your approved ETA to present to immigration officers upon arrival at the airport.</li>
              <li><strong>Return / Onward Ticket:</strong> Ensure you carry confirmation of your return or onward international flight.</li>
            </ul>
          </section>

          {/* Section 3: Health, Customs & Insurance */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Plane className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Health, Customs & Travel Insurance
            </h2>
            <p>
              Before traveling, consult with a travel health clinic regarding recommended vaccinations. International travel and medical insurance is strongly advised for all international guests. Please review our <Link href="/insurance" className="text-[var(--color-brand-primary)] underline font-semibold">Travel Insurance Guidance</Link>.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Travel Information</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/insurance" className="hover:text-[var(--color-brand-primary)] underline">Insurance Guidance</Link>
              <Link href="/guest-safety" className="hover:text-[var(--color-brand-primary)] underline">Guest Safety Guide</Link>
              <Link href="/cancellation-policy" className="hover:text-[var(--color-brand-primary)] underline">Cancellation Policy</Link>
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
