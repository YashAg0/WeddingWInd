import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarX,
  CheckCircle2,
  Clock,
  Info,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description:
    "Cancellation and booking-change terms for travelers, host families, and WeddingWithIndia experiences.",
  keywords: [
    "WeddingWithIndia cancellation policy",
    "Indian wedding booking cancellation",
    "wedding experience refund",
    "WeddingWithIndia refund",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/cancellation-policy",
  },
  openGraph: {
    title: "Cancellation Policy | WeddingWithIndia",
    description:
      "Understand cancellation, event changes, host cancellations, and refund procedures for WeddingWithIndia experiences.",
    url: "https://weddingwithindia.com/cancellation-policy",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cancellation Policy | WeddingWithIndia",
    description:
      "Understand cancellation, event changes, host cancellations, and refund procedures for WeddingWithIndia experiences.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <header className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <CalendarX size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Cancellation Policy
          </h1>

          <p className="max-w-2xl text-charcoal-500 text-sm sm:text-base leading-relaxed">
            Clear rules for traveler cancellations, host cancellations, event
            changes and booking-related refunds.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Last Updated: August 13, 2026</span>
          </div>
        </header>

        <article className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">

          {/* Important summary */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <div className="flex items-start gap-3">
              <Info
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Before cancelling
                </h2>

                <p>
                  The cancellation terms applicable to a booking are determined
                  by the booking confirmation, the applicable experience terms,
                  this Cancellation Policy and the Refund Policy.
                </p>

                <p>
                  If there is a conflict between a specific written booking
                  confirmation and this general policy, the applicable
                  contractual terms communicated at the time of booking will
                  govern to the extent permitted by applicable law.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Traveler-Initiated Cancellations
            </h2>

            <p>
              A traveler may request cancellation of a confirmed booking using
              the available account or support process.
            </p>

            <p>
              Unless the applicable booking confirmation states otherwise, the
              following general schedule applies to the booking amount eligible
              for refund:
            </p>

            <div className="overflow-x-auto rounded-2xl border border-warm-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-warm-50">
                  <tr>
                    <th className="px-4 py-3 font-bold text-charcoal-900">
                      Cancellation timing
                    </th>
                    <th className="px-4 py-3 font-bold text-charcoal-900">
                      General refund
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-t border-warm-200">
                    <td className="px-4 py-3">
                      14 or more days before the scheduled experience
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      100%
                    </td>
                  </tr>

                  <tr className="border-t border-warm-200">
                    <td className="px-4 py-3">
                      7–13 days before the scheduled experience
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      50%
                    </td>
                  </tr>

                  <tr className="border-t border-warm-200">
                    <td className="px-4 py-3">
                      Fewer than 7 days before the scheduled experience
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Generally non-refundable
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-charcoal-500">
              The applicable booking confirmation may provide different
              cancellation terms for a particular experience. Where it does,
              those disclosed terms should be reviewed before booking.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. How Cancellation Timing Is Determined
            </h2>

            <p>
              Cancellation timing is calculated using the scheduled local date
              and time of the applicable wedding experience and the timestamp
              at which a valid cancellation request is received through the
              designated Wedding With India system or support channel.
            </p>

            <p>
              A cancellation is not considered completed merely because a
              traveler has decided not to attend or has stopped communicating.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Host-Initiated Cancellations
            </h2>

            <p>
              A host family is responsible for promptly notifying Wedding With
              India if the wedding, venue, date or other material part of the
              listed experience changes or can no longer proceed as described.
            </p>

            <p>
              Where a host cancels a confirmed guest experience, Wedding With
              India will assess the affected booking and apply the refund or
              alternative-arrangement terms communicated to the traveler.
            </p>

            <p>
              A host must not independently request or pressure a traveler to
              cancel a booking in order to avoid an applicable host
              cancellation process.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Event Date, Venue or Experience Changes
            </h2>

            <p>
              A wedding may involve changes to its venue, schedule, ceremony
              sequence or other details due to circumstances affecting the host
              family or event.
            </p>

            <p>
              Material changes will be communicated to affected travelers as
              reasonably practicable.
            </p>

            <p>
              Where a change materially affects the booked experience, the
              traveler may be offered an alternative arrangement or refund in
              accordance with the applicable booking terms and circumstances.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Wedding With India Cancellation
            </h2>

            <p>
              Wedding With India may cancel, suspend or modify an experience
              where reasonably necessary, including because of safety concerns,
              venue restrictions, insufficient operational availability,
              regulatory requirements, fraud concerns, force majeure or other
              circumstances affecting the ability to provide the experience.
            </p>

            <p>
              Where Wedding With India cancels a confirmed booking for reasons
              within its applicable refund obligations, affected travelers will
              receive the refund or alternative remedy specified in the
              applicable booking terms.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. No-Show
            </h2>

            <p>
              If a traveler does not attend a scheduled experience and has not
              completed a valid cancellation before the applicable cancellation
              deadline, the booking will generally be treated as a no-show.
            </p>

            <p>
              No-shows are generally non-refundable unless the applicable
              booking terms, a documented exceptional circumstance or
              applicable law provides otherwise.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Late Arrival
            </h2>

            <p>
              Arriving late does not automatically extend the scheduled
              experience or create a right to a refund.
            </p>

            <p>
              Wedding ceremonies and venue schedules may continue according to
              the host&apos;s arrangements. Travelers should follow the arrival
              instructions provided with their booking.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Visa, Travel and Transportation Problems
            </h2>

            <p>
              Travelers are responsible for obtaining any visa, travel
              authorization, insurance, transportation and other documents
              required for their journey.
            </p>

            <p>
              A visa refusal, flight cancellation, missed connection,
              transportation disruption or other travel problem does not
              automatically create a refund right unless the applicable booking
              terms specifically provide one.
            </p>

            <p>
              Where a visa-related refund is offered, the traveler may be
              required to provide appropriate documentary evidence within the
              applicable deadline.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Exceptional Circumstances and Force Majeure
            </h2>

            <p>
              Circumstances outside a party&apos;s reasonable control may
              affect an experience or cancellation.
            </p>

            <p>
              Examples may include natural disasters, severe weather,
              government restrictions, public-health measures, civil unrest,
              major transportation disruption, venue closure or other
              circumstances that materially prevent the experience from taking
              place.
            </p>

            <p>
              The treatment of such circumstances will depend on the applicable
              booking terms, the facts of the event and applicable law.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Refund Processing
            </h2>

            <p>
              Approved refunds are generally returned using the payment method
              or payment process associated with the original booking, subject
              to the capabilities and rules of the relevant payment provider.
            </p>

            <p>
              The time required for a refund to appear in an account can depend
              on the payment provider, bank, card network or other financial
              institution.
            </p>

            <p>
              Wedding With India does not control processing times imposed by
              external financial institutions.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Taxes, Fees and Third-Party Charges
            </h2>

            <p>
              The amount refunded may depend on the terms displayed at booking,
              applicable taxes, payment-processing arrangements and other
              disclosed charges.
            </p>

            <p>
              Any non-refundable third-party charge will only be excluded from
              a refund where that treatment was properly disclosed and is
              permitted by applicable law.
            </p>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Changes Requested by the Traveler
            </h2>

            <p>
              Requests to change the number of guests, date, experience,
              ceremony access or other booking details are subject to
              availability and host approval.
            </p>

            <p>
              A requested change may be treated as a cancellation and new
              booking where the requested modification cannot be accommodated
              under the existing reservation.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Host Conduct and Repeated Cancellations
            </h2>

            <p>
              Repeated or material host cancellations may result in review of
              the host&apos;s listing, temporary suspension, removal of future
              availability or termination from the platform, subject to the
              applicable host agreement and law.
            </p>

            <p>
              Any financial consequences for a host will be governed by the
              applicable host agreement and should not be inferred solely from
              this public policy.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Safety-Related Cancellation
            </h2>

            <p>
              Wedding With India may restrict, suspend or cancel participation
              where there is a reasonable safety, security, fraud or serious
              conduct concern.
            </p>

            <p>
              Where a booking is cancelled because of a traveler&apos;s
              violation of applicable terms or serious misconduct, refund
              eligibility may be affected according to the applicable booking
              terms and applicable law.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. How to Request a Cancellation
            </h2>

            <p>
              Travelers should use the cancellation function available in
              their account where provided.
            </p>

            <p>
              If the account cancellation function is unavailable, contact
              Booking Support using the official contact channel:
            </p>

            <a
              href="mailto:bookings@weddingwithindia.com"
              className="inline-flex items-center text-[var(--color-brand-primary)] font-semibold hover:underline"
            >
              bookings@weddingwithindia.com
            </a>

            <p className="text-xs text-charcoal-500">
              Include your booking reference where possible. Do not send
              passport numbers, payment card numbers, passwords or other
              unnecessary sensitive information by ordinary email.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Relationship With the Refund Policy
            </h2>

            <p>
              This Cancellation Policy explains when a booking may be
              cancelled. The separate{" "}
              <Link
                href="/refund-policy"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                Refund Policy
              </Link>{" "}
              explains refund eligibility and related procedures.
            </p>

            <p>
              Travelers should review both policies before making a booking.
            </p>
          </section>

          {/* Protection */}
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={21}
                className="mt-0.5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />

              <div className="space-y-2">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Transparent booking terms
                </h2>

                <p className="text-sm text-charcoal-700">
                  The cancellation terms applicable to your specific booking
                  should be presented before you complete the booking. Keep your
                  confirmation email and booking details for your records.
                </p>
              </div>
            </div>
          </section>

          {/* Important legal notice */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-amber-700"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Important legal notice
                </h2>

                <p>
                  This policy is intended to describe the general cancellation
                  framework used by Wedding With India. Individual bookings may
                  contain additional terms based on the experience, host,
                  location, payment arrangement or applicable law.
                </p>

                <p>
                  Nothing in this policy is intended to remove or restrict any
                  consumer right, refund right or other protection that cannot
                  lawfully be excluded or limited.
                </p>

                <p className="text-sm text-charcoal-600">
                  Before using this policy as a binding commercial document,
                  Wedding With India should have its final cancellation,
                  refund, payment and consumer terms reviewed by qualified
                  counsel in the jurisdictions in which the service will be
                  offered.
                </p>
              </div>
            </div>
          </section>

          {/* Related policies */}
          <section className="pt-2 border-t border-warm-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/refund-policy"
                className="rounded-2xl border border-warm-200 p-4 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <ShieldCheck
                  size={17}
                  className="text-[var(--color-brand-primary)] mb-2"
                  aria-hidden="true"
                />
                <p className="font-bold text-charcoal-900">
                  Refund Policy
                </p>
                <p className="text-xs text-charcoal-500 mt-1">
                  Refund eligibility and processing.
                </p>
              </Link>

              <Link
                href="/terms"
                className="rounded-2xl border border-warm-200 p-4 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <CalendarX
                  size={17}
                  className="text-[var(--color-brand-primary)] mb-2"
                  aria-hidden="true"
                />
                <p className="font-bold text-charcoal-900">
                  Terms of Service
                </p>
                <p className="text-xs text-charcoal-500 mt-1">
                  General platform terms.
                </p>
              </Link>

              <Link
                href="/contact"
                className="rounded-2xl border border-warm-200 p-4 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <Clock
                  size={17}
                  className="text-[var(--color-brand-primary)] mb-2"
                  aria-hidden="true"
                />
                <p className="font-bold text-charcoal-900">
                  Contact Support
                </p>
                <p className="text-xs text-charcoal-500 mt-1">
                  Need help with a booking?
                </p>
              </Link>
            </div>
          </section>

          <footer className="pt-2 border-t border-warm-100">
            <p className="text-xs text-charcoal-400">
              Last updated: August 13, 2026.
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}