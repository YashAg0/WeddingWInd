import React from "react";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import ClientReportForm from "./ClientReportForm";

export const dynamic = "force-dynamic";

export default async function ReportIncidentPage() {
  const user = await requireAuth();

  let bookings: Array<{ id: string; title: string }> = [];
  let weddings: Array<{ id: string; title: string }> = [];
  let subjects: Array<{ id: string; name: string; role: string }> = [];

  // Fetch bookings, weddings, and potential subjects related to this user to populate selectors
  if (user.role === UserRole.TRAVELER) {
    const travelerBookings = await prisma.booking.findMany({
      where: { traveler: { userId: user.id } },
      include: { wedding: { include: { hostCouple: { include: { user: true } } } } },
    });

    bookings = travelerBookings.map((b) => ({ id: b.id, title: `Booking #${b.id.substring(0, 8)} (${b.wedding.title})` }));
    weddings = travelerBookings.map((b) => ({ id: b.wedding.id, title: b.wedding.title }));

    // Subject is the host couple user
    const hosts = travelerBookings.map((b) => b.wedding.hostCouple.user).filter(Boolean);
    subjects = Array.from(new Map(hosts.map(h => [h.id, h])).values()).map((h) => ({
      id: h.id,
      name: h.name || h.email,
      role: "HOST",
    }));
  } else if (user.role === UserRole.COUPLE) {
    const coupleBookings = await prisma.booking.findMany({
      where: { wedding: { hostCouple: { userId: user.id } } },
      include: { traveler: { include: { user: true } }, wedding: true },
    });

    bookings = coupleBookings.map((b) => ({ id: b.id, title: `Booking #${b.id.substring(0, 8)} by ${b.traveler.fullName}` }));
    
    const hostedWedding = await prisma.wedding.findFirst({
      where: { hostCouple: { userId: user.id } }
    });
    if (hostedWedding) {
      weddings = [{ id: hostedWedding.id, title: hostedWedding.title }];
    }

    const travelers = coupleBookings.map((b) => b.traveler.user).filter(Boolean);
    subjects = Array.from(new Map(travelers.map(t => [t.id, t])).values()).map((t) => ({
      id: t.id,
      name: t.name || t.email,
      role: "TRAVELER",
    }));
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Emergency Warning */}
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-2xl text-red-950 text-xs space-y-2">
        <h4 className="font-bold text-sm text-red-900">🚨 IMMEDIATE PHYSICAL SAFETY WARNING</h4>
        <p className="leading-relaxed">
          If you or someone else is in immediate physical danger or requires medical assistance, please contact your local emergency services (e.g. 112, 911) immediately.
        </p>
        <p className="font-semibold">
          WeddingWithIndia is not an emergency response service and cannot dispatch local responders.
        </p>
      </div>

      <div className="space-y-2">
        <h1 className="font-display font-black text-2xl text-charcoal-900">Report a Safety or Trust Concern</h1>
        <p className="text-xs text-charcoal-500">
          Submit details regarding misrepresentation, harassment, booking disputes, or any conduct violations. Our Trust & Safety team will review and triage your claim immediately.
        </p>
      </div>

      <ClientReportForm bookings={bookings} weddings={weddings} subjects={subjects} />
    </div>
  );
}
