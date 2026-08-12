import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Heart,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "For Travelers | Experience Indian Weddings | Wedding With India",
  description:
    "Learn how international travelers can discover, book and respectfully experience eligible Indian wedding celebrations through Wedding With India.",
  keywords: [
    "Indian wedding experience for foreigners",
    "attend Indian wedding",
    "Indian wedding tourism",
    "Indian wedding travel",
    "experience Indian culture",
    "Wedding With India travelers",
    "international guests Indian wedding",
  ],
  alternates: {
    canonical: "/for-travelers",
  },
  openGraph: {
    title: "For Travelers | Experience Indian Weddings",
    description:
      "Discover how international travelers can experience eligible Indian wedding celebrations with Wedding With India.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const travelerFAQs = [
  {
    q: "Can I really attend an Indian wedding as a traveler?",
    a: "Some Wedding With India hosts choose to welcome international guests to specific parts of their celebration. Availability depends on the individual wedding, the host's invitation, venue rules, capacity and the experience terms shown on the listing. A booking does not automatically provide access to every part of a private wedding.",
  },
  {
    q: "Is it respectful to attend a wedding I don't know the family personally?",
    a: "It can be, when the family has intentionally chosen to welcome guests through the Platform. The important thing is to follow the host's instructions, respect religious and family traditions, dress appropriately, ask before taking photographs and respect private areas or ceremonies that are not included in your booking.",
  },
  {
    q: "Do I need to bring a gift?",
    a: "A gift is not universally required. If your host provides guidance, follow it. A thoughtful card or culturally appropriate gift can be a nice gesture. Monetary wedding gifts, sometimes known as shagun, are common in many Indian communities, but customs vary significantly by region, family and community. When in doubt, ask your host.",
  },
  {
    q: "What should I wear?",
    a: "Dress expectations vary by ceremony, region, religion, venue and family. Your booking or host may provide specific guidance. Traditional Indian clothing can be a wonderful choice, but modest, clean and event-appropriate clothing is generally more important than wearing something elaborate.",
  },
  {
    q: "Do I need to know Indian dances?",
    a: "Not at all. Weddings can include music and dancing, and guests are often encouraged to participate, but you should never feel obligated. Follow the lead of the hosts and other guests and enjoy the celebration at your own comfort level.",
  },
  {
    q: "How does safety work?",
    a: "Wedding With India may apply account, host, booking or identity verification measures depending on the experience. Safety procedures vary by booking. Review the listing, host instructions and applicable safety information before attending. Wedding With India is not an emergency service, and local emergency services should be contacted for immediate emergencies.",
  },
  {
    q: "Will I be able to attend every ceremony?",
    a: "Not necessarily. Indian weddings can include multiple private and public ceremonies. Your booking will specify the parts of the celebration included in your experience. Respect any ceremony, family area or activity that is marked as private or unavailable to guests.",
  },
  {
    q: "Do I need a visa to travel to India?",
    a: "International travelers are responsible for obtaining the visa, passport, immigration permission and other travel documents required for their circumstances. Wedding With India does not guarantee visa approval and does not replace official Indian immigration or consular guidance.",
  },
];

const ceremonyGuide = [
  {
    ceremony: "Sangeet",
    women: "Festive saree, lehenga, Anarkali or suitable dress",
    men: "Kurta, kurta-jacket combination, or smart formalwear",
    vibe: "Music, performances and celebration",
  },
  {
    ceremony: "Haldi",
    women: "Comfortable festive clothing; light colors may be practical",
    men: "Comfortable kurta or smart casual clothing",
    vibe: "Informal, colorful and playful",
  },
  {
    ceremony: "Wedding Ceremony",
    women: "Saree, lehenga, Anarkali or modest formalwear",
    men: "Kurta, sherwani, bandhgala or formalwear",
    vibe: "Ceremonial and respectful",
  },
  {
    ceremony: "Reception",
    women: "Formal Indian, Indo-Western or evening attire",
    men: "Suit, formal Indianwear or other event-appropriate attire",
    vibe: "Formal celebration",
  },
];

const travelPrinciples = [
  {
    title: "Read the listing",
    description:
      "Review exactly what is included, the location, timing, guest requirements, cancellation terms and any host instructions before booking.",
    icon: FileText,
  },
  {
    title: "Respect the celebration",
    description:
      "A wedding is a personal and cultural occasion. Follow ceremony rules, dress guidance, photography restrictions and requests from the host.",
    icon: Heart,
  },
  {
    title: "Ask before photographing",
    description:
      "Not every person, ritual or location should be photographed. When uncertain, ask the host before taking or sharing photos.",
    icon: Info,
  },
  {
    title: "Stay aware",
    description:
      "Keep your belongings secure, follow venue instructions and use appropriate local emergency services if an immediate emergency occurs.",
    icon: ShieldCheck,
  },
];

