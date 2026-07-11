"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";

interface CookieConsentProps {
  gaId?: string;
}

const CONSENT_KEY = "wwi_cookie_consent";

/**
 * CookieConsent
 *
 * GDPR-compliant cookie consent banner.
 * - Saves preference to localStorage
 * - When accepted: sends consent signal to GA4
 * - When declined: GA4 does not load
 * - Only shows once (persists across sessions)
 */
export default function CookieConsent({ gaId }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Small delay so it doesn't flash immediately on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    if (stored === "accepted" && gaId && typeof window !== "undefined") {
      enableAnalytics(gaId);
    }
  }, [gaId]);

  function enableAnalytics(id: string) {
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).gtag) {
      const gtag = (window as unknown as Record<string, (...args: unknown[]) => void>).gtag;
      gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
      });
      gtag("config", id);
    }
  }

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    if (gaId) enableAnalytics(gaId);
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white border border-warm-200 rounded-2xl shadow-xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie size={16} className="text-[var(--color-brand-primary)] flex-shrink-0 mt-0.5" />
            <h3 className="font-semibold text-sm text-charcoal-900">
              Cookie Preferences
            </h3>
          </div>
          <button
            onClick={handleDecline}
            aria-label="Close cookie banner"
            className="text-charcoal-400 hover:text-charcoal-600 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-charcoal-500 leading-relaxed">
          We use analytics cookies to understand how visitors interact with our platform.
          Your data is never sold.{" "}
          <a
            href="/privacy"
            className="underline hover:text-charcoal-700 transition-colors"
          >
            Privacy Policy
          </a>
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="flex-1 px-3 py-2 rounded-lg border border-warm-200 text-charcoal-600 text-xs font-semibold hover:bg-warm-50 transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-brand-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Accept Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
