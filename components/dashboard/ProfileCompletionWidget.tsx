"use client";

import Link from "next/link";
import { CheckCircle, Circle, ArrowRight, Trophy, Sparkles, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileCompletionResult } from "@/lib/actions/profile-completion";

interface ProfileCompletionWidgetProps {
  completion: ProfileCompletionResult;
}

export function ProfileCompletionWidget({ completion }: ProfileCompletionWidgetProps) {
  const {
    percent,
    completedCount,
    totalCount,
    totalXp,
    levelTitle,
    nextLevelTitle,
    nextLevelXp,
    items,
    nextIncomplete,
  } = completion;

  if (percent === 100) return null; // Hide when fully complete

  const getProgressColor = () => {
    if (percent >= 80) return "bg-emerald-500";
    if (percent >= 50) return "bg-[var(--color-brand-secondary)]";
    return "bg-[var(--color-brand-primary)]";
  };

  return (
    <div className="bg-gradient-to-br from-ivory-50 via-amber-50/30 to-warm-100/60 border border-amber-200/80 rounded-3xl p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.07)] relative overflow-hidden">
      {/* Background Accent Shimmer */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-maroon-900 text-white flex items-center justify-center shadow-sm">
            <Trophy size={16} className="text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-charcoal-900">
                WeddingWithIndia Journey
              </h3>
            </div>
            <p className="text-[0.6875rem] font-semibold text-amber-800 flex items-center gap-1">
              <Compass size={11} className="text-amber-600 inline" />
              <span>{levelTitle}</span>
              <span className="text-charcoal-400">•</span>
              <span className="text-charcoal-600 font-bold">{totalXp} XP</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-display font-black text-lg text-charcoal-900 block leading-tight">
            {percent}%
          </span>
          <span className="text-[0.625rem] text-charcoal-400 font-medium">
            {completedCount}/{totalCount} Done
          </span>
        </div>
      </div>

      {/* Level XP Banner */}
      {nextLevelTitle && (
        <div className="mb-3 bg-white/80 backdrop-blur-xs border border-amber-100 rounded-xl px-3 py-1.5 flex items-center justify-between text-[0.6875rem]">
          <span className="text-charcoal-600 font-medium flex items-center gap-1">
            <Sparkles size={11} className="text-amber-500" />
            Next Status: <strong className="text-charcoal-900">{nextLevelTitle}</strong>
          </span>
          <span className="font-bold text-[var(--color-brand-primary)]">
            {totalXp} / {nextLevelXp} XP
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div
        className="h-2 w-full rounded-full bg-warm-200 overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile ${percent}% complete (${totalXp} XP)`}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", getProgressColor())}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist with XP Rewards */}
      <ul className="space-y-2 mb-4">
        {items.slice(0, 4).map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {item.completed ? (
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
              ) : (
                <Circle size={14} className="text-amber-400 flex-shrink-0" aria-hidden="true" />
              )}
              <span
                className={cn(
                  "text-xs truncate",
                  item.completed
                    ? "text-charcoal-400 line-through"
                    : "text-charcoal-800 font-semibold"
                )}
              >
                {item.label}
              </span>
            </div>
            <span
              className={cn(
                "text-[0.625rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                item.completed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-100/80 text-amber-900 border border-amber-300/60"
              )}
            >
              +{item.xp} XP
            </span>
          </li>
        ))}
        {items.length > 4 && (
          <li className="text-[0.6875rem] text-charcoal-500 pl-5 font-medium">
            +{items.length - 4} more milestone tasks
          </li>
        )}
      </ul>

      {/* CTA to next incomplete step */}
      {nextIncomplete && (
        <Link
          href={nextIncomplete.href}
          className="w-full inline-flex items-center justify-between gap-1.5 text-xs font-bold text-white bg-[var(--color-brand-primary)] hover:bg-maroon-900 px-4 py-2 rounded-xl transition-all shadow-xs group"
          aria-label={`Earn +${nextIncomplete.xp} XP by completing: ${nextIncomplete.label}`}
        >
          <span>
            {nextIncomplete.label} <span className="opacity-80">(+{nextIncomplete.xp} XP)</span>
          </span>
          <ArrowRight
            size={13}
            className="transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0"
          />
        </Link>
      )}
    </div>
  );
}
