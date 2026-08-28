import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getWeddings } from "@/lib/actions";
import { WeddingCard } from "@/components/wedding/WeddingCard";
import { MarketplaceHeader } from "@/components/wedding/MarketplaceHeader";
import { FilterSidebar } from "@/components/wedding/FilterSidebar";
import { Flower2 } from "lucide-react";
import { SortSelect } from "./SortSelect";
import { CANONICAL_RELIGIONS, normalizeReligion } from "@/lib/culture";
import { sortWeddingsByDiscoveryPriority } from "@/lib/wedding-dto";
import { Wedding } from "@/types";

export const metadata: Metadata = {
  title: "Explore Indian Wedding Celebrations",
  description:
    "Explore authentic multi-day Indian wedding celebrations across Rajasthan, Goa, Punjab, and Kerala. Filter by duration (1–5 days), destination, and cultural tradition.",
  alternates: {
    canonical: "https://weddingwithindia.com/weddings",
  },
  openGraph: {
    title: "Explore Indian Wedding Celebrations | WeddingWithIndia",
    description:
      "Explore authentic multi-day Indian wedding celebrations across Rajasthan, Goa, Punjab, and Kerala. Filter by duration (1–5 days), destination, and cultural tradition.",
    url: "https://weddingwithindia.com/weddings",
    siteName: "WeddingWithIndia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Indian Wedding Celebrations | WeddingWithIndia",
    description:
      "Explore authentic multi-day Indian wedding celebrations across Rajasthan, Goa, Punjab, and Kerala. Filter by duration (1–5 days), destination, and cultural tradition.",
  },
};

// Make the route dynamic so it parses searchParams on every request
export const dynamic = "force-dynamic";

interface SearchParams {
  destination?: string;
  destinations?: string;
  category?: string;
  date?: string;
  durations?: string;
  duration?: string;
  tiers?: string;
  religions?: string;
  minGuests?: string;
  maxBudget?: string;
  availability?: string;
  sort?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function WeddingsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const weddings = await getWeddings();

  // 1. Compute dynamic bounds & counts from database weddings
  const durationCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const destinationCounts: Record<string, number> = {};
  const religionCounts: Record<string, number> = {};
  CANONICAL_RELIGIONS.forEach((r) => { religionCounts[r] = 0; });
  const tierCounts: Record<string, number> = {};

  let minPriceInSystem = 999999;
  let maxPriceInSystem = 0;

  weddings.forEach((w: Wedding) => {
    // Duration
    const d = w.durationDays || 1;
    if (durationCounts[d] !== undefined) {
      durationCounts[d] += 1;
    }

    // Destination (State / Region / City)
    const stateKey = (w.state || w.region || w.city || "").toLowerCase().trim();
    if (stateKey) {
      destinationCounts[stateKey] = (destinationCounts[stateKey] || 0) + 1;
    }

    // Culture / Religion
    const normRel = normalizeReligion(w.religion);
    religionCounts[normRel] = (religionCounts[normRel] || 0) + 1;

    // Experience Tier
    const tierKey = (w.tier || "STANDARD").toUpperCase();
    tierCounts[tierKey] = (tierCounts[tierKey] || 0) + 1;

    // Price Bounds
    if (w.pricePerGuest > 0) {
      if (w.pricePerGuest < minPriceInSystem) minPriceInSystem = w.pricePerGuest;
      if (w.pricePerGuest > maxPriceInSystem) maxPriceInSystem = w.pricePerGuest;
    }
  });

  if (minPriceInSystem === 999999) minPriceInSystem = 149;
  if (maxPriceInSystem === 0) maxPriceInSystem = 1199;

  // 2. Parse Search Parameters
  const destinationQuery = (resolvedParams.destination || "").toLowerCase().trim();
  const selectedDestinations = resolvedParams.destinations
    ? resolvedParams.destinations.split(",").map((d) => d.toLowerCase().trim()).filter(Boolean)
    : [];

