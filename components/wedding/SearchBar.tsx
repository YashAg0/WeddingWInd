"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, MapPin, Calendar, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  onToggleMobileFilters?: () => void;
}

export function SearchBar({ onToggleMobileFilters }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [style, setStyle] = useState(searchParams.get("category") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");

  // Update local state when searchParams change
  useEffect(() => {
    setDestination(searchParams.get("destination") || "");
    setStyle(searchParams.get("category") || "");
    setDate(searchParams.get("date") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (destination) params.set("destination", destination);
    else params.delete("destination");
    
    if (style) params.set("category", style);
    else params.delete("category");
    
    if (date) params.set("date", date);
    else params.delete("date");

    // Reset pagination if any
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl mx-auto z-10"
      aria-label="Search weddings"
    >
      <div className="glass rounded-3xl p-2.5 flex flex-col md:flex-row gap-2 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.1)] border border-white">
        
        {/* Destination Input */}
        <div className="flex-1 flex items-center gap-3 bg-white/70 hover:bg-white focus-within:bg-white rounded-2xl px-4 py-3 transition-colors duration-200 border border-warm-200/50">
          <MapPin size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <label
              htmlFor="destination-input"
              className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest"
            >
              Where
            </label>
            <input
              id="destination-input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Jodhpur, Goa, Kerala…"
              className="text-sm text-charcoal-900 placeholder:text-charcoal-400 bg-transparent outline-none font-semibold mt-0.5"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px self-stretch bg-warm-200/60" aria-hidden="true" />

        {/* Wedding Style Dropdown */}
        <div className="flex-1 flex items-center gap-3 bg-white/70 hover:bg-white focus-within:bg-white rounded-2xl px-4 py-3 transition-colors duration-200 border border-warm-200/50">
          <span className="text-lg flex-shrink-0" aria-hidden="true">🪷</span>
          <div className="flex flex-col min-w-0 flex-1">
            <label
              htmlFor="style-select"
              className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest"
            >
              Wedding Style
            </label>
            <select
              id="style-select"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="text-sm text-charcoal-900 bg-transparent outline-none font-semibold mt-0.5 appearance-none cursor-pointer w-full"
            >
              <option value="">All Styles</option>
              <option value="royal">Royal</option>
              <option value="punjabi">Punjabi</option>
              <option value="south indian">South Indian</option>
              <option value="beach">Beach</option>
              <option value="destination">Destination</option>
              <option value="traditional">Traditional</option>
            </select>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px self-stretch bg-warm-200/60" aria-hidden="true" />

        {/* Date Selector */}
        <div className="flex-1 flex items-center gap-3 bg-white/70 hover:bg-white focus-within:bg-white rounded-2xl px-4 py-3 transition-colors duration-200 border border-warm-200/50">
          <Calendar size={18} className="text-[var(--color-brand-primary)] flex-shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <label
              htmlFor="date-input"
              className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest"
            >
              When
            </label>
            <input
              id="date-input"
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm text-charcoal-900 bg-transparent outline-none font-semibold mt-0.5 cursor-pointer w-full"
            />
          </div>
        </div>

        {/* Form Controls */}
        <div className="flex items-center gap-2 pt-2 md:pt-0">
          {onToggleMobileFilters && (
            <button
              type="button"
              onClick={onToggleMobileFilters}
              className="md:hidden flex items-center justify-center p-3.5 rounded-2xl bg-white border border-warm-200 text-charcoal-700 hover:bg-warm-50 active:scale-95 transition-all flex-1"
              aria-label="Show filters"
            >
              <SlidersHorizontal size={18} />
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl active:scale-95 transition-all flex-1 md:flex-initial flex items-center justify-center gap-2"
          >
            <Search size={18} />
            <span className="md:hidden lg:inline">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
