"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // Auto-reload when connection is restored
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 border border-warm-200 shadow-sm">
        {/* Offline Icon Container */}
        <div className="mx-auto w-16 h-16 rounded-full bg-maroon-50 flex items-center justify-center mb-6 text-maroon-700">
          <WifiOff className="w-8 h-8" />
        </div>

        {/* Title & Description */}
        <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-900 mb-3">
          You&apos;re Currently Offline
        </h1>
        <p className="text-charcoal-600 text-sm md:text-base mb-8 leading-relaxed">
          It looks like your internet connection dropped. Some features of WeddingWithIndia require an active connection.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-maroon-800 text-white text-sm font-semibold hover:bg-maroon-900 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Checking connection..." : "Try Again"}
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-warm-100 text-charcoal-800 text-sm font-semibold hover:bg-warm-200 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Diagnostic note */}
        <p className="mt-8 text-xs text-charcoal-400">
          Check your Wi-Fi or mobile data settings. Once reconnected, cached pages and features will restore automatically.
        </p>
      </div>
    </div>
  );
}
