import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copyright,
  Image as ImageIcon,
  Mail,
  ShieldCheck,
  Upload,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Copyright, Intellectual Property & DMCA | Wedding With India",
  description:
    "Copyright, intellectual property, user content, image rights and copyright complaint procedures for Wedding With India.",
  keywords: [
    "Wedding With India copyright",
    "Wedding With India DMCA",
    "copyright policy India",
    "copyright infringement notice",
    "intellectual property policy",
    "image rights",
    "user generated content policy",
  ],
  alternates: {
    canonical: "/copyright",
  },
  openGraph: {
    title: "Copyright & Intellectual Property | Wedding With India",
    description:
      "Copyright, intellectual property and content complaint procedures for Wedding With India.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CopyrightPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Copyright size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Copyright & Intellectual Property
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Information about ownership, licensing, user-submitted content,
            image rights and copyright complaints relating to Wedding With
            India.
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
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Our intellectual-property approach
                </h2>

                <p>
                  Wedding With India respects the intellectual-property rights
                  of creators, photographers, hosts, travelers, businesses and
                  other rights holders.
                </p>

                <p>
                  We also expect users, hosts, agents, coordinators and other
                  contributors to upload or publish only content they are
                  authorized to use.
                </p>

                <p>
                  This policy explains how we approach content appearing on the
                  Platform and how rights holders can report alleged
                  infringement.
                </p>
              </div>
            </div>
          </section>

          {/* 1 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Wedding With India Content
            </h2>

            <p>
              Subject to third-party rights and applicable licences, Wedding
              With India may own or control rights in original Platform
              materials such as:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>original website copy and editorial content;</li>
              <li>original graphics and illustrations;</li>
              <li>software, interface elements and platform designs;</li>
              <li>original branding materials;</li>
              <li>original photographs and videos created for the Platform;</li>
              <li>original diagrams, layouts and visual systems; and</li>
              <li>other original creative works produced for Wedding With India.</li>
            </ul>

            <p>
              These materials may be protected under applicable copyright,
              trademark, design, contract and other intellectual-property laws.
            </p>

            <p>
              Indian copyright law is primarily governed by the Copyright Act,
              1957, as amended. The Indian Copyright Office confirms that the
              Act provides protection in the digital environment and has been
              amended to address internet-related copyright issues.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. What You May Not Do
            </h2>

            <p>
              Unless you have permission from the relevant rights holder or an
              applicable legal exception permits the use, you should not:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                reproduce substantial portions of Wedding With India content;
              </li>
              <li>
                copy Platform photography, illustrations or visual assets for
                commercial use;
              </li>
              <li>
                remove copyright, attribution or rights-management information;
              </li>
              <li>
                create a misleadingly similar website, service or brand using
                our proprietary materials;
              </li>
              <li>
                scrape, republish or systematically reproduce our editorial
                content; or
              </li>
              <li>
                represent Wedding With India content as your own original work.
              </li>
            </ul>

            <p>
              Nothing in this section is intended to restrict lawful uses
              permitted by applicable copyright law.
            </p>
          </section>

          {/* 3 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Third-Party Content and Licences
            </h2>

            <p>
              Not every visual, photograph, font, icon, map, video, logo,
              software component or other asset displayed through the Platform
              is owned by Wedding With India.
            </p>

            <p>
              Some materials may be used under a third-party licence, open
              source licence, commercial licence, permission or other lawful
              authorization.
            </p>

            <p>
              Third-party trademarks, logos and other intellectual property
              remain the property of their respective owners unless expressly
              stated otherwise.
            </p>
          </section>

          {/* 4 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Host and User-Submitted Content
            </h2>

            <p>
              Hosts, travelers, agents, coordinators and other users may submit
              information, photographs, videos, descriptions, reviews or other
              content to the Platform.
            </p>

            <p>
              Unless otherwise agreed, the person who owns the relevant rights
              generally retains ownership of their content.
            </p>

            <p>
              By submitting content, you represent that you have the necessary
              rights, permissions and authority to provide that content for the
              purposes for which you submit it.
            </p>

            <p>
              You must not upload photographs, videos or other materials
              containing identifiable people when you do not have the necessary
              permission or another lawful basis to use or share them.
            </p>
          </section>

          {/* 5 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Licence to Wedding With India
            </h2>

            <p>
              Where the Platform permits you to submit content, you grant
              Wedding With India the permissions necessary to host, store,
              reproduce, format, display and otherwise use that content for
              operating, providing and promoting the relevant Platform service,
              subject to the terms applicable to that feature.
            </p>

            <p>
              The exact scope of the licence may depend on the feature, user
              agreement, listing settings and other applicable terms.
            </p>

            <p>
              You should not submit content that you want to remain completely
              private if the relevant feature is designed for public or
              participant-facing publication.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Photography and Image Rights
            </h2>

            <div className="flex items-start gap-3">
              <ImageIcon
                size={20}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Copyright in a photograph may belong to the photographer even
                  where the photograph depicts a wedding, venue, host or guest.
                </p>

                <p>
                  Separate privacy, publicity, personality, contractual or
                  venue-related rights may also apply to people appearing in
                  photographs.
                </p>

                <p>
                  Uploading a photograph to the Platform does not automatically
                  mean that the uploader owns every right associated with every
                  person, location, logo or work depicted in that photograph.
                </p>
              </div>
            </div>
          </section>

          {/* 7 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Copyright Complaints
            </h2>

            <p>
              If you believe that content available through Wedding With India
              infringes your copyright, you may submit a copyright complaint to
              our designated copyright contact.
            </p>

            <p>
              We encourage rights holders to provide sufficient information for
              us to identify the allegedly infringing material and evaluate the
              complaint.
            </p>

            <p>
              Depending on the circumstances and applicable law, we may remove,
              restrict or disable access to allegedly infringing content while
              reviewing the complaint.
            </p>
          </section>

          {/* 8 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              8. Information to Include in a Copyright Notice
            </h2>

            <p>
              A copyright complaint should generally include enough information
              to allow us to understand the claim, including:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                identification of the copyrighted work you believe has been
                infringed;
              </li>
              <li>
                identification of the allegedly infringing material and its
                location on the Platform;
              </li>
              <li>
                your name and contact information sufficient for us to respond;
              </li>
              <li>
                a statement explaining why you believe the use is unauthorized;
              </li>
              <li>
                information reasonably sufficient to establish your authority
                to act for the rights holder, where applicable;
              </li>
              <li>
                a statement that the information provided is accurate to the
                best of your knowledge; and
              </li>
              <li>
                an electronic or physical signature where required by the
                applicable legal procedure.
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              9. DMCA Notice for U.S. Copyright Claims
            </h2>

            <p>
              Wedding With India may receive copyright complaints from rights
              holders located in the United States or elsewhere.
            </p>

            <p>
              Where the U.S. Digital Millennium Copyright Act (&ldquo;DMCA&rdquo;)
              is applicable, we may process a substantially compliant
              infringement notice in accordance with applicable U.S. law.
            </p>

            <p>
              The DMCA&apos;s Section 512 framework provides a notice-and-takedown
              system for qualifying online service providers and contains
              specific requirements for service providers seeking applicable
              safe-harbor protections.
            </p>

            <p>
              Nothing on this page should be interpreted as a representation
              that Wedding With India qualifies for every DMCA safe harbor or
              that U.S. law applies to every item of content on the Platform.
            </p>
          </section>

          {/* 10 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              10. DMCA Counter-Notification
            </h2>

            <p>
              If content has been removed or disabled following a copyright
              complaint and the person who submitted the content believes the
              removal was mistaken or unauthorized, they may contact us with
              information supporting their position.
            </p>

            <p>
              Where the DMCA&apos;s counter-notification procedure applies,
              additional statutory requirements may apply, including statements
              concerning the material&apos;s removal and the jurisdiction of
              applicable courts.
            </p>

            <p>
              We may restore content where legally appropriate after reviewing
              a valid counter-notification and any subsequent information
              provided by the complaining rights holder.
            </p>
          </section>

          {/* 11 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              11. Repeat Infringement
            </h2>

            <p>
              Where appropriate and consistent with applicable law, Wedding With
              India may restrict or terminate accounts or remove content
              associated with repeated or serious copyright infringement.
            </p>

            <p>
              We may consider relevant circumstances when determining an
              appropriate response, including the nature and frequency of
              complaints and the user&apos;s response to previous notices.
            </p>
          </section>

          {/* 12 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              12. False or Abusive Complaints
            </h2>

            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-5">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-amber-700"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <p>
                  Copyright complaints should only be submitted where the
                  complainant has a genuine basis for believing that their rights
                  have been infringed.
                </p>

                <p>
                  Knowingly submitting materially false information in a
                  copyright complaint may have legal consequences under
                  applicable law.
                </p>
              </div>
            </div>
          </section>

          {/* 13 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              13. Trademark and Brand Rights
            </h2>

            <p>
              The name, logos, visual identity and other brand assets associated
              with Wedding With India may be protected by trademark, copyright,
              passing-off, unfair competition or other applicable laws.
            </p>

            <p>
              Use of the Wedding With India name or branding in a manner that
              falsely suggests sponsorship, affiliation, endorsement or
              authorization is not permitted without appropriate permission.
            </p>

            <p>
              For brand-specific questions, see our{" "}
              <Link
                href="/trademark"
                className="text-[var(--color-brand-primary)] hover:underline font-semibold"
              >
                Trademark & Brand Policy
              </Link>
              .
            </p>
          </section>

          {/* 14 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              14. Copyright Contact
            </h2>

            <p>
              Copyright complaints and intellectual-property questions may be
              sent to:
            </p>

            <a
              href="mailto:copyright@weddingwithindia.com"
              className="inline-flex items-center gap-2 text-[var(--color-brand-primary)] hover:underline font-semibold"
            >
              <Mail size={17} aria-hidden="true" />
              copyright@weddingwithindia.com
            </a>

            <p className="text-sm text-charcoal-500">
              Please use the subject line{" "}
              <strong className="text-charcoal-700">
                Copyright Complaint
              </strong>{" "}
              when submitting an infringement notice.
            </p>
          </section>

          {/* 15 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              15. Content Review and Removal
            </h2>

            <p>
              Wedding With India may review content reported as potentially
              infringing, unlawful, misleading, unsafe or otherwise inconsistent
              with applicable Platform rules.
            </p>

            <p>
              Depending on the circumstances, content may be temporarily
              restricted while a complaint is reviewed.
            </p>

            <p>
              Removal of content does not necessarily constitute an admission
              that infringement occurred.
            </p>
          </section>

          {/* 16 */}
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              16. No Waiver of Legal Rights
            </h2>

            <p>
              This policy does not limit any rights, remedies, defenses or
              exceptions available under applicable copyright or intellectual
              property law.
            </p>

            <p>
              Where a mandatory legal requirement conflicts with this policy,
              the applicable law will control to the extent required.
            </p>
          </section>

          {/* Principles */}
          <section className="rounded-2xl border border-warm-200 bg-warm-50/60 p-6">
            <h2 className="font-display font-bold text-lg text-charcoal-900 mb-5">
              Our content principles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  title: "Respect creators",
                  text: "We respect copyright and other intellectual-property rights.",
                },
                {
                  title: "Verify submissions",
                  text: "Users should only submit content they are authorized to use.",
                },
                {
                  title: "Respond to complaints",
                  text: "We provide a process for rights holders to report alleged infringement.",
                },
                {
                  title: "Protect original work",
                  text: "We take reasonable steps to protect original Wedding With India materials.",
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

          {/* Submission CTA */}
          <section className="rounded-2xl border border-warm-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <Upload
                size={21}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <div className="space-y-3">
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Believe your work is being used without authorization?
                </h2>

                <p>
                  Send the relevant details and supporting information to our
                  copyright contact so the matter can be reviewed.
                </p>

                <a
                  href="mailto:copyright@weddingwithindia.com?subject=Copyright%20Complaint"
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  Submit Copyright Complaint
                  <ArrowRightIcon />
                </a>
              </div>
            </div>
          </section>

          {/* Legal note */}
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
                  This page provides general information about Wedding With
                  India&apos;s intellectual-property procedures. It is not legal
                  advice and does not create a lawyer-client relationship.
                </p>

                <p>
                  Copyright ownership, infringement, licensing, exceptions and
                  available remedies can depend on the applicable jurisdiction
                  and the facts of an individual case.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="pt-2 border-t border-warm-100">
            <p className="text-xs sm:text-sm text-charcoal-500">
              Last updated: August 13, 2026. Wedding With India may update this
              policy as its Platform, content systems and applicable legal
              requirements evolve.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

/**
 * Small inline icon component so the CTA remains self-contained.
 */
function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}