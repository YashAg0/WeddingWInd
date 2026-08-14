"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface AppLaunchScreenProps {
  isStandalone: boolean;
}

export function AppLaunchScreen({ isStandalone }: AppLaunchScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Only activate in standalone installed mode
    if (!isStandalone) {
      setShouldRender(false);
      return;
    }

    // Check if launch screen was already shown in this session (e.g. across client navigations)
    let hasLaunched = false;
    try {
      hasLaunched = !!sessionStorage.getItem("wwi_pwa_launched");
    } catch {}
    if (hasLaunched) {
      setShouldRender(false);
      return;
    }

    setShouldRender(true);
    setMounted(true);

    // Fast, natural transition: dismiss as soon as hydration settles (~450ms), fade out gracefully (300ms)
    const fadeTimer = setTimeout(() => {
      setVisible(false);
    }, 450);

    const cleanupTimer = setTimeout(() => {
      setShouldRender(false);
      try {
        sessionStorage.setItem("wwi_pwa_launched", "true");
      } catch {}
    }, 750);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(cleanupTimer);
    };
  }, [isStandalone]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#6b1026] text-white transition-opacity duration-300 pointer-events-none select-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        className={`flex flex-col items-center gap-4 transition-transform duration-500 ease-out ${
          mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Brand Emblem */}
        <div className="relative w-20 h-20 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md shadow-2xl border border-white/20 flex items-center justify-center animate-pulse">
          <Image
            src="/icons/icon-192x192.png"
            alt="WeddingWithIndia"
            width={72}
            height={72}
            priority
            className="w-full h-full object-contain"
          />
        </div>

        {/* Brand Title */}
        <div className="text-center">
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
            WeddingWithIndia
          </h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#fde68a] font-medium mt-1">
            Authentic Cultural Celebrations
          </p>
        </div>
      </div>
    </div>
  );
}
