"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

interface PwaContextType {
  isInstalled: boolean;
  isInstallable: boolean;
  isUpdateAvailable: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  updateApp: () => void;
  dismissInstallPrompt: () => void;
  isInstallDismissed: boolean;
}

const PwaContext = createContext<PwaContextType>({
  isInstalled: false,
  isInstallable: false,
  isUpdateAvailable: false,
  isOnline: true,
  installApp: async () => {},
  updateApp: () => {},
  dismissInstallPrompt: () => {},
  isInstallDismissed: false,
});

const DISMISSED_INSTALL_KEY = "wwi_pwa_install_dismissed_v1";
const DISMISS_COOLDOWN_DAYS = 7;

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isInstallDismissed, setIsInstallDismissed] = useState(true);

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const dismissInstallPrompt = () => {
    setIsInstallDismissed(true);
    try {
      localStorage.setItem(DISMISSED_INSTALL_KEY, Date.now().toString());
    } catch {}
  };

  // Check if install was previously dismissed within cooldown period
  useEffect(() => {
    try {
      const dismissedTimestamp = localStorage.getItem(DISMISSED_INSTALL_KEY);
      if (dismissedTimestamp) {
        const diffDays = (Date.now() - parseInt(dismissedTimestamp, 10)) / (1000 * 60 * 60 * 24);
        setIsInstallDismissed(diffDays < DISMISS_COOLDOWN_DAYS);
      } else {
        setIsInstallDismissed(false);
      }
    } catch {
      setIsInstallDismissed(false);
    }
  }, []);

  // Check standalone mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Online / Offline network status listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back Online", {
        description: "Your connection has been restored.",
        icon: <Wifi className="w-4 h-4 text-emerald-600" />,
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're Offline", {
        description: "Some features may require an active internet connection.",
        icon: <WifiOff className="w-4 h-4 text-amber-600" />,
        duration: 4000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Service Worker registration and lifecycle monitoring
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register service worker in production environments
    const isProduction = process.env.NODE_ENV === "production";
    const isPwaForced = process.env.NEXT_PUBLIC_ENABLE_PWA === "true";

    if (!isProduction && !isPwaForced) {
      return;
    }

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // 1. Check if there's already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setIsUpdateAvailable(true);
        }

        // 2. Listen for new updates found
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setIsUpdateAvailable(true);
                toast.info("Update Available", {
                  description: "A new version of WeddingWithIndia is ready.",
                  action: {
                    label: "Update",
                    onClick: () => {
                      newWorker.postMessage({ type: "SKIP_WAITING" });
                    },
                  },
                  duration: 8000,
                });
              }
            });
          }
        });

        // 3. Periodic and focus-based update checks
        const checkUpdate = () => {
          registration.update().catch((err) => {
            console.warn("[PWA] Update check failed:", err);
          });
        };

        const handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            checkUpdate();
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("online", checkUpdate);
        const updateInterval = setInterval(checkUpdate, 60 * 60 * 1000); // Check every 60 minutes

        return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          window.removeEventListener("online", checkUpdate);
          clearInterval(updateInterval);
        };
      })
      .catch((err) => {
        console.warn("[PWA] ServiceWorker registration error:", err);
      });
  }, []);

  // Capture beforeinstallprompt
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success("Installed", {
        description: "WeddingWithIndia is now installed on your device.",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        isInstallable,
        isUpdateAvailable,
        isOnline,
        installApp,
        updateApp,
        dismissInstallPrompt,
        isInstallDismissed,
      }}
    >
      {children}

      {/* Non-intrusive Update Notification Banner */}
      {isUpdateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-charcoal-900 text-white p-4 rounded-2xl shadow-xl border border-charcoal-800 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-maroon-800 flex items-center justify-center text-white shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-warm-100">Update Ready</p>
              <p className="text-[11px] text-charcoal-300">A new version of WeddingWithIndia is available.</p>
            </div>
          </div>
          <button
            onClick={updateApp}
            className="px-3.5 py-1.5 rounded-full bg-maroon-700 hover:bg-maroon-600 text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
          >
            Update
          </button>
        </div>
      )}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
