"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  saveEmergencyContactAction,
  saveTravelDetailsAction,
  updateTravelerPreparationAction
} from "@/lib/actions/event-operations";
import { Calendar, MapPin, AlertCircle, FileText, Compass, Send } from "lucide-react";

interface EmergencyContactData {
  name: string;
  relationship: string;
  phone: string;
  countryCode: string;
  email?: string | null;
}

interface TravelDetailData {
  arrivalDate: string;
  departureDate: string;
  arrivalCity: string;
  flightNumber?: string | null;
  hotelName?: string | null;
  transportRequired: boolean;
  dietaryRequirements?: string | null;
  accessibilityRequirements?: string | null;
}

interface ClientEventHubFormProps {
  bookingId: string;
  initialEmergency: EmergencyContactData | null;
  initialTravel: TravelDetailData | null;
  preparations: {
    culturalGuideViewed: boolean;
    dressCodeAcknowledged: boolean;
    itineraryViewed: boolean;
    venueInstructionsViewed: boolean;
  };
  itinerary: Array<{
    id: string;
    title: string;
    description: string | null;
    eventType: string;
    startAt: Date;
    endAt: Date;
    venueName: string;
    venueAddress: string;
    dressCode: string | null;
    culturalNotes: string | null;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    message: string;
    priority: string;
    publishedAt: Date;
  }>;
}

