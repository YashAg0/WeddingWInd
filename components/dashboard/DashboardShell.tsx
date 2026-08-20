"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, WifiOff, ShieldAlert, LogOut } from "lucide-react";
import DeviceLimitModal from "@/components/auth/DeviceLimitModal";

function DashboardShellContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    user,
    loading,
    dbOffline,
    authState,
    activeDeviceSessions,
    refreshData,
    logout,
    retryConnection,
  } = useAuth();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Client-side onboarding redirect if logged in user is pending onboarding
  React.useEffect(() => {
    if (!loading && user && !user.onboarded && !dbOffline && authState === "READY") {
      const fullUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
      router.replace(`/onboarding?redirect_url=${encodeURIComponent(fullUrl)}`);
    }
  }, [user, loading, dbOffline, authState, router, pathname, searchParams]);

  // Device limit modal and revoked session modals
  if (authState === "DEVICE_LIMIT_REACHED") {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
        <DeviceLimitModal
          isOpen={true}
          activeSessions={activeDeviceSessions}
          onDeviceRevoked={async () => {
            await refreshData();
          }}
          onCancelLogout={logout}
        />
      </div>
    );
  }

  // 2. SESSION REVOKED: This device was logged out by the user from another session
  if (authState === "SESSION_REVOKED") {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-warm-50 p-4">
        <div className="max-w-md w-full bg-white border border-warm-200 rounded-3xl p-10 shadow-sm space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert size={24} />
          </div>
          <h1 className="font-display font-bold text-xl text-charcoal-900">
            Device Session Revoked
          </h1>
          <p className="text-charcoal-600 text-sm leading-relaxed">
            This device session has been logged out from another active session or security checkpoint.
            Please sign in again to continue.
          </p>
          <div className="pt-2">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-maroon-800 text-white text-sm font-semibold rounded-xl hover:bg-maroon-900 transition-colors"
            >
              <LogOut size={14} />
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. TEMPORARY CONNECTION FAILURE: Database / network temporary unavailability
  // Never treat as unauthenticated!
  if ((dbOffline && !user) || authState === "TEMPORARY_CONNECTION_FAILURE") {
    const handleRetry = async () => {
      setRetrying(true);
      await retryConnection();
      setRetrying(false);
    };

    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-warm-50 p-4">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-3xl p-10 shadow-sm space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <WifiOff size={24} />
          </div>
          <h1 className="font-display font-bold text-xl text-charcoal-900">
            Connection Interrupted
          </h1>
          <p className="text-charcoal-600 text-sm leading-relaxed">
            We&apos;re having trouble connecting to verify your dashboard session.
            This is a temporary connectivity issue — your session is safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-maroon-800 text-white text-sm font-semibold rounded-xl hover:bg-maroon-900 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={14} className={retrying ? "animate-spin" : ""} />
              {retrying ? "Reconnecting..." : "Retry Connection"}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-warm-100 text-charcoal-700 text-sm font-semibold rounded-xl hover:bg-warm-200 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="flex h-screen bg-warm-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Sidebar menu drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 bottom-0 left-0 z-50 lg:hidden w-64 h-full overflow-hidden shadow-2xl"
            >
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main viewport */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 h-full">
        <DashboardHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        {dbOffline && user && (
          // DB went offline AFTER the user was already synced — show a non-blocking banner
          <div className="bg-amber-500 text-white text-xs px-4 py-2 flex items-center justify-between font-semibold">
            <span>⚠️ Database connection interrupted — some dashboard data may be stale.</span>
            <button
              onClick={() => refreshData()}
              className="bg-white text-amber-900 px-3 py-1 rounded font-bold hover:bg-amber-100 transition"
            >
              Retry
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto min-h-0 bg-warm-50 p-4 sm:p-6 md:p-8 focus:outline-none" role="region" aria-label="Dashboard Content">
          <div className="max-w-6xl mx-auto w-full pb-16">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex flex-col items-center justify-center bg-warm-50 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-800 animate-spin" />
          <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">Loading Workspace...</span>
        </div>
      }
    >
      <DashboardShellContent>{children}</DashboardShellContent>
    </Suspense>
  );
}
