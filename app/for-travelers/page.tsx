import Link from "next/link";
import { Compass, Table, Info, FileText, ArrowRight, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata = {
  title: "For Travelers",
  description: "Learn what to expect, wedding etiquette, dress codes, visa rules, and safety guidelines for international guests.",
};

const travelerFAQs = [
  {
    q: "Is it respectful to attend a stranger's wedding?",
    a: "Yes! Host families on our platform list their weddings because they explicitly want to welcome international guests. Sharing their joy and traditions with the world is a matter of cultural pride and happiness for them."
  },
  {
    q: "Do I need to bring a gift?",
    a: "We recommend a simple, thoughtful card. In Indian culture, cash gifts (shagun) ending in 1 (e.g., $11, $21, $51) are common. However, your presence is considered the greatest gift."
  },
  {
    q: "What if I don't know the dance moves?",
    a: "Don't worry! Indian weddings are all about letting go and celebrating. Folk dancers and host relatives will gladly pull you onto the dance floor and teach you basic steps (like holding light bulbs!)."
  },
  {
    q: "How safe is the environment?",
    a: "Extremely. Guests are hosted in verified premium resorts or heritage palaces. Our local guest liaison manager stays at the venue throughout all major events to assist you."
  }
];

export default function ForTravelersPage() {
  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      
      {/* Hero */}
      <section className="container-luxury text-center max-w-3xl mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Compass size={12} />
          Traveler Guide
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-charcoal-900 leading-tight">
          A guest, <span className="text-gradient-brand">not a tourist</span>.
        </h1>
        <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed">
          Step beyond the standard tourist trail. Celebrate alongside real families, taste legendary culinary recipes, and make memories that no guidebook can offer.
        </p>
      </section>

      {/* Surface Sightseeing vs Deep Immersion */}
      <section className="container-luxury grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        
        {/* Surface sightseeing */}
        <div className="bg-white/40 border border-warm-200/50 p-8 rounded-[2rem] space-y-4">
          <h3 className="font-display font-bold text-lg text-charcoal-400">
            Standard Sightseeing
          </h3>
          <ul className="space-y-3 text-charcoal-500 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">✕</span>
              Viewing monuments and castles from behind barriers.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">✕</span>
              Eating hotel buffets and tourist-trap restaurants.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold mt-0.5">✕</span>
              Superficial interactions with tour guides.
            </li>
          </ul>
        </div>

        {/* Wedding immersion */}
        <div className="bg-white border border-[var(--color-brand-primary)]/10 p-8 rounded-[2rem] shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[var(--color-brand-primary)]/5 blur-xl" />
          
          <h3 className="font-display font-bold text-lg text-[var(--color-brand-primary)] flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--color-gold-500)]" /> Wedding Immersion
          </h3>
          <ul className="space-y-3 text-charcoal-700 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">✓</span>
              Stepping inside real heritage palaces as an honored guest.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">✓</span>
              Feasting on authentic local recipe feasts served on banana leaves or copper bowls.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">✓</span>
              Dancing bhangra or garba side-by-side with host families.
            </li>
          </ul>
        </div>

      </section>

      {/* Dress Code & Etiquette Table */}
      <section className="container-luxury max-w-4xl bg-white border border-warm-200/50 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-20 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center shadow-sm">
            <Table size={18} />
          </div>
          <h2 className="font-display font-bold text-xl text-charcoal-900">
            Dress Code & Etiquette Matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" role="table">
            <thead>
              <tr className="border-b border-warm-200 text-xs font-bold text-charcoal-500 uppercase tracking-widest bg-warm-50">
                <th className="p-4 rounded-tl-xl">Ceremony</th>
                <th className="p-4">What to Wear</th>
                <th className="p-4 rounded-tr-xl">Important Etiquette</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100 text-xs sm:text-sm text-charcoal-600">
              <tr>
                <td className="p-4 font-bold text-charcoal-900">Mehndi (Henna)</td>
                <td className="p-4">Colorful casuals (pastels, yellow, green). Kurta shirts or sundresses.</td>
                <td className="p-4">Keep sleeves short or rollable to apply henna on hands comfortably.</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-charcoal-900">Sangeet (Music)</td>
                <td className="p-4">Cocktail wear, heavy embroidered ethnic suits, or glamorous sherwanis.</td>
                <td className="p-4">Be ready to dance! Ensure shoes are comfortable for the dance floor.</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-charcoal-900">Main Ceremony</td>
                <td className="p-4">Traditional (Saree/Lehenga for women, Sherwani/Kurta for men).</td>
                <td className="p-4">Avoid wearing solid white or solid black (colors reserved for mourning).</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-charcoal-900">Gurudwara (Sikhism)</td>
                <td className="p-4">Modest clothing covering legs.</td>
                <td className="p-4">Heads must be covered with a scarf or bandana at all times inside.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Visa Guidance Placeholder */}
      <section className="container-luxury max-w-4xl bg-warm-100 border border-warm-200/50 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-20 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-[var(--color-brand-primary)] flex items-center justify-center shadow-sm flex-shrink-0">
            <Info size={22} />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-xl text-charcoal-900">
              India Visa Guidance & Travel Checklist
            </h2>
            <p className="text-charcoal-600 text-sm leading-relaxed">
              Most travelers require a tourist visa to enter India. We recommend applying for the official <strong>e-Tourist Visa (30 Days, 1 Year, or 5 Years)</strong> online at least 15 days before your departure.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://indianvisaonline.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-wider hover:underline"
              >
                <FileText size={12} />
                Official India Visa Site
              </a>
              <span className="text-charcoal-300">|</span>
              <span className="text-charcoal-500 text-xs font-medium">Use category: &ldquo;Tourism / Recreation&rdquo;</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container-luxury max-w-3xl mb-20 space-y-10" aria-label="Frequently Asked Questions">
        <SectionHeader
          label="FAQs"
          title="Questions from travelers"
          highlightedWord="travelers"
        />

        <div className="space-y-4">
          {travelerFAQs.map((faq) => (
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
            Ready to find your celebration?
          </h2>
          <p className="text-charcoal-500 text-sm max-w-md mx-auto">
            Browse verified listings, read guest reviews, and choose a wedding style that speaks to your soul.
          </p>
          <Link href="/weddings" className="btn btn-primary btn-lg shadow-lg group inline-flex gap-2">
            Explore All Weddings
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
