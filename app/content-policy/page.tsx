import { Metadata } from "next";
import Link from "next/link";
import { FileText, Star, Eye, ShieldCheck, Flag, Clock } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Content & Review Moderation Policy",
  description:
    "Standards for user-generated content, authentic guest reviews, host descriptions, copyright complaints, and content moderation on WeddingWithIndia.",
  alternates: {
    canonical: "https://weddingwithindia.com/content-policy",
  },
};

export default function ContentPolicyPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <FileText size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Content & Review Policy
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            How we protect content integrity, authenticate verified guest reviews, enforce intellectual property rights, and moderate user submissions.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Verified Guest Reviews */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Star className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Authentic, Verified Guest Reviews
            </h2>
            <p>
              We believe in honest, transparent feedback. In compliance with the Indian Consumer Protection (E-Commerce) Rules, 2020 and US FTC guidelines on consumer reviews:
            </p>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li><strong>Only Verified Attendees Can Review:</strong> Reviews may only be submitted by travelers with a completed booking who have physically checked in and attended the wedding experience.</li>
              <li><strong>No Fabricated or Paid Reviews:</strong> We never generate fake reviews, create mock traveler profiles, or pay for positive testimonials.</li>
              <li><strong>Unbiased Feedback:</strong> We do not remove or suppress genuine negative reviews simply because they are critical, provided they comply with our anti-defamation and decency standards.</li>
              <li><strong>Host Public Responses:</strong> Hosts are given the opportunity to provide a respectful public response to constructive guest feedback.</li>
            </ul>
          </section>

          {/* Section 2: Prohibited Content */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Prohibited Content Standards
            </h2>
            <p>The following content types are strictly prohibited across all profile bios, descriptions, reviews, and messages:</p>
            <ul className="space-y-1.5 list-disc list-inside text-charcoal-600">
              <li>Defamatory, slanderous, abusive, or profane language</li>
              <li>Hate speech or discrimination based on race, religion, nationality, caste, gender, or disability</li>
              <li>Sexually explicit material, nudity, or graphic depictions of violence</li>
              <li>Personal phone numbers, private home addresses, or confidential identification documents</li>
              <li>Commercial advertisements, spam links, or solicitations for unauthorized services</li>
            </ul>
          </section>

          {/* Section 3: Intellectual Property & Takedowns */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Eye className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Copyright & Intellectual Property Takedown
            </h2>
            <p>
              If you believe any photograph, video, or text published on WeddingWithIndia infringes upon your copyright or intellectual property rights, please submit a formal takedown request under the Information Technology (Intermediary Guidelines) Rules, 2021 to our designated officer:
            </p>
            <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 text-xs sm:text-sm space-y-1 text-charcoal-700">
              <p><strong>Grievance & IP Officer:</strong> {LEGAL_CONFIG.GRIEVANCE_OFFICER.NAME}</p>
              <p><strong>Email:</strong> <a href={`mailto:${LEGAL_CONFIG.GRIEVANCE_OFFICER.EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold">{LEGAL_CONFIG.GRIEVANCE_OFFICER.EMAIL}</a></p>
              <p><strong>Address:</strong> {LEGAL_CONFIG.GRIEVANCE_OFFICER.ADDRESS}</p>
              <p className="text-xs text-charcoal-500 pt-1">Please include the specific URL, identification of the copyrighted work, and a statement of good-faith ownership.</p>
            </div>
          </section>

          {/* Section 4: Content Moderation Process */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Flag className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Review Moderation & Appeals
            </h2>
            <p>
              Reported content is reviewed by our Trust & Safety team. If your content was moderated or removed and you believe this was done in error, you may submit an appeal via <a href={`mailto:${LEGAL_CONFIG.SAFETY_EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold">{LEGAL_CONFIG.SAFETY_EMAIL}</a> within 14 days of the moderation decision.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Policies</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/photo-video-consent" className="hover:text-[var(--color-brand-primary)] underline">Photo & Video Consent</Link>
              <Link href="/acceptable-use" className="hover:text-[var(--color-brand-primary)] underline">Acceptable Use Policy</Link>
              <Link href="/grievance" className="hover:text-[var(--color-brand-primary)] underline">Grievance Redressal</Link>
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
