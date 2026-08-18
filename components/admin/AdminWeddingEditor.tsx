"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Building2,
  Users,
  Camera,
  Flame,
  Globe,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCustomerPriceUSD,
  getHostPayoutPerGuestINR,
  getAgentPayoutPerGuestINR,
  normalizeDurationDays,
  type WeddingTier,
  type WeddingDurationDays,
} from "@/lib/services/pricing-engine";
import { WeddingCard } from "@/components/wedding/WeddingCard";

interface CoupleOption {
  id: string;
  expectedGuests?: number;
  user: {
    name?: string | null;
    email: string;
  };
}

interface AdminWeddingEditorProps {
  wedding?: any;
  couples: CoupleOption[];
  isEdit?: boolean;
}

const TRADITION_OPTIONS = [
  "Hindu",
  "Muslim",
  "Sikh",
  "Christian",
  "Jain",
  "Buddhist",
  "Interfaith / Multicultural",
  "Regional / Cultural",
  "Other",
];

const CATEGORY_OPTIONS = [
  "Royal",
  "Beach",
  "Punjabi",
  "Traditional",
  "South Indian",
  "Destination",
  "Nature",
];

const SCALE_OPTIONS = [
  { value: "INTIMATE", label: "Intimate (< 100 total guests)" },
  { value: "SMALL", label: "Small (100 - 250 total guests)" },
  { value: "MEDIUM", label: "Medium (250 - 500 total guests)" },
  { value: "LARGE", label: "Large (500 - 1,000 total guests)" },
  { value: "GRAND", label: "Grand (1,000+ total guests)" },
];

