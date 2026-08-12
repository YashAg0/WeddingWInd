import { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Host Family Agreement | Wedding With India",
  description:
    "Host Family Agreement covering eligibility, listing responsibilities, guest access, payments, cancellations, safety, privacy and host obligations on Wedding With India.",
  keywords: [
    "Wedding With India host agreement",
    "Indian wedding host agreement",
    "Wedding With India host family",
    "host Indian wedding experience",
    "Wedding With India host terms",
    "Indian wedding experience host",
  ],
  alternates: {
    canonical: "/host-agreement",
  },
  openGraph: {
    title: "Host Family Agreement | Wedding With India",
    description:
      "Terms and responsibilities for hosts offering eligible Indian wedding experiences through Wedding With India.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HostAgreementPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <FileText size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Host Family Agreement
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Terms governing the relationship between Wedding With India and
            hosts offering eligible Indian wedding experiences through the
            Platform.
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
              <ShieldCheck
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Before becoming a host
                </h2>

                <p>
                  By submitting a wedding or cultural experience for listing,
                  you agree to provide accurate information, comply with this
                  Agreement and follow the applicable host, safety, privacy and
                  booking requirements.
                </p>

                <p className="text-sm text-charcoal-600">
                  This Agreement governs the host relationship with Wedding With
                  India. A particular experience may also have additional
                  booking-specific terms, payout terms or operational
                  requirements.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Purpose of the Platform
            </h2>

            <p>
              Wedding With India operates a technology platform intended to
              connect eligible international travelers with Indian wedding and
              cultural experiences.
            </p>

            <p>
              The Platform may facilitate discovery, applications, bookings,
              communications, payments, verification and support.
            </p>

            <p>
              Unless expressly stated otherwise in writing, Wedding With India
              does not own, host, conduct or control the underlying wedding
              celebration and does not become the organizer of the host&apos;s
              private wedding merely because the experience is listed on the
              Platform.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Host Eligibility
            </h2>

            <p>
              A person applying to become a host must have the legal capacity
              and appropriate authority to participate in the applicable
              experience and agree to these terms.
            </p>

            <p>
              Where multiple family members or persons are responsible for an
              event, the person submitting the listing represents that they
              have obtained any permissions reasonably necessary to make the
              listing and participate in the host program.
            </p>

            <p>
              Wedding With India may decline, suspend or remove a host or
              experience where eligibility requirements are not satisfied.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Accurate Listing Information
            </h2>

            <p>
              Hosts must provide accurate and current information about the
              experience.
            </p>

            <p>This may include:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>wedding or celebration dates;</li>
              <li>ceremonies and activities available to guests;</li>
              <li>event location and meeting arrangements;</li>
              <li>number of available guest places;</li>
              <li>food and meal arrangements;</li>
              <li>dress or cultural requirements;</li>
              <li>age or participation restrictions;</li>
              <li>accessibility information;</li>
              <li>photography or privacy restrictions; and</li>
              <li>other information reasonably necessary for a guest to make an informed booking.</li>
            </ul>

            <p>
              Hosts must promptly update Wedding With India if material
              information changes after a listing has been published or booked.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Authority to Offer the Experience
            </h2>

            <p>
              The host represents that they have the necessary permission or
              authority to invite guests to the parts of the celebration
              described in the listing.
            </p>

            <p>
              A host must not offer access to a private venue, ceremony or
              activity where they do not have the appropriate authority or
              permission.
            </p>

            <p>
              If venue rules, family decisions, religious requirements or other
              circumstances restrict guest participation, the host must
              disclose those restrictions before accepting affected bookings.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Guest Access
            </h2>

            <p>
              A confirmed guest is entitled only to the access and inclusions
              expressly described in the applicable booking.
            </p>

            <p>
              Hosts are not required to provide access to private family areas,
              ceremonies, activities or facilities that were not included in
              the booking.
            </p>

            <p>
              Hosts may establish reasonable event rules concerning dress,
              photography, timing, restricted areas, religious customs,
              personal conduct and venue requirements.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Cultural and Religious Respect
            </h2>

            <p>
              Hosts should communicate reasonable cultural, religious and
              ceremonial expectations clearly before the experience.
            </p>

            <p>
              Guests may come from different cultural backgrounds and may not
              understand every custom. Hosts and guests are expected to act
              respectfully and avoid unnecessary hostility or humiliation.
            </p>

            <p>
              Nothing in this Agreement requires a host to permit conduct that
              violates religious requirements, reasonable venue rules,
              applicable law or legitimate safety requirements.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Host Safety Responsibilities
            </h2>

            <p>
              Hosts are responsible for taking reasonable precautions within
              their control to maintain a safe environment for guests during the
              applicable experience.
            </p>

            <p>
              Hosts must not knowingly expose guests to unreasonable or
              undisclosed hazards and must communicate material safety
              restrictions where reasonably necessary.
            </p>

            <p>
              Hosts should contact appropriate local emergency services in the
              event of an immediate emergency. Wedding With India is not a
              substitute for emergency services, police, medical providers or
              public authorities.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Prohibited Host Conduct
            </h2>

            <p>Hosts must not:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>harass, threaten or abuse guests;</li>
              <li>engage in violence or sexual misconduct;</li>
              <li>intentionally discriminate unlawfully;</li>
              <li>misrepresent the experience or its inclusions;</li>
              <li>request unauthorized payments from guests;</li>
              <li>misuse guest personal information;</li>
              <li>impersonate Wedding With India;</li>
              <li>circumvent Platform payment or booking controls to avoid applicable fees;</li>
              <li>use the Platform for unlawful activities; or</li>
              <li>intentionally create misleading listings or reviews.</li>
            </ul>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Guest Personal Information
            </h2>

            <p>
              Hosts may receive limited guest information necessary to operate
              a confirmed experience.
            </p>

            <p>
              Hosts must use that information only for legitimate purposes
              connected with the booking and must not sell, publish, distribute
              or otherwise misuse it.
            </p>

            <p>
              Hosts must take reasonable steps to protect guest information
              from unauthorized access and must promptly notify Wedding With
              India if they become aware of a serious privacy or security
              incident involving guest information.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Verification
            </h2>

            <p>
              Wedding With India may require hosts to complete verification
              before a listing is published, before a booking is accepted or
              at another point during the host relationship.
            </p>

            <p>
              Verification may include identity, contact, event, venue or
              other information reasonably necessary for safety, fraud
              prevention or platform operations.
            </p>

            <p>
              A verification status does not constitute a guarantee that the
              host, event or venue is risk-free or that the host will comply
              with this Agreement in the future.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Booking Acceptance
            </h2>

            <p>
              Hosts should accept a booking only when they reasonably expect to
              provide the experience described in the applicable listing.
            </p>

            <p>
              Once a booking is confirmed, the host should make reasonable
              efforts to honor the confirmed experience.
            </p>

            <p>
              A host must not knowingly accept more guests than the stated
              capacity or otherwise create a materially different experience
              from the one booked.
            </p>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Host Cancellation
            </h2>

            <p>
              Hosts should avoid cancelling confirmed bookings except where
              reasonably necessary.
            </p>

            <p>
              If a host must cancel or materially change an experience, the
              host should notify Wedding With India as soon as reasonably
              possible and provide accurate information about the circumstances.
            </p>

            <p>
              Repeated, unjustified or misleading cancellations may result in
              listing restrictions, suspension or removal from the host program.
            </p>

            <p>
              Any guest refund resulting from a host cancellation will be
              handled according to the applicable booking and refund terms.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Host Compensation and Platform Fees
            </h2>

            <p>
              Hosts receive compensation according to the applicable host
              payout terms displayed or agreed for the relevant experience.
            </p>

            <p>
              The applicable commercial arrangement may specify the booking
              price, platform fee, taxes, payment-processing costs, refunds,
              adjustments and the amount payable to the host.
            </p>

            <p>
              A generic percentage stated elsewhere on the website does not
              override the commercial terms applicable to a particular host
              agreement.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Payout Timing
            </h2>

            <p>
              Payouts are processed according to the applicable payment
              provider, host payout arrangement and booking terms.
            </p>

            <p>
              A payout may be delayed where reasonably necessary because of
              payment-provider processing, account verification, refunds,
              disputes, chargebacks, suspected fraud, legal requirements or
              other legitimate payment issues.
            </p>

            <p>
              Wedding With India does not guarantee that a payout will arrive
              within a particular number of hours unless the applicable host
              agreement expressly provides that commitment.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Taxes
            </h2>

            <p>
              Hosts are responsible for understanding and complying with tax
              obligations applicable to amounts they receive through the
              Platform.
            </p>

            <p>
              Depending on the host&apos;s circumstances and applicable law,
              taxes, withholding, reporting or invoicing requirements may apply.
            </p>

            <p>
              Wedding With India may provide transaction information or
              applicable documentation where legally required or operationally
              appropriate.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Payments Outside the Platform
            </h2>

            <p>
              Hosts must not intentionally request or encourage guests to move
              payments outside the official booking process for the purpose of
              avoiding applicable Platform fees or controls.
            </p>

            <p>
              Any legitimate additional charge must be clearly disclosed and
              permitted under the applicable booking terms.
            </p>
          </section>

          {/* 17 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Cancellations, Refunds and Adjustments
            </h2>

            <p>
              Hosts acknowledge that guest refunds may affect amounts otherwise
              payable to the host.
            </p>

            <p>
              Where a refund, chargeback, payment reversal or other legitimate
              adjustment relates to a host booking, Wedding With India may
              adjust unpaid or future amounts where permitted by the applicable
              agreement and law.
            </p>

            <p>
              Hosts will not be charged for arbitrary deductions. Any
              adjustment should have a legitimate contractual, transaction,
              fraud-prevention or legal basis.
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. Reviews and Guest Feedback
            </h2>

            <p>
              Guests may submit reviews or feedback concerning an experience.
            </p>

            <p>
              Hosts must not manipulate reviews, pressure guests to provide
              positive reviews, offer improper incentives for reviews or create
              fraudulent reviews.
            </p>

            <p>
              Wedding With India may moderate content that violates its
              policies or applicable law.
            </p>
          </section>

          {/* 19 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. Photography and Media
            </h2>

            <p>
              Hosts should clearly communicate reasonable photography and
              recording restrictions before or during the experience.
            </p>

            <p>
              Hosts must respect applicable privacy rights and must not
              intentionally expose guests&apos; private information without an
              appropriate legal basis or permission where required.
            </p>

            <p>
              Separate permission may be required before using an identifiable
              guest&apos;s image for commercial advertising or promotional
              purposes where required by applicable law.
            </p>
          </section>

          {/* 20 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              20. Intellectual Property
            </h2>

            <p>
              Hosts retain ownership of photographs, descriptions and other
              materials they own and provide to Wedding With India, subject to
              the rights necessary for the Platform to display and promote the
              applicable listing.
            </p>

            <p>
              Hosts must not submit content they do not have the right to use.
            </p>

            <p>
              Hosts grant Wedding With India a non-exclusive, worldwide,
              royalty-free license to use submitted listing content as
              reasonably necessary to operate, market and improve the relevant
              Platform and experience, subject to applicable law.
            </p>
          </section>

          {/* 21 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              21. Independent Relationship
            </h2>

            <p>
              Unless a separate written agreement expressly provides otherwise,
              hosting an experience does not make the host an employee, agent,
              partner, joint venturer or legal representative of Wedding With
              India.
            </p>

            <p>
              Hosts are responsible for their own conduct, obligations, taxes,
              permissions and legal compliance.
            </p>

            <p>
              Hosts must not represent that they have authority to bind Wedding
              With India to contracts or commitments unless expressly authorized
              in writing.
            </p>
          </section>

          {/* 22 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              22. Compliance With Law
            </h2>

            <p>
              Hosts must comply with applicable laws and regulations relevant to
              their participation, including requirements concerning safety,
              taxation, consumer protection, privacy, venue use, food,
              hospitality, alcohol, transportation and other activities where
              applicable.
            </p>

            <p>
              Wedding With India does not provide legal, tax, immigration or
              regulatory advice to hosts.
            </p>

            <p>
              Hosts should obtain professional advice where their individual
              circumstances require it.
            </p>
          </section>

          {/* 23 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              23. Suspension and Removal
            </h2>

            <p>
              Wedding With India may restrict, suspend or remove a host or
              listing where reasonably necessary because of:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>suspected fraud;</li>
              <li>material breach of this Agreement;</li>
              <li>serious safety concerns;</li>
              <li>unlawful conduct;</li>
              <li>misleading information;</li>
              <li>repeated cancellations;</li>
              <li>payment abuse or circumvention;</li>
              <li>privacy or security violations; or</li>
              <li>other material risks to users or the Platform.</li>
            </ul>

            <p>
              Where appropriate and legally permitted, Wedding With India may
              provide the host an opportunity to respond to the relevant issue.
            </p>
          </section>

          {/* 24 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              24. Events Outside the Host&apos;s Control
            </h2>

            <p>
              Weddings may be affected by circumstances beyond a host&apos;s
              reasonable control, including serious illness, family emergency,
              severe weather, natural disasters, government restrictions,
              venue closure, transportation disruption, civil unrest or other
              comparable circumstances.
            </p>

            <p>
              Hosts should notify Wedding With India as soon as reasonably
              possible when such circumstances materially affect a confirmed
              experience.
            </p>
          </section>

          {/* 25 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              25. Liability
            </h2>

            <p>
              Hosts remain responsible for matters within their control,
              including the accuracy of their listing, their own conduct and
              compliance with applicable laws and agreements.
            </p>

            <p>
              To the extent permitted by applicable law, Wedding With India is
              not responsible for circumstances that it does not control,
              including independent host conduct, private wedding arrangements,
              third-party venues, transportation or other third-party
              services.
            </p>

            <p>
              Nothing in this Agreement excludes or limits liability that
              cannot lawfully be excluded or limited.
            </p>
          </section>

          {/* 26 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              26. Indemnification
            </h2>

            <p>
              To the extent permitted by applicable law, a host may be
              responsible for losses, claims or reasonable costs arising from
              the host&apos;s material breach of this Agreement, unlawful
              conduct, intentional misconduct or violation of another
              person&apos;s rights.
            </p>

            <p>
              Any indemnification obligation is subject to applicable law and
              the specific circumstances of the claim.
            </p>
          </section>

          {/* 27 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              27. Privacy and Data Protection
            </h2>

            <p>
              Personal information collected through the host program is
              handled according to the Wedding With India Privacy Policy and
              applicable data-protection requirements.
            </p>

            <p>
              Hosts must not retain or use guest personal information for
              unrelated purposes after the booking unless they have a lawful
              basis to do so.
            </p>

            <p>
              Hosts must promptly report suspected unauthorized access,
              disclosure or misuse of guest information where required under
              the applicable rules or Platform procedures.
            </p>
          </section>

          {/* 28 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              28. Changes to the Host Program
            </h2>

            <p>
              Wedding With India may modify host requirements, workflows,
              verification processes, payout procedures or other Platform
              features as the business develops.
            </p>

            <p>
              Material contractual changes will be communicated in accordance
              with applicable law and the relevant agreement.
            </p>
          </section>

          {/* 29 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              29. Governing Law and Disputes
            </h2>

            <p>
              Unless a separate written agreement states otherwise, this
              Agreement is governed by the laws applicable to the legal entity
              operating Wedding With India and the relevant transaction,
              subject to mandatory consumer or other legal protections that
              cannot be excluded.
            </p>

            <p>
              Any dispute-resolution mechanism applicable to a host will be
              identified in the applicable commercial or host agreement where
              required.
            </p>
          </section>

          {/* 30 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              30. Entire Host Agreement
            </h2>

            <p>
              This Agreement, together with any applicable host onboarding
              terms, payout terms, listing-specific requirements and other
              documents expressly incorporated into it, forms the basis of the
              host relationship with Wedding With India.
            </p>

            <p>
              If a specific signed or electronically accepted host agreement
              contains terms that conflict with this general policy, the
              specific agreement will control to the extent of the conflict,
              subject to applicable law.
            </p>
          </section>

          {/* Host checklist */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <h2 className="font-display font-bold text-lg text-charcoal-900 mb-4">
              Host responsibilities at a glance
            </h2>

            <div className="space-y-3">
              {[
                "Provide accurate information about the celebration.",
                "Only offer access you are authorized to provide.",
                "Honor confirmed bookings whenever reasonably possible.",
                "Treat guests respectfully and maintain reasonable safety standards.",
                "Protect guest information and use it only for legitimate purposes.",
                "Follow applicable laws, venue requirements and Platform policies.",
                "Report material changes, cancellations and serious incidents promptly.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                    size={19}
                    aria-hidden="true"
                  />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Important notice */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-amber-700"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Important
                </h2>

                <p>
                  Submission of a host application does not guarantee approval,
                  publication, bookings or earnings.
                </p>

                <p>
                  A host should not describe themselves as an official
                  representative, employee or agent of Wedding With India
                  unless Wedding With India has expressly authorized that
                  relationship in writing.
                </p>

                <p className="text-sm text-charcoal-600">
                  This Agreement should be read together with the Terms of
                  Service, Privacy Policy, Refund & Payment Protection Policy,
                  Safety & Security Standards and any specific host payout or
                  commercial agreement applicable to the host.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              Last updated: August 13, 2026. Wedding With India may update this
              Agreement as its platform, host program, operational procedures
              and applicable legal requirements evolve.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}