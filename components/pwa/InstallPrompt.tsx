"use client";

import React, { useState, useEffect } from "react";
import { usePwa } from "./PwaProvider";
import { Download, X, Share } from "lucide-react";
import Image from "next/image";

export function InstallPrompt() {
  const { isInstalled, isInstallable, installApp, isInstallDismissed, dismissInstallPrompt } = usePwa();
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isReadyToDisplay, setIsReadyToDisplay] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone === true;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
    }

    // Delay prompt presentation so first-time visitors can understand the website first
    const timer = setTimeout(() => {
      setIsReadyToDisplay(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Handle escape key to close iOS guide
  useEffect(() => {
    if (!showIosGuide) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowIosGuide(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showIosGuide]);

  // Do not show if already installed, user dismissed prompt within cooldown period, or delay timer not reached
  if (isInstalled || isInstallDismissed || !isReadyToDisplay) {
    return null;
  }

  // Only show on Chrome/Android/Edge (when installable) or iOS Safari
  if (!isInstallable && !isIos) {
    return null;
  }

  return (
    <>
      {/* Bottom Floating Install Banner */}
      <aside 
        aria-label="App Installation Promotion"
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-white border border-warm-200 rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-maroon-800 shrink-0 relative flex items-center justify-center">
              <Image
                src="/icons/icon-192x192.png"
                alt="WeddingWithIndia"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xs font-bold text-charcoal-900 leading-tight">Get the WeddingWithIndia App</h2>
              <p className="text-[11px] text-charcoal-500 mt-0.5 leading-snug">
                Fast cultural wedding discovery & guest passes on your home screen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInstallable ? (
              <button
                onClick={installApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
            ) : isIos ? (
              <button
                onClick={() => setShowIosGuide(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
            ) : null}

            <button
              onClick={dismissInstallPrompt}
              aria-label="Dismiss installation prompt"
              className="p-1.5 text-charcoal-400 hover:text-charcoal-600 rounded-full hover:bg-warm-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-warm-200 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-1 text-charcoal-400 hover:text-charcoal-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-maroon-50 text-maroon-800 flex items-center justify-center mb-4">
              <Share className="w-6 h-6" />
            </div>

            <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-2">
              Install on iPhone or iPad
            </h3>
            <ol className="text-xs text-charcoal-600 space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="font-bold text-maroon-800">1.</span>
                <span>Tap the <strong>Share</strong> icon in your Safari toolbar below.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-maroon-800">2.</span>
                <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-maroon-800">3.</span>
                <span>Tap <strong>Add</strong> in the top-right corner to finish.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-full bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
