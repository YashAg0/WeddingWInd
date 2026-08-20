import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ShieldCheck, CheckCircle, XCircle, Sparkles, Shirt, Utensils, Landmark, Hotel, Globe } from "lucide-react";
import { getWeddingBySlug, getRelatedWeddings } from "@/lib/actions";
import { WeddingGallery } from "@/components/wedding/WeddingGallery";
import { WeddingTimeline } from "@/components/wedding/WeddingTimeline";
import { BookingSidebar } from "@/components/wedding/BookingSidebar";
import { StickyBookingCard } from "@/components/wedding/StickyBookingCard";
import { WeddingCard } from "@/components/wedding/WeddingCard";
import { WeddingDetailReviews } from "@/components/wedding/WeddingDetailReviews";
import type { Metadata } from 'next';
import { getDbUser } from "@/lib/auth";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const wedding = await getWeddingBySlug(resolvedParams.slug);
  
  if (!wedding) {
    return {
      title: 'Wedding Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const pageTitle = `Attend ${wedding.title} in ${wedding.location}`;
  const pageDescription = `Experience ${wedding.title} in ${wedding.location}. Authentic ${wedding.category} celebration. Discover itinerary, cultural customs, and guest invitation details.`;
  const canonicalUrl = `https://weddingwithindia.com/weddings/${resolvedParams.slug}`;
  const weddingImg = wedding.imageUrl || wedding.coupleImage;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${pageTitle} | WeddingWithIndia`,
      description: pageDescription,
      url: canonicalUrl,
      siteName: "WeddingWithIndia",
      type: "website",
      images: weddingImg ? [{ url: weddingImg, alt: `${wedding.title} in ${wedding.location}` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | WeddingWithIndia`,
      description: pageDescription,
      images: weddingImg ? [weddingImg] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WeddingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Find wedding
  const wedding = await getWeddingBySlug(slug);
  if (!wedding) {
    notFound();
  }

  // Parallelize user session and bounded related weddings queries
  const [dbUser, relatedWeddings] = await Promise.all([
    getDbUser().catch(() => null),
    getRelatedWeddings(wedding.category, wedding.id, 3),
  ]);
  const userId = dbUser?.id || null;

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: wedding.title,
    description: wedding.story || `Authentic ${wedding.category} Indian wedding celebration in ${wedding.location}.`,
    startDate: wedding.date ? new Date(wedding.date).toISOString() : undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: wedding.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: wedding.city,
        addressCountry: "IN",
      },
    },
    image: wedding.coupleImage || wedding.imageUrl ? [wedding.coupleImage || wedding.imageUrl] : [],
    offers: {
      "@type": "Offer",
      price: wedding.pricePerGuest,
      priceCurrency: wedding.currency || "INR",
      availability: (wedding.guestsAllowed - wedding.guestsBooked) > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: `https://weddingwithindia.com/weddings/${wedding.slug}`,
    },
    organizer: {
      "@type": "Organization",
      name: "WeddingWithIndia",
      url: "https://weddingwithindia.com",
    },
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
        name: "Weddings",
        item: "https://weddingwithindia.com/weddings",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: wedding.title,
        item: `https://weddingwithindia.com/weddings/${wedding.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="container-luxury mt-4 flex flex-col gap-4">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--color-brand-primary)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/weddings" className="hover:text-[var(--color-brand-primary)] transition-colors">Weddings</Link>
          <span>/</span>
          <span className="text-charcoal-600 normal-case">{wedding.city}</span>
        </nav>

        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-maroon-50 text-[var(--color-brand-primary)] text-[0.6875rem] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-maroon-100/50">
                <Sparkles size={11} className="text-[var(--color-brand-secondary)]" /> {wedding.category}
              </span>
              {wedding.isVerified && !wedding.isDemo && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100">
                  <ShieldCheck size={11} />
                  Verified host
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900 leading-tight">
              {wedding.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-charcoal-500">
              {wedding.experienceCompleted && wedding.reviewCount > 0 ? (
                <div className="flex items-center gap-1 text-charcoal-900">
                  <Star size={14} className="text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]" />
                  <span className="font-bold">{wedding.rating}</span>
                  <span className="text-charcoal-400">({wedding.reviewCount} verified reviews)</span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-charcoal-600 bg-white border border-warm-200/80 rounded-full px-3 py-0.5">
                  Upcoming Celebration
                </span>
              )}
              <span className="w-1.5 h-1.5 rounded-full bg-warm-300" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span>{wedding.location}, {wedding.country}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-1.5 sm:gap-2 bg-white border border-warm-200/50 p-3 sm:p-4 rounded-2xl shadow-sm w-full sm:w-auto max-w-full self-start">
            <div className="text-center px-2 sm:px-3 border-r border-warm-200 flex-1 sm:flex-initial">
              <div className="text-[10px] sm:text-xs text-charcoal-400 uppercase font-bold tracking-wider mb-0.5">Duration</div>
              <div className="font-display font-bold text-xs sm:text-sm text-charcoal-800">{wedding.durationDays} Days</div>
            </div>
            <div className="text-center px-2 sm:px-3 border-r border-warm-200 flex-1 sm:flex-initial">
              <div className="text-[10px] sm:text-xs text-charcoal-400 uppercase font-bold tracking-wider mb-0.5">Religion</div>
              <div className="font-display font-bold text-xs sm:text-sm text-maroon-800">{wedding.religion || "Hindu"}</div>
            </div>
            <div className="text-center px-2 sm:px-3 flex-1 sm:flex-initial">
              <div className="text-[10px] sm:text-xs text-charcoal-400 uppercase font-bold tracking-wider mb-0.5">Region</div>
              <div className="font-display font-bold text-xs sm:text-sm text-charcoal-800">{wedding.region || "India"}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── IMMERSIVE GALLERY HERO ─── */}
      <div className="container-luxury mt-6">
        <WeddingGallery images={wedding.gallery} title={wedding.title} />
        {(!wedding.isVerifiedRealMedia || wedding.coverImageType === "representative") && (
          <p className="text-[0.6875rem] text-charcoal-400 mt-2 text-right">
            Representative cultural imagery — host family photos and specific ceremony schedules are shared with confirmed guests.
          </p>
        )}
      </div>

      {/* ─── Main 2-col layout ─── */}
      <div className="container-luxury mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">

          {/* LEFT: Story + Details */}
          <div className="lg:col-span-2 space-y-12">

            {/* ─── COUPLE PORTRAIT & STORY ─── */}
            <section
              className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4"
              aria-labelledby="story-heading"
            >
              <h2 id="story-heading" className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-3">
                Our Wedding Story
              </h2>
              <p className="text-charcoal-600 text-base leading-relaxed italic">
                &ldquo;{wedding.story}&rdquo;
              </p>
            </section>
            
            <section
              className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-5"
              aria-labelledby="couple-heading"
            >
              <h2 id="couple-heading" className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-3">
                Meet the Host Couple
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-warm-100 shadow-md flex-shrink-0">
                  <Image
                    src={wedding.coupleImage}
                    alt={wedding.coupleName}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="font-display font-bold text-lg text-charcoal-900">
                    {wedding.coupleName}
                  </h3>
                  {wedding.coupleBio && (
                    <p className="text-charcoal-600 text-sm leading-relaxed">
                      {wedding.coupleBio}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ─── Celebration Schedule ─── */}
            <section className="space-y-5" aria-labelledby="timeline-heading">
              <h2 id="timeline-heading" className="font-display font-bold text-2xl text-charcoal-900">
                Celebration Schedule
              </h2>
              <WeddingTimeline timeline={wedding.timeline} />
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-300/50 to-transparent my-10" aria-hidden="true" />

            {/* ─── Traditions ─── */}
            <section
              className="bg-warm-50/40 border border-warm-200/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6"
              aria-labelledby="traditions-heading"
            >
              <h2 id="traditions-heading" className="font-display font-bold text-2xl text-charcoal-900">
                Key Customs &amp; Traditions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {wedding.traditions.map((trad: { name?: string; title?: string; description: string }) => (
                  <div key={trad.title || trad.name} className="space-y-2 p-5 rounded-2xl bg-warm-50/80 border border-warm-200/40">
                    <h3 className="font-display font-semibold text-base text-charcoal-800">
                      {trad.title || trad.name}
                    </h3>
                    <p className="text-charcoal-600 text-sm leading-relaxed">
                      {trad.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-300/50 to-transparent my-10" aria-hidden="true" />

            {/* ─── Practical Info & Cultural Realism ─── */}
            <section
              className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6"
              aria-labelledby="practical-heading"
            >
              <h2 id="practical-heading" className="font-display font-bold text-2xl text-charcoal-900">
                Cultural Experience &amp; Guest Guidelines
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cultural Profile */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe size={14} className="text-maroon-800" /> Cultural Identity
                  </h3>
                  <p className="text-charcoal-800 font-semibold text-sm leading-relaxed">
                    {wedding.religion} • {wedding.community || wedding.ethnicity || "Traditional"} ({wedding.region || "India"})
                  </p>
                  <p className="text-charcoal-500 text-xs">
                    Theme: {wedding.theme || "Traditional Celebration"}
                  </p>
                </div>

                {/* Dress code */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Shirt size={14} className="text-maroon-800" /> Dress Code Expectations
                  </h3>
                  <p className="text-charcoal-700 text-sm leading-relaxed">
                    {wedding.dressCode}
                  </p>
                </div>

                {/* Culinary style */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Utensils size={14} className="text-maroon-800" /> Authentic Culinary Feast
                  </h3>
                  <p className="text-charcoal-700 text-sm leading-relaxed">
                    {wedding.foodDescription}
                  </p>
                </div>

                {/* Guest Rules & Etiquette */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Landmark size={14} className="text-maroon-800" /> Guest Participation &amp; Etiquette
                  </h3>
                  <p className="text-charcoal-700 text-sm leading-relaxed">
                    {wedding.guestRules || "Global guests welcome as honored family observers & participants."}
                  </p>
                  {wedding.etiquetteNotes && (
                    <p className="text-amber-800 text-xs bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50 mt-1">
                      💡 <strong>Etiquette Note:</strong> {wedding.etiquetteNotes}
                    </p>
                  )}
                </div>

                {/* Venue Details */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Landmark size={14} className="text-maroon-800" /> The Venue
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {wedding.venueDescription}
                  </p>
                </div>

                {/* Accommodations */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Hotel size={14} className="text-maroon-800" /> Lodging &amp; Stay
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {wedding.accommodation}
                  </p>
                </div>
              </div>
            </section>

            {/* ─── Inclusions & Exclusions ─── */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-label="Experience highlights">
              {/* Included */}
              <div className="bg-emerald-50/40 border border-emerald-500/15 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-display font-semibold text-base text-emerald-800 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  What is Included
                </h3>
                <ul className="space-y-2.5">
                  {wedding.included.map((inc: string) => (
                    <li key={inc} className="text-charcoal-700 text-sm leading-relaxed flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">•</span>
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Not Included */}
              <div className="bg-rose-50/20 border border-rose-500/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-display font-semibold text-base text-rose-800 flex items-center gap-2">
                  <XCircle size={16} className="text-rose-600" />
                  Not Included
                </h3>
                <ul className="space-y-2.5">
                  {wedding.notIncluded.map((exc: string) => (
                    <li key={exc} className="text-charcoal-700 text-sm leading-relaxed flex items-start gap-2">
                      <span className="text-rose-400 font-bold mt-0.5 flex-shrink-0">•</span>
                      {exc}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ─── Legal & Cultural Safety Notice ─── */}
            <section className="bg-warm-100/60 border border-warm-200/80 p-6 sm:p-7 rounded-3xl shadow-xs space-y-3" aria-label="Legal and safety notice">
              <div className="flex items-center gap-2 text-charcoal-900 font-display font-bold text-base">
                <ShieldCheck size={18} className="text-[var(--color-brand-primary)]" />
                Cultural Marketplace &amp; Safety Notice
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                WeddingWithIndia is a cultural marketplace facilitating authentic family celebration attendance for international guests. The platform does not act as a civil marriage registrar, visa authority, or religious authority. Religious ceremonies and marriage registrations remain under the sovereign jurisdiction of the couple, their chosen officiants, and relevant local legal authorities. International travelers attend as honored observers and guests.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[0.6875rem] font-semibold text-charcoal-600">
                <span className="bg-white px-2.5 py-1 rounded-full border border-warm-200">
                  📷 Photography: Allowed in designated celebration areas
                </span>
                <span className="bg-white px-2.5 py-1 rounded-full border border-warm-200">
                  🤝 Dedicated Host Liaison Assigned
                </span>
              </div>
            </section>

            {/* ─── Reviews (Rendered only once celebration is completed and genuine reviews exist) ─── */}
            {wedding.experienceCompleted && Array.isArray(wedding.reviews) && wedding.reviews.length > 0 && (
              <section className="space-y-5" aria-labelledby="reviews-heading">
                <h2 id="reviews-heading" className="font-display font-bold text-2xl text-charcoal-900">
                  Verified Guest Reviews ({wedding.reviews.length})
                </h2>
                <WeddingDetailReviews
                  weddingId={wedding.id}
                  reviews={wedding.reviews as unknown as Parameters<typeof WeddingDetailReviews>[0]["reviews"]}
                  userId={userId}
                />
              </section>
            )}

          </div>

          {/* RIGHT: Sticky Booking Sidebar (desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <BookingSidebar wedding={wedding} />
          </div>
        </div>
      </div>

      {/* ─── Related Celebrations ─── */}
      <section
        className="container-luxury border-t border-warm-200/60 mt-20 pt-14 space-y-8"
        aria-labelledby="related-heading"
      >
        <div className="text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-secondary)]">You might also love</p>
          <h2 id="related-heading" className="font-display font-bold text-2xl md:text-3xl text-charcoal-900">
            Other Celebrations Open to You
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedWeddings.map((w) => (
            <div key={w.id}>
              <WeddingCard wedding={w} />
            </div>
          ))}
        </div>
      </section>

      {/* Floating Bottom Card (mobile only) */}
      <StickyBookingCard wedding={wedding} />

    </div>
  );
}
