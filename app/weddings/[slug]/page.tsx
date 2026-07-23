import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ShieldCheck, Heart, Share2, Compass, CheckCircle, XCircle, Sparkles, Shirt, Utensils, Landmark, Hotel } from "lucide-react";
import { getWeddings, getWeddingBySlug } from "@/lib/actions";
import { WeddingGallery } from "@/components/wedding/WeddingGallery";
import { WeddingTimeline } from "@/components/wedding/WeddingTimeline";
import { BookingSidebar } from "@/components/wedding/BookingSidebar";
import { StickyBookingCard } from "@/components/wedding/StickyBookingCard";
import { WeddingCard } from "@/components/wedding/WeddingCard";
import { WeddingDetailReviews } from "@/components/wedding/WeddingDetailReviews";
import { getDbUser } from "@/lib/auth";

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

  let dbUser = null;
  try {
    dbUser = await getDbUser();
  } catch (e) {}
  const userId = dbUser?.id || null;

  // Related weddings (same category or high rating, excluding current)
  const weddingsList = await getWeddings();
  const relatedWeddings = weddingsList
    .filter((w) => w.id !== wedding.id)
    .slice(0, 3);

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: wedding.title,
    description: wedding.story,
    startDate: new Date().toISOString(),
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
    image: wedding.coupleImage ? [wedding.coupleImage] : [],
    offers: {
      "@type": "Offer",
      price: wedding.pricePerGuest,
      priceCurrency: wedding.currency || "USD",
      availability: (wedding.guestsAllowed - wedding.guestsBooked) > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: `https://weddingwithindia.com/weddings/${wedding.slug}`,
    },
    organizer: {
      "@type": "Organization",
      name: "Wedding With India",
      url: "https://weddingwithindia.com",
    },
  };

  return (
    <div className="min-h-screen bg-warm-50/50 pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      
      {/* Header Container */}
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
              {wedding.isVerified && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100">
                  <ShieldCheck size={11} />
                  Verified host
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900 leading-tight">
              {wedding.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-charcoal-500">
              <div className="flex items-center gap-1 text-charcoal-900">
                <Star size={14} className="text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]" />
                <span className="font-bold">{wedding.rating}</span>
                <span className="text-charcoal-400">({wedding.reviewCount} reviews)</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-warm-300" aria-hidden="true" />
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{wedding.location}, {wedding.country}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex items-center gap-3 bg-white border border-warm-200/50 p-4 rounded-2xl shadow-sm self-start">
            <div className="text-center px-4 border-r border-warm-200">
              <div className="text-xs text-charcoal-400 uppercase font-bold tracking-wider mb-0.5">Duration</div>
              <div className="font-display font-bold text-sm text-charcoal-800">{wedding.durationDays} Days</div>
            </div>
            <div className="text-center px-4">
              <div className="text-xs text-charcoal-400 uppercase font-bold tracking-wider mb-0.5 font-sans">Religion</div>
              <div className="font-display font-bold text-sm text-charcoal-800">{wedding.religion}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <div className="container-luxury mt-6">
        <WeddingGallery images={wedding.gallery} title={wedding.title} />
      </div>

      {/* Main Grid Content */}
      <div className="container-luxury mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Detailed description sections */}
          <main className="lg:col-span-2 space-y-10" role="main">
            
            {/* Story section */}
            <section className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4" aria-labelledby="story-heading">
              <h2 id="story-heading" className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-3">
                Our Wedding Story
              </h2>
              <p className="text-charcoal-600 text-base leading-relaxed italic">
                &ldquo;{wedding.story}&rdquo;
              </p>
            </section>

            {/* Meet the couple */}
            <section className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-5" aria-labelledby="couple-heading">
              <h2 id="couple-heading" className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-3">
                Meet the Couple
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-warm-100 shadow-md flex-shrink-0">
                  <Image
                    src={wedding.coupleImage}
                    alt={wedding.coupleName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="font-display font-bold text-lg text-charcoal-900">
                    {wedding.coupleName}
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {wedding.coupleBio}
                  </p>
                </div>
              </div>
            </section>

            {/* Wedding Timeline */}
            <section className="space-y-5" aria-labelledby="timeline-heading">
              <h2 id="timeline-heading" className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-200 pb-3">
                Celebration Schedule
              </h2>
              <WeddingTimeline timeline={wedding.timeline} />
            </section>

            {/* Traditions */}
            <section className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4" aria-labelledby="traditions-heading">
              <h2 id="traditions-heading" className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-3">
                Key Customs & Traditions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wedding.traditions.map((trad) => (
                  <div key={trad.title} className="space-y-1.5 p-4 rounded-2xl bg-warm-50/50 border border-warm-200/40">
                    <h3 className="font-sans font-bold text-sm text-charcoal-800">
                      {trad.title}
                    </h3>
                    <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
                      {trad.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Practical information card */}
            <section className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6" aria-labelledby="practical-heading">
              <h2 id="practical-heading" className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-3">
                Practical Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    🎨 Wedding Theme
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {wedding.theme || "Traditional Indian Celebration"}
                  </p>
                </div>

                {/* Ethnicity */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    🌏 Culture & Ethnicity
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {wedding.ethnicity || "Multicultural"}
                  </p>
                </div>

                {/* Guests */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    👥 Guest Capacity
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    Up to {wedding.guestsAllowed} guests
                    {wedding.requiredGuests ? ` · Host expects at least ${wedding.requiredGuests} guests` : ""}
                  </p>
                </div>

                {/* Dress code */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Shirt size={14} className="text-maroon-800" /> Dress Code
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {wedding.dressCode}
                  </p>
                </div>
                
                {/* Culinary style */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Utensils size={14} className="text-maroon-800" /> Culinary Experience
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {wedding.foodDescription}
                  </p>
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
                    <Hotel size={14} className="text-maroon-800" /> Lodging & Stay
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {wedding.accommodation}
                  </p>
                </div>
              </div>
            </section>

            {/* Inclusions & Exclusions */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Package highlights">
              {/* Included */}
              <div className="bg-emerald-50/20 border border-emerald-500/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-sans font-bold text-sm text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  What is Included
                </h3>
                <ul className="space-y-2.5">
                  {wedding.included.map((inc) => (
                    <li key={inc} className="text-charcoal-700 text-sm leading-relaxed flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Not Included */}
              <div className="bg-rose-50/10 border border-rose-500/10 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-sans font-bold text-sm text-rose-800 uppercase tracking-wider flex items-center gap-2">
                  <XCircle size={16} className="text-rose-600" />
                  Not Included
                </h3>
                <ul className="space-y-2.5">
                  {wedding.notIncluded.map((exc) => (
                    <li key={exc} className="text-charcoal-700 text-sm leading-relaxed flex items-start gap-2">
                      <span className="text-rose-400 font-bold mt-0.5">•</span>
                      {exc}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Reviews */}
            <section className="space-y-5" aria-labelledby="reviews-heading">
              <h2 id="reviews-heading" className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-200 pb-3">
                Guest Reviews ({wedding.reviews.length})
              </h2>
              <WeddingDetailReviews
                weddingId={wedding.id}
                reviews={wedding.reviews as any}
                userId={userId}
              />
            </section>

          </main>

          {/* Sticky Booking Sidebar (desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <BookingSidebar wedding={wedding} />
          </div>
        </div>
      </div>

      {/* Related listings */}
      <section className="container-luxury border-t border-warm-200/60 mt-16 pt-12 space-y-6" aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-display font-bold text-xl md:text-2xl text-charcoal-900 text-center md:text-left">
          Other Celebrations You Might Like
        </h2>
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
