"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQItem } from "@/types";

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openId, setOpenId] = useState<string | null>(
    items[0]?.id ?? null
  );

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  if (!items.length) {
    return null;
  }

  return (
    <div
      className="flex flex-col gap-3"
      role="list"
      aria-label="Frequently asked questions"
    >
      {items.map((item) => (
        <div key={item.id} role="listitem">
          <FAQAccordionItem
            item={item}
            isOpen={openId === item.id}
            onToggle={() => toggle(item.id)}
          />
        </div>
      ))}
    </div>
  );
}

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const buttonId = `faq-${item.id}`;
  const contentId = `faq-content-${item.id}`;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition-all duration-200",
        isOpen
          ? "border-[var(--color-brand-primary)]/25 shadow-[0_4px_20px_rgba(107,16,38,0.07)]"
          : "border-warm-200 hover:border-[var(--color-brand-primary)]/20"
      )}
    >
      <button
        id={buttonId}
        type="button"
        className={cn(
          "w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]/30 focus-visible:ring-inset",
          "transition-colors duration-200",
          isOpen
            ? "bg-maroon-50/70"
            : "bg-white hover:bg-warm-50/70"
        )}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span
          className={cn(
            "font-bold text-sm sm:text-base leading-snug pr-2 transition-colors duration-200",
            isOpen
              ? "text-[var(--color-brand-primary)]"
              : "text-charcoal-900"
          )}
        >
          {item.question}
        </span>

        <span
          className={cn(
            "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
            "transition-all duration-200",
            isOpen
              ? "bg-[var(--color-brand-primary)] text-white rotate-45"
              : "bg-warm-100 text-charcoal-500"
          )}
          aria-hidden="true"
        >
          <Plus size={15} strokeWidth={2.2} />
        </span>
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
      >
        <div className="px-4 sm:px-5 pb-5 pt-1 sm:pb-5 bg-white border-t border-warm-100">
          <p className="text-charcoal-700 text-sm sm:text-[0.9375rem] leading-relaxed max-w-2xl">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}