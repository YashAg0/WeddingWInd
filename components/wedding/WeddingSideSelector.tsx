"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type WeddingSideValue = "BRIDE_SIDE" | "GROOM_SIDE" | "OPEN";

interface WeddingSideSelectorProps {
  value: WeddingSideValue;
  onChange: (side: WeddingSideValue) => void;
  disabled?: boolean;
}

const SIDES: {
  value: WeddingSideValue;
  label: string;
  sublabel: string;
  emoji: string;
  color: string;
  selectedColor: string;
}[] = [
  {
    value: "BRIDE_SIDE",
    label: "Bride's Side",
    sublabel: "Guest of the bride's family",
    emoji: "💐",
    color: "border-warm-200 hover:border-maroon-300 bg-white hover:bg-maroon-50/20",
    selectedColor:
      "border-[var(--color-brand-primary)] bg-maroon-50/30 ring-2 ring-[var(--color-brand-primary)]/20",
  },
  {
    value: "GROOM_SIDE",
    label: "Groom's Side",
    sublabel: "Guest of the groom's family",
    emoji: "🪢",
    color: "border-warm-200 hover:border-gold-400 bg-white hover:bg-gold-50/20",
    selectedColor:
      "border-[var(--color-brand-secondary)] bg-gold-50/30 ring-2 ring-[var(--color-brand-secondary)]/20",
  },
];

export function WeddingSideSelector({
  value,
  onChange,
  disabled = false,
}: WeddingSideSelectorProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <label className="text-[0.6875rem] font-bold text-charcoal-700 uppercase tracking-widest block">
          Which side would you like to join?
        </label>
        <span className="text-[0.6875rem] text-charcoal-500 font-medium block mt-0.5">
          Your choice helps us personalize your experience. You can change this anytime from your dashboard.
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {SIDES.map((side) => {
          const isSelected = value === side.value;
          return (
            <motion.button
              key={side.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(side.value)}
              whileTap={disabled ? undefined : { scale: 0.97 }}
              className={cn(
                "relative flex flex-col items-center text-center px-3 py-3.5 rounded-2xl border transition-all duration-200 cursor-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected ? side.selectedColor : side.color
              )}
              aria-pressed={isSelected}
              aria-label={`Join as ${side.label}`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.span
                  layoutId="side-indicator"
                  className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--color-brand-primary)] flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 4l2 2 4-4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.span>
              )}

              <span className="text-2xl leading-none mb-2" aria-hidden="true">
                {side.emoji}
              </span>
              <span
                className={cn(
                  "font-display font-bold text-sm leading-tight",
                  isSelected
                    ? "text-[var(--color-brand-primary)]"
                    : "text-charcoal-800"
                )}
              >
                {side.label}
              </span>
              <span className="text-[0.625rem] text-charcoal-500 leading-snug mt-0.5 font-medium">
                {side.sublabel}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

