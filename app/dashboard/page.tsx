"use client";

import { useAuth } from "@/context/AuthContext";
import { getWeddings } from "@/lib/actions";
import {
  getPersonalizedRecommendations,
  fetchRecentlyViewed,
  fetchSavedSearches,
  recommendWeddingAction,
  deleteSavedSearch
} from "@/lib/actions/discovery";
import StatCard from "@/components/dashboard/StatCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Heart,
  Bell,
  DollarSign,
  Users,
  Award,
  Link as LinkIcon,
  TrendingUp,
  MapPin,
  Check,
  X,
  Plus,
  RefreshCw,
  Coins
} from "lucide-react";
import Link from "next/link";

function VerificationWidget({ role, verification, submitVerification }: { role: string; verification: any; submitVerification: any }) {
  const [passportUrl, setPassportUrl] = useState("");
  const [govtIdUrl, setGovtIdUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [venueConfirmUrl, setVenueConfirmUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [orgDetails, setOrgDetails] = useState("");
  const [businessRegUrl, setBusinessRegUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const status = verification?.status || "not_submitted";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload: any = {};
    if (role === "traveler") {
      payload.passportUrl = passportUrl || "https://uploadthing.com/f/traveler_passport_mock.pdf";
      payload.govtIdUrl = govtIdUrl || "https://uploadthing.com/f/traveler_id_mock.pdf";
      payload.selfieUrl = selfieUrl || "https://uploadthing.com/f/traveler_selfie_mock.jpg";
    } else if (role === "couple") {
      payload.govtIdUrl = govtIdUrl || "https://uploadthing.com/f/couple_id_mock.pdf";
      payload.invitationUrl = invitationUrl || "https://uploadthing.com/f/couple_invite_mock.pdf";
      payload.venueConfirmUrl = venueConfirmUrl || "https://uploadthing.com/f/couple_venue_mock.pdf";
      payload.socialLinks = socialLinks || "instagram.com/couple_mock";
    } else if (role === "agent") {
      payload.govtIdUrl = govtIdUrl || "https://uploadthing.com/f/agent_id_mock.pdf";
      payload.orgDetails = orgDetails || "Boutique Heritage Wedding Planners Group LLC";
      payload.businessRegUrl = businessRegUrl || "https://uploadthing.com/f/agent_reg_mock.pdf";
      payload.linkedinUrl = linkedinUrl || "linkedin.com/in/agent_mock";
    }
    await submitVerification(payload);
    setSubmitting(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "pending": return "bg-amber-50 text-amber-600 border-amber-200 animate-pulse";
      case "under_review": return "bg-sky-50 text-sky-600 border-sky-200 animate-pulse";
      case "rejected": return "bg-red-50 text-red-650 border-red-200";
      default: return "bg-charcoal-50 text-charcoal-500 border-charcoal-200";
    }
  };

  return (
    <div className="bg-white border border-warm-200/50 p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-warm-100 pb-3">
        <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
          🛡️ Profile Trust & Verification
        </h3>
        <span className={cn("text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", getStatusColor())}>
          {status.replace("_", " ")}
        </span>
      </div>

      {status === "approved" && (
        <div className="space-y-3">
          <p className="text-xs text-emerald-700 leading-relaxed font-semibold">
            ✓ Your identity verifications checks are completed! A trust badge has been linked to your platform profile.
          </p>
          <div className="text-[0.6875rem] text-charcoal-400 font-semibold space-y-1">
            <div>Audited By: {verification.reviewedBy || "Audit System"}</div>
            <div>Valid Until: 1 year from approval</div>
          </div>
        </div>
      )}

      {(status === "pending" || status === "under_review") && (
        <div className="space-y-4">
          <p className="text-xs text-charcoal-500 leading-relaxed">
            Your verification documents have been received and are currently under review by our safety operations desk.
          </p>
          <div className="space-y-2 text-[0.6875rem] text-charcoal-550 font-bold border-l-2 border-amber-200 pl-3">
            <div className="text-emerald-600">✓ Step 1: Documents Uploaded ({verification.submissionDate || "Just now"})</div>
            <div className="text-amber-500 animate-pulse">→ Step 2: Undergoing Background Checks</div>
            <div className="text-charcoal-400">Step 3: Verification Badge Issuance</div>
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="space-y-3">
          <div className="bg-red-50/50 border border-red-100 p-3 rounded-lg text-xs text-red-750">
            <strong>Rejection Reason:</strong> {verification.notes || "Blurry documents uploaded. Please submit clear copies."}
          </div>
        </div>
      )}

      {(status === "not_submitted" || status === "rejected") && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-charcoal-500 leading-relaxed">
            Submit your trust verification documents to secure referrals, attendee passes, and unlock premium platform options.
          </p>

          {role === "traveler" && (
            <div className="space-y-3">
              <div>
                <label className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Passport Scan</label>
                <div className="border-2 border-dashed border-warm-200 hover:border-maroon-300 rounded-xl p-3 text-center cursor-pointer bg-warm-50/30 text-xs font-semibold text-charcoal-500 transition-colors" onClick={() => setPassportUrl("https://uploadthing.com/f/traveler_passport_mock.pdf")}>
                  {passportUrl ? "✓ Passport Selected" : "Click to mock Passport drag & drop"}
                </div>
              </div>
              <div>
                <label className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Government Photo ID</label>
                <div className="border-2 border-dashed border-warm-200 hover:border-maroon-300 rounded-xl p-3 text-center cursor-pointer bg-warm-50/30 text-xs font-semibold text-charcoal-500 transition-colors" onClick={() => setGovtIdUrl("https://uploadthing.com/f/traveler_id_mock.pdf")}>
                  {govtIdUrl ? "✓ Government ID Selected" : "Click to mock Govt ID drag & drop"}
                </div>
              </div>
            </div>
          )}

          {role === "couple" && (
            <div className="space-y-3">
              <div>
                <label className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Wedding Invitation Card / PDF</label>
                <div className="border-2 border-dashed border-warm-200 hover:border-maroon-300 rounded-xl p-3 text-center cursor-pointer bg-warm-50/30 text-xs font-semibold text-charcoal-500 transition-colors" onClick={() => setInvitationUrl("https://uploadthing.com/f/couple_invite_mock.pdf")}>
                  {invitationUrl ? "✓ Invitation Selected" : "Click to mock Invitation upload"}
                </div>
              </div>
              <div>
                <label className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Venue Booking Confirmation Scan</label>
                <div className="border-2 border-dashed border-warm-200 hover:border-maroon-300 rounded-xl p-3 text-center cursor-pointer bg-warm-50/30 text-xs font-semibold text-charcoal-500 transition-colors" onClick={() => setVenueConfirmUrl("https://uploadthing.com/f/couple_venue_mock.pdf")}>
                  {venueConfirmUrl ? "✓ Venue Confirmation Selected" : "Click to mock Venue booking upload"}
                </div>
              </div>
              <div>
                <label className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Social Profile Link (Instagram/Facebook)</label>
                <input type="text" placeholder="instagram.com/wedding_couples" className="input-luxury text-xs" value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)} />
              </div>
            </div>
          )}

          {role === "agent" && (
            <div className="space-y-3">
              <div>
                <label className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Business Registration Certificate (Optional)</label>
                <div className="border-2 border-dashed border-warm-200 hover:border-maroon-300 rounded-xl p-3 text-center cursor-pointer bg-warm-50/30 text-xs font-semibold text-charcoal-500 transition-colors" onClick={() => setBusinessRegUrl("https://uploadthing.com/f/agent_reg_mock.pdf")}>
                  {businessRegUrl ? "✓ Business Certificate Selected" : "Click to mock Registration certificate upload"}
                </div>
              </div>
              <div>
                <label className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">LinkedIn Profile Link</label>
                <input type="text" placeholder="linkedin.com/in/agency_lead" className="input-luxury text-xs" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
              </div>
              <div>
                <label className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block mb-1">Organization / Agency Details</label>
                <textarea placeholder="Provide agency address, operational history, and reference contact information..." className="input-luxury text-xs h-16 resize-none" value={orgDetails} onChange={(e) => setOrgDetails(e.target.value)} />
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full btn btn-primary btn-sm mt-2 cursor-pointer disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Verification Documents"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function DashboardOverviewPage() {
  const {
    user,
    bookings,
    wishlist,
    notifications,
    guestApplications,
    handleGuestApplication,
    hostWedding,
    coupleStats,
    adminStats,
    refundBooking,
    verification,
    submitVerification,
    reviewVerification
  } = useAuth();

  const [weddings, setWeddings] = useState<any[]>([]);
  const [appFilter, setAppFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  // Discovery states
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [personalizedRecs, setPersonalizedRecs] = useState<any[]>([]);
  
  // AI matching advisor states
  const [aiBudget, setAiBudget] = useState(200);
  const [aiCountry, setAiCountry] = useState("India");
  const [aiGroupSize, setAiGroupSize] = useState(2);
  const [aiInterests, setAiInterests] = useState("Beach, Luxury");
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    getWeddings().then(setWeddings).catch(console.error);
  }, []);

  const userRole = user?.role || "traveler";

  useEffect(() => {
    if (userRole === "traveler") {
      fetchRecentlyViewed().then(setRecentlyViewed).catch(console.error);
      fetchSavedSearches().then(setSavedSearches).catch(console.error);
      getPersonalizedRecommendations().then(setPersonalizedRecs).catch(console.error);
    }
  }, [userRole]);

  const handleAiMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await recommendWeddingAction({
        budget: aiBudget,
        country: aiCountry,
        travelDates: "",
        groupSize: aiGroupSize,
        interests: aiInterests,
      });
      setAiResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      await deleteSavedSearch(id);
      const data = await fetchSavedSearches();
      setSavedSearches(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter out weddings that are in wishlist
  const wishlistedWeddings = weddings.filter((w) => wishlist.includes(w.slug));
  const activeBookings = bookings.filter((b) => b.status === "upcoming");

  // 1. TRAVELER VIEW
  if (userRole === "traveler") {
    const totalSpent = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.pricePerGuest * b.guestsCount, 0);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Here is what is happening with your cultural wedding discovery plans.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Active Bookings" value={activeBookings.length} icon={Calendar} />
          <StatCard label="Saved Weddings" value={wishlist.length} icon={Heart} />
          <StatCard label="Notifications" value={notifications.filter((n) => !n.read).length} icon={Bell} />
          <StatCard
            label="Total Spent"
            value={`$${totalSpent.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: "100% Secure", isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main: Recommendations & Wishlist */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Recommended Weddings */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-lg text-charcoal-900">Recommended for You</h3>
                <Link href="/weddings" className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline uppercase tracking-wider">
                  Browse all →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(personalizedRecs.length > 0 ? personalizedRecs : weddings).slice(0, 2).map((wedding: any) => (
                  <div key={wedding.id} className="bg-white border border-warm-200/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="h-40 bg-warm-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={wedding.imageUrl || wedding.mainImageUrl} alt={wedding.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 text-[0.625rem] font-bold uppercase tracking-wider bg-white/95 text-[var(--color-brand-primary)] px-2 py-1 rounded border border-warm-100 shadow-sm">
                        {wedding.category}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-display font-bold text-sm text-charcoal-900 truncate">{wedding.title}</h4>
                      <p className="text-[0.6875rem] text-charcoal-500 flex items-center gap-1">
                        <MapPin size={11} className="text-maroon-600" /> {wedding.location}
                      </p>
                      <div className="flex justify-between items-center pt-2 border-t border-warm-50 text-xs">
                        <span className="font-bold text-charcoal-850">${wedding.pricePerGuest.toLocaleString()} <span className="font-normal text-charcoal-400">/ guest</span></span>
                        <Link href={`/weddings/${wedding.slug}`} className="font-bold text-[var(--color-brand-primary)] hover:underline">
                          Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved list preview */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-charcoal-900">Your Wishlist</h3>
              {wishlistedWeddings.length === 0 ? (
                <div className="bg-white border border-warm-200/50 p-6 rounded-2xl text-center text-xs text-charcoal-400 font-semibold">
                  No saved weddings. Link items in the marketplace!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistedWeddings.slice(0, 2).map((w) => (
                    <div key={w.id} className="bg-white border border-warm-200/50 rounded-2xl p-4 flex gap-3 items-center animate-fade-in">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-warm-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={w.imageUrl || w.mainImageUrl} alt={w.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-bold text-xs text-charcoal-850 truncate">{w.title}</h4>
                        <p className="text-[0.625rem] text-charcoal-400 mt-0.5 truncate">{w.location}</p>
                      </div>
                      <Link href={`/weddings/${w.slug}`} className="text-xs text-[var(--color-brand-primary)] font-bold shrink-0">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Viewed Weddings */}
            {recentlyViewed.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-charcoal-900">Recently Viewed</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentlyViewed.map((rv) => (
                    <div key={rv.id} className="bg-white border border-warm-200/50 rounded-2xl p-4 flex gap-3 items-center animate-fade-in">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-warm-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={rv.wedding.mainImageUrl} alt={rv.wedding.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-bold text-xs text-charcoal-850 truncate">{rv.wedding.title}</h4>
                        <p className="text-[0.625rem] text-charcoal-400 mt-0.5 truncate">{rv.wedding.location}</p>
                      </div>
                      <Link href={`/weddings/${rv.wedding.slug}`} className="text-xs text-[var(--color-brand-primary)] font-bold shrink-0">
                        Continue →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-charcoal-900">Saved Searches</h3>
                <div className="bg-white border border-warm-200/50 p-4 rounded-2xl shadow-sm divide-y divide-warm-100">
                  {savedSearches.map((s) => (
                    <div key={s.id} className="py-2.5 flex justify-between items-center text-xs animate-fade-in">
                      <div>
                        <div className="font-bold text-charcoal-900">{s.name}</div>
                        <div className="text-[10px] text-charcoal-400 mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/weddings?query=${encodeURIComponent(JSON.parse(s.filters).query || "")}`}
                          className="font-bold text-maroon-700 hover:underline uppercase tracking-wider text-[10px]"
                        >
                          Run Search
                        </Link>
                        <button
                          onClick={() => handleDeleteSaved(s.id)}
                          className="text-rose-650 hover:opacity-80 font-bold uppercase tracking-wider text-[10px]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI assisted Match Advisor */}
            <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
              <div className="border-b border-warm-100 pb-3">
                <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
                  ✨ AI Heritage Match Advisor
                </h3>
                <p className="text-charcoal-450 text-[10px] sm:text-xs mt-0.5">
                  Input your budget, size, and interests to find the ideal cultural experience.
                </p>
              </div>

              <form onSubmit={handleAiMatch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">Max Budget per guest ($)</label>
                  <input
                    type="number"
                    value={aiBudget}
                    onChange={(e) => setAiBudget(parseInt(e.target.value) || 200)}
                    className="input-luxury text-xs py-1 h-9"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">Group Attendee Size</label>
                  <input
                    type="number"
                    value={aiGroupSize}
                    onChange={(e) => setAiGroupSize(parseInt(e.target.value) || 2)}
                    className="input-luxury text-xs py-1 h-9"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">Cultural Interests (Keywords)</label>
                  <input
                    type="text"
                    value={aiInterests}
                    onChange={(e) => setAiInterests(e.target.value)}
                    placeholder="e.g. Beach, Goa, Royal Palace, Temple"
                    className="input-luxury text-xs py-1 h-9"
                  />
                </div>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="sm:col-span-2 bg-maroon-800 text-white font-bold uppercase tracking-wider py-2 rounded-xl hover:bg-maroon-900 transition-colors cursor-pointer text-xs"
                >
                  {aiLoading ? "Consulting Advisor..." : "Find Matching Experience"}
                </button>
              </form>

              {aiResult && (
                <div className="mt-4 p-4 bg-maroon-50/20 border border-maroon-150 rounded-2xl text-xs space-y-3 animate-fade-in">
                  {aiResult.match ? (
                    <>
                      <h4 className="font-bold text-charcoal-900 flex items-center gap-1.5">
                        💡 Recommended Fit: {aiResult.match.title}
                      </h4>
                      <p className="text-charcoal-600 leading-relaxed font-medium">
                        {aiResult.explanation}
                      </p>
                      <Link
                        href={`/weddings/${aiResult.match.slug}`}
                        className="inline-block text-[10px] font-bold text-maroon-800 hover:underline uppercase tracking-wider"
                      >
                        Request Booking Spot →
                      </Link>
                    </>
                  ) : (
                    <p className="text-charcoal-600 font-medium italic">
                      {aiResult.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar: Recent Activity */}
          <div className="lg:col-span-4 space-y-6">
            <VerificationWidget role="traveler" verification={verification} submitVerification={submitVerification} />

            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-charcoal-900">Recent Activity</h3>
              <div className="bg-white border border-warm-200/50 p-4 rounded-2xl shadow-sm space-y-4">
                <ActivityCard
                  title="Attended Welcome Feast"
                  description="Joined Anya & Rohan's Welcome Mehndi event in Goa."
                  time="Nov 2024"
                  icon="🎉"
                />
                <ActivityCard
                  title="Booking Request Confirmed"
                  description="Devika & Kaber approved your Jodhpur Maharaja wedding pass."
                  time="Feb 2025"
                  icon="✅"
                />
                <ActivityCard
                  title="Account Onboarded"
                  description="Traveler profile completed successfully."
                  time="Just now"
                  icon="👤"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. COUPLE VIEW
  if (userRole === "couple") {
    const approvedGuestsCount = bookings.filter((b) => b.status === "upcoming").reduce((sum, b) => sum + b.guestsCount, 0);
    const capacityProgress = hostWedding?.capacity ? Math.round((approvedGuestsCount / hostWedding.capacity) * 100) : 0;

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Host Family Dashboard
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Manage your wedding guest requests, payouts, and wedding details.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Approved Guests" value={approvedGuestsCount} icon={Check} />
          <StatCard
            label="Total Revenue"
            value={`$${(coupleStats?.revenue || 0).toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: "100% Paid", isPositive: true }}
          />
          <StatCard
            label="Pending Payouts"
            value={`$${(coupleStats?.pendingPayouts || 0).toLocaleString()}`}
            icon={Bell}
            trend={{ value: "Awaiting Transfer", isPositive: false }}
          />
          <StatCard
            label="Capacity Progress"
            value={`${capacityProgress}%`}
            icon={TrendingUp}
            trend={{ value: `${approvedGuestsCount} / ${hostWedding?.capacity || 200} spots`, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main: Guest Applications */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-warm-100 pb-3 flex-wrap gap-4">
                <h3 className="font-display font-bold text-lg text-charcoal-900">Guest Applications</h3>
                
                {/* Pills / Tabs for Couples */}
                <div className="flex gap-2">
                  {(["pending", "approved", "rejected"] as const).map((tab) => {
                    const count = guestApplications.filter((a) => a.status === tab).length;
                    return (
                      <button
                        key={tab}
                        onClick={() => setAppFilter(tab)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer",
                          appFilter === tab
                            ? "bg-[var(--color-brand-primary)] text-white"
                            : "bg-warm-100/60 text-charcoal-550 hover:bg-warm-200"
                        )}
                      >
                        {tab} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {guestApplications.filter((a) => a.status === appFilter).length === 0 ? (
                <div className="bg-white border border-warm-200/50 p-8 rounded-[2rem] text-center text-xs sm:text-sm text-charcoal-400 font-semibold shadow-sm">
                  No {appFilter} guest applications found.
                </div>
              ) : (
                <div className="space-y-4">
                  {guestApplications
                    .filter((a) => a.status === appFilter)
                    .map((app) => (
                      <div key={app.id} className="bg-white border border-warm-200/50 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-warm-100 flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={app.travelerAvatar} alt={app.travelerName} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-sans font-bold text-sm text-charcoal-850">{app.travelerName}</h4>
                              <div className="flex items-center gap-1 text-[0.625rem] text-charcoal-400 font-semibold uppercase tracking-wider">
                                <span>{app.travelerCountry}</span>
                                <span>•</span>
                                <span className="text-[var(--color-brand-primary)]">Budget: {app.budget}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions: ONLY show if status is pending */}
                          {appFilter === "pending" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleGuestApplication(app.id, "approved")}
                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center border border-emerald-100 cursor-pointer transition-colors"
                                aria-label="Approve guest"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleGuestApplication(app.id, "rejected")}
                                className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center border border-rose-100 cursor-pointer transition-colors"
                                aria-label="Decline guest"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          
                          {/* Status Label for non-pending tabs */}
                          {appFilter !== "pending" && (
                            <span className={cn(
                              "text-[0.625rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                              appFilter === "approved" 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : "bg-red-50 text-red-650 border-red-100"
                            )}>
                              {appFilter === "approved" ? "Approved" : "Rejected"}
                            </span>
                          )}
                        </div>

                        <div className="p-3 bg-warm-50 rounded-xl border border-warm-100 text-xs text-charcoal-600 leading-relaxed font-medium">
                          &ldquo;{app.message}&rdquo;
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Paid Guests & Payout history table */}
            <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3">
                Paid Guests Ledger
              </h3>
              {!coupleStats?.paidGuests || coupleStats.paidGuests.length === 0 ? (
                <div className="p-6 text-center text-xs text-charcoal-400 font-semibold">
                  No successful payments registered for your attendees yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-warm-200 text-xs font-bold text-charcoal-500 uppercase tracking-widest bg-warm-50">
                        <th className="p-4 rounded-tl-xl">Traveler</th>
                        <th className="p-4">Attendees</th>
                        <th className="p-4">Amount Paid</th>
                        <th className="p-4">Check-in Date</th>
                        <th className="p-4 rounded-tr-xl">Payout Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-100 text-xs sm:text-sm text-charcoal-600">
                      {coupleStats.paidGuests.map((g: any) => (
                        <tr key={g.id}>
                          <td className="p-4 font-bold text-charcoal-900">{g.travelerName}</td>
                          <td className="p-4">{g.guestsCount} guest(s)</td>
                          <td className="p-4 font-bold text-emerald-600">${g.amount.toLocaleString()}.00</td>
                          <td className="p-4">{g.date}</td>
                          <td className="p-4">
                            <span className="inline-block text-[0.625rem] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">
                              Awaiting Payout
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Host Calendar / Schedule */}
          <div className="lg:col-span-4 space-y-6">
            <VerificationWidget role="couple" verification={verification} submitVerification={submitVerification} />

            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-charcoal-900">Wedding Timeline</h3>
              <div className="bg-white border border-warm-200/50 p-4 rounded-2xl shadow-sm space-y-4">
                <div className="border-l-2 border-[var(--color-brand-primary)] pl-3 space-y-1">
                  <div className="text-[0.625rem] font-bold text-[var(--color-brand-secondary)] uppercase tracking-wider">Day 1 — Mehndi</div>
                  <div className="text-xs font-bold text-charcoal-800">16:00 - Welcome Henna Dinner</div>
                </div>
                <div className="border-l-2 border-[var(--color-brand-primary)] pl-3 space-y-1">
                  <div className="text-[0.625rem] font-bold text-[var(--color-brand-secondary)] uppercase tracking-wider">Day 2 — Sangeet</div>
                  <div className="text-xs font-bold text-charcoal-800">18:00 - Family Dance Extrava</div>
                </div>
                <div className="border-l-2 border-[var(--color-brand-primary)] pl-3 space-y-1">
                  <div className="text-[0.625rem] font-bold text-[var(--color-brand-secondary)] uppercase tracking-wider">Day 3 — Vows</div>
                  <div className="text-xs font-bold text-charcoal-800">15:30 - Baraat & Vedic Pheras</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. ADMIN PORTAL VIEW
  if (userRole === "admin") {
    const totalVolume = adminStats?.allPayments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    const stripeFees = totalVolume * 0.029 + (adminStats?.allPayments?.length || 0) * 0.3;
    const netRevenue = totalVolume - stripeFees;

    // Monthly aggregation for growth charts (mock/actual aggregation)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        name: months[d.getMonth()],
        volume: 0,
      };
    });

    adminStats?.allPayments?.forEach((p: any) => {
      const pDate = new Date(p.date || p.createdAt);
      const mName = months[pDate.getMonth()];
      const found = last6Months.find((m) => m.name === mName);
      if (found) found.volume += p.amount;
    });

    const maxVolume = Math.max(...last6Months.map((m) => m.volume), 100);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 flex items-center gap-2">
            System Administration Overview
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            Real-time operations center tracking Stripe payments, identity verification audits, and active listings.
          </p>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Processed Volume" value={`$${totalVolume.toLocaleString()}`} icon={DollarSign} />
          <StatCard label="Verification Audits Queue" value={adminStats?.pendingVerifications?.length || 0} icon={Bell} />
          <StatCard label="Refunds Queue" value={adminStats?.refundQueue?.length || 0} icon={RefreshCw} />
          <StatCard label="Active Weddings" value="6" icon={Calendar} />
        </div>

        {/* Stripe statistics */}
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
            <Coins size={18} className="text-maroon-600" />
            Stripe Settlement Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-warm-50/50 border border-warm-200/40 p-4 rounded-2xl space-y-1">
              <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block">Gross Volume</span>
              <span className="font-display font-bold text-lg text-charcoal-900">${totalVolume.toLocaleString()} USD</span>
            </div>
            <div className="bg-warm-50/50 border border-warm-200/40 p-4 rounded-2xl space-y-1">
              <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block">Stripe Processing Fees (2.9% + 30¢)</span>
              <span className="font-display font-bold text-lg text-charcoal-900">${stripeFees.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</span>
            </div>
            <div className="bg-warm-50/50 border border-warm-200/40 p-4 rounded-2xl space-y-1">
              <span className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-wider block">Net Revenue Share</span>
              <span className="font-display font-bold text-lg text-charcoal-900">${netRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</span>
            </div>
          </div>
        </div>

        {/* Mid grid: Growth Charts & Identity Verifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Growth Charts */}
          <div className="lg:col-span-6 bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-maroon-600" />
              Volume Growth Chart (Last 6 Months)
            </h3>
            <div className="h-48 flex items-end justify-between gap-2 pt-6 pl-2 pr-2 border-b border-warm-150">
              {last6Months.map((m) => {
                const heightPct = Math.max(10, Math.floor((m.volume / maxVolume) * 100));
                return (
                  <div key={m.name} className="flex flex-col items-center flex-1 group relative">
                    {/* Tooltip */}
                    <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform bg-charcoal-900 text-white text-[0.625rem] font-bold px-1.5 py-0.5 rounded shadow z-10">
                      ${m.volume.toLocaleString()}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-brand rounded-t-lg transition-all duration-500 hover:opacity-90"
                    />
                    <span className="text-[0.6875rem] font-semibold text-charcoal-400 mt-2">{m.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Audits Queue */}
          <div className="lg:col-span-6 bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Users size={18} className="text-maroon-600" />
              Identity Verification Queue ({adminStats?.pendingVerifications?.length || 0})
            </h3>
            {!adminStats?.pendingVerifications || adminStats.pendingVerifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
                No pending identity verification submissions.
              </div>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {adminStats.pendingVerifications.map((v: any) => (
                  <div key={v.id} className="border border-warm-200 p-3.5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-charcoal-850">{v.travelerName}</div>
                      <div className="text-[0.625rem] text-charcoal-400 mt-0.5">{v.email}</div>
                    </div>
                    <Link
                      href="/dashboard/admin/verifications"
                      className="text-[0.6875rem] font-bold text-maroon-800 bg-maroon-50 px-2.5 py-1 rounded-xl hover:bg-maroon-100 transition-colors"
                    >
                      Audit Scan
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Management Quick Link Directory */}
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3">
            Quick Admin Console Operations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <Link href="/dashboard/admin/weddings" className="border border-warm-200/60 p-5 rounded-2xl hover:shadow-md transition-shadow bg-warm-50/15 space-y-2">
              <h4 className="font-display font-bold text-charcoal-900">Wedding Experience CRUD</h4>
              <p className="text-charcoal-500 leading-relaxed text-[0.6875rem]">Draft, publish, edit pricing, or toggle feature properties for experience products.</p>
            </Link>
            <Link href="/dashboard/admin/users" className="border border-warm-200/60 p-5 rounded-2xl hover:shadow-md transition-shadow bg-warm-50/15 space-y-2">
              <h4 className="font-display font-bold text-charcoal-900">User Account Directory</h4>
              <p className="text-charcoal-500 leading-relaxed text-[0.6875rem]">Audit registered profile accounts, modify roles, or delete database accounts.</p>
            </Link>
            <Link href="/dashboard/admin/bookings" className="border border-warm-200/60 p-5 rounded-2xl hover:shadow-md transition-shadow bg-warm-50/15 space-y-2">
              <h4 className="font-display font-bold text-charcoal-900">Booking Override Controls</h4>
              <p className="text-charcoal-500 leading-relaxed text-[0.6875rem]">Force transition reservation statuses, cancel tickets, or trigger CSV exports.</p>
            </Link>
            <Link href="/dashboard/admin/payments" className="border border-warm-200/60 p-5 rounded-2xl hover:shadow-md transition-shadow bg-warm-50/15 space-y-2">
              <h4 className="font-display font-bold text-charcoal-900">Financial Ledger Audits</h4>
              <p className="text-charcoal-500 leading-relaxed text-[0.6875rem]">Verify transactions, investigate refund requests, and clear host payout queues.</p>
            </Link>
            <Link href="/dashboard/admin/cms" className="border border-warm-200/60 p-5 rounded-2xl hover:shadow-md transition-shadow bg-warm-50/15 space-y-2">
              <h4 className="font-display font-bold text-charcoal-900">CMS Content Editor</h4>
              <p className="text-charcoal-500 leading-relaxed text-[0.6875rem]">Publish travel guides, answer FAQs, and curate customer slider reviews.</p>
            </Link>
            <Link href="/dashboard/admin/analytics" className="border border-warm-200/60 p-5 rounded-2xl hover:shadow-md transition-shadow bg-warm-50/15 space-y-2">
              <h4 className="font-display font-bold text-charcoal-900">Audit Trails & Logs</h4>
              <p className="text-charcoal-500 leading-relaxed text-[0.6875rem]">Review admin activity audit trails and inspect security permissions maps.</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. AGENT VIEW
  const isAgentVerified = verification?.status === "approved";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Partner Workspace
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Track referral commissions, link analytics, and business certifications.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Clicks" value="580" icon={LinkIcon} />
        <StatCard label="Referrals Converted" value="42" icon={Users} />
        <StatCard
          label="Referral Eligibility"
          value={isAgentVerified ? "ELIGIBLE" : "LOCKED"}
          icon={Award}
          trend={{ value: isAgentVerified ? "Verification approved" : "Awaiting verification", isPositive: isAgentVerified }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Custom Link Copy card */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-sans font-bold text-sm text-charcoal-800">Your Referrer Link</h4>
            {isAgentVerified ? (
              <div className="flex gap-2">
                <input type="text" readOnly value={`https://weddingwithindia.com/?ref=${user?.name?.toLowerCase().replace(/\s/g, "_") || "agent"}`} className="input-luxury bg-warm-50 text-xs" />
                <button className="btn btn-primary btn-sm cursor-pointer" onClick={() => alert("Copied referral link to clipboard!")}>Copy</button>
              </div>
            ) : (
              <div className="p-4 bg-warm-50 rounded-xl border border-warm-100 text-xs text-charcoal-500 font-semibold leading-relaxed">
                🔒 Referral commissions are locked. Submit verification documents to unlock your agent credentials.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar widget */}
        <div className="lg:col-span-4 space-y-4">
          <VerificationWidget role="agent" verification={verification} submitVerification={submitVerification} />
        </div>
      </div>
    </div>
  );
}
