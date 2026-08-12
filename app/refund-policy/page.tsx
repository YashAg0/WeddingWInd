import { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  ShieldAlert,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Payment Protection Policy | Wedding With India",
  description:
    "Learn how Wedding With India handles booking cancellations, refunds, payment failures, host cancellations, event changes and payment-related disputes.",
  keywords: [
    "Wedding With India refund policy",
    "Wedding With India cancellation policy",
    "Indian wedding booking refund",
    "Wedding With India payment protection",
    "Indian wedding experience cancellation",
    "Wedding With India booking cancellation",
  ],
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    title: "Refund & Payment Protection Policy | Wedding With India",
    description:
      "Clear cancellation and refund rules for Wedding With India bookings and Indian wedding experiences.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <ShieldAlert size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Refund & Payment Protection Policy
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Clear cancellation, refund and payment rules for guests, hosts and
            bookings made through Wedding With India.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Last Updated: August 13, 2026</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">

          {/* Important notice */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Our approach to payments and refunds
                </h2>

                <p>
                  Wedding With India aims to make booking and cancellation
                  conditions clear before a customer completes a transaction.
                  Refund eligibility depends on the applicable booking terms,
                  the reason for cancellation, the timing of the cancellation,
                  payment status and applicable law.
                </p>

                <p className="text-sm text-charcoal-600">
                  Payment processing and payout arrangements may be provided by
                  regulated or authorized third-party payment providers.
                  Wedding With India does not describe customer funds as
                  &quot;escrow&quot; unless the specific payment arrangement
                  actually constitutes an escrow arrangement.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. When This Policy Applies
            </h2>

            <p>
              This Refund & Payment Protection Policy applies to eligible
              bookings and transactions made through Wedding With India.
            </p>

            <p>
              The cancellation terms shown for your specific experience at
              checkout form an important part of your booking agreement.
              Different experiences may have different cancellation policies
              because hosts can have different venue, catering, staffing and
              event commitments.
            </p>

            <p>
              If a booking-specific cancellation policy provides a more
              specific rule than this general policy, the booking-specific rule
              will apply to that booking to the extent of any conflict, subject
              to applicable law.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Booking Confirmation
            </h2>

            <p>
              A booking is considered confirmed only after the applicable
              booking system or Wedding With India communicates confirmation.
            </p>

            <p>
              The confirmation may identify the event date, number of guests,
              amount paid, cancellation deadline, applicable refund percentage,
              taxes or fees and other relevant conditions.
            </p>

            <p>
              Customers should retain their booking confirmation and review it
              before travelling.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Guest Cancellation
            </h2>

            <p>
              If a guest cancels a booking, the refund amount will normally be
              determined by the cancellation policy shown for that booking.
            </p>

            <p>
              A typical booking may use a tiered cancellation structure to
              account for commitments made by the host. For example, a booking
              may provide a higher refund for early cancellation and a lower or
              zero refund closer to the event date.
            </p>

            <p>
              The exact cancellation deadlines and percentages applicable to
              your booking will be those presented during the booking process.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Host Cancellation
            </h2>

            <div className="flex items-start gap-3">
              <CheckCircle2
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={20}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  If a host cancels a confirmed experience before it takes
                  place, Wedding With India will communicate the available
                  options to affected guests.
                </p>

                <p>
                  Depending on the circumstances and applicable booking terms,
                  an affected guest may be eligible for a full refund,
                  alternative experience, booking credit or another appropriate
                  remedy.
                </p>

                <p>
                  Where a host cancellation results from circumstances beyond
                  the host&apos;s reasonable control, the available remedy will
                  still be determined according to the applicable booking terms
                  and applicable law.
                </p>
              </div>
            </div>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Wedding Postponement or Material Change
            </h2>

            <p>
              Indian weddings are family events and may occasionally be
              postponed, rescheduled or materially changed.
            </p>

            <p>
              If a material change affects a confirmed booking, Wedding With
              India may communicate an alternative arrangement or available
              refund option in accordance with the applicable booking terms and
              applicable law.
            </p>

            <p>
              Minor changes to timing, activities, menu, ceremony sequence or
              other details that do not materially affect the overall
              experience do not necessarily constitute a cancellation.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Visa or Immigration Problems
            </h2>

            <p>
              Guests are responsible for obtaining the visas, permits and
              travel documentation required for their journey.
            </p>

            <p>
              If a booking-specific policy expressly permits a refund following
              a documented visa refusal, the guest must submit the requested
              official evidence within the stated deadline.
            </p>

            <p>
              A visa application that is delayed, incomplete, withdrawn,
              refused for reasons outside the applicable policy, or submitted
              after the relevant deadline does not automatically create a right
              to a refund.
            </p>

            <p>
              Nothing in this section limits any mandatory right available under
              applicable law.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Travel Delays and Missed Events
            </h2>

            <p>
              Guests are responsible for planning sufficient travel time to
              arrive at the event.
            </p>

            <p>
              Unless the applicable booking terms state otherwise, refunds are
              not automatically available for missed experiences resulting from
              flight delays, missed trains, traffic, personal travel changes,
              incorrect travel planning, passport problems or other matters
              attributable to the guest.
            </p>

            <p>
              Guests are strongly encouraged to maintain appropriate travel
              insurance for travel-related risks.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. No-Show
            </h2>

            <p>
              If a guest does not attend a confirmed experience and does not
              cancel within the applicable cancellation period, the booking may
              be treated as a no-show.
            </p>

            <p>
              A no-show generally does not qualify for a refund unless the
              booking-specific terms or applicable law provide otherwise.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Removal for Misconduct
            </h2>

            <p>
              If a guest is removed from an event because of serious misconduct,
              unlawful behavior, harassment, violence, safety concerns or
              material violation of the applicable guest rules, the guest is
              not automatically entitled to a refund.
            </p>

            <p>
              Any refund will be assessed according to the applicable booking
              terms, circumstances of the incident and applicable law.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Event Not Delivered as Confirmed
            </h2>

            <p>
              If a confirmed experience is not delivered in a material respect
              due to circumstances attributable to the host or Wedding With
              India, the guest should report the issue promptly.
            </p>

            <p>
              Depending on the circumstances, available remedies may include a
              partial refund, full refund, alternative arrangement, booking
              credit or another appropriate remedy.
            </p>

            <p>
              Guests should provide relevant evidence where reasonably
              available, such as photographs, booking details, messages or
              other information that may help us investigate the issue.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Payment Processing
            </h2>

            <div className="flex items-start gap-3">
              <CreditCard
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={20}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Payments may be processed through third-party payment
                  processors or payment service providers integrated with
                  Wedding With India.
                </p>

                <p>
                  Depending on the payment architecture, funds may be collected
                  and settled through regulated payment infrastructure before
                  being paid to the applicable recipient.
                </p>

                <p>
                  Wedding With India does not represent that customer funds are
                  held in a legally defined escrow arrangement unless the
                  applicable payment structure expressly provides for one.
                </p>

                <p className="text-sm text-charcoal-600">
                  Payment timing and payout timing may vary depending on the
                  payment provider, account verification, transaction status,
                  refunds, disputes, chargebacks, banking systems and applicable
                  regulatory requirements.
                </p>
              </div>
            </div>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Refund Processing
            </h2>

            <p>
              Approved refunds will normally be initiated through the original
              payment method or the applicable payment provider.
            </p>

            <p>
              The time for a refund to appear in the customer&apos;s account
              may depend on the payment provider, card issuer, bank, payment
              method, currency and transaction type.
            </p>

            <p>
              Wedding With India cannot guarantee the exact date on which a
              third-party financial institution will credit a refund after it
              has been initiated.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Duplicate or Failed Payments
            </h2>

            <p>
              If you believe that you were charged more than once for the same
              booking or that a payment was completed despite an error message,
              contact Wedding With India before initiating a payment dispute
              where reasonably possible.
            </p>

            <p>
              We will investigate transaction records and, where a duplicate
              charge or other processing error is confirmed, take appropriate
              steps to correct the transaction.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Chargebacks and Payment Disputes
            </h2>

            <p>
              Customers should contact Wedding With India regarding a disputed
              transaction where reasonably possible so that the issue can be
              investigated.
            </p>

            <p>
              Fraudulent or abusive chargebacks, including knowingly disputing a
              valid transaction after receiving the booked service, may result
              in account review or restriction, subject to applicable law and
              payment-provider rules.
            </p>

            <p>
              Nothing in this policy prevents a customer from exercising a
              legitimate right to dispute an unauthorized or fraudulent
              transaction with their payment provider.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Currency and Foreign Exchange
            </h2>

            <p>
              International customers may see prices or charges converted
              between currencies.
            </p>

            <p>
              The final amount charged may differ from an estimated conversion
              because of exchange-rate movements, payment-provider conversion
              rates, card issuer fees or other financial institution charges.
            </p>

            <p>
              Any foreign-exchange fees charged by a customer&apos;s bank or
              card provider are generally outside Wedding With India&apos;s
              control.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Taxes and Government Charges
            </h2>

            <p>
              Applicable taxes may be included in or added to the displayed
              booking price depending on the transaction and applicable law.
            </p>

            <p>
              Customers remain responsible for personal taxes, customs,
              immigration charges or other government charges that are not
              included in the booking price.
            </p>
          </section>

          {/* 17 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Force Majeure
            </h2>

            <p>
              A wedding or experience may be affected by events beyond the
              reasonable control of Wedding With India or the host, including
              severe weather, natural disasters, government restrictions,
              public emergencies, transportation disruption, civil unrest,
              war, infrastructure failure or other comparable circumstances.
            </p>

            <p>
              Where such an event affects a confirmed booking, the applicable
              refund or alternative arrangement will be determined according to
              the booking terms and applicable law.
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. Refund Exclusions
            </h2>

            <p>
              Unless the applicable booking terms or law provide otherwise, a
              refund may not be available where the issue results primarily
              from:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>guest no-show;</li>
              <li>late arrival or missed travel connections;</li>
              <li>guest misconduct or removal from an event;</li>
              <li>failure to satisfy applicable entry requirements;</li>
              <li>failure to provide required verification information;</li>
              <li>
                inaccurate information supplied by the guest;
              </li>
              <li>
                personal changes of plans outside the applicable cancellation
                window; or
              </li>
              <li>
                other circumstances specifically identified in the applicable
                booking terms.
              </li>
            </ul>
          </section>

          {/* 19 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. How to Request a Refund
            </h2>

            <p>
              Refund requests should be submitted through the official Wedding
              With India support or booking channel associated with the
              transaction.
            </p>

            <p>
              Include your booking reference, account information, reason for
              the request and supporting documentation where applicable.
            </p>

            <p>
              We may request additional information reasonably necessary to
              verify the transaction and determine eligibility.
            </p>
          </section>

          {/* 20 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              20. Fraud Prevention and Verification
            </h2>

            <p>
              We may conduct reasonable checks before processing certain
              refunds, particularly where there is evidence of fraud, duplicate
              claims, account compromise, payment abuse or conflicting
              transaction information.
            </p>

            <p>
              Any such review will be conducted subject to applicable law and
              our Privacy Policy.
            </p>
          </section>

          {/* 21 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              21. Statutory Consumer Rights
            </h2>

            <p>
              Nothing in this policy is intended to exclude, restrict or
              override a consumer guarantee, statutory remedy, refund right or
              other protection that cannot legally be excluded or restricted.
            </p>

            <p>
              Where applicable law provides a remedy that is more favorable
              than a general rule stated in this policy, the mandatory legal
              requirement will prevail.
            </p>
          </section>

          {/* 22 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              22. Changes to This Policy
            </h2>

            <p>
              Wedding With India may update this policy to reflect changes in
              payment infrastructure, booking models, operational practices,
              business structure or applicable law.
            </p>

            <p>
              The policy applicable to a completed booking will generally be
              the version presented or incorporated into the booking at the
              relevant time, subject to applicable law.
            </p>
          </section>

          {/* Practical protection */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <h2 className="font-display font-bold text-lg text-charcoal-900 mb-4">
              For a smoother refund process
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                  size={19}
                  aria-hidden="true"
                />
                <p>
                  Keep your booking confirmation and payment receipt.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                  size={19}
                  aria-hidden="true"
                />
                <p>
                  Cancel through the official booking process rather than only
                  notifying a host informally.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                  size={19}
                  aria-hidden="true"
                />
                <p>
                  Submit supporting documentation promptly when a policy
                  requires it.
                </p>
              </div>
            </div>
          </section>

          {/* Legal notice */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-amber-700"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Important payment notice
                </h2>

                <p>
                  Wedding With India does not promise an escrow arrangement,
                  insurance-backed refund or guaranteed recovery of funds
                  unless the applicable booking expressly states that such a
                  protection exists.
                </p>

                <p>
                  Payment processing may involve third-party financial
                  institutions or payment providers. Their own terms,
                  verification requirements, settlement processes and regulatory
                  obligations may affect payment timing.
                </p>

                <p className="text-sm text-charcoal-600">
                  This policy should be read together with the Terms of Service,
                  applicable booking terms and Privacy Policy.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              Last updated: August 13, 2026. Wedding With India may update this
              policy as its payment infrastructure, booking model and
              applicable legal requirements evolve.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}