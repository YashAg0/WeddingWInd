import { Metadata } from "next";
import { Award, Clock, ShieldCheck, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Trademark & Brand Policy",
  description:
    "Official trademark and brand usage policy for WeddingWithIndia, including guidelines for brand assets and logos.",
  keywords: [
    "WeddingWithIndia trademark",
    "WeddingWithIndia logo",
    "WeddingWithIndia brand guidelines",
    "WeddingWithIndia brand policy",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/trademark",
  },
  openGraph: {
    title: "Trademark & Brand Policy | WeddingWithIndia",
    description:
      "Guidelines for using the WeddingWithIndia name, logo, and brand assets.",
    url: "https://weddingwithindia.com/trademark",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trademark & Brand Policy | WeddingWithIndia",
    description:
      "Guidelines for using the WeddingWithIndia name, logo, and brand assets.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TrademarkPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Award size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Trademark & Brand Policy
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            This policy explains how the Wedding With India name, logo,
            content and other brand assets may be used.
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
                  Our intellectual property
                </h2>

                <p>
                  “Wedding With India”, the Wedding With India name, logos,
                  visual identity, original website content, graphics,
                  photographs, illustrations, written materials and other
                  original brand assets are owned by, licensed to, or used by
                  Wedding With India and may be protected by applicable
                  intellectual property laws.
                </p>

                <p className="text-sm text-charcoal-600">
                  The legal status of a particular mark may vary by jurisdiction
                  and by the specific mark or class of goods or services.
                  Nothing on this page should be interpreted as a claim that
                  every Wedding With India mark is registered in every
                  jurisdiction.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Wedding With India Name
            </h2>

            <p>
              “Wedding With India” is the name used by the platform and its
              associated services. The name should not be used in a manner that
              suggests that an individual, company, event, organization,
              website, social-media account, product or service is officially
              operated, endorsed, sponsored or affiliated with Wedding With
              India when no such relationship exists.
            </p>

            <p>
              References to Wedding With India must not be presented in a way
              that could reasonably confuse customers about the source,
              sponsorship or affiliation of a product or service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Logo and Visual Brand Assets
            </h2>

            <p>
              The Wedding With India logo, wordmark, icons, graphics, brand
              illustrations and other distinctive visual elements are protected
              brand assets.
            </p>

            <p>
              Unless expressly authorized in writing, third parties must not
              modify, recolor, distort, animate, recreate, combine or otherwise
              alter the official logo or other distinctive brand assets.
            </p>

            <p>
              Brand assets must not be incorporated into another company&apos;s
              logo, trademark, domain name, application icon, social-media
              identity or other branding.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Limited Permitted References
            </h2>

            <p>
              Genuine customers, hosts, agents, media organizations and other
              third parties may refer to Wedding With India for truthful,
              non-misleading purposes, such as identifying the platform through
              which they made a booking or participated in an experience.
            </p>

            <p>
              Such references must not imply that Wedding With India has
              endorsed, sponsored or approved the person, organization, event
              or product unless that relationship actually exists.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Agents, Partners and Representatives
            </h2>

            <p>
              Authorized agents, referral partners, hosts and other
              participants may use Wedding With India brand assets only to the
              extent permitted by their applicable agreement or written
              authorization.
            </p>

            <p>
              Authorization to use a Wedding With India logo or name does not
              automatically grant permission to represent oneself as an
              employee, legal representative, owner, franchisee, subsidiary or
              partner of Wedding With India.
            </p>

            <p>
              Unless expressly agreed in writing, participation in the Wedding
              With India platform does not create a partnership, employment,
              agency, franchise or joint-venture relationship.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Media, Press and Editorial Use
            </h2>

            <p>
              Journalists, publishers, researchers and other legitimate media
              organizations may use the Wedding With India name in truthful
              editorial references to the platform.
            </p>

            <p>
              Use of official logos, promotional graphics, proprietary
              screenshots or other brand assets in commercial campaigns,
              advertisements, sponsored content or promotional materials may
              require prior written permission.
            </p>

            <p>
              Media coverage must not imply an endorsement or commercial
              relationship that does not exist.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Domain Names and Social Media
            </h2>

            <p>
              Third parties must not register or operate a domain name, social
              media account, application, newsletter or other digital property
              that intentionally imitates Wedding With India or is likely to
              cause confusion regarding its ownership or affiliation.
            </p>

            <p>
              This includes attempts to impersonate Wedding With India,
              misdirect users, collect passwords or payment information, or
              otherwise exploit the reputation of the brand.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Copyright and Website Content
            </h2>

            <p>
              Unless otherwise stated, original text, software, layouts,
              graphics, photographs, illustrations, videos and other creative
              materials published through Wedding With India are owned by,
              licensed to, or used with permission by Wedding With India or
              their respective rights holders.
            </p>

            <p>
              No general license is granted to copy, reproduce, distribute,
              modify, publicly display, commercially exploit or create
              derivative works from protected Wedding With India content.
            </p>

            <p>
              Limited personal, non-commercial use may be permitted where
              allowed by applicable law. Any third-party content remains the
              property of its respective owner.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Prohibited Uses
            </h2>

            <p>
              You must not use the Wedding With India name, logo or other brand
              assets:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                to impersonate Wedding With India or falsely claim affiliation;
              </li>
              <li>
                to advertise an unauthorized service as an official Wedding
                With India service;
              </li>
              <li>
                in a manner that is misleading, deceptive, defamatory or
                unlawful;
              </li>
              <li>
                in connection with fraudulent bookings, phishing or payment
                scams;
              </li>
              <li>
                as part of another trademark, business name, domain name or
                application identity without authorization;
              </li>
              <li>
                to suggest that Wedding With India endorses political,
                religious, commercial or other unrelated activities;
              </li>
              <li>
                in merchandise or commercial products without prior written
                authorization; or
              </li>
              <li>
                in any other manner that is likely to damage the reputation or
                distinctiveness of the brand.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Trademark Symbols and Registration Status
            </h2>

            <p>
              Wedding With India will use trademark symbols and registration
              statements only where appropriate to the actual legal status of
              the relevant mark.
            </p>

            <p>
              The use of “TM” may identify a claimed or unregistered trademark,
              while “®” is reserved for a mark that is actually registered in
              the relevant jurisdiction and in accordance with applicable law.
            </p>

            <p>
              The absence of a trademark symbol does not mean that Wedding With
              India has abandoned or waived any intellectual property rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. Trademark Applications and Future Registrations
            </h2>

            <p>
              Wedding With India may apply for, register, maintain, renew,
              expand or otherwise protect its trademarks and other intellectual
              property in India and other jurisdictions as the business grows.
            </p>

            <p>
              The scope and status of any registration depends on the relevant
              application, jurisdiction, goods or services classification and
              applicable law.
            </p>

            <p>
              Registration in one country does not automatically create
              identical rights in every other country.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Requests for Brand Permission
            </h2>

            <p>
              If you would like to use the Wedding With India logo, official
              graphics or other brand assets for a commercial, partnership,
              advertising, event, media or other purpose that is not clearly
              permitted by this policy, obtain written permission before using
              them.
            </p>

            <p>
              Permission may be granted, limited, conditioned or withdrawn at
              Wedding With India&apos;s discretion, subject to applicable law
              and any separate written agreement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Reporting Brand Misuse
            </h2>

            <p>
              If you believe that a person or organization is impersonating
              Wedding With India, using its brand without authorization,
              operating a fraudulent website or social-media account, or
              otherwise infringing intellectual property rights, please report
              the matter through the official Wedding With India support
              channel.
            </p>

            <p>
              When reporting an alleged infringement, provide enough
              information for the matter to be investigated, including the
              relevant URL, account, screenshot or other available evidence.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Enforcement
            </h2>

            <p>
              Wedding With India reserves the right, subject to applicable law,
              to take reasonable action against unauthorized or misleading use
              of its intellectual property, including requesting removal of
              infringing material, restricting platform access, terminating
              unauthorized use, reporting fraudulent activity, or pursuing
              available legal remedies.
            </p>

            <p>
              Nothing in this policy limits any rights or remedies available
              under applicable intellectual property or other laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Third-Party Trademarks
            </h2>

            <p>
              Names, logos and trademarks belonging to other companies,
              organizations, wedding venues, technology providers, payment
              providers or other third parties remain the property of their
              respective owners.
            </p>

            <p>
              Their appearance on the Wedding With India platform does not
              necessarily indicate ownership, sponsorship or endorsement by
              Wedding With India.
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
                  Important legal notice
                </h2>

                <p>
                  Nothing on this page should be interpreted as a statement
                  that a particular Wedding With India trademark is registered
                  unless that registration has actually been granted and
                  remains in force in the relevant jurisdiction.
                </p>

                <p className="text-sm text-charcoal-600">
                  Intellectual property rights can arise from different legal
                  sources, including trademark, copyright, design and other
                  applicable laws. The exact scope of protection depends on the
                  relevant work, mark, jurisdiction and circumstances.
                </p>
              </div>
            </div>
          </section>

          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              This policy may be updated as Wedding With India&apos;s brand
              portfolio, registrations, partnerships and applicable laws
              develop. The latest version published on this website will
              describe the current brand-use requirements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
