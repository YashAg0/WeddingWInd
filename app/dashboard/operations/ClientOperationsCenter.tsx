"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  manualCheckInAction,
  markAttendanceAction,
  createItineraryItemAction,
  deleteItineraryItemAction,
  publishWeddingAnnouncementAction
} from "@/lib/actions/event-operations";
import { Search, Trash2, Eye } from "lucide-react";

interface ClientOperationsCenterProps {
  wedding: {
    id: string;
    title: string;
    location: string;
    date: Date | string;
    itinerary: Array<{
      id: string;
      title: string;
      eventType: string;
      startAt: Date | string;
      endAt: Date | string;
      venueName: string;
      venueAddress: string;
      dressCode?: string | null;
    }>;
    announcements: Array<{
      id: string;
      title: string;
      message: string;
      priority: string;
      publishedAt: Date | string;
    }>;
  };
  bookings: Array<{
    id: string;
    guestsCount: number;
    totalAmount: number;
    status: string;
    attendanceSide?: string;
    traveler: {
      fullName: string;
      country: string;
      user: {
        email: string;
      };
    };
    preparations: Array<{
      emergencyContactCompleted: boolean;
      dressCodeAcknowledged: boolean;
      culturalGuideViewed: boolean;
      itineraryViewed: boolean;
      venueInstructionsViewed: boolean;
      travelDetailsCompleted: boolean;
    }>;
    emergencies: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
    travelDetails?:
      | {
          arrivalDate?: Date | string | null;
          departureDate?: Date | string | null;
          arrivalCity?: string | null;
          hotelName?: string | null;
          dietaryRequirements?: string | null;
          accessibilityRequirements?: string | null;
        }
      | Array<{
          arrivalDate?: Date | string | null;
          departureDate?: Date | string | null;
          arrivalCity?: string | null;
          hotelName?: string | null;
          dietaryRequirements?: string | null;
          accessibilityRequirements?: string | null;
        }>
      | null;
    guestPasses: Array<{
      id: string;
      passCode: string;
      status: string;
      scanCount: number;
    }>;
  }>;
}

