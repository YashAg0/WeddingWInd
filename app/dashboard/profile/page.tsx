"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileCard from "@/components/dashboard/ProfileCard";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: user?.country || "",
    bio: user?.bio || ""
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Account Profile
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          View and edit your personal details, biography, and credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: Summary */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileCard onEditToggle={() => setIsEditing(!isEditing)} isEditing={isEditing} />

          {/* Profile Completion Card */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-3xl shadow-sm space-y-3">
            <h4 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest">
              Profile Strength
            </h4>
            <div className="flex justify-between items-center text-xs font-bold text-charcoal-850">
              <span>Setup Complete</span>
              <span className="text-[var(--color-brand-primary)]">100%</span>
            </div>
            <div className="w-full bg-warm-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-brand h-full w-full rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Form: Details */}
        <div className="lg:col-span-8 space-y-6">
          
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={16} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-emerald-800 text-sm">Profile Saved!</h4>
                  <p className="text-emerald-700 text-xs mt-0.5">
                    Your profile has been successfully updated.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isEditing ? (
            <form onSubmit={handleSave} className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
              <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3">
                Edit Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-name" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Full Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-luxury"
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-email" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-luxury"
                  />
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-country" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Country</label>
                  <input
                    id="edit-country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input-luxury"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-phone" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Phone Number</label>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-luxury"
                    placeholder="+1 555-0199"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-bio" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">Biography</label>
                <textarea
                  id="edit-bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="input-luxury resize-none"
                  rows={4}
                  placeholder="Describe your background and interests..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-warm-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline btn-sm shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
              <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3">
                Profile Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs sm:text-sm">
                <div>
                  <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest block mb-0.5">Full Name</span>
                  <span className="font-semibold text-charcoal-800">{user?.name}</span>
                </div>
                <div>
                  <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest block mb-0.5">Email Address</span>
                  <span className="font-semibold text-charcoal-800">{user?.email}</span>
                </div>
                <div>
                  <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest block mb-0.5">Country</span>
                  <span className="font-semibold text-charcoal-800">{user?.country || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[0.625rem] font-bold text-charcoal-400 uppercase tracking-widest block mb-0.5">Phone Number</span>
                  <span className="font-semibold text-charcoal-800">{user?.phone || "Not specified"}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