export default function ForTravelersPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      {/* Hero */}
      <section
        className="container-luxury text-center max-w-3xl mb-16 space-y-5"
        aria-labelledby="traveler-heading"
      >
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Compass size={12} aria-hidden="true" />
          Global Guest Guide
        </div>

        <h1
          id="traveler-heading"
          className="font-display font-bold text-4xl sm:text-5xl text-charcoal-900 leading-tight"
        >
          Travel beyond sightseeing.{" "}
          <span className="text-gradient-brand">
            Experience an Indian celebration.
          </span>
        </h1>

        <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Wedding With India helps international travelers discover eligible
          Indian wedding experiences where hosts have chosen to welcome guests
          into selected parts of their celebrations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/weddings"
            className="btn btn-primary btn-lg shadow-sm inline-flex items-center gap-2"
          >
            Explore Weddings
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <Link
            href="#faqs"
            className="btn btn-secondary btn-lg inline-flex items-center gap-2"
          >
            Read Traveler Guide
          </Link>
        </div>
      </section>

      {/* Experience comparison */}
      <section
        className="container-luxury max-w-6xl mb-20"
        aria-labelledby="experience-heading"
      >
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
            A different kind of travel
          </p>

          <h2
            id="experience-heading"
            className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 mt-2"
          >
            Experience India from the inside
          </h2>

          <p className="text-sm text-charcoal-500 mt-2 leading-relaxed">
            Traditional sightseeing and cultural immersion can complement each
            other. Wedding With India focuses on the second.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conventional travel */}
          <div className="bg-white/60 border border-warm-200/60 p-7 sm:p-8 rounded-[2rem] space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-charcoal-400">
                Traditional travel
              </p>

              <h3 className="font-display font-bold text-xl text-charcoal-700 mt-1">
                Explore places and attractions
              </h3>
            </div>

            <ul className="space-y-4 text-charcoal-600 text-sm">
              {[
                "Visit landmarks, monuments and cultural attractions.",
                "Explore local food, markets and neighborhoods.",
                "Learn about India's history and traditions through tourism.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-charcoal-400"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Wedding immersion */}
          <div className="bg-white border border-[var(--color-brand-primary)]/15 p-7 sm:p-8 rounded-[2rem] shadow-sm space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[var(--color-brand-primary)]/5 blur-2xl" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
                Wedding With India
              </p>

              <h3 className="font-display font-bold text-xl text-charcoal-900 mt-1 flex items-center gap-2">
                <Sparkles
                  size={18}
                  className="text-[var(--color-gold-500)]"
                  aria-hidden="true"
                />
                Participate in a celebration
              </h3>
            </div>

            <ul className="relative space-y-4 text-charcoal-700 text-sm">
              {[
                "Join selected ceremonies and activities included in your booking.",
                "Experience regional food, music, clothing and wedding traditions.",
                "Meet hosts and other guests in an environment where participation has been invited.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How booking works */}
      <section
        className="container-luxury max-w-5xl mb-20"
        aria-labelledby="booking-heading"
      >
        <div className="bg-white border border-warm-200/50 rounded-[2.5rem] p-7 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
              Before you attend
            </p>

            <h2
              id="booking-heading"
              className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 mt-2"
            >
              From discovery to celebration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                number: "01",
                title: "Explore",
                text: "Browse available wedding experiences and compare dates, locations, inclusions and requirements.",
              },
              {
                number: "02",
                title: "Review",
                text: "Read the host information, event details, guest rules, cancellation terms and what your booking includes.",
              },
              {
                number: "03",
                title: "Book",
                text: "Submit the required information and complete any verification or payment steps required for the experience.",
              },
              {
                number: "04",
                title: "Attend",
                text: "Follow the host instructions, arrive as agreed and enjoy the celebration respectfully.",
              },
            ].map((step) => (
              <div key={step.number} className="space-y-3">
                <div className="text-xs font-bold tracking-widest text-[var(--color-brand-primary)]">
                  {step.number}
                </div>

                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  {step.title}
                </h3>

                <p className="text-sm text-charcoal-500 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Etiquette */}
      <section
        className="container-luxury max-w-5xl bg-white border border-warm-200/50 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-20 space-y-8"
        aria-labelledby="etiquette-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center shrink-0">
            <FileText size={20} aria-hidden="true" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
              Guest etiquette
            </p>

            <h2
              id="etiquette-heading"
              className="font-display font-bold text-xl sm:text-2xl text-charcoal-900"
            >
              Dress & ceremony guide
            </h2>

            <p className="text-xs text-charcoal-500 mt-1">
              General guidance only — always follow the instructions for your
              specific experience.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-warm-200">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="bg-warm-50 border-b border-warm-200">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  Ceremony
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  Suggested attire
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  General atmosphere
                </th>
              </tr>
            </thead>

            <tbody>
              {ceremonyGuide.map((item) => (
                <tr
                  key={item.ceremony}
                  className="border-b border-warm-100 last:border-0"
                >
                  <td className="px-5 py-5 font-bold text-charcoal-900 align-top">
                    {item.ceremony}
                  </td>

                  <td className="px-5 py-5 text-charcoal-600 align-top">
                    <div>
                      <span className="font-semibold text-charcoal-800">
                        Women:
                      </span>{" "}
                      {item.women}
                    </div>

                    <div className="mt-2">
                      <span className="font-semibold text-charcoal-800">
                        Men:
                      </span>{" "}
                      {item.men}
                    </div>
                  </td>

                  <td className="px-5 py-5 text-charcoal-600 align-top">
                    {item.vibe}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-warm-50 border border-warm-200 p-5">
          <Info
            size={18}
            className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
            aria-hidden="true"
          />

          <p className="text-sm text-charcoal-600 leading-relaxed">
            India is culturally and religiously diverse. Wedding customs vary
            by region, religion, community and family. These suggestions are
            general guidance, not universal rules.
          </p>
        </div>
      </section>

      {/* Traveler principles */}
      <section
        className="container-luxury max-w-5xl mb-20"
        aria-labelledby="principles-heading"
      >
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
            Be a great guest
          </p>

          <h2
            id="principles-heading"
            className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 mt-2"
          >
            Four simple principles
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {travelPrinciples.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="bg-white border border-warm-200/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center mb-4">
                  <Icon size={19} aria-hidden="true" />
                </div>

                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  {item.title}
                </h3>

                <p className="text-sm text-charcoal-500 leading-relaxed mt-2">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQs */}
      <section
        id="faqs"
        className="container-luxury max-w-3xl mb-20 space-y-8"
        aria-labelledby="faq-heading"
      >
        <SectionHeader
          label="Common Questions"
          title="Traveler FAQs"
          highlightedWord="FAQs"
        />

        <div className="space-y-4">
          {travelerFAQs.map((faq) => (
            <details
              key={faq.q}
              className="group bg-white border border-warm-200/50 rounded-2xl shadow-sm overflow-hidden"
            >
              <summary className="list-none cursor-pointer p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-primary)]">
                <div className="flex items-start justify-between gap-5">
                  <h3 className="font-display font-bold text-base text-charcoal-900">
                    {faq.q}
                  </h3>

                  <span
                    className="text-[var(--color-brand-primary)] text-lg leading-none transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </div>
              </summary>

              <div className="px-6 pb-6">
                <p className="text-charcoal-600 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Important travel notice */}
      <section className="container-luxury max-w-3xl mb-16">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
          <div className="flex items-start gap-3">
            <Clock
              size={20}
              className="mt-0.5 shrink-0 text-amber-700"
              aria-hidden="true"
            />

            <div className="space-y-3">
              <h2 className="font-display font-bold text-lg text-charcoal-900">
                Plan your trip independently
              </h2>

              <p className="text-sm text-charcoal-700 leading-relaxed">
                Your wedding experience is only one part of your trip.
                Travelers are responsible for their own passport, visa,
                immigration permissions, flights, accommodation and other
                travel arrangements unless a specific booking expressly
                includes those services.
              </p>

              <p className="text-sm text-charcoal-600 leading-relaxed">
                Wedding With India does not guarantee entry into India, visa
                approval, flight availability or the absence of travel
                disruption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="container-luxury text-center max-w-2xl"
        aria-labelledby="cta-heading"
      >
        <div className="bg-white border border-warm-200/50 p-8 sm:p-10 rounded-[2.5rem] shadow-sm space-y-5">
          <div className="w-11 h-11 mx-auto rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Heart size={20} aria-hidden="true" />
          </div>

          <h2
            id="cta-heading"
            className="font-display font-bold text-2xl text-charcoal-900"
          >
            Ready to discover an Indian wedding?
          </h2>

          <p className="text-charcoal-500 text-sm leading-relaxed">
            Browse available experiences and find a celebration that matches
            your travel plans and interests.
          </p>

          <Link
            href="/weddings"
            className="btn btn-primary btn-lg shadow-lg group inline-flex gap-2"
          >
            Explore Available Weddings
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}