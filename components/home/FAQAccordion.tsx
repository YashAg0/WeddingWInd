"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQItem } from "@/types";

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="flex flex-col gap-4"
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
  const id = `faq-${item.id}`;
  const contentId = `faq-content-${item.id}`;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300",
        isOpen
          ? "border-[var(--color-brand-primary)]/20 shadow-[0_4px_24px_0_rgba(107,16,38,0.08)]"
          : "border-warm-200 hover:border-[var(--color-brand-primary)]/15"
      )}
    >
      <button
        id={id}
        type="button"
        className={cn(
          "w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left rounded-2xl transition-colors duration-200",
          isOpen
            ? "bg-maroon-50 rounded-b-none"
            : "bg-white hover:bg-warm-50"
        )}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span
          className={cn(
            "font-bold text-base leading-snug transition-colors duration-200",
            isOpen ? "text-[var(--color-brand-primary)]" : "text-charcoal-900"
          )}
        >
          {item.question}
        </span>
        <span
          className={cn(
            "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
            isOpen
              ? "bg-[var(--color-brand-primary)] text-white rotate-45"
              : "bg-warm-100 text-charcoal-500"
          )}
          aria-hidden="true"
        >
          <Plus size={15} />
        </span>
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={id}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 bg-white rounded-b-2xl border-t border-warm-100">
          <p className="text-charcoal-800 font-medium text-sm sm:text-base leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
