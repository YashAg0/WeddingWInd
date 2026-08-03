"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, CheckCircle2, Clock, MapPin, Award, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { COORDINATOR_MODEL } from "@/lib/constants/financial-model";
import { coordinatorMockStore } from "@/lib/mock-data-store";

export default function CoordinatorApplyPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    availability: "weekends", // weekends, weekdays, flexible
    eventExperience: "college_fest", // college_fest, hospitality, travel_guide, none
    languages: "English, Hindi",
    interestNote: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.city) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const newId = `CORD-APP-${Date.now()}`;
      coordinatorMockStore.addCoordinator({
        id: newId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        eventExperience: formData.eventExperience,
        availability: formData.availability,
        languages: formData.languages,
        status: "submitted"
      });
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      <div className="container-luxury max-w-3xl mx-auto space-y-8">
        
        {/* Navigation */}
        <Link
          href="/coordinators"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-[var(--color-brand-primary)] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Coordinator Program Overview
        </Link>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
            <Users size={13} />
            On-Ground Coordinator Roster Application
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal-900 leading-tight">
            Apply to Manage Global Guests
          </h1>
          <p className="text-charcoal-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Per-event-day contractor role. College fest & event management experience preferred.
          </p>
        </div>

        {submitted ? (
          /* Confirmation State */
          <div className="bg-white border border-warm-200/60 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Application Received — Pooling Roster
              </span>
              <h2 className="font-display font-bold text-2xl text-charcoal-900">
                Application Submitted, {formData.fullName}!
              </h2>
              <p className="text-charcoal-600 text-sm leading-relaxed">
                Thank you for applying for the <strong>{formData.city}</strong> regional coordinator roster.
              </p>
            </div>

            <div className="bg-warm-50 border border-warm-200 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3 text-xs text-charcoal-600">
              <h4 className="font-sans font-bold text-sm text-charcoal-900 border-b border-warm-200 pb-2">
                What Happens Next:
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Your profile is added to our active coordinator database for {formData.city}.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>When a wedding in your city receives international bookings, our event operations team will reach out via WhatsApp/Phone with schedule details & confirmed daily rate.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push("/weddings")}
                className="btn btn-primary px-8 py-3 font-bold"
              >
                Explore Active Weddings
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div className="border-b border-warm-200 pb-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Coordinator Application Form</h2>
              <p className="text-charcoal-500 text-xs mt-1">Provide your event experience and availability.</p>
            </div>

            {/* Compensation & Preference Notice */}
            <div className="bg-warm-50 border border-warm-200 p-4 rounded-2xl space-y-1.5 text-xs text-charcoal-600">
              <div className="flex items-center gap-2 text-charcoal-900 font-bold">
                <AlertCircle size={14} className="text-[var(--color-brand-primary)]" />
                <span>Role Terms & Preference:</span>
              </div>
              <p>• <strong>Compensation:</strong> {COORDINATOR_MODEL.COMPENSATION_LABEL}.</p>
              <p>• <strong>Preferred Experience:</strong> {COORDINATOR_MODEL.PREFERRED_QUALIFICATION}.</p>
              <p>• <strong>Deployment:</strong> {COORDINATOR_MODEL.DEPLOYMENT_NOTE}.</p>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">1. Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Varma"
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
                    placeholder="rohan@example.com"
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
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Current City / Region *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Experience & Skills */}
            <div className="space-y-4 pt-4 border-t border-warm-100">
              <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">2. Event Background & Languages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Relevant Event Experience</label>
                  <select
                    value={formData.eventExperience}
                    onChange={(e) => setFormData({ ...formData, eventExperience: e.target.value })}
                    className="input-luxury w-full bg-white text-sm cursor-pointer"
                  >
                    <option value="college_fest">College Fest / Campus Event Management (Preferred)</option>
                    <option value="hospitality">Hospitality / Hotel Front Desk</option>
                    <option value="travel_guide">Tour Guide / Cultural Liaison</option>
                    <option value="none">No prior event experience, but highly enthusiastic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1">Availability Window</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="input-luxury w-full bg-white text-sm cursor-pointer"
                  >
                    <option value="weekends">Weekend Events Only</option>
                    <option value="weekdays">Weekday Events Only</option>
                    <option value="flexible">Flexible (Weekdays & Weekends)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Languages Spoken fluently</label>
                <input
                  type="text"
                  placeholder="e.g. English, Hindi, French, Marwari"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className="input-luxury w-full bg-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Why do you want to manage wedding guests?</label>
                <textarea
                  rows={3}
                  placeholder="Share a short note about your interest in hospitality and cultural exchange..."
                  value={formData.interestNote}
                  onChange={(e) => setFormData({ ...formData, interestNote: e.target.value })}
                  className="input-luxury w-full bg-white text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-warm-200 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary px-8 py-3.5 shadow-md font-bold w-full sm:w-auto justify-center"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Coordinator Application"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
