"use client";

import React, { useState, useEffect } from "react";
import { searchWeddingsAction } from "@/lib/actions/discovery";
import {
  MapPin,
  Search,
  Filter,
  DollarSign,
  Users,
  Compass,
  Navigation,
  ZoomIn,
  ZoomOut,
  Locate,
  Info,
  Calendar,
  X,
  Map as MapIcon
} from "lucide-react";
import Link from "next/link";

interface WeddingMapItem {
  id: string;
  title: string;
  location: string;
  category: string;
  pricePerGuest: number;
  mainImageUrl: string;
  x: number; // Percentage coordinate on India map SVG (left)
  y: number; // Percentage coordinate on India map SVG (top)
}

export default function WeddingsMapDiscoveryPage() {
  const [weddings, setWeddings] = useState<WeddingMapItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedWedding, setSelectedWedding] = useState<WeddingMapItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [clusterMode, setClusterMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ x: number; y: number } | null>(null);

  // Load weddings locations
  const loadMapData = async () => {
    try {
      const res = await searchWeddingsAction({
        query: query || undefined,
        weddingStyle: selectedStyle || undefined,
      });

      // Map locations to approximate visual percentage coordinates on India map
      // Goa: x: 30%, y: 70%
      // Delhi/Punjab: x: 40%, y: 30%
      // Rajasthan: x: 30%, y: 40%
      // Kerala: x: 35%, y: 85%
      // Goa beach: x: 28%, y: 72%
      const items = res.weddings.map((w, index) => {
        let x = 45;
        let y = 45;
        const loc = w.location.toLowerCase();
        if (loc.includes("goa")) {
          x = 32 + (index % 3) * 1.5;
          y = 68 + (index % 2) * 1.5;
        } else if (loc.includes("punjab") || loc.includes("amritsar")) {
          x = 38;
          y = 22;
        } else if (loc.includes("rajasthan") || loc.includes("jaipur") || loc.includes("udaipur")) {
          x = 34;
          y = 38;
        } else if (loc.includes("kerala") || loc.includes("kochi")) {
          x = 37;
          y = 82;
        } else if (loc.includes("delhi")) {
          x = 42;
          y = 30;
        } else {
          // Default offset cluster positioning
          x = 50 + (index * 4) % 15;
          y = 40 + (index * 3) % 20;
        }

        return {
          id: w.id,
          title: w.title,
          location: w.location,
          category: w.category,
          pricePerGuest: w.pricePerGuest,
          mainImageUrl: w.mainImageUrl,
          x,
          y,
        };
      });

      setWeddings(items);
    } catch (err) {
      console.error("Failed to load map listings:", err);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [query, selectedStyle]);

  const handleLocateSelf = () => {
    // Simulate locator trigger
    setUserLocation({ x: 42, y: 30 }); // Delhi centroid
  };

  // Group markers closer than 5% distance if cluster mode is on
  const renderMarkers = () => {
    if (clusterMode) {
      // Basic cluster aggregation
      const clusters: { count: number; items: WeddingMapItem[]; cx: number; cy: number }[] = [];
      weddings.forEach((w) => {
        const matchingCluster = clusters.find(
          (c) => Math.abs(c.cx - w.x) < 6 && Math.abs(c.cy - w.y) < 6
        );

        if (matchingCluster) {
          matchingCluster.count++;
          matchingCluster.items.push(w);
        } else {
          clusters.push({
            count: 1,
            items: [w],
            cx: w.x,
            cy: w.y,
          });
        }
      });

      return clusters.map((c, index) => {
        if (c.count === 1) {
          const item = c.items[0];
          return (
            <button
              key={item.id}
              onClick={() => setSelectedWedding(item)}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer"
            >
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-maroon-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-maroon-800 border-2 border-white items-center justify-center">
                  <MapPin size={10} className="text-white" />
                </span>
              </span>
            </button>
          );
        }

        return (
          <button
            key={`cluster-${index}`}
            onClick={() => setSelectedWedding(c.items[0])}
            style={{ left: `${c.cx}%`, top: `${c.cy}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 bg-amber-500 text-charcoal-900 border-2 border-white font-extrabold text-[10px] w-7 h-7 rounded-full flex items-center justify-center shadow cursor-pointer animate-pulse"
          >
            {c.count}
          </button>
        );
      });
    }

    // Default markers render
    return weddings.map((w) => (
      <button
        key={w.id}
        onClick={() => setSelectedWedding(w)}
        style={{ left: `${w.x}%`, top: `${w.y}%` }}
        className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer"
      >
        <span className="relative flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-maroon-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-maroon-800 border-2 border-white items-center justify-center shadow-sm">
            <MapPin size={10} className="text-white" />
          </span>
        </span>
      </button>
    ));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-warm-150 pb-4">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
            <MapIcon size={24} className="text-maroon-700" />
            Heritage Map Discovery
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Discover and locate cultural wedding celebrations across geographic clusters.
          </p>
        </div>

        {/* Back Link */}
        <Link
          href="/weddings"
          className="text-xs font-bold uppercase tracking-wider text-charcoal-700 border border-warm-250 bg-white hover:bg-warm-50 px-4 py-2.5 rounded-xl self-start transition-colors"
        >
          View Listings Directory
        </Link>
      </div>

      {/* Control filters bar */}
      <div className="bg-white border border-warm-200/50 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 text-charcoal-400" size={14} />
          <input
            type="text"
            placeholder="Search destination, style, religion..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-luxury text-xs pl-8 py-1.5 h-9 bg-warm-50/50"
          />
        </div>

        {/* Style selection */}
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="input-luxury text-xs py-1 h-9 bg-white w-full md:w-48 border border-warm-250 text-charcoal-700 cursor-pointer select-reset"
        >
          <option value="">All Wedding Styles</option>
          <option value="Beach">Beach Celebration</option>
          <option value="Royal">Royal Palace</option>
          <option value="Temple">Traditional Temple</option>
          <option value="Luxury">Luxury Resort</option>
          <option value="Mountain">Mountain View</option>
        </select>

        {/* Cluster Toggle */}
        <button
          onClick={() => setClusterMode(!clusterMode)}
          className={`text-xs font-bold uppercase tracking-wider px-4 py-2 h-9 rounded-xl border transition-all cursor-pointer w-full md:w-auto ${
            clusterMode
              ? "bg-amber-50 border-amber-150 text-amber-700"
              : "bg-white border-warm-250 text-charcoal-600 hover:bg-warm-50"
          }`}
        >
          {clusterMode ? "Cluster Mode: On" : "Enable Clusters"}
        </button>
      </div>

      {/* Main Map workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map view panel */}
        <div className="lg:col-span-8 bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm relative overflow-hidden h-[500px]">
          {/* Map Toolbox controls */}
          <div className="absolute right-4 top-4 bg-white/95 backdrop-blur border border-warm-200/70 p-2.5 rounded-2xl shadow flex flex-col gap-2 z-20">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              title="Zoom In"
              className="p-1.5 rounded-lg border border-warm-200 hover:bg-warm-50 text-charcoal-700"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
              title="Zoom Out"
              className="p-1.5 rounded-lg border border-warm-200 hover:bg-warm-50 text-charcoal-700"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={handleLocateSelf}
              title="Locate nearest weddings"
              className="p-1.5 rounded-lg border border-warm-200 hover:bg-warm-50 text-charcoal-700"
            >
              <Locate size={14} />
            </button>
          </div>

          {/* Interactive Vector Map Wrapper */}
          <div
            className="w-full h-full relative transition-all duration-300 select-none overflow-hidden rounded-xl bg-sky-50/20 border border-warm-150"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
          >
            {/* Visual SVG representing Indian peninsula outlines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10"
              viewBox="0 0 100 100"
              fill="none"
              stroke="#6b1026"
              strokeWidth="0.4"
            >
              <path d="M40 10 L45 8 L48 10 L52 14 L50 18 L55 20 L58 18 L60 22 L62 26 L60 30 L65 32 L60 36 L63 40 L58 45 L52 50 L48 55 L45 60 L42 66 L40 72 L38 80 L39 88 L37 92 L35 90 L34 84 L32 78 L30 70 L28 65 L25 60 L28 55 L30 48 L28 42 L32 38 L35 32 L34 26 L36 20 L38 14 Z" />
            </svg>

            {/* Glowing pulses for listings markers */}
            {renderMarkers()}

            {/* User self indicator */}
            {userLocation && (
              <div
                style={{ left: `${userLocation.x}%`, top: `${userLocation.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex h-4 w-4"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-600 border border-white"></span>
              </div>
            )}

            {/* Region tags */}
            <span className="absolute left-[38%] top-[25%] text-[9px] font-bold text-charcoal-400 uppercase tracking-widest pointer-events-none">Punjab</span>
            <span className="absolute left-[32%] top-[40%] text-[9px] font-bold text-charcoal-400 uppercase tracking-widest pointer-events-none">Rajasthan</span>
            <span className="absolute left-[33%] top-[70%] text-[9px] font-bold text-charcoal-400 uppercase tracking-widest pointer-events-none">Goa</span>
            <span className="absolute left-[38%] top-[82%] text-[9px] font-bold text-charcoal-400 uppercase tracking-widest pointer-events-none">Kerala</span>
          </div>
        </div>

        {/* Selected popup drawer details */}
        <div className="lg:col-span-4 bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between min-h-[350px]">
          {!selectedWedding ? (
            <div className="text-center p-8 space-y-3 my-auto">
              <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mx-auto text-charcoal-600">
                <Compass size={20} />
              </div>
              <h4 className="font-display font-bold text-sm text-charcoal-900">Select Marker Point</h4>
              <p className="text-charcoal-500 text-xs leading-relaxed font-medium">
                Click on any map marker or cluster count to view wedding celebration summaries, prices, and locations.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full">
              <div className="space-y-4">
                {/* Header image */}
                <div className="h-40 rounded-2xl overflow-hidden bg-warm-200 relative border border-warm-150">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedWedding.mainImageUrl}
                    alt={selectedWedding.title}
                    className="object-cover w-full h-full"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-warm-200 text-maroon-800 shadow">
                    {selectedWedding.category}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <h3 className="font-display font-bold text-charcoal-950 text-sm leading-snug">
                    {selectedWedding.title}
                  </h3>
                  <p className="text-charcoal-500 font-semibold flex items-center gap-1">
                    <MapPin size={12} className="text-maroon-600" />
                    {selectedWedding.location}
                  </p>
                  <p className="text-charcoal-900 font-black text-sm pt-1">
                    ${selectedWedding.pricePerGuest.toLocaleString()} <span className="text-[10px] font-medium text-charcoal-400">per guest pass</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-4 border-t border-warm-150">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    selectedWedding.location
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-charcoal-900 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-charcoal-800 transition-colors shadow-sm cursor-pointer"
                >
                  <Navigation size={13} />
                  Get Directions link
                </a>

                <Link
                  href={`/weddings/${selectedWedding.title.toLowerCase().replace(/ /g, "-")}`}
                  className="w-full inline-flex items-center justify-center border border-warm-250 text-charcoal-700 bg-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-warm-50 transition-colors"
                >
                  View Details Page
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
