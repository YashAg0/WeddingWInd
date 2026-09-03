import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe2,
  Mail,
  Scale,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "DPDP Act & India Privacy Rights",
  description:
    "Learn how WeddingWithIndia approaches personal data protection under India's Digital Personal Data Protection Act, 2023, including notices, consent, security, and user rights.",
  keywords: [
    "WeddingWithIndia DPDP",
    "DPDP Act 2023",
    "India data protection",
    "Digital Personal Data Protection Act",
    "WeddingWithIndia privacy",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/trust?tab=privacy#dpdp",
  },
  openGraph: {
    title: "DPDP Act & India Privacy Rights | WeddingWithIndia",
    description:
      "Information about personal data protection and privacy rights for users of WeddingWithIndia in India.",
    url: "https://weddingwithindia.com/trust?tab=privacy#dpdp",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DPDP Act & India Privacy Rights | WeddingWithIndia",
    description:
      "Information about personal data protection and privacy rights for users of WeddingWithIndia in India.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function DPDPPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Scale size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            DPDP Act & India Privacy Rights
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            How Wedding With India approaches personal-data protection under
            India&apos;s Digital Personal Data Protection framework and other
            applicable privacy requirements.
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
                  Our approach to Indian data protection
                </h2>

                <p>
                  Wedding With India recognizes the importance of protecting
                  personal data and aims to process personal information
                  lawfully, transparently and securely.
                </p>

                <p>
                  Where the Digital Personal Data Protection Act, 2023
                  (&ldquo;DPDP Act&rdquo;) and applicable rules apply to our
                  processing, we intend to implement the applicable requirements
                  in accordance with their respective commencement dates and
                  legal scope.
                </p>

                <p className="text-sm text-charcoal-600">
                  This page should be read together with our{" "}
                  <Link
                    href="/privacy"
                    className="text-[var(--color-brand-primary)] hover:underline font-semibold"
                  >
                    Privacy Policy
                  </Link>
                  , which provides the broader explanation of how personal data
                  is collected and used.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. India&apos;s DPDP Framework
            </h2>

            <p>
              India&apos;s Digital Personal Data Protection Act, 2023 establishes
              a legal framework for the processing of digital personal data.
            </p>

            <p>
              The Digital Personal Data Protection Rules, 2025 were notified by
              the Ministry of Electronics and Information Technology in
              November 2025. The Act and Rules provide for phased commencement
              of different provisions rather than treating every obligation as
              effective on the same date.
            </p>

            <p>
              Wedding With India will update its operational practices as the
              applicable provisions become effective and as additional
              regulatory guidance develops.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Personal Data We May Process
            </h2>

            <p>
              Depending on how you use the Platform, we may process information
              such as:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>name and contact details;</li>
              <li>account and authentication information;</li>
              <li>booking and transaction information;</li>
              <li>communication and support records;</li>
              <li>technical, device and usage information;</li>
              <li>preferences relevant to your use of the Platform;</li>
              <li>
                information required for applicable identity or safety
                verification; and
              </li>
              <li>
                other personal information described in the applicable privacy
                notice.
              </li>
            </ul>

            <p>
              We aim to collect information that is reasonably relevant to the
              purpose for which it is being processed.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Notice and Transparency
            </h2>

            <p>
              We aim to provide users with clear information about relevant
              personal-data processing at or before the applicable collection
              or processing stage, as required by applicable law.
            </p>

            <p>
              Depending on the feature involved, the applicable notice may
              explain the categories of information collected, the purpose of
              processing and how users can exercise applicable rights.
            </p>

            <p>
              We do not intend for this page alone to replace a feature-specific
              privacy notice where a separate notice is legally or operationally
              appropriate.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Consent
            </h2>

            <p>
              Where consent is the applicable basis for processing personal data,
              Wedding With India will seek consent through an appropriate
              mechanism and provide information required by applicable law.
            </p>

            <p>
              Consent will not be described as the basis for every processing
              activity merely because personal data is being collected.
              Different processing activities may have different legal
              requirements or lawful grounds.
            </p>

            <p>
              Where consent is relied upon, applicable withdrawal mechanisms
              will be made available subject to the law and circumstances.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Why We Process Personal Data
            </h2>

            <p>
              Depending on the service, personal data may be processed for
              purposes such as:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>creating and managing user accounts;</li>
              <li>facilitating wedding-experience bookings;</li>
              <li>communicating with travelers, hosts and partners;</li>
              <li>processing and reconciling transactions;</li>
              <li>identity, account or booking verification;</li>
              <li>fraud prevention and platform security;</li>
              <li>customer support;</li>
              <li>improving platform functionality;</li>
              <li>meeting applicable legal or regulatory requirements; and</li>
              <li>other purposes disclosed through the applicable privacy notice.</li>
            </ul>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Identity Verification Information
            </h2>

            <p>
              Certain experiences or platform functions may require identity or
              other verification.
            </p>

            <p>
              Depending on the actual verification process, information may
              include government-issued identification or other information
              necessary to establish identity, prevent fraud, support safety or
              meet applicable requirements.
            </p>

            <p>
              We do not represent that every user must provide PAN, Aadhaar,
              passport information or another specific government identifier.
              The information requested depends on the applicable process and
              legitimate purpose.
            </p>

            <div className="flex items-start gap-3 rounded-2xl bg-warm-50 border border-warm-200 p-5">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-amber-700"
                aria-hidden="true"
              />

              <p className="text-sm text-charcoal-600 leading-relaxed">
                Users should not upload identity documents through an
                unofficial email address, social-media account or other channel
                claiming to represent Wedding With India.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Payment and Financial Information
            </h2>

            <p>
              Where you make or receive payments through Wedding With India,
              transaction-related information may be processed to facilitate
              payments, refunds, reconciliation, fraud prevention and
              applicable reporting obligations.
            </p>

            <p>
              Payment-card information may be handled by the payment service
              provider used for the relevant transaction rather than stored
              directly by Wedding With India, depending on the payment
              integration actually used.
            </p>

            <p>
              Our privacy notices may identify relevant payment providers where
              required or appropriate.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Data Security
            </h2>

            <p>
              We aim to implement reasonable technical and organizational
              measures appropriate to the nature and risk of the personal data
              we process.
            </p>

            <p>
              Depending on the system, these measures may include access
              controls, authentication, encryption where appropriate, logging,
              secure storage, vendor controls and other security practices.
            </p>

            <p>
              No online service can guarantee that information will be
              completely immune from unauthorized access or security incidents.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Data Retention
            </h2>

            <p>
              We aim to retain personal data only for as long as reasonably
              necessary for the purposes for which it is processed or as
              required or permitted by applicable law.
            </p>

            <p>
              Retention periods may depend on the type of information, account
              status, transaction history, legal obligations, fraud-prevention
              requirements, disputes and other legitimate operational needs.
            </p>

            <p>
              Deleting an account does not necessarily mean that every record
              can be immediately deleted where applicable law requires or
              permits continued retention.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Sharing With Service Providers
            </h2>

            <p>
              Wedding With India may use third-party service providers to
              operate the Platform.
            </p>

            <p>These may include providers supporting:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>cloud hosting and infrastructure;</li>
              <li>authentication;</li>
              <li>databases and storage;</li>
              <li>payments;</li>
              <li>email and communications;</li>
              <li>analytics;</li>
              <li>security and fraud prevention;</li>
              <li>identity verification; and</li>
              <li>customer-support functions.</li>
            </ul>

            <p>
              We seek to use appropriate contractual, organizational and
              technical safeguards for service providers processing personal
              data on our behalf, as required by applicable law.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. International Data Transfers
            </h2>

            <div className="flex items-start gap-3">
              <Globe2
                size={20}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Wedding With India may use infrastructure or service
                  providers located outside India.
                </p>

                <p>
                  Where personal data is transferred across jurisdictions, we
                  will take the measures required by applicable Indian
                  data-protection law and any other applicable privacy regime.
                </p>

                <p>
                  International travelers may also be subject to additional
                  privacy protections depending on their location and the
                  circumstances of the processing.
                </p>
              </div>
            </div>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Your Privacy Rights
            </h2>

            <p>
              Subject to applicable law and the relevant commencement of legal
              provisions, individuals may have rights concerning their personal
              data, including rights relating to:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>access to information about processing;</li>
              <li>correction or updating of inaccurate information;</li>
              <li>deletion or erasure where legally applicable;</li>
              <li>withdrawal of consent where consent is the applicable basis;</li>
              <li>grievance redressal; and</li>
              <li>other rights provided by applicable law.</li>
            </ul>

            <p>
              The exact scope and procedure for exercising a right depends on
              the applicable legal provision, the processing activity and the
              circumstances of the request.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. How to Submit a Privacy Request
            </h2>

            <p>
              For privacy requests, account-data questions or requests
              concerning your personal information, contact:
            </p>

            <a
              href="mailto:contact@weddingwithindia.com"
              className="inline-flex items-center gap-2 text-[var(--color-brand-primary)] hover:underline font-semibold"
            >
              <Mail size={17} aria-hidden="true" />
              contact@weddingwithindia.com
            </a>

            <p>
              Please provide enough information for us to understand the
              request and identify the relevant account or data.
            </p>

            <p>
              We may request reasonable information to verify the identity of
              the requester before disclosing or modifying personal information,
              particularly where the request concerns sensitive account or
              identity information.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Grievance Redressal
            </h2>

            <p>
              Wedding With India aims to provide an accessible mechanism for
              privacy-related concerns and complaints.
            </p>

            <p>
              Users may contact the privacy team using the contact information
              provided on this page or through the applicable support channel
              associated with their account.
            </p>

            <p>
              Where applicable law requires a specific grievance mechanism,
              designated contact or response process, Wedding With India will
              maintain the relevant process in accordance with the applicable
              requirements.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Children&apos;s Personal Data
            </h2>

            <p>
              Wedding With India is designed primarily for adults and travelers
              who can independently use the Platform.
            </p>

            <p>
              Where services involve children or information relating to
              children, additional requirements and safeguards may apply under
              applicable law.
            </p>

            <p>
              We do not intentionally request unnecessary personal information
              from children.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Personal Data Breaches
            </h2>

            <p>
              We maintain processes intended to identify, investigate and
              respond to security incidents involving personal data.
            </p>

            <p>
              Where applicable law requires notification to affected
              individuals, authorities or another party following a personal
              data breach, we will take the required steps within the applicable
              legal framework.
            </p>
          </section>

          {/* 17 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Cookies and Similar Technologies
            </h2>

            <p>
              Wedding With India may use cookies and similar technologies for
              essential functionality, authentication, preferences, security,
              analytics and other disclosed purposes.
            </p>

            <p>
              Where consent is legally required for a particular category of
              cookies or tracking, the applicable consent mechanism will be
              provided.
            </p>

            <p>
              For more information, see our{" "}
              <Link
                href="/cookies"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. Relationship With Other Privacy Laws
            </h2>

            <p>
              Wedding With India may serve travelers, hosts and other users
              located in different countries.
            </p>

            <p>
              Depending on the circumstances, processing may be subject to
              privacy laws in addition to India&apos;s DPDP framework, including
              laws applicable to individuals in the European Economic Area or
              other jurisdictions.
            </p>

            <p>
              Our{" "}
              <Link
                href="/gdpr"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                GDPR & EU Privacy Rights
              </Link>{" "}
              page provides additional information for processing to which the
              GDPR applies.
            </p>
          </section>

          {/* 19 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. Changes to This Notice
            </h2>

            <p>
              We may update this page as our services, technology, data
              practices, legal obligations or regulatory requirements change.
            </p>

            <p>
              Where applicable law requires additional notice or consent for a
              material change, we will use an appropriate mechanism to provide
              it.
            </p>
          </section>

          {/* Compliance principles */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-6">
            <h2 className="font-display font-bold text-lg text-charcoal-900 mb-5">
              Our privacy principles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  title: "Purpose-focused",
                  text: "Collect and use information for legitimate and disclosed purposes.",
                },
                {
                  title: "Data minimization",
                  text: "Avoid collecting information that is unnecessary for the relevant purpose.",
                },
                {
                  title: "Security",
                  text: "Use reasonable safeguards appropriate to the information and associated risks.",
                },
                {
                  title: "Transparency",
                  text: "Explain material data practices in clear and accessible language.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                    aria-hidden="true"
                  />

                  <div>
                    <h3 className="font-semibold text-charcoal-900">
                      {item.title}
                    </h3>

                    <p className="text-sm text-charcoal-500 mt-1 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
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
                  This page describes Wedding With India&apos;s intended privacy
                  and data-protection approach. It should not be interpreted as
                  a certification, legal opinion or guarantee that every
                  provision of the DPDP Act applies to every user or processing
                  activity.
                </p>

                <p>
                  The applicability and commencement of specific obligations
                  depend on the relevant law, rules, notifications and
                  circumstances.
                </p>

                <p className="text-sm text-charcoal-600">
                  Nothing on this page is intended to exclude, reduce or
                  contract out of a mandatory legal right or obligation.
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
                  Privacy contact
                </h2>

                <p>
                  For questions or requests concerning personal information,
                  contact:
                </p>

                <a
                  href="mailto:contact@weddingwithindia.com"
                  className="inline-flex items-center gap-2 text-[var(--color-brand-primary)] hover:underline font-semibold"
                >
                  contact@weddingwithindia.com
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              Last updated: August 13, 2026. This notice may be updated as
              Wedding With India&apos;s services, infrastructure and applicable
              privacy requirements evolve.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}