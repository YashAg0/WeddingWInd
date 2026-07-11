"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Heart, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Explore Weddings",
    href: "/weddings",
    children: [
      { label: "All Weddings", href: "/weddings", description: "Browse all listings" },
      { label: "Royal Weddings", href: "/weddings?category=royal", description: "Palace grandeur" },
      { label: "Beach Weddings", href: "/weddings?category=beach", description: "Oceanside romance" },
      { label: "Destination", href: "/weddings?category=destination", description: "Exotic locales" },
    ],
  },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Countries", href: "/#countries" },
  { label: "List Your Wedding", href: "/list-wedding" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isHomepage = pathname === "/";

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const isTransparent = isHomepage && !isScrolled && !isMobileOpen;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isTransparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-xl shadow-[0_1px_32px_0_rgba(0,0,0,0.08)] border-b border-warm-200/60"
        )}
        role="banner"
      >
        <div className="container-luxury">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
              aria-label="Wedding With India — Home"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-300",
                  "bg-[var(--color-brand-primary)] group-hover:scale-105"
                )}
                aria-hidden="true"
              >
                🪔
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className={cn(
                    "font-display font-bold text-[1.0625rem] tracking-tight transition-colors duration-300",
                    isTransparent ? "text-white" : "text-[var(--color-brand-primary)]"
                  )}
                >
                  Wedding With India
                </span>
                <span
                  className={cn(
                    "text-[0.625rem] font-medium uppercase tracking-widest transition-colors duration-300",
                    isTransparent
                      ? "text-white/70"
                      : "text-[var(--color-brand-secondary)]"
                  )}
                >
                  Attend Authentic Weddings
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Primary navigation"
            >
              {navItems.map((item) =>
                item.children ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={cn(
                        "flex items-center gap-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
                        isTransparent
                          ? "text-white/90 hover:text-white hover:bg-white/10"
                          : "text-charcoal-700 hover:text-[var(--color-brand-primary)] hover:bg-maroon-50"
                      )}
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === item.label}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          activeDropdown === item.label && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl shadow-[0_16px_64px_-8px_rgba(0,0,0,0.16)] border border-warm-200/60 overflow-hidden origin-top-left"
                          role="menu"
                        >
                          <div className="p-2">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                role="menuitem"
                                className="flex flex-col px-4 py-3 rounded-xl hover:bg-maroon-50 transition-colors duration-150 group"
                              >
                                <span className="text-sm font-semibold text-charcoal-800 group-hover:text-[var(--color-brand-primary)] transition-colors">
                                  {child.label}
                                </span>
                                <span className="text-xs text-charcoal-500 mt-0.5">
                                  {child.description}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
                      isTransparent
                        ? "text-white/90 hover:text-white hover:bg-white/10"
                        : "text-charcoal-700 hover:text-[var(--color-brand-primary)] hover:bg-maroon-50"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                aria-label="Select language"
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  isTransparent
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100"
                )}
              >
                <Globe size={18} aria-hidden="true" />
              </button>
              <Link
                href="/weddings"
                className={cn(
                  "text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200",
                  isTransparent
                    ? "text-white/90 hover:text-white hover:bg-white/10"
                    : "text-[var(--color-brand-primary)] hover:bg-maroon-50"
                )}
              >
                Sign In
              </Link>
              <Link
                href="/weddings"
                className="btn btn-primary btn-sm"
              >
                <Heart size={15} aria-hidden="true" />
                Attend a Wedding
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              className={cn(
                "lg:hidden p-2 rounded-xl transition-all duration-200",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-charcoal-700 hover:bg-charcoal-100"
              )}
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-menu"
            >
              {isMobileOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-charcoal-950/40 backdrop-blur-md"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="absolute top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-white flex flex-col shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-warm-200">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center text-base">
                    🪔
                  </div>
                  <span className="font-display font-bold text-[var(--color-brand-primary)] text-sm">
                    Wedding With India
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-charcoal-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-charcoal-800 hover:bg-maroon-50 hover:text-[var(--color-brand-primary)] transition-colors"
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-warm-200 pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="block px-3 py-2 rounded-lg text-sm text-charcoal-500 hover:text-[var(--color-brand-primary)] hover:bg-maroon-50 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* CTA area */}
              <div className="p-5 border-t border-warm-200 space-y-3">
                <Link
                  href="/weddings"
                  onClick={() => setIsMobileOpen(false)}
                  className="btn btn-primary w-full justify-center"
                >
                  <Heart size={16} aria-hidden="true" />
                  Attend a Wedding
                </Link>
                <Link
                  href="/list-wedding"
                  onClick={() => setIsMobileOpen(false)}
                  className="btn btn-outline w-full justify-center"
                >
                  List Your Wedding
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
