import React from "react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, BookingStatus } from "@prisma/client";

import ClientAdminEvents from "./ClientAdminEvents";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Unauthorized: Admin access only.
      </div>
    );
  }

  // Fetch all weddings
  const weddings = await prisma.wedding.findMany({
    include: {
      hostCouple: { include: { user: true } },
      bookings: {
        include: {
          traveler: { include: { user: true } },
          guestPasses: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // Fetch check-in logs
  const checkInLogs = await prisma.guestCheckIn.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      guestPass: {
        include: {
          booking: {
            include: {
              traveler: { include: { user: true } },
            },
          },
        },
      },
    },
  });

  // Calculate global operational stats
  const totalWeddings = weddings.length;
  const totalBookings = weddings.reduce((sum, w) => sum + w.bookings.length, 0);
  const checkedInCount = weddings.reduce(
    (sum, w) => sum + w.bookings.filter((b) => b.status === BookingStatus.CHECKED_IN).length,
    0
  );
  const attendedCount = weddings.reduce(
    (sum, w) => sum + w.bookings.filter((b) => b.status === BookingStatus.ATTENDED).length,
    0
  );
  const noShowCount = weddings.reduce(
    (sum, w) => sum + w.bookings.filter((b) => b.status === BookingStatus.NO_SHOW).length,
    0
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal-900">
          Admin Event Operations & Gate Logs
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Supervise global weddings execution, verify check-in logs, audit gate scans, and adjust traveler statuses.
        </p>
      </div>

      {/* Global stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white border border-warm-200/60 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Total Weddings
          </span>
          <span className="text-lg font-display font-black text-charcoal-900">{totalWeddings}</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Total Bookings
          </span>
          <span className="text-lg font-display font-black text-maroon-800">{totalBookings}</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Checked In
          </span>
          <span className="text-lg font-display font-black text-emerald-800">{checkedInCount}</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Attended
          </span>
          <span className="text-lg font-display font-black text-emerald-850">{attendedCount}</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] uppercase font-bold text-charcoal-400 block tracking-wider">
            No-Shows
          </span>
          <span className="text-lg font-display font-black text-red-700">{noShowCount}</span>
        </div>
      </div>

      <ClientAdminEvents
        weddings={weddings.map((w) => ({
          ...w,
          date: w.date.toISOString(),
          hostCouple: {
            ...w.hostCouple,
            user: { ...w.hostCouple.user, name: w.hostCouple.user.name ?? "" },
          },
          bookings: w.bookings.map((b) => ({
            ...b,
            status: b.status as string,
            traveler: {
              ...b.traveler,
              user: { email: b.traveler.user.email },
            },
          })),
        }))}
        checkInLogs={checkInLogs.map((log) => ({
          ...log,
          createdAt: log.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
