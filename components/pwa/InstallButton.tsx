"use client";

import React, { useState, useEffect } from "react";
import { usePwa } from "./PwaProvider";
import { Download, Smartphone, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InstallButtonProps {
  variant?: "navbar" | "mobile-menu" | "footer" | "button";
  className?: string;
  onActionComplete?: () => void;
}

export function InstallButton({
  variant = "button",
  className,
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
        <span className="inline-flex items-center gap-1.5 text-xs text-white/50">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          App Installed
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
      } finally {
        setIsInstalling(false);
        onActionComplete?.();
      }
    } else if (isIos) {
      // Trigger event or modal for iOS guidance
      toast.info("Add to Home Screen", {
        description: "Tap the Share button in Safari, then select 'Add to Home Screen'.",
        icon: <Smartphone className="w-4 h-4 text-maroon-700" />,
        duration: 6000,
      });
      onActionComplete?.();
    } else {
      // Desktop or standard browser without prompt ready
      toast.info("Install Wedding With India", {
        description: "Use your browser's address bar icon (Install App) or open in Chrome/Safari on mobile.",
        icon: <Download className="w-4 h-4 text-maroon-700" />,
        duration: 5000,
      });
      onActionComplete?.();
    }
  };

  const buttonText = isInstalling
    ? "Installing..."
    : isInstallable
    ? "Install App"
    : "Get the App";

  if (variant === "navbar") {
    return (
      <button
        onClick={handleClick}
        aria-label="Install Wedding With India App"
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
          "bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200 cursor-pointer shadow-xs",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]",
          className
        )}
      >
        <Download className="w-3.5 h-3.5 text-[var(--color-brand-secondary)]" />
        <span>{buttonText}</span>
      </button>
    );
  }

  if (variant === "mobile-menu") {
    return (
      <button
        onClick={handleClick}
        aria-label="Install Wedding With India App"
        className={cn(
          "w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold",
          "bg-maroon-800 hover:bg-maroon-900 text-white transition-colors cursor-pointer shadow-xs",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]",
          className
        )}
      >
        <Download className="w-4 h-4 text-[var(--color-brand-secondary)]" />
        <span>{buttonText}</span>
      </button>
    );
  }

  if (variant === "footer") {
    return (
      <button
        onClick={handleClick}
        aria-label="Install Wedding With India App"
        className={cn(
          "inline-flex items-center gap-2 text-sm text-white/70 hover:text-[var(--color-brand-secondary)] transition-colors cursor-pointer text-left",
          className
        )}
      >
        <Download className="w-4 h-4 text-[var(--color-brand-secondary)] shrink-0" />
        <span>{buttonText}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Install Wedding With India App"
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold",
        "bg-maroon-800 hover:bg-maroon-900 text-white transition-colors cursor-pointer shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)]",
        className
      )}
    >
      <Download className="w-4 h-4 text-[var(--color-brand-secondary)]" />
      <span>{buttonText}</span>
    </button>
  );
}
