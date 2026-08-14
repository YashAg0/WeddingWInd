"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Heart, Globe, Bell, LayoutDashboard, User } from "lucide-react";
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
      { label: "Coastal Weddings", href: "/weddings?category=beach", description: "Sunset weddings by the sea" },
      { label: "Destination Weddings", href: "/weddings?category=destination", description: "Exotic heritage locales" },
      { label: "Traditional Ceremonies", href: "/weddings?category=traditional", description: "Generations of timeless rituals" },
    ],
  },
  { label: "How It Works?", href: "/#how-it-works" },
  { label: "Destinations", href: "/#countries" },
  { label: "Host Your Wedding", href: "/list-wedding" },
];

const CURRENCIES = ["INR", "USD", "EUR"] as const;
type CurrencyCode = (typeof CURRENCIES)[number];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-secondary)] focus-visible:ring-offset-2";

/** A same-page anchor (e.g. "/#how-it-works") isn't a distinct "page," so it
 *  never counts as the active nav item — only real routes do. */
function isActiveHref(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function currencySymbol(code: CurrencyCode) {
  return code === "INR" ? "₹" : code === "USD" ? "$" : "€";
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

/** Segmented pick-one control with a sliding highlight — reused by the
 *  desktop currency popover and the mobile drawer footer so both stay
 *  in sync visually and behaviorally. */
function CurrencySwitcher({
  value,
  onChange,
  reducedMotion,
  compact = false,
  tabbable = true,
}: {
  value: CurrencyCode;
  onChange: (c: CurrencyCode) => void;
  reducedMotion: boolean;
  compact?: boolean;
  tabbable?: boolean;
}) {
  const activeIndex = CURRENCIES.indexOf(value);
  return (
    <div
      role="radiogroup"
      aria-label="Select currency"
      className={cn(
        "relative flex items-center bg-warm-50 border border-warm-200 rounded-full p-1",
        compact ? "w-full" : "w-[180px]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1 bottom-1 left-1 rounded-full bg-[var(--color-brand-primary)] shadow-sm",
          !reducedMotion && "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        )}
        style={{
          width: "calc((100% - 0.5rem) / 3)",
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          tabIndex={tabbable ? 0 : -1}
          onClick={() => onChange(c)}
          className={cn(
            "relative z-10 flex-1 px-2 py-1.5 rounded-full text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1",
            value === c ? "text-white" : "text-charcoal-600 hover:text-charcoal-900"
          )}
        >
          {currencySymbol(c)} {c}
        </button>
      ))}
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
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [indicatorRect, setIndicatorRect] = useState({ left: 0, width: 0, visible: false });

  const pathname = usePathname();
  const { user, loading, notifications } = useAuth();
  const { currency, setCurrency } = useCurrency();

  const currencyPickerRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const setItemRef = useCallback(
    (label: string) => (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(label, el);
      else itemRefs.current.delete(label);
    },
    []
  );

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
  const activeKey =
    navItems.find((item) => (item.children ? isExploreActive : isActiveHref(pathname, item.href)))?.label ?? null;

  // Scroll state is coalesced through rAF so fast scrolling triggers at
  // most one re-render per frame instead of one per scroll event.
  const handleScroll = useCallback(() => {
    if (scrollTicking.current) return;
    scrollTicking.current = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 20);

      // Hide the header on the way down past the fold, reveal it on the way
      // up — but only once there's real distance from the top, so it doesn't
      // flicker while someone's just nudging the page under the hero.
      const scrollingDown = currentY > lastScrollY.current;
      setHideOnScroll(scrollingDown && currentY > 160);
      lastScrollY.current = currentY;
      scrollTicking.current = false;
    });
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

  // Sliding spotlight indicator — tracks whichever nav item is hovered,
  // falling back to whichever one is active. Recomputed on hover/route
  // change and on resize, since item widths can shift with the viewport.
  function updateIndicator() {
    const key = hoveredKey ?? activeKey;
    const el = key ? itemRefs.current.get(key) : undefined;
    if (el) {
      setIndicatorRect({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
    } else {
      setIndicatorRect((prev) => ({ ...prev, visible: false }));
    }
  }

  useEffect(() => {
    updateIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredKey, activeKey]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          "fixed top-0 left-0 right-0 z-50 transition-transform duration-500 will-change-transform",
          isHeaderHidden && "-translate-y-full",
          isTransparent ? "pt-6 pb-2" : "pt-3 pb-3"
        )}
        role="banner"
      >
        <div className="container-luxury">
          {/* Floating glass capsule — a flat top-of-page bar on the
              transparent hero, condensing into a rounded, blurred pill
              once scrolled or on any non-transparent page. */}
          <div
            className={cn(
              "flex items-center justify-between w-full min-w-0 h-16 px-4 sm:px-6 rounded-[2rem] transition-all duration-500",
              isTransparent
                ? "bg-transparent"
                : "bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(122,31,43,0.14)]"
            )}
          >
            {/* Logo */}
            <Link
              href="/"
              className={cn("flex items-center gap-2.5 group flex-shrink-0 rounded-xl", FOCUS_RING)}
              aria-label="Wedding With India — Home"
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                {!prefersReducedMotion && (
                  <div
                    className="absolute inset-[-3px] rounded-xl opacity-70 animate-spin"
                    style={{
                      background:
                        "conic-gradient(from 0deg, var(--color-brand-primary), var(--color-brand-secondary), var(--color-brand-primary))",
                      animationDuration: "6s",
                    }}
                    aria-hidden="true"
                  />
                )}
                <div className="relative w-10 h-10 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
                  <Image
                    src="/images/logos/logo.png"
                    alt="Wedding With India Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-xl"
                    priority
                  />
                </div>
              </div>
              <div className="hidden sm:flex flex-col justify-center leading-none">
                <span
                  className={cn(
                    "font-display font-bold text-[1.05rem] leading-tight tracking-tight whitespace-nowrap transition-colors",
                    isTransparent ? "text-white" : "text-[var(--color-brand-primary)]"
                  )}
                >
                  Wedding With India
                </span>
                <span
                  className={cn(
                    "text-[0.625rem] font-semibold uppercase tracking-wider whitespace-nowrap mt-0.5 transition-colors",
                    isTransparent ? "text-white/75" : "text-[var(--color-brand-secondary)]"
                  )}
                >
                  Attend Indian Weddings
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="relative hidden lg:flex items-center gap-0.5 flex-shrink-0"
              aria-label="Primary navigation"
              onMouseLeave={() => setHoveredKey(null)}
            >
              {/* Signature element: a soft gradient spotlight that glides
                  beneath whichever nav item is hovered or active. */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full",
                  isTransparent ? "bg-white/15" : "bg-maroon-50",
                  !prefersReducedMotion &&
                    "transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  indicatorRect.visible ? "opacity-100" : "opacity-0"
                )}
                style={{
                  width: indicatorRect.width,
                  transform: `translateX(${indicatorRect.left}px)`,
                }}
              />

              {navItems.map((item) =>
                item.children ? (
                  <div
                    key={item.label}
                    ref={setItemRef(item.label)}
                    data-nav-dropdown
                    className="relative"
                    onMouseEnter={() => {
                      setActiveDropdown(item.label);
                      setHoveredKey(item.label);
                    }}
                    onMouseLeave={() => setActiveDropdown(null)}
                    onBlur={(e) => handleDropdownBlur(e, item.label)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.label)}
                      className={cn(
                        "relative z-10 flex items-center h-10 gap-1 px-3 rounded-full font-medium text-sm whitespace-nowrap transition-colors duration-200",
                        FOCUS_RING,
                        isTransparent
                          ? "text-white/90 hover:text-white"
                          : "text-charcoal-700 hover:text-[var(--color-brand-primary)]",
                        isExploreActive &&
                          (isTransparent
                            ? "text-white font-semibold"
                            : "text-[var(--color-brand-primary)] font-semibold")
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
                          activeDropdown === item.label && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Dropdown — a plain disclosure of nav links, not an
                        application "menu": there's no arrow-key roving focus
                        here, so role="menu"/"menuitem" would promise
                        keyboard behaviour this doesn't implement. Visibility
                        (not just opacity) is toggled so closed links drop
                        out of the tab order instead of staying invisibly
                        focusable. */}
                    <div
                      className={cn(
                        "absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(0,0,0,0.14)] border border-warm-200/60 overflow-hidden origin-top-left transition-[opacity,transform,visibility] duration-200",
                        activeDropdown === item.label
                          ? "visible opacity-100 scale-100"
                          : "invisible opacity-0 scale-95"
                      )}
                      aria-hidden={activeDropdown !== item.label}
                    >
                      <div className="p-2">
                        {item.children.map((child, i) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            tabIndex={activeDropdown === item.label ? 0 : -1}
                            style={
                              !prefersReducedMotion
                                ? {
                                    transitionDelay:
                                      activeDropdown === item.label ? `${i * 30}ms` : "0ms",
                                  }
                                : undefined
                            }
                            className={cn(
                              "flex flex-col px-3 py-2.5 rounded-xl hover:bg-maroon-50 transition-all duration-200 group",
                              FOCUS_RING,
                              !prefersReducedMotion &&
                                (activeDropdown === item.label
                                  ? "opacity-100 translate-y-0"
                                  : "opacity-0 -translate-y-1")
                            )}
                          >
                            <span className="text-sm font-semibold text-charcoal-800 group-hover:text-[var(--color-brand-primary)] transition-colors">
                              {child.label}
                            </span>
                            <span className="text-xs text-charcoal-500 mt-0.5">{child.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    ref={setItemRef(item.label)}
                    href={item.href}
                    onMouseEnter={() => setHoveredKey(item.label)}
                    aria-current={isActiveHref(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "relative z-10 flex items-center h-10 px-3 rounded-full font-medium text-sm whitespace-nowrap transition-colors duration-200",
                      FOCUS_RING,
                      isTransparent
                        ? "text-white/90 hover:text-white"
                        : "text-charcoal-700 hover:text-[var(--color-brand-primary)]",
                      isActiveHref(pathname, item.href) &&
                        (isTransparent ? "text-white font-semibold" : "text-[var(--color-brand-primary)] font-semibold")
                    )}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <div className="hidden lg:flex items-center gap-3 ml-4 flex-shrink-0">
              <div className="relative" ref={currencyPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowCurrencyPicker((v) => !v)}
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                    FOCUS_RING,
                    isTransparent ? "text-white/90 hover:bg-white/10" : "text-charcoal-600 hover:bg-warm-100"
                  )}
                  aria-label="Change currency"
                  aria-haspopup="true"
                  aria-expanded={showCurrencyPicker}
                >
                  <Globe size={18} aria-hidden="true" />
                </button>
                <div
                  className={cn(
                    "absolute right-0 top-full mt-2 bg-white border border-warm-200 rounded-2xl shadow-[0_8px_40px_0_rgba(0,0,0,0.14)] p-3 min-w-[210px] z-50 origin-top-right transition-[opacity,transform,visibility] duration-200",
                    showCurrencyPicker ? "visible opacity-100 scale-100" : "invisible opacity-0 scale-95"
                  )}
                  aria-hidden={!showCurrencyPicker}
                >
                  <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-400 px-1 mb-2">
                    Currency
                  </p>
                  <CurrencySwitcher
                    value={currency}
                    onChange={(c) => {
                      setCurrency(c);
                      setShowCurrencyPicker(false);
                    }}
                    reducedMotion={prefersReducedMotion}
                    tabbable={showCurrencyPicker}
                  />
                </div>
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
                      "relative h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-200",
                      FOCUS_RING,
                      isTransparent
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100"
                    )}
                    aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
                  >
                    <Bell size={18} aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4">
                        {!prefersReducedMotion && (
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-primary)] opacity-60"
                            aria-hidden="true"
                          />
                        )}
                        <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-[var(--color-brand-primary)] text-white text-[0.5rem] font-bold leading-none">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      </span>
                    )}
                  </Link>

                  {/* Dashboard link with avatar */}
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center gap-2 h-10 pl-1.5 pr-3 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200",
                      FOCUS_RING,
                      isTransparent
                        ? "text-white hover:bg-white/10 border border-white/30"
                        : "text-charcoal-700 hover:bg-maroon-50 hover:text-[var(--color-brand-primary)] border border-warm-200"
                    )}
                    aria-label="Go to your dashboard"
                  >
                    <div className="rounded-full p-[2px] bg-[image:var(--gradient-brand)]">
                      <UserAvatar avatar={user.avatar} name={user.name} size={24} />
                    </div>
                    <span className="hidden xl:inline max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                    <LayoutDashboard size={14} aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn(
                      "flex items-center justify-center h-10 px-5 text-sm font-semibold rounded-full whitespace-nowrap transition-colors duration-200",
                      FOCUS_RING,
                      isTransparent
                        ? "text-white/90 hover:text-white hover:bg-white/10"
                        : "text-[var(--color-brand-primary)] hover:bg-maroon-50"
                    )}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/weddings"
                    className={cn(
                      "flex items-center justify-center gap-1.5 h-10 px-5 text-sm font-semibold rounded-2xl whitespace-nowrap transition-all duration-200",
                      FOCUS_RING,
                      "text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 shadow-sm"
                    )}
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
                "lg:hidden h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-200",
                FOCUS_RING,
                isTransparent ? "text-white hover:bg-white/10" : "text-charcoal-700 hover:bg-charcoal-100"
              )}
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-menu"
            >
              {isMobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay — visibility (not just opacity/pointer-events)
          is toggled so the whole drawer drops out of the tab order the
          instant it's closed, while still playing its slide/fade-out
          transition first. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-0 z-[60] lg:hidden overflow-hidden transition-[opacity,visibility] duration-300",
          isMobileOpen ? "block opacity-100 pointer-events-auto" : "hidden opacity-0 pointer-events-none"
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
            "absolute top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between p-5 border-b border-warm-200">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMobileOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logos/logo.png"
                  alt="Wedding With India Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <span className="font-display font-bold text-[var(--color-brand-primary)] text-sm">
                Wedding With India
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "p-1.5 rounded-lg hover:bg-charcoal-100 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
              )}
              aria-label="Close menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Nav links — each row's entrance is staggered slightly for a
              coordinated reveal instead of everything popping in at once. */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Mobile navigation">
            {navItems.map((item, index) => (
              <div
                key={item.label}
                style={
                  !prefersReducedMotion
                    ? { transitionDelay: isMobileOpen ? `${index * 40 + 80}ms` : "0ms" }
                    : undefined
                }
                className={cn(
                  "transition-all duration-300",
                  !prefersReducedMotion && (isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4")
                )}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  aria-current={isActiveHref(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1",
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
                        className={cn(
                          "block px-3 py-2 rounded-lg text-sm text-charcoal-500 hover:text-[var(--color-brand-primary)] hover:bg-maroon-50 transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
                        )}
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
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-warm-50 border border-warm-200 text-xs font-semibold text-charcoal-700">
              <span className="flex items-center gap-2">
                <Globe size={15} className="text-charcoal-500" aria-hidden="true" />
                Currency
              </span>
            </div>
            <CurrencySwitcher value={currency} onChange={setCurrency} reducedMotion={prefersReducedMotion} compact />

            {user ? (
              <>
                {/* User info row */}
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl bg-maroon-50 border border-maroon-100 hover:bg-maroon-100 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-1"
                  )}
                  aria-label="Open dashboard"
                >
                  <UserAvatar avatar={user.avatar} name={user.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-charcoal-900 text-sm truncate">{user.name}</div>
                    <div className="text-xs text-charcoal-500 capitalize">{user.role ?? "Guest"} · Dashboard</div>
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