"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { WeddingEvent } from "@/types";
import { cn } from "@/lib/utils";

interface WeddingTimelineProps {
  timeline: WeddingEvent[];
}

export function WeddingTimeline({ timeline }: WeddingTimelineProps) {
  return (
    <div className="relative border-l border-warm-300 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8 py-2">
      {timeline.map((event, index) => (
        <motion.div
          key={event.title}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          {/* Timeline Dot Icon */}
          <span
            className={cn(
              "absolute -left-[43px] md:-left-[51px] top-1.5 w-8 h-8 rounded-full border border-warm-200 bg-white flex items-center justify-center shadow-md group-hover:border-[var(--color-brand-primary)] group-hover:scale-110 transition-all duration-300",
              "text-[var(--color-brand-primary)]"
            )}
            aria-hidden="true"
          >
            <Sparkles size={14} className="text-[var(--color-brand-primary)]" />
          </span>

          {/* Time & Date */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1 text-[0.6875rem] font-bold text-[var(--color-brand-secondary)] uppercase tracking-wider">
            <span>{event.date}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-warm-300" aria-hidden="true" />
            <span className="text-charcoal-500 font-semibold">{event.time}</span>
          </div>

          {/* Event Content */}
          <div className="bg-white hover:bg-warm-50/50 p-5 rounded-2xl border border-warm-200/50 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="font-display font-bold text-base text-charcoal-900 mb-2">
              {event.title}
            </h4>
            <p className="text-charcoal-600 text-sm leading-relaxed">
              {event.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
