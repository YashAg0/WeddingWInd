import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Partner & Referral Agent Agreement | Wedding With India",
  description:
    "Terms governing referral partners, travel professionals and agents who introduce travelers or host families to Wedding With India.",
  keywords: [
    "Wedding With India agent agreement",
    "Wedding With India referral partner",
    "travel agent partnership India",
    "wedding travel referral commission",
    "Wedding With India commission",
    "travel partner agreement",
  ],
  alternates: {
    canonical: "/agent-agreement",
  },
  openGraph: {
    title: "Partner & Referral Agent Agreement | Wedding With India",
    description:
      "Terms, eligibility, commissions, referrals, brand use and responsibilities for Wedding With India referral partners.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AgentAgreementPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">

        {/* Header */}
        <header className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Briefcase size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Partner & Referral Agent Agreement
          </h1>

          <p className="max-w-2xl text-charcoal-500 text-sm sm:text-base leading-relaxed">
            Terms for approved travel professionals, creators, advisors and
            referral partners who introduce travelers or host families to
            Wedding With India.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Last Updated: August 13, 2026</span>
          </div>
        </header>

        <article className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">

          {/* Important notice */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Important partnership notice
                </h2>

                <p>
                  This page describes the general framework for the Wedding
                  With India referral partner program. An approved partner may
                  also receive a separate written agreement, onboarding
                  confirmation or commission schedule containing additional
                  terms.
                </p>

                <p>
                  Registration or application to the partner program does not
                  guarantee approval, referrals, bookings, commissions or any
                  minimum level of earnings.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Purpose of the Partner Program
            </h2>

            <p>
              Wedding With India may work with approved referral partners who
              introduce prospective travelers, wedding hosts or other
              qualifying customers to the Wedding With India platform.
            </p>

            <p>
              A partner may use an approved referral link, referral code or
              another attribution method supplied by Wedding With India.
            </p>

            <p>
              The partner&apos;s role is primarily to introduce prospective
              customers and promote Wedding With India through approved
              channels. Unless expressly authorized in writing, the partner
              does not sell, operate or independently deliver Wedding With
              India experiences.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Independent Partner Relationship
            </h2>

            <p>
              An approved partner acts independently and is responsible for
              determining how and where they promote the platform, subject to
              this Agreement and applicable law.
            </p>

            <p>
              Nothing in this Agreement creates an employment relationship,
              partnership, joint venture, franchise or general agency
              relationship between the parties.
            </p>

            <p>
              The partner may not represent themselves as an employee,
              director, owner, legal representative or authorized agent of
              Wedding With India unless expressly authorized in writing.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Referral Attribution
            </h2>

            <p>
              A referral is generally attributed to a partner when a
              prospective customer completes the applicable referral process
              using the partner&apos;s approved referral link, code or other
              attribution method.
            </p>

            <p>
              Wedding With India may use reasonable technical and operational
              records to determine referral attribution.
            </p>

            <p>
              A referral may not qualify for commission where:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                the customer was already an existing customer or had already
                entered the Wedding With India booking process;
              </li>
              <li>
                the referral cannot reasonably be attributed to the partner;
              </li>
              <li>
                the referral was generated through prohibited or fraudulent
                activity;
              </li>
              <li>
                the transaction is cancelled, refunded or reversed;
              </li>
              <li>
                the booking fails the applicable qualification requirements; or
              </li>
              <li>
                another partner has a valid priority claim under the applicable
                attribution rules.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Commission Eligibility
            </h2>

            <p>
              Commission rates are determined by the partner plan or commission
              schedule communicated to the approved partner.
            </p>

            <p>
              Unless the applicable commission schedule states otherwise, a
              commission becomes eligible only after the referred transaction
              satisfies all applicable qualification conditions, which may
              include:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>successful attribution to the partner;</li>
              <li>successful payment by the referred customer;</li>
              <li>completion of required verification;</li>
              <li>completion of the applicable wedding experience;</li>
              <li>no applicable cancellation or refund; and</li>
              <li>no fraud, chargeback or material policy violation.</li>
            </ul>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Commission Rates
            </h2>

            <p>
              Any commission percentage displayed on the Wedding With India
              website, partner dashboard, promotional material or application
              form should be treated as an applicable program rate only where
              the relevant terms identify it as currently active.
            </p>

            <p>
              Commission rates may differ between partner programs, campaigns,
              customer categories or promotional periods.
            </p>

            <p>
              The commission rate applicable to a particular referral will be
              determined according to the rate communicated for that referral
              or campaign at the time the qualifying referral is made.
            </p>

            <p className="text-xs text-charcoal-500">
              Wedding With India should keep commission rates in one
              authoritative configuration so that the website, partner
              dashboard and payment calculations do not display conflicting
              percentages.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Commission Calculation
            </h2>

            <p>
              Unless the applicable commission schedule states otherwise,
              commission is calculated on the qualifying booking value
              specifically identified in that schedule.
            </p>

            <p>
              Taxes, refunds, chargebacks, discounts, promotional credits,
              payment-processing charges or third-party amounts may be
              excluded from the commission calculation where the applicable
              commission schedule provides for such exclusion.
            </p>

            <p>
              Partners should review the applicable commission statement before
              treating an amount as final and payable.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Refunds, Chargebacks and Commission Reversals
            </h2>

            <p>
              A commission associated with a booking may be withheld, adjusted
              or reversed if the underlying booking is cancelled, refunded,
              charged back, found to be fraudulent or otherwise ceases to
              qualify.
            </p>

            <p>
              If a commission has already been paid and the underlying
              transaction is subsequently refunded or reversed, Wedding With
              India may offset the corresponding amount against future
              commissions or request repayment, subject to applicable law and
              the applicable partner agreement.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Payment of Commissions
            </h2>

            <p>
              Approved commissions will be paid using the payment method
              available under the partner program and after the applicable
              payment threshold, verification and documentation requirements
              have been satisfied.
            </p>

            <p>
              Wedding With India may require accurate payment details,
              identity information, tax information or other documentation
              reasonably necessary to process a commission payment.
            </p>

            <p>
              Wedding With India is not responsible for delays caused by
              incorrect payment information supplied by the partner or by
              external payment providers or financial institutions.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Taxes and Invoicing
            </h2>

            <p>
              Partners are responsible for complying with tax, invoicing and
              registration obligations applicable to their own activities.
            </p>

            <p>
              Depending on the partner&apos;s location, legal status,
              registration status and the nature of the service, GST or other
              tax requirements may apply.
            </p>

            <p>
              The parties should obtain professional tax advice where required.
              Wedding With India may request tax documentation reasonably
              necessary for its accounting and compliance processes.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. No Unauthorized Sales or Guarantees
            </h2>

            <p>
              Unless separately authorized in writing, partners may not:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>accept booking payments on behalf of Wedding With India;</li>
              <li>issue invoices in the name of Wedding With India;</li>
              <li>change prices or booking terms;</li>
              <li>promise refunds or compensation;</li>
              <li>guarantee visa approval or immigration outcomes;</li>
              <li>
                guarantee availability of a specific wedding experience;
              </li>
              <li>
                guarantee safety, accommodation, transportation or other
                third-party services; or
              </li>
              <li>bind Wedding With India to a contract with a customer.</li>
            </ul>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Advertising and Marketing Standards
            </h2>

            <p>
              Partners must market Wedding With India honestly and must not use
              misleading claims about prices, availability, earnings,
              verification, safety, cultural experiences, refunds or other
              material features.
            </p>

            <p>
              Partners must not make claims that cannot be substantiated by
              the information officially provided by Wedding With India.
            </p>

            <p>
              Marketing must comply with applicable advertising, consumer
              protection, privacy and platform rules.
            </p>

            <p>
              Indian consumer-protection law applies to services and e-commerce
              activities within its scope and provides mechanisms addressing
              unfair trade practices and misleading conduct.
            </p>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Prohibited Promotion Methods
            </h2>

            <p>Partners must not generate referrals through:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>spam or unsolicited bulk messages;</li>
              <li>fake accounts or fabricated identities;</li>
              <li>misleading landing pages;</li>
              <li>fake reviews or fabricated testimonials;</li>
              <li>misleading paid advertisements;</li>
              <li>unauthorized trademark bidding where prohibited;</li>
              <li>cookie stuffing or fraudulent attribution;</li>
              <li>self-referrals intended to obtain commissions improperly;</li>
              <li>
                automated traffic or bots intended to manipulate attribution;
                or
              </li>
              <li>any unlawful marketing method.</li>
            </ul>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Disclosure of Referral Relationship
            </h2>

            <p>
              Where a partner receives a commission or other financial benefit
              from a referral, the partner should make any disclosure required
              by applicable advertising, consumer-protection, platform or
              professional rules.
            </p>

            <p>
              Partners must not present compensated recommendations as
              independent personal recommendations where doing so would be
              misleading.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Use of the Wedding With India Brand
            </h2>

            <p>
              Approved partners may use Wedding With India&apos;s approved
              trademarks, logos and marketing materials solely for authorized
              promotion of the referral program.
            </p>

            <p>
              Partners may not alter the logo, create confusingly similar
              branding, register domain names or social-media accounts that
              imply ownership of Wedding With India, or otherwise create the
              impression that they are the company.
            </p>

            <p>
              Permission to use brand assets ends when the partner relationship
              or applicable authorization ends.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Customer Information and Privacy
            </h2>

            <p>
              A partner may receive or independently collect customer
              information while making a referral. Such information must be
              handled lawfully and only for legitimate purposes.
            </p>

            <p>
              Partners must not request unnecessary sensitive information such
              as passport numbers, government identification numbers, payment
              card information or passwords merely to make a referral.
            </p>

            <p>
              If Wedding With India provides a secure referral or lead
              submission mechanism, partners should use that mechanism rather
              than transferring customer information through informal channels
              where avoidable.
            </p>

            <p>
              See our{" "}
              <Link
                href="/privacy"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                Privacy Policy
              </Link>{" "}
              for information about Wedding With India&apos;s own processing of
              personal data.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Confidential Information
            </h2>

            <p>
              Partners may receive non-public information relating to
              customers, hosts, pricing, commission structures, product
              development, operations or business relationships.
            </p>

            <p>
              Such information must be kept confidential and used only for the
              authorized partner relationship.
            </p>
          </section>

          {/* 17 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Conflicts of Interest
            </h2>

            <p>
              Partners should disclose material conflicts of interest that
              could affect their recommendations to prospective customers.
            </p>

            <p>
              A partner may generally work with other travel businesses unless
              a separate written exclusivity arrangement applies. However, the
              partner must not misuse Wedding With India confidential
              information or customer data.
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. No Guarantee of Earnings
            </h2>

            <p>
              Commission examples, earning illustrations and advertised rates
              are not guarantees of income.
            </p>

            <p>
              Actual earnings depend on qualifying referrals, completed
              bookings, customer behavior, cancellations, applicable
              commission rates and other factors.
            </p>

            <p>
              Partners should not represent a commission program as guaranteed
              income, employment or a passive-income investment opportunity.
            </p>
          </section>

          {/* 19 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. Fraud and Abuse
            </h2>

            <p>
              Wedding With India may investigate suspected referral fraud,
              duplicate attribution, self-referrals, fabricated bookings,
              chargeback abuse or other manipulation of the partner program.
            </p>

            <p>
              Pending commissions may be temporarily withheld while a
              reasonable investigation is conducted.
            </p>

            <p>
              Where misconduct is established, Wedding With India may reject
              affected commissions, reverse improperly paid commissions and
              suspend or terminate the partner relationship, subject to
              applicable law.
            </p>
          </section>

          {/* 20 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              20. Termination
            </h2>

            <p>
              Either party may end the partner relationship according to the
              applicable written agreement.
            </p>

            <p>
              Wedding With India may suspend or terminate a partner account
              where reasonably necessary, including for:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>fraud or suspected fraudulent activity;</li>
              <li>misleading advertising;</li>
              <li>material breach of this Agreement;</li>
              <li>misuse of customer information;</li>
              <li>unauthorized use of Wedding With India&apos;s brand;</li>
              <li>unlawful conduct;</li>
              <li>reputational or operational risk; or</li>
              <li>other grounds permitted by the applicable agreement.</li>
            </ul>
          </section>

          {/* 21 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              21. Effect of Termination
            </h2>

            <p>
              After termination, the partner must stop representing themselves
              as an active Wedding With India partner and stop using
              unauthorized brand materials, referral links and promotional
              materials.
            </p>

            <p>
              Commissions for qualifying transactions completed before
              termination will be handled according to the applicable
              commission terms, including any later cancellation, refund or
              chargeback adjustments.
            </p>

            <p>
              Confidentiality, privacy, intellectual-property and other
              provisions that are intended to survive termination will
              continue as applicable.
            </p>
          </section>

          {/* 22 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              22. Limitation of Authority
            </h2>

            <p>
              The partner has no authority to make representations, warranties,
              commitments or agreements on behalf of Wedding With India unless
              specifically authorized in writing.
            </p>

            <p>
              This limitation is important because the legal consequences of
              an agency relationship can depend on the authority actually given
              to a person and the circumstances of the relationship.
            </p>

            <p>
              Indian GST guidance separately addresses principal-agent
              relationships and identifies representative character as an
              important element in determining agency.
            </p>
          </section>

          {/* 23 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              23. Intellectual Property
            </h2>

            <p>
              Wedding With India retains its rights in its trademarks, website,
              software, written materials, photographs, graphics, training
              materials and other intellectual property, except where
              expressly stated otherwise.
            </p>

            <p>
              The partner receives only the limited permission necessary to
              participate in the referral program.
            </p>
          </section>

          {/* 24 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              24. Compliance With Law
            </h2>

            <p>
              Partners must comply with applicable laws and regulations
              relevant to their activities, including applicable consumer
              protection, advertising, privacy, tax, intellectual-property and
              electronic-commerce requirements.
            </p>

            <p>
              Partners are responsible for obtaining any professional,
              business or regulatory authorization required for the services
              they independently provide.
            </p>
          </section>

          {/* 25 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              25. Disputes and Governing Terms
            </h2>

            <p>
              The governing law, jurisdiction and dispute-resolution procedure
              applicable to an individual partner relationship should be
              specified in the partner&apos;s written agreement.
            </p>

            <p>
              Nothing in this public framework is intended to remove rights or
              remedies that cannot lawfully be excluded.
            </p>
          </section>

          {/* 26 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              26. Changes to the Partner Program
            </h2>

            <p>
              Wedding With India may modify its referral program, available
              campaigns, commission rates, technical attribution systems or
              eligibility requirements.
            </p>

            <p>
              Material contractual changes applicable to an existing partner
              relationship should be communicated through the applicable
              agreement or partner communication process.
            </p>
          </section>

          {/* Partner acknowledgement */}
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={21}
                className="mt-0.5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Partner acknowledgement
                </h2>

                <p>
                  Approved partners should review this framework, the
                  applicable commission schedule and any separate written
                  agreement before actively promoting Wedding With India.
                </p>

                <p>
                  Acceptance of a partner program or assignment may constitute
                  acceptance of applicable terms where the relevant onboarding
                  process expressly states so.
                </p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-6">
            <div className="flex items-start gap-3">
              <Mail
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Partner Support
                </h2>

                <p>
                  Questions about referrals, attribution, commission statements
                  or partnership terms should be directed through the official
                  partner support channel.
                </p>

                <a
                  href="mailto:partners@weddingwithindia.com"
                  className="text-[var(--color-brand-primary)] hover:underline font-semibold"
                >
                  partners@weddingwithindia.com
                </a>
              </div>
            </div>
          </section>

          {/* Legal notice */}
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
                  This page is a general partner-program framework and should
                  not be treated as a substitute for an executed commercial
                  agreement where one is required.
                </p>

                <p>
                  The actual legal and tax treatment of a partner relationship
                  depends on the parties, the services performed, authority
                  granted, payment arrangements, location and applicable law.
                </p>

                <p className="text-sm text-charcoal-600">
                  Before launching the commission program commercially,
                  Wedding With India should have the final partner agreement,
                  commission schedule, tax treatment, referral attribution
                  rules and consumer-facing disclosures reviewed by qualified
                  counsel and a tax professional.
                </p>
              </div>
            </div>
          </section>

          {/* Related policies */}
          <section className="pt-2 border-t border-warm-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <Link
                href="/terms"
                className="rounded-2xl border border-warm-200 p-4 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <FileText
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
                href="/trademark"
                className="rounded-2xl border border-warm-200 p-4 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <Briefcase
                  size={17}
                  className="text-[var(--color-brand-primary)] mb-2"
                  aria-hidden="true"
                />

                <p className="font-bold text-charcoal-900">
                  Brand Guidelines
                </p>

                <p className="text-xs text-charcoal-500 mt-1">
                  Approved use of Wedding With India branding.
                </p>
              </Link>

              <Link
                href="/privacy"
                className="rounded-2xl border border-warm-200 p-4 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <ShieldCheck
                  size={17}
                  className="text-[var(--color-brand-primary)] mb-2"
                  aria-hidden="true"
                />

                <p className="font-bold text-charcoal-900">
                  Privacy Policy
                </p>

                <p className="text-xs text-charcoal-500 mt-1">
                  Personal-data processing information.
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