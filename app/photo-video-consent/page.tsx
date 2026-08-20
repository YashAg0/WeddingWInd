import { Metadata } from "next";
import Link from "next/link";
import { Camera, EyeOff, ShieldAlert, Sparkles, UserCheck, Clock } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Photo & Video Consent Policy",
  description:
    "Guidelines on photography, videography, social media sharing, sacred ritual boundaries, and media consent for Indian wedding experiences.",
  alternates: {
    canonical: "https://weddingwithindia.com/photo-video-consent",
  },
};

export default function PhotoVideoConsentPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Camera size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Photo & Video Consent Policy
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Clear guidelines on capturing memories respectfully, honoring private sacred moments, and sharing photos on social media.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Personal Memories vs Commercial Use */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Sparkles className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Personal Memories vs. Commercial Filming
            </h2>
            <p>
              Indian weddings are visually magnificent celebrations of love and culture. We want you to capture memories that will last a lifetime, but it is essential to distinguish between personal souvenir photography and commercial production:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
                <h3 className="font-semibold text-sm mb-1">Permitted (Personal Use)</h3>
                <ul className="text-xs space-y-1.5 list-disc list-inside">
                  <li>Personal souvenir photos and casual celebration clips</li>
                  <li>Sharing moments on your personal social media accounts</li>
                  <li>Group photos taken with consenting family members and guests</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/80 text-red-900">
                <h3 className="font-semibold text-sm mb-1">Strictly Prohibited (Commercial)</h3>
                <ul className="text-xs space-y-1.5 list-disc list-inside">
                  <li>Commercial filming, brand endorsements, or stock footage sales</li>
                  <li>Monetized YouTube documentaries without prior written host agreement</li>
                  <li>Livestreaming solemn religious rituals without permission</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Sacred Rituals & Photography Restrictions */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <EyeOff className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Sacred Ritual Boundaries
            </h2>
            <p>
              Certain ceremonial moments hold deep spiritual significance for the couple and their elders. During solemn prayers, fire offerings (<em>Havan</em>), or specific prayer invocations:
            </p>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li>Turn off camera flashes and audible shutter clicks.</li>
              <li>Remain in designated guest seating and do not obstruct the official family photographers or the presiding priest/officiant.</li>
              <li>Observe any specific &ldquo;no photography&rdquo; requests announced by the host family or on-site coordinator.</li>
            </ul>
          </section>

          {/* Section 3: Minors & Children */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <UserCheck className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Protection of Children & Minors
            </h2>
            <p>
              Never take close-up portraits or publish images of children attending the wedding without the explicit consent of their parents or legal guardians. Respect the family&apos;s privacy at all times.
            </p>
          </section>

          {/* Section 4: Privacy & Takedowns */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <ShieldAlert className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Media Takedown Requests
            </h2>
            <p>
              If a host family, guest, or attendee requests that you take down a photograph or video featuring them on your personal social channels, you are expected to comply promptly in the spirit of mutual respect.
            </p>
            <p className="text-xs text-charcoal-500">
              If an unauthorized image or video from an experience appears on our platform, submit a takedown request to <a href={`mailto:${LEGAL_CONFIG.MEDIA_CONSENT.TAKEDOWN_EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold">{LEGAL_CONFIG.MEDIA_CONSENT.TAKEDOWN_EMAIL}</a>.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Policies</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/community-guidelines" className="hover:text-[var(--color-brand-primary)] underline">Community Guidelines</Link>
              <Link href="/guest-safety" className="hover:text-[var(--color-brand-primary)] underline">Guest Safety Guide</Link>
              <Link href="/content-policy" className="hover:text-[var(--color-brand-primary)] underline">Content Policy</Link>
              <Link href="/traveler-agreement" className="hover:text-[var(--color-brand-primary)] underline">Traveler Agreement</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
