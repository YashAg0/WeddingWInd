"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

/**
 * LayoutVisibilityWrapper
 *
 * Controls which routes show the main Navbar and Footer.
 * Also renders the skip-to-main-content accessibility link
 * and the mobile bottom navigation bar.
 */
export default function LayoutVisibilityWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/onboarding") ||
    pathname === "/login" ||
    pathname === "/signup";

  return (
    <>
      {/* ── Accessibility: Skip to main content ──────────────────────────── */}
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only
          fixed top-2 left-2 z-[100]
          px-4 py-2 rounded-lg
          bg-[var(--color-brand-primary)] text-white text-sm font-bold
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)]
          transition-transform -translate-y-16 focus:translate-y-0
        "
      >
        Skip to main content
      </a>

      {!isDashboardRoute && <Navbar />}

      <main
        id="main-content"
        className="flex-1"
        tabIndex={-1}
        style={{ outline: "none" }}
      >
        {children}
      </main>

      {!isDashboardRoute && <Footer />}

      {/* Mobile bottom navigation — only visible on < lg screens */}
      <BottomNav />
    </>
  );
}
