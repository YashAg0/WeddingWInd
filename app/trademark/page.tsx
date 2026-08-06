import { Metadata } from "next";
import { Award, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Trademark & Brand Guidelines | Wedding With India",
  description: "Official trademark notice and brand asset usage guidelines for Wedding With India.",
};

export default function TrademarkPage() {
  return (
    <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20 rounded-[2.5rem]">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Award size={22} />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Trademark & Brand Policy
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} />
            <span>Last Updated: August 2026</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Brand Name & Logo Rights
            </h2>
            <p>
              &ldquo;Wedding With India&rdquo; and associated logos are registered trademarks. Use of brand assets by travel agents or media requires prior written approval from platform management.
            </p>
          </section>
        </div>
      </div>
    </div>
  
    </div>);
}
