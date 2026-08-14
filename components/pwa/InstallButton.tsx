"use client";

import React, { useState, useEffect } from "react";
import { usePwa } from "./PwaProvider";
import { Download, Smartphone, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InstallButtonProps {
  variant?: "navbar" | "mobile-menu" | "footer" | "button";
  className?: string;
  isTransparent?: boolean;
  onActionComplete?: () => void;
}

export function InstallButton({
  variant = "button",
  className,
  isTransparent = false,
  onActionComplete,
}: InstallButtonProps) {
  const { isInstalled, isInstallable, installApp } = usePwa();
  const [isIos, setIsIos] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone === true;
    if (isIosDevice && !isStandalone) {
      setIsIos(true);
    }
  }, []);

  // In standalone mode, app is already running as installed PWA
  if (isInstalled) {
    if (variant === "footer") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-white/70 font-medium">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          WeddingWithIndia Installed
        </span>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await installApp();
      } catch (err) {
        console.warn("[PWA] Installation prompt error:", err);
        toast.error("Installation unavailable", {
          description: "Please try adding WeddingWithIndia via your browser menu.",
        });
      } finally {
        setIsInstalling(false);
        onActionComplete?.();
      }
    } else if (isIos) {
      toast.info("Add to Home Screen", {
        description: "Tap the Share button in Safari, then select 'Add to Home Screen'.",
        icon: <Smartphone className="w-4 h-4 text-maroon-700" />,
        duration: 6000,
      });
      onActionComplete?.();
    } else {
      toast.info("Install WeddingWithIndia", {
        description: "Use your browser's address bar icon (Install App) or open in Chrome/Safari on mobile.",
        icon: <Download className="w-4 h-4 text-maroon-700" />,
        duration: 5000,
      });
      onActionComplete?.();
    }
  };

  const buttonText = isInstalling
    ? "Installing…"
    : isInstallable
    ? "Install App"
    : "Get the App";

  if (variant === "navbar") {
    return (
      <button
        onClick={handleClick}
        disabled={isInstalling}
        aria-label="Install WeddingWithIndia App"
        className={cn(
          "h-10 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-60",
          isTransparent
            ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            : "bg-warm-100/80 hover:bg-warm-200/80 text-charcoal-700 hover:text-[var(--color-brand-primary)] border border-warm-200/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]",
          className
        )}
      >
        {isInstalling ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-brand-secondary)] shrink-0" />
        ) : (
          <Download className="w-3.5 h-3.5 text-[var(--color-brand-secondary)] shrink-0" />
        )}
        <span className="whitespace-nowrap">{buttonText}</span>
      </button>
    );
  }

  if (variant === "mobile-menu") {
    return (
      <button
        onClick={handleClick}
        disabled={isInstalling}
        aria-label="Install WeddingWithIndia App"
        className={cn(
          "w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold",
          "bg-maroon-800 hover:bg-maroon-900 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]",
          className
        )}
      >
        {isInstalling ? (
          <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand-secondary)]" />
        ) : (
          <Download className="w-4 h-4 text-[var(--color-brand-secondary)]" />
        )}
        <span>{buttonText}</span>
      </button>
    );
  }

  if (variant === "footer") {
    return (
      <button
        onClick={handleClick}
        disabled={isInstalling}
        aria-label="Install WeddingWithIndia App"
        className={cn(
          "inline-flex items-center gap-2 text-sm text-white/70 hover:text-[var(--color-brand-secondary)] transition-colors cursor-pointer text-left disabled:opacity-60",
          className
        )}
      >
        {isInstalling ? (
          <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand-secondary)] shrink-0" />
        ) : (
          <Download className="w-4 h-4 text-[var(--color-brand-secondary)] shrink-0" />
        )}
        <span>{buttonText}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isInstalling}
      aria-label="Install WeddingWithIndia App"
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold",
        "bg-maroon-800 hover:bg-maroon-900 text-white transition-colors cursor-pointer shadow-sm disabled:opacity-60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]",
        className
      )}
    >
      {isInstalling ? (
        <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand-secondary)]" />
      ) : (
        <Download className="w-4 h-4 text-[var(--color-brand-secondary)]" />
      )}
      <span>{buttonText}</span>
    </button>
  );
}
