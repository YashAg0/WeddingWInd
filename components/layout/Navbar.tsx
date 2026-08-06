"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Heart, Globe, Bell, LayoutDashboard, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

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
      { label: "All Weddings", href: "/weddings", description: "Browse all curated celebrations" },
      { label: "Royal Ceremonies", href: "/weddings?category=royal", description: "Palace grandeur & royal rituals" },
      { label: "Punjabi Weddings", href: "/weddings?category=punjabi", description: "Dhol rhythms & vibrant joy" },
      { label: "South Indian Weddings", href: "/weddings?category=south-indian", description: "Temple traditions & sacred customs" },
      { label: "Coastal Weddings", href: "/weddings?category=beach", description: "Sunset Weddings by the sea" },
      { label: "Destination Weddings", href: "/weddings?category=destination", description: "Exotic heritage locales" },
      { label: "Traditional Ceremonies", href: "/weddings?category=traditional", description: "Generations of timeless ritual" },
    ],
  },
  { label: "How It Works?", href: "/#how-it-works" },
  { label: "Destinations", href: "/#countries" },
  { label: "Host Your Wedding", href: "/list-wedding" },
];

/** A same-page anchor (e.g. "/#how-it-works") isn't a distinct "page," so it
 *  never counts as the active nav item — only real routes do. */