export function AdminWeddingEditor({ wedding, couples, isEdit = false }: AdminWeddingEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Collapsible section state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    commercial: true,
    itinerary: true,
    safety: true,
    media: true,
    visibility: true,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Preview Drawer Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Form State
  const [title, setTitle] = useState(wedding?.title || "");
  const [location, setLocation] = useState(wedding?.location || "");
  const [city, setCity] = useState(wedding?.city || "");
  const [stateName, setStateName] = useState(wedding?.state || "");
  const [category, setCategory] = useState(wedding?.category || "Royal");
  const [religion, setReligion] = useState(wedding?.religion || "Hindu");
  const [customTradition, setCustomTradition] = useState("");
  const [date, setDate] = useState(
    wedding?.date ? new Date(wedding.date).toISOString().split("T")[0] : ""
  );
  const [hostCoupleId, setHostCoupleId] = useState(wedding?.hostCoupleId || (couples[0]?.id || ""));

  // Commercial & Scale
  const [tier, setTier] = useState<WeddingTier>(wedding?.tier || "STANDARD");
  const [durationDays, setDurationDays] = useState<WeddingDurationDays>(
    normalizeDurationDays(wedding?.durationDays || 3)
  );
  const [capacity, setCapacity] = useState<number>(wedding?.capacity || 20);
  const [weddingScale, setWeddingScale] = useState(wedding?.weddingScale || "MEDIUM");
  const [experienceIntensity, setExperienceIntensity] = useState(
    wedding?.experienceIntensity || "TRADITIONAL"
  );
  const [description, setDescription] = useState(wedding?.description || "");
  const [foodContext, setFoodContext] = useState(wedding?.foodContext || "");
  const [dressExpectations, setDressExpectations] = useState(wedding?.dressExpectations || "");

  // Media
  const [mainImageUrl, setMainImageUrl] = useState(
    wedding?.mainImageUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80"
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    wedding?.gallery?.map((g: any) => (typeof g === "string" ? g : g.imageUrl)) || []
  );

  // Safety & Review Flags
  const [legalReviewStatus, setLegalReviewStatus] = useState("PASSED");
  const [culturalReviewStatus, setCulturalReviewStatus] = useState("APPROVED");
  const [photographyPolicy, setPhotographyPolicy] = useState(
    wedding?.guestRules?.includes("Photography") ? "ALLOWED" : "WITH_PERMISSION"
  );
  const [guestRules, setGuestRules] = useState(
    wedding?.guestRules || "Global guests welcome as honored family observers & participants."
  );
  const [etiquetteNotes, setEtiquetteNotes] = useState(
    wedding?.etiquetteNotes || "Remove footwear before entering sacred ceremony pavilions."
  );
  const [marriageRegStatus, setMarriageRegStatus] = useState("VERIFIED");

  // Visibility & Discovery
  const [status, setStatus] = useState(wedding?.status || "DRAFT");
  const [featured, setFeatured] = useState<boolean>(wedding?.featured || false);
  const [sponsored, setSponsored] = useState<boolean>(wedding?.sponsored || false);
  const [sponsorshipStart, setSponsorshipStart] = useState(
    wedding?.sponsorshipStart ? new Date(wedding.sponsorshipStart).toISOString().split("T")[0] : ""
  );
  const [sponsorshipEnd, setSponsorshipEnd] = useState(
    wedding?.sponsorshipEnd ? new Date(wedding.sponsorshipEnd).toISOString().split("T")[0] : ""
  );
  const [isDemo, setIsDemo] = useState<boolean>(wedding?.isDemo ?? true);

  // Day-by-Day Events State
  const [events, setEvents] = useState<any[]>(
    wedding?.events?.length > 0
      ? wedding.events.map((e: any) => ({
          name: e.name || e.title,
          description: e.description || "",
          startTime: e.startTime || "10:00",
          endTime: e.endTime || "13:00",
          location: e.location || location,
          dressCode: e.dressCode || "",
          dayNumber: e.dayNumber || 1,
        }))
      : [
          {
            name: "Welcome & Cultural Gathering",
            description: "Family welcome tea, traditional greetings, and musical introduction.",
            startTime: "16:00",
            endTime: "20:00",
            location: location || "Palace Courtyard",
            dressCode: "Festive Indian Attire or Smart Casual",
            dayNumber: 1,
          },
        ]
  );

  // Authoritative Pricing Calculations
  const normDays = normalizeDurationDays(durationDays);
  const customerPriceUSD = getCustomerPriceUSD(tier, normDays);
  const hostPayoutINR = getHostPayoutPerGuestINR(tier, normDays);
  const agentPayoutINR = getAgentPayoutPerGuestINR(tier);
  const maxHostPayoutLakh = (hostPayoutINR * capacity) / 100000;

  // Add/Remove Events
  const addEvent = (dayNum: number) => {
    setEvents((prev) => [
      ...prev,
      {
        name: `Day ${dayNum} Event`,
        description: "",
        startTime: "11:00",
        endTime: "14:00",
        location: location || "Main Pavilion",
        dressCode: "",
        dayNumber: dayNum,
      },
    ]);
  };

  const removeEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEvent = (index: number, field: string, value: string | number) => {
    setEvents((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Add/Remove Gallery URLs
  const addGalleryUrl = () => {
    setGalleryUrls((prev) => [...prev, ""]);
  };

  const updateGalleryUrl = (index: number, url: string) => {
    setGalleryUrls((prev) => {
      const copy = [...prev];
      copy[index] = url;
      return copy;
    });
  };

  const removeGalleryUrl = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a wedding title.");
      return;
    }
    if (!location.trim()) {
      toast.error("Please enter a wedding location.");
      return;
    }
    if (!date) {
      toast.error("Please select a wedding start date.");
      return;
    }

    const payload = {
      title,
      description,
      location,
      category,
      religion: religion === "Other" ? (customTradition || "Other") : religion,
      tier,
      durationDays: Number(durationDays),
      ceremoniesCount: events.length || 3,
      experienceIntensity,
      weddingScale,
      date,
      pricePerGuest: customerPriceUSD,
      capacity: Number(capacity),
      requiredGuests: 0,
      theme: `${religion} Celebration`,
      dressCode: dressExpectations || "Festive Indian Attire",
      mainImageUrl,
      hostCoupleId,
      status,
      featured,
      sponsored,
      sponsorshipStart: sponsorshipStart || null,
      sponsorshipEnd: sponsorshipEnd || null,
      isDemo,
      foodContext,
      dressExpectations,
      guestRules,
      etiquetteNotes,
      events,
      gallery: galleryUrls.filter((u) => u.trim().length > 0),
    };

    startTransition(async () => {
      try {
        const { adminCreateWeddingAction, adminUpdateWeddingAction } = await import(
          "@/lib/actions/admin"
        );
        if (isEdit && wedding?.id) {
          await adminUpdateWeddingAction(wedding.id, payload);
          toast.success("Wedding celebration updated successfully!");
        } else {
          await adminCreateWeddingAction(payload);
          toast.success("New wedding celebration published to marketplace!");
        }
        router.push("/dashboard/admin/weddings");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Failed to save wedding. Please check inputs.");
      }
    });
  };

  // Construct mock preview object for preview drawer
  const previewWeddingDTO = {
    id: wedding?.id || "preview-id",
    slug: wedding?.slug || "preview-wedding",
    title: title || "Royal Indian Celebration",
    location: location || "Udaipur, Rajasthan",
    category,
    religion: religion === "Other" ? (customTradition || "Traditional") : religion,
    durationDays,
    ceremoniesCount: events.length || 3,
    guestsAllowed: capacity,
    guestsBooked: 0,
    pricePerGuest: customerPriceUSD,
    imageUrl: mainImageUrl,
    coupleImage: mainImageUrl,
    hostAvatar: mainImageUrl,
    featured,
    sponsored,
    isDemo,
    story: description || "Experience authentic cultural traditions and family hospitality.",
    timeline: events.map((e) => ({
      title: e.name,
      time: `${e.startTime} - ${e.endTime}`,
      description: e.description,
      date: `Day ${e.dayNumber || 1}`,
    })),
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-warm-200/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.625rem] font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
              Admin Wedding Control Suite
            </span>
            {isDemo && (
              <span className="bg-sky-50 text-sky-700 text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded-full border border-sky-200">
                Demo Listing
              </span>
            )}
          </div>
          <h1 className="font-display font-bold text-2xl text-charcoal-900">
            {isEdit ? `Edit "${wedding?.title}"` : "Create New Wedding Marketplace Experience"}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="btn btn-secondary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5"
          >
            <Eye size={15} /> Live Preview Card
          </button>

          <Link
            href="/dashboard/admin/weddings"
            className="px-4 py-2.5 rounded-xl border border-warm-200 text-xs font-bold text-charcoal-600 hover:bg-warm-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── SECTION 1: BASIC INFORMATION ─── */}
        <div className="bg-white border border-warm-200/70 rounded-3xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection("basic")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-warm-50/50 transition-colors border-b border-warm-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-charcoal-900">
                  Basic Wedding Details &amp; Cultural Tradition
                </h2>
                <p className="text-xs text-charcoal-500">
                  Celebration title, venue, host couple assignment, start date, and cultural style.
                </p>
              </div>
            </div>
            {openSections.basic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {openSections.basic && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Wedding Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Rajasthan Royal Heritage Celebration"
                    className="input-luxury w-full text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Host Couple Profile *
                  </label>
                  <select
                    value={hostCoupleId}
                    onChange={(e) => setHostCoupleId(e.target.value)}
                    required
                    className="input-luxury w-full text-sm bg-white"
                  >
                    {couples.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.user.name || c.user.email} (Expected: {c.expectedGuests || 300} guests)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Venue &amp; Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Heritage Palace, Jodhpur, Rajasthan"
                    className="input-luxury w-full text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-luxury w-full text-sm bg-white"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-luxury w-full text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Tradition / Cultural Style *
                  </label>
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="input-luxury w-full text-sm bg-white font-medium"
                  >
                    {TRADITION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {religion === "Other" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                      Specify Custom Tradition *
                    </label>
                    <input
                      type="text"
                      required
                      value={customTradition}
                      onChange={(e) => setCustomTradition(e.target.value)}
                      placeholder="e.g. Zoroastrian Parsi / Contemporary Regional"
                      className="input-luxury w-full text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── SECTION 2: COMMERCIAL TIER & PRICE ENGINE BINDING ─── */}
        <div className="bg-white border border-warm-200/70 rounded-3xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection("commercial")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-warm-50/50 transition-colors border-b border-warm-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-charcoal-900">
                  Experience Tier, Duration &amp; Authoritative Pricing
                </h2>
                <p className="text-xs text-charcoal-500">
                  Single-source-of-truth pricing engine calculation. No arbitrary manual pricing.
                </p>
              </div>
            </div>
            {openSections.commercial ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {openSections.commercial && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Experience Tier *
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as WeddingTier)}
                    className="input-luxury w-full text-sm bg-white font-bold"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="ENHANCED">Enhanced</option>
                    <option value="GRAND">Grand</option>
                    <option value="ROYAL">Royal</option>
                    <option value="SIGNATURE_ROYAL">Signature Royal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Duration (Days) *
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(normalizeDurationDays(Number(e.target.value)))}
                    className="input-luxury w-full text-sm bg-white font-bold"
                  >
                    <option value={1}>1 Day Celebration</option>
                    <option value={2}>2 Days Celebration</option>
                    <option value={3}>3 Days Celebration</option>
                    <option value={4}>4 Days Celebration</option>
                    <option value={5}>5 Days Celebration</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    International Guest Capacity *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="input-luxury w-full text-sm font-bold"
                  />
                </div>
              </div>

              {/* Authoritative Live Price Matrix Card */}
              <div className="p-5 bg-gradient-to-br from-warm-50 to-amber-50/40 rounded-2xl border border-warm-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                  <DollarSign size={15} className="text-emerald-600" />
                  Authoritative Commercial Summary ({tier} • {durationDays} Days)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                  <div className="bg-white p-3.5 rounded-xl border border-warm-200/60 shadow-2xs">
                    <span className="text-charcoal-400 font-bold block text-[0.625rem] uppercase">
                      Customer Price / Guest
                    </span>
                    <span className="font-display font-bold text-lg text-charcoal-900">
                      ${customerPriceUSD} USD
                    </span>
                    <span className="text-[0.625rem] text-charcoal-500 block">Locked via Master Matrix</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-warm-200/60 shadow-2xs">
                    <span className="text-charcoal-400 font-bold block text-[0.625rem] uppercase">
                      Fixed Host Payout / Guest
                    </span>
                    <span className="font-display font-bold text-lg text-[var(--color-brand-primary)]">
                      ₹{hostPayoutINR.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[0.625rem] text-charcoal-500 block">
                      Max Host Payout: ₹{maxHostPayoutLakh.toFixed(2)} Lakh
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-warm-200/60 shadow-2xs">
                    <span className="text-charcoal-400 font-bold block text-[0.625rem] uppercase">
                      Fixed Agent Payout / Guest
                    </span>
                    <span className="font-display font-bold text-lg text-emerald-700">
                      ₹{agentPayoutINR.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[0.625rem] text-charcoal-500 block">B2B Verified Commission</span>
                  </div>
                </div>
              </div>

              {/* Scale & Experience Intensity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Total Wedding Scale
                  </label>
                  <select
                    value={weddingScale}
                    onChange={(e) => setWeddingScale(e.target.value)}
                    className="input-luxury w-full text-sm bg-white"
                  >
                    {SCALE_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Experience Intensity
                  </label>
                  <select
                    value={experienceIntensity}
                    onChange={(e) => setExperienceIntensity(e.target.value)}
                    className="input-luxury w-full text-sm bg-white"
                  >
                    <option value="TRADITIONAL">Traditional (Balanced &amp; Welcoming)</option>
                    <option value="IMMERSIVE">Immersive (Deep ceremonial involvement)</option>
                    <option value="GRAND_ROYAL">Grand Royal (Palace multi-venue spectacle)</option>
                    <option value="ULTRA_LUXURY">Ultra Luxury (Private estate heritage)</option>
                  </select>
                </div>
              </div>

              {/* Story Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                  Story &amp; Experience Overview *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the wedding's unique cultural atmosphere, family welcome, and what international guests will experience..."
                  className="input-luxury w-full text-sm p-4 h-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── SECTION 3: DAY-BY-DAY ITINERARY ACCORDION ─── */}
        <div className="bg-white border border-warm-200/70 rounded-3xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection("itinerary")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-warm-50/50 transition-colors border-b border-warm-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-charcoal-900">
                  Day-by-Day Event Schedule ({events.length} Events across {durationDays} Days)
                </h2>
                <p className="text-xs text-charcoal-500">
                  Accurate multi-day event timings, locations, and guest participation notes.
                </p>
              </div>
            </div>
            {openSections.itinerary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {openSections.itinerary && (
            <div className="p-6 space-y-6">
              {Array.from({ length: durationDays }).map((_, dayIdx) => {
                const dayNum = dayIdx + 1;
                const dayEvents = events.filter((e) => (e.dayNumber || 1) === dayNum);

                return (
                  <div key={dayNum} className="border border-warm-200 rounded-2xl p-5 bg-warm-50/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-warm-200/70 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-[var(--color-brand-primary)] text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                          DAY {dayNum}
                        </span>
                        <h3 className="font-display font-bold text-sm text-charcoal-900">
                          Day {dayNum} Celebrations ({dayEvents.length} Events)
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => addEvent(dayNum)}
                        className="btn btn-secondary text-xs font-bold py-1.5 px-3 flex items-center gap-1"
                      >
                        <Plus size={13} /> Add Event to Day {dayNum}
                      </button>
                    </div>

                    {events.map((evt, idx) => {
                      if ((evt.dayNumber || 1) !== dayNum) return null;

                      return (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-warm-200/80 shadow-2xs space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <input
                              type="text"
                              value={evt.name}
                              onChange={(e) => updateEvent(idx, "name", e.target.value)}
                              placeholder="Event Name (e.g. Sangeet & Folk Music Night)"
                              className="input-luxury flex-1 text-sm font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => removeEvent(idx)}
                              className="text-rose-500 hover:text-rose-700 p-2 transition-colors"
                              title="Remove Event"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[0.625rem] font-bold text-charcoal-600 uppercase">Start Time</label>
                              <input
                                type="text"
                                value={evt.startTime}
                                onChange={(e) => updateEvent(idx, "startTime", e.target.value)}
                                placeholder="17:00"
                                className="input-luxury w-full text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[0.625rem] font-bold text-charcoal-600 uppercase">End Time</label>
                              <input
                                type="text"
                                value={evt.endTime}
                                onChange={(e) => updateEvent(idx, "endTime", e.target.value)}
                                placeholder="22:00"
                                className="input-luxury w-full text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[0.625rem] font-bold text-charcoal-600 uppercase">Location / Area</label>
                              <input
                                type="text"
                                value={evt.location}
                                onChange={(e) => updateEvent(idx, "location", e.target.value)}
                                placeholder="Main Courtyard"
                                className="input-luxury w-full text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[0.625rem] font-bold text-charcoal-600 uppercase">Event Description &amp; Activities</label>
                            <input
                              type="text"
                              value={evt.description}
                              onChange={(e) => updateEvent(idx, "description", e.target.value)}
                              placeholder="Folk dancers, henna station, dinner buffet, and family choreography..."
                              className="input-luxury w-full text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── SECTION 4: SAFETY, LEGAL & CULTURAL QUALITY GATE ─── */}
        <div className="bg-white border border-warm-200/70 rounded-3xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection("safety")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-warm-50/50 transition-colors border-b border-warm-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-charcoal-900">
                  Safety, Legal &amp; Cultural Quality Flags
                </h2>
                <p className="text-xs text-charcoal-500">
                  Platform disclaimers, guest participation rules, and photography etiquette.
                </p>
              </div>
            </div>
            {openSections.safety ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {openSections.safety && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Legal Review Status
                  </label>
                  <select
                    value={legalReviewStatus}
                    onChange={(e) => setLegalReviewStatus(e.target.value)}
                    className="input-luxury w-full text-xs bg-white font-semibold"
                  >
                    <option value="PASSED">Passed (Standard)</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="NEEDS_ACTION">Needs Action</option>
                    <option value="NOT_APPLICABLE">Not Applicable</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Cultural Review Status
                  </label>
                  <select
                    value={culturalReviewStatus}
                    onChange={(e) => setCulturalReviewStatus(e.target.value)}
                    className="input-luxury w-full text-xs bg-white font-semibold"
                  >
                    <option value="APPROVED">Approved (Respectful)</option>
                    <option value="REVIEWED">Reviewed with Notes</option>
                    <option value="NEEDS_CLARIFICATION">Needs Clarification</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Photography Policy
                  </label>
                  <select
                    value={photographyPolicy}
                    onChange={(e) => setPhotographyPolicy(e.target.value)}
                    className="input-luxury w-full text-xs bg-white font-semibold"
                  >
                    <option value="ALLOWED">Allowed in Celebration Areas</option>
                    <option value="WITH_PERMISSION">Allowed with Host Permission</option>
                    <option value="RESTRICTED">Restricted during Sacred Rites</option>
                    <option value="NOT_ALLOWED">Not Allowed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Marriage Registration (Internal)
                  </label>
                  <select
                    value={marriageRegStatus}
                    onChange={(e) => setMarriageRegStatus(e.target.value)}
                    className="input-luxury w-full text-xs bg-white font-semibold"
                  >
                    <option value="VERIFIED">Verified with Registrar</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                    <option value="NOT_PROVIDED">Not Provided</option>
                    <option value="NOT_APPLICABLE">Not Applicable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Guest Participation Guidance
                  </label>
                  <input
                    type="text"
                    value={guestRules}
                    onChange={(e) => setGuestRules(e.target.value)}
                    placeholder="e.g. Guests join dancing and music; observe sacred rites respectfully."
                    className="input-luxury w-full text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Cultural Etiquette Notes
                  </label>
                  <input
                    type="text"
                    value={etiquetteNotes}
                    onChange={(e) => setEtiquetteNotes(e.target.value)}
                    placeholder="e.g. Remove shoes near mandap; scarves provided for head covering."
                    className="input-luxury w-full text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── SECTION 5: MEDIA & GALLERY ─── */}
        <div className="bg-white border border-warm-200/70 rounded-3xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection("media")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-warm-50/50 transition-colors border-b border-warm-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-charcoal-900">
                  Media, Hero Photo &amp; Gallery ({galleryUrls.length} Gallery Photos)
                </h2>
                <p className="text-xs text-charcoal-500">
                  High-resolution palace, venue, and authentic celebration photography.
                </p>
              </div>
            </div>
            {openSections.media ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {openSections.media && (
            <div className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                  Hero Showcase Image URL *
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="url"
                    required
                    value={mainImageUrl}
                    onChange={(e) => setMainImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="input-luxury flex-1 text-sm font-mono"
                  />
                  {mainImageUrl && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-warm-200 border border-warm-300 shrink-0">
                      <Image src={mainImageUrl} alt="Hero" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery URLs */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Additional Gallery Images
                  </label>
                  <button
                    type="button"
                    onClick={addGalleryUrl}
                    className="btn btn-secondary text-xs font-bold py-1 px-3 flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Photo URL
                  </button>
                </div>

                <div className="space-y-2">
                  {galleryUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateGalleryUrl(idx, e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="input-luxury flex-1 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryUrl(idx)}
                        className="text-rose-500 hover:text-rose-700 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── SECTION 6: VISIBILITY & PUBLISHING GATE ─── */}
        <div className="bg-white border border-warm-200/70 rounded-3xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => toggleSection("visibility")}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-warm-50/50 transition-colors border-b border-warm-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                6
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-charcoal-900">
                  Visibility, Featured &amp; Publishing Gate
                </h2>
                <p className="text-xs text-charcoal-500">
                  Control marketplace status, Featured home showcase, and Sponsored campaign dates.
                </p>
              </div>
            </div>
            {openSections.visibility ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {openSections.visibility && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Marketplace Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input-luxury w-full text-sm bg-white font-bold"
                  >
                    <option value="DRAFT">DRAFT (Unpublished)</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PUBLISHED">PUBLISHED (Live Marketplace)</option>
                    <option value="COMPLETED">COMPLETED (Archived)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Featured Showcase
                  </label>
                  <select
                    value={featured ? "true" : "false"}
                    onChange={(e) => setFeatured(e.target.value === "true")}
                    className="input-luxury w-full text-sm bg-white font-semibold"
                  >
                    <option value="false">Standard Listing (Featured OFF)</option>
                    <option value="true">Featured Showcase (Featured ON)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Sponsored Campaign
                  </label>
                  <select
                    value={sponsored ? "true" : "false"}
                    onChange={(e) => setSponsored(e.target.value === "true")}
                    className="input-luxury w-full text-sm bg-white font-semibold"
                  >
                    <option value="false">Organic (Sponsored OFF)</option>
                    <option value="true">Sponsored Priority (Sponsored ON)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    Demo Seed Flag
                  </label>
                  <select
                    value={isDemo ? "true" : "false"}
                    onChange={(e) => setIsDemo(e.target.value === "true")}
                    className="input-luxury w-full text-sm bg-white font-semibold"
                  >
                    <option value="true">Demo Seed Listing (isDemo: true)</option>
                    <option value="false">Real Host Celebration (isDemo: false)</option>
                  </select>
                </div>
              </div>

              {sponsored && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900 uppercase">Sponsorship Start Date</label>
                    <input
                      type="date"
                      value={sponsorshipStart}
                      onChange={(e) => setSponsorshipStart(e.target.value)}
                      className="input-luxury w-full text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900 uppercase">Sponsorship End Date</label>
                    <input
                      type="date"
                      value={sponsorshipEnd}
                      onChange={(e) => setSponsorshipEnd(e.target.value)}
                      className="input-luxury w-full text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-warm-300 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-charcoal-600">
            <span className="font-bold text-charcoal-900">
              {durationDays} Days • {tier} Tier • ${customerPriceUSD}/guest
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Status: {status}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="btn btn-secondary text-xs font-bold py-2.5 px-4 flex-1 sm:flex-initial"
            >
              Preview Card
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary text-xs font-bold py-2.5 px-6 flex-1 sm:flex-initial"
            >
              {isPending ? "Saving Celebration..." : isEdit ? "Save Changes" : "Publish Celebration"}
            </button>
          </div>
        </div>
      </form>

      {/* ─── LIVE PREVIEW MODAL ─── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--color-brand-secondary)]" />
                Live Marketplace Card Preview
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-xs font-bold text-charcoal-400 hover:text-charcoal-700"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-w-sm mx-auto">
              <WeddingCard wedding={previewWeddingDTO as any} hidePrice={true} />
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="btn btn-primary text-xs font-bold py-2 px-6"
              >
                Back to Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
