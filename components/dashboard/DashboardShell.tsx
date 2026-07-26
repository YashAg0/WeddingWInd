"use client";

import React, { useState, Suspense } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function DashboardShellContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading, dbOffline, refreshData } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Router guards wrapped in useEffect
  React.useEffect(() => {
    if (!loading) {
      const fullUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
      if (!user && !dbOffline) {
        router.replace(`/login?redirect_url=${encodeURIComponent(fullUrl)}`);
      } else if (user && !user.onboarded && !dbOffline) {
        router.replace(`/onboarding?redirect_url=${encodeURIComponent(fullUrl)}`);
      }
    }
  }, [user, loading, dbOffline, router, pathname, searchParams]);

  if (loading || (!user && !dbOffline)) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-800 animate-spin" />
        <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">Loading Dashboard...</span>
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
              className="fixed top-0 bottom-0 left-0 z-50 lg:hidden w-64"
            >
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main viewport */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <DashboardHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        {dbOffline && (
          <div className="bg-amber-500 text-white text-xs px-4 py-2 flex items-center justify-between font-semibold">
            <span>⚠️ Database Server Offline — Viewing restricted mode.</span>
            <button
              onClick={() => refreshData()}
              className="bg-white text-amber-900 px-3 py-1 rounded font-bold hover:bg-amber-100 transition"
            >
              Retry Connection
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto bg-warm-50 p-4 sm:p-6 md:p-8 focus:outline-none">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-50 flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-800 animate-spin" />
        <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">Loading Workspace...</span>
      </div>
    }>
      <DashboardShellContent>{children}</DashboardShellContent>
    </Suspense>
  );
}
