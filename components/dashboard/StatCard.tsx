"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-white border border-warm-200/50 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300", className)}>
      <div className="flex justify-between items-center">
        <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest font-sans">
          {label}
        </span>
        <div className="w-9 h-9 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
          <Icon size={16} />
        </div>
      </div>
      
      <div className="flex items-baseline justify-between">
        <h3 className="font-display font-black text-2xl sm:text-3xl text-charcoal-900 leading-none">
          {value}
        </h3>
        {trend && (
          <span className={cn(
            "text-[0.6875rem] font-bold px-2 py-0.5 rounded-md",
            trend.isPositive 
              ? "text-emerald-700 bg-emerald-50 border border-emerald-100/50" 
              : "text-red-700 bg-red-50 border border-red-100/50"
          )}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
