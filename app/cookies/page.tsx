import { Metadata } from "next";
import Link from "next/link";
import {
  Cookie,
  Clock,
  ExternalLink,
  Info,
  Settings2,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how WeddingWithIndia uses cookies and similar technologies for essential functionality, preferences, analytics, and security.",
  keywords: [
    "WeddingWithIndia cookie policy",
    "cookie policy",
    "cookies",
    "website cookies",
    "analytics cookies",
    "privacy",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/cookies",
  },
  openGraph: {
    title: "Cookie Policy | WeddingWithIndia",
    description:
      "How WeddingWithIndia uses cookies and similar technologies.",
    url: "https://weddingwithindia.com/cookies",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy | WeddingWithIndia",
    description:
      "How WeddingWithIndia uses cookies and similar technologies.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">

        {/* Header */}
        <header className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Cookie size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Cookie Policy
          </h1>

          <p className="max-w-2xl text-charcoal-500 text-sm sm:text-base leading-relaxed">
            This policy explains how Wedding With India uses cookies and
            similar technologies on its website and platform.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Last Updated: August 13, 2026</span>
          </div>
        </header>

        {/* Content */}
        <article className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">

          {/* Important summary */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  At a glance
                </h2>

                <p>
                  Wedding With India uses certain technologies that are
                  necessary for the website and platform to function. Other
                  technologies, such as analytics or advertising technologies,
                  may require your consent depending on the technology used,
                  your location and applicable law.
                </p>

                <p>
                  Where consent is required, non-essential technologies should
                  not be activated before the applicable consent is obtained.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. What Are Cookies?
            </h2>

            <p>
              Cookies are small text files or similar identifiers that may be
              stored on your device when you visit a website. They can allow a
              website to remember information about your visit, maintain a
              session, understand how the website is used, or provide other
              functionality.
            </p>

            <p>
              We may also use technologies that perform functions similar to
              cookies, including local storage, pixels, tags, SDKs or other
              identifiers. For simplicity, this policy refers to these
              technologies collectively as &quot;cookies and similar
              technologies.&quot;
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Categories of Cookies We May Use
            </h2>

            <div className="space-y-5">

              {/* Essential */}
              <div className="rounded-2xl border border-warm-200 p-5 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-charcoal-900">
                    Essential / Strictly Necessary
                  </h3>

                  <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Necessary
                  </span>
                </div>

                <p className="text-sm text-charcoal-600">
                  These technologies may be necessary to provide core
                  functionality, security, authentication, session management,
                  fraud prevention or other features you have specifically
                  requested.
                </p>

                <p className="text-xs text-charcoal-400">
                  Examples may include authentication/session identifiers,
                  security mechanisms and preferences required to remember your
                  cookie-consent choice.
                </p>
              </div>

              {/* Preferences */}
              <div className="rounded-2xl border border-warm-200 p-5 space-y-2">
                <h3 className="font-bold text-charcoal-900">
                  Preference / Functionality
                </h3>

                <p className="text-sm text-charcoal-600">
                  These technologies can remember choices such as language,
                  currency, display preferences or other settings so that your
                  experience can be more convenient.
                </p>

                <p className="text-xs text-charcoal-400">
                  Examples may include a selected currency such as INR, USD or
                  EUR, where such information is actually stored using a
                  cookie or similar technology.
                </p>
              </div>

              {/* Analytics */}
              <div className="rounded-2xl border border-warm-200 p-5 space-y-2">
                <h3 className="font-bold text-charcoal-900">
                  Analytics / Measurement
                </h3>

                <p className="text-sm text-charcoal-600">
                  Analytics technologies help us understand how visitors use
                  the website, such as which pages are viewed, how users move
                  through the platform and whether pages or features are
                  functioning effectively.
                </p>

                <p className="text-xs text-charcoal-400">
                  Analytics technologies are not treated as strictly necessary
                  merely because they help us improve the website. Where
                  applicable law requires consent, they will be activated only
                  after the required consent is obtained.
                </p>
              </div>

              {/* Marketing */}
              <div className="rounded-2xl border border-warm-200 p-5 space-y-2">
                <h3 className="font-bold text-charcoal-900">
                  Advertising / Marketing
                </h3>

                <p className="text-sm text-charcoal-600">
                  If Wedding With India introduces advertising, remarketing or
                  similar technologies, these may be used to measure campaigns,
                  understand advertising performance or deliver more relevant
                  advertising.
                </p>

                <p className="text-xs text-charcoal-400">
                  Such technologies will be subject to applicable consent and
                  privacy requirements. We do not currently represent that every
                  marketing technology described here is active on the website.
                </p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Cookies Used for Authentication and Platform Security
            </h2>

            <p>
              If you create an account or use authenticated areas of Wedding
              With India, cookies or similar technologies may be used to
              maintain your login session, protect your account, prevent
              unauthorized access and support security controls.
            </p>

            <p>
              Authentication and security technologies may be provided by
              third-party infrastructure providers used by Wedding With India.
              The specific providers may change as the platform develops.
            </p>

            <p>
              Disabling strictly necessary technologies may prevent certain
              account or platform functions from operating correctly.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Payment and Checkout Technologies
            </h2>

            <p>
              When you make or attempt to make a payment, payment service
              providers may use cookies or similar technologies as part of
              payment processing, fraud prevention, authentication or security.
            </p>

            <p>
              Wedding With India does not use this Cookie Policy to claim that
              a specific payment provider places a particular cookie unless
              that provider is actually integrated into the relevant website
              flow.
            </p>

            <p>
              Payment information is handled according to the applicable
              payment provider&apos;s terms and privacy documentation in
              addition to our own policies.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Analytics Technologies
            </h2>

            <p>
              We may use analytics services to understand website performance
              and user interaction.
            </p>

            <p>
              The exact analytics provider, cookies, identifiers, retention
              periods and configuration may change over time. Our technical
              implementation should therefore be kept aligned with this policy
              and our consent-management system.
            </p>

            <p>
              We will not describe an analytics service as &quot;anonymous,&quot;
              &quot;IP-anonymized&quot; or &quot;privacy-friendly&quot; unless
              the relevant configuration actually provides those characteristics.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Cookie Consent
            </h2>

            <p>
              Depending on your location and the applicable legal requirements,
              we may ask you to choose whether to allow certain non-essential
              cookies or similar technologies.
            </p>

            <p>
              Where consent is required, our consent mechanism should provide
              a clear choice and should not treat your continued browsing as
              consent to non-essential tracking.
            </p>

            <p>
              You should be able to withdraw or change your consent using the
              cookie settings mechanism made available on the website.
            </p>

            <div className="rounded-2xl border border-warm-200 bg-warm-50/70 p-5 flex items-start gap-3">
              <Settings2
                size={19}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-2">
                <h3 className="font-bold text-charcoal-900">
                  Manage your cookie choices
                </h3>

                <p className="text-sm text-charcoal-600">
                  If a cookie preference center is available on the website,
                  use the{" "}
                  <strong>&quot;Cookie Settings&quot;</strong> option to review
                  or change your choices.
                </p>
              </div>
            </div>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Browser Controls
            </h2>

            <p>
              Most modern browsers allow you to block, delete or restrict
              cookies through browser settings.
            </p>

            <p>
              Browser-level controls may affect the operation of certain
              website functions. Blocking a strictly necessary cookie may
              prevent login, checkout or other requested features from working
              correctly.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Third-Party Services
            </h2>

            <p>
              Certain features may rely on third-party providers, such as
              authentication, payment, hosting, analytics, fraud prevention,
              customer-support or other infrastructure providers.
            </p>

            <p>
              These providers may process information in accordance with their
              own terms and privacy policies. The providers actually used by
              Wedding With India should be reflected in our operational privacy
              records and, where appropriate, our consent-management system.
            </p>

            <p>
              We do not intentionally use this policy to imply that a provider
              is currently integrated when it is not.
            </p>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. Cookies and Personal Data
            </h2>

            <p>
              Some cookie identifiers or information associated with cookies
              may constitute personal data depending on the circumstances,
              applicable law and how the information is combined with other
              information.
            </p>

            <p>
              Our processing of personal data is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <p>
              Where applicable, users may have additional rights under
              applicable data-protection laws, including laws governing users
              in India, the European Economic Area, the United Kingdom or other
              jurisdictions.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. India Data Protection
            </h2>

            <p>
              Wedding With India may process digital personal data in
              connection with website operation, account management, bookings,
              communications, security and other legitimate platform
              activities.
            </p>

            <p>
              Our privacy and cookie practices are intended to evolve with
              applicable Indian data-protection requirements, including the
              Digital Personal Data Protection Act, 2023 and applicable rules
              and notifications.
            </p>

            <p>
              Nothing in this Cookie Policy is intended to state that every
              provision of a law or rule is currently applicable to every
              processing activity. Applicability depends on the relevant law,
              commencement provisions and the circumstances of the processing.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. European Users
            </h2>

            <p>
              Where European data-protection and electronic-communications
              rules apply, Wedding With India will assess the applicable legal
              requirements for cookies and similar technologies based on their
              purpose and implementation.
            </p>

            <p>
              Non-essential technologies that require prior consent should be
              configured so that they are not activated until the required
              consent has been obtained.
            </p>

            <p>
              Users should also be provided with an effective mechanism to
              change or withdraw consent where consent is the applicable legal
              basis.
            </p>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. Cookie Retention
            </h2>

            <p>
              Cookies may be either session-based or persistent.
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Session cookies</strong> generally remain on your
                device only while your browser session is active.
              </li>

              <li>
                <strong>Persistent cookies</strong> may remain until their
                configured expiration date or until they are deleted by you or
                the website.
              </li>
            </ul>

            <p>
              Exact retention periods depend on the technology actually
              deployed and should be maintained in Wedding With India&apos;s
              internal cookie inventory.
            </p>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Changes to This Cookie Policy
            </h2>

            <p>
              We may update this Cookie Policy when our technology, services,
              legal obligations or cookie practices change.
            </p>

            <p>
              When we make material changes, we will update the date displayed
              at the top of this page and may provide additional notice where
              appropriate.
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Related Policies
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <Link
                href="/privacy"
                className="group rounded-2xl border border-warm-200 p-4 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <p className="font-bold text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors">
                  Privacy Policy
                </p>

                <p className="text-xs text-charcoal-500 mt-1">
                  How personal data is processed.
                </p>

                <ExternalLink
                  size={13}
                  className="mt-3 text-charcoal-400"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/gdpr"
                className="group rounded-2xl border border-warm-200 p-4 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <p className="font-bold text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors">
                  GDPR & EU Rights
                </p>

                <p className="text-xs text-charcoal-500 mt-1">
                  Information for applicable European users.
                </p>

                <ExternalLink
                  size={13}
                  className="mt-3 text-charcoal-400"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/dpdp"
                className="group rounded-2xl border border-warm-200 p-4 hover:border-[var(--color-brand-primary)]/40 transition-colors"
              >
                <p className="font-bold text-charcoal-900 group-hover:text-[var(--color-brand-primary)] transition-colors">
                  India Data Protection
                </p>

                <p className="text-xs text-charcoal-500 mt-1">
                  Information concerning Indian privacy requirements.
                </p>

                <ExternalLink
                  size={13}
                  className="mt-3 text-charcoal-400"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-6">
            <div className="flex items-start gap-3">
              <Info
                size={20}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Questions about cookies?
                </h2>

                <p>
                  For privacy and cookie-related questions, contact:
                </p>

                <a
                  href="mailto:privacy@weddingwithindia.com"
                  className="inline-flex items-center text-[var(--color-brand-primary)] hover:underline font-semibold"
                >
                  privacy@weddingwithindia.com
                </a>
              </div>
            </div>
          </section>

          {/* Legal notice */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              <strong className="text-charcoal-900">
                Implementation notice:
              </strong>{" "}
              This policy describes the categories and principles applicable
              to Wedding With India&apos;s cookie practices. The live website
              should maintain an accurate internal cookie inventory listing
              each active cookie or similar technology, provider, purpose,
              category, duration and consent requirement. The technical
              implementation should match that inventory.
            </p>
          </section>

          {/* Footer */}
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