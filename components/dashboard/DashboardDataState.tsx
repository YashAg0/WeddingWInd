"use client";

import React from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLoadingStateProps {
  message?: string;
  subMessage?: string;
  className?: string;
  minHeight?: string;
}

export function DashboardLoadingState({
  message = "Loading your dashboard records...",
  subMessage = "Syncing with secure server...",
  className,
  minHeight = "min-h-[260px]",
}: DashboardLoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white/70 border border-warm-200/60 rounded-3xl shadow-sm space-y-4 animate-pulse",
        minHeight,
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-maroon-50 text-maroon-800 flex items-center justify-center shadow-inner">
        <Loader2 className="animate-spin text-maroon-800" size={24} />
      </div>
      <div className="space-y-1">
        <h4 className="font-display font-semibold text-charcoal-900 text-base">{message}</h4>
        <p className="text-xs text-charcoal-500">{subMessage}</p>
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
}

interface DashboardErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function DashboardErrorState({
  title = "Unable to load records",
  message = "We encountered a temporary connection issue while loading your data.",
  onRetry,
  className,
}: DashboardErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "bg-white border border-amber-200/80 rounded-3xl p-8 sm:p-10 text-center max-w-lg mx-auto shadow-sm space-y-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
        <AlertCircle size={24} />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display font-bold text-base text-charcoal-900">{title}</h3>
        <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
}
