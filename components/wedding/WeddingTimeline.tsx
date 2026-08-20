"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Palette, Music, Utensils, HeartHandshake, Camera, PartyPopper, Clock, Users, Info } from "lucide-react";
import type { WeddingEvent } from "@/types";
import { cn } from "@/lib/utils";

const IconMap: Record<string, React.ElementType> = {
  "🎨": Palette,
  "💃": Music,
  "🍽️": Utensils,
  "🤝": HeartHandshake,
  "📸": Camera,
  "🎉": PartyPopper,
  "Sparkles": Sparkles,
  "Music": Music,
  "HeartHandshake": HeartHandshake,
  "PartyPopper": PartyPopper,
  "Utensils": Utensils,
};

interface WeddingTimelineProps {
  timeline: WeddingEvent[];
}

export function WeddingTimeline({ timeline }: WeddingTimelineProps) {
  const [selectedDay, setSelectedDay] = useState<string>("ALL");

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-warm-50/60 border border-warm-200/60 p-6 rounded-2xl text-center text-charcoal-500 text-sm">
        Detailed ceremony itinerary will be confirmed with the host upon registration.
      </div>
    );
  }

  // Extract unique day tags if present (e.g. "Day 1", "Day 2", etc.)
  const daySet = new Set<string>();
  timeline.forEach((item) => {
    if (item.date && item.date.toLowerCase().includes("day")) {
      daySet.add(item.date);
    }
  });
  const days = Array.from(daySet);
  const hasMultipleDays = days.length > 1;

  const filteredTimeline = selectedDay === "ALL"
    ? timeline
    : timeline.filter((item) => item.date === selectedDay);

  return (
    <div className="space-y-6">
      {/* Day Filter Tabs if multi-day */}
      {hasMultipleDays && (
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-warm-200/60">
          <button
            onClick={() => setSelectedDay("ALL")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
              selectedDay === "ALL"
                ? "bg-[var(--color-brand-primary)] text-white shadow-xs"
                : "bg-white text-charcoal-600 hover:bg-warm-100 border border-warm-200"
            )}
          >
            Full Itinerary ({timeline.length} Events)
          </button>
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                selectedDay === day
                  ? "bg-[var(--color-brand-primary)] text-white shadow-xs"
                  : "bg-white text-charcoal-600 hover:bg-warm-100 border border-warm-200"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Timeline List */}
      <div className="relative border-l-2 border-warm-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-7 py-2">
        <AnimatePresence mode="popLayout">
          {filteredTimeline.map((event, index) => {
            const Icon = IconMap[event.icon || ""] || Sparkles;

            return (
              <motion.div
                key={event.title + index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="relative group"
              >
                {/* Timeline Node Icon */}
                <span
                  className={cn(
                    "absolute -left-[35px] md:-left-[43px] top-1 w-8 h-8 rounded-full border-2 border-warm-200 bg-white flex items-center justify-center shadow-sm group-hover:border-[var(--color-brand-primary)] group-hover:scale-110 transition-all duration-300",
                    "text-[var(--color-brand-primary)]"
                  )}
                  aria-hidden="true"
                >
                  <Icon size={14} className="text-[var(--color-brand-primary)]" />
                </span>

                {/* Event Card */}
                <div className="bg-white hover:bg-warm-50/40 p-5 sm:p-6 rounded-2xl border border-warm-200/60 shadow-xs hover:shadow-md transition-all duration-300 space-y-3">
                  {/* Top Bar: Date & Time */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-warm-100 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-wider">
                      {event.date && (
                        <span className="bg-maroon-50 text-[var(--color-brand-primary)] px-2.5 py-0.5 rounded-full border border-maroon-100/60">
                          {event.date}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-charcoal-600 font-semibold lowercase">
                        <Clock size={12} className="text-amber-600" />
                        {event.time}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                      <Users size={11} /> Honoured Guest Access
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-display font-bold text-base sm:text-lg text-charcoal-900 mb-1">
                      {event.title}
                    </h4>
                    <p className="text-charcoal-600 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Guest Guidance Notes */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-charcoal-500">
                    <span className="inline-flex items-center gap-1 font-medium bg-warm-50 px-2.5 py-1 rounded-md border border-warm-200/50">
                      <Info size={11} className="text-amber-700" />
                      Participation: Observe &amp; Join Celebrations
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium bg-warm-50 px-2.5 py-1 rounded-md border border-warm-200/50">
                      <Utensils size={11} className="text-amber-700" />
                      Hospitality: Feasts &amp; Refreshments Included
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
