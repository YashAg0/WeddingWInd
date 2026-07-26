"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Bell, Search, Menu, LogOut, User, Settings, Check } from "lucide-react";


interface DashboardHeaderProps {
  onOpenMobileSidebar: () => void;
}

export default function DashboardHeader({ onOpenMobileSidebar }: DashboardHeaderProps) {

  const { user, notifications, markNotificationsRead, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-warm-200/50 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-35 shadow-sm">
      
      {/* Search Bar & Mobile Menu Trigger */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden text-charcoal-700 hover:text-charcoal-900 flex-shrink-0"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 bg-warm-50 border border-warm-200/50 rounded-xl px-3.5 py-1.5 w-64 md:w-80 group focus-within:border-maroon-350 focus-within:bg-white transition-all duration-200">
          <Search size={16} className="text-charcoal-400 group-focus-within:text-charcoal-800 transition-colors" />
          <input
            type="text"
            placeholder="Search bookings, weddings, or help..."
            className="bg-transparent border-none text-xs sm:text-sm text-charcoal-800 placeholder-charcoal-400 focus:outline-none w-full font-medium"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 relative">
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative w-9 h-9 rounded-xl border border-warm-200/50 hover:bg-warm-50/50 text-charcoal-700 hover:text-charcoal-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-brand-primary)]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-warm-200/60 rounded-2xl shadow-luxury-lg overflow-hidden z-40 animate-scale-in">
              <div className="p-4 border-b border-warm-200 bg-warm-50/50 flex justify-between items-center">
                <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markNotificationsRead();
                      setShowNotifications(false);
                    }}
                    className="text-[0.6875rem] font-bold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-warm-100 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-charcoal-400 font-medium">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 text-xs transition-colors hover:bg-warm-50/30 ${
                        !n.read ? "bg-maroon-50/10" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-charcoal-900">{n.title}</span>
                        <span className="text-[0.625rem] text-charcoal-400 font-semibold">{n.time}</span>
                      </div>
                      <p className="text-charcoal-500 mt-1 leading-normal">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-warm-200 bg-warm-50/50 text-center">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 cursor-pointer outline-none"
            aria-label="User menu"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-warm-100 border border-warm-200/55 flex-shrink-0 relative">
              <Image
                src={user?.avatar || "https://i.pravatar.cc/80?img=5"}
                alt={user?.name || "Avatar"}
                fill
                className="object-cover"
              />
            </div>
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-52 bg-white border border-warm-200/60 rounded-2xl shadow-luxury-lg py-1.5 z-40 animate-scale-in">
              <div className="px-4 py-2 border-b border-warm-100 text-xs">
                <div className="font-bold text-charcoal-900 truncate">{user?.name}</div>
                <div className="text-charcoal-400 truncate mt-0.5">{user?.email}</div>
              </div>

              <Link
                href="/dashboard/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-charcoal-700 hover:bg-warm-50 hover:text-charcoal-900 transition-colors font-semibold"
              >
                <User size={14} className="text-charcoal-400" />
                Profile Details
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-charcoal-700 hover:bg-warm-50 hover:text-charcoal-900 transition-colors font-semibold"
              >
                <Settings size={14} className="text-charcoal-400" />
                Settings
              </Link>

              <div className="border-t border-warm-100 my-1" />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50/50 hover:text-red-600 transition-colors font-semibold text-left cursor-pointer"
              >
                <LogOut size={14} className="text-red-400" />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
