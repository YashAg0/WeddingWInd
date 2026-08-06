"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, ShieldCheck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { HostJourneyDiagram } from "@/components/diagrams/HostJourneyDiagram";
import { BUSINESS_METRICS } from "@/lib/constants/business-metrics";
import { COMMISSION_MODEL, formatCurrencyINR, formatSecondaryCurrency } from "@/lib/constants/financial-model";
// Real Prisma API — no mock store

export default function ListWeddingPage() {
  const router = useRouter();

  const [guestCapacity, setGuestCapacity] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    hostName: "",
    email: "",
    phone: "",
    coupleNames: "",
    city: "",
    state: "",
    venue: "",
    weddingDate: "",
    durationDays: "3",
    religion: "Hinduism",
    story: "",
    photoUrl: ""
  });

  // Calculate estimated host payout (78% of core booking value per guest)
  const avgBookingINR = BUSINESS_METRICS.WEIGHTED_AVG_BOOKING_INR; // ₹13,799
  const hostSharePerGuest = (avgBookingINR * COMMISSION_MODEL.HOST_ALLOCATION_PERCENT) / 100; // ₹9,935.28
  const estimatedHostPayoutTotal = Math.round(hostSharePerGuest * guestCapacity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hostName || !formData.email || !formData.coupleNames || !formData.city || !formData.weddingDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/host-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName: formData.hostName,
          email: formData.email,
          phone: formData.phone,
          coupleNames: formData.coupleNames,
          city: formData.city,
          state: formData.state,
          venue: formData.venue,
          weddingDate: formData.weddingDate,
          durationDays: formData.durationDays,
          religion: formData.religion,
          story: formData.story,
          photoUrl: formData.photoUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80",
          intlGuestCapacity: guestCapacity
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
      toast.success("Application submitted and saved to database! Pending Verification.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20 rounded-[2.5rem]">
      <div className="container-luxury max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
            <Heart size={13} />
            Host Application & Celebration Gate
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-900 leading-tight">
            List Your Wedding as a <span className="text-gradient-brand">Verified Host</span>
          </h1>
          <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed">
            Welcome global travelers to your sacred celebration. Every celebration undergoes mandatory manual verification before going live.
          </p>
        </div>

        {/* Host Payout Transparency Banner */}
        <div className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">
              Transparent Host Economics
            </span>
            <h3 className="font-display font-bold text-2xl text-charcoal-900 leading-snug">
              Earn 78% Direct Payout
            </h3>
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              For an average booking value of {formatCurrencyINR(avgBookingINR)}, host families receive 78% ({formatCurrencyINR(Math.round(hostSharePerGuest))} per guest) safely released post-ceremony.
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                <span>International Guest Capacity</span>
                <span className="text-[var(--color-brand-primary)] font-black">{guestCapacity} Guests</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={guestCapacity}
                onChange={(e) => setGuestCapacity(Number(e.target.value))}
                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-primary)]"
              />
            </div>
          </div>

          <div className="bg-maroon-950 text-white p-6 sm:p-8 rounded-2xl text-center space-y-3 relative overflow-hidden">
            <span className="inline-block text-[0.625rem] font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Estimated Total Host Payout
            </span>
            <div className="font-display font-black text-3xl sm:text-4xl text-gradient-gold">
              {formatCurrencyINR(estimatedHostPayoutTotal)}
            </div>
            <p className="text-white/60 text-[0.6875rem]">
              {formatSecondaryCurrency(estimatedHostPayoutTotal)} · Released within 3 business days post-wedding
            </p>
          </div>
        </div>

        {/* On-Site Host Explainer Diagram */}
        <HostJourneyDiagram />

        {/* Verification Rules Callout */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3 text-amber-900 text-xs sm:text-sm leading-relaxed">
          <ShieldCheck size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Trust-First Celebration Policy:</strong> All wedding applications default to <span className="underline font-semibold">Pending Verification</span> status. Our local team conducts background checks and venue confirmation before approving your celebration for international bookings.
          </div>
        </div>

        {/* Form or Confirmation */}
        {submitted ? (
          <div className="bg-white border border-warm-200/60 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <Clock size={32} />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Status: Pending Verification
              </span>
              <h2 className="font-display font-bold text-2xl text-charcoal-900">
                Application Successfully Submitted!
              </h2>
              <p className="text-charcoal-600 text-sm leading-relaxed">
                Thank you, <strong>{formData.hostName}</strong>. Your celebration celebration for <strong>{formData.coupleNames}</strong> in {formData.city} has been received.
              </p>
            </div>

            <div className="bg-warm-50 border border-warm-200/60 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3 text-xs text-charcoal-600">
              <h4 className="font-sans font-bold text-sm text-charcoal-900 border-b border-warm-200 pb-2">
                Next Steps for Verification:
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Our regional verification coordinator will contact you via WhatsApp/Email within 24 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>We will confirm venue permissions, security guidelines, and guest itinerary details.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Once verified, your celebration will be active for global guests to book.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <button
                onClick={() => router.push("/weddings")}
                className="btn btn-primary px-8 py-3 font-bold"
              >
                Browse Active Celebrations
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div className="border-b border-warm-200 pb-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Host Application Form</h2>
              <p className="text-charcoal-500 text-xs mt-1">Please provide accurate details. All information is reviewed manually.</p>
            </div>

            {/* Host Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">1. Host & Contact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Host Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh & Sunita Mehra"
                    value={formData.hostName}
                    onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="host@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Bride & Groom Names *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya & Kabir"
                    value={formData.coupleNames}
                    onChange={(e) => setFormData({ ...formData, coupleNames: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4 pt-4 border-t border-warm-100">
              <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">2. Event Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Udaipur"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajasthan"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Venue Name / Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jagmandir Island Palace"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Wedding Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="input-luxury w-full bg-white text-sm cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Duration (Days)</label>
                  <select
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="input-luxury w-full bg-white text-sm cursor-pointer"
                  >
                    <option value="1">1 Day</option>
                    <option value="2">2 Days</option>
                    <option value="3">3 Days</option>
                    <option value="4">4+ Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Tradition / Religion</label>
                  <select
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="input-luxury w-full bg-white text-sm cursor-pointer"
                  >
                    <option value="Hinduism">Hindu Vedic</option>
                    <option value="Sikhism">Sikh Anand Karaj</option>
                    <option value="Islam">Muslim Nikah</option>
                    <option value="Christianity">Christian Matrimony</option>
                    <option value="Multicultural">Multicultural</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Story & Photos */}
            <div className="space-y-4 pt-4 border-t border-warm-100">
              <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">3. Story & Media</h3>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Couple Story & Welcome Note</label>
                <textarea
                  rows={3}
                  placeholder="Share a short note about how you met and why you want to welcome global guests..."
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  className="input-luxury w-full bg-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Photo URL (Venue or Couple)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="input-luxury w-full bg-white text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-warm-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-charcoal-500">
                <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                <span>Default status upon submission: <strong>Pending Verification</strong></span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary px-8 py-3.5 shadow-md font-bold w-full sm:w-auto justify-center"
              >
                {isSubmitting ? "Submitting..." : "Submit Celebration for Verification"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  
    </div>);
}
