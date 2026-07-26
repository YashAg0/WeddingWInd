"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import BookingCard from "@/components/dashboard/BookingCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CreditCard, Clock, CalendarX, History, Ticket } from "lucide-react";

type FilterStatus = "upcoming" | "awaiting_payment" | "pending" | "rejected" | "history";

export default function BookingsPage() {
  const { user, bookings, cancelBooking } = useAuth();
  const [filter, setFilter] = useState<FilterStatus>("upcoming");

  const userRole = user?.role || "traveler";

  // 1. TRAVELER LOGIC
  const filteredBookings = bookings.filter((b) => {
    if (filter === "history") {
      return b.status === "past" || b.status === "cancelled" || b.status === "refunded";
    }
    return b.status === filter;
  });

  // 2. COUPLE LOGIC
  const coupleApprovedGuests = bookings.filter((b) => b.status === "upcoming" || b.status === "past");

  const getEmptyStateDetails = () => {
    switch (filter) {
      case "awaiting_payment":
        return {
          title: "No pending payments",
          description: "All your approved applications have been paid or are resolved.",
          icon: <CreditCard size={24} className="text-maroon-800" />
        };
      case "pending":
        return {
          title: "No pending applications",
          description: "You do not have any pending wedding applications at the moment.",
          icon: <Clock size={24} className="text-maroon-800" />
        };
      case "rejected":
        return {
          title: "No declined applications",
          description: "There are no declined reservation requests in your record.",
          icon: <CalendarX size={24} className="text-maroon-800" />
        };
      case "history":
        return {
          title: "Empty reservation history",
          description: "You haven't attended any weddings with us yet, and have no cancelled passes.",
          icon: <History size={24} className="text-maroon-800" />
        };
      default:
        return {
          title: "No confirmed passes",
          description: "Explore the marketplace, apply to join host families, and complete your checkout payments.",
          icon: <Ticket size={24} className="text-maroon-800" />,
          actionText: "Browse Weddings",
          actionHref: "/weddings"
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          {userRole === "couple" ? "Guest List & Passes" : "My Bookings"}
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          {userRole === "couple" 
            ? "View global guests attending your wedding ceremonies." 
            : "Manage your wedding experiences, itineraries, and ticket details."
          }
        </p>
      </div>

      {userRole === "couple" ? (
        // Couple View of bookings (guest list)
        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3">
            Confirmed Attendees
          </h3>

          {coupleApprovedGuests.length === 0 ? (
            <div className="p-8 text-center text-xs sm:text-sm text-charcoal-400 font-semibold">
              No confirmed attendees yet. Applications can be approved on the overview panel.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" role="table">
                <thead>
                  <tr className="border-b border-warm-200 text-xs font-bold text-charcoal-500 uppercase tracking-widest bg-warm-50">
                    <th className="p-4 rounded-tl-xl">Guest</th>
                    <th className="p-4">Origin</th>
                    <th className="p-4">Attendees</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 rounded-tr-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100 text-xs sm:text-sm text-charcoal-600">
                  {coupleApprovedGuests.map((b: any) => (
                    <tr key={b.id}>
                      <td className="p-4 font-bold text-charcoal-900">{b.guestName || "Guest"}</td>
                      <td className="p-4">{b.guestCountry || "—"}</td>
                      <td className="p-4">{b.guestsCount} guest(s)</td>
                      <td className="p-4">{b.date}</td>
                      <td className="p-4">
                        <span className="inline-block text-[0.625rem] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Traveler View of bookings (itinerary tickets)
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-warm-200 gap-6 overflow-x-auto">
            {(["upcoming", "awaiting_payment", "pending", "rejected", "history"] as FilterStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative cursor-pointer whitespace-nowrap",
                  filter === tab
                    ? "text-[var(--color-brand-primary)] border-b-2 border-[var(--color-brand-primary)]"
                    : "text-charcoal-400 hover:text-charcoal-700"
                )}
              >
                {tab === "upcoming" ? "Confirmed Passes" : tab === "awaiting_payment" ? "Awaiting Payment" : tab === "pending" ? "Pending Approval" : tab === "rejected" ? "Declined" : "History"}
              </button>
            ))}
          </div>

          {/* Bookings cards stack */}
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredBookings.length === 0 ? (
                <EmptyState
                  title={getEmptyStateDetails().title}
                  description={getEmptyStateDetails().description}
                  icon={getEmptyStateDetails().icon}
                  actionText={getEmptyStateDetails().actionText}
                  actionHref={getEmptyStateDetails().actionHref}
                />
              ) : (
                filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={cancelBooking}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
