"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Maximize2, Ticket } from "lucide-react";
import QRFullscreenModal from "./QRFullscreenModal";

interface ClientQRSectionProps {
  qrCodeUrl: string;
  passCode: string;
  scanCount: number;
  passStatus: string;
  eventTitle: string;
}

export default function ClientQRSection({
  qrCodeUrl,
  passCode,
  scanCount,
  passStatus,
  eventTitle,
}: ClientQRSectionProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm text-center flex flex-col items-center space-y-4">
        <h2 className="font-display font-bold text-sm text-charcoal-900 flex items-center gap-1.5 justify-center">
          <Ticket size={16} className="text-maroon-700" />
          Digital Guest Pass
        </h2>

        {/* Tappable QR container - min 44px, triggers fullscreen */}
        <button
          onClick={() => setFullscreen(true)}
          className="group relative p-3 border border-warm-100 rounded-2xl bg-white shadow-inner my-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-850 min-w-[44px] min-h-[44px]"
          aria-label="Open QR code fullscreen"
          title="Tap to expand QR code"
        >
          <Image
            src={qrCodeUrl}
            alt="Check-in QR Pass"
            width={176}
            height={176}
            className="w-44 h-44"
            unoptimized
          />
          {/* Expand overlay hint */}
          <span className="absolute inset-0 rounded-2xl flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none">
            <span className="bg-black/60 text-white rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1">
              <Maximize2 size={10} />
              Expand
            </span>
          </span>
        </button>

        {/* Tap to enlarge hint for mobile */}
        <p className="text-[10px] text-maroon-700 font-semibold sm:hidden">
          Tap QR to open fullscreen
        </p>

        <div className="text-xs space-y-1">
          <div className="font-black text-charcoal-850 text-sm">
            Pass Code: {passCode || "N/A"}
          </div>
          <div className="text-[10px] text-charcoal-500">
            Scan count: {scanCount} &bull; Status:{" "}
            <span className="font-bold text-maroon-800">{passStatus}</span>
          </div>
        </div>

        <p className="text-[10px] text-charcoal-400">
          Present this code at the venue gateway entry check-in counter.
        </p>
      </div>

      <QRFullscreenModal
        isOpen={fullscreen}
        onClose={() => setFullscreen(false)}
        qrCodeUrl={qrCodeUrl}
        passCode={passCode}
        eventTitle={eventTitle}
      />
    </>
  );
}