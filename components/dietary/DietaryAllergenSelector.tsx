"use client";

import React, { useEffect, useState, useId } from "react";
import {
  DIETARY_OPTIONS,
  formatDietaryRequirements,
  parseDietaryRequirements,
} from "@/lib/dietary";
import { Check, ShieldAlert } from "lucide-react";

export interface DietaryAllergenSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

export function DietaryAllergenSelector({
  value,
  onChange,
  label = "Dietary & Medical Allergens",
  description = "Select all dietary lifestyle choices and medical food allergies. Caterers and kitchen staff strictly adhere to these protocols.",
  className = "",
  id,
}: DietaryAllergenSelectorProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [selection, setSelection] = useState(() => parseDietaryRequirements(value));

  // Sync internal state when external value changes
  useEffect(() => {
    const parsed = parseDietaryRequirements(value);
    setSelection((prev) => {
      const isChipsSame =
        prev.chips.length === parsed.chips.length &&
        prev.chips.every((c, i) => c === parsed.chips[i]);
      if (isChipsSame && prev.notes === parsed.notes) {
        return prev;
      }
      return parsed;
    });
  }, [value]);

  const updateSelection = (newChips: string[], newNotes: string) => {
    const updated = { chips: newChips, notes: newNotes };
    setSelection(updated);
    onChange(formatDietaryRequirements(updated));
  };

  const toggleChip = (chipLabel: string) => {
    const exists = selection.chips.includes(chipLabel);
    const newChips = exists
      ? selection.chips.filter((c) => c !== chipLabel)
      : [...selection.chips, chipLabel];
    updateSelection(newChips, selection.notes);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSelection(selection.chips, e.target.value);
  };

  const hasMedicalAlert = selection.chips.some((chip) => {
    const opt = DIETARY_OPTIONS.find((o) => o.label === chip);
    return opt?.isMedical;
  });

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={`${inputId}-notes`}
          className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest flex items-center justify-between"
        >
          <span>{label}</span>
          {selection.chips.length > 0 && (
            <span className="text-maroon-800 font-semibold lowercase">
              {selection.chips.length} selected
            </span>
          )}
        </label>
        {description && (
          <p className="text-[11px] text-charcoal-500">{description}</p>
        )}
      </div>

      {/* Structured Category Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DIETARY_OPTIONS.map((opt) => {
          const isSelected = selection.chips.includes(opt.label);
          return (
            <button
              key={opt.id}
              type="button"
              id={`dietary-chip-${opt.id}`}
              onClick={() => toggleChip(opt.label)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                isSelected
                  ? opt.isMedical
                    ? "bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-sm ring-1 ring-rose-400"
                    : "bg-maroon-50 border-maroon-800 text-maroon-950 font-bold shadow-sm ring-1 ring-maroon-800"
                  : "bg-white border-warm-200 text-charcoal-700 hover:border-warm-400 hover:bg-warm-50/50"
              }`}
            >
              <span className="text-base shrink-0">{opt.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate flex items-center gap-1">
                  <span>{opt.label}</span>
                  {opt.isMedical && (
                    <span className="text-[9px] px-1 py-0.2 bg-rose-200 text-rose-800 rounded font-black uppercase">
                      Alert
                    </span>
                  )}
                </div>
              </div>
              {isSelected && (
                <Check
                  size={14}
                  className={`shrink-0 ${
                    opt.isMedical ? "text-rose-600" : "text-maroon-800"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* High-Contrast Medical Safety Alert Banner */}
      {hasMedicalAlert && (
        <div
          role="alert"
          className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900 animate-in fade-in duration-200"
        >
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-amber-950">
              Critical Medical Allergen Flagged
            </p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Your severe allergen restrictions will be highlighted with high priority on host catering manifests and kitchen kitchen prep registers. Please describe cross-contamination or EpiPen details below.
            </p>
          </div>
        </div>
      )}

      {/* Custom Dietary & Allergen Notes */}
      <div className="space-y-1">
        <label
          htmlFor={`${inputId}-notes`}
          className="text-[11px] font-semibold text-charcoal-600 block"
        >
          Specific Details, Exclusions & Medical Instructions
        </label>
        <textarea
          id={`${inputId}-notes`}
          value={selection.notes}
          onChange={handleNotesChange}
          placeholder="e.g., Severe peanut & cashew anaphylaxis, carries EpiPen. No sesame oil or mustard seeds."
          rows={2}
          className="w-full border border-warm-200 rounded-xl px-3 py-2 text-xs bg-warm-50/20 focus:outline-none focus:border-maroon-800 focus:ring-1 focus:ring-maroon-800"
        />
      </div>
    </div>
  );
}

export default DietaryAllergenSelector;
