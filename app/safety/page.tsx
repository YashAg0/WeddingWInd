import { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Safety & Security Standards",
  description:
    "Learn how WeddingWithIndia approaches guest and host verification, booking safety, privacy, reporting, emergency support, and responsible participation.",
  keywords: [
    "WeddingWithIndia safety",
    "Indian wedding guest safety",
    "Indian wedding travel safety",
    "WeddingWithIndia verification",
    "Indian wedding experience safety",
    "WeddingWithIndia security",
    "Indian wedding tourism safety",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/safety",
  },
  openGraph: {
    title: "Safety & Security Standards | WeddingWithIndia",
    description:
      "Our approach to identity verification, safer bookings, guest and host trust, reporting, and support.",
    url: "https://weddingwithindia.com/safety",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safety & Security Standards | WeddingWithIndia",
    description:
      "Our approach to identity verification, safer bookings, guest and host trust, reporting, and support.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SafetyPolicyPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Safety & Security Standards
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            We design Wedding With India around trust, responsible participation,
            privacy and practical safety measures for guests, hosts and partners.
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
                  Safety is a shared responsibility
                </h2>

                <p>
                  Wedding With India takes reasonable measures to support safer
                  experiences, verify information where appropriate, prevent
                  fraud and provide channels for reporting concerns.
                </p>

                <p className="text-sm text-charcoal-600">
                  No online platform can guarantee the safety of every
                  person, event or real-world situation. Guests, hosts and
                  other participants remain responsible for exercising
                  reasonable care and following applicable laws and safety
                  instructions.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Trust & Verification
            </h2>

            <p>
              Depending on the account type, experience, risk level and
              operational requirements, Wedding With India may use verification
              measures designed to help establish the identity and
              authenticity of participants.
            </p>

            <p>Verification may include, where appropriate:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                email address and mobile-phone verification;
              </li>
              <li>
                government-issued identity documentation;
              </li>
              <li>
                additional identity checks through authorized verification
                providers;
              </li>
              <li>
                information concerning a host&apos;s authority to offer an
                experience;
              </li>
              <li>
                venue or event information where reasonably necessary; and
              </li>
              <li>
                additional checks where required for fraud prevention, safety
                or legal compliance.
              </li>
            </ul>

            <p>
              The specific checks applied to a participant may vary. A
              verification status does not mean that Wedding With India
              guarantees a person&apos;s character, future conduct, financial
              position or suitability for every situation.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Identity Documents & Sensitive Information
            </h2>

            <p>
              Where identity verification requires documentation, we will
              request only information reasonably necessary for the applicable
              purpose and will handle personal information according to our
              Privacy Policy and applicable data-protection requirements.
            </p>

            <p>
              Wedding With India does not require users to publicly display
              identity documents or sensitive personal information on their
              profiles.
            </p>

            <p>
              Do not upload another person&apos;s identity document or personal
              information unless you are legally authorized to do so and the
              Platform specifically requests it.
            </p>

            <p>
              Where a third-party verification provider is used, certain
              verification information may be processed by that provider under
              its applicable terms and privacy documentation.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Guest Verification
            </h2>

            <div className="flex items-start gap-3">
              <UserCheck
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={20}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Depending on the experience, guests may be required to
                  complete identity or account verification before a booking is
                  confirmed or before access to an experience is permitted.
                </p>

                <p>
                  A guest may be asked to provide information necessary to
                  confirm the booking, prevent impersonation, maintain event
                  security or satisfy applicable legal requirements.
                </p>

                <p className="text-sm text-charcoal-600">
                  Verification requirements can change as Wedding With India
                  expands its safety infrastructure and as the requirements of
                  particular experiences differ.
                </p>
              </div>
            </div>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Host Verification
            </h2>

            <p>
              Hosts may be required to provide information allowing Wedding
              With India to assess the legitimacy of an experience and the
              host&apos;s ability to offer it.
            </p>

            <p>
              Depending on the circumstances, this may include contact
              verification, identity documentation, event information, venue
              information or other reasonable evidence.
            </p>

            <p>
              Verification is a risk-control measure and should not be
              interpreted as a guarantee that an event, host or property is
              completely risk-free.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Experience & Venue Information
            </h2>

            <div className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={20}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Wedding With India may review available information about an
                  experience, venue, event schedule or host before allowing an
                  experience to be listed or booked.
                </p>

                <p>
                  Information may change after verification. Guests should
                  review their booking confirmation and follow the latest
                  instructions provided for the experience.
                </p>

                <p>
                  Wedding With India does not represent that every venue or
                  location has been independently inspected unless the specific
                  listing expressly states that an inspection or assessment has
                  occurred.
                </p>
              </div>
            </div>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Safer Booking Practices
            </h2>

            <p>
              Guests should keep booking and payment activity within the
              official Wedding With India process whenever one is provided.
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                Do not send passwords, one-time authentication codes or payment
                credentials to another user.
              </li>
              <li>
                Be cautious of requests to pay through unofficial channels.
              </li>
              <li>
                Report suspicious payment requests or impersonation promptly.
              </li>
              <li>
                Review booking details before travelling.
              </li>
              <li>
                Keep important travel documents and personal belongings secure.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Communication & Contact Protection
            </h2>

            <p>
              Wedding With India may provide communication tools or facilitate
              communications between participants for legitimate booking and
              support purposes.
            </p>

            <p>
              Users should avoid unnecessarily sharing sensitive personal
              information, financial credentials, passport copies or other
              confidential information with another participant.
            </p>

            <p>
              We may restrict or review communications where reasonably
              necessary for safety, fraud prevention, legal compliance or
              enforcement of our policies, subject to applicable law and our
              Privacy Policy.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Guest Conduct
            </h2>

            <p>
              Guests are expected to respect hosts, family members, other
              attendees, venue personnel and local communities.
            </p>

            <p>
              Harassment, violence, threats, sexual misconduct, discrimination,
              theft, intentional property damage, serious intoxication,
              unauthorized access to private areas and other unlawful or
              materially disruptive conduct are prohibited.
            </p>

            <p>
              A guest may be required to leave an experience or may lose
              Platform access where reasonably necessary to protect people,
              property, privacy or the integrity of the event. Any refund will
              be determined according to the applicable booking terms and
              applicable law.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Host Conduct
            </h2>

            <p>
              Hosts are expected to provide truthful information, treat guests
              respectfully, maintain reasonable event safety standards and
              comply with applicable laws and their host agreement.
            </p>

            <p>
              Hosts must not intentionally mislead guests, request unauthorized
              payments, misuse guest information, discriminate unlawfully or
              engage in harassment, violence or other prohibited conduct.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Local Coordinators & Support
            </h2>

            <p>
              Where a particular booking includes a designated coordinator,
              their role and available support will be described in the booking
              information or communicated to the participants.
            </p>

            <p>
              Not every booking necessarily includes an in-person coordinator
              or dedicated liaison. The availability of on-ground assistance
              may depend on location, booking type, staffing and operational
              circumstances.
            </p>

            <p>
              A coordinator is not a substitute for emergency services,
              medical professionals, police, immigration authorities or other
              public emergency resources.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Emergency Support
            </h2>

            <p>
              Wedding With India may provide support channels for safety,
              booking or other urgent concerns where those channels are
              available.
            </p>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="text-sm text-charcoal-700">
                <strong>
                  Wedding With India support is not an emergency-response
                  service.
                </strong>{" "}
                If you face an immediate threat to life, health or physical
                safety, contact the appropriate local emergency service or
                authority first.
              </p>
            </div>

            <p>
              We do not promise that a support request will always result in
              immediate physical dispatch, intervention or resolution. Our
              response depends on the circumstances, available information,
              location, staffing and the nature of the incident.
            </p>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Reporting a Safety Concern
            </h2>

            <p>
              Report safety, harassment, fraud, impersonation, suspicious
              behavior or serious policy violations through the official
              Wedding With India reporting or support channel as soon as
              reasonably possible.
            </p>

            <p>
              When reporting an incident, provide the information reasonably
              available to you, such as the booking reference, account,
              location, time, description of the incident and relevant
              evidence.
            </p>

            <p>
              We may investigate reports and take reasonable measures,
              including contacting relevant participants, restricting accounts,
              cancelling bookings or referring matters to competent authorities
              where appropriate and legally permitted.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Fraud & Platform Security
            </h2>

            <p>
              We use reasonable technical and operational measures designed to
              reduce fraud, unauthorized access and misuse of the Platform.
            </p>

            <p>
              These measures may include account authentication, verification,
              transaction monitoring, access controls, abuse detection and
              review of suspicious activity.
            </p>

            <p>
              Security measures reduce risk but cannot eliminate every threat.
              Users should also maintain secure passwords, protect their
              devices and report suspected account compromise promptly.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Privacy & Data Protection
            </h2>

            <div className="flex items-start gap-3">
              <Lock
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={20}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Safety and verification can require the processing of
                  personal information. Wedding With India will process
                  personal data in accordance with its Privacy Policy and
                  applicable data-protection requirements.
                </p>

                <p>
                  We aim to collect and use information for specified,
                  legitimate purposes and to apply appropriate security
                  measures to protect information against unauthorized access,
                  misuse, alteration, loss or disclosure.
                </p>

                <p>
                  Where a verification or other service is provided by an
                  independent third-party provider, that provider may process
                  information according to its own applicable privacy
                  documentation.
                </p>

                <p className="text-sm text-charcoal-600">
                  The exact information collected, retention period, purposes,
                  user rights and applicable legal requirements are described
                  in the Wedding With India Privacy Policy.
                </p>
              </div>
            </div>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. No Guarantee of Personal Safety
            </h2>

            <p>
              Verification, reviews, support and safety procedures are intended
              to reduce foreseeable risks; they do not guarantee that an
              individual, host, venue, event, journey or interaction will be
              completely safe or free from misconduct.
            </p>

            <p>
              Real-world experiences may involve risks associated with travel,
              traffic, crowds, weather, food, unfamiliar environments,
              transportation, physical activity and other circumstances.
            </p>

            <p>
              Guests should make informed decisions about whether an experience
              is appropriate for their individual circumstances.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Travel, Visa & Insurance
            </h2>

            <p>
              Guests are responsible for passports, visas, immigration
              requirements, travel arrangements and appropriate insurance.
            </p>

            <p>
              Wedding With India does not guarantee visa approval, immigration
              admission, flight availability, medical treatment, insurance
              coverage or uninterrupted travel.
            </p>

            <p>
              Guests should consider appropriate travel and medical insurance
              before travelling and should obtain professional advice where
              necessary.
            </p>
          </section>

          {/* 17 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Children & Vulnerable Persons
            </h2>

            <p>
              Additional safeguards may apply where an experience involves
              children or vulnerable persons.
            </p>

            <p>
              Users must never engage in exploitative, abusive, sexually
              inappropriate or otherwise unsafe conduct involving children or
              vulnerable persons.
            </p>

            <p>
              Safety concerns involving a child or vulnerable person should be
              reported promptly through the appropriate emergency or
              safeguarding channels.
            </p>
          </section>

          {/* 18 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. Photography, Privacy & Consent
            </h2>

            <p>
              Weddings commonly involve photography and video. Participants
              must nevertheless respect reasonable privacy expectations and
              any photography restrictions communicated by the host or venue.
            </p>

            <p>
              Do not intentionally publish or commercially exploit another
              person&apos;s identifiable image, private information or
              confidential communication where permission or another lawful
              basis is required.
            </p>
          </section>

          {/* 19 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. Continuous Improvement
            </h2>

            <p>
              Wedding With India may update its safety standards as the
              Platform grows, new risks are identified, technology develops,
              operational capabilities change and applicable legal requirements
              evolve.
            </p>

            <p>
              Safety features may therefore differ between locations,
              experience types and time periods.
            </p>
          </section>

          {/* 20 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              20. Safety Standards Do Not Replace Applicable Law
            </h2>

            <p>
              Nothing in this policy limits any rights or protections available
              under applicable law. Safety procedures are operational measures
              and do not replace the responsibilities of users, hosts, venues,
              service providers or public authorities.
            </p>
          </section>

          {/* What verification means */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <h2 className="font-display font-bold text-lg text-charcoal-900 mb-4">
              What a verification status means
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                  size={19}
                  aria-hidden="true"
                />
                <p>
                  Information required by the applicable verification process
                  has been reviewed or confirmed through the relevant process.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                  size={19}
                  aria-hidden="true"
                />
                <p>
                  The account or experience has satisfied the applicable
                  verification requirements at the relevant time.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 shrink-0 text-amber-700"
                  size={19}
                  aria-hidden="true"
                />
                <p>
                  Verification is not a guarantee of future behavior, safety,
                  financial reliability, legal status or suitability.
                </p>
              </div>
            </div>
          </section>

          {/* Final notice */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-amber-700"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Important safety notice
                </h2>

                <p>
                  Wedding With India is a technology platform and experience
                  marketplace. It is not a police, ambulance, medical,
                  immigration or emergency-response organization.
                </p>

                <p>
                  If there is an immediate danger to life or physical safety,
                  contact the appropriate local emergency service or authority
                  immediately.
                </p>

                <p className="text-sm text-charcoal-600">
                  This policy should be read together with the Terms of Service,
                  Traveler Guest Agreement, Privacy Policy, applicable booking
                  terms and any host or partner agreement relevant to the
                  experience.
                </p>
              </div>
            </div>
          </section>

          {/* Related Safety & Compliance Resources */}
          <section className="pt-6 border-t border-warm-200/80 space-y-3">
            <h3 className="font-display font-bold text-base text-charcoal-900">
              Dedicated Safety & Compliance Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <a href="/guest-safety" className="p-3 rounded-xl bg-warm-50 border border-warm-200 hover:border-amber-400 block transition-colors">
                <span className="font-bold text-charcoal-900 block">Guest Safety Guide</span>
                <span className="text-charcoal-500">Etiquette, boundaries & preparation</span>
              </a>
              <a href="/host-safety" className="p-3 rounded-xl bg-warm-50 border border-warm-200 hover:border-amber-400 block transition-colors">
                <span className="font-bold text-charcoal-900 block">Host Safety Guide</span>
                <span className="text-charcoal-500">Hosting guidelines & coordinator support</span>
              </a>
              <a href="/incident-report" className="p-3 rounded-xl bg-warm-50 border border-warm-200 hover:border-amber-400 block transition-colors">
                <span className="font-bold text-charcoal-900 block">Incident Reporting</span>
                <span className="text-charcoal-500">Official protocol for urgent reports</span>
              </a>
              <a href="/photo-video-consent" className="p-3 rounded-xl bg-warm-50 border border-warm-200 hover:border-amber-400 block transition-colors">
                <span className="font-bold text-charcoal-900 block">Photo & Video Consent</span>
                <span className="text-charcoal-500">Social media & sacred ritual rules</span>
              </a>
              <a href="/insurance" className="p-3 rounded-xl bg-warm-50 border border-warm-200 hover:border-amber-400 block transition-colors">
                <span className="font-bold text-charcoal-900 block">Travel Insurance</span>
                <span className="text-charcoal-500">Medical & trip protection advice</span>
              </a>
              <a href="/grievance" className="p-3 rounded-xl bg-warm-50 border border-warm-200 hover:border-amber-400 block transition-colors">
                <span className="font-bold text-charcoal-900 block">Grievance Redressal</span>
                <span className="text-charcoal-500">Statutory officer & dispute contacts</span>
              </a>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              Last updated: August 13, 2026. Wedding With India may update
              these standards as its safety infrastructure, operational
              capabilities and applicable laws evolve.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
