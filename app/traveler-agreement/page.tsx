import { Metadata } from "next";
import { UserCheck, Clock, ShieldCheck, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Traveler Guest Agreement | Wedding With India",
  description:
    "Traveler Guest Agreement for guests attending authentic Indian wedding experiences through Wedding With India, including guest conduct, safety, cultural respect, bookings, cancellations, media consent and responsibilities.",
  keywords: [
    "Indian wedding guest agreement",
    "Wedding With India guest terms",
    "Indian wedding experience",
    "foreign guests Indian weddings",
    "Indian wedding travel",
    "wedding tourism India",
  ],
  alternates: {
    canonical: "/traveler-agreement",
  },
  openGraph: {
    title: "Traveler Guest Agreement | Wedding With India",
    description:
      "Terms and responsibilities for travelers participating in Indian wedding experiences through Wedding With India.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TravelerAgreementPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <UserCheck size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Traveler Guest Agreement
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            These terms explain the responsibilities and standards that apply
            when you book or participate in an Indian wedding experience
            through Wedding With India.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Last Updated: August 13, 2026</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-2">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Please read before booking
                </h2>

                <p>
                  By creating a booking or participating in an experience
                  arranged through Wedding With India, you confirm that you
                  have read and agree to this Traveler Guest Agreement, the
                  applicable booking terms, cancellation/refund policy, and
                  Wedding With India&apos;s Terms of Service and Privacy Policy.
                </p>

                <p className="text-sm text-charcoal-600">
                  This agreement is intended to establish clear expectations
                  for guests and does not replace any visa, immigration,
                  insurance, medical, travel, accommodation, transportation,
                  or other legal requirements that may apply to you.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Purpose of the Guest Experience
            </h2>

            <p>
              Wedding With India provides a platform and related services that
              may enable travelers to discover and participate in selected
              Indian wedding and cultural experiences offered by hosts or
              other participating parties.
            </p>

            <p>
              A wedding experience is a genuine social and cultural occasion,
              not a theatrical performance created solely for a guest. The
              actual ceremony, schedule, venue, traditions, food, family
              participation and activities may vary according to the host,
              family, location, religion, customs and circumstances.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Accurate Guest Information
            </h2>

            <p>
              You must provide information that is accurate, complete and
              current when making a booking or creating an account. This may
              include your name, contact information, age, nationality and
              other information reasonably required to operate or verify a
              booking.
            </p>

            <p>
              You must not impersonate another person, provide fraudulent
              information, use another person&apos;s account, or attempt to
              bypass identity, safety or booking controls.
            </p>

            <p>
              Where identity verification is required for a particular
              experience, participation may be subject to successful
              verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Cultural Respect and Wedding Etiquette
            </h2>

            <p>
              Indian weddings can involve religious ceremonies, family
              traditions, cultural practices and venue-specific rules. Guests
              must behave respectfully and follow reasonable instructions from
              the host, venue personnel and Wedding With India regarding
              participation.
            </p>

            <p>
              Depending on the event, you may be expected to follow a dress
              code, remove footwear, avoid certain areas, observe photography
              restrictions, follow ceremony protocols, or refrain from
              touching religious or ceremonial objects.
            </p>

            <p>
              If you are uncertain about an appropriate action, ask the host
              or designated coordinator rather than assuming that a practice
              is permitted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Prohibited Conduct
            </h2>

            <p>
              Guests must not engage in conduct that is unlawful, threatening,
              abusive, discriminatory, harassing, sexually inappropriate,
              violent, dangerous or materially disruptive.
            </p>

            <p>Without limitation, guests must not:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                threaten, intimidate, stalk, harass or abuse another person;
              </li>
              <li>
                engage in unwanted sexual conduct or inappropriate physical
                contact;
              </li>
              <li>
                damage, steal or intentionally misuse property;
              </li>
              <li>
                bring prohibited or unlawful items to an event or venue;
              </li>
              <li>
                enter restricted, private or ceremonial areas without
                permission;
              </li>
              <li>
                record or photograph people, private conversations or
                ceremonies where permission is required and has not been
                granted;
              </li>
              <li>
                distribute, sell or commercially exploit photographs,
                recordings or other event material without the necessary
                permission;
              </li>
              <li>
                use the experience to solicit, recruit, advertise or conduct
                unrelated commercial activity without authorization;
              </li>
              <li>
                deliberately misrepresent themselves to hosts, guests, vendors
                or Wedding With India; or
              </li>
              <li>
                circumvent Wedding With India&apos;s booking or payment process
                for the purpose of avoiding applicable fees or controls.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Alcohol and Intoxication
            </h2>

            <p>
              Guests must comply with applicable laws and the rules of the
              relevant venue and host concerning alcohol and other substances.
              A guest must not become intoxicated to the extent that their
              conduct creates a safety risk, disrupts the event or affects
              other participants.
            </p>

            <p>
              Wedding With India may require a guest to leave an experience,
              suspend participation, or take other reasonable protective
              measures where the guest&apos;s conduct creates a safety or
              disruption concern. Any refund will be determined under the
              applicable cancellation and refund terms and the circumstances of
              the case; no automatic refund is promised for removal resulting
              from a guest&apos;s misconduct.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Personal Safety
            </h2>

            <p>
              Guests are responsible for exercising reasonable care for their
              own safety and for following lawful safety instructions issued by
              hosts, venues, coordinators and relevant authorities.
            </p>

            <p>
              Wedding With India may facilitate an introduction or booking,
              but an experience can involve ordinary travel, crowds, traffic,
              stairs, weather, food, animals, uneven surfaces, transportation
              and other risks associated with attending real-world events.
            </p>

            <p>
              Guests should assess whether an experience is appropriate for
              their individual circumstances and should disclose relevant
              accessibility requirements or other booking needs where the
              platform provides a mechanism to do so.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Travel, Visa and Immigration Responsibilities
            </h2>

            <p>
              You are solely responsible for obtaining and maintaining any
              passport, visa, entry permission, permits, vaccination
              documentation, travel authorization or other documentation
              required for your journey and participation.
            </p>

            <p>
              Wedding With India does not guarantee that you will be granted a
              visa or admitted into India, and a booking does not constitute
              immigration advice, visa sponsorship or a guarantee of entry.
            </p>

            <p>
              You should obtain information from the relevant Indian
              government authorities or qualified professional advisers before
              travelling where immigration or visa advice is required.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Travel Insurance and Medical Needs
            </h2>

            <p>
              Guests are strongly encouraged to obtain appropriate travel and
              medical insurance before travelling to India. Wedding With India
              does not provide personal travel insurance or medical insurance
              unless a specific service expressly states otherwise.
            </p>

            <p>
              Guests are responsible for assessing their own medical,
              accessibility, dietary and other personal requirements and for
              carrying any medication or documentation they lawfully require.
            </p>

            <p>
              Information provided through an experience about food, health,
              accessibility or local conditions should not be treated as
              professional medical advice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Food, Allergies and Dietary Requirements
            </h2>

            <p>
              Indian weddings may involve unfamiliar ingredients, shared food,
              spices, nuts, dairy, gluten, eggs, meat or other allergens.
              Guests are responsible for communicating known dietary
              requirements or allergies before participating where the booking
              process allows.
            </p>

            <p>
              Wedding With India cannot guarantee an allergen-free environment
              unless an applicable experience expressly provides such a
              guarantee. Guests with serious allergies or medical dietary
              requirements should take appropriate precautions and make their
              own informed decisions about participation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Photography, Video and Privacy of Others
            </h2>

            <p>
              Wedding celebrations frequently involve photography and video,
              but guests must respect the privacy and wishes of hosts, family
              members, children and other attendees.
            </p>

            <p>
              Do not intentionally photograph, record, publish or commercially
              use identifiable images or recordings of another person where
              permission is required or where doing so would reasonably violate
              that person&apos;s privacy or event restrictions.
            </p>

            <p>
              Additional consent may be required for commercial use,
              advertising, promotional content or publication outside the
              ordinary personal use of an attendee.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Children and Vulnerable Persons
            </h2>

            <p>
              Unless an experience expressly permits otherwise, bookings are
              intended for adults. A person under the applicable age of
              majority must not participate without the required consent and
              supervision of a parent, legal guardian or other authorized adult.
            </p>

            <p>
              Guests must never engage in inappropriate, exploitative or
              unsafe conduct involving children or vulnerable persons. Any
              safeguarding concern may be reported to Wedding With India and,
              where appropriate, to the relevant authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Booking and Payment Integrity
            </h2>

            <p>
              Guests must use the official Wedding With India booking and
              payment process where one is provided for the experience.
            </p>

            <p>
              Guests must not make false payment claims, use unauthorized
              payment methods, initiate fraudulent chargebacks, manipulate
              booking systems, or intentionally provide misleading information
              to obtain a booking, refund or other benefit.
            </p>

            <p>
              Booking prices, taxes, platform charges, cancellation terms and
              other applicable charges will be presented through the relevant
              booking flow or applicable terms. If there is a conflict between
              this agreement and transaction-specific terms presented before
              payment, the transaction-specific terms will apply to that
              particular booking to the extent of the conflict.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Cancellations, Changes and Event Disruptions
            </h2>

            <p>
              Wedding dates, venues, schedules and activities can change due to
              circumstances outside the control of Wedding With India,
              including family decisions, venue restrictions, weather,
              transportation disruption, government action, public emergencies
              or other events beyond reasonable control.
            </p>

            <p>
              Where a booking is changed or cancelled, the applicable refund,
              credit, replacement or other remedy will be determined according
              to the booking&apos;s stated cancellation and refund terms and
              applicable law.
            </p>

            <p>
              Wedding With India does not guarantee that every advertised
              activity will occur exactly as originally described where
              circumstances reasonably require a change.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Removal, Suspension or Refusal of Participation
            </h2>

            <p>
              Wedding With India, the host or the relevant venue may refuse,
              suspend or end a guest&apos;s participation where reasonably
              necessary to protect safety, privacy, property, the integrity of
              the event or the rights of other participants, including where a
              guest violates this agreement or applicable law.
            </p>

            <p>
              Where reasonably possible, Wedding With India may provide the
              guest with an opportunity to address a concern before taking
              action. Immediate protective action may be taken where the
              circumstances reasonably require it.
            </p>

            <p>
              Removal or suspension does not automatically create a right to a
              refund. Any refund or other remedy will be determined under the
              applicable booking terms and applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Damage and Personal Property
            </h2>

            <p>
              Guests are responsible for damage they intentionally or
              negligently cause to property, equipment or facilities, subject
              to applicable law.
            </p>

            <p>
              Guests are also responsible for their personal belongings.
              Wedding With India does not guarantee the security of personal
              property at an event unless expressly agreed in writing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. Third-Party Services
            </h2>

            <p>
              An experience may involve independent hosts, venues,
              transportation providers, accommodation providers, caterers,
              photographers, guides or other third parties.
            </p>

            <p>
              Unless expressly stated otherwise, Wedding With India does not
              own or control those independent third parties and cannot
              guarantee every aspect of their services, availability,
              qualifications or performance.
            </p>

            <p>
              Nothing in this agreement removes any rights or remedies that
              cannot lawfully be excluded or limited under applicable consumer
              protection law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              17. Privacy and Personal Data
            </h2>

            <p>
              Wedding With India may process personal information necessary to
              create accounts, verify users, facilitate bookings, communicate
              with participants, provide safety and support functions, process
              payments, prevent fraud and comply with legal obligations.
            </p>

            <p>
              Personal data will be handled in accordance with the Wedding With
              India Privacy Policy and applicable data protection law.
            </p>

            <p>
              Guests should not provide unnecessary sensitive or personal
              information about another person through the platform without a
              lawful basis or appropriate authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              18. Reporting a Safety or Conduct Concern
            </h2>

            <p>
              If you experience or observe harassment, violence, serious
              misconduct, fraud, unsafe conditions or another significant
              concern connected with a Wedding With India experience, report it
              through the platform&apos;s available support or reporting
              channel as soon as reasonably possible.
            </p>

            <p>
              Where there is an immediate threat to life or safety, contact
              the appropriate local emergency services or authorities first.
              Wedding With India&apos;s support channels are not a substitute
              for emergency services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              19. Guest Representations
            </h2>

            <p>
              By booking or participating, you represent that you have the
              legal capacity required to enter into this agreement and that
              your participation will comply with applicable law and the
              requirements applicable to your travel.
            </p>

            <p>
              If you are making a booking on behalf of another traveler, you
              represent that you are authorized to provide information and
              accept the applicable terms on that traveler&apos;s behalf where
              legally permitted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              20. Relationship With Wedding With India
            </h2>

            <p>
              Participation as a guest does not create an employment,
              partnership, agency, joint venture, franchise or other similar
              relationship between you and Wedding With India unless expressly
              agreed in writing.
            </p>

            <p>
              A guest is participating in an experience through the platform
              and remains responsible for their own actions and decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              21. Limitation of Responsibility
            </h2>

            <p>
              To the maximum extent permitted by applicable law, Wedding With
              India is not responsible for losses, injuries, delays,
              cancellations, missed travel connections, visa decisions,
              personal property loss, or acts or omissions of independent
              third parties to the extent such matters are outside
              Wedding With India&apos;s reasonable control.
            </p>

            <p>
              Nothing in this agreement excludes or limits liability that
              cannot lawfully be excluded or limited under applicable law,
              including applicable consumer protection rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              22. Changes to This Agreement
            </h2>

            <p>
              Wedding With India may update this agreement from time to time to
              reflect changes to the platform, business operations, applicable
              law, safety requirements or industry practices.
            </p>

            <p>
              The version applicable to a particular booking will generally be
              the version accepted or presented at the relevant time, subject
              to any mandatory requirements of applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              23. Governing Law and Disputes
            </h2>

            <p>
              This agreement is intended to be governed by the laws applicable
              in India, subject to any mandatory consumer protection or other
              legal rights that apply to the guest based on the circumstances
              of the transaction.
            </p>

            <p>
              The parties should first attempt to resolve disputes through
              Wedding With India&apos;s customer support process. Nothing in
              this clause prevents a consumer from exercising a mandatory
              statutory right or approaching an authority or forum that has
              jurisdiction under applicable law.
            </p>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-amber-700"
                size={21}
                aria-hidden="true"
              />

              <div className="space-y-2">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Important
                </h2>

                <p>
                  Wedding With India is a platform for discovering and
                  facilitating participation in Indian wedding experiences.
                  Unless a particular booking expressly states otherwise,
                  Wedding With India is not the guest&apos;s immigration
                  adviser, travel insurer, medical provider, transportation
                  provider or venue operator.
                </p>

                <p className="text-sm text-charcoal-600">
                  Guests should review the specific booking terms, cancellation
                  policy, Privacy Policy and Terms of Service before completing
                  a purchase.
                </p>
              </div>
            </div>
          </section>

          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              This page provides contractual information for users of Wedding
              With India. It is not a substitute for individualized legal,
              immigration, tax, medical or travel advice. Wedding With India
              may update its policies as its services and applicable laws
              evolve.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
