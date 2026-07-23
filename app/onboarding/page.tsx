"use client";

import React, { useState } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Compass, ArrowRight, ArrowLeft, Check, Sparkles, User, Heart, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, updateRole, completeOnboarding } = useAuth();
  
  const redirectUrl = searchParams.get("redirect_url") || searchParams.get("returnTo") || undefined;

  const [role, setRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState(1);

  // Form states
  // 1. Traveler Data
  const [travelerData, setTravelerData] = useState({
    fullName: user?.name || "",
    country: "",
    language: "",
    interests: "",
    budget: "1000",
    preferences: "Traditional",
    foodPreferences: "No Restrictions",
    accessibility: "None"
  });

  // 2. Couple Data
  const [coupleData, setCoupleData] = useState({
    weddingDate: "",
    weddingLocation: "",
    expectedGuests: "200",
    traditions: "",
    languagesSpoken: "",
    photographyRules: "Allowed",
    familyBio: ""
  });

  // 3. Agent Data
  const [agentData, setAgentData] = useState({
    organization: "",
    country: "",
    experienceYears: "2",
    targetAudience: "",
    verifiedChecks: false
  });

  // Protect route
  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        const loginTarget = redirectUrl
          ? `/login?redirect_url=${encodeURIComponent(redirectUrl)}`
          : "/login";
        router.replace(loginTarget);
      } else if (user.onboarded) {
        router.replace(redirectUrl || "/dashboard");
      }
    }
  }, [user, loading, router, redirectUrl]);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    updateRole(selectedRole);
    setStep(2);
  };

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleComplete = () => {
    if (role === "traveler") {
      completeOnboarding(travelerData, redirectUrl);
    } else if (role === "couple") {
      completeOnboarding(coupleData, redirectUrl);
    } else {
      completeOnboarding(agentData, redirectUrl);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Compass className="animate-spin text-[var(--color-brand-primary)] mx-auto" size={40} />
          <p className="text-charcoal-500 font-medium">Synchronizing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-warm-200/50 rounded-[2.5rem] p-6 sm:p-10 shadow-luxury space-y-6 relative overflow-hidden">
        
        {/* Header decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--color-maroon-50),_transparent)] -z-10" />

        {/* Step Indicator */}
        {role && step > 1 && step < 5 && (
          <div className="flex justify-between items-center text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest">
            <button onClick={handlePrevStep} className="flex items-center gap-1 hover:text-charcoal-800 cursor-pointer">
              <ArrowLeft size={10} /> Back
            </button>
            <span>Step {step - 1} of 3</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STAGE 1: Role Selection */}
          {step === 1 && (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-[0.625rem] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-maroon-100/50">
                  <Compass size={11} /> Role Selection
                </span>
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 leading-tight">
                  Choose your path
                </h1>
                <p className="text-charcoal-400 text-xs sm:text-sm max-w-sm mx-auto">
                  Select your role to personalize your onboarding journey and dashboard workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                
                {/* Traveler Option */}
                <button
                  onClick={() => handleRoleSelect("traveler")}
                  className="flex items-center gap-4 text-left p-5 border border-warm-200 rounded-2xl hover:border-[var(--color-brand-primary)] hover:bg-maroon-50/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-colors duration-200">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-charcoal-800">Traveler / Guest</h3>
                    <p className="text-charcoal-500 text-xs mt-1 leading-normal">
                      Discover authentic weddings, purchase tourist tickets, and celebrate cultural rituals as an honored family guest.
                    </p>
                  </div>
                </button>

                {/* Couple Option */}
                <button
                  onClick={() => handleRoleSelect("couple")}
                  className="flex items-center gap-4 text-left p-5 border border-warm-200 rounded-2xl hover:border-[var(--color-brand-primary)] hover:bg-maroon-50/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-colors duration-200">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-charcoal-800">Host Family / Couple</h3>
                    <p className="text-charcoal-500 text-xs mt-1 leading-normal">
                      List your upcoming wedding, review guest applications, share traditions, and secure hosting payouts.
                    </p>
                  </div>
                </button>

                {/* Agent Option */}
                <button
                  onClick={() => handleRoleSelect("agent")}
                  className="flex items-center gap-4 text-left p-5 border border-warm-200 rounded-2xl hover:border-[var(--color-brand-primary)] hover:bg-maroon-50/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-brand-primary)] group-hover:text-white transition-colors duration-200">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-charcoal-800">Partner / Agent</h3>
                    <p className="text-charcoal-500 text-xs mt-1 leading-normal">
                      Promote cultural wedding packages, recruit travelers, manage links, and earn monthly referral commissions.
                    </p>
                  </div>
                </button>

              </div>
            </motion.div>
          )}

          {/* STAGE 2: Traveler Onboarding Forms */}
          {role === "traveler" && step === 2 && (
            <motion.div key="traveler-form-1" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Personal Information</h2>
              <p className="text-charcoal-400 text-xs">Let&apos;s build your guest profile cards.</p>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="traveler-fullname" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Full Name</label>
                  <input
                    id="traveler-fullname"
                    type="text"
                    required
                    value={travelerData.fullName}
                    onChange={(e) => setTravelerData({ ...travelerData, fullName: e.target.value })}
                    className="input-luxury"
                    placeholder="Sarah Jenkins"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="traveler-country" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Country of Residence</label>
                  <input
                    id="traveler-country"
                    type="text"
                    required
                    value={travelerData.country}
                    onChange={(e) => setTravelerData({ ...travelerData, country: e.target.value })}
                    className="input-luxury"
                    placeholder="United Kingdom"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="traveler-language" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Preferred Language</label>
                  <input
                    id="traveler-language"
                    type="text"
                    required
                    value={travelerData.language}
                    onChange={(e) => setTravelerData({ ...travelerData, language: e.target.value })}
                    className="input-luxury"
                    placeholder="English"
                  />
                </div>
              </div>

              <button onClick={handleNextStep} className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group mt-2">
                Continue
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {role === "traveler" && step === 3 && (
            <motion.div key="traveler-form-2" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Interests & Travel Budget</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="traveler-interests" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Travel Interests</label>
                  <textarea
                    id="traveler-interests"
                    value={travelerData.interests}
                    onChange={(e) => setTravelerData({ ...travelerData, interests: e.target.value })}
                    className="input-luxury resize-none"
                    placeholder="Mehndi patterns, folk dancing, regional cuisines..."
                    rows={3}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="traveler-budget" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Estimated Wedding Budget</label>
                  <select
                    id="traveler-budget"
                    value={travelerData.budget}
                    onChange={(e) => setTravelerData({ ...travelerData, budget: e.target.value })}
                    className="input-luxury bg-white font-semibold cursor-pointer"
                  >
                    <option value="1000">Up to $1,000</option>
                    <option value="2500">$1,000 - $3,000</option>
                    <option value="5000">Above $3,000</option>
                  </select>
                </div>
              </div>

              <button onClick={handleNextStep} className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group mt-2">
                Continue
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {role === "traveler" && step === 4 && (
            <motion.div key="traveler-form-3" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Preferences & Needs</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="traveler-preferences" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Wedding Style preferences</label>
                  <select
                    id="traveler-preferences"
                    value={travelerData.preferences}
                    onChange={(e) => setTravelerData({ ...travelerData, preferences: e.target.value })}
                    className="input-luxury bg-white font-semibold cursor-pointer"
                  >
                    <option value="Traditional">Traditional Heritage</option>
                    <option value="Royal">Royal Palace</option>
                    <option value="Beach">Oceanside Resort</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="traveler-food" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Food Preferences</label>
                  <input
                    id="traveler-food"
                    type="text"
                    value={travelerData.foodPreferences}
                    onChange={(e) => setTravelerData({ ...travelerData, foodPreferences: e.target.value })}
                    className="input-luxury"
                    placeholder="Vegetarian, Halal, Gluten Free..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="traveler-accessibility" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Accessibility Needs</label>
                  <input
                    id="traveler-accessibility"
                    type="text"
                    value={travelerData.accessibility}
                    onChange={(e) => setTravelerData({ ...travelerData, accessibility: e.target.value })}
                    className="input-luxury"
                    placeholder="Wheelchair access, ground-floor lodgings..."
                  />
                </div>
              </div>

              <button onClick={handleNextStep} className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group mt-2">
                Save & Complete
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* STAGE 2: Couple Onboarding Forms */}
          {role === "couple" && step === 2 && (
            <motion.div key="couple-form-1" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Wedding Details</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="couple-date" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Wedding Date</label>
                  <input
                    id="couple-date"
                    type="date"
                    required
                    value={coupleData.weddingDate}
                    onChange={(e) => setCoupleData({ ...coupleData, weddingDate: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="couple-location" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Wedding Location / Venue</label>
                  <input
                    id="couple-location"
                    type="text"
                    required
                    value={coupleData.weddingLocation}
                    onChange={(e) => setCoupleData({ ...coupleData, weddingLocation: e.target.value })}
                    className="input-luxury"
                    placeholder="e.g. Umaid Bhawan Palace, Jodhpur"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="couple-guests" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Expected Guests Count</label>
                  <input
                    id="couple-guests"
                    type="number"
                    value={coupleData.expectedGuests}
                    onChange={(e) => setCoupleData({ ...coupleData, expectedGuests: e.target.value })}
                    className="input-luxury"
                    placeholder="300"
                  />
                </div>
              </div>

              <button onClick={handleNextStep} className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group mt-2">
                Continue
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {role === "couple" && step === 3 && (
            <motion.div key="couple-form-2" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Traditions & Language</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="couple-traditions" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Wedding Traditions / Religion</label>
                  <input
                    id="couple-traditions"
                    type="text"
                    value={coupleData.traditions}
                    onChange={(e) => setCoupleData({ ...coupleData, traditions: e.target.value })}
                    className="input-luxury"
                    placeholder="Sikh Anand Karaj, Hindu Vedic Pheras..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="couple-languages" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Languages Spoken by Family</label>
                  <input
                    id="couple-languages"
                    type="text"
                    value={coupleData.languagesSpoken}
                    onChange={(e) => setCoupleData({ ...coupleData, languagesSpoken: e.target.value })}
                    className="input-luxury"
                    placeholder="Punjabi, Hindi, English..."
                  />
                </div>
              </div>

              <button onClick={handleNextStep} className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group mt-2">
                Continue
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {role === "couple" && step === 4 && (
            <motion.div key="couple-form-3" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Photography & Family Intro</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="couple-photo" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Photography Rules</label>
                  <select
                    id="couple-photo"
                    value={coupleData.photographyRules}
                    onChange={(e) => setCoupleData({ ...coupleData, photographyRules: e.target.value })}
                    className="input-luxury bg-white font-semibold cursor-pointer"
                  >
                    <option value="Allowed">Allowed freely</option>
                    <option value="Restricted">Restricted (Ceremonies only)</option>
                    <option value="Prohibited">Prohibited entirely</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="couple-bio" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Family Introduction / Bio</label>
                  <textarea
                    id="couple-bio"
                    value={coupleData.familyBio}
                    onChange={(e) => setCoupleData({ ...coupleData, familyBio: e.target.value })}
                    className="input-luxury resize-none"
                    placeholder="Tell global guests a little bit about your family and background..."
                    rows={4}
                  />
                </div>
              </div>

              <button onClick={handleNextStep} className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group mt-2">
                Save & Complete
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* STAGE 2: Agent Onboarding Forms */}
          {role === "agent" && step === 2 && (
            <motion.div key="agent-form-1" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Agency & Personal Info</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="agent-org" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Organization / Agency Name</label>
                  <input
                    id="agent-org"
                    type="text"
                    required
                    value={agentData.organization}
                    onChange={(e) => setAgentData({ ...agentData, organization: e.target.value })}
                    className="input-luxury"
                    placeholder="e.g. Travel Abroad Co."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="agent-country" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Base Country</label>
                  <input
                    id="agent-country"
                    type="text"
                    required
                    value={agentData.country}
                    onChange={(e) => setAgentData({ ...agentData, country: e.target.value })}
                    className="input-luxury"
                    placeholder="United States"
                  />
                </div>
              </div>

              <button onClick={handleNextStep} className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group mt-2">
                Continue
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {role === "agent" && step === 3 && (
            <motion.div key="agent-form-2" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Experience & Audience</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="agent-experience" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Years of Travel Experience</label>
                  <input
                    id="agent-experience"
                    type="number"
                    value={agentData.experienceYears}
                    onChange={(e) => setAgentData({ ...agentData, experienceYears: e.target.value })}
                    className="input-luxury"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="agent-audience" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Target Travel Audience</label>
                  <input
                    id="agent-audience"
                    type="text"
                    value={agentData.targetAudience}
                    onChange={(e) => setAgentData({ ...agentData, targetAudience: e.target.value })}
                    className="input-luxury"
                    placeholder="Study abroad students, luxury travel seekers..."
                  />
                </div>
              </div>

              <button onClick={handleNextStep} className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group mt-2">
                Continue
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {role === "agent" && step === 4 && (
            <motion.div key="agent-form-3" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Partner Checklist</h2>
              
              <div className="space-y-4 bg-warm-50 p-5 rounded-2xl border border-warm-200/50">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agentData.verifiedChecks}
                    onChange={(e) => setAgentData({ ...agentData, verifiedChecks: e.target.checked })}
                    className="mt-1 w-4.5 h-4.5 accent-[var(--color-brand-primary)] cursor-pointer"
                  />
                  <div className="text-xs sm:text-sm text-charcoal-700 leading-normal">
                    <strong>Vetted Terms Agreement:</strong> I agree to uphold brand identity guidelines, match verified guests, and confirm compliance with local community hosting laws.
                  </div>
                </label>
              </div>

              <button
                onClick={handleNextStep}
                disabled={!agentData.verifiedChecks}
                className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Complete
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* STAGE 3: Onboarding Success Screen */}
          {step === 5 && (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-md">
                <Check size={28} />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 font-bold uppercase tracking-wider">
                  <Sparkles size={12} /> Complete
                </span>
                <h2 className="font-display font-bold text-2xl text-charcoal-900">
                  Profile configured!
                </h2>
                <p className="text-charcoal-500 text-xs sm:text-sm max-w-sm mx-auto">
                  Your details have been successfully saved to your local profile context. Let&apos;s open your dashboard workspace.
                </p>
              </div>

              <button onClick={handleComplete} className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group">
                Enter Dashboard
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-warm-50 flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-800 animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </React.Suspense>
  );
}