export default function ClientEventHubForm({
  bookingId,
  initialEmergency,
  initialTravel,
  preparations,
  itinerary,
  announcements,
}: ClientEventHubFormProps) {
  const [activeTab, setActiveTab] = useState<"preparation" | "itinerary" | "travel" | "announcements">("preparation");
  
  // Emergency Form State
  const [emergencyName, setEmergencyName] = useState(initialEmergency?.name || "");
  const [relationship, setRelationship] = useState(initialEmergency?.relationship || "");
  const [phone, setPhone] = useState(initialEmergency?.phone || "");
  const [countryCode, setCountryCode] = useState(initialEmergency?.countryCode || "+1");
  const [email, setEmail] = useState(initialEmergency?.email || "");

  // Travel Form State
  const [arrivalDate, setArrivalDate] = useState(initialTravel?.arrivalDate ? new Date(initialTravel.arrivalDate).toISOString().substring(0, 16) : "");
  const [departureDate, setDepartureDate] = useState(initialTravel?.departureDate ? new Date(initialTravel.departureDate).toISOString().substring(0, 16) : "");
  const [arrivalCity, setArrivalCity] = useState(initialTravel?.arrivalCity || "");
  const [flightNumber, setFlightNumber] = useState(initialTravel?.flightNumber || "");
  const [hotelName, setHotelName] = useState(initialTravel?.hotelName || "");
  const [transportRequired, setTransportRequired] = useState(initialTravel?.transportRequired || false);
  const [dietary, setDietary] = useState(initialTravel?.dietaryRequirements || "");
  const [accessibility, setAccessibility] = useState(initialTravel?.accessibilityRequirements || "");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpdatePrep = async (key: "culturalGuideViewed" | "dressCodeAcknowledged" | "venueInstructionsViewed" | "itineraryViewed", val: boolean) => {
    try {
      await updateTravelerPreparationAction(bookingId, { [key]: val });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      await saveEmergencyContactAction({
        bookingId,
        name: emergencyName,
        relationship,
        phone,
        countryCode,
        email: email || null,
      });
      toast.success("Emergency contact saved successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTravel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      await saveTravelDetailsAction({
        bookingId,
        arrivalDate: arrivalDate,
        departureDate: departureDate,
        arrivalCity,
        flightNumber: flightNumber || null,
        hotelName: hotelName || null,
        transportRequired,
        dietaryRequirements: dietary || null,
        accessibilityRequirements: accessibility || null,
        medicalNotes: null, // shield sensitive parameters
      });
      toast.success("Travel details saved successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden text-xs">
      {/* Tabs list */}
      <div className="flex border-b border-warm-100 bg-warm-50/30 overflow-x-auto">
        {(["preparation", "itinerary", "travel", "announcements"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setSuccessMsg("");
            }}
            className={`px-5 py-3 font-bold border-b-2 text-center whitespace-nowrap transition-all ${
              activeTab === tab
                ? "border-maroon-850 text-maroon-850 bg-white"
                : "border-transparent text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            {tab === "preparation" && "1. Preparation Checks"}
            {tab === "itinerary" && "2. Itinerary Timeline"}
            {tab === "travel" && "3. Travel Details"}
            {tab === "announcements" && `4. Announcements (${announcements.length})`}
          </button>
        ))}
      </div>

      <div className="p-6">
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold">
            {successMsg}
          </div>
        )}

        {/* 1. Preparation checklist */}
        {activeTab === "preparation" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-sm text-charcoal-900 mb-1">
                Acknowledge Preparation Items
              </h3>
              <p className="text-[10px] text-charcoal-500">
                Please review the guidelines below and check them off to complete your booking check-in readiness.
              </p>
            </div>

            <div className="space-y-4">
              {/* Cultural guide check */}
              <div className="border border-warm-100 p-4 rounded-2xl space-y-3 bg-warm-50/20">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-charcoal-850">Read Traditional Indian Etiquette Guidelines</h4>
                    <p className="text-[10px] text-charcoal-500 mt-1">
                      Understand removing shoes, temple etiquette, wedding gift rituals, and traditional sangeet participations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdatePrep("culturalGuideViewed", !preparations.culturalGuideViewed)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                      preparations.culturalGuideViewed
                        ? "bg-emerald-800 text-white"
                        : "bg-maroon-850 text-white"
                    }`}
                  >
                    {preparations.culturalGuideViewed ? "Completed ✓" : "Mark Read"}
                  </button>
                </div>
              </div>

              {/* Dress code check */}
              <div className="border border-warm-100 p-4 rounded-2xl space-y-3 bg-warm-50/20">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-charcoal-850">Confirm Wedding Dress Expectations (Required)</h4>
                    <p className="text-[10px] text-charcoal-500 mt-1">
                      Check your dress choices. Ensure you avoid wearing white (mourning color) or black (inauspicious color).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdatePrep("dressCodeAcknowledged", !preparations.dressCodeAcknowledged)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                      preparations.dressCodeAcknowledged
                        ? "bg-emerald-800 text-white"
                        : "bg-maroon-850 text-white"
                    }`}
                  >
                    {preparations.dressCodeAcknowledged ? "Acknowledged ✓" : "Acknowledge"}
                  </button>
                </div>
              </div>

              {/* Venue instructions check */}
              <div className="border border-warm-100 p-4 rounded-2xl space-y-3 bg-warm-50/20">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-charcoal-850">Review Venue Entrance Directions</h4>
                    <p className="text-[10px] text-charcoal-500 mt-1">
                      Acknowledge arrival gates, timings, transport bus meetups, and local contact numbers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdatePrep("venueInstructionsViewed", !preparations.venueInstructionsViewed)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                      preparations.venueInstructionsViewed
                        ? "bg-emerald-800 text-white"
                        : "bg-maroon-850 text-white"
                    }`}
                  >
                    {preparations.venueInstructionsViewed ? "Completed ✓" : "Mark Read"}
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency Contacts Form */}
            <form onSubmit={handleSaveEmergency} className="border-t border-warm-100 pt-6 space-y-4">
              <div>
                <h3 className="font-display font-bold text-sm text-charcoal-900 mb-1">
                  Emergency Contact Details (Required)
                </h3>
                <p className="text-[10px] text-charcoal-500">
                  Provide contact info in case of emergencies at the wedding locations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="ec-name" className="font-bold text-charcoal-700">Contact Full Name</label>
                  <input
                    id="ec-name"
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ec-relationship" className="font-bold text-charcoal-700">Relationship</label>
                  <input
                    id="ec-relationship"
                    type="text"
                    required
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="Spouse / Parent"
                    className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ec-cc" className="font-bold text-charcoal-700">Country Dial Code</label>
                  <input
                    id="ec-cc"
                    type="text"
                    required
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="+1"
                    className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ec-phone" className="font-bold text-charcoal-700">Phone Number</label>
                  <input
                    id="ec-phone"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="555-0199"
                    className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="ec-email" className="font-bold text-charcoal-700">Email Address (Optional)</label>
                  <input
                    id="ec-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl px-6 py-2 font-bold transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Emergency Contact"}
              </button>
            </form>
          </div>
        )}

        {/* 2. Itinerary Timeline */}
        {activeTab === "itinerary" && (
          <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-display font-bold text-sm text-charcoal-900 mb-1">
                  Wedding Event Schedule Timeline
                </h3>
                <p className="text-[10px] text-charcoal-500">
                  Read day timings, events schedules, dress codes, and cultural hints.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUpdatePrep("itineraryViewed", true)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                  preparations.itineraryViewed ? "bg-emerald-800 text-white" : "bg-maroon-850 text-white"
                }`}
              >
                {preparations.itineraryViewed ? "Timeline Reviewed ✓" : "Mark Timeline Reviewed"}
              </button>
            </div>

            {itinerary.length === 0 ? (
              <p className="p-8 text-center text-charcoal-400">The itinerary is being prepared by the host. Check back soon!</p>
            ) : (
              <div className="space-y-4">
                {itinerary.map((item) => (
                  <div key={item.id} className="border border-warm-100 p-4 rounded-2xl hover:bg-warm-50/20 transition-all space-y-3">
                    <div className="flex justify-between items-center border-b border-warm-50 pb-2">
                      <span className="font-black text-maroon-800 uppercase tracking-widest text-[9px]">
                        {item.eventType}
                      </span>
                      <span className="text-charcoal-400 font-medium text-[10px]">
                        {new Date(item.startAt).toLocaleString()}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-charcoal-900">{item.title}</h4>
                    {item.description && <p className="text-charcoal-600 line-clamp-2">{item.description}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-[10px]">
                      <div>
                        <span className="font-bold text-charcoal-700 block">Venue & Address:</span>
                        <span className="text-charcoal-500">{item.venueName} — {item.venueAddress}</span>
                      </div>
                      {item.dressCode && (
                        <div>
                          <span className="font-bold text-charcoal-700 block">Event Dress Code:</span>
                          <span className="text-charcoal-500">{item.dressCode}</span>
                        </div>
                      )}
                      {item.culturalNotes && (
                        <div className="sm:col-span-2 bg-warm-50/40 p-2.5 rounded-xl border border-warm-100/50">
                          <span className="font-bold text-charcoal-700 block">Cultural Etiquette Hints:</span>
                          <span className="text-charcoal-500">{item.culturalNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Travel details */}
        {activeTab === "travel" && (
          <form onSubmit={handleSaveTravel} className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-charcoal-900 mb-1">
                Travel & Logistics Details
              </h3>
              <p className="text-[10px] text-charcoal-500">
                Sharing arrival schedules helps the host organize coordinate transport services or hotels directories.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="tr-arrival" className="font-bold text-charcoal-700">Arrival Date & Time</label>
                <input
                  id="tr-arrival"
                  type="datetime-local"
                  required
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tr-departure" className="font-bold text-charcoal-700">Departure Date & Time</label>
                <input
                  id="tr-departure"
                  type="datetime-local"
                  required
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tr-city" className="font-bold text-charcoal-700">Arrival City</label>
                <input
                  id="tr-city"
                  type="text"
                  required
                  value={arrivalCity}
                  onChange={(e) => setArrivalCity(e.target.value)}
                  placeholder="New Delhi"
                  className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tr-flight" className="font-bold text-charcoal-700">Flight Number (Optional)</label>
                <input
                  id="tr-flight"
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="AI-102"
                  className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tr-hotel" className="font-bold text-charcoal-700">Hotel Name (Optional)</label>
                <input
                  id="tr-hotel"
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  placeholder="Taj Palace, New Delhi"
                  className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                />
              </div>

              <div className="space-y-1 flex items-center pt-5">
                <input
                  id="tr-transport"
                  type="checkbox"
                  checked={transportRequired}
                  onChange={(e) => setTransportRequired(e.target.checked)}
                  className="w-4 h-4 text-maroon-800 border-warm-300 rounded focus:ring-maroon-800"
                />
                <label htmlFor="tr-transport" className="ml-2 font-bold text-charcoal-700">Host Shuttle Transport Required</label>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="tr-diet" className="font-bold text-charcoal-700">Dietary Requirements</label>
                <textarea
                  id="tr-diet"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="Vegetarian only / Nut allergies"
                  className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800 h-20"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="tr-accessibility" className="font-bold text-charcoal-700">Accessibility Requirements</label>
                <textarea
                  id="tr-accessibility"
                  value={accessibility}
                  onChange={(e) => setAccessibility(e.target.value)}
                  placeholder="Wheelchair access needed"
                  className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none focus:border-maroon-800 h-20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl px-6 py-2 font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Travel Logistics"}
            </button>
          </form>
        )}

        {/* 4. Announcements Broadcaster */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-sm text-charcoal-900 mb-1">
                Host Broadcaster Announcements
              </h3>
              <p className="text-[10px] text-charcoal-500">
                Check updates broadcasted by host couples regarding events timing adjustments, meeting gates, or buses departures.
              </p>
            </div>

            {announcements.length === 0 ? (
              <p className="p-8 text-center text-charcoal-400">No announcements broadcasted yet.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className={`border p-4 rounded-2xl space-y-2 ${
                      a.priority === "URGENT"
                        ? "bg-red-50/40 border-red-200 text-red-900"
                        : a.priority === "IMPORTANT"
                        ? "bg-amber-50/30 border-amber-200 text-amber-900"
                        : "bg-warm-50/30 border-warm-200 text-charcoal-800"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-black border-b border-warm-100/50 pb-1.5">
                      <span className="uppercase tracking-widest">{a.priority} ANNOUNCEMENT</span>
                      <span className="font-normal text-charcoal-400">{new Date(a.publishedAt).toLocaleString()}</span>
                    </div>
                    <h4 className="font-bold text-charcoal-900">{a.title}</h4>
                    <p className="text-charcoal-600 line-clamp-4">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
