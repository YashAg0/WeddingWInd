import { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ShieldCheck, QrCode, UserCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Reservation & Booking Terms",
  description:
    "Terms governing reservation requests, host approvals, digital QR guest pass issuance, check-in rules, and attendee policies on WeddingWithIndia.",
  alternates: {
    canonical: "https://weddingwithindia.com/booking-terms",
  },
};

export default function BookingTermsPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <CalendarCheck size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Reservation & Booking Terms
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            The rules and lifecycle governing your wedding experience reservation, from application submission to on-site check-in.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: The Booking Lifecycle */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <CalendarCheck className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. The Reservation & Approval Process
            </h2>
            <p>
              To maintain the intimate, family-centered atmosphere of authentic Indian weddings, reservations follow a structured 3-step verification flow:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <div className="font-semibold text-charcoal-900 text-sm">Step 1: Application Submission</div>
                <p className="text-xs text-charcoal-600 mt-1">
                  You select your preferred wedding experience tier, package duration (1 to 5 days), guest count, and submit a personal message to the host family.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <div className="font-semibold text-charcoal-900 text-sm">Step 2: Host Family Review</div>
                <p className="text-xs text-charcoal-600 mt-1">
                  The host family reviews your group details and approves your reservation request. If declined, no charge is processed.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200">
                <div className="font-semibold text-charcoal-900 text-sm">Step 3: Payment & Pass Issuance</div>
                <p className="text-xs text-charcoal-600 mt-1">
                  Upon approval, you complete payment through our secure checkout. Your encrypted digital QR guest pass and celebration hub are instantly generated in your dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Cryptographic QR Guest Pass */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <QrCode className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Digital QR Guest Pass & Identity Verification
            </h2>
            <p>
              Your digital guest pass is personalized, cryptographically signed with AES-256-GCM encryption, and tied to your verified identity.
            </p>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600 text-xs sm:text-sm">
              <li><strong>Non-Transferable:</strong> Guest passes may not be resold, transferred, or assigned to third parties without prior written approval from WeddingWithIndia support.</li>
              <li><strong>Physical Identification:</strong> You must present a valid government-issued photo ID (such as your international passport) matching the name on your guest pass upon venue check-in.</li>
            </ul>
          </section>

          {/* Section 3: Guest Substitutions & Group Changes */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <UserCheck className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Guest Substitution & Group Adjustments
            </h2>
            <p>
              If a member of your travel party cannot attend due to emergency or travel disruption, you must notify support at least 7 days prior to the wedding date to request a guest name change. All substitute guests must undergo the standard identity verification screening.
            </p>
          </section>

          {/* Section 4: Capacity & Overbooking Defense */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Strict Capacity Enforcement
            </h2>
            <p>
              Every wedding listing on WeddingWithIndia has a strictly capped international guest allocation agreed upon with the host family. Our system enforces atomic database row locks to guarantee that no wedding is ever overbooked.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Policies</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/traveler-agreement" className="hover:text-[var(--color-brand-primary)] underline">Traveler Agreement</Link>
              <Link href="/payment-terms" className="hover:text-[var(--color-brand-primary)] underline">Payment Terms</Link>
              <Link href="/cancellation-policy" className="hover:text-[var(--color-brand-primary)] underline">Cancellation Policy</Link>
              <Link href="/refund-policy" className="hover:text-[var(--color-brand-primary)] underline">Refund Policy</Link>
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