  const rawDurations = resolvedParams.durations
    ? resolvedParams.durations.split(",").map(Number).filter(Boolean)
    : resolvedParams.duration
    ? [Number(resolvedParams.duration)]
    : [];

  const selectedTiers = resolvedParams.tiers
    ? resolvedParams.tiers.split(",").map((t) => t.toUpperCase().trim()).filter(Boolean)
    : [];

  const selectedReligions = resolvedParams.religions
    ? resolvedParams.religions.split(",").map((r) => normalizeReligion(r).toLowerCase()).filter(Boolean)
    : [];

  const minGuests = Number(resolvedParams.minGuests || "0");
  const maxBudget = Number(resolvedParams.maxBudget || maxPriceInSystem.toString());
  const availability = (resolvedParams.availability || "").toLowerCase();
  const date = resolvedParams.date || ""; // YYYY-MM
  const sort = resolvedParams.sort || "featured";

  // 3. Filter Listings
  const filteredWeddings: Wedding[] = weddings.filter((wedding: Wedding) => {
    // A. Destination (Search bar text + Checkboxes)
    if (destinationQuery) {
      const matchLoc = (wedding.location || "").toLowerCase().includes(destinationQuery);
      const matchCity = (wedding.city || "").toLowerCase().includes(destinationQuery);
      const matchState = (wedding.state || wedding.region || "").toLowerCase().includes(destinationQuery);
      if (!matchLoc && !matchCity && !matchState) return false;
    }

    if (selectedDestinations.length > 0) {
      const locLower = (wedding.location || "").toLowerCase();
      const cityLower = (wedding.city || "").toLowerCase();
      const stateLower = (wedding.state || wedding.region || "").toLowerCase();
      const matchesAnyDest = selectedDestinations.some((d) =>
        locLower.includes(d) || cityLower.includes(d) || stateLower.includes(d)
      );
      if (!matchesAnyDest) return false;
    }

    // B. Duration (1–5 Days)
    if (rawDurations.length > 0) {
      if (!rawDurations.includes(wedding.durationDays)) return false;
    }

    // C. Experience Tier
    if (selectedTiers.length > 0) {
      const weddingTier = (wedding.tier || "STANDARD").toUpperCase();
      if (!selectedTiers.includes(weddingTier)) return false;
    }

    // D. Religion / Tradition
    if (selectedReligions.length > 0) {
      const normWeddingRel = normalizeReligion(wedding.religion).toLowerCase();
      if (!selectedReligions.includes(normWeddingRel)) return false;
    }

    // E. Guest Capacity
    if (minGuests > 0) {
      const capacity = wedding.guestsAllowed || 20;
      if (capacity < minGuests) return false;
    }

    // F. Budget
    if (wedding.pricePerGuest > maxBudget) return false;

    // G. Availability
    const isSoldOut = wedding.isDemo === true || wedding.availabilityStatus === "FULLY_BOOKED" || (wedding.guestsAllowed > 0 && (wedding.guestsAllowed - (wedding.guestsBooked || 0)) <= 0);
    if (availability === "available" && isSoldOut) return false;
    if (availability === "fully_booked" && !isSoldOut) return false;

    // H. Date
    if (date) {
      if (!wedding.date.startsWith(date)) return false;
    }

    return true;
  });

  // 4. Sort listings via Single Source of Truth Discovery Ranking
  const sortedWeddings: Wedding[] = sortWeddingsByDiscoveryPriority<Wedding>(filteredWeddings, sort);

