import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Heart, AlertCircle, Phone, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { LEGAL_CONFIG } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "Guest Safety Guide",
  description:
    "Comprehensive safety guidelines, cultural etiquette, and emergency protocols for international travelers attending Indian wedding experiences through WeddingWithIndia.",
  alternates: {
    canonical: "https://weddingwithindia.com/guest-safety",
  },
};

export default function GuestSafetyPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Guest Safety Guide
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Everything you need to know about celebrating safely, respecting cultural boundaries, and getting support before, during, and after your wedding experience.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Our Safety Approach */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Heart className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Our Safety Philosophy: Clear Details & Human Support
            </h2>
            <p>
              Indian weddings are joyous, multi-generational family celebrations. While we do not operate as an emergency responder or insurer, our platform reduces uncertainty by ensuring you have verified celebration details, direct host communication, and dedicated cultural coordinator liaison before you step onto the venue grounds.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200/60">
                <h3 className="font-semibold text-charcoal-900 text-sm mb-1">What WeddingWithIndia Provides</h3>
                <ul className="text-xs space-y-1.5 text-charcoal-600 list-disc list-inside">
                  <li>Reviewed host family listings with authenticated wedding dates</li>
                  <li>Clear ceremonial schedule, venue maps, and dress codes</li>
                  <li>Local on-site coordinator liaison and digital event hub</li>
                  <li>Cryptographic QR guest passes for organized entry</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-warm-50 border border-warm-200/60">
                <h3 className="font-semibold text-charcoal-900 text-sm mb-1">What You Are Responsible For</h3>
                <ul className="text-xs space-y-1.5 text-charcoal-600 list-disc list-inside">
                  <li>Valid passport, tourist visa, and travel permits</li>
                  <li>Comprehensive international travel & health insurance</li>
                  <li>Personal transportation and hotel accommodation</li>
                  <li>Respectful adherence to host family guidelines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Before You Arrive */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <CheckCircle2 className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Preparing for the Celebration
            </h2>
            <p>
              To ensure a smooth and respectful experience:
            </p>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li><strong>Dietary & Allergy Notes:</strong> Fill out your dietary preferences in your traveler dashboard in advance so hosts can inform caterers.</li>
              <li><strong>Attire & Modesty:</strong> Follow the clothing guidance for specific ceremonies (e.g. covering heads at Gurdwara ceremonies, removing footwear before entering prayer areas).</li>
              <li><strong>Local Transportation:</strong> Plan your rides to and from venues with reputable app-based cabs or hotel concierge transport.</li>
            </ul>
          </section>

          {/* Section 3: Physical & Cultural Boundaries */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Sparkles className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Respecting Cultural & Personal Boundaries
            </h2>
            <p>
              Participation in dancing, rituals, and games is warmly encouraged but always voluntary. You are never obligated to participate in any ritual that makes you uncomfortable.
            </p>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle size={16} /> Photography & Sacred Moments
              </p>
              <p>
                Certain sacred rituals (such as the Vedic Saat Phere, Anand Karaj ardas, or prayer chants) require quiet reverence. Please observe photographer guidelines and avoid stepping into ritual areas without host invitation. Review our full <Link href="/photo-video-consent" className="underline font-semibold">Photo & Video Consent Policy</Link>.
              </p>
            </div>
          </section>

          {/* Section 4: Emergency Assistance */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Phone className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Emergency & Urgent Support in India
            </h2>
            <p>
              If you experience an immediate safety, medical, or legal emergency while in India, contact local emergency services immediately:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-3 bg-warm-50 rounded-xl border border-warm-200">
                <div className="font-bold text-base text-[var(--color-brand-primary)]">{LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.NATIONAL_EMERGENCY}</div>
                <div className="text-charcoal-600 font-medium">All Emergency Services</div>
              </div>
              <div className="p-3 bg-warm-50 rounded-xl border border-warm-200">
                <div className="font-bold text-base text-[var(--color-brand-primary)]">{LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.TOURIST_HELPLINE_24X7}</div>
                <div className="text-charcoal-600 font-medium">24/7 Tourist Helpline (Govt)</div>
              </div>
              <div className="p-3 bg-warm-50 rounded-xl border border-warm-200">
                <div className="font-bold text-base text-[var(--color-brand-primary)]">{LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.AMBULANCE}</div>
                <div className="text-charcoal-600 font-medium">Medical Ambulance</div>
              </div>
            </div>
            <p className="text-xs text-charcoal-500">
              For non-emergency platform support or reporting an issue with a host or coordinator, email <a href={`mailto:${LEGAL_CONFIG.SAFETY_EMAIL}`} className="text-[var(--color-brand-primary)] font-semibold">{LEGAL_CONFIG.SAFETY_EMAIL}</a> or visit our <Link href="/incident-report" className="underline font-semibold">Incident Reporting</Link> page.
            </p>
          </section>

          {/* Section 5: Related Policies */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Trust & Safety Policies</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/community-guidelines" className="hover:text-[var(--color-brand-primary)] underline">Community Guidelines</Link>
              <Link href="/traveler-agreement" className="hover:text-[var(--color-brand-primary)] underline">Traveler Agreement</Link>
              <Link href="/insurance" className="hover:text-[var(--color-brand-primary)] underline">Insurance Advice</Link>
              <Link href="/travel-visa" className="hover:text-[var(--color-brand-primary)] underline">Visa Information</Link>
              <Link href="/cancellation-policy" className="hover:text-[var(--color-brand-primary)] underline">Cancellation Policy</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
