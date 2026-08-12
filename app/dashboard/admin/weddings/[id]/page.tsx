import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Star,
  Zap,
  Building2,
  ShieldCheck,
  Ticket,
  ExternalLink,
  Edit2,
  Tag,
  Clock,
  Heart
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminWeddingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole([UserRole.ADMIN]);
  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({
    where: { id },
    include: {
      hostCouple: {
        include: {
          user: {
            include: {
              verification: true,
            },
          },
        },
      },
      gallery: true,
      events: true,
      traditions: true,
      badges: true,
      bookings: {
        include: {
          traveler: { include: { user: true } },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!wedding) {
    notFound();
  }

  const hostUser = wedding.hostCouple?.user;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Back Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/admin/weddings"
          className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-600 hover:text-[var(--color-brand-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Weddings Directory
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/admin/weddings?action=edit&id=${wedding.id}`}
            className="btn btn-secondary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
          >
            <Edit2 size={14} />
            Edit Wedding
          </Link>
          {wedding.status === "PUBLISHED" && (
            <Link
              href={`/weddings/${wedding.slug}`}
              target="_blank"
              className="btn btn-primary text-xs font-bold py-2 px-4 flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              View Live Marketplace Page
            </Link>
          )}
        </div>
      </div>

      {/* Main Header Info Card */}
      <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[0.625rem] font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
                ID: {wedding.id}
              </span>
              {wedding.isDemo && (
                <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[0.5625rem] font-bold uppercase px-2 py-0.5 rounded-full">
                  Demo Seed
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
              {wedding.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {wedding.featured && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={12} className="fill-amber-500 text-amber-500" /> Featured
              </span>
            )}
            {wedding.sponsored && (
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1">
                <Zap size={12} className="fill-white text-white" /> Sponsored
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                wedding.status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-warm-100 text-charcoal-700 border-warm-300"
              }`}
            >
              {wedding.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-charcoal-400 font-bold block uppercase text-[0.625rem]">Location & Venue</span>
            <span className="font-semibold text-charcoal-800">{wedding.location}</span>
          </div>
          <div>
            <span className="text-charcoal-400 font-bold block uppercase text-[0.625rem]">Category</span>
            <span className="font-semibold text-charcoal-800">{wedding.category}</span>
          </div>
          <div>
            <span className="text-charcoal-400 font-bold block uppercase text-[0.625rem]">Date</span>
            <span className="font-semibold text-charcoal-800">{formatDate(wedding.date)}</span>
          </div>
          <div>
            <span className="text-charcoal-400 font-bold block uppercase text-[0.625rem]">Price / Guest</span>
            <span className="font-semibold text-charcoal-800">₹{wedding.pricePerGuest?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Details & Events */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Photo & Description */}
          <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3">
              Celebration Details & Overview
            </h3>

            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-warm-200 border border-warm-200">
              <Image
                src={wedding.mainImageUrl}
                alt={wedding.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-warm-50/60 border border-warm-200/60 p-5 rounded-2xl space-y-2">
              <h4 className="font-bold text-xs text-charcoal-900 uppercase tracking-wider">
                Full Description
              </h4>
              <p className="text-xs text-charcoal-600 leading-relaxed italic">
                "{wedding.description}"
              </p>
            </div>
          </div>

          {/* Scheduled Events & Traditions */}
          <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Calendar size={18} className="text-maroon-700" />
              Event Schedule ({wedding.events.length}) & Cultural Traditions ({wedding.traditions.length})
            </h3>

            {wedding.events.length > 0 && (
              <div className="space-y-3">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">Scheduled Events</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wedding.events.map((evt) => (
                    <div key={evt.id} className="p-3.5 bg-warm-50 border border-warm-200 rounded-2xl text-xs space-y-1">
                      <span className="font-bold text-charcoal-900 block">{evt.name}</span>
                      <span className="text-charcoal-500 text-[0.6875rem] block">{evt.location}</span>
                      <span className="text-emerald-700 font-bold text-[0.625rem]">{evt.startTime} - {evt.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wedding.traditions.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[0.625rem] font-bold uppercase tracking-wider text-charcoal-400 block">Traditions & Rituals</span>
                <div className="space-y-2">
                  {wedding.traditions.map((trad) => (
                    <div key={trad.id} className="p-3 bg-warm-50 border border-warm-200 rounded-2xl text-xs">
                      <span className="font-bold text-charcoal-900 block">{trad.name}</span>
                      <p className="text-charcoal-600 text-[0.6875rem] mt-0.5">{trad.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Host Details & Bookings */}
        <div className="space-y-6">
          {/* Host Family Card */}
          <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Building2 size={16} className="text-amber-700" />
              Host Family Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-charcoal-400 font-bold uppercase text-[0.625rem] block">Contact Name</span>
                <span className="font-bold text-charcoal-900">{hostUser?.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-charcoal-400 font-bold uppercase text-[0.625rem] block">Email</span>
                <span className="font-mono text-charcoal-800">{hostUser?.email || "N/A"}</span>
              </div>
              <div>
                <span className="text-charcoal-400 font-bold uppercase text-[0.625rem] block">Verification Status</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {hostUser?.verification?.status || "NOT_SUBMITTED"}
                </span>
              </div>
            </div>
          </div>

          {/* Bookings Summary */}
          <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Ticket size={16} className="text-emerald-700" />
              Bookings & Reservations ({wedding.bookings.length})
            </h3>

            {wedding.bookings.length === 0 ? (
              <p className="text-xs text-charcoal-400 font-semibold">No bookings recorded for this celebration yet.</p>
            ) : (
              <div className="space-y-3">
                {wedding.bookings.map((b) => (
                  <div key={b.id} className="p-3 bg-warm-50 border border-warm-200 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-charcoal-900">{b.traveler?.fullName}</span>
                      <span className="font-bold text-emerald-700">₹{b.totalAmount.toLocaleString()}</span>
                    </div>
                    <span className="text-charcoal-400 text-[0.625rem] block">{b.guestsCount} guests · Status: {b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
