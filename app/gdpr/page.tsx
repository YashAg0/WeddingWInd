import { Metadata } from "next";
import {
  AlertTriangle,
  Clock,
  Globe2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "GDPR & EU Privacy Rights | Wedding With India",
  description:
    "Learn about GDPR and EU/EEA privacy rights, lawful processing, international transfers, data access, deletion, objection and other privacy requests at Wedding With India.",
  keywords: [
    "Wedding With India GDPR",
    "Wedding With India EU privacy",
    "GDPR privacy rights",
    "EU data protection",
    "EEA privacy rights",
    "Wedding With India data protection",
  ],
  alternates: {
    canonical: "/gdpr",
  },
  openGraph: {
    title: "GDPR & EU Privacy Rights | Wedding With India",
    description:
      "Information about GDPR and EU/EEA privacy rights when using Wedding With India.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Lock size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            GDPR & EU Privacy Rights
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Information for individuals in the European Economic Area (EEA) and
            other users whose personal-data processing is subject to the
            European Union General Data Protection Regulation.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Last Updated: August 13, 2026</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">

          {/* Intro */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Our approach
                </h2>

                <p>
                  Wedding With India respects applicable data-protection laws
                  and aims to process personal information transparently,
                  securely and only for legitimate purposes.
                </p>

                <p>
                  Where the GDPR applies to our processing of your personal
                  information, we will provide the rights and protections
                  required by the GDPR, subject to applicable exceptions and
                  limitations.
                </p>

                <p className="text-sm text-charcoal-600">
                  This page supplements our{" "}
                  <a
                    href="/privacy"
                    className="text-[var(--color-brand-primary)] hover:underline font-semibold"
                  >
                    Privacy Policy
                  </a>
                  . The Privacy Policy contains the broader description of our
                  information practices.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. When GDPR May Apply
            </h2>

            <p>
              The GDPR may apply to Wedding With India even if the organization
              responsible for the processing is located outside the European
              Union, depending on the nature of the activities and the
              circumstances in which personal information is processed.
            </p>

            <p>
              For example, GDPR territorial rules can apply where an
              organization established outside the EU offers goods or services
              to individuals in the EU or monitors their behavior in
              circumstances covered by the GDPR.
            </p>

            <p>
              GDPR applicability is therefore not determined solely by a
              person&apos;s citizenship or nationality.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Personal Information We May Process
            </h2>

            <p>
              Depending on how you use Wedding With India, personal information
              may include:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>name and contact information;</li>
              <li>account and authentication information;</li>
              <li>booking and transaction information;</li>
              <li>preferences and communications;</li>
              <li>technical and device information;</li>
              <li>information required for identity verification;</li>
              <li>information necessary to prevent fraud or abuse; and</li>
              <li>
                other information described in our Privacy Policy.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. GDPR Lawful Bases
            </h2>

            <p>
              Where the GDPR applies, Wedding With India may rely on one or
              more lawful bases depending on the specific processing activity.
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Contract:</strong> where processing is necessary to
                provide a requested service or perform a contract.
              </li>

              <li>
                <strong>Legal obligation:</strong> where processing is
                necessary to comply with an applicable legal requirement.
              </li>

              <li>
                <strong>Legitimate interests:</strong> where processing is
                necessary for a legitimate interest and the applicable legal
                requirements and balancing considerations are satisfied.
              </li>

              <li>
                <strong>Consent:</strong> where consent is the appropriate
                lawful basis and applicable law requires or permits reliance on
                consent.
              </li>

              <li>
                <strong>Vital interests or other lawful bases:</strong> where
                applicable under the GDPR and the circumstances require it.
              </li>
            </ul>

            <p>
              The particular lawful basis depends on what information is being
              processed and why.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Your GDPR Rights
            </h2>

            <p>
              Where the GDPR applies, you may have the following rights,
              subject to applicable conditions and exceptions:
            </p>

            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-charcoal-900">
                  Right of access
                </h3>
                <p className="mt-1">
                  You may request confirmation of whether we process your
                  personal information and, where applicable, request access to
                  that information and certain related details.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-charcoal-900">
                  Right to rectification
                </h3>
                <p className="mt-1">
                  You may request correction of inaccurate or incomplete
                  personal information.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-charcoal-900">
                  Right to erasure
                </h3>
                <p className="mt-1">
                  In certain circumstances, you may request deletion of your
                  personal information.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-charcoal-900">
                  Right to restriction
                </h3>
                <p className="mt-1">
                  In certain circumstances, you may request that processing of
                  your personal information be restricted.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-charcoal-900">
                  Right to object
                </h3>
                <p className="mt-1">
                  You may have the right to object to certain processing,
                  including processing based on legitimate interests.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-charcoal-900">
                  Right to data portability
                </h3>
                <p className="mt-1">
                  In certain circumstances, you may request personal information
                  you provided to us in a structured, commonly used and
                  machine-readable format and request its transmission to
                  another controller where technically feasible and legally
                  applicable.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-charcoal-900">
                  Right to withdraw consent
                </h3>
                <p className="mt-1">
                  Where processing relies on consent, you may withdraw that
                  consent at any time. Withdrawal does not affect the
                  lawfulness of processing carried out before withdrawal.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-charcoal-900">
                  Rights concerning automated decision-making
                </h3>
                <p className="mt-1">
                  Where applicable, you may have rights concerning decisions
                  based solely on automated processing that produce legal or
                  similarly significant effects.
                </p>
              </div>
            </div>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Important Limitations on Privacy Rights
            </h2>

            <p>
              GDPR rights are not absolute. Applicable law may permit or
              require us to retain or process certain information despite a
              request.
            </p>

            <p>
              For example, information may need to be retained to comply with
              legal obligations, establish or defend legal claims, maintain
              transaction records, prevent fraud, protect security or exercise
              other legally recognized rights.
            </p>

            <p>
              Where we cannot fully comply with a request, we will explain the
              applicable reason where required by law.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. How to Submit a Privacy Request
            </h2>

            <p>
              You can submit a GDPR or privacy request by contacting:
            </p>

            <div className="flex items-center gap-3 rounded-xl border border-warm-200 bg-warm-50/60 px-4 py-3 w-fit">
              <Mail
                size={18}
                className="text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <a
                href="mailto:privacy@weddingwithindia.com"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                privacy@weddingwithindia.com
              </a>
            </div>

            <p>
              Please include enough information for us to understand your
              request and identify the relevant account or information.
            </p>

            <p>
              We may request reasonable additional information to verify your
              identity before providing personal information or carrying out
              certain requests.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Response Times
            </h2>

            <p>
              Where the GDPR applies, requests will generally be handled
              without undue delay and, in principle, within one month of
              receipt, subject to the circumstances and extensions permitted by
              the GDPR.
            </p>

            <p>
              If a request is particularly complex or involves multiple
              requests, the applicable response period may be extended where
              permitted by law. We will provide appropriate notice where
              required.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. International Data Transfers
            </h2>

            <div className="flex items-start gap-3">
              <Globe2
                size={20}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Wedding With India may use service providers and
                  infrastructure located outside the European Economic Area.
                </p>

                <p>
                  Where the GDPR applies and personal information is transferred
                  outside the EEA, we will use an appropriate transfer mechanism
                  and safeguards where required by applicable law.
                </p>

                <p>
                  Depending on the circumstances, this may include an adequacy
                  decision, Standard Contractual Clauses or another lawful
                  transfer mechanism recognized under applicable data-protection
                  law.
                </p>
              </div>
            </div>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Data Processors and Service Providers
            </h2>

            <p>
              Wedding With India may use third-party providers for functions
              such as hosting, databases, authentication, payments,
              communications, analytics, security and identity verification.
            </p>

            <p>
              Where these providers process personal information on our behalf,
              we seek to use appropriate contractual and technical safeguards
              required by applicable law.
            </p>

            <p>
              The specific providers used by the Platform may change over time
              as our technology infrastructure develops.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Data Protection by Design
            </h2>

            <p>
              We aim to incorporate privacy and security considerations into
              the design and operation of our services, including appropriate
              access controls, data minimization, retention practices and
              protection of personal information.
            </p>

            <p>
              The exact technical and organizational measures may vary by
              system and service provider.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Data Protection Officer
            </h2>

            <p>
              This page does not designate an individual as Wedding With
              India&apos;s Data Protection Officer merely by providing a privacy
              contact address.
            </p>

            <p>
              If Wedding With India is legally required to appoint a Data
              Protection Officer for a particular processing activity, the
              relevant appointment and contact details will be provided through
              the appropriate privacy notice.
            </p>

            <p>
              For general privacy requests, please contact:
            </p>

            <a
              href="mailto:privacy@weddingwithindia.com"
              className="inline-flex items-center gap-2 text-[var(--color-brand-primary)] hover:underline font-semibold"
            >
              <Mail size={16} aria-hidden="true" />
              privacy@weddingwithindia.com
            </a>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Automated Decision-Making
            </h2>

            <p>
              Wedding With India may use automated tools to help detect fraud,
              suspicious activity, security risks or policy violations.
            </p>

            <p>
              Automated tools may also be used to determine whether additional
              verification or review is appropriate.
            </p>

            <p>
              Where the GDPR provides rights concerning solely automated
              decisions producing legal or similarly significant effects, we
              will provide the applicable safeguards and rights required by
              law.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Security Incidents
            </h2>

            <p>
              We maintain reasonable processes for identifying, assessing and
              responding to security incidents involving personal information.
            </p>

            <p>
              Where the GDPR requires notification of a personal-data breach to
              a supervisory authority or affected individuals, Wedding With
              India will take appropriate action within the applicable legal
              requirements.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Complaints to a Supervisory Authority
            </h2>

            <p>
              If you believe that your personal information has been processed
              unlawfully or that your GDPR rights have not been respected, you
              generally have the right to lodge a complaint with a competent
              data-protection supervisory authority.
            </p>

            <p>
              You may generally contact the supervisory authority in the EU
              Member State of your habitual residence, place of work or the
              location of the alleged infringement, subject to the applicable
              rules.
            </p>

            <p>
              We encourage you to contact us first so that we have an
              opportunity to investigate and address your concern, but you are
              not required to give us that opportunity before exercising a
              regulatory complaint right where applicable.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Marketing and Consent
            </h2>

            <p>
              Where marketing communications require consent under applicable
              law, we will seek consent through an appropriate mechanism.
            </p>

            <p>
              Where processing relies on consent, you may withdraw consent at
              any time. Withdrawal does not affect processing that occurred
              lawfully before withdrawal.
            </p>

            <p>
              You may continue to receive essential transactional messages
              relating to bookings, security, account access or other services
              even after opting out of promotional communications.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Children
            </h2>

            <p>
              Wedding With India does not generally intend to independently
              collect personal information from children without the
              permissions or safeguards required by applicable law.
            </p>

            <p>
              Where a booking involves a child, additional requirements may
              apply depending on the circumstances and applicable law.
            </p>
          </section>

          {/* 17 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Retention and Erasure
            </h2>

            <p>
              We retain personal information for as long as reasonably necessary
              for the purposes described in our Privacy Policy or as required or
              permitted by applicable law.
            </p>

            <p>
              A request for deletion may therefore be subject to lawful
              retention requirements, including transaction records, fraud
              prevention, legal claims and regulatory obligations.
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. Verification Information
            </h2>

            <p>
              Certain experiences may require identity or other verification.
              Where GDPR applies, verification information will be processed
              only where there is an appropriate legal basis and for legitimate
              purposes such as identity confirmation, fraud prevention, safety
              or compliance.
            </p>

            <p>
              We aim to limit access to verification information to persons or
              providers who reasonably require access for the relevant purpose.
            </p>
          </section>

          {/* 19 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. Changes to This Notice
            </h2>

            <p>
              Wedding With India may update this GDPR and EU privacy notice as
              our services, technology, legal obligations or processing
              practices change.
            </p>

            <p>
              Material changes will be communicated through appropriate
              channels where required by applicable law.
            </p>
          </section>

          {/* Request CTA */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-6">
            <div className="flex items-start gap-3">
              <Mail
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Need to exercise a privacy right?
                </h2>

                <p>
                  Contact our privacy team with your request and we will handle
                  it according to the law applicable to your circumstances.
                </p>

                <a
                  href="mailto:privacy@weddingwithindia.com"
                  className="inline-flex items-center gap-2 text-[var(--color-brand-primary)] hover:underline font-semibold"
                >
                  privacy@weddingwithindia.com
                  <span aria-hidden="true">→</span>
                </a>
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
                  Important legal notice
                </h2>

                <p>
                  This page explains the privacy rights and protections that may
                  apply when the GDPR applies to Wedding With India&apos;s
                  processing of personal information. It is not a statement that
                  every provision of the GDPR applies to every user or every
                  processing activity.
                </p>

                <p>
                  Privacy requirements depend on the applicable jurisdiction,
                  processing activity, legal entity, service and circumstances.
                </p>

                <p className="text-sm text-charcoal-600">
                  Nothing on this page is intended to exclude or restrict a
                  mandatory right or protection that cannot lawfully be excluded
                  or restricted.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              Last updated: August 13, 2026. For privacy requests, contact{" "}
              <a
                href="mailto:privacy@weddingwithindia.com"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                privacy@weddingwithindia.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}