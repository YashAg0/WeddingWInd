"use client";

import { useState } from "react";
import { ArrowRight, Heart, ShieldCheck, DollarSign, Gift, Users } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";
import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";

const hostFAQs = [
  {
    q: "Who pays for the guests' clothing?",
    a: "Guests are responsible for hiring or buying their traditional attire. We encourage hosts to recommend local tailors, but the guest pays for all personal garments."
  },
  {
    q: "How many guests should we invite?",
    a: "It is entirely up to you. Most families invite between 5 to 20 international guests. Your wedding will continue exactly as planned; guests simply join the festivities."
  },
  {
    q: "How do we receive our payouts?",
    a: "Earnings are held securely in a trust account when the traveler books. They are transferred directly to your bank account within 3 business days after the wedding celebrations conclude."
  },
  {
    q: "How does the screening process work?",
    a: "Travelers submit passport scans, social profiles, and write a motivational statement explaining why they wish to attend. You have final approval on every single application."
  }
];

export default function ForCouplesPage() {
  const [guestCount, setGuestCount] = useState(10);
  const [pricePerGuest, setPricePerGuest] = useState(11999); // default: Celebration Experience tier (INR)

  // Host receives 72% of core booking value (per Numbers.pdf)
  const grossEarnings = guestCount * pricePerGuest;
  const hostEarnings = Math.round(grossEarnings * 0.72);
  const totalEarnings = hostEarnings;

  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      
      {/* Hero */}
      <section className="container-luxury text-center max-w-3xl mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Heart size={12} />
          Become a Host Couple
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-charcoal-900 leading-tight">
          Share your joy. <span className="text-gradient-brand">Welcome the world</span>.
        </h1>
        <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed">
          Open your wedding gates to global travelers. Share your sacred traditions, create lifelong friendships, and offset your wedding expenses.
        </p>
      </section>

      {/* Why Host Benefits Grid */}
      <section className="container-luxury grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        
        {/* Benefit 1 */}
        <div className="bg-white border border-warm-200/50 p-8 rounded-[2rem] shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-maroon-50 text-[var(--color-brand-primary)] mx-auto flex items-center justify-center">
            <Gift size={20} />
          </div>
          <h3 className="font-display font-bold text-lg text-charcoal-900">Cultural Pride</h3>
          <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
            Showcase the colors, rituals, music, and cuisine of your region to global travelers who appreciate authentic heritage.
          </p>
        </div>

        {/* Benefit 2 */}
        <div className="bg-white border border-warm-200/50 p-8 rounded-[2rem] shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-maroon-50 text-[var(--color-brand-primary)] mx-auto flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <h3 className="font-display font-bold text-lg text-charcoal-900">Offset Expenses</h3>
          <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
            Hosting guests helps offset the cost of venues, catering, or your honeymoon. Receive secure, guaranteed payouts.
          </p>
        </div>

        {/* Benefit 3 */}
        <div className="bg-white border border-warm-200/50 p-8 rounded-[2rem] shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-maroon-50 text-[var(--color-brand-primary)] mx-auto flex items-center justify-center">
            <Users size={20} />
          </div>
          <h3 className="font-display font-bold text-lg text-charcoal-900">Global Friendships</h3>
          <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
            Forge deep relationships with international guests who join your celebrations as family, not tourists.
          </p>
        </div>

      </section>

      {/* Interactive Earnings Calculator */}
      <section className="container-luxury max-w-4xl bg-white border border-warm-200/50 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <SectionHeader
            title="Calculate Your Earnings"
            align="left"
            className="mb-0"
          />
          <p className="text-charcoal-600 text-sm leading-relaxed">
            Specify the number of international guest slots you want to share and the price per guest based on your luxury level and food inclusions.
          </p>

          {/* Guest slots selector */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-charcoal-500 uppercase tracking-wider">
              <span>Guest Slots</span>
              <span className="text-[var(--color-brand-primary)] font-black">{guestCount} slots</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full h-1.5 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-primary)]"
            />
          </div>

          {/* Price selector — tiers in INR per Numbers.pdf */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-charcoal-500 uppercase tracking-wider">
              <span>Guest Tier (per guest)</span>
              <span className="text-[var(--color-brand-primary)] font-black">₹{pricePerGuest.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="7499"
              max="29999"
              step="4500"
              value={pricePerGuest}
              onChange={(e) => setPricePerGuest(Number(e.target.value))}
              className="w-full h-1.5 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-primary)]"
            />
            <div className="flex justify-between text-[0.6rem] text-charcoal-400 font-medium">
              <span>₹7,499 Cultural</span>
              <span>₹11,999 Celebration</span>
              <span>₹17,999 Immersive</span>
              <span>₹29,999 Premium</span>
            </div>
          </div>
        </div>

        {/* Results output Card */}
        <div className="bg-maroon-900 text-white rounded-[2rem] p-8 text-center space-y-4 relative overflow-hidden shadow-md">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          
          <span className="inline-block text-[0.625rem] font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
            Estimated Earnings
          </span>
          
          <h4 className="font-display font-black text-4xl sm:text-5xl text-gradient-gold">
            ₹{totalEarnings.toLocaleString("en-IN")}
          </h4>

          <div className="text-white/70 text-xs space-y-1">
            <p>Host receives <strong className="text-white">72%</strong> of core booking value</p>
            <p className="text-white/50">(Gross: ₹{grossEarnings.toLocaleString("en-IN")} · Platform fee 28% = ₹{(grossEarnings - totalEarnings).toLocaleString("en-IN")})</p>
          </div>
          
          <p className="text-white/60 text-[0.6875rem] max-w-xs mx-auto leading-relaxed">
            Estimates per Numbers.pdf financial model. Actual payouts processed 7 days post-event.
          </p>
        </div>
      </section>

      {/* Safety & Vetting Check */}
      <section className="container-luxury max-w-4xl bg-warm-100 border border-warm-200/50 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-20 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[var(--color-brand-primary)] flex items-center justify-center shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <h2 className="font-display font-bold text-xl text-charcoal-900">
            Guaranteed Host Safety & Vetting
          </h2>
        </div>
        
        <p className="text-charcoal-600 text-sm leading-relaxed">
          We treat your wedding as if it were our own family event. We have built strict vetting checkpoints to ensure guests are respectful, safe, and culturally aligned:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-sm text-charcoal-800">1. Full Identity Vetting</h4>
            <p className="text-charcoal-500 text-xs leading-relaxed">
              Every guest must upload verified copies of passports and link active social profiles.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-sm text-charcoal-800">2. Motivation Review</h4>
            <p className="text-charcoal-500 text-xs leading-relaxed">
              Guests submit application letters explaining why they want to join, ensuring genuine cultural interest.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-sm text-charcoal-800">3. Local Etiquette Briefings</h4>
            <p className="text-charcoal-500 text-xs leading-relaxed">
              Guests complete a mandatory training guide outlining attire guidelines, gift rules, and ritual etiquette.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-sm text-charcoal-800">4. 24/7 Security Liaison</h4>
            <p className="text-charcoal-500 text-xs leading-relaxed">
              Our local bilingual manager monitors each event, serving as a safety buffer for both family and guests.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container-luxury max-w-3xl mb-20 space-y-10" aria-label="Frequently Asked Questions">
        <SectionHeader
          label="FAQs"
          title="Questions about hosting"
          highlightedWord="hosting"
        />

        <div className="space-y-4">
          {hostFAQs.map((faq) => (
            <details key={faq.q} className="group bg-white border border-warm-200/50 rounded-2xl p-5 shadow-sm cursor-pointer transition-colors duration-200">
              <summary className="font-sans font-bold text-sm sm:text-base text-charcoal-800 flex justify-between items-center list-none outline-none">
                <span>{faq.q}</span>
                <span className="text-charcoal-400 group-open:rotate-180 transition-transform duration-200">↓</span>
              </summary>
              <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed mt-3 pt-3 border-t border-warm-100">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-luxury text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Ready to list your celebration?
          </h2>
          <p className="text-charcoal-500 text-sm max-w-md mx-auto">
            Join {BUSINESS_METRICS.WEDDINGS_HOSTED} verified host families across India sharing their special moments with travelers from all corners of the globe.
          </p>
          <Link
            href="/login?redirect_url=/dashboard/operations"
            className="btn btn-primary btn-lg shadow-lg group inline-flex gap-2"
          >
            Register Your Wedding
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
}
