"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Compass, Ticket, Heart, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  matchPrefixes?: string[];
  authOnly?: boolean;
  guestOnly?: boolean;
  roles?: string[];
}

const NAV_ITEMS: BottomNavItem[] = [
  {
    label: "Explore",
    href: "/weddings",
    icon: Compass,
    matchPrefixes: ["/weddings", "/destinations"],
  },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: Ticket,
    matchPrefixes: ["/dashboard/events"],
    authOnly: true,
    roles: ["traveler"],
  },
  {
    label: "Weddings",
    href: "/dashboard/celebrations",
    icon: Ticket,
    matchPrefixes: ["/dashboard/celebrations", "/dashboard/operations"],
    authOnly: true,
    roles: ["couple", "admin"],
  },
  {
    label: "Saved",
    href: "/dashboard/wishlist",
    icon: Heart,
    matchPrefixes: ["/dashboard/wishlist"],
    authOnly: true,
    roles: ["traveler"],
  },
  {
    label: "Account",
    href: "/dashboard",
    icon: User,
    matchPrefixes: ["/dashboard"],
    authOnly: true,
  },
  {
    label: "Sign In",
    href: "/login",
    icon: LogIn,
    guestOnly: true,
  },
];

const HIDDEN_ROUTES = [
  "/login",
  "/signup",
  "/onboarding",
  "/dashboard/check-in",
  "/dashboard/messages",
];

const HIDDEN_PREFIXES = ["/dashboard/admin"];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role ?? null;
  const isAuthenticated = !!user;

  if (!pathname) return null;

  const isHiddenRoute = HIDDEN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isHiddenPrefix = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
  if (isHiddenRoute || isHiddenPrefix) return null;

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.guestOnly && isAuthenticated) return false;
    if (item.authOnly && !isAuthenticated) return false;
    if (item.roles && userRole && !item.roles.includes(userRole)) return false;
    return true;
  }).slice(0, 5);

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(245, 235, 224, 0.9)",
        boxShadow: "0 -2px 20px 0 rgb(0 0 0 / 0.07)",
      }}
    >
      <div className="flex items-stretch h-14">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.matchPrefixes?.some((prefix) =>
              pathname === prefix || pathname.startsWith(prefix + "/")
            ) ?? false);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 relative",
                "transition-colors duration-200 min-w-0 select-none",
                isActive ? "text-[var(--color-brand-primary)]" : "text-charcoal-400"
              )}
            >
              <div className="relative p-1">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 rounded-xl bg-maroon-50"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
              </div>
              <span className="text-[0.625rem] font-semibold tracking-wide leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
