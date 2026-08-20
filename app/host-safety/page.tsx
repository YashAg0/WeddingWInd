import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users, Home, AlertCircle, HeartHandshake, Clock } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Host Family Safety & Hospitality Guide",
  description:
    "Safety guidelines, guest vetting principles, household boundaries, and coordinator support for Indian host families welcoming international guests.",
  alternates: {
    canonical: "https://weddingwithindia.com/host-safety",
  },
};

export default function HostSafetyPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Home size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Host Family Safety Guide
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Essential principles for welcoming international guests with confidence, setting household boundaries, and working alongside dedicated cultural coordinators.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Host Control & Reservation Approval */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Users className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. You Choose Who Joins Your Celebration
            </h2>
            <p>
              As a host family, you retain complete authority over your guest list. Instant booking is disabled; you review each traveler&apos;s verified profile, group size, origin country, and message before deciding whether to accept or decline their reservation request.
            </p>
          </section>

          {/* Section 2: On-Site Coordinator Support */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Dedicated On-Site Coordinator Liaison
            </h2>
            <p>
              To ensure you can focus on celebrating with your loved ones, WeddingWithIndia connects you with an on-site cultural coordinator who:
            </p>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li>Greets international guests at the venue and scans their encrypted digital QR guest passes</li>
              <li>Explains ceremonial customs, seating arrangements, and schedule flow to guests</li>
              <li>Serves as the primary point of contact for guest inquiries, reducing disruption to the host family</li>
              <li>Manages any logistical hiccups or boundary concerns swiftly and discreetly</li>
            </ul>
          </section>

          {/* Section 3: Setting House & Event Boundaries */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <HeartHandshake className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Communicating Boundaries & House Rules
            </h2>
            <p>
              Every family has unique traditions and comfort levels. We recommend specifying in your listing:
            </p>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li><strong>Dietary Rules:</strong> Clearly indicate if your celebration is strictly vegetarian, vegan, or alcohol-free.</li>
              <li><strong>Private Quarters:</strong> Specify that private bridal dressing rooms and family rest suites are off-limits to external attendees.</li>
              <li><strong>Photography Preferences:</strong> Communicate any sacred rituals where cameras or phones should be set aside.</li>
            </ul>
          </section>

          {/* Section 4: Incident Response & Host Protection */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <AlertCircle className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Immediate Support & Incident Management
            </h2>
            <p>
              If a guest behaves inappropriately, violates cultural etiquette, or causes disruption, your coordinator and our Trust & Safety team are available to intervene immediately:
            </p>
            <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 text-xs sm:text-sm space-y-2">
              <p>
                <strong>Immediate Removal:</strong> You or your coordinator have the right to revoke a guest&apos;s pass and request their departure if community standards are breached.
              </p>
              <p>
                <strong>24/7 Safety Cell:</strong> Email <a href={`mailto:${LEGAL_CONFIG.SAFETY_EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold">{LEGAL_CONFIG.SAFETY_EMAIL}</a> or file an urgent report via our <Link href="/incident-report" className="underline font-semibold">Incident Portal</Link>.
              </p>
            </div>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Host Resources</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/host-agreement" className="hover:text-[var(--color-brand-primary)] underline">Host Agreement</Link>
              <Link href="/community-guidelines" className="hover:text-[var(--color-brand-primary)] underline">Community Guidelines</Link>
              <Link href="/guest-safety" className="hover:text-[var(--color-brand-primary)] underline">Guest Safety Guide</Link>
              <Link href="/photo-video-consent" className="hover:text-[var(--color-brand-primary)] underline">Photo & Video Consent</Link>
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
