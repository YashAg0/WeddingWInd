"use client";

import { cn } from "@/lib/utils";
import { Info, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

interface NotificationCardProps {
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "alert" | "request";
  read: boolean;
  onMarkRead?: () => void;
  className?: string;
}

export default function NotificationCard({
  title,
  message,
  time,
  type,
  read,
  onMarkRead,
  className
}: NotificationCardProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "alert":
        return <AlertTriangle size={16} className="text-rose-600" />;
      case "request":
        return <HelpCircle size={16} className="text-amber-600" />;
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  const getBgClass = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-100/50";
      case "alert":
        return "bg-rose-50 border-rose-100/50";
      case "request":
        return "bg-amber-50 border-amber-100/50";
      default:
        return "bg-blue-50 border-blue-100/50";
    }
  };

  return (
    <div className={cn(
      "flex gap-4 p-5 rounded-2xl border transition-all duration-200",
      read ? "bg-white border-warm-200/50 shadow-sm" : `${getBgClass()} shadow-md relative`,
      className
    )}>
      {!read && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--color-brand-primary)]" />
      )}
      
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-white",
      )}>
        {getIcon()}
      </div>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <h4 className="font-sans font-bold text-sm text-charcoal-900 truncate">
            {title}
          </h4>
          <span className="text-[0.625rem] text-charcoal-400 font-semibold uppercase tracking-wider flex-shrink-0">
            {time}
          </span>
        </div>
        <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
          {message}
        </p>

        {(!read && onMarkRead) && (
          <div className="pt-2">
            <button
              onClick={onMarkRead}
              className="text-[0.6875rem] font-bold text-[var(--color-brand-primary)] hover:underline uppercase tracking-wider cursor-pointer"
            >
              Mark as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
