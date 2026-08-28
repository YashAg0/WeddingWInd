import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGuestPassAction } from "@/lib/actions/event-operations";
import QRCode from "qrcode";
import { Heart, ArrowLeft } from "lucide-react";
import ClientEventHubForm from "./ClientEventHubForm";
import ClientQRSection from "@/components/dashboard/ClientQRSection";

interface EventHubPageProps {
  params: Promise<{ bookingId: string }>;
}

function calculateDaysToWedding(targetDate: string | Date): number {
  return Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export const dynamic = "force-dynamic";

export default async function EventHubDetailPage({ params }: EventHubPageProps) {
  const user = await requireAuth();
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      wedding: {
        include: {
          hostCouple: { include: { user: true } },
          itinerary: { orderBy: { sortOrder: "asc" } },
          announcements: { orderBy: { publishedAt: "desc" } },
          contacts: { orderBy: { sortOrder: "asc" } },
        },
      },
      traveler: { include: { user: true } },
      preparations: true,
      emergencies: true,
      travelDetails: true,
    },
  });

  if (!booking || booking.traveler.user.id !== user.id) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        Unauthorized access.
      </div>
    );
  }

  // Fetch or issue guest pass
  const passData = await getGuestPassAction(bookingId);
  let qrCodeUrl = "";
  if (passData?.rawToken) {
    const origin = process.env.NEXTAUTH_URL || "https://weddingwithindia.com";
    qrCodeUrl = await QRCode.toDataURL(`${origin}/dashboard/check-in?token=${passData.rawToken}`);
  }

  // Count checklist values
  const prep = booking.preparations || {
    emergencyContactCompleted: false,
    dressCodeAcknowledged: false,
    culturalGuideViewed: false,
    itineraryViewed: false,
    venueInstructionsViewed: false,
    travelDetailsCompleted: false,
  };

  const tasks = [
    { label: "Emergency Contact (Required)", done: prep.emergencyContactCompleted, type: "required" },
    { label: "Dress Code Acknowledged (Required)", done: prep.dressCodeAcknowledged, type: "required" },
    { label: "Cultural Guide Viewed", done: prep.culturalGuideViewed, type: "recommended" },
    { label: "Itinerary Timeline Viewed", done: prep.itineraryViewed, type: "recommended" },
    { label: "Venue Directions Checked", done: prep.venueInstructionsViewed, type: "recommended" },
    { label: "Travel Info Provided", done: prep.travelDetailsCompleted, type: "optional" },
  ];

  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((doneCount / totalCount) * 100);

  const daysToWedding = calculateDaysToWedding(booking.wedding.date);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Back navigation */}
      <div>
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1 text-xs font-bold text-maroon-850 hover:underline"
        >
          <ArrowLeft size={14} /> Back to My Weddings
        </Link>
      </div>

      {/* Hero section */}
      <div className="bg-gradient-brand text-white p-8 rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Heart size={300} />
        </div>
        <div className="relative space-y-4 max-w-2xl">
          <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            {booking.status}
          </span>
          <h1 className="font-display font-black text-2xl md:text-3xl leading-tight">
            {booking.wedding.title}
          </h1>
          <p className="text-xs text-white/90">
            Hosted by {booking.wedding.hostCouple.user.name} • Booking ID: {booking.id.substring(0, 8)}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20 text-xs">
            <div>
              <span className="text-white/60 block">Event Date</span>
              <span className="font-bold">{new Date(booking.wedding.date).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-white/60 block">Location</span>
              <span className="font-bold">{booking.wedding.location}</span>
            </div>
            <div>
              <span className="text-white/60 block">Guest Passes</span>
              <span className="font-bold">{booking.guestsCount} Attendee(s)</span>
            </div>
            <div>
              <span className="text-white/60 block">Countdown</span>
              <span className="font-bold">
                {daysToWedding > 0 ? `${daysToWedding} days left` : "Happening now / ended"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Post-payment check-in QR pass */}
        <div className="space-y-6">
          {qrCodeUrl ? (
            <ClientQRSection
              qrCodeUrl={qrCodeUrl}
              passCode={passData?.pass.passCode || ""}
              scanCount={passData?.pass.scanCount || 0}
              passStatus={passData?.pass.status || ""}
              eventTitle={booking.wedding.title}
            />
          ) : (
            <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm text-center flex flex-col items-center space-y-4">
              <div className="p-6 bg-warm-50 border border-warm-200 rounded-2xl text-xs text-charcoal-500">
                Generating entry pass...
              </div>
            </div>
          )}

          {/* Contact coordinates */}
          {booking.wedding.contacts.length > 0 && (
            <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-display font-bold text-sm text-charcoal-900">
                Help & Operational Contacts
              </h3>
              <div className="space-y-3">
                {booking.wedding.contacts.map((c) => (
                  <div key={c.id} className="text-xs border-b border-warm-50 pb-2 last:border-0 last:pb-0">
                    <div className="font-bold text-charcoal-800">{c.name}</div>
                    <div className="text-[10px] text-charcoal-500">{c.role}</div>
                    <div className="flex gap-4 mt-1 font-semibold text-maroon-800 text-[10px]">
                      {c.phone && <a href={`tel:${c.phone}`} className="hover:underline">Call</a>}
                      {c.whatsapp && <a href={`https://wa.me/${c.whatsapp}`} className="hover:underline">WhatsApp</a>}
                      {c.email && <a href={`mailto:${c.email}`} className="hover:underline">Email</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic client checkoff forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress bar */}
          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-display font-bold text-charcoal-900">Guest Readiness Checklist</span>
              <span className="font-black text-maroon-800">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-warm-100 rounded-full h-2">
              <div
                className="bg-maroon-850 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] pt-2">
              {tasks.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded-xl flex items-center justify-between ${
                    t.done
                      ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                      : t.type === "required"
                      ? "bg-rose-50/30 border-rose-200 text-rose-900"
                      : "bg-warm-50/30 border-warm-200 text-charcoal-600"
                  }`}
                >
                  <span className="font-semibold">{t.label}</span>
                  <span className="font-black">{t.done ? "✓" : "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive forms wrapper */}
          <ClientEventHubForm
            bookingId={bookingId}
            initialEmergency={(booking.emergencies as any) ?? null}
            initialTravel={booking.travelDetails ? {
              arrivalDate: booking.travelDetails.arrivalDate.toISOString().substring(0, 16),
              departureDate: booking.travelDetails.departureDate.toISOString().substring(0, 16),
              arrivalCity: booking.travelDetails.arrivalCity,
              flightNumber: booking.travelDetails.flightNumber,
              hotelName: booking.travelDetails.hotelName,
              transportRequired: booking.travelDetails.transportRequired,
              dietaryRequirements: booking.travelDetails.dietaryRequirements,
              accessibilityRequirements: booking.travelDetails.accessibilityRequirements,
            } : null}
            preparations={{
              culturalGuideViewed: prep.culturalGuideViewed,
              dressCodeAcknowledged: prep.dressCodeAcknowledged,
              itineraryViewed: prep.itineraryViewed,
              venueInstructionsViewed: prep.venueInstructionsViewed,
            }}
            itinerary={booking.wedding.itinerary}
            announcements={booking.wedding.announcements}
          />
        </div>
      </div>
    </div>
  );
}
