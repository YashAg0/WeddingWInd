import { Metadata } from "next";
import {
  AlertTriangle,
  Clock,
  FileText,
  Globe2,
  Lock,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Terms of Service governing accounts, bookings, Indian wedding experiences, payments, cancellations, guest and host responsibilities on WeddingWithIndia.",
  keywords: [
    "WeddingWithIndia terms of service",
    "Indian wedding experience terms",
    "WeddingWithIndia booking terms",
    "Indian wedding travel terms",
    "WeddingWithIndia platform terms",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/trust?tab=terms",
  },
  openGraph: {
    title: "Terms of Service | WeddingWithIndia",
    description:
      "The terms governing use of WeddingWithIndia, including bookings, experiences, payments, cancellations, and platform responsibilities.",
    url: "https://weddingwithindia.com/trust?tab=terms",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | WeddingWithIndia",
    description:
      "The terms governing use of WeddingWithIndia, including bookings, experiences, payments, cancellations, and platform responsibilities.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <FileText size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Terms of Service
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            These Terms govern your access to and use of Wedding With India,
            including accounts, bookings and participation in Indian wedding
            and cultural experiences.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Last Updated: August 13, 2026</span>
          </div>
        </div>

        {/* Terms Content */}
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
                  Please read these terms before using Wedding With India
                </h2>

                <p>
                  These Terms of Service (&quot;Terms&quot;) form an agreement
                  between you and the entity operating Wedding With India
                  (&quot;Wedding With India&quot;, &quot;we&quot;,
                  &quot;us&quot; or &quot;our&quot;) concerning your use of
                  the Wedding With India website, applications, booking
                  services and related platform features (collectively, the
                  &quot;Platform&quot;).
                </p>

                <p className="text-sm text-charcoal-600">
                  If you do not agree with these Terms, do not create an
                  account, make a booking or use the Platform.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Acceptance of These Terms
            </h2>

            <p>
              By accessing, browsing, registering for, booking through or
              otherwise using the Platform, you acknowledge that you have had
              an opportunity to review these Terms and agree to be bound by
              them to the extent permitted by applicable law.
            </p>

            <p>
              Additional terms may apply to particular services, bookings,
              promotions, host arrangements, agent programs or other features.
              Where such additional terms are presented to you before you use
              the relevant service, those terms form part of your agreement
              with us for that service.
            </p>

            <p>
              If there is a conflict between these Terms and a booking-specific
              term, the booking-specific term will generally govern that
              particular transaction to the extent of the conflict.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Who Can Use the Platform
            </h2>

            <p>
              You must have the legal capacity required to enter into a
              contract under the laws applicable to you. If you are below the
              applicable age of majority, you may use the Platform only with
              the involvement and authorization of a parent, legal guardian or
              other person legally authorized to act on your behalf where
              permitted.
            </p>

            <p>
              We may apply additional age or eligibility requirements to
              particular experiences for safety, legal or operational reasons.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. What Wedding With India Does
            </h2>

            <p>
              Wedding With India operates a technology platform intended to
              help people discover, request, book and participate in selected
              Indian wedding and cultural experiences.
            </p>

            <p>
              Depending on the service, Wedding With India may facilitate
              discovery, communications, booking, payment processing,
              verification, customer support, safety processes and
              coordination between participants.
            </p>

            <p>
              The specific services provided by Wedding With India will depend
              on the booking and features available at the time.
            </p>

            <p>
              Unless a particular service expressly states otherwise, Wedding
              With India does not own the wedding venue or personally conduct
              every activity forming part of an experience. Hosts, venues,
              vendors, transportation providers and other third parties may
              independently provide parts of an experience.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Experiences Are Real-World Events
            </h2>

            <p>
              Wedding experiences listed through the Platform may involve real
              weddings, families, venues, religious or cultural ceremonies,
              food, crowds, travel, transportation and other real-world
              circumstances.
            </p>

            <p>
              The exact schedule, activities, venue arrangements, guest
              capacity, food, ceremonies and other details may change because
              weddings are personal events and circumstances may develop after
              a listing is published.
            </p>

            <p>
              We will use reasonable efforts to communicate material changes
              affecting a confirmed booking where reasonably practicable.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Accounts and Account Security
            </h2>

            <p>
              Some Platform features require an account. You are responsible
              for providing accurate information and keeping your account
              information reasonably current.
            </p>

            <p>
              You are responsible for protecting your login credentials and
              should notify us promptly if you believe that your account has
              been accessed without authorization.
            </p>

            <p>
              You must not share your account in a manner that enables another
              person to misuse the Platform or circumvent applicable safety,
              identity or booking controls.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Accurate Information and Verification
            </h2>

            <p>
              You agree to provide information that is accurate, complete and
              not misleading when creating an account, making a booking,
              communicating with another participant or completing a
              verification process.
            </p>

            <p>
              Where reasonably necessary for safety, fraud prevention, legal
              compliance or operation of a particular service, we may request
              additional information or verification.
            </p>

            <p>
              You must not submit another person&apos;s identity documents,
              impersonate another person, manipulate verification systems or
              otherwise attempt to defeat identity or safety controls.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Bookings
            </h2>

            <p>
              A booking request does not necessarily constitute a confirmed
              booking. A booking becomes confirmed only when Wedding With India
              or the applicable booking system communicates confirmation in
              accordance with the applicable booking process.
            </p>

            <p>
              The booking confirmation may specify the experience, date,
              number of guests, price, applicable taxes or fees, cancellation
              terms and other relevant conditions.
            </p>

            <p>
              You must review your booking confirmation carefully and notify us
              promptly if you identify a material error.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Prices, Taxes and Payments
            </h2>

            <p>
              Prices and applicable charges will be displayed through the
              relevant booking flow or other applicable Platform interface.
              Unless expressly stated otherwise, you are responsible for
              paying the charges shown at checkout.
            </p>

            <p>
              Depending on the transaction, applicable taxes, payment
              processing charges, currency conversion costs or other charges
              may apply.
            </p>

            <p>
              You authorize the applicable payment provider to process
              authorized payments using the payment method selected by you.
              Wedding With India may use third-party payment processors and
              does not ordinarily store complete payment-card credentials on
              its own systems where the payment architecture does not require
              it.
            </p>

            <p>
              You must not use stolen, unauthorized or fraudulent payment
              methods or intentionally initiate a fraudulent payment dispute or
              chargeback.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Cancellations and Refunds
            </h2>

            <p>
              Cancellation and refund rights depend on the booking-specific
              cancellation policy displayed before or at the time of booking,
              together with any mandatory rights provided by applicable law.
            </p>

            <p>
              Different experiences may have different cancellation windows
              because hosts may incur catering, venue, staffing and other
              commitments.
            </p>

            <p>
              Where a specific booking provides a refund schedule, that
              schedule will be shown to the customer before the booking is
              completed where reasonably practicable.
            </p>

            <p>
              Refunds, where applicable, will generally be processed through
              the payment method or process used for the original transaction,
              subject to payment-provider requirements and applicable law.
            </p>

            <p>
              Nothing in these Terms is intended to remove or restrict a
              consumer right that cannot lawfully be excluded or restricted.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Changes or Cancellation by Hosts or Wedding With India
            </h2>

            <p>
              A host, venue or Wedding With India may need to change or cancel
              an experience because of circumstances including changes to the
              wedding schedule, venue restrictions, family circumstances,
              severe weather, transportation disruption, public emergencies,
              government action, safety concerns or other circumstances beyond
              reasonable control.
            </p>

            <p>
              If we cancel or materially change a confirmed booking, we will
              communicate the available options in accordance with the
              applicable booking terms and applicable law.
            </p>

            <p>
              Depending on the circumstances, available remedies may include a
              refund, alternative arrangement, booking credit or another
              appropriate remedy.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Guest Responsibilities
            </h2>

            <p>
              Guests must comply with the applicable Traveler Guest Agreement,
              booking requirements, reasonable host instructions, venue rules
              and applicable law.
            </p>

            <p>Guests must:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>behave respectfully toward hosts, families and other guests;</li>
              <li>
                follow reasonable dress, photography and ceremony requirements;
              </li>
              <li>
                respect private, restricted and religious areas;
              </li>
              <li>
                communicate material accessibility, dietary or other booking
                requirements where the Platform provides a mechanism to do so;
              </li>
              <li>
                take reasonable care of venues, property and personal
                belongings; and
              </li>
              <li>
                comply with applicable laws during travel and participation.
              </li>
            </ul>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Prohibited Conduct
            </h2>

            <p>You must not use the Platform or an experience to:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>harass, threaten, intimidate or abuse another person;</li>
              <li>
                engage in violence, sexual misconduct or unwanted physical
                contact;
              </li>
              <li>
                discriminate against another person on a prohibited basis;
              </li>
              <li>
                commit fraud, theft, deception or other unlawful activity;
              </li>
              <li>
                damage property intentionally or through reckless conduct;
              </li>
              <li>
                bypass identity, booking, payment or safety controls;
              </li>
              <li>
                collect personal information from other users for unauthorized
                purposes;
              </li>
              <li>
                upload malware, malicious code or content intended to disrupt
                the Platform;
              </li>
              <li>
                scrape or systematically extract Platform data without
                authorization;
              </li>
              <li>
                impersonate Wedding With India, a host, guest, employee,
                representative or another person; or
              </li>
              <li>
                use the Platform in a manner that violates applicable law.
              </li>
            </ul>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Host Responsibilities
            </h2>

            <p>
              Hosts are responsible for providing truthful information about
              their wedding or experience, maintaining appropriate authority to
              offer the experience, communicating material requirements and
              complying with applicable laws and their separate host agreement.
            </p>

            <p>
              A host must not misrepresent the event, materially mislead
              guests, misuse guest information, discriminate unlawfully,
              request unauthorized payments or use the Platform for fraudulent
              purposes.
            </p>

            <p>
              Additional requirements may apply to hosts depending on the
              experience, location, legal structure and services offered.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Independent Hosts, Agents and Third Parties
            </h2>

            <p>
              Some people or businesses participating in the Platform may be
              independent hosts, referral agents, coordinators, vendors,
              venues, transportation providers or other third parties.
            </p>

            <p>
              Unless expressly stated otherwise in a separate written
              agreement, participation in the Platform does not create an
              employment, partnership, franchise, joint venture or general
              agency relationship between such participants and Wedding With
              India.
            </p>

            <p>
              Third parties remain responsible for the services they directly
              provide, subject to any commitments expressly made by Wedding
              With India and rights available under applicable law.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Travel, Visa and Immigration
            </h2>

            <p>
              International travelers are responsible for obtaining all
              passports, visas, permits, travel authorizations and other
              documents required for their journey and participation.
            </p>

            <p>
              Wedding With India does not guarantee visa approval, immigration
              admission, border entry, flight availability or any other
              government decision.
            </p>

            <p>
              Information provided through the Platform about travel or
              immigration is general information unless expressly identified as
              professional advice from an appropriately qualified third party.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Insurance and Medical Matters
            </h2>

            <p>
              Wedding With India does not provide personal medical or travel
              insurance unless a specific service expressly states otherwise.
            </p>

            <p>
              Travelers are responsible for determining whether appropriate
              travel, medical, cancellation or other insurance is necessary for
              their circumstances.
            </p>

            <p>
              Information available through the Platform should not be treated
              as medical advice. Guests remain responsible for their own health
              decisions, medication and medical requirements.
            </p>
          </section>

          {/* 17 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Safety and Emergency Situations
            </h2>

            <p>
              Wedding With India may provide safety guidance, reporting
              mechanisms or support features, but these features are not a
              substitute for emergency services.
            </p>

            <p>
              If you face an immediate threat to life, health or safety,
              contact the appropriate local emergency service or authority
              first.
            </p>

            <p>
              Serious safety, harassment, fraud or misconduct concerns
              connected with a Wedding With India experience should also be
              reported to us as soon as reasonably practicable through the
              available support channels.
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. Photography, Video and User Content
            </h2>

            <p>
              Wedding experiences may involve photography and video. Users must
              respect the privacy and wishes of hosts, families, children and
              other attendees.
            </p>

            <p>
              You must not intentionally publish or commercially exploit
              another person&apos;s image, private information or confidential
              communications where doing so would violate applicable law,
              privacy rights or event restrictions.
            </p>

            <p>
              If you upload reviews, photographs, videos, comments or other
              material to the Platform, you remain responsible for the content
              and must have the necessary rights and permissions to provide it.
            </p>

            <p>
              By submitting content, you grant Wedding With India a
              non-exclusive, worldwide, royalty-free license to host, store,
              reproduce, display and use that content for operating, improving
              and promoting the Platform, subject to the applicable Privacy
              Policy and any additional consent required by law.
            </p>
          </section>

          {/* 19 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. Intellectual Property
            </h2>

            <p>
              The Platform, including its software, interface, design, text,
              graphics, logos, trademarks and original content, is owned by,
              licensed to, or used by Wedding With India or its respective
              rights holders and may be protected by intellectual property
              laws.
            </p>

            <p>
              Except where permitted by law or expressly authorized by us, you
              must not copy, reproduce, distribute, modify, reverse engineer,
              commercially exploit or create derivative works from protected
              Platform materials.
            </p>

            <p>
              Our Trademark & Brand Policy provides additional requirements
              concerning the Wedding With India name and brand assets.
            </p>
          </section>

          {/* 20 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              20. Privacy and Personal Data
            </h2>

            <p>
              We collect and process personal information as necessary to
              operate the Platform, create and manage accounts, facilitate
              bookings, provide customer support, maintain safety, prevent
              fraud, process payments, communicate with users and comply with
              applicable legal obligations.
            </p>

            <p>
              Our Privacy Policy explains the categories of personal data we
              collect, purposes of processing, applicable rights, retention
              practices, sharing with service providers and other relevant
              privacy information.
            </p>

            <p>
              Where applicable, Wedding With India will operate its personal
              data practices in accordance with applicable Indian data
              protection requirements and other laws that apply to a particular
              user or transaction.
            </p>
          </section>

          {/* 21 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              21. Communications
            </h2>

            <p>
              By using the Platform, you may receive transactional
              communications necessary to operate your account or booking,
              including confirmations, changes, security messages, service
              notifications and support communications.
            </p>

            <p>
              Where required by applicable law, marketing communications will
              be subject to appropriate consent or other lawful basis, and
              available unsubscribe or preference mechanisms.
            </p>
          </section>

          {/* 22 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              22. Platform Availability and Changes
            </h2>

            <p>
              We may update, modify, suspend or discontinue portions of the
              Platform from time to time for maintenance, security,
              technological, business or legal reasons.
            </p>

            <p>
              We do not guarantee that the Platform will always be available,
              uninterrupted, error-free or compatible with every device,
              browser or network.
            </p>

            <p>
              We will take reasonable measures to maintain the reliability and
              security of the Platform, but no internet-based service can be
              guaranteed to be completely secure or continuously available.
            </p>
          </section>

          {/* 23 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              23. Fraud, Abuse and Security
            </h2>

            <p>
              We may investigate activity that we reasonably believe involves
              fraud, abuse, security threats, unauthorized access, payment
              misuse, impersonation or violation of these Terms.
            </p>

            <p>
              Where reasonably necessary and subject to applicable law, we may
              suspend an account, restrict Platform access, cancel a booking,
              delay a transaction, request additional verification or take
              other appropriate protective measures.
            </p>

            <p>
              Where required by law, we may cooperate with competent
              authorities concerning suspected unlawful activity.
            </p>
          </section>

          {/* 24 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              24. Suspension and Termination
            </h2>

            <p>
              You may stop using the Platform at any time. If your account
              supports account deletion, you may use the applicable account
              controls or contact the designated support channel.
            </p>

            <p>
              We may suspend or terminate access where reasonably necessary,
              including for serious or repeated violations of these Terms,
              fraud, safety concerns, unlawful conduct, security risks or
              misuse of the Platform.
            </p>

            <p>
              Termination does not automatically cancel rights or obligations
              that by their nature should continue, including obligations
              concerning payments, intellectual property, disputes, privacy,
              confidentiality, fraud and liability.
            </p>
          </section>

          {/* 25 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              25. Disclaimer of Certain Warranties
            </h2>

            <p>
              To the maximum extent permitted by applicable law, the Platform
              and general information made available through it are provided
              on an &quot;as available&quot; basis.
            </p>

            <p>
              We do not guarantee that every listing, host, guest, vendor,
              event detail, photograph, review, availability indication or
              third-party service will always be accurate, current or
              uninterrupted.
            </p>

            <p>
              Nothing in these Terms excludes any consumer guarantee,
              statutory protection or other right that cannot lawfully be
              excluded.
            </p>
          </section>

          {/* 26 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              26. Limitation of Liability
            </h2>

            <p>
              To the maximum extent permitted by applicable law, Wedding With
              India will not be responsible for indirect, incidental, special,
              consequential or punitive losses arising from your use of the
              Platform or participation in an experience where such limitation
              is legally permitted.
            </p>

            <p>
              We are not responsible for matters outside our reasonable
              control, including the independent acts or omissions of third
              parties, government decisions, visa refusals, travel
              interruptions, weather events, venue decisions, family decisions
              or other force majeure circumstances, except to the extent
              liability cannot lawfully be excluded.
            </p>

            <p>
              Nothing in these Terms excludes or limits liability where doing
              so would be unlawful, including liability that cannot legally be
              excluded or limited under applicable consumer protection or
              other mandatory law.
            </p>
          </section>

          {/* 27 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              27. Indemnity
            </h2>

            <p>
              To the extent permitted by applicable law, you agree to be
              responsible for losses, claims, liabilities, costs and reasonable
              expenses arising from your unlawful conduct, fraud, intentional
              misconduct, material violation of these Terms or infringement of
              another person&apos;s rights.
            </p>

            <p>
              This provision does not require you to compensate us for losses
              caused by our own conduct to the extent such compensation cannot
              lawfully be required.
            </p>
          </section>

          {/* 28 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              28. Force Majeure
            </h2>

            <p>
              We will not be responsible for delay or failure to perform
              obligations to the extent caused by circumstances beyond
              reasonable control, including natural disasters, extreme
              weather, epidemics or pandemics, government restrictions,
              war, civil unrest, terrorism, transportation disruption,
              infrastructure failures, widespread technology outages or other
              comparable events.
            </p>

            <p>
              Where such an event materially affects a confirmed booking, we
              will address the booking in accordance with the applicable
              cancellation terms and applicable law.
            </p>
          </section>

          {/* 29 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              29. Complaints and Dispute Resolution
            </h2>

            <p>
              If you have a complaint about a booking or Platform service,
              please contact Wedding With India through the official support
              channel so that we have a reasonable opportunity to investigate
              and resolve the issue.
            </p>

            <p>
              We may use internal complaint handling, negotiation, mediation,
              arbitration or other dispute-resolution mechanisms where
              appropriate and legally permitted.
            </p>

            <p>
              Nothing in these Terms prevents a consumer from exercising a
              mandatory statutory right or approaching a competent authority,
              court, tribunal or consumer forum where such right is available
              under applicable law.
            </p>
          </section>

          {/* 30 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              30. Governing Law
            </h2>

            <p>
              Subject to mandatory laws and consumer protections applicable to
              you, these Terms are intended to be governed by the laws of India.
            </p>

            <p>
              Any dispute will be subject to the jurisdiction of the courts or
              other legally competent forums determined in accordance with
              applicable Indian law and any mandatory rights available to the
              user.
            </p>
          </section>

          {/* 31 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              31. International Users
            </h2>

            <div className="flex items-start gap-3">
              <Globe2
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={20}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Wedding With India may be accessed by users located outside
                  India. You are responsible for complying with laws that apply
                  to you in your country or location.
                </p>

                <p>
                  Certain consumer, privacy, tax, travel or other protections
                  may apply to international users depending on the
                  circumstances and applicable law. Nothing in these Terms is
                  intended to contract out of mandatory rights that cannot
                  legally be excluded.
                </p>
              </div>
            </div>
          </section>

          {/* 32 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              32. Changes to These Terms
            </h2>

            <p>
              We may update these Terms from time to time to reflect changes to
              the Platform, business operations, technology, safety practices,
              legal requirements or other circumstances.
            </p>

            <p>
              When appropriate, we will provide notice of material changes
              through the Platform or another reasonable communication method.
            </p>

            <p>
              The version applicable to a particular booking will generally be
              the version accepted or presented at the relevant time, subject
              to applicable law.
            </p>
          </section>

          {/* 33 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              33. Electronic Communications
            </h2>

            <p>
              You agree that communications and notices may be provided
              electronically through email, the Platform, account
              notifications or other electronic means, subject to applicable
              law.
            </p>

            <p>
              Electronic records may be used to document bookings,
              confirmations, communications, consents and other transactions
              carried out through the Platform.
            </p>
          </section>

          {/* 34 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              34. Severability
            </h2>

            <p>
              If any provision of these Terms is determined to be unlawful,
              invalid or unenforceable, that provision will be enforced to the
              maximum extent permitted where possible, and the remaining
              provisions will continue to apply to the extent permitted by law.
            </p>
          </section>

          {/* 35 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              35. No Waiver
            </h2>

            <p>
              A failure or delay by Wedding With India to enforce a provision
              of these Terms does not constitute a permanent waiver of that
              provision or of our right to enforce it later.
            </p>
          </section>

          {/* 36 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              36. Entire Agreement
            </h2>

            <p>
              These Terms, together with applicable booking-specific terms,
              policies and agreements expressly incorporated by reference,
              constitute the terms governing your use of the relevant Wedding
              With India services.
            </p>
          </section>

          {/* Related policies */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <div className="flex items-start gap-3">
              <Lock
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={20}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Related policies
                </h2>

                <p>
                  These Terms should be read together with the policies and
                  agreements applicable to your use of Wedding With India,
                  including the Privacy Policy, Cancellation & Refund Policy,
                  Traveler Guest Agreement, Host Agreement and Trademark &
                  Brand Policy, where applicable.
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
                  These Terms are intended to establish clear contractual
                  rules for the Wedding With India Platform. They are not a
                  substitute for individualized legal, tax, immigration,
                  insurance or other professional advice.
                </p>

                <p>
                  Wedding With India will update its legal and operational
                  policies as its services, business structure and applicable
                  laws develop.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-2 border-t border-warm-100">
            <div className="flex items-start gap-3">
              <FileText
                className="mt-0.5 shrink-0 text-charcoal-400"
                size={18}
                aria-hidden="true"
              />

              <p className="text-xs sm:text-sm text-charcoal-500">
                Last updated: August 13, 2026. Please retain a copy of these
                Terms for your records.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}