function isActiveHref(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function UserAvatar({
  avatar,
  name,
  size = 32,
}: {
  avatar: string;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  if (avatar) {
    return (
      <div
        className="rounded-full overflow-hidden border-2 border-[var(--color-brand-secondary)]/40 flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={avatar}
          alt={name}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
      style={{
        width: size,
        height: size,
        background: "var(--gradient-brand)",
        fontSize: size * 0.38,
      }}
      aria-hidden="true"
    >
      {initials || <User size={size * 0.5} />}
    </div>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const pathname = usePathname();
  const { user, loading, notifications } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const currencyPickerRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Single outside-click handler for both the currency picker and whichever
  // nav dropdown is open — each dropdown wrapper carries data-nav-dropdown
  // so this doesn't need a ref per item.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (currencyPickerRef.current && !currencyPickerRef.current.contains(target)) {
        setShowCurrencyPicker(false);
      }
      if (activeDropdown && !target.closest("[data-nav-dropdown]")) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // Escape closes whichever layer is currently open, innermost first, and
  // returns focus to the control that opened it so keyboard users aren't
  // dropped back at the top of the page.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (isMobileOpen) {
        setIsMobileOpen(false);
        mobileToggleRef.current?.focus();
      } else if (activeDropdown) {
        setActiveDropdown(null);
      } else if (showCurrencyPicker) {
        setShowCurrencyPicker(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, activeDropdown, showCurrencyPicker]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isHomepage = pathname === "/";
  const isExploreActive = pathname === "/weddings" || pathname.startsWith("/weddings/");

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setIsScrolled(currentY > 20);

    // Hide the header on the way down past the fold, reveal it on the way
    // up — but only once there's real distance from the top, so it doesn't
    // flicker while someone's just nudging the page under the hero.
    const scrollingDown = currentY > lastScrollY.current;
    setHideOnScroll(scrollingDown && currentY > 160);
    lastScrollY.current = currentY;
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

  // Always surface the header the moment the mobile menu opens or closes —
  // otherwise a header hidden by scroll-direction could stay hidden right
  // when focus needs to land back on its toggle button.
  useEffect(() => {
    setHideOnScroll(false);
  }, [isMobileOpen]);

  function toggleDropdown(label: string) {
    setActiveDropdown((prev) => (prev === label ? null : label));
  }

  function handleDropdownBlur(event: React.FocusEvent<HTMLDivElement>, label: string) {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setActiveDropdown((prev) => (prev === label ? null : prev));
    }
  }

  const isTransparent = isHomepage && !isScrolled && !isMobileOpen;
  const isHeaderHidden =
    hideOnScroll && !isMobileOpen && !activeDropdown && !showCurrencyPicker && !prefersReducedMotion;

  return (
    <>
      {/* First focusable element on the page — lets keyboard and
          screen-reader users jump straight past the nav to the content
          page.tsx already marks with id="main-content". */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-[var(--color-brand-primary)] focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isHeaderHidden && "-translate-y-full",
          isTransparent
            ? "bg-transparent py-6"
            : "bg-white/80 backdrop-blur-md py-4 border-b border-white/20"
        )}
        role="banner"
      >
        <div className="container-luxury">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="Wedding With India — Home"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center transition-transform group-hover:scale-105">
                <Sparkles size={20} className="text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-display font-bold text-xl tracking-tight transition-colors",
                    isTransparent ? "text-white" : "text-[var(--color-brand-primary)]"
                  )}
                >
                  Wedding With India
                </span>
                <span
                  className={cn(
                    "text-[0.65rem] font-medium uppercase tracking-widest transition-colors",
                    isTransparent ? "text-white/80" : "text-[var(--color-brand-secondary)]"
                  )}
                >
                  Attend Indian Weddings
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden lg:flex items-center gap-2"
              aria-label="Primary navigation"
            >
              {navItems.map((item) =>
                item.children ? (
                  <div
                    key={item.label}
                    data-nav-dropdown
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    onBlur={(e) => handleDropdownBlur(e, item.label)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.label)}
                      className={cn(
                        "flex items-center gap-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
                        isTransparent
                          ? "text-white/90 hover:text-white hover:bg-white/10"
                          : "text-charcoal-700 hover:text-[var(--color-brand-primary)] hover:bg-maroon-50",
                        isExploreActive &&
                          (isTransparent
                            ? "text-white bg-white/15 font-semibold"
                            : "text-[var(--color-brand-primary)] bg-maroon-50 font-semibold")
                      )}
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === item.label}
                      aria-current={isExploreActive ? "page" : undefined}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform duration-200",
                          activeDropdown === item.label && "rotate-50"
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Dropdown — a plain disclosure of nav links, not an
                        application "menu": there's no arrow-key roving focus
                        here, so role="menu"/"menuitem" would promise
                        keyboard behaviour this doesn't implement. Tab order
                        through the links themselves is the real interaction. */}
                    <div
                      className={cn(
                        "absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(0,0,0,0.14)] border border-warm-200/60 overflow-hidden transition-all duration-200 origin-top-left",
                        activeDropdown === item.label
                          ? "opacity-100 scale-100 pointer-events-auto"
                          : "opacity-0 scale-95 pointer-events-none"
                      )}
                    >
                      <div className="p-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-maroon-50 transition-colors duration-150 group"
                          >
                            <span className="text-sm font-semibold text-charcoal-800 group-hover:text-[var(--color-brand-primary)] transition-colors">
                              {child.label}
                            </span>
                            <span className="text-xs text-charcoal-400 mt-0.5">
                              {child.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={isActiveHref(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
                      isTransparent
                        ? "text-white/90 hover:text-white hover:bg-white/10"
                        : "text-charcoal-700 hover:text-[var(--color-brand-primary)] hover:bg-maroon-50",
                      isActiveHref(pathname, item.href) &&
                        (isTransparent
                          ? "text-white bg-white/15 font-semibold"
                          : "text-[var(--color-brand-primary)] bg-maroon-50 font-semibold")
                    )}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <div className="relative" ref={currencyPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-warm-100 transition-colors text-charcoal-600"
                  aria-label="Change currency"
                  aria-expanded={showCurrencyPicker}
                >
                  <Globe size={18} aria-hidden="true" />
                </button>
                {showCurrencyPicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-warm-200 rounded-xl shadow-lg p-2 min-w-[140px] z-50">
                    {(["INR", "USD", "EUR"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setCurrency(c); setShowCurrencyPicker(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                          currency === c
                            ? "bg-maroon-50 text-[var(--color-brand-primary)]"
                            : "text-charcoal-600 hover:bg-warm-50"
                        )}
                      >
                        {c === "INR" ? "₹ INR" : c === "USD" ? "$ USD" : "€ EUR"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                /* Loading skeleton — prevents layout shift */
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-charcoal-100 animate-pulse" />
                  <div className="w-20 h-8 rounded-full bg-charcoal-100 animate-pulse" />
                </div>
              ) : user ? (
                /* Signed in state */
                <div className="flex items-center gap-2">
                  {/* Notification bell */}
                  <Link
                    href="/dashboard/notifications"
                    className={cn(
                      "relative p-2 rounded-xl transition-all duration-200",
                      isTransparent
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100"
                    )}
                    aria-label={
                      unreadCount > 0
                        ? `${unreadCount} unread notifications`
                        : "Notifications"
                    }
                  >
                    <Bell size={18} aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--color-brand-primary)] text-white text-[0.5rem] font-bold flex items-center justify-center leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Dashboard link with avatar */}
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm transition-all duration-200",
                      isTransparent
                        ? "text-white hover:bg-white/10 border border-white/30"
                        : "text-charcoal-700 hover:bg-maroon-50 hover:text-[var(--color-brand-primary)] border border-warm-200"
                    )}
                    aria-label="Go to your dashboard"
                  >
                    <UserAvatar avatar={user.avatar} name={user.name} size={24} />
                    <span className="hidden xl:inline max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <LayoutDashboard size={14} aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
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
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              ref={mobileToggleRef}
              type="button"
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

      {/* Mobile Menu Overlay — deliberately stacked ABOVE the header (z-60 >
          header's z-50). Previously both shared roughly the same top-right
          corner at nearly the same z-index band, so the header's own close
          (X) button and the drawer's separate close button could occupy the
          same visual space at once. Stacking the whole overlay above the
          header removes the ambiguity: while it's open, the drawer's own
          close button is the only one in play. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-all duration-300",
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-white flex flex-col shadow-2xl transition-transform duration-300",
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between p-5 border-b border-warm-200">
            <Link
              href="/"
              className="flex items-center gap-2.5"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center">
                <Sparkles size={16} className="text-white" aria-hidden="true" />
              </div>
              <span className="font-display font-bold text-[var(--color-brand-primary)] text-sm">
                Wedding With India
              </span>
            </Link>
            <button
              type="button"
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
                  aria-current={isActiveHref(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-colors",
                    isActiveHref(pathname, item.href)
                      ? "bg-maroon-50 text-[var(--color-brand-primary)]"
                      : "text-charcoal-800 hover:bg-maroon-50 hover:text-[var(--color-brand-primary)]"
                  )}
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
            {/* Currency selector for mobile */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-warm-50 border border-warm-200 text-xs font-semibold text-charcoal-700 mb-1">
              <span className="flex items-center gap-2">
                <Globe size={15} className="text-charcoal-500" aria-hidden="true" />
                Currency
              </span>
              <div className="flex gap-1">
                {(["INR", "USD", "EUR"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                      currency === c
                        ? "bg-[var(--color-brand-primary)] text-white shadow-xs"
                        : "text-charcoal-600 hover:bg-warm-100"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
             {user ? (
               <>
                 {/* User info row */}
                 <Link
                   href="/dashboard"
                   onClick={() => setIsMobileOpen(false)}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl bg-maroon-50 border border-maroon-100 hover:bg-maroon-100 transition-colors"
                   aria-label="Open dashboard"
                 >
                   <UserAvatar avatar={user.avatar} name={user.name} size={36} />
                   <div className="min-w-0 flex-1">
                     <div className="font-semibold text-charcoal-900 text-sm truncate">
                       {user.name}
                     </div>
                     <div className="text-xs text-charcoal-500 capitalize">
                       {user.role ?? "Guest"} · Dashboard
                     </div>
                   </div>
                   {unreadCount > 0 && (
                     <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand-primary)] text-white text-[0.5625rem] font-bold flex items-center justify-center">
                       {unreadCount > 9 ? "9+" : unreadCount}
                     </span>
                   )}
                 </Link>
                 <Link
                   href="/weddings"
                   onClick={() => setIsMobileOpen(false)}
                   className="btn btn-primary w-full justify-center"
                 >
                   <Heart size={16} aria-hidden="true" />
                   Attend a Wedding
                 </Link>
               </>
             ) : (
               <>
                 <Link
                   href="/weddings"
                   onClick={() => setIsMobileOpen(false)}
                   className="btn btn-primary w-full justify-center"
                 >
                   <Heart size={16} aria-hidden="true" />
                   Attend a Wedding
                 </Link>
                 <Link
                   href="/login"
                   onClick={() => setIsMobileOpen(false)}
                   className="btn btn-outline w-full justify-center"
                 >
                   Sign In
                 </Link>
               </>
             )}
          </div>
        </div>
      </div>
    </>
  );
}