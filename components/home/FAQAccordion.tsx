"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const id = `faq-${item.id}`;
  const contentId = `faq-content-${item.id}`;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300",
        isOpen
          ? "border-[var(--color-brand-primary)]/20 shadow-[0_8px_32px_0_rgba(107,16,38,0.08)] bg-white"
          : "border-warm-200 hover:border-[var(--color-brand-primary)]/15 bg-white/50"
      )}
    >
      <button
        id={id}
        type="button"
        className={cn(
          "w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left rounded-2xl transition-colors duration-200",
          isOpen
            ? "bg-transparent rounded-b-none"
            : "bg-transparent hover:bg-white"
        )}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span
          className={cn(
            "font-semibold text-base leading-snug transition-colors duration-200",
            isOpen ? "text-[var(--color-brand-primary)]" : "text-charcoal-800"
          )}
        >
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
            isOpen
              ? "bg-[var(--color-brand-primary)] text-white shadow-md"
              : "bg-warm-100 text-charcoal-500"
          )}
          aria-hidden="true"
        >
          <Plus size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            role="region"
            aria-labelledby={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1">
              <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
