import { Metadata } from "next";
import { Cookie, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | Wedding With India",
  description: "Comprehensive Cookie Policy explaining essential, analytical, and functional cookies on Wedding With India.",
};

export default function CookiesPage() {
  return (
    <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20 rounded-[2.5rem]">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Cookie size={22} />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Cookie Policy
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} />
            <span>Last Updated: August 2026</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Cookie Usage Categories
            </h2>
            <p>
              We use session and persistent cookies strictly for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Essential Cookies:</strong> Clerk session tokens and Stripe checkout security tokens.</li>
              <li><strong>Preference Cookies:</strong> Selected currency (USD, INR, EUR) and cookie banner consent.</li>
              <li><strong>Analytics Cookies:</strong> Privacy-friendly Google Analytics 4 (IP-anonymized).</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  
    </div>);
}
