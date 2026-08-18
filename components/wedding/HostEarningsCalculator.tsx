"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Users,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WeddingTier,
  WeddingDurationDays,
  WEDDING_TIER_CONFIG,
  getHostPayoutPerGuestINR,
  getCustomerPriceUSD,
} from "@/lib/services/pricing-engine";

export interface HostEarningsCalculatorProps {
  initialTier?: WeddingTier;
  initialDuration?: WeddingDurationDays;
  initialGuests?: number;
  onApplyPreset?: (tier: WeddingTier, duration: WeddingDurationDays, guests: number) => void;
  className?: string;
}

const TIER_FRIENDLY_DESCRIPTIONS: Record<WeddingTier, { title: string; subtitle: string }> = {
  STANDARD: {
    title: "Standard",
    subtitle: "Authentic cultural entry",
  },
  ENHANCED: {
    title: "Enhanced",
    subtitle: "Multi-event cultural experience",
  },
  GRAND: {
    title: "Grand",
    subtitle: "Large multi-day celebration",
  },
  ROYAL: {
    title: "Royal",
    subtitle: "Premium multi-day wedding experience",
  },
  SIGNATURE_ROYAL: {
    title: "Signature Royal",
    subtitle: "Exceptional full-scale celebration",
  },
};

const PRESET_EXAMPLES: Array<{
  label: string;
  tier: WeddingTier;
  duration: WeddingDurationDays;
  guests: number;
  expectedTotalINR: string;
}> = [
  {
    label: "Standard 1d (5 guests)",
    tier: "STANDARD",
    duration: 1,
    guests: 5,
    expectedTotalINR: "₹25,505",
  },
  {
    label: "Grand 3d (10 guests)",
    tier: "GRAND",
    duration: 3,
    guests: 10,
    expectedTotalINR: "₹2,01,010",
  },
  {
    label: "Royal 4d (20 guests)",
    tier: "ROYAL",
    duration: 4,
    guests: 20,
    expectedTotalINR: "₹8,22,020",
  },
  {
    label: "Signature Royal 4d (20 guests)",
    tier: "SIGNATURE_ROYAL",
    duration: 4,
    guests: 20,
    expectedTotalINR: "₹10,22,020",
  },
  {
    label: "Signature Royal 5d (20 guests)",
    tier: "SIGNATURE_ROYAL",
    duration: 5,
    guests: 20,
    expectedTotalINR: "₹12,22,020",
  },
  {
    label: "Signature Royal 5d (50 guests)",
    tier: "SIGNATURE_ROYAL",
    duration: 5,
    guests: 50,
    expectedTotalINR: "₹30,55,050",
  },
];

/**
 * Formats an INR amount into a psychological Indian Lakh/Crore headline string.
 * Example: 1222020 -> "₹12.22 Lakh", 1022020 -> "₹10.22 Lakh", 25505 -> "₹25.5 Thousand"
 */
