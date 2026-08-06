"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, CheckCircle2 } from "lucide-react";
import { COMMISSION_MODEL } from "@/lib/constants/financial-model";
// Real Prisma API — no mock store

export default function AgentApplicationPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "India",
    city: "",
    focusArea: "both", // traveler, host, both
    networkType: "student", // student, hospitality, travel_creator, local_network
    networkDetails: "",
    agreedToTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.city || !formData.agreedToTerms) {
      toast.error("Please fill in required fields and agree to programme rules.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/agent-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          focusArea: formData.focusArea,
          networkType: formData.networkType,
          networkDetails: formData.networkDetails
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setGeneratedCode(data.applicationRef);
      toast.success("Application submitted and saved! Our team will review within 2–3 business days.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20 rounded-[2.5rem]">
      <div className="container-luxury max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
            <Users size={13} />
            Agent Onboarding Application (~10 mins)
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal-900 leading-tight">
            Become an Authorized Referral Partner
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Earn {COMMISSION_MODEL.AGENT_REFERRAL_PAYOUT_DEFAULT}% on traveler bookings and {COMMISSION_MODEL.HOST_REFERRAL_COMMISSION_PERCENT}% on host referrals upon completed celebrations.
          </p>
        </div>

        {/* Application State */}
        {generatedCode ? (
          <div className="bg-white border border-warm-200/60 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                Application Received — Under Review
              </span>
              <h2 className="font-display font-bold text-2xl text-charcoal-900">
                Thanks, {formData.fullName}!
              </h2>
              <p className="text-charcoal-600 text-sm max-w-md mx-auto">
                Your application is in our queue. Our team typically reviews within 2–3 business days. We&apos;ll contact you at <strong>{formData.email}</strong> with your unique referral code once approved.
              </p>
            </div>

            <div className="bg-warm-50 border border-warm-200 p-6 rounded-2xl max-w-md mx-auto space-y-2">
              <span className="text-xs font-bold text-charcoal-500 uppercase tracking-widest block">Your Application Reference</span>
              <div className="font-mono font-black text-2xl text-[var(--color-brand-primary)] bg-white py-3 px-4 rounded-xl border border-warm-300 tracking-wider shadow-xs">
                {generatedCode}
              </div>
              <span className="text-[0.6875rem] text-charcoal-400 block">
                Link Format: <code>https://weddingwithindia.com/?ref={generatedCode}</code>
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => router.push(`/for-agents/dashboard?code=${generatedCode}`)}
                className="btn btn-primary px-8 py-3.5 font-bold justify-center"
              >
                Go to Agent Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div className="border-b border-warm-200 pb-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Agent Registration Form</h2>
              <p className="text-charcoal-500 text-xs mt-1">Takes ~10 minutes to complete. No registration fee required.</p>
            </div>

            {/* Section 1: Contact Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">1. Personal Identification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Phone / WhatsApp *</label>
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
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Country & City *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="input-luxury w-full bg-white text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input-luxury w-full bg-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Focus & Network */}
            <div className="space-y-4 pt-4 border-t border-warm-100">
              <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">2. Referral Focus & Network</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Primary Referral Focus</label>
                  <select
                    value={formData.focusArea}
                    onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                    className="input-luxury w-full bg-white text-sm cursor-pointer"
                  >
                    <option value="traveler">Traveler Referrals (tiered commission (₹500-₹500))</option>
                    <option value="host">Host Family Referrals (4% commission)</option>
                    <option value="both">Both Traveler & Host Referrals</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Relevant Background / Network</label>
                  <select
                    value={formData.networkType}
                    onChange={(e) => setFormData({ ...formData, networkType: e.target.value })}
                    className="input-luxury w-full bg-white text-sm cursor-pointer"
                  >
                    <option value="student">Student / College Community</option>
                    <option value="hospitality">Hospitality & Tourism Professional</option>
                    <option value="travel_creator">Travel Blogger / Content Creator</option>
                    <option value="local_network">Local Family & Wedding Network</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Network Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe how you plan to introduce travelers or hosts to WeddingWithIndia..."
                  value={formData.networkDetails}
                  onChange={(e) => setFormData({ ...formData, networkDetails: e.target.value })}
                  className="input-luxury w-full bg-white text-sm"
                />
              </div>
            </div>

            {/* Section 3: Terms Agreement */}
            <div className="space-y-4 pt-4 border-t border-warm-100">
              <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">3. Programme Rules Acceptance</h3>
              <div className="bg-warm-50 border border-warm-200 p-4 rounded-2xl space-y-2 text-xs text-charcoal-600">
                <p className="font-semibold text-charcoal-800">By applying, you agree to the following rules:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Commissions are paid strictly on completed, cleared bookings (no lead/signup payments).</li>
                  <li>No salary, stipend, or guaranteed base income is provided.</li>
                  <li>Strictly independent partner status — no multi-level marketing or recruitment downlines.</li>
                </ul>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 rounded border-warm-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                />
                <span className="text-xs text-charcoal-700 leading-normal">
                  I understand and accept the programme rules, confirming my agreement to success-based referral terms.
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-warm-200 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary px-8 py-3.5 shadow-md font-bold w-full sm:w-auto justify-center"
              >
                {isSubmitting ? "Generating Referral Code..." : "Submit Application"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  
    </div>);
}
