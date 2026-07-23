"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionText,
  actionHref,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("bg-white border border-warm-200/50 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-5", className)}>
      <div className="w-14 h-14 rounded-full bg-warm-100 text-maroon-800 text-2xl flex items-center justify-center mx-auto shadow-sm">
        {icon ? (
          icon
        ) : (
          <Sparkles size={24} className="text-maroon-800" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-display font-bold text-lg text-charcoal-900">{title}</h3>
        <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>

      {(actionText && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref} className="btn btn-primary btn-sm shadow-md">
              {actionText}
            </Link>
          ) : (
            <button onClick={onAction} className="btn btn-primary btn-sm shadow-md cursor-pointer">
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
