import { Metadata } from "next";
import { Suspense } from "react";
import { getWeddings } from "@/lib/actions";
import { WeddingCard } from "@/components/wedding/WeddingCard";
import { MarketplaceHeader } from "@/components/wedding/MarketplaceHeader";
import { FilterSidebar } from "@/components/wedding/FilterSidebar";
import { Flower2 } from "lucide-react";
import { SortSelect } from "./SortSelect";

export const metadata: Metadata = {
  title: "Browse Weddings",
  description: "Explore verified Indian wedding celebrations across Rajasthan, Goa, Punjab, and Kerala. Filter by style, date, and budget.",
};

// Make the route dynamic so it parses searchParams on every request
export const dynamic = "force-dynamic";

interface SearchParams {
  destination?: string;
  category?: string;
  date?: string;
  styles?: string;
  maxBudget?: string;
  luxuryLevels?: string;
  religions?: string;
  minSlots?: string;
  languages?: string;
  duration?: string;
  sort?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function WeddingsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const weddings = await getWeddings();

  const destination = resolvedParams.destination?.toLowerCase() || "";
  const category = resolvedParams.category?.toLowerCase() || "";
  const date = resolvedParams.date || ""; // YYYY-MM format
  
  const stylesFilter = resolvedParams.styles ? resolvedParams.styles.split(",") : [];
  const maxBudgetFilter = Number(resolvedParams.maxBudget || "99999"); // INR — default shows all tiers
  const luxuryFilter = resolvedParams.luxuryLevels ? resolvedParams.luxuryLevels.split(",") : [];
  const religionFilter = resolvedParams.religions ? resolvedParams.religions.split(",") : [];
  const minSlotsFilter = Number(resolvedParams.minSlots || "0");
  const languagesFilter = resolvedParams.languages ? resolvedParams.languages.split(",") : [];
  const durationFilter = resolvedParams.duration ? Number(resolvedParams.duration) : null;
  const sort = resolvedParams.sort || "featured";

  // Filter listings
  const filteredWeddings = weddings.filter((wedding) => {
    // 1. Destination
    if (destination) {
      const matchLoc = wedding.location.toLowerCase().includes(destination);
      const matchCity = wedding.city.toLowerCase().includes(destination);
      const matchState = wedding.state.toLowerCase().includes(destination);
      if (!matchLoc && !matchCity && !matchState) return false;
    }

    // 2. Style (category from SearchBar or Styles checklist)
    if (category) {
      if (wedding.category.toLowerCase() !== category) return false;
    }
    if (stylesFilter.length > 0) {
      if (!stylesFilter.includes(wedding.category.toLowerCase())) return false;
    }

    // 3. Date
    if (date) {
      if (!wedding.date.startsWith(date)) return false;
    }

    // 4. Budget
    if (wedding.pricePerGuest > maxBudgetFilter) return false;

    // 5. Luxury Level
    if (luxuryFilter.length > 0) {
      if (!luxuryFilter.includes(wedding.luxuryLevel.toLowerCase())) return false;
    }

    // 6. Religion
    if (religionFilter.length > 0) {
      if (!religionFilter.includes(wedding.religion.toLowerCase())) return false;
    }

    // 7. Slots
    const availableSlots = wedding.guestsAllowed - wedding.guestsBooked;
    if (availableSlots < minSlotsFilter) return false;

    // 8. Languages
    if (languagesFilter.length > 0) {
      const hasLang = wedding.languages.some((l: string) =>
        languagesFilter.includes(l.toLowerCase())
      );
      if (!hasLang) return false;
    }

    // 9. Duration
    if (durationFilter !== null) {
      if (durationFilter === 3) {
        if (wedding.durationDays < 3) return false;
      } else {
        if (wedding.durationDays !== durationFilter) return false;
      }
    }

    return true;
  });

  // Sort listings
  const sortedWeddings = [...filteredWeddings].sort((a, b) => {
    if (sort === "price_asc") {
      return a.pricePerGuest - b.pricePerGuest;
    }
    if (sort === "price_desc") {
      return b.pricePerGuest - a.pricePerGuest;
    }
    if (sort === "rating") {
      return b.rating - a.rating;
    }
    // Default: sponsored first → featured → rating (server-authoritative ordering preserved)
    const sponsoredDiff = (b.sponsored ? 2 : 0) - (a.sponsored ? 2 : 0);
    if (sponsoredDiff !== 0) return sponsoredDiff;
    const featuredDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    if (featuredDiff !== 0) return featuredDiff;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury flex flex-col gap-8">
        
        {/* Search header container */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-maroon-100/50">
            <Flower2 size={12} className="text-[var(--color-brand-secondary)]" />
            Discover Celebrations
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-charcoal-900 leading-tight">
            Explore Wedding Celebrations
          </h1>
          <p className="text-charcoal-500 text-sm md:text-base leading-relaxed">
            Attend a real wedding as an honored global guest. Verified hosts, safe booking, cultural guides.
          </p>
        </div>

        {/* Dynamic URL Search Bar & Mobile Filter Drawer */}
        <Suspense fallback={<div className="h-20 w-full bg-warm-100 rounded-3xl animate-pulse" />}>
          <MarketplaceHeaderWrapper />
        </Suspense>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-2">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-28 bg-white border border-warm-200/60 rounded-3xl p-6 shadow-card">
            <Suspense fallback={<div className="h-96 bg-warm-100 rounded-2xl animate-pulse" />}>
              <FilterSidebar />
            </Suspense>
          </div>

          {/* Marketplace Listing area */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
            {/* Top Toolbar / Counts & Sorting */}
            <div className="flex items-center justify-between bg-white border border-warm-200/60 px-5 py-3.5 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-widest">
                {sortedWeddings.length} {sortedWeddings.length === 1 ? "wedding" : "weddings"} found
              </span>
              
              <Suspense fallback={<div className="h-8 w-28 bg-warm-100 rounded animate-pulse" />}>
                <SortDropdownWrapper activeSort={sort} />
              </Suspense>
            </div>

            {/* Weddings Card Grid */}
            {sortedWeddings.length > 0 ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                role="list"
                aria-label="Featured wedding listings"
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
                  Try adjusting your filters, modifying your date, or searching for other regions in India.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate search bar to client scope for searchParams hook usage
function MarketplaceHeaderWrapper() {
  return <MarketplaceHeader />;
}

// Client wrapper for Sort dropdown to update Search params
function SortDropdownWrapper({ activeSort }: { activeSort: string }) {
  return <SortSelect activeSort={activeSort} />;
}
