"use client";

import React, { useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  passCode: string;
  eventTitle: string;
}

export default function QRFullscreenModal({
  isOpen,
  onClose,
  qrCodeUrl,
  passCode,
  eventTitle,
}: QRFullscreenModalProps) {
  // Lock body scroll and close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
          style={{ WebkitOverflowScrolling: "touch" }}
          aria-modal="true"
          role="dialog"
          aria-label="QR Code fullscreen"
        >
          {/* Close button — 44px touch target, top-right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-black/8 hover:bg-black/15 text-black transition-colors"
            aria-label="Close fullscreen QR"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          {/* Content */}
          <div className="flex flex-col items-center gap-6 px-6 w-full max-w-sm">
            {/* Header */}
            <div className="flex items-center gap-2 text-black">
              <ShieldCheck size={20} className="text-emerald-700" />
              <span className="font-display font-bold text-base text-black">
                Official Guest Pass
              </span>
            </div>

            {/* QR Code — max size, white bg, black border for contrast */}
            <div className="w-full aspect-square max-w-[300px] bg-white border-2 border-black/10 rounded-2xl p-4 shadow-sm flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="Check-in QR code"
                className="w-full h-full object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            {/* Pass code */}
            <div className="text-center space-y-1">
              <p className="text-[11px] font-mono font-bold text-black/50 uppercase tracking-widest">
                PASS CODE
              </p>
              <p className="font-mono font-black text-lg text-black tracking-wider">
                {passCode.toUpperCase()}
              </p>
            </div>

            {/* Event name */}
            <p className="text-center text-sm font-semibold text-black/70 line-clamp-2 max-w-xs">
              {eventTitle}
            </p>

            {/* Instruction */}
            <p className="text-center text-xs text-black/40 max-w-[220px]">
              Present this QR at the venue gateway entry check-in counter.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
