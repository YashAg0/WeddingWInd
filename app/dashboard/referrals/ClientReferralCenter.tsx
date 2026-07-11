"use client";

import React, { useState, useEffect } from "react";
import { Copy, QrCode, Share2, Sparkles } from "lucide-react";

interface ClientReferralCenterProps {
  referralCode: string;
}

export default function ClientReferralCenter({ referralCode }: ClientReferralCenterProps) {
  const [origin, setOrigin] = useState("https://weddingwithindia.com");
  const [refType, setRefType] = useState<"TRAVELER" | "COUPLE">("TRAVELER");
  const [campaign, setCampaign] = useState("");
  const [source, setSource] = useState("referral");
  const [medium, setMedium] = useState("agent");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const path = refType === "COUPLE" ? "/for-couples" : "/";
  const queryParams = new URLSearchParams({
    ref: referralCode,
    utm_source: source || "referral",
    utm_medium: medium || "agent",
  });

  if (campaign.trim()) {
    queryParams.set("utm_campaign", campaign.trim());
  }

  const generatedUrl = `${origin}${path}?${queryParams.toString()}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    generatedUrl
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Link Customizer */}
      <div className="lg:col-span-2 bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-6">
        <h2 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
          <Sparkles className="text-maroon-700" size={18} />
          Customize Referral Links
        </h2>

        <div className="space-y-4 text-xs">
          {/* Target Audience */}
          <div className="space-y-1.5">
            <span className="font-semibold text-charcoal-700">Target Audience</span>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRefType("TRAVELER")}
                className={`py-3 px-4 rounded-xl border text-center font-bold transition-all ${
                  refType === "TRAVELER"
                    ? "border-maroon-800 bg-maroon-50/50 text-maroon-850"
                    : "border-warm-200 text-charcoal-600 hover:bg-warm-50/40"
                }`}
              >
                Foreign Travelers
              </button>
              <button
                type="button"
                onClick={() => setRefType("COUPLE")}
                className={`py-3 px-4 rounded-xl border text-center font-bold transition-all ${
                  refType === "COUPLE"
                    ? "border-maroon-800 bg-maroon-50/50 text-maroon-850"
                    : "border-warm-200 text-charcoal-600 hover:bg-warm-50/40"
                }`}
              >
                Indian Host Couples
              </button>
            </div>
          </div>

          {/* UTM Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="ref-source" className="font-semibold text-charcoal-700">UTM Source</label>
              <input
                id="ref-source"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="referral"
                className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none focus:border-maroon-800"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ref-medium" className="font-semibold text-charcoal-700">UTM Medium</label>
              <input
                id="ref-medium"
                type="text"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="agent"
                className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none focus:border-maroon-800"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ref-campaign" className="font-semibold text-charcoal-700">Campaign Name</label>
              <input
                id="ref-campaign"
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="jaipur_college"
                className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none focus:border-maroon-800"
              />
            </div>
          </div>

          {/* Generated URL Box */}
          <div className="space-y-1.5 pt-4">
            <label htmlFor="generated-url" className="font-semibold text-charcoal-700">Your Referral URL</label>
            <div className="flex gap-2">
              <input
                id="generated-url"
                type="text"
                readOnly
                value={generatedUrl}
                className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-100/50 text-charcoal-700 text-[10px] select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl px-4 py-2 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Copy size={14} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Presentation */}
      <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-between text-center min-h-[300px]">
        <div className="space-y-2 w-full">
          <h2 className="font-display font-bold text-base text-charcoal-900 flex items-center justify-center gap-1.5">
            <QrCode className="text-maroon-700" size={16} />
            Attribution QR Code
          </h2>
          <p className="text-[10px] text-charcoal-500">
            Scan to attribute users directly on signups.
          </p>
        </div>

        {/* QR Code Image */}
        <div className="my-4 w-40 h-40 border border-warm-100 rounded-2xl p-2 bg-white flex items-center justify-center shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCodeUrl} alt="Attribution QR Code" className="w-full h-full object-contain" />
        </div>

        <a
          href={qrCodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border border-warm-200 hover:bg-warm-50/50 text-charcoal-800 rounded-xl py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Share2 size={13} />
          View Full QR Image
        </a>
      </div>
    </div>
  );
}
