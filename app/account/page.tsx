"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Calendar, MapPin, CheckCircle2, Clock, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { formatCurrencyINR } from "@/lib/constants/financial-model";

interface GuestBooking {
  id: string;
  totalAmount: number;
  pricePerGuest: number;
  guestsCount: number;
  status: string;
  createdAt: string;
  wedding: {
    id: string;
    title: string;
    slug: string;
    location: string;
    date: string;
    mainImageUrl: string;
  };
}

export default function GuestAccountPage() {
  const [bookings, setBookings] = useState<GuestBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGuestBookings() {
      try {
        const res = await fetch("/api/account/bookings");
        const data = await res.json();
        if (res.ok) {
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error("Failed to load guest account bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGuestBookings();
  }, []);

  return (
    <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20 rounded-[2.5rem]">
      <div className="container-luxury max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-maroon-100/50 mb-2">
              <User size={12} />
              Traveler Guest Account
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
              My Wedding Reservations
            </h1>
          </div>

          <Link href="/weddings" className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5 shadow-xs">
            Browse More Celebrations <ArrowRight size={13} />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-charcoal-400 text-sm font-medium animate-pulse">
            Loading your reservations from database…
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-warm-200/60 rounded-3xl p-10 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center mx-auto">
              <Heart size={28} />
            </div>
            <h3 className="font-display font-bold text-xl text-charcoal-900">No Past Reservations Found</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              You haven&apos;t booked an authentic Indian wedding experience yet. Explore our verified verified celebrations to reserve your spot!
            </p>
            <div className="pt-2">
              <Link href="/weddings" className="btn btn-primary px-6 py-2.5 text-xs font-bold">
                Explore Weddings
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white border border-warm-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-warm-100 pb-4">
                  <div>
                    <span className="font-mono text-xs text-charcoal-400 font-bold block mb-1">Booking Ref: {b.id.slice(0, 8)}</span>
                    <h3 className="font-display font-bold text-xl text-charcoal-900">{b.wedding.title}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    <CheckCircle2 size={13} /> {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 relative h-36 rounded-2xl overflow-hidden border border-warm-200">
                    <Image src={b.wedding.mainImageUrl} alt={b.wedding.title} fill className="object-cover" />
                  </div>

                  <div className="md:col-span-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs text-charcoal-700">
                      <div>
                        <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest block mb-0.5">Location</span>
                        <span className="font-semibold flex items-center gap-1"><MapPin size={12} /> {b.wedding.location}</span>
                      </div>
                      <div>
                        <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest block mb-0.5">Wedding Date</span>
                        <span className="font-semibold flex items-center gap-1"><Calendar size={12} /> {new Date(b.wedding.date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest block mb-0.5">Guests Reserved</span>
                        <span className="font-bold text-charcoal-900">{b.guestsCount} Guest(s)</span>
                      </div>
                      <div>
                        <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest block mb-0.5">Total Amount Paid</span>
                        <span className="font-bold text-emerald-700 text-sm">{formatCurrencyINR(b.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Phase 4.3: Post-booking clarity sequence */}
                    <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200/80 space-y-2">
                      <span className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest block">Post-Booking Flow & Next Steps:</span>
                      <div className="grid grid-cols-3 gap-2 text-[0.6875rem] text-charcoal-600 font-medium">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 size={13} /> 1. Booking Confirmed
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                          <Clock size={13} /> 2. Pre-Event Briefing Sent
                        </div>
                        <div className="flex items-center gap-1.5 text-charcoal-400">
                          <ShieldCheck size={13} /> 3. Day-of Coordinator Contact
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  
    </div>);
}
