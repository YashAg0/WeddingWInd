"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  title: string;
  description: string;
  time: string;
  icon?: string;
  className?: string;
}

export default function ActivityCard({ title, description, time, className }: ActivityCardProps) {
  return (
    <div className={cn("flex items-start gap-4 p-4 rounded-xl border border-warm-100 hover:bg-warm-50/30 transition-colors duration-200", className)}>
      <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Sparkles size={14} className="text-[var(--color-brand-primary)]" aria-hidden="true" />
      </div>
      
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex justify-between items-baseline gap-2">
          <h4 className="font-sans font-bold text-xs sm:text-sm text-charcoal-900 truncate">
            {title}
          </h4>
          <span className="text-[0.625rem] text-charcoal-400 font-semibold uppercase tracking-wider flex-shrink-0">
            {time}
          </span>
        </div>
        <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
