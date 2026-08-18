"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, RotateCcw, Bookmark, Calendar, MapPin, Sparkles, Shield, Users, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saveSearchAction } from "@/lib/actions/discovery";
import { CANONICAL_RELIGIONS, type ReligionType } from "@/lib/culture";

const CANONICAL_DESTINATIONS = [
  "Rajasthan",
  "Goa",
  "Kerala",
  "Punjab",
  "Himachal Pradesh",
  "Gujarat",
  "Tamil Nadu",
  "Kashmir",
  "Ladakh",
  "Maharashtra",
  "Karnataka",
  "Uttarakhand",
  "Uttar Pradesh",
  "West Bengal",
  "Pondicherry",
  "Andaman and Nicobar Islands"
];

const CANONICAL_TIERS = [
  { id: "SIGNATURE_ROYAL", label: "Signature Royal", desc: "Top-tier palace celebrations" },
  { id: "ROYAL", label: "Royal", desc: "Heritage grand celebrations" },
  { id: "GRAND", label: "Grand", desc: "Multi-day cultural celebrations" },
  { id: "ENHANCED", label: "Enhanced", desc: "2-day focused celebrations" },
  { id: "STANDARD", label: "Standard", desc: "1-day intimate celebrations" }
];

const CANONICAL_DURATIONS = [
  { days: 5, label: "5 Days", desc: "Signature Royal Journey" },
  { days: 4, label: "4 Days", desc: "Multi-Ceremony Grand Experience" },
  { days: 3, label: "3 Days", desc: "Traditional Multi-Event Wedding" },
  { days: 2, label: "2 Days", desc: "Enhanced Family Celebration" },
  { days: 1, label: "1 Day", desc: "Intimate Single-Day Celebration" }
];

const religions: ReligionType[] = CANONICAL_RELIGIONS;

interface FilterSidebarProps {
  durationCounts?: Record<number, number>;
  destinationCounts?: Record<string, number>;
  religionCounts?: Record<string, number>;
  tierCounts?: Record<string, number>;
  minPriceInSystem?: number;
  maxPriceInSystem?: number;
  totalWeddingsCount?: number;
}

