"use server";

import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";

export default async function EventsPage() {
  const user = await requireAuth();

  const traveler = await prisma.travelerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!traveler) {
    return (
      <div className="p-6 text-center text-charcoal-500">
        Traveler profile not found.
      </div>
    );
  }

  // Fetch traveler paid/confirmed bookings
  const bookings = await prisma.booking.findMany({
    where: {
      travelerId: traveler.id,
      status: {
        in: [
          BookingStatus.PAID,
          BookingStatus.READY_FOR_EVENT,
          BookingStatus.CHECKED_IN,
          BookingStatus.ATTENDED,
          BookingStatus.COMPLETED,
          BookingStatus.NO_SHOW,
        ],
      },
    },
    include: {
      wedding: true,
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal-900">
          My Weddings & Experiences
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Access your digital passes, view agendas, and submit preparation details for your booked weddings.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-warm-200 p-12 text-center rounded-3xl space-y-4">
          <Ticket className="mx-auto text-warm-300" size={48} />
          <h2 className="font-display font-bold text-lg text-charcoal-850">No Active Events</h2>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            Book passes for upcoming traditional Indian weddings on the marketplace to activate your event hub.
          </p>
          <Link
            href="/weddings"
            className="inline-block bg-maroon-850 hover:bg-maroon-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b) => {
            const date = new Date(b.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <div
                key={b.id}
                className="bg-white border border-warm-200 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.wedding.mainImageUrl}
                    alt={b.wedding.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5 space-y-3">
                    <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-maroon-50 text-maroon-800 px-2 py-0.5 rounded">
                      {b.status}
                    </span>
                    <h3 className="font-display font-bold text-base text-charcoal-900 line-clamp-1">
                      {b.wedding.title}
                    </h3>
                    <div className="space-y-1.5 text-xs text-charcoal-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-maroon-700" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-maroon-700" />
                        <span>{b.wedding.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-maroon-700" />
                        <span>{b.guestsCount} guests pass</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/dashboard/events/${b.id}`}
                    className="w-full text-center block bg-maroon-850 hover:bg-maroon-900 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                  >
                    Enter Event Hub →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
