"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Bell,
  User,
  Settings,
  LogOut,
  Compass,
  X,
  Share2,
  Users,
  ShieldAlert,
  Coins,
  FileCode,
  BarChart3,
  MessageSquare,
  Ticket,
  ScanLine,
  ShieldCheck,
  Sliders,
  Building2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["traveler", "couple", "agent", "admin"],
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    roles: ["traveler", "couple", "agent", "admin"],
  },
  {
    label: "Reservations",
    href: "/dashboard/bookings",
    icon: Calendar,
    roles: ["traveler", "couple", "agent"],
  },
  {
    label: "My Event Hub",
    href: "/dashboard/events",
    icon: Ticket,
    roles: ["traveler"],
  },
  {
    label: "My Weddings",
    href: "/dashboard/celebrations",
    icon: Heart,
    roles: ["couple"],
  },
  {
    label: "Wedding Operations",
    href: "/dashboard/operations",
    icon: Calendar,
    roles: ["couple"],
  },
  {
    label: "Gate Scanner",
    href: "/dashboard/check-in",
    icon: ScanLine,
    roles: ["couple", "admin"],
  },
  {
    label: "Host Applications",
    href: "/dashboard/admin/hosts",
    icon: Building2,
    roles: ["admin"],
  },
  {
    label: "Marketplace Promotions",
    href: "/dashboard/admin/weddings/sponsorship",
    icon: Sparkles,
    roles: ["admin"],
  },
  {
    label: "Event Manager",
    href: "/dashboard/admin/events",
    icon: Calendar,
    roles: ["admin"],
  },
  {
    label: "Referrals & Links",
    href: "/dashboard/referrals",
    icon: Share2,
    roles: ["agent"],
  },
  {
    label: "Leads Management",
    href: "/dashboard/leads",
    icon: Users,
    roles: ["agent"],
  },
  {
    label: "Earnings & Payouts",
    href: "/dashboard/earnings",
    icon: Coins,
    roles: ["agent"],
  },
  {
    label: "Agent Manager",
    href: "/dashboard/admin/agents",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Saved Celebrations",
    href: "/dashboard/wishlist",
    icon: Heart,
    roles: ["traveler"],
  },
  {
    label: "Admin Weddings",
    href: "/dashboard/admin/weddings",
    icon: Calendar,
    roles: ["admin"],
  },
  {
    label: "User Accounts",
    href: "/dashboard/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Identity Audits",
    href: "/dashboard/admin/verifications",
    icon: ShieldAlert,
    roles: ["admin"],
  },
  {
    label: "Booking Manager",
    href: "/dashboard/admin/bookings",
    icon: Calendar,
    roles: ["admin"],
  },
  {
    label: "Financial Ledger",
    href: "/dashboard/admin/payments",
    icon: Coins,
    roles: ["admin"],
  },
  {
    label: "CMS Editor",
    href: "/dashboard/admin/cms",
    icon: FileCode,
    roles: ["admin"],
  },
  {
    label: "Discovery Center",
    href: "/dashboard/admin/discovery",
    icon: Compass,
    roles: ["admin"],
  },
  {
    label: "Communications Center",
    href: "/dashboard/admin/messages",
    icon: MessageSquare,
    roles: ["admin"],
  },
  {
    label: "Analytics & Logs",
    href: "/dashboard/admin/analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    label: "Founder Panel",
    href: "/dashboard/admin/founder",
    icon: Sliders,
    roles: ["admin"],
  },
  {
    label: "Safety Center",
    href: "/dashboard/safety",
    icon: ShieldAlert,
    roles: ["traveler", "couple", "agent"],
  },
  {
    label: "Safety Ops Center",
    href: "/dashboard/admin/safety",
    icon: ShieldAlert,
    roles: ["admin"],
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["traveler", "couple", "agent", "admin"],
  },
  {
    label: "Trust & Verification",
    href: "/dashboard/verification",
    icon: ShieldCheck,
    roles: ["traveler", "couple", "agent", "admin"],
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["traveler", "couple", "agent", "admin"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["traveler", "couple", "agent", "admin"],
  },
];

export default function Sidebar({ className, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userRole = user?.role || "traveler";

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-charcoal-900 text-white border-r border-charcoal-800 w-64 overflow-hidden select-none",
        className
      )}
      aria-label="Dashboard sidebar"
    >
      {/* ── 1. Top Section: Brand & User Profile (Fixed) ──────────────────── */}
      <div className="p-5 pb-4 flex-shrink-0 space-y-4 border-b border-white/10 bg-charcoal-900">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
              <Image
                src="/images/logos/logo.png"
                alt="Wedding With India Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </span>
            <span className="font-display font-bold text-sm tracking-wide text-white group-hover:text-[var(--color-brand-secondary)] transition-colors truncate">
              Wedding With India
            </span>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-charcoal-800 flex-shrink-0 relative border border-white/15">
            <Image
              src={user?.avatar || "https://i.pravatar.cc/80?img=5"}
              alt={user?.name || "User Avatar"}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs truncate text-white">{user?.name || "Guest User"}</div>
            <div className="inline-block text-[0.5625rem] font-black uppercase tracking-widest text-[var(--color-brand-secondary)]">
              {userRole}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Middle Section: Scrollable Navigation List ──────────────────── */}
      <nav
        className="flex-1 overflow-y-auto min-h-0 px-3.5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 overscroll-contain"
        aria-label="Dashboard navigation"
      >
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                isActive
                  ? "bg-gradient-brand text-white shadow-sm font-bold"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={16} className={cn("flex-shrink-0", isActive ? "text-white" : "text-white/50")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── 3. Bottom Section: Quick Links & Logout (Fixed) ────────────────── */}
      <div className="p-3.5 pt-3 border-t border-charcoal-850 flex-shrink-0 space-y-1.5 bg-charcoal-900/95">
        <Link
          href="/weddings"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Compass size={15} className="text-white/50 flex-shrink-0" />
          <span className="truncate">Explore Celebrations</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer text-left"
        >
          <LogOut size={15} className="flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