export function FilterSidebar({
  durationCounts = {},
  destinationCounts = {},
  religionCounts = {},
  tierCounts = {},
  minPriceInSystem = 149,
  maxPriceInSystem = 1199,
  totalWeddingsCount,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSearch = async () => {
    setIsSaving(true);
    try {
      const filters = Object.fromEntries(searchParams.entries());
      const name = `Saved Search - ${new Date().toLocaleDateString()}`;
      await saveSearchAction(name, filters);
      toast.success("Search saved to your dashboard!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save search. Make sure you are logged in.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to read query values
  const getParamArray = (key: string) => {
    const val = searchParams.get(key);
    return val ? val.split(",") : [];
  };

  const selectedDurations = getParamArray("durations");
  const selectedDestinations = getParamArray("destinations");
  const selectedReligions = getParamArray("religions");
  const selectedTiers = getParamArray("tiers");
  const maxBudget = searchParams.get("maxBudget") || maxPriceInSystem.toString();
  const minGuests = searchParams.get("minGuests") || "";
  const availability = searchParams.get("availability") || "";

  // Helper to update query parameters
  const updateQuery = (key: string, value: string | string[] | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else {
      params.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    
    params.delete("page"); // Reset page
    router.push(`${pathname}?${params.toString()}`);
  };

  // Toggle checklist filter items
  const handleToggle = (key: string, list: string[], item: string) => {
    const newList = list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
    updateQuery(key, newList);
  };

  const handleClearAll = () => {
    router.push(pathname);
  };

  return (
    <aside
      className="w-full flex flex-col gap-6 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain pr-1.5 scrollbar-thin"
      aria-label="Filters"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-warm-200">
        <div className="flex items-center gap-2 text-charcoal-900">
          <SlidersHorizontal size={16} className="text-[var(--color-brand-primary)]" />
          <h2 className="font-display font-bold text-base uppercase tracking-wider">Filters</h2>
          {totalWeddingsCount !== undefined && (
            <span className="text-xs text-charcoal-400 font-sans font-normal">
              ({totalWeddingsCount})
            </span>
          )}
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs font-semibold text-charcoal-400 hover:text-[var(--color-brand-primary)] flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} />
          Clear All
        </button>
      </div>

      {/* 1. DURATION FILTER (1–5 Days) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar size={13} className="text-[var(--color-brand-primary)]" />
            Duration
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {CANONICAL_DURATIONS.map((dur) => {
            const count = durationCounts[dur.days] || 0;
            const strVal = String(dur.days);
            const isChecked = selectedDurations.includes(strVal);
            return (
              <label
                key={dur.days}
                className="flex items-center justify-between text-sm text-charcoal-600 cursor-pointer hover:text-charcoal-900 transition-colors p-1.5 rounded-lg hover:bg-warm-100/50"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle("durations", selectedDurations, strVal)}
                    className="rounded border-warm-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-charcoal-800">{dur.label}</span>
                    <span className="block text-[0.6875rem] text-charcoal-400">{dur.desc}</span>
                  </div>
                </div>
                <span className="text-xs text-charcoal-400 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* 2. DESTINATION / REGION */}
      <div className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest flex items-center gap-1.5">
          <MapPin size={13} className="text-[var(--color-brand-primary)]" />
          Destination
        </h3>
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto overscroll-contain pr-1 scrollbar-thin">
          {CANONICAL_DESTINATIONS.map((dest) => {
            const destLower = dest.toLowerCase();
            const count = destinationCounts[destLower] || 0;
            const isChecked = selectedDestinations.includes(destLower);
            return (
              <label
                key={dest}
                className="flex items-center justify-between text-sm text-charcoal-600 cursor-pointer hover:text-charcoal-900 transition-colors py-1"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle("destinations", selectedDestinations, destLower)}
                    className="rounded border-warm-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] w-4 h-4"
                  />
                  <span>{dest}</span>
                </div>
                {count > 0 && <span className="text-xs text-charcoal-400 font-mono">({count})</span>}
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* 3. CULTURE & TRADITION */}
      <div className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest flex items-center gap-1.5">
          <Shield size={13} className="text-[var(--color-brand-primary)]" />
          Tradition &amp; Culture
        </h3>
        <div className="flex flex-col gap-1.5">
          {religions.map((rel) => {
            const count = religionCounts[rel] || 0;
            const relLower = rel.toLowerCase();
            const isChecked = selectedReligions.includes(relLower);
            return (
              <label
                key={rel}
                className="flex items-center justify-between text-sm text-charcoal-600 cursor-pointer hover:text-charcoal-900 transition-colors py-1"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle("religions", selectedReligions, relLower)}
                    className="rounded border-warm-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] w-4 h-4"
                  />
                  <span>{rel}</span>
                </div>
                {count > 0 && <span className="text-xs text-charcoal-400 font-mono">({count})</span>}
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* 4. EXPERIENCE LEVEL (TIER) */}
      <div className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={13} className="text-[var(--color-brand-primary)]" />
          Experience Tier
        </h3>
        <div className="flex flex-col gap-2">
          {CANONICAL_TIERS.map((t) => {
            const count = tierCounts[t.id] || 0;
            const isChecked = selectedTiers.includes(t.id);
            return (
              <label
                key={t.id}
                className="flex items-center justify-between text-sm text-charcoal-600 cursor-pointer hover:text-charcoal-900 transition-colors p-1.5 rounded-lg hover:bg-warm-100/50"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle("tiers", selectedTiers, t.id)}
                    className="rounded border-warm-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-charcoal-800">{t.label}</span>
                    <span className="block text-[0.6875rem] text-charcoal-400">{t.desc}</span>
                  </div>
                </div>
                <span className="text-xs text-charcoal-400 font-mono">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* 5. GUEST CAPACITY */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest flex items-center gap-1.5">
            <Users size={13} className="text-[var(--color-brand-primary)]" />
            Min Guest Capacity
          </h3>
          <span className="text-sm font-semibold text-[var(--color-brand-primary)]">
            {minGuests ? `${minGuests}+ guests` : "Any"}
          </span>
        </div>
        <select
          value={minGuests}
          onChange={(e) => updateQuery("minGuests", e.target.value)}
          className="input-luxury cursor-pointer bg-white text-sm w-full"
        >
          <option value="">Any Capacity</option>
          <option value="6">6+ International Guests</option>
          <option value="10">10+ International Guests</option>
          <option value="14">14+ International Guests</option>
          <option value="18">18+ International Guests</option>
        </select>
      </div>

      <hr className="border-warm-200/60" />

      {/* 6. MAX BUDGET (Per Guest) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest flex items-center gap-1.5">
            <DollarSign size={13} className="text-[var(--color-brand-primary)]" />
            Max Budget (USD / Guest)
          </h3>
          <span className="text-sm font-semibold text-[var(--color-brand-primary)]">
            ${Number(maxBudget).toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={minPriceInSystem}
          max={maxPriceInSystem}
          step="50"
          value={maxBudget}
          onChange={(e) => updateQuery("maxBudget", e.target.value)}
          className="w-full h-1.5 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-primary)]"
        />
        <div className="flex justify-between text-[0.6875rem] text-charcoal-400 font-mono">
          <span>${minPriceInSystem.toLocaleString()}</span>
          <span>${maxPriceInSystem.toLocaleString()}</span>
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* 7. AVAILABILITY */}
      <div className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest">
          Availability Status
        </h3>
        <div className="flex flex-col gap-2">
          {[
            { id: "", label: "All Celebrations" },
            { id: "available", label: "Accepting Guests (Open)" },
            { id: "fully_booked", label: "Fully Booked (Showcase)" },
          ].map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2.5 text-sm text-charcoal-600 cursor-pointer hover:text-charcoal-900 transition-colors"
            >
              <input
                type="radio"
                name="availability"
                value={opt.id}
                checked={availability === opt.id}
                onChange={(e) => updateQuery("availability", e.target.value)}
                className="text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] w-4 h-4"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-warm-200/60" />

      <button
        onClick={handleSaveSearch}
        disabled={isSaving}
        className="btn btn-secondary w-full text-xs font-bold flex items-center justify-center gap-2"
      >
        <Bookmark size={14} />
        {isSaving ? "Saving..." : "Save This Search"}
      </button>
    </aside>
  );
}
