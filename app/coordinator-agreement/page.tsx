import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Coordinator Agreement",
  description:
    "Coordinator engagement terms covering event duties, guest support, conduct, confidentiality, and safety escalation on WeddingWithIndia.",
  keywords: [
    "WeddingWithIndia coordinator agreement",
    "event coordinator agreement",
    "wedding event coordinator",
    "WeddingWithIndia coordinator",
    "event operations agreement",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/coordinator-agreement",
  },
  openGraph: {
    title: "Coordinator Agreement | WeddingWithIndia",
    description:
      "Terms and operational standards for WeddingWithIndia experience coordinators.",
    url: "https://weddingwithindia.com/coordinator-agreement",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coordinator Agreement | WeddingWithIndia",
    description:
      "Terms and operational standards for WeddingWithIndia experience coordinators.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CoordinatorAgreementPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <UserCheck size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Coordinator Agreement
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Operational terms, responsibilities and conduct standards for
            Wedding With India experience coordinators.
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
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Important engagement notice
                </h2>

                <p>
                  This page describes the general operating framework for
                  Wedding With India coordinators. An individual coordinator
                  assignment may be subject to a separate written assignment
                  confirmation containing the applicable date, location,
                  duties, compensation and other terms.
                </p>

                <p>
                  Applying to or joining a coordinator roster does not
                  guarantee any assignment, minimum number of assignments,
                  minimum income or continued engagement.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Role of the Coordinator
            </h2>

            <p>
              A Wedding With India experience coordinator provides designated
              on-ground guest-support and event-coordination services for an
              accepted assignment.
            </p>

            <p>
              The coordinator may assist international guests with arrival,
              orientation, event schedules, cultural guidance, communication
              and other practical matters specified in the assignment
              briefing.
            </p>

            <p>
              A coordinator does not independently operate, own or manage the
              wedding, venue, host family or Wedding With India Platform.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Scope of Duties
            </h2>

            <p>
              Depending on the assignment, coordinator responsibilities may
              include:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>welcoming assigned guests at the agreed meeting point;</li>
              <li>
                helping guests understand the event schedule and venue
                arrangements;
              </li>
              <li>
                providing cultural and etiquette information supplied by
                Wedding With India or the host;
              </li>
              <li>
                assisting with reasonable guest-facing logistical questions;
              </li>
              <li>
                communicating relevant operational information between guests,
                hosts and the Wedding With India operations team;
              </li>
              <li>
                assisting with agreed check-in or guest-list procedures;
              </li>
              <li>
                reporting operational problems to the designated contact; and
              </li>
              <li>
                completing reasonable post-event reporting requested for the
                assignment.
              </li>
            </ul>

            <p>
              The exact scope of duties may vary according to the event and
              will be communicated before or during the relevant assignment.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Guest Check-In
            </h2>

            <p>
              Where a check-in process is part of the assignment, the
              coordinator may be asked to verify booking information, scan or
              validate an event pass, confirm the assigned guest list or
              perform another designated operational check.
            </p>

            <p>
              Coordinators must not independently admit, reject or remove a
              person from an event based solely on personal judgment unless
              specifically authorized by the event briefing or required by
              immediate safety circumstances.
            </p>

            <p>
              Questions concerning disputed bookings, identity verification,
              refunds or admission eligibility should be escalated to the
              designated Wedding With India contact or venue authority.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Cultural and Guest Support
            </h2>

            <p>
              Coordinators are expected to provide respectful, culturally
              sensitive assistance to international guests.
            </p>

            <p>
              This may include explaining ceremony etiquette, appropriate
              attire, event timing, venue arrangements and other information
              provided through the applicable experience.
            </p>

            <p>
              Coordinators must not present personal opinions as official
              Wedding With India policy or make guarantees concerning visas,
              immigration, medical treatment, transportation, refunds,
              accommodation or other services outside their authority.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Safety and Emergency Escalation
            </h2>

            <p>
              Coordinators are not medical professionals, police officers,
              security guards, immigration advisers or emergency-response
              professionals unless separately qualified and expressly engaged
              for such a role.
            </p>

            <p>
              If a serious incident occurs, the coordinator should prioritize
              immediate safety and contact the appropriate local emergency
              service where necessary, followed by the designated Wedding With
              India operational contact as soon as reasonably practicable.
            </p>

            <p>
              Serious incidents may include medical emergencies, fire,
              violence, threats, missing persons, suspected criminal activity
              or another situation presenting an immediate risk to a person.
            </p>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-amber-700"
                aria-hidden="true"
              />

              <p className="text-sm text-amber-900 leading-relaxed">
                A coordinator must not delay contacting appropriate emergency
                services in order to first obtain approval from Wedding With
                India.
              </p>
            </div>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Professional Conduct
            </h2>

            <p>
              Coordinators must behave professionally and respectfully at all
              times while performing an assignment.
            </p>

            <p>Prohibited conduct includes, without limitation:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>harassment, intimidation or discriminatory conduct;</li>
              <li>unwanted sexual conduct or inappropriate advances;</li>
              <li>
                consuming alcohol or controlled substances while performing
                assigned duties where doing so would impair performance or
                violate venue or assignment rules;
              </li>
              <li>threatening or abusive behavior;</li>
              <li>
                requesting unauthorized payments, tips or personal fees from
                guests;
              </li>
              <li>
                using guest information for personal purposes;
              </li>
              <li>
                misrepresenting authority or making unauthorized commitments
                on behalf of Wedding With India; and
              </li>
              <li>
                engaging in conduct that creates an unreasonable safety,
                reputational or operational risk.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. No Unauthorized Authority
            </h2>

            <p>
              A coordinator has only the authority expressly granted for the
              applicable assignment.
            </p>

            <p>
              Unless specifically authorized in writing or in the assignment
              briefing, a coordinator may not:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>sign contracts on behalf of Wedding With India;</li>
              <li>promise refunds or compensation;</li>
              <li>change booking terms;</li>
              <li>collect customer payments outside approved systems;</li>
              <li>
                represent that they are an owner, director or legal
                representative of Wedding With India;
              </li>
              <li>
                make public statements on behalf of Wedding With India; or
              </li>
              <li>
                bind Wedding With India to an obligation with a third party.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Confidentiality
            </h2>

            <p>
              Coordinators may receive confidential information relating to
              guests, hosts, bookings, venues, pricing, internal processes and
              other Platform operations.
            </p>

            <p>
              Such information must be used only for the relevant assignment
              and must not be disclosed to an unauthorized person.
            </p>

            <p>
              This obligation continues after the coordinator&apos;s
              assignment or relationship with Wedding With India ends, subject
              to applicable law.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Personal Data and Privacy
            </h2>

            <p>
              Coordinators may have access to limited personal information
              necessary to perform an assignment, such as a guest name,
              booking reference, meeting information or contact information.
            </p>

            <p>
              Such information must only be accessed and used for legitimate
              assignment purposes and must not be copied, sold, published or
              shared for personal use.
            </p>

            <p>
              Coordinators must follow applicable Wedding With India privacy
              instructions and immediately report suspected loss, unauthorized
              disclosure or misuse of personal information.
            </p>

            <p>
              See our{" "}
              <Link
                href="/privacy"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                Privacy Policy
              </Link>{" "}
              for additional information.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Photography, Video and Social Media
            </h2>

            <p>
              Coordinators must not photograph, record or publish identifiable
              guest information or private event material for personal or
              commercial purposes where doing so would violate applicable law,
              privacy rights, venue rules, host instructions or Wedding With
              India policies.
            </p>

            <p>
              Any official photography, video capture or social-media activity
              must follow the applicable event instructions and permissions.
            </p>

            <p>
              Coordinators must not imply that a guest has provided consent
              merely because the guest attended the wedding.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Compensation
            </h2>

            <p>
              Compensation for an accepted assignment will be communicated in
              the applicable assignment confirmation.
            </p>

            <p>
              The coordinator is responsible for reviewing the applicable rate,
              assignment duration, approved expenses and payment conditions
              before accepting an assignment.
            </p>

            <p>
              No compensation is owed merely because a person has submitted an
              application or joined a coordinator roster unless otherwise
              agreed in writing.
            </p>

            <p>
              Applicable taxes, deductions, invoicing requirements and other
              financial obligations will be handled according to the actual
              engagement and applicable law.
            </p>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Assignment Acceptance and Cancellation
            </h2>

            <p>
              A coordinator may accept or decline a proposed assignment before
              accepting it, subject to any separately agreed terms.
            </p>

            <p>
              Once an assignment has been accepted, the coordinator is expected
              to attend and perform the agreed duties unless circumstances
              reasonably prevent performance.
            </p>

            <p>
              If a coordinator cannot attend, they must notify the designated
              Wedding With India contact as soon as reasonably possible.
            </p>

            <p>
              Repeated failure to attend accepted assignments without adequate
              notice may affect eligibility for future assignments.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Expenses and Travel
            </h2>

            <p>
              Travel, accommodation, meals, communication expenses and other
              costs are not automatically reimbursable.
            </p>

            <p>
              Only expenses expressly approved under the applicable assignment
              terms should be treated as reimbursable expenses.
            </p>

            <p>
              Coordinators should obtain written confirmation before incurring
              material expenses on behalf of Wedding With India.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Intellectual Property
            </h2>

            <p>
              Wedding With India&apos;s trademarks, software, brand materials,
              training materials, documentation and other proprietary
              materials remain the property of their respective rights holders.
            </p>

            <p>
              Coordinators may use such materials only for authorized
              assignment purposes and must not reproduce or commercially exploit
              them without permission.
            </p>

            <p>
              Any separately agreed ownership or licence terms concerning
              content created during an assignment will be governed by the
              applicable written agreement.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Conflicts of Interest
            </h2>

            <p>
              Coordinators should disclose any material conflict of interest
              that could reasonably affect an assignment.
            </p>

            <p>
              Coordinators must not use access to Wedding With India guests,
              hosts or business relationships to independently solicit business
              in a misleading or unauthorized manner.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Indemnification and Responsibility
            </h2>

            <p>
              To the extent permitted by applicable law and any applicable
              assignment agreement, a coordinator may be responsible for losses
              arising from their own unauthorized acts, willful misconduct,
              fraud, gross negligence or material breach of their obligations.
            </p>

            <p>
              Nothing in this page is intended to exclude liability that cannot
              lawfully be excluded or limited.
            </p>
          </section>

          {/* 17 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Incident Reporting
            </h2>

            <p>
              Coordinators should promptly report material incidents arising
              during an assignment, including:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>guest injuries or medical emergencies;</li>
              <li>security or safety incidents;</li>
              <li>lost or missing guests;</li>
              <li>serious disputes or threats;</li>
              <li>suspected fraud or unauthorized access;</li>
              <li>privacy or data incidents; and</li>
              <li>significant event or venue disruptions.</li>
            </ul>

            <p>
              Incident reports should contain factual information and avoid
              unnecessary speculation.
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. Suspension or Termination
            </h2>

            <p>
              Wedding With India may suspend or remove a coordinator from the
              roster or terminate an applicable engagement where reasonably
              appropriate, including for:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>serious misconduct;</li>
              <li>fraud or dishonesty;</li>
              <li>material breach of applicable terms;</li>
              <li>misuse of personal data;</li>
              <li>unauthorized representation of Wedding With India;</li>
              <li>repeated failure to perform accepted assignments; or</li>
              <li>other circumstances permitted by the applicable agreement.</li>
            </ul>

            <p>
              Any termination rights will remain subject to applicable law and
              the terms of the relevant engagement.
            </p>
          </section>

          {/* 19 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. Independent Engagement
            </h2>

            <p>
              Where an assignment is expressly entered into as an independent
              service engagement, the parties intend that the relationship will
              be governed by the applicable written agreement and the actual
              circumstances of the engagement.
            </p>

            <p>
              The label used by the parties is not intended to override
              mandatory employment, labour, tax, social-security or other legal
              requirements that may apply based on the actual relationship.
            </p>

            <p>
              Nothing on this page creates a partnership, joint venture or
              general agency relationship unless expressly agreed in writing.
            </p>
          </section>

          {/* 20 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              20. Compliance With Law and Venue Rules
            </h2>

            <p>
              Coordinators must comply with applicable laws, lawful venue
              instructions and reasonable event rules while performing an
              assignment.
            </p>

            <p>
              Coordinators must not assist guests or hosts in violating
              immigration, licensing, safety, alcohol, transportation,
              photography, privacy or other applicable requirements.
            </p>
          </section>

          {/* 21 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              21. Governing Law and Disputes
            </h2>

            <p>
              The governing law, jurisdiction, dispute-resolution process and
              other legal terms applicable to a coordinator engagement should be
              specified in the individual written coordinator agreement or
              assignment confirmation.
            </p>

            <p>
              Where this general policy does not specify a mandatory legal term,
              the applicable written agreement and applicable law will govern.
            </p>
          </section>

          {/* 22 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              22. Changes to This Agreement
            </h2>

            <p>
              Wedding With India may update general coordinator operating
              standards from time to time.
            </p>

            <p>
              Material contractual changes applicable to an existing
              engagement should be communicated through the appropriate
              contractual or assignment process.
            </p>
          </section>

          {/* Coordinator acknowledgement */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Coordinator acknowledgement
                </h2>

                <p>
                  Before accepting an assignment, the coordinator should
                  review the applicable assignment details and any separate
                  agreement provided by Wedding With India.
                </p>

                <p>
                  Acceptance of an assignment may constitute acceptance of the
                  applicable terms where the agreement expressly provides for
                  such acceptance.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-warm-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <Mail
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Coordinator support
                </h2>

                <p>
                  Questions concerning an assignment, payment, conduct issue or
                  operational matter should be directed to the official
                  Wedding With India contact provided to the coordinator.
                </p>

                <p className="text-sm text-charcoal-500">
                  For privacy-related questions, contact{" "}
                  <a
                    href="mailto:contact@weddingwithindia.com"
                    className="text-[var(--color-brand-primary)] hover:underline font-semibold"
                  >
                    contact@weddingwithindia.com
                  </a>
                  .
                </p>
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
                  This webpage is a general operational framework and is not a
                  substitute for a properly executed coordinator services
                  agreement where one is required.
                </p>

                <p>
                  The legal treatment of an individual engagement can depend on
                  the actual facts, location, duration, control, payment
                  arrangements and other circumstances. Applicable employment,
                  labour, tax, social-security and other mandatory laws may
                  apply regardless of the terminology used by the parties.
                </p>

                <p className="text-sm text-charcoal-600">
                  Wedding With India should have this agreement and its
                  assignment-specific terms reviewed by qualified Indian
                  counsel before relying on them for commercial operations.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              Last updated: August 13, 2026. Wedding With India may update this
              framework as its operations, agreements and applicable legal
              requirements evolve.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}