import React from "react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import ClientOperationsCenter from "./ClientOperationsCenter";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const user = await requireAuth();

  const couple = await prisma.coupleProfile.findUnique({
    where: { userId: user.id },
  });
  if (!couple) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Unauthorized access. Couples profiles only.
      </div>
    );
  }

  // Fetch couple's wedding details
  const wedding = await prisma.wedding.findFirst({
    where: { hostCoupleId: couple.id },
    include: {
      bookings: {
        include: {
          traveler: { include: { user: true } },
          preparations: true,
          emergencies: true,
          travelDetails: true,
          guestPasses: true,
        },
      },
      itinerary: { orderBy: { sortOrder: "asc" } },
      announcements: { orderBy: { publishedAt: "desc" } },
      contacts: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!wedding) {
    return (
      <div className="p-6 text-center text-charcoal-500">
        You do not have any published wedding events listed on the platform.
      </div>
    );
  }

  // Calculate statistics
  const bookings = wedding.bookings;
  const approvedCount = bookings.filter((b) => b.status === BookingStatus.APPROVED).length;
  const paidCount = bookings.filter((b) => b.status === BookingStatus.PAID).length;
  const readyCount = bookings.filter((b) => b.status === BookingStatus.READY_FOR_EVENT).length;
  const checkedInCount = bookings.filter((b) => b.status === BookingStatus.CHECKED_IN).length;
  const attendedCount = bookings.filter((b) => b.status === BookingStatus.ATTENDED).length;
  const noShowCount = bookings.filter((b) => b.status === BookingStatus.NO_SHOW).length;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal-900">
          Wedding Operations Center
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Monitor traveler manifests, coordinate event schedules, issue updates, and review gate scan registers.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-warm-200/60 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Approved
          </span>
          <span className="text-lg font-display font-black text-charcoal-900">{approvedCount}</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Paid / Paid Confirmed
          </span>
          <span className="text-lg font-display font-black text-maroon-800">{paidCount}</span>
        </div>

        <div className="bg-white border border-warm-200/60 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-[9px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Checklist Ready
          </span>
          <span className="text-lg font-display font-black text-blue-700">{readyCount}</span>
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

      <ClientOperationsCenter
        wedding={wedding as any}
        bookings={bookings as any}
      />
    </div>
  );
}
