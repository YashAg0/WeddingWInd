"use client";

import React, { useState } from "react";
import SettingsSection from "@/components/dashboard/SettingsSection";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  // States
  const [appearance, setAppearance] = useState("light");
  const [language, setLanguage] = useState("english");
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  
  const [profileVisible, setProfileVisible] = useState(true);
  const [allowContact, setAllowContact] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          Account Settings
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Customize your experience, configure alerts, and adjust security preferences.
        </p>
      </div>

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
              <h4 className="font-sans font-bold text-emerald-800 text-sm">Settings Saved!</h4>
              <p className="text-emerald-700 text-xs mt-0.5">
                Your preferences have been successfully updated.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Appearance */}
        <SettingsSection title="Appearance" description="Toggle dashboard theme and language scale.">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-charcoal-850">Select Theme</h4>
              <p className="text-charcoal-500 text-[0.6875rem] mt-0.5">Choose light or dark workspace interface.</p>
            </div>
            <select
              value={appearance}
              onChange={(e) => setAppearance(e.target.value)}
              className="input-luxury max-w-xs bg-white font-semibold cursor-pointer"
            >
              <option value="light">Light Luxury Mode</option>
              <option value="dark">Dark Charcoal Mode (Preview)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-warm-100/50">
            <div>
              <h4 className="text-xs font-bold text-charcoal-850">System Language</h4>
              <p className="text-charcoal-500 text-[0.6875rem] mt-0.5">Preferred language for notifications and emails.</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-luxury max-w-xs bg-white font-semibold cursor-pointer"
            >
              <option value="english">English (US)</option>
              <option value="hindi">Hindi (India)</option>
              <option value="japanese">Japanese (Japan)</option>
            </select>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" description="Choose how and when you want to receive alerts.">
          <div className="flex items-center justify-between">
            <div className="max-w-md">
              <h4 className="text-xs font-bold text-charcoal-850">Email Alerts</h4>
              <p className="text-charcoal-500 text-[0.6875rem] mt-0.5">Receive wedding application confirmations, updates, and safety guide checklists via email.</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-5 h-5 accent-[var(--color-brand-primary)] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-warm-100/50">
            <div className="max-w-md">
              <h4 className="text-xs font-bold text-charcoal-850">Push Notifications</h4>
              <p className="text-charcoal-500 text-[0.6875rem] mt-0.5">Receive immediate status indicators and dashboard alerts inside your browser.</p>
            </div>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={(e) => setPushAlerts(e.target.checked)}
              className="w-5 h-5 accent-[var(--color-brand-primary)] cursor-pointer"
            />
          </div>
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy & Security" description="Configure profile discoverability and passwords.">
          <div className="flex items-center justify-between">
            <div className="max-w-md">
              <h4 className="text-xs font-bold text-charcoal-850">Discoverable Profile</h4>
              <p className="text-charcoal-500 text-[0.6875rem] mt-0.5">Allow host families or travelers to search your registered account profile.</p>
            </div>
            <input
              type="checkbox"
              checked={profileVisible}
              onChange={(e) => setProfileVisible(e.target.checked)}
              className="w-5 h-5 accent-[var(--color-brand-primary)] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-warm-100/50">
            <div className="max-w-md">
              <h4 className="text-xs font-bold text-charcoal-850">Enable Direct Liaison Contact</h4>
              <p className="text-charcoal-500 text-[0.6875rem] mt-0.5">Allow our on-ground compliance representatives to contact you directly on WhatsApp for safety checks.</p>
            </div>
            <input
              type="checkbox"
              checked={allowContact}
              onChange={(e) => setAllowContact(e.target.checked)}
              className="w-5 h-5 accent-[var(--color-brand-primary)] cursor-pointer"
            />
          </div>
        </SettingsSection>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="btn btn-primary btn-md shadow-md cursor-pointer"
          >
            Save Settings
          </button>
        </div>

      </form>

    </div>
  );
}
