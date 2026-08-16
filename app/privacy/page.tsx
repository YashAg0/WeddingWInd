import { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe2,
  Lock,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how WeddingWithIndia collects, uses, protects, shares, retains, and manages personal information for guests, hosts, agents, and visitors.",
  keywords: [
    "WeddingWithIndia privacy policy",
    "WeddingWithIndia data protection",
    "Indian wedding platform privacy",
    "WeddingWithIndia personal data",
    "WeddingWithIndia GDPR",
    "WeddingWithIndia DPDP",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | WeddingWithIndia",
    description:
      "How WeddingWithIndia handles personal information, verification data, bookings, payments, communications, and cookies.",
    url: "https://weddingwithindia.com/privacy",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | WeddingWithIndia",
    description:
      "How WeddingWithIndia handles personal information, verification data, bookings, payments, and communications.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Shield size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Privacy Policy
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            This policy explains how Wedding With India handles personal
            information when you visit our website, create an account, make a
            booking, host an experience, communicate with us, or otherwise use
            our services.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Last Updated: August 13, 2026</span>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">

          {/* Important notice */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <div className="flex items-start gap-3">
              <Shield
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Your privacy matters
                </h2>

                <p>
                  Wedding With India is designed to connect travelers with
                  Indian wedding and cultural experiences. Operating this
                  service requires us to process certain personal information,
                  including information needed for accounts, bookings,
                  communications, payments, safety and, where applicable,
                  identity verification.
                </p>

                <p className="text-sm text-charcoal-600">
                  We aim to collect information that is reasonably necessary
                  for identified purposes, use it in a responsible manner,
                  protect it with appropriate safeguards and retain it only for
                  as long as reasonably necessary or required by law.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Who This Policy Applies To
            </h2>

            <p>
              This Privacy Policy applies to visitors, guests, hosts, agents,
              referral partners, applicants, account holders and other
              individuals who interact with Wedding With India through our
              website, applications, booking systems, communications or related
              services.
            </p>

            <p>
              It applies to personal information collected online and, where
              relevant, information collected through legitimate offline
              interactions connected with a Wedding With India service.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Who Is Responsible for Your Information
            </h2>

            <p>
              The entity operating the Wedding With India service is
              responsible for determining how and why personal information is
              processed for the purposes described in this policy.
            </p>

            <p>
              As Wedding With India grows, its legal operating entity,
              corporate structure and applicable privacy responsibilities may
              change. Where required, the applicable legal entity and relevant
              contact information will be identified through the Platform or
              applicable legal notices.
            </p>

            <p>
              For privacy questions or requests, contact:
            </p>

            <p>
              <a
                href="mailto:privacy@weddingwithindia.com"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                privacy@weddingwithindia.com
              </a>
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Information We May Collect
            </h2>

            <p>
              The information we collect depends on how you use Wedding With
              India and the services you request.
            </p>

            <h3 className="font-semibold text-charcoal-900">
              A. Account and contact information
            </h3>

            <ul className="list-disc pl-6 space-y-2">
              <li>name and preferred name;</li>
              <li>email address;</li>
              <li>mobile phone number;</li>
              <li>country or nationality where relevant to the service;</li>
              <li>account credentials or authentication information;</li>
              <li>profile information; and</li>
              <li>communications with Wedding With India.</li>
            </ul>

            <h3 className="font-semibold text-charcoal-900">
              B. Booking and experience information
            </h3>

            <ul className="list-disc pl-6 space-y-2">
              <li>booking requests and confirmations;</li>
              <li>number of guests;</li>
              <li>experience preferences;</li>
              <li>dietary or accessibility information you choose to provide;</li>
              <li>event participation information;</li>
              <li>cancellation and refund information; and</li>
              <li>messages relating to a booking.</li>
            </ul>

            <h3 className="font-semibold text-charcoal-900">
              C. Payment and transaction information
            </h3>

            <p>
              We may receive information relating to payments, such as
              transaction identifiers, payment status, amount, currency,
              billing information and refund status.
            </p>

            <p>
              Where payment processing is handled by a third-party payment
              provider, that provider may separately process payment-card or
              financial information under its own privacy terms and applicable
              legal requirements.
            </p>

            <h3 className="font-semibold text-charcoal-900">
              D. Identity and verification information
            </h3>

            <p>
              Depending on the service and applicable verification requirements,
              we may request information necessary to verify identity,
              authenticity, eligibility, event legitimacy or prevent fraud.
            </p>

            <p>
              This may include government-issued identification, passport
              information, photographs or other verification information where
              reasonably necessary and lawfully permitted.
            </p>

            <p>
              We do not require users to publicly display identity documents on
              their profiles.
            </p>

            <h3 className="font-semibold text-charcoal-900">
              E. Technical and usage information
            </h3>

            <ul className="list-disc pl-6 space-y-2">
              <li>IP address;</li>
              <li>browser and device information;</li>
              <li>operating system;</li>
              <li>approximate location derived from technical information where enabled;</li>
              <li>cookies and similar identifiers;</li>
              <li>pages and features accessed;</li>
              <li>referring URLs;</li>
              <li>error and diagnostic information; and</li>
              <li>security and fraud-related signals.</li>
            </ul>

            <h3 className="font-semibold text-charcoal-900">
              F. Information you voluntarily provide
            </h3>

            <p>
              You may choose to provide additional information through reviews,
              photographs, messages, feedback, support requests, host
              applications or other Platform features.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Information We Receive From Other Sources
            </h2>

            <p>
              In some circumstances, we may receive information from third
              parties where this is lawful and reasonably necessary for the
              service.
            </p>

            <p>This may include:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>payment providers;</li>
              <li>identity or verification providers;</li>
              <li>fraud-prevention services;</li>
              <li>authentication providers;</li>
              <li>analytics or technology providers;</li>
              <li>hosts or guests participating in the same booking;</li>
              <li>service providers acting on our behalf; and</li>
              <li>
                publicly available information where use of that information
                is lawful and appropriate.
              </li>
            </ul>

            <p>
              Where information is obtained from another source, we will
              provide additional information where required by applicable law.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Why We Use Personal Information
            </h2>

            <p>
              We may process personal information for the following purposes:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                to create and administer accounts;
              </li>
              <li>
                to facilitate bookings and experiences;
              </li>
              <li>
                to communicate with guests, hosts and partners;
              </li>
              <li>
                to verify identity or event information where required;
              </li>
              <li>
                to prevent fraud, abuse and unauthorized activity;
              </li>
              <li>
                to process payments, refunds and transaction records;
              </li>
              <li>
                to provide customer support;
              </li>
              <li>
                to improve website functionality and user experience;
              </li>
              <li>
                to monitor technical performance and security;
              </li>
              <li>
                to investigate complaints, incidents or policy violations;
              </li>
              <li>
                to comply with legal or regulatory obligations;
              </li>
              <li>
                to establish, exercise or defend legal claims;
              </li>
              <li>
                to send marketing communications where permitted and
                appropriately authorized; and
              </li>
              <li>
                for other purposes disclosed to you at the time information is
                collected.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Legal Bases and Lawful Processing
            </h2>

            <p>
              Depending on the applicable law and circumstances, we may process
              personal information because it is necessary to provide a
              requested service or perform a contract, because we have a legal
              obligation, because processing is necessary to protect legitimate
              interests where recognized by applicable law, to protect safety
              or prevent fraud, or because you have provided consent where
              consent is required.
            </p>

            <p>
              Consent is not necessarily the legal basis for every processing
              activity. Where consent is the applicable basis, we will provide
              an appropriate mechanism for providing or withdrawing consent
              subject to applicable law.
            </p>

            <p>
              For users to whom the GDPR applies, processing must have an
              appropriate lawful basis under the GDPR. The European Commission
              identifies bases including consent, contractual necessity, legal
              obligations, vital interests, public interest and legitimate
              interests where applicable.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Identity Verification
            </h2>

            <p>
              Some Wedding With India experiences may require additional
              verification before a booking is accepted or participation is
              permitted.
            </p>

            <p>
              Verification information is used for purposes such as confirming
              identity, reducing impersonation and fraud, protecting event
              participants, satisfying booking requirements and supporting
              platform safety.
            </p>

            <p>
              We aim to limit access to verification information to people or
              service providers who reasonably need it for the relevant
              purpose.
            </p>

            <p>
              Verification requirements may vary by experience, location,
              account type and risk level.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Sharing Personal Information
            </h2>

            <p>
              We do not sell personal information merely because you use
              Wedding With India.
            </p>

            <p>
              We may share information where reasonably necessary with:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                hosts and guests involved in the same confirmed booking, to the
                extent necessary to facilitate the experience;
              </li>
              <li>
                payment processors and financial service providers;
              </li>
              <li>
                identity and verification providers;
              </li>
              <li>
                cloud hosting, database, authentication and infrastructure
                providers;
              </li>
              <li>
                customer-support and communication providers;
              </li>
              <li>
                analytics and security providers;
              </li>
              <li>
                professional advisers such as lawyers, accountants or auditors
                where appropriate;
              </li>
              <li>
                competent government, regulatory or law-enforcement authorities
                where legally required or reasonably necessary; and
              </li>
              <li>
                other service providers acting on our behalf under appropriate
                contractual or legal arrangements.
              </li>
            </ul>

            <p>
              We seek to limit information shared with third parties to what is
              reasonably necessary for the relevant purpose.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Information Shared With Hosts and Guests
            </h2>

            <p>
              Wedding With India may need to share limited information between
              participants to operate a confirmed booking.
            </p>

            <p>
              The information shared may include a name, relevant booking
              details, arrival or participation information and other
              information reasonably necessary to coordinate the experience.
            </p>

            <p>
              We aim not to expose identity documents, payment credentials or
              unnecessary sensitive information to other participants.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Data Security
            </h2>

            <div className="flex items-start gap-3">
              <Lock
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={20}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  We use reasonable administrative, technical and organizational
                  safeguards designed to protect personal information against
                  unauthorized access, misuse, alteration, loss or disclosure.
                </p>

                <p>
                  Depending on the system involved, safeguards may include
                  authentication controls, access restrictions, encryption or
                  secure transmission mechanisms, logging, monitoring,
                  infrastructure security and other appropriate controls.
                </p>

                <p>
                  The exact technical controls may differ between systems and
                  service providers. No internet-connected system can be
                  guaranteed to be completely secure.
                </p>

                <p className="text-sm text-charcoal-600">
                  We will not describe a specific security feature as being
                  implemented unless it is actually implemented in the relevant
                  system.
                </p>
              </div>
            </div>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Data Retention
            </h2>

            <p>
              We retain personal information only for as long as reasonably
              necessary for the purposes described in this policy, to provide
              services, maintain legitimate business records, resolve
              disputes, prevent fraud, comply with legal obligations or
              establish and defend legal claims.
            </p>

            <p>
              Retention periods may vary depending on the type of information
              and purpose. For example, transaction and accounting records may
              need to be retained longer than ordinary marketing preferences.
            </p>

            <p>
              When information is no longer reasonably required and there is no
              applicable legal or legitimate reason to retain it, we will take
              appropriate steps to delete, anonymize or otherwise securely
              dispose of it, subject to technical and legal limitations.
            </p>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Account Deletion
            </h2>

            <p>
              Where account deletion functionality is available, you may
              request deletion through the applicable account controls or by
              contacting us.
            </p>

            <p>
              Deleting an account does not necessarily require immediate
              deletion of every record. We may retain information where
              reasonably necessary to comply with law, complete transactions,
              resolve disputes, prevent fraud, maintain security or establish
              and defend legal claims.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Cookies and Similar Technologies
            </h2>

            <p>
              Wedding With India may use cookies, local storage, pixels and
              similar technologies to operate the Platform, remember
              preferences, maintain sessions, understand usage, improve
              performance and support security.
            </p>

            <p>
              Cookies may be categorized into necessary, functional,
              analytics, preference or marketing technologies depending on the
              services implemented on the Platform.
            </p>

            <p>
              Where applicable law requires consent for non-essential cookies
              or similar technologies, we will provide an appropriate consent
              mechanism.
            </p>

            <p>
              Browser settings can also be used to restrict certain cookies,
              although doing so may affect functionality.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Analytics and Product Improvement
            </h2>

            <p>
              We may use analytics and technical information to understand how
              visitors use the Platform, identify errors, improve performance,
              evaluate features and make the service easier to use.
            </p>

            <p>
              Analytics providers may process technical or usage information on
              our behalf. The specific providers used may change as our
              infrastructure evolves.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Marketing Communications
            </h2>

            <p>
              We may send transactional communications necessary to operate
              your account or booking, including booking confirmations,
              cancellations, security notifications and support messages.
            </p>

            <p>
              Where required by applicable law, promotional or marketing
              communications will be sent only where an appropriate legal basis
              or consent exists.
            </p>

            <p>
              You can generally unsubscribe from marketing communications using
              the mechanism included in the message. Unsubscribing from
              marketing does not necessarily stop essential transactional
              communications.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. International Data Transfers
            </h2>

            <div className="flex items-start gap-3">
              <Globe2
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={20}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Wedding With India may use service providers or infrastructure
                  located in countries other than the country where you live.
                </p>

                <p>
                  Where personal information is transferred across borders, we
                  will apply safeguards required by applicable law.
                </p>

                <p>
                  For individuals protected by the GDPR, international
                  transfers may require an adequacy decision or another lawful
                  transfer mechanism and appropriate safeguards.
                </p>

                <p className="text-sm text-charcoal-600">
                  The location of specific infrastructure and service providers
                  may change as the Platform develops.
                </p>
              </div>
            </div>
          </section>

          {/* 17 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Children&apos;s Privacy
            </h2>

            <p>
              Wedding With India is not generally intended to independently
              collect or process personal information from children without the
              involvement and authorization required by applicable law.
            </p>

            <p>
              Where a booking or experience involves a child, additional
              requirements may apply, including appropriate parental or
              guardian authorization and additional safeguards.
            </p>

            <p>
              We will handle children&apos;s personal information in accordance
              with applicable legal requirements. Where we become aware that
              personal information has been collected contrary to applicable
              requirements, we will take reasonable steps to address the
              situation.
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. Reviews, Photos and User-Generated Content
            </h2>

            <p>
              If you voluntarily submit a review, photograph, video, comment,
              testimonial or other content, you remain responsible for ensuring
              that you have the rights and permissions necessary to submit it.
            </p>

            <p>
              Content submitted to the Platform may be visible to other users
              or the public depending on the feature and your settings.
            </p>

            <p>
              Wedding With India may process submitted content to operate,
              moderate, display and improve the relevant service and, where
              permitted, promote the Platform.
            </p>

            <p>
              Do not upload another person&apos;s private information,
              identification documents or sensitive material unless you are
              authorized to do so and the Platform specifically requires it.
            </p>
          </section>

          {/* 19 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. Automated Processing and Fraud Detection
            </h2>

            <p>
              We may use automated tools or rules to identify suspicious
              activity, prevent fraud, detect security threats, prioritize
              support issues or assess whether additional verification may be
              necessary.
            </p>

            <p>
              Where applicable law gives you rights concerning automated
              decision-making or profiling, we will provide the protections
              required by that law.
            </p>

            <p>
              For individuals covered by the GDPR, specific rights may apply to
              solely automated decisions that produce legal or similarly
              significant effects.
            </p>
          </section>

          {/* 20 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              20. Data Breaches and Security Incidents
            </h2>

            <p>
              We maintain processes designed to identify, investigate and
              respond to suspected security incidents involving personal
              information.
            </p>

            <p>
              Where a personal-data incident occurs, we will take reasonable
              containment and remediation measures and provide notifications to
              affected individuals or authorities where required by applicable
              law.
            </p>
          </section>

          {/* 21 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              21. Your Privacy Rights
            </h2>

            <p>
              Depending on your location and the law applicable to your
              information, you may have rights concerning your personal data.
            </p>

            <p>These may include rights to:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>request access to personal information;</li>
              <li>request correction of inaccurate information;</li>
              <li>request deletion where legally available;</li>
              <li>
                request restriction of processing where applicable;
              </li>
              <li>
                object to certain processing;
              </li>
              <li>
                withdraw consent where processing relies on consent;
              </li>
              <li>
                request portability where applicable;
              </li>
              <li>
                manage marketing preferences; and
              </li>
              <li>
                exercise other rights provided by applicable law.
              </li>
            </ul>

            <p>
              The scope and availability of these rights depend on applicable
              law and the circumstances of the processing.
            </p>
          </section>

          {/* 22 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              22. India: Digital Personal Data Protection Framework
            </h2>

            <p>
              Where applicable, Wedding With India will process personal data in
              accordance with India&apos;s applicable digital personal-data
              protection framework, including the Digital Personal Data
              Protection Act, 2023 and applicable rules and notifications.
            </p>

            <p>
              The Government of India notified the Digital Personal Data
              Protection Rules, 2025 on November 14, 2025. The Rules provide
              different commencement dates for different provisions, so the
              obligations applicable to a particular processing activity depend
              on the relevant commencement date and circumstances.
            </p>

            <p>
              We will update our privacy practices, notices, consent mechanisms
              and operational controls as applicable requirements come into
              force and as Wedding With India&apos;s processing activities
              develop.
            </p>
          </section>

          {/* 23 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              23. European Economic Area, United Kingdom and Other
              Jurisdictions
            </h2>

            <p>
              Privacy rights and obligations may vary depending on where you
              live and the nature of the services provided to you.
            </p>

            <p>
              If the GDPR applies to Wedding With India&apos;s processing of
              your information, additional requirements may apply concerning
              lawful bases, transparency, data-subject rights, international
              transfers, security and other matters.
            </p>

            <p>
              The GDPR can apply to organizations outside the EU when they offer
              goods or services to individuals in the EU or monitor their
              behavior in circumstances covered by the regulation.
            </p>

            <p>
              Additional privacy requirements may also apply to users in other
              jurisdictions, including the United Kingdom, United States,
              Australia or other countries, depending on the applicable
              circumstances and laws.
            </p>
          </section>

          {/* 24 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              24. Third-Party Services
            </h2>

            <p>
              Wedding With India may rely on third-party providers for
              infrastructure, authentication, hosting, analytics, payments,
              communications, verification, security and other functions.
            </p>

            <p>
              Those providers may process personal information on our behalf or
              independently for purposes described in their own privacy
              documentation.
            </p>

            <p>
              We seek to select service providers appropriate for the relevant
              function and, where required, maintain contractual and technical
              safeguards governing their processing.
            </p>
          </section>

          {/* 25 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              25. Legal and Regulatory Disclosures
            </h2>

            <p>
              We may disclose personal information where reasonably necessary
              to comply with applicable law, court orders, lawful government
              requests, regulatory requirements, fraud investigations, safety
              obligations or legal proceedings.
            </p>

            <p>
              We may also disclose information where reasonably necessary to
              protect the rights, safety or property of Wedding With India, our
              users or other persons, subject to applicable law.
            </p>
          </section>

          {/* 26 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              26. Data Relating to Safety Incidents
            </h2>

            <p>
              If a user reports harassment, fraud, a security issue, an unsafe
              event or another serious incident, we may process information
              necessary to investigate, respond to the report, protect users,
              resolve disputes and comply with legal obligations.
            </p>

            <p>
              Such information may include communications, booking information,
              incident descriptions, supporting evidence and relevant account
              information.
            </p>
          </section>

          {/* 27 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              27. Your Responsibilities
            </h2>

            <p>
              You should provide accurate information, keep your account
              credentials secure and avoid submitting unnecessary personal
              information about other people.
            </p>

            <p>
              If you provide information about another person, you should have
              the necessary authority or lawful basis to provide that
              information.
            </p>
          </section>

          {/* 28 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              28. How to Exercise Your Privacy Rights
            </h2>

            <p>
              To submit a privacy request, contact:
            </p>

            <p>
              <a
                href="mailto:privacy@weddingwithindia.com"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                privacy@weddingwithindia.com
              </a>
            </p>

            <p>
              Please describe the request clearly and provide sufficient
              information for us to identify the relevant account or
              information. We may request reasonable verification of your
              identity before processing certain requests.
            </p>

            <p>
              Requests will be handled within the timeframe required by
              applicable law.
            </p>

            <p className="text-sm text-charcoal-600">
              For GDPR-covered requests, organizations generally must respond
              without undue delay and in principle within one month, subject to
              the GDPR&apos;s applicable rules and exceptions.
            </p>
          </section>

          {/* 29 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              29. Complaints
            </h2>

            <p>
              If you believe your privacy has not been handled appropriately,
              please contact us first so that we can investigate and attempt to
              resolve the issue.
            </p>

            <p>
              Depending on the law applicable to you, you may also have the
              right to lodge a complaint with the relevant data-protection
              authority or other competent regulator.
            </p>
          </section>

          {/* 30 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              30. Changes to This Privacy Policy
            </h2>

            <p>
              We may update this Privacy Policy when our services, data
              practices, technology, legal obligations or business structure
              change.
            </p>

            <p>
              If a change is material, we may provide additional notice where
              required by applicable law.
            </p>

            <p>
              The latest version published on this page will identify the date
              on which the policy was most recently updated.
            </p>
          </section>

          {/* 31 */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Privacy by design
                </h2>

                <p>
                  As Wedding With India grows, we intend to improve our privacy
                  controls alongside the Platform, including stronger access
                  controls, clearer consent experiences, better account
                  controls, appropriate retention processes and more transparent
                  explanations of how personal information is used.
                </p>

                <p className="text-sm text-charcoal-600">
                  Specific controls and features will be implemented according
                  to the systems actually used by Wedding With India.
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
                  Important legal notice
                </h2>

                <p>
                  This Privacy Policy describes Wedding With India&apos;s
                  intended privacy framework and should be read together with
                  the actual consent interfaces, account controls, Terms of
                  Service and applicable booking policies.
                </p>

                <p>
                  Privacy obligations can vary according to the user&apos;s
                  location, the nature of the service, the type of data
                  processed and the legal entity operating the Platform.
                </p>

                <p className="text-sm text-charcoal-600">
                  Nothing in this policy is intended to remove or restrict a
                  privacy right that cannot legally be excluded.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              Last updated: August 13, 2026. For privacy questions or requests,
              contact{" "}
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