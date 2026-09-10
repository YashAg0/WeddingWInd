import { Metadata } from "next";
import Link from "next/link";
import { Users, HeartHandshake, ShieldAlert, Sparkles, Scale, Clock } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Community Guidelines & Code of Respect",
  description:
    "Community standards and mutual expectations for travelers, host families, and coordinators participating in WeddingWithIndia experiences.",
  alternates: {
    canonical: "https://weddingwithindia.com/trust?tab=safety#guest-guide",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Users size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Community Guidelines
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Our shared code of conduct to ensure that every wedding experience is safe, welcoming, culturally respectful, and memorable for everyone involved.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Core Principles */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <HeartHandshake className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. The Foundation: Mutual Respect & Hospitality
            </h2>
            <p>
              In Indian tradition, <em>Atithi Devo Bhava</em> (&ldquo;The Guest is Cherished&rdquo;) is balanced by the honored guest&apos;s mindful respect for the host family&apos;s home, rituals, and loved ones. Every participant on our platform agrees to treat others with kindness, warmth, and dignity regardless of nationality, race, religion, gender, or background.
            </p>
          </section>

          {/* Section 2: Standards for Guests */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Sparkles className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Guidelines for International Guests
            </h2>
            <ul className="space-y-3 list-disc list-inside text-charcoal-600">
              <li><strong>Be a Guest, Not a Spectacle:</strong> Participate as an invited friend of the family. Engage warmly with fellow guests and family members.</li>
              <li><strong>Respect Ceremony Timing & Sanctity:</strong> Indian celebrations have auspicious timings (<em>muhurat</em>). Follow the coordinator&apos;s advice on when ceremonies start and when quiet reverence is required.</li>
              <li><strong>Modesty & Dress Code:</strong> Wear attire suited to the occasion. If traditional clothing is provided or recommended, embrace it with pride and respect.</li>
              <li><strong>Alcohol & Substance Responsibility:</strong> Many Indian weddings are strictly vegetarian and alcohol-free. Even at celebrations where alcohol is served, excessive drinking, unruly behavior, or any illegal substance use is strictly prohibited.</li>
            </ul>
          </section>

          {/* Section 3: Standards for Host Families */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Users className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Guidelines for Host Families
            </h2>
            <ul className="space-y-3 list-disc list-inside text-charcoal-600">
              <li><strong>Warm Inclusion:</strong> Introduce your international guests to key family members, rituals, and traditional delicacies.</li>
              <li><strong>Accurate Celebration Itinerary:</strong> Ensure the dates, venue locations, and included ceremonies listed on your profile accurately reflect your actual celebration plans.</li>
              <li><strong>Clear Household Boundaries:</strong> Clearly communicate any private family spaces, photography restrictions, or religious customs in advance.</li>
            </ul>
          </section>

          {/* Section 4: Prohibited Conduct & Zero Tolerance */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <ShieldAlert className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Zero-Tolerance Violations
            </h2>
            <p>
              We enforce a strict zero-tolerance policy against behaviors that threaten the safety or dignity of our community:
            </p>
            <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/80 text-red-900 text-xs sm:text-sm space-y-2">
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Harassment, stalking, intimidation, or hate speech</li>
                <li>Sexual misconduct, non-consensual physical contact, or boundary violations</li>
                <li>Physical violence, property damage, or theft</li>
                <li>Possession or distribution of illegal drugs or weapons</li>
                <li>Commercial monetization or unauthorized filming of private rituals</li>
              </ul>
            </div>
            <p className="text-xs text-charcoal-500">
              Violations result in immediate removal from the event, permanent platform banning, and reporting to law enforcement authorities where warranted.
            </p>
          </section>

          {/* Section 5: Enforcement & Reporting */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Scale className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              5. Reporting Concerns
            </h2>
            <p>
              If you witness or experience behavior that violates these guidelines, report it immediately to your on-site coordinator or via our <Link href="/incident-report" className="text-[var(--color-brand-primary)] underline font-semibold">Incident Report</Link> portal. You may also contact Trust & Safety directly at <a href={`mailto:${LEGAL_CONFIG.SAFETY_EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold">{LEGAL_CONFIG.SAFETY_EMAIL}</a>.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Policies</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/acceptable-use" className="hover:text-[var(--color-brand-primary)] underline">Acceptable Use Policy</Link>
              <Link href="/photo-video-consent" className="hover:text-[var(--color-brand-primary)] underline">Photo & Video Consent</Link>
              <Link href="/guest-safety" className="hover:text-[var(--color-brand-primary)] underline">Guest Safety Guide</Link>
              <Link href="/host-safety" className="hover:text-[var(--color-brand-primary)] underline">Host Safety Guide</Link>
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
