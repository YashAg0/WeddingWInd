"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, RotateCcw, Bookmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saveSearchAction } from "@/lib/actions/discovery";

// Filter options
const styles = ["Royal", "Punjabi", "South Indian", "Beach", "Destination", "Traditional"];
const religions = ["Hinduism", "Sikhism", "Christianity", "Islam", "Jainism"];
const luxuryLevels = ["Premium", "Luxury", "Ultra-Luxury"];
const languages = ["English", "Hindi", "Punjabi", "Tamil", "Telugu", "Malayalam"];

export function FilterSidebar() {
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

  const selectedStyles = getParamArray("styles");
  const selectedReligions = getParamArray("religions");
  const selectedLux = getParamArray("luxuryLevels");
  const selectedLangs = getParamArray("languages");
  const maxBudget = searchParams.get("maxBudget") || "5000";
  const minSlots = searchParams.get("minSlots") || "0";
  const duration = searchParams.get("duration") || "";

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
    <aside className="w-full flex flex-col gap-6" aria-label="Filters">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-warm-200">
        <div className="flex items-center gap-2 text-charcoal-900">
          <SlidersHorizontal size={16} />
          <h2 className="font-display font-bold text-base uppercase tracking-wider">Filters</h2>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs font-semibold text-charcoal-400 hover:text-[var(--color-brand-primary)] flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} />
          Clear All
        </button>
      </div>

      {/* Style Filter */}
      <div className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest">
          Wedding Style
        </h3>
        <div className="flex flex-col gap-2">
          {styles.map((style) => (
            <label key={style} className="flex items-center gap-2.5 text-sm text-charcoal-600 cursor-pointer hover:text-charcoal-900 transition-colors">
              <input
                type="checkbox"
                checked={selectedStyles.includes(style.toLowerCase())}
                onChange={() => handleToggle("styles", selectedStyles, style.toLowerCase())}
                className="rounded border-warm-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] w-4 h-4"
              />
              {style}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* Budget Filter */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest">
            Max Budget (Per Guest)
          </h3>
          <span className="text-sm font-semibold text-[var(--color-brand-primary)]">
            ${Number(maxBudget).toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="250"
          value={maxBudget}
          onChange={(e) => updateQuery("maxBudget", e.target.value)}
          className="w-full h-1.5 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-primary)]"
        />
        <div className="flex justify-between text-[0.6875rem] text-charcoal-400">
          <span>$500</span>
          <span>$5,000+</span>
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* Luxury Level Filter */}
      <div className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest">
          Luxury Level
        </h3>
        <div className="flex flex-col gap-2">
          {luxuryLevels.map((level) => (
            <label key={level} className="flex items-center gap-2.5 text-sm text-charcoal-600 cursor-pointer hover:text-charcoal-900 transition-colors">
              <input
                type="checkbox"
                checked={selectedLux.includes(level.toLowerCase())}
                onChange={() => handleToggle("luxuryLevels", selectedLux, level.toLowerCase())}
                className="rounded border-warm-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] w-4 h-4"
              />
              {level}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* Religion Filter */}
      <div className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest">
          Religion
        </h3>
        <div className="flex flex-col gap-2">
          {religions.map((rel) => (
            <label key={rel} className="flex items-center gap-2.5 text-sm text-charcoal-600 cursor-pointer hover:text-charcoal-900 transition-colors">
              <input
                type="checkbox"
                checked={selectedReligions.includes(rel.toLowerCase())}
                onChange={() => handleToggle("religions", selectedReligions, rel.toLowerCase())}
                className="rounded border-warm-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] w-4 h-4"
              />
              {rel}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* Guest Slots Filter */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest">
            Min Slots Available
          </h3>
          <span className="text-sm font-semibold text-[var(--color-brand-primary)]">
            {minSlots} slots
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="10"
          value={minSlots}
          onChange={(e) => updateQuery("minSlots", e.target.value)}
          className="w-full h-1.5 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-primary)]"
        />
      </div>

      <hr className="border-warm-200/60" />

      {/* Languages Filter */}
      <div className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest">
          Languages Spoken
        </h3>
        <div className="flex flex-col gap-2">
          {languages.map((lang) => (
            <label key={lang} className="flex items-center gap-2.5 text-sm text-charcoal-600 cursor-pointer hover:text-charcoal-900 transition-colors">
              <input
                type="checkbox"
                checked={selectedLangs.includes(lang.toLowerCase())}
                onChange={() => handleToggle("languages", selectedLangs, lang.toLowerCase())}
                className="rounded border-warm-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] w-4 h-4"
              />
              {lang}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-warm-200/60" />

      {/* Duration Filter */}
      <div className="space-y-3">
        <h3 className="font-sans font-bold text-xs text-charcoal-800 uppercase tracking-widest">
          Duration (Days)
        </h3>
        <select
          value={duration}
          onChange={(e) => updateQuery("duration", e.target.value)}
          className="input-luxury cursor-pointer bg-white text-sm"
        >
          <option value="">Any Duration</option>
          <option value="1">1 Day</option>
          <option value="2">2 Days</option>
          <option value="3">3 Days+</option>
        </select>
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