  return (
    <div className="min-h-screen bg-warm-50 pt-20 sm:pt-28 pb-20 pb-bottom-nav lg:pb-20">
      <div className="container-luxury flex flex-col gap-4 sm:gap-8">
        
        {/* Search header container — compact on mobile */}
        <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3 pt-2 sm:pt-0">
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-maroon-100/50">
            <Flower2 size={12} className="text-[var(--color-brand-secondary)]" />
            Discover Celebrations
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-5xl text-charcoal-900 leading-tight">
            Explore Wedding Celebrations
          </h1>
          {/* Description hidden on mobile for compact layout */}
          <p className="hidden sm:block text-charcoal-500 text-sm md:text-base leading-relaxed">
            Attend an authentic Indian wedding as an honored guest. Experience diverse 1 to 5 day celebrations across India with transparent pricing and dedicated cultural host support.
          </p>
        </div>

        {/* Dynamic URL Search Bar & Mobile Filter Drawer */}
        <Suspense fallback={<div className="h-20 w-full bg-warm-100 rounded-3xl animate-pulse" />}>
          <MarketplaceHeaderWrapper />
        </Suspense>

        {/* Quick-filter chip rail — mobile only */}
        <div className="lg:hidden">
          <div className="filter-chip-rail -mx-4 px-4 sm:-mx-6 sm:px-6">
            {/* "All" chip — clears duration/tier filters */}
            <Link
              href="/weddings"
              className={`filter-chip ${!resolvedParams.durations && !resolvedParams.tiers && !resolvedParams.religions ? "active" : ""}`}
              aria-label="Show all celebrations"
            >
              All
            </Link>
            {/* Duration quick-filters */}
            {([1, 2, 3, 4, 5] as const).map((d) => (
              <Link
                key={d}
                href={`/weddings?durations=${d}`}
                className={`filter-chip ${resolvedParams.durations === String(d) ? "active" : ""}`}
                aria-label={`Filter by ${d} day celebrations`}
              >
                {d} {d === 1 ? "Day" : "Days"}
              </Link>
            ))}
            {/* Tier quick-filters */}
            {(["ROYAL", "GRAND", "SIGNATURE_ROYAL"] as const).map((tier) => (
              <Link
                key={tier}
                href={`/weddings?tiers=${tier}`}
                className={`filter-chip ${resolvedParams.tiers?.toUpperCase() === tier ? "active" : ""}`}
                aria-label={`Filter by ${tier.replace("_", " ")} tier`}
              >
                {tier === "SIGNATURE_ROYAL" ? "Signature Royal" : tier.charAt(0) + tier.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 items-start mt-0 sm:mt-2">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24 z-20 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain pr-1 bg-white border border-warm-200/60 rounded-3xl p-5 shadow-card scrollbar-thin">
            <Suspense fallback={<div className="h-96 bg-warm-100 rounded-2xl animate-pulse" />}>
              <FilterSidebar
                durationCounts={durationCounts}
                destinationCounts={destinationCounts}
                religionCounts={religionCounts}
                tierCounts={tierCounts}
                minPriceInSystem={minPriceInSystem}
                maxPriceInSystem={maxPriceInSystem}
                totalWeddingsCount={weddings.length}
              />
            </Suspense>
          </div>

          {/* Marketplace Listing area */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 sm:gap-6">
            {/* Top Toolbar / Counts & Sorting */}
            <div className="flex items-center justify-between bg-white border border-warm-200/60 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-widest">
                {sortedWeddings.length} {sortedWeddings.length === 1 ? "celebration" : "celebrations"} found
              </span>
              
              <Suspense fallback={<div className="h-8 w-28 bg-warm-100 rounded animate-pulse" />}>
                <SortDropdownWrapper activeSort={sort} />
              </Suspense>
            </div>

            {/* Weddings Card Grid */}
            {sortedWeddings.length > 0 ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                role="list"
                aria-label="Wedding listings"
              >
                {sortedWeddings.map((wedding) => (
                  <div key={wedding.id} role="listitem">
                    <WeddingCard wedding={wedding} />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-20 bg-white border border-warm-200/60 rounded-3xl shadow-sm flex flex-col items-center gap-3">
                <Flower2 size={40} className="text-[var(--color-brand-primary)] opacity-40" aria-hidden="true" />
                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  No celebrations found
                </h3>
                <p className="text-charcoal-500 text-sm max-w-sm">
                  Try adjusting your filters, modifying your duration or date, or searching for other regions in India.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketplaceHeaderWrapper() {
  return <MarketplaceHeader />;
}

function SortDropdownWrapper({ activeSort }: { activeSort: string }) {
  return <SortSelect activeSort={activeSort} />;
}