export default function ClientOperationsCenter({ wedding, bookings: initialBookings }: ClientOperationsCenterProps) {
  const [activeTab, setActiveTab] = useState<"manifest" | "itinerary" | "announcements">("manifest");
  const [bookings, setBookings] = useState(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<(typeof initialBookings)[number] | null>(null);

  // Itinerary Item Form State
  const [itineraryTitle, setItineraryTitle] = useState("");
  const [itineraryType, setItineraryType] = useState("CEREMONY");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [culturalNotes, setCulturalNotes] = useState("");

  // Announcement Form State
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [priority, setPriority] = useState<"NORMAL" | "IMPORTANT" | "URGENT">("NORMAL");

  const [loading, setLoading] = useState(false);

  const filteredBookings = bookings.filter((b) =>
    b.traveler.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManualCheckIn = async (bookingId: string) => {
    if (!confirm("Are you sure you want to manually check-in this traveler?")) return;
    try {
      await manualCheckInAction(bookingId, "Manual check-in by host couple");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "CHECKED_IN" } : b))
      );
      toast.success("Traveler checked in successfully!");
    } catch (err: any) {
      toast.error(err.message || "Bypass failed.");
    }
  };

  const handleMarkAttendance = async (bookingId: string, status: "ATTENDED" | "NO_SHOW") => {
    if (!confirm(`Are you sure you want to mark this guest as ${status}?`)) return;
    try {
      await markAttendanceAction(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
      toast.success(`Guest successfully marked as ${status}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update attendance.");
    }
  };

  const handleCreateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createItineraryItemAction({
        weddingId: wedding.id,
        title: itineraryTitle,
        eventType: itineraryType,
        startAt: startAt,
        endAt: endAt,
        venueName,
        venueAddress,
        dressCode: dressCode || null,
        culturalNotes: culturalNotes || null,
        guestInstructions: null,
        sortOrder: 0,
        visibleToGuests: true,
      });
      toast.success("Itinerary item created successfully!");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Creation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItinerary = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this itinerary event item?")) return;
    try {
      await deleteItineraryItemAction(itemId);
      toast.success("Deleted successfully!");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Deletion failed.");
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publishWeddingAnnouncementAction({
        weddingId: wedding.id,
        title: announcementTitle,
        message: announcementMsg,
        priority,
      });
      toast.success("Announcement published and notifications sent successfully!");
      setAnnouncementTitle("");
      setAnnouncementMsg("");
      setPriority("NORMAL");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
      {/* Manifest & Controls Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-warm-200/60 rounded-3xl shadow-sm overflow-hidden">
          {/* Tab buttons */}
          <div className="flex border-b border-warm-100 bg-warm-50/20">
            {(["manifest", "itinerary", "announcements"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 font-bold border-b-2 text-center transition-all ${
                  activeTab === tab
                    ? "border-maroon-850 text-maroon-850 bg-white"
                    : "border-transparent text-charcoal-500 hover:text-charcoal-800"
                }`}
              >
                {tab === "manifest" && "Guest Manifest"}
                {tab === "itinerary" && "Itinerary Editor"}
                {tab === "announcements" && "Broadcast Updates"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Tab 1: Guest Manifest */}
            {activeTab === "manifest" && (
              <div className="space-y-4">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-charcoal-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search by traveler name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-warm-200 rounded-xl pl-9 pr-4 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none focus:border-maroon-800"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-warm-50/50 text-charcoal-500 font-bold border-b border-warm-100">
                        <th className="p-3">Guest Name / Origin</th>
                        <th className="p-3">Side</th>
                        <th className="p-3">Count</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Readiness</th>
                        <th className="p-3">Gate Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-100 text-charcoal-800">
                      {filteredBookings.map((b) => {
                        const prep = b.preparations[0] || {};
                        const requiredTasks = [prep.emergencyContactCompleted, prep.dressCodeAcknowledged];
                        const allReqComplete = requiredTasks.every(Boolean);

                        return (
                          <tr key={b.id} className="hover:bg-warm-50/20 transition-all">
                            <td className="p-3">
                              <div className="font-bold text-charcoal-900">{b.traveler.fullName}</div>
                              <div className="text-[10px] text-charcoal-500">{b.traveler.country}</div>
                            </td>
                            <td className="p-3">
                              {b.attendanceSide === "BRIDE_SIDE" ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                  Bride&apos;s Side
                                </span>
                              ) : b.attendanceSide === "GROOM_SIDE" ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                                  Groom&apos;s Side
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  Flexible
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-semibold">{b.guestsCount}</td>
                            <td className="p-3">
                              <span
                                className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  b.status === "CHECKED_IN" || b.status === "ATTENDED"
                                    ? "bg-emerald-50 text-emerald-800"
                                    : b.status === "READY_FOR_EVENT"
                                    ? "bg-blue-50 text-blue-800"
                                    : "bg-charcoal-100 text-charcoal-700"
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`font-black ${allReqComplete ? "text-emerald-850" : "text-amber-600"}`}>
                                {allReqComplete ? "Ready ✓" : "Pending"}
                              </span>
                            </td>
                            <td className="p-3 flex gap-2">
                              {b.status === "PAID" || b.status === "READY_FOR_EVENT" ? (
                                <button
                                  type="button"
                                  onClick={() => handleManualCheckIn(b.id)}
                                  className="text-maroon-800 hover:underline font-bold text-[10px]"
                                >
                                  Check In
                                </button>
                              ) : b.status === "CHECKED_IN" ? (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAttendance(b.id, "ATTENDED")}
                                    className="text-emerald-800 hover:underline font-bold text-[10px]"
                                  >
                                    Attended
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAttendance(b.id, "NO_SHOW")}
                                    className="text-red-700 hover:underline font-bold text-[10px]"
                                  >
                                    No-Show
                                  </button>
                                </div>
                              ) : (
                                <span className="text-charcoal-400 font-medium">Completed</span>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedBooking(b)}
                                className="text-charcoal-500 hover:text-charcoal-800 font-semibold text-[10px] ml-2 flex items-center gap-0.5"
                              >
                                <Eye size={11} /> Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Itinerary Editor */}
            {activeTab === "itinerary" && (
              <div className="space-y-6">
                <form onSubmit={handleCreateItinerary} className="space-y-4 border-b border-warm-100 pb-6">
                  <h3 className="font-display font-bold text-sm text-charcoal-900">Add Schedule Event</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="it-title" className="font-bold text-charcoal-700">Event Title</label>
                      <input
                        id="it-title"
                        type="text"
                        required
                        value={itineraryTitle}
                        onChange={(e) => setItineraryTitle(e.target.value)}
                        placeholder="Mehendi Ceremony"
                        className="w-full border border-warm-200 rounded-xl px-3 py-1.5 bg-warm-50/20 focus:outline-none focus:border-maroon-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="it-type" className="font-bold text-charcoal-700">Event Type</label>
                      <select
                        id="it-type"
                        value={itineraryType}
                        onChange={(e) => setItineraryType(e.target.value)}
                        className="w-full border border-warm-200 rounded-xl px-3 py-1.5 bg-warm-50/20 focus:outline-none"
                      >
                        <option value="WELCOME">Guest Welcome</option>
                        <option value="MEHENDI">Mehendi</option>
                        <option value="HALDI">Haldi</option>
                        <option value="SANGEET">Sangeet</option>
                        <option value="BARAAT">Baraat</option>
                        <option value="CEREMONY">Wedding Ceremony</option>
                        <option value="RECEPTION">Reception Dinner</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="it-start" className="font-bold text-charcoal-700">Start Time</label>
                      <input
                        id="it-start"
                        type="datetime-local"
                        required
                        value={startAt}
                        onChange={(e) => setStartAt(e.target.value)}
                        className="w-full border border-warm-200 rounded-xl px-3 py-1.5 bg-warm-50/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="it-end" className="font-bold text-charcoal-700">End Time</label>
                      <input
                        id="it-end"
                        type="datetime-local"
                        required
                        value={endAt}
                        onChange={(e) => setEndAt(e.target.value)}
                        className="w-full border border-warm-200 rounded-xl px-3 py-1.5 bg-warm-50/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="it-venue" className="font-bold text-charcoal-700">Venue Name</label>
                      <input
                        id="it-venue"
                        type="text"
                        required
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="Royal Garden Poolside"
                        className="w-full border border-warm-200 rounded-xl px-3 py-1.5 bg-warm-50/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="it-address" className="font-bold text-charcoal-700">Venue Address</label>
                      <input
                        id="it-address"
                        type="text"
                        required
                        value={venueAddress}
                        onChange={(e) => setVenueAddress(e.target.value)}
                        placeholder="Civil Lines, Jaipur"
                        className="w-full border border-warm-200 rounded-xl px-3 py-1.5 bg-warm-50/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="it-dress" className="font-bold text-charcoal-700">Dress Code Suggestion</label>
                      <input
                        id="it-dress"
                        type="text"
                        value={dressCode}
                        onChange={(e) => setDressCode(e.target.value)}
                        placeholder="Traditional yellow or green outfit"
                        className="w-full border border-warm-200 rounded-xl px-3 py-1.5 bg-warm-50/20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="it-etiquette" className="font-bold text-charcoal-700">Cultural Etiquette Notes</label>
                      <textarea
                        id="it-etiquette"
                        value={culturalNotes}
                        onChange={(e) => setCulturalNotes(e.target.value)}
                        placeholder="Guests apply henna dye, dance participation highly welcome!"
                        className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none h-16"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl px-6 py-2 font-bold transition-all"
                  >
                    {loading ? "Creating..." : "Save Event Schedule"}
                  </button>
                </form>

                {/* Itinerary List */}
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-sm text-charcoal-900">Current Schedule Events</h3>
                  {wedding.itinerary.length === 0 ? (
                    <p className="text-charcoal-400">No timeline schedules populated yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {wedding.itinerary.map((item: any) => (
                        <div key={item.id} className="p-4 border border-warm-100 rounded-2xl flex justify-between items-center bg-warm-50/10">
                          <div>
                            <div className="font-bold text-charcoal-900">{item.title}</div>
                            <div className="text-[10px] text-charcoal-400">
                              {new Date(item.startAt).toLocaleString()} • {item.venueName}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteItinerary(item.id)}
                            className="text-red-700 hover:text-red-900 transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Broadcast Updates */}
            {activeTab === "announcements" && (
              <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                <h3 className="font-display font-bold text-sm text-charcoal-900">Issue Broadcaster Updates</h3>

                <div className="space-y-1">
                  <label htmlFor="ann-title" className="font-bold text-charcoal-700">Announcement Title</label>
                  <input
                    id="ann-title"
                    type="text"
                    required
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Bus Departure Timing Changed"
                    className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ann-priority" className="font-bold text-charcoal-700">Priority Level</label>
                  <select
                    id="ann-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as "NORMAL" | "IMPORTANT" | "URGENT")}
                    className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none"
                  >
                    <option value="NORMAL">Normal Board Notification</option>
                    <option value="IMPORTANT">Important Email & Alert</option>
                    <option value="URGENT">Urgent Instant Email Dispatch</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="ann-msg" className="font-bold text-charcoal-700">Detailed Message</label>
                  <textarea
                    id="ann-msg"
                    required
                    value={announcementMsg}
                    onChange={(e) => setAnnouncementMsg(e.target.value)}
                    placeholder="Shuttle buses leaves Taj Palace entrance gate at 5:00 PM instead of 4:30 PM..."
                    className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 focus:outline-none h-32"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl px-6 py-2.5 font-bold transition-all"
                >
                  {loading ? "Publishing..." : "Broadcast Announcement"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Guest Details Drawer Side panel */}
      <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-4 h-fit">
        <h2 className="font-display font-bold text-sm text-charcoal-900">
          Selected Guest Logistics Panel
        </h2>

        {selectedBooking ? (
          <div className="space-y-4">
            <div className="border-b border-warm-100 pb-3">
              <div className="font-bold text-sm text-charcoal-900">
                {selectedBooking.traveler.fullName}
              </div>
              <div className="text-[10px] text-charcoal-400 mt-0.5">
                Booking Reference: {selectedBooking.id.substring(0, 8)}
              </div>
            </div>

            {/* Travel info */}
            {(() => {
              const travel = Array.isArray(selectedBooking.travelDetails)
                ? selectedBooking.travelDetails[0]
                : (selectedBooking.travelDetails as any);
              if (!travel) {
                return (
                  <p className="text-[10px] text-charcoal-400 italic">
                    No travel logistics provided yet.
                  </p>
                );
              }
              return (
                <div className="space-y-2 text-[10px]">
                  <h3 className="font-bold text-charcoal-700">Travel & Shuttle Info:</h3>
                  <div className="space-y-1 text-charcoal-600">
                    <p>
                      <strong>Arrival:</strong>{" "}
                      {travel.arrivalDate
                        ? new Date(travel.arrivalDate).toLocaleString()
                        : "Not Specified"}
                    </p>
                    <p>
                      <strong>Hotel:</strong> {travel.hotelName || "None"}
                    </p>
                    <p>
                      <strong>Dietary notes:</strong>{" "}
                      {travel.dietaryRequirements || "None"}
                    </p>
                    <p>
                      <strong>Accessibility:</strong>{" "}
                      {travel.accessibilityRequirements || "None"}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Emergency info */}
            {selectedBooking.emergencies[0] && (
              <div className="border-t border-warm-100 pt-3 space-y-2 text-[10px]">
                <h3 className="font-bold text-charcoal-700">Emergency Contacts:</h3>
                <div className="text-charcoal-600">
                  <p>
                    <strong>Name:</strong> {selectedBooking.emergencies[0].name}
                  </p>
                  <p>
                    <strong>Relationship:</strong> {selectedBooking.emergencies[0].relationship}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedBooking.emergencies[0].phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-charcoal-400 text-[10px]">Select a guest from the manifest list to view details.</p>
        )}
      </div>
    </div>
  );
}
