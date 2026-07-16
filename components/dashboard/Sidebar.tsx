"use client";

import Link from "next/link";
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
  Menu,
  X,
  Share2,
  Users,
  ShieldAlert,
  Coins,
  FileCode,
  BarChart3,
  MessageSquare,
  Ticket,
  ScanLine
} from "lucide-react";
import { useState } from "react";
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
    roles: ["traveler", "couple", "agent", "admin"]
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    roles: ["traveler", "couple", "agent", "admin"]
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
    roles: ["traveler", "couple", "agent"]
  },
  {
    label: "My Event Hub",
    href: "/dashboard/events",
    icon: Ticket,
    roles: ["traveler"]
  },
  {
    label: "My Weddings",
    href: "/dashboard/listings",
    icon: Heart,
    roles: ["couple"]
  },
  {
    label: "Wedding Operations",
    href: "/dashboard/operations",
    icon: Calendar,
    roles: ["couple"]
  },
  {
    label: "Gate Scanner",
    href: "/dashboard/check-in",
    icon: ScanLine,
    roles: ["couple", "admin"]
  },
  {
    label: "Event Manager",
    href: "/dashboard/admin/events",
    icon: Calendar,
    roles: ["admin"]
  },
  {
    label: "Referrals & Links",
    href: "/dashboard/referrals",
    icon: Share2,
    roles: ["agent"]
  },
  {
    label: "Leads Management",
    href: "/dashboard/leads",
    icon: Users,
    roles: ["agent"]
  },
  {
    label: "Earnings & Payouts",
    href: "/dashboard/earnings",
    icon: Coins,
    roles: ["agent"]
  },
  {
    label: "Agent Manager",
    href: "/dashboard/admin/agents",
    icon: Users,
    roles: ["admin"]
  },
  {
    label: "Saved Weddings",
    href: "/dashboard/wishlist",
    icon: Heart,
    roles: ["traveler"]
  },
  {
    label: "Admin Weddings",
    href: "/dashboard/admin/weddings",
    icon: Calendar,
    roles: ["admin"]
  },
  {
    label: "User Accounts",
    href: "/dashboard/admin/users",
    icon: Users,
    roles: ["admin"]
  },
  {
    label: "Identity Audits",
    href: "/dashboard/admin/verifications",
    icon: ShieldAlert,
    roles: ["admin"]
  },
  {
    label: "Booking Manager",
    href: "/dashboard/admin/bookings",
    icon: Calendar,
    roles: ["admin"]
  },
  {
    label: "Financial Ledger",
    href: "/dashboard/admin/payments",
    icon: Coins,
    roles: ["admin"]
  },
  {
    label: "CMS Editor",
    href: "/dashboard/admin/cms",
    icon: FileCode,
    roles: ["admin"]
  },
  {
    label: "Discovery Center",
    href: "/dashboard/admin/discovery",
    icon: Compass,
    roles: ["admin"]
  },
  {
    label: "Communications Center",
    href: "/dashboard/admin/messages",
    icon: MessageSquare,
    roles: ["admin"]
  },
  {
    label: "Analytics & Logs",
    href: "/dashboard/admin/analytics",
    icon: BarChart3,
    roles: ["admin"]
  },
  {
    label: "Safety Center",
    href: "/dashboard/safety",
    icon: ShieldAlert,
    roles: ["traveler", "couple", "agent"]
  },
  {
    label: "Safety Ops Center",
    href: "/dashboard/admin/safety",
    icon: ShieldAlert,
    roles: ["admin"]
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    roles: ["traveler", "couple", "agent", "admin"]
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["traveler", "couple", "agent", "admin"]
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["traveler", "couple", "agent", "admin"]
  }
];

export default function Sidebar({ className, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userRole = user?.role || "traveler";

  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className={cn("flex flex-col h-full bg-charcoal-900 text-white border-r border-charcoal-800 w-64 p-6 justify-between", className)}>
      <div className="space-y-8">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center font-display font-black text-sm text-white">
              🪔
            </span>
            <span className="font-display font-bold text-sm tracking-wide text-white group-hover:text-[var(--color-brand-secondary)] transition-colors">
              Wedding With India
            </span>
          </Link>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="lg:hidden text-white/70 hover:text-white" aria-label="Close sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Card inside Sidebar */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-charcoal-800 flex-shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user?.avatar || "https://i.pravatar.cc/80?img=5"} alt={user?.name || "User Avatar"} className="object-cover w-full h-full" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs truncate">{user?.name || "Guest User"}</div>
            <div className="inline-block text-[0.625rem] font-bold uppercase tracking-widest text-[var(--color-brand-secondary)] mt-0.5">
              {userRole}
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1.5" aria-label="Dashboard navigation">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-white/5 hover:text-white",
                  isActive
                    ? "bg-gradient-brand text-white shadow-sm"
                    : "text-white/60"
                )}
              >
                <Icon size={18} className={cn("flex-shrink-0", isActive ? "text-white" : "text-white/50")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="pt-6 border-t border-charcoal-850 space-y-4">
        <Link
          href="/weddings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white/50 hover:text-white transition-colors"
        >
          <Compass size={18} />
          <span>Explore Weddings</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer text-left"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