export function formatPsychologicalLakh(amount: number): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, "");
    return `₹${cr} Crore`;
  }
  if (amount >= 100000) {
    const lakh = (amount / 100000).toFixed(2).replace(/\.00$/, "");
    return `₹${lakh} Lakh`;
  }
  if (amount >= 10000) {
    const k = (amount / 1000).toFixed(1).replace(/\.0$/, "");
    return `₹${k} Thousand`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function HostEarningsCalculator({
  initialTier = "SIGNATURE_ROYAL",
  initialDuration = 5,
  initialGuests = 20,
  onApplyPreset,
  className,
}: HostEarningsCalculatorProps) {
  const [selectedDuration, setSelectedDuration] = useState<WeddingDurationDays>(initialDuration);
  const [selectedTier, setSelectedTier] = useState<WeddingTier>(initialTier);
  const [uniqueGuests, setUniqueGuests] = useState<number>(initialGuests);
  const [dailyGuests, setDailyGuests] = useState<Record<number, number>>(() => ({
    1: initialGuests,
    2: initialGuests,
    3: Math.max(1, initialGuests - 2),
    4: initialGuests,
    5: initialGuests,
  }));
  const [showCalculationDrawer, setShowCalculationDrawer] = useState<boolean>(false);

  // Authoritative calculations from pricing-engine
  const ratePerGuestINR = getHostPayoutPerGuestINR(selectedTier, selectedDuration);
  const totalHostEarningsINR = ratePerGuestINR * uniqueGuests;
  const customerPriceUSD = getCustomerPriceUSD(selectedTier, selectedDuration);

  // Informational daily averages (strictly labelled as informational equivalents)
  const averageDailyHostEquivalentINR = totalHostEarningsINR / (selectedDuration * uniqueGuests);
  const averageDailyCustomerEquivalentUSD = (customerPriceUSD / selectedDuration).toFixed(2);

  const psychologicalHeadline = useMemo(
    () => formatPsychologicalLakh(totalHostEarningsINR),
    [totalHostEarningsINR]
  );

  const handleDurationChange = (days: WeddingDurationDays) => {
    setSelectedDuration(days);
    // Initialize day counts if not present
    setDailyGuests((prev) => {
      const next = { ...prev };
      for (let i = 1; i <= days; i++) {
        if (!next[i]) next[i] = uniqueGuests;
      }
      return next;
    });
  };

  const handleUniqueGuestsChange = (val: number) => {
    const clamped = Math.max(1, Math.min(100, isNaN(val) ? 1 : Math.floor(val)));
    setUniqueGuests(clamped);
    // Sync daily counts proportionally
    setDailyGuests((prev) => {
      const next = { ...prev };
      for (let i = 1; i <= 5; i++) {
        next[i] = clamped;
      }
      return next;
    });
  };

  const handleDailyGuestChange = (dayIndex: number, val: number) => {
    const clamped = Math.max(1, Math.min(100, isNaN(val) ? 1 : Math.floor(val)));
    setDailyGuests((prev) => ({
      ...prev,
      [dayIndex]: clamped,
    }));
  };

  const handleSelectPreset = (preset: (typeof PRESET_EXAMPLES)[0]) => {
    setSelectedTier(preset.tier);
    setSelectedDuration(preset.duration);
    setUniqueGuests(preset.guests);
    setDailyGuests({
      1: preset.guests,
      2: preset.guests,
      3: Math.max(1, preset.guests - 2),
      4: preset.guests,
      5: preset.guests,
    });
    if (onApplyPreset) {
      onApplyPreset(preset.tier, preset.duration, preset.guests);
    }
  };

  return (
    <div
      className={cn(
        "bg-white border border-warm-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in",
        className
      )}
    >
      {/* Header & Tagline */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-maroon-100/60">
          <Sparkles size={13} className="text-[var(--color-gold-600)]" />
          Interactive Host Revenue Planner
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-4xl text-charcoal-900 leading-tight">
          How Much Could Your Wedding Earn?
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-500 max-w-xl mx-auto leading-relaxed">
          Select your wedding duration, celebration tier, and expected international guest attendance to calculate your potential host payout.
        </p>
      </div>

      {/* Preset Quick-Picks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-charcoal-500 uppercase tracking-wider">
          <span>Quick Benchmark Scenarios:</span>
          <span className="text-[0.6875rem] font-normal text-charcoal-400">Click to explore</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PRESET_EXAMPLES.map((preset) => {
            const isMatch =
              selectedTier === preset.tier &&
              selectedDuration === preset.duration &&
              uniqueGuests === preset.guests;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1.5 cursor-pointer shrink-0",
                  isMatch
                    ? "bg-maroon-900 text-white border-maroon-900 shadow-xs"
                    : "bg-warm-50/80 text-charcoal-700 border-warm-200 hover:bg-warm-100 hover:border-warm-300"
                )}
              >
                <span>{preset.label}</span>
                <span
                  className={cn(
                    "text-[0.6875rem] font-black px-1.5 py-0.5 rounded",
                    isMatch
                      ? "bg-white/20 text-gold-300"
                      : "bg-maroon-50 text-[var(--color-brand-primary)]"
                  )}
                >
                  {preset.expectedTotalINR}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Grid: Controls on Left, Big Psychological Earnings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 bg-warm-50/50 p-6 sm:p-7 rounded-3xl border border-warm-200/70">
          {/* STEP 1: Wedding Duration */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-charcoal-700">
              <span className="uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-maroon-700" />
                Step 1: Wedding Duration
              </span>
              <span className="text-[var(--color-brand-primary)] font-extrabold">
                {selectedDuration} {selectedDuration === 1 ? "Day" : "Days"}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as WeddingDurationDays[]).map((days) => {
                const isSelected = selectedDuration === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handleDurationChange(days)}
                    aria-pressed={isSelected}
                    className={cn(
                      "py-3 rounded-2xl text-center text-xs font-bold transition-all border cursor-pointer",
                      isSelected
                        ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)] shadow-sm"
                        : "bg-white text-charcoal-700 border-warm-200 hover:border-warm-300"
                    )}
                  >
                    {days} {days === 1 ? "Day" : "Days"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Wedding Experience Tier */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-charcoal-700">
              <span className="uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-700" />
                Step 2: Experience Tier
              </span>
              <span className="text-[var(--color-brand-primary)] font-extrabold">
                {TIER_FRIENDLY_DESCRIPTIONS[selectedTier].title}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                ["STANDARD", "ENHANCED", "GRAND", "ROYAL", "SIGNATURE_ROYAL"] as WeddingTier[]
              ).map((tierKey) => {
                const isSelected = selectedTier === tierKey;
                const info = TIER_FRIENDLY_DESCRIPTIONS[tierKey];

                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setSelectedTier(tierKey)}
                    aria-pressed={isSelected}
                    className={cn(
                      "p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between gap-1 cursor-pointer",
                      isSelected
                        ? "bg-maroon-50 border-[var(--color-brand-primary)] shadow-xs ring-2 ring-[var(--color-brand-primary)]/20"
                        : "bg-white border-warm-200 hover:border-warm-300 text-charcoal-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-charcoal-900">
                        {info.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2
                          size={14}
                          className="text-[var(--color-brand-primary)]"
                        />
                      )}
                    </div>
                    <span className="text-[0.6875rem] text-charcoal-500 leading-snug line-clamp-2">
                      {info.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[0.6875rem] text-charcoal-400 italic">
              Tier selection reflects your celebration style and experience scale. Our team manually verifies the tier before listing.
            </p>
          </div>

          {/* STEP 3: Expected Unique International Guests */}
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-xs font-bold text-charcoal-700">
              <span className="uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-maroon-700" />
                Step 3: Unique International Guests
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={uniqueGuests}
                  onChange={(e) => handleUniqueGuestsChange(Number(e.target.value))}
                  className="w-16 h-8 text-center text-xs font-bold bg-white border border-warm-300 rounded-lg text-charcoal-900 focus:outline-none focus:border-maroon-600"
                />
                <span className="text-xs font-extrabold text-[var(--color-brand-primary)]">
                  {uniqueGuests === 1 ? "Guest" : "Guests"}
                </span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={50}
              value={uniqueGuests}
              onChange={(e) => handleUniqueGuestsChange(Number(e.target.value))}
              aria-label="Expected unique international guests"
              className="w-full accent-[var(--color-brand-primary)] cursor-pointer h-2 bg-warm-200 rounded-lg"
            />

            <div className="flex justify-between text-[0.6875rem] font-medium text-charcoal-400">
              <span>1 Guest</span>
              <span>20 Guests (Popular)</span>
              <span>50 Guests</span>
            </div>
          </div>

          {/* STEP 4: Day-by-Day Guest Planner */}
          <div className="space-y-3 pt-2 border-t border-warm-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-700" />
                Step 4: International Guests Attending by Day
              </span>
              <span className="text-[0.6875rem] text-charcoal-500 font-semibold">
                {selectedDuration} {selectedDuration === 1 ? "Day Event" : "Days Planned"}
              </span>
            </div>
            <p className="text-[0.6875rem] text-charcoal-500 leading-relaxed">
              How many guests do you anticipate welcoming on each day of your celebration? Some guests may attend multiple or all days.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Array.from({ length: selectedDuration }, (_, i) => i + 1).map((dayNum) => (
                <div
                  key={dayNum}
                  className="bg-white border border-warm-200 p-3 rounded-2xl space-y-1.5"
                >
                  <div className="flex justify-between items-center text-[0.6875rem] font-bold text-charcoal-600">
                    <span>DAY {dayNum}</span>
                    <span className="text-amber-700 font-mono">
                      {dailyGuests[dayNum] || uniqueGuests} guests
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={dailyGuests[dayNum] || uniqueGuests}
                    onChange={(e) => handleDailyGuestChange(dayNum, Number(e.target.value))}
                    className="w-full h-8 text-center text-xs font-semibold bg-warm-50/50 border border-warm-200 rounded-lg text-charcoal-900"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Result Headline Column (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-warm-100/90 via-warm-50 to-amber-50/40 border border-warm-200 p-7 sm:p-8 rounded-3xl text-center space-y-6 shadow-sm sticky top-28">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-widest block">
              Your Potential Host Earnings
            </span>

            {/* Big Psychological Lakh Headline */}
            <div className="font-display font-black text-4xl sm:text-5xl text-[var(--color-brand-primary)] tracking-tight">
              {psychologicalHeadline}
            </div>

            {/* Exact Unrounded INR */}
            <div className="text-sm sm:text-base font-bold text-charcoal-800">
              ₹{totalHostEarningsINR.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-medium text-charcoal-500">exact</span>
            </div>
          </div>

          {/* Breakdown Tag */}
          <div className="p-4 bg-white/90 backdrop-blur-xs rounded-2xl border border-warm-200/80 text-xs text-charcoal-700 space-y-1.5 shadow-xs">
            <div className="font-bold text-charcoal-900">
              <span className="text-[var(--color-brand-primary)] font-black">
                {uniqueGuests} unique international {uniqueGuests === 1 ? "guest" : "guests"}
              </span>{" "}
              × ₹{ratePerGuestINR.toLocaleString("en-IN")} fixed payout / guest
            </div>
            <div className="text-[0.6875rem] text-charcoal-500">
              {TIER_FRIENDLY_DESCRIPTIONS[selectedTier].title} Tier • {selectedDuration}-Day Celebration
            </div>
          </div>

          <p className="text-xs text-charcoal-500 max-w-sm mx-auto leading-relaxed">
            Illustrative estimate based on confirmed attending international guests. Actual earnings are based on the verified tier rate and completed attendance under your host agreement.
          </p>

          {/* Expandable Calculation Details Drawer */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowCalculationDrawer(!showCalculationDrawer)}
              className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1"
            >
              <span>{showCalculationDrawer ? "Hide calculation breakdown" : "See how this is calculated"}</span>
              {showCalculationDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showCalculationDrawer && (
              <div className="text-left text-xs bg-white p-5 rounded-2xl border border-warm-200 space-y-3 mt-3 animate-fade-in shadow-xs">
                <h4 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider border-b border-warm-100 pb-2">
                  Calculation Breakdown & Economics
                </h4>

                <div className="space-y-1.5 text-[0.6875rem]">
                  <div className="flex justify-between py-1 border-b border-warm-50">
                    <span className="text-charcoal-500">Selected Tier:</span>
                    <span className="font-bold text-charcoal-800">
                      {WEDDING_TIER_CONFIG[selectedTier].label}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-warm-50">
                    <span className="text-charcoal-500">Celebration Duration:</span>
                    <span className="font-bold text-charcoal-800">
                      {selectedDuration} {selectedDuration === 1 ? "Day" : "Days"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-warm-50">
                    <span className="text-charcoal-500">Unique Expected Guests:</span>
                    <span className="font-bold text-charcoal-800">{uniqueGuests} guests</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-warm-50">
                    <span className="text-charcoal-500">Fixed Host Payout Rate:</span>
                    <span className="font-bold text-charcoal-900">
                      ₹{ratePerGuestINR.toLocaleString("en-IN")} / guest
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 font-bold text-charcoal-900 border-b border-warm-100">
                    <span>Total Estimated Potential Payout:</span>
                    <span className="text-[var(--color-brand-primary)]">
                      ₹{totalHostEarningsINR.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Informational Average Daily Equivalent */}
                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70 space-y-1 mt-2">
                    <span className="font-bold text-[0.625rem] text-amber-900 uppercase tracking-wide block">
                      Informational Daily Equivalents:
                    </span>
                    <div className="flex justify-between text-amber-800 text-[0.625rem]">
                      <span>Average host payout per day:</span>
                      <span className="font-semibold">
                        ₹{averageDailyHostEquivalentINR.toFixed(2)} / guest / day
                      </span>
                    </div>
                    <div className="flex justify-between text-amber-800 text-[0.625rem]">
                      <span>Average customer package value:</span>
                      <span className="font-semibold">
                        ${averageDailyCustomerEquivalentUSD} / guest / day (${customerPriceUSD} total)
                      </span>
                    </div>
                    <p className="text-[0.5625rem] text-amber-700 italic pt-0.5">
                      * Informational only. Bookings and payouts are governed by the authoritative whole-package rate, not daily multipliers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protective Trust Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-warm-200 bg-warm-50/40 p-5">
        <Info
          size={18}
          className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
          aria-hidden="true"
        />
        <p className="text-xs text-charcoal-600 leading-relaxed">
          <strong className="text-charcoal-900">Important Host Notice:</strong>{" "}
          This calculator provides planning estimates based on the official fixed INR per-guest host payout matrix. Commercial payouts depend on verified international guest attendance and compliance with host guidelines.
        </p>
      </div>
    </div>
  );
}
