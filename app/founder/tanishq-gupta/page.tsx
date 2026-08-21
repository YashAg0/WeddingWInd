import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Building2,
  Plane,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Tanishq Gupta — Founder & Startup Builder",
  description:
    "Official profile of Tanishq Gupta, founder of WeddingWithIndia. Technology builder, creator of BigTechJournals, and guest speaker at MNIT Jaipur.",
  keywords: [
    "Tanishq Gupta",
    "Tanishq Gupta founder",
    "Tanishq Gupta WeddingWithIndia",
    "WeddingWithIndia founder",
    "BigTechJournals Tanishq Gupta",
    "Tanishq Gupta MNIT Jaipur",
  ],
  alternates: {
    canonical: "https://weddingwithindia.com/founder/tanishq-gupta",
  },
  openGraph: {
    title: "Tanishq Gupta — Founder & Startup Builder | WeddingWithIndia",
    description:
      "Tanishq Gupta is the founder of WeddingWithIndia, building cultural immersion experiences for international travelers.",
    url: "https://weddingwithindia.com/founder/tanishq-gupta",
    siteName: "WeddingWithIndia",
    type: "profile",
    images: [
      {
        url: "https://weddingwithindia.com/images/founder/founder.png",
        width: 800,
        height: 800,
        alt: "Tanishq Gupta, Founder of WeddingWithIndia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanishq Gupta — Founder & Startup Builder | WeddingWithIndia",
    description:
      "Technology builder and founder of WeddingWithIndia. Learn about his journey, BigTechJournals, and platform mission.",
    images: ["https://weddingwithindia.com/images/founder/founder.png"],
  },
};

export default function FounderPage() {
  // Person + Organization JSON-LD Structured Data
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://weddingwithindia.com/founder/tanishq-gupta#person",
    name: "Tanishq Gupta",
    jobTitle: "Founder",
    image: "https://weddingwithindia.com/images/founder/founder.png",
    worksFor: {
      "@type": "Organization",
      "@id": "https://weddingwithindia.com/#organization",
      name: "WeddingWithIndia",
      url: "https://weddingwithindia.com",
      logo: "https://weddingwithindia.com/images/logos/logo.png",
    },
    url: "https://weddingwithindia.com/founder/tanishq-gupta",
    sameAs: [
      "https://www.linkedin.com/in/tanishqgupta-",
      "https://twitter.com/tanishqgupta",
    ],
    mainEntityOfPage: {
      "@type": "ProfilePage",
      "@id": "https://weddingwithindia.com/founder/tanishq-gupta",
    },
    description:
      "Founder of WeddingWithIndia, technology builder, creator of BigTechJournals, and guest speaker at MNIT Jaipur.",
    knowsAbout: [
      "Startup Building",
      "Digital Platforms",
      "Cultural Tourism",
      "Technology Management",
      "Indian Wedding Tourism",
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://weddingwithindia.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: "https://weddingwithindia.com/about",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Tanishq Gupta",
        item: "https://weddingwithindia.com/founder/tanishq-gupta",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      {/* JSON-LD Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* =========================================================
          HERO / PROFILE HEADER
      ========================================================= */}
      <section className="container-luxury max-w-4xl mb-16 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Sparkles size={13} aria-hidden="true" />
          Founder Profile
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 leading-tight">
          Tanishq Gupta
        </h1>

        <p className="text-gradient-brand font-display font-semibold text-xl sm:text-2xl">
          Founder, Wedding With India &bull; Technology Builder
        </p>

        <p className="text-charcoal-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          Building digital products, platforms, and cultural immersion experiences that connect international travelers with authentic Indian hospitality.
        </p>
      </section>

      {/* =========================================================
          FOUNDER BIO & BACKGROUND
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-20">
        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-7 sm:p-10 lg:p-12 shadow-sm space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            {/* Founder Avatar / Card */}
            <div className="md:col-span-1 bg-warm-50 border border-warm-200/60 p-6 rounded-3xl text-center space-y-4">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-maroon-100/80 shadow-md mx-auto">
                <Image
                  src="/images/founder/founder.png"
                  alt="Tanishq Gupta, Founder of Wedding With India"
                  fill
                  priority
                  sizes="(max-width: 768px) 240px, 320px"
                  className="object-cover"
                />
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-charcoal-900">
                  Tanishq Gupta
                </h3>
                <span className="text-xs text-charcoal-500 font-semibold block mt-0.5">
                  Founder &amp; Product Lead
                </span>
              </div>

              <div className="pt-2 border-t border-warm-200/60 text-xs text-charcoal-600 space-y-1">
                <p><strong>Base:</strong> India</p>
                <p><strong>Focus:</strong> Product &amp; Platform Strategy</p>
              </div>
            </div>

            {/* Biography Copy */}
            <div className="md:col-span-2 space-y-5 text-charcoal-700 text-sm sm:text-base leading-relaxed">
              <h2 className="font-display font-bold text-2xl text-charcoal-900">
                Building products at the intersection of culture and technology
              </h2>

              <p>
                Tanishq Gupta is an entrepreneur and technology builder who started <strong>Wedding With India</strong> in July together with a team of co-founders and friends. His vision is to create a structured, respectful platform for international guests to experience authentic Indian wedding celebrations.
              </p>

              <p>
                Prior to founding Wedding With India, Tanishq built <strong>BigTechJournals</strong>, an editorial platform dedicated to sharing career journeys, insights, and lessons from technologists across Big Tech and digital industries.
              </p>

              <p>
                He has also worked on private aviation technology and business initiatives, exploring high-end service operations, guest experience design, and digital marketplace infrastructure.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          KEY INITIATIVES & EXPERIENCE GRID
      ========================================================= */}
      <section className="container-luxury max-w-5xl mb-20 space-y-8">
        <SectionHeader
          label="Milestones & Experience"
          title="Background & Entrepreneurial Journey"
          highlightedWord="Journey"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Item 1: Wedding With India */}
          <div className="bg-white border border-warm-200/60 p-7 rounded-3xl shadow-sm space-y-4">
            <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
              <Compass size={21} aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal-900">
              Wedding With India
            </h3>
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              Founder &bull; Building the platform infrastructure for cultural wedding discovery, host onboarding, verification standards, and guest coordination.
            </p>
          </div>

          {/* Item 2: BigTechJournals */}
          <div className="bg-white border border-warm-200/60 p-7 rounded-3xl shadow-sm space-y-4">
            <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
              <Building2 size={21} aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal-900">
              BigTechJournals
            </h3>
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              Creator &bull; Developed content initiatives and community platforms focusing on technology careers, Big Tech insights, and digital builders.
            </p>
          </div>

          {/* Item 3: Private Aviation */}
          <div className="bg-white border border-warm-200/60 p-7 rounded-3xl shadow-sm space-y-4">
            <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
              <Plane size={21} aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal-900">
              Private Aviation Initiatives
            </h3>
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              Product &bull; Worked on digital service models and operational technology concepts within private aviation and luxury travel.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================
          GUEST SPEAKER AT MNIT JAIPUR
      ========================================================= */}
      <section className="container-luxury max-w-4xl mb-20">
        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-8 sm:p-10 shadow-sm space-y-5 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shrink-0">
            <Award size={32} aria-hidden="true" />
          </div>

          <div className="space-y-2 text-center md:text-left">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
              Public Speaking &amp; Academic Engagement
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
              Guest Speaker at MNIT Jaipur
            </h3>
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              Tanishq Gupta was invited by <strong>MNIT Jaipur</strong> (Malaviya National Institute of Technology) as a guest speaker to share his entrepreneurial journey, digital product insights, and experiences with students and aspiring builders.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          BUILDING PHILOSOPHY
      ========================================================= */}
      <section className="container-luxury max-w-4xl mb-20 text-center space-y-6">
        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-8 sm:p-12 shadow-sm space-y-6">
          <ShieldCheck size={28} className="text-[var(--color-brand-primary)] mx-auto" aria-hidden="true" />

          <h3 className="font-display font-bold text-2xl text-charcoal-900">
            The Wedding With India Building Philosophy
          </h3>

          <p className="text-charcoal-600 text-sm leading-relaxed max-w-2xl mx-auto">
            &ldquo;Travel should be about genuine human connection. By bringing structure, transparency, and cultural respect to Indian wedding discovery, we are giving global guests a doorway into authentic traditions while empowering Indian host families.&rdquo;
          </p>

          <div className="pt-4 border-t border-warm-100 flex flex-wrap justify-center gap-6 text-xs text-charcoal-600 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Transparent Operations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Host Privacy First
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Authentic Cultural Respect
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA / NAV BACK TO ABOUT & WEDDINGS
      ========================================================= */}
      <section className="container-luxury max-w-3xl text-center">
        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-8 sm:p-10 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
            Explore Wedding With India
          </h3>
          <p className="text-charcoal-500 text-sm">
            Learn more about our platform mission or browse curated wedding experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/about"
              className="btn btn-secondary btn-md inline-flex items-center justify-center gap-2"
            >
              About the Company
            </Link>
            <Link
              href="/weddings"
              className="btn btn-primary btn-md inline-flex items-center justify-center gap-2"
            >
              Explore Weddings
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
