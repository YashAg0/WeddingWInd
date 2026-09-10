"use client";

import { useAuth } from "@/context/AuthContext";
import NotificationCard from "@/components/dashboard/NotificationCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { DashboardLoadingState, DashboardErrorState } from "@/components/dashboard/DashboardDataState";
import { Check, Bell } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markNotificationsRead, loading, dataLoading, dataError, refreshData } = useAuth();

  const isBusyLoading = loading || dataLoading;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-200/50 pb-6">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl text-charcoal-900">
            Notifications
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Stay updated with your applications, bookings, and platform alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markNotificationsRead}
            className="btn btn-outline btn-sm shadow-sm flex items-center gap-1.5 cursor-pointer uppercase tracking-wider self-start sm:self-auto"
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </div>

      {isBusyLoading && notifications.length === 0 ? (
        <DashboardLoadingState
          message="Loading your notifications..."
          subMessage="Checking for platform alerts and updates..."
        />
      ) : dataError && notifications.length === 0 ? (
        <DashboardErrorState
          title="Unable to load notifications"
          message={dataError}
          onRetry={refreshData}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="You do not have any notification alerts or timelines at the moment."
          icon={<Bell size={24} className="text-maroon-800" />}
        />
      ) : (
        <div className="space-y-4 max-w-3xl">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              title={n.title}
              message={n.message}
              time={n.time}
              type={n.type}
              read={n.read}
            />
          ))}
        </div>
      )}

    </div>
  );
}
