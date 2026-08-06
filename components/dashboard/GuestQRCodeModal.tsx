"use client";

import React from "react";
import { X, Printer, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GuestQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    weddingTitle: string;
    guestName: string;
    guestsCount: number;
    date: string;
    location: string;
    status: string;
  };
}

export default function GuestQRCodeModal({ isOpen, onClose, booking }: GuestQRCodeModalProps) {
  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    JSON.stringify({
      bookingId: booking.id,
      guest: booking.guestName,
      guestsCount: booking.guestsCount,
      event: booking.weddingTitle,
      status: booking.status,
    })
  )}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-warm-200 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-charcoal-900"
        >
          {/* Top Decorative Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-maroon-50 text-maroon-600 flex items-center justify-center">
                <ShieldCheck size={18} />
              </span>
              <div>
                <h3 className="font-display font-bold text-base text-charcoal-900">
                  Official Guest Access Pass
                </h3>
                <p className="text-[0.6875rem] text-charcoal-400 font-medium">
                  Verified Gate Security Pass
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-warm-100 text-charcoal-500 hover:text-charcoal-900 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* QR Code Container */}
          <div className="bg-gradient-to-b from-warm-50 to-warm-100/60 p-6 rounded-3xl border border-warm-200/80 text-center space-y-4">
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-warm-200 shadow-inner flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="Guest QR Code Pass" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1">
              <span className="text-[0.625rem] font-mono font-bold text-charcoal-400 uppercase tracking-widest block">
                PASS CODE: {booking.id.toUpperCase()}
              </span>
              <span className="inline-block text-[0.6875rem] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {booking.status}
              </span>
            </div>
          </div>

          {/* Event & Guest Metadata */}
          <div className="space-y-2 text-xs border-t border-warm-150 pt-4">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Honored Guest:</span>
              <span className="font-bold text-charcoal-900">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Guests Included:</span>
              <span className="font-bold text-charcoal-900">{booking.guestsCount} Person(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Celebration:</span>
              <span className="font-bold text-maroon-700 truncate max-w-[200px]">{booking.weddingTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Venue / Location:</span>
              <span className="font-semibold text-charcoal-800">{booking.location}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex-1 btn btn-outline btn-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer size={14} /> Print Pass
            </button>
            <a
              href={`/api/invoice/${booking.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 btn btn-primary btn-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              View Invoice
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
