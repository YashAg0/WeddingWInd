"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FileText,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Scale,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { LEGAL_CONFIG } from "@/lib/constants/legal";
import { cn } from "@/lib/utils";

type TabKey = "terms" | "privacy" | "safety";

export function TrustPortalClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabParam === "privacy" || tabParam === "safety" ? tabParam : "terms"
  );

  useEffect(() => {
    if (tabParam && (tabParam === "terms" || tabParam === "privacy" || tabParam === "safety")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.push(`/trust?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-8">
      {/* 3-Tab Pill Navigation */}
      <div className="flex items-center justify-center p-1.5 bg-white border border-warm-200/80 rounded-2xl shadow-xs max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => handleTabChange("terms")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
            activeTab === "terms"
              ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
              : "text-charcoal-600 hover:text-charcoal-900 hover:bg-warm-50"
          )}
        >
          <FileText size={16} />
          <span>Terms & Policies</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("privacy")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
            activeTab === "privacy"
              ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
              : "text-charcoal-600 hover:text-charcoal-900 hover:bg-warm-50"
          )}
        >
          <Lock size={16} />
          <span>Privacy & Data</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("safety")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
            activeTab === "safety"
              ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
              : "text-charcoal-600 hover:text-charcoal-900 hover:bg-warm-50"
          )}
        >
          <ShieldAlert size={16} />
          <span>Safety & Grievance</span>
        </button>
      </div>

      {/* Main Tab Content Card */}
      <div className="bg-white border border-warm-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
        
        {/* ========================================================================= */}
        {/* TAB 1: TERMS & POLICIES                                                  */}
        {/* ========================================================================= */}
        {activeTab === "terms" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Intermediary Disclosure */}
            <div className="p-5 rounded-2xl bg-warm-50 border border-warm-200 space-y-2">
              <h2 className="font-display font-bold text-base text-charcoal-900">
                Statutory Intermediary Notice
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                {LEGAL_CONFIG.INTERMEDIARY_DISCLOSURE}
              </p>
            </div>

            {/* Core Terms Section */}
            <section id="booking-terms" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-2">
                1. General Platform Terms & Booking Agreement
              </h2>
              <p>
                By booking or registering through WeddingWithIndia, you enter into a binding agreement governing event access, guest responsibilities, verification standards, and code of conduct.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-charcoal-600">
                <li><strong>Guest Passes:</strong> Issued as non-transferable AES-256 encrypted QR passes.</li>
                <li><strong>Pricing Authority:</strong> All bookings settled authoritatively in INR; currency display (USD, EUR, GBP, AUD, CAD, SGD, AED) serves as real-time estimate.</li>
                <li><strong>Event Modifications:</strong> Host families reserve reasonable discretion over ceremony sequences while preserving core guest itinerary commitments.</li>
              </ul>
            </section>

            {/* Cancellation & Refund Policy */}
            <section id="cancellation" className="space-y-4 pt-4 border-t border-warm-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-display font-bold text-xl text-charcoal-900">
                  2. 4-Tier Cancellation & Refund Policy
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 w-fit">
                  <ShieldCheck size={13} />
                  Escrow Protected
                </span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600">
                To balance traveler flexibility with host preparation costs (catering, attire, on-ground coordinator allocation), the following refund tiers apply to all confirmed reservations:
              </p>

              <div className="overflow-x-auto rounded-2xl border border-warm-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-warm-50 text-charcoal-900 font-bold border-b border-warm-200">
                    <tr>
                      <th className="px-4 py-3">Cancellation Window</th>
                      <th className="px-4 py-3">Refund Amount</th>
                      <th className="px-4 py-3">Reasoning & Retained Fees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-charcoal-900">More than 30 days before event</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">85%–90% Refund</td>
                      <td className="px-4 py-3 text-charcoal-500">10–15% administrative & payment hold fee retained</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-charcoal-900">15 to 30 days before event</td>
                      <td className="px-4 py-3 font-bold text-amber-700">50%–70% Refund</td>
                      <td className="px-4 py-3 text-charcoal-500">Locked host preparations and attire reservation fee retained</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-charcoal-900">7 to 14 days before event</td>
                      <td className="px-4 py-3 font-bold text-orange-700">40% Refund</td>
                      <td className="px-4 py-3 text-charcoal-500">Committed coordinator allocation and catering headcount hold</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-charcoal-900">Less than 7 days / No-Show</td>
                      <td className="px-4 py-3 font-bold text-red-700">0% (Non-refundable)</td>
                      <td className="px-4 py-3 text-charcoal-500">Finalized food & logistics commitments incurred by host</td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td className="px-4 py-3 font-semibold text-emerald-950">Host Cancellation / Safety Case</td>
                      <td className="px-4 py-3 font-bold text-emerald-800">100% Full Refund</td>
                      <td className="px-4 py-3 text-emerald-900">Full platform refund guarantee upon verified host cancellation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sub-Agreements Accordion Index */}
            <section className="space-y-3 pt-4 border-t border-warm-100">
              <h3 className="font-display font-bold text-base text-charcoal-900">
                Associated Marketplace Agreements & Policies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
                  <div className="font-bold text-charcoal-900">Traveler Guest Agreement</div>
                  <p className="text-charcoal-500">Modesty standards, alcohol policies, and attendee manifest requirements.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
                  <div className="font-bold text-charcoal-900">Host Family Agreement</div>
                  <p className="text-charcoal-500">Host hospitality standards, payout disbursements, and guest protection.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
                  <div className="font-bold text-charcoal-900">Partner & Agent Agreement</div>
                  <p className="text-charcoal-500">Referral commissions, B2B guest manifests, and partner conduct.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 space-y-1">
                  <div className="font-bold text-charcoal-900">Intellectual Property & Content</div>
                  <p className="text-charcoal-500">Personal social media rights, commercial photo takedowns, and brand usage.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRIVACY & DATA PROTECTION                                         */}
        {/* ========================================================================= */}
        {activeTab === "privacy" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-warm-50 border border-warm-200 space-y-2">
              <h2 className="font-display font-bold text-base text-charcoal-900">
                Zero Data Monetization Guarantee
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                WeddingWithIndia does not sell personal data to advertisers or third-party brokers. We process information strictly for identity verification, pass issuance, secure checkout, and on-site celebration coordination.
              </p>
            </div>

            {/* DPDP Section */}
            <section id="dpdp" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-2">
                1. Digital Personal Data Protection (DPDP) Act, 2023 Compliance
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600">
                In compliance with India&apos;s DPDP Act 2023 and the DPDP Rules 2025:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl border border-warm-200 bg-white">
                  <div className="font-bold text-charcoal-900 mb-1">Data Principal Rights</div>
                  <p className="text-charcoal-500">Right to access, correction, erasure, and consent withdrawal for personal data collected during onboarding.</p>
                </div>
                <div className="p-4 rounded-xl border border-warm-200 bg-white">
                  <div className="font-bold text-charcoal-900 mb-1">Statutory Consent Manager</div>
                  <p className="text-charcoal-500">Explicit, granular consent requests for passport verification and dietary medical alerts.</p>
                </div>
              </div>
            </section>

            {/* GDPR Section */}
            <section id="gdpr" className="space-y-4 pt-4 border-t border-warm-100">
              <h2 className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-2">
                2. European & UK GDPR Privacy Rights
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600">
                For travelers from the European Union, European Economic Area, and United Kingdom:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-charcoal-600">
                <li><strong>Lawful Bases:</strong> Processing based on contractual necessity (booking fulfillment) and legal compliance.</li>
                <li><strong>International Transfers:</strong> Cross-border transfers protected by Standard Contractual Clauses (SCCs).</li>
                <li><strong>Right to Portability & Erasure:</strong> Submit erasure requests directly to our Data Protection Lead.</li>
              </ul>
            </section>

            {/* DPO Contact Box */}
            <section className="p-5 rounded-2xl bg-white border border-warm-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-charcoal-900 text-sm">
                <Mail size={16} className="text-[var(--color-brand-primary)]" />
                Data Protection Officer & Privacy Inquiries
              </div>
              <p className="text-xs text-charcoal-500">
                To exercise any data principal rights or request an export/deletion of your personal records:
              </p>
              <a
                href={`mailto:${LEGAL_CONFIG.DATA_PROTECTION.EMAIL}`}
                className="inline-flex text-xs font-bold text-[var(--color-brand-primary)] underline"
              >
                {LEGAL_CONFIG.DATA_PROTECTION.EMAIL}
              </a>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SAFETY & GRIEVANCE                                                */}
        {/* ========================================================================= */}
        {activeTab === "safety" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Urgent Helplines Banner */}
            <div id="emergency" className="p-5 sm:p-6 rounded-2xl bg-red-50 border-2 border-red-200 text-red-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-red-900">
                <ShieldAlert size={20} />
                Immediate Emergency Helplines (India)
              </div>
              <p className="text-xs sm:text-sm">
                WeddingWithIndia is an intermediary technology platform. If you face an immediate safety threat, medical emergency, or crime in India, contact local emergency services immediately:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs font-bold">
                <div className="p-2.5 bg-white rounded-xl border border-red-200">
                  <div className="text-base text-red-700">{LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.NATIONAL_EMERGENCY}</div>
                  <div className="text-[0.6875rem] text-charcoal-600">National Emergency</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-red-200">
                  <div className="text-base text-red-700">{LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.POLICE}</div>
                  <div className="text-[0.6875rem] text-charcoal-600">Police Assistance</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-red-200">
                  <div className="text-base text-red-700">{LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.AMBULANCE}</div>
                  <div className="text-[0.6875rem] text-charcoal-600">Medical Ambulance</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-red-200">
                  <div className="text-base text-red-700">{LEGAL_CONFIG.EMERGENCY_HELPLINES_INDIA.TOURIST_HELPLINE_24X7}</div>
                  <div className="text-[0.6875rem] text-charcoal-600">Tourist Helpline (Govt)</div>
                </div>
              </div>
            </div>

            {/* Verification Architecture */}
            <section id="verification" className="space-y-4">
              <h2 className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-2">
                1. 100% KYC Verification Standards
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 space-y-1.5">
                  <div className="font-bold text-charcoal-900">Host Family Vetting</div>
                  <p className="text-charcoal-600 leading-relaxed">Multi-point government ID, residential verification, and direct phone/video screening.</p>
                </div>
                <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 space-y-1.5">
                  <div className="font-bold text-charcoal-900">Ceremony Validation</div>
                  <p className="text-charcoal-600 leading-relaxed">Proof of venue booking, invitation schedule validation, and guest capacity limits.</p>
                </div>
                <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 space-y-1.5">
                  <div className="font-bold text-charcoal-900">Traveler Identity</div>
                  <p className="text-charcoal-600 leading-relaxed">International passport / ID verification and cultural onboarding completion.</p>
                </div>
              </div>
            </section>

            {/* Guest & Host Safety Guidelines */}
            <section id="guest-guide" className="space-y-4 pt-4 border-t border-warm-100">
              <h2 className="font-display font-bold text-xl text-charcoal-900 border-b border-warm-100 pb-2">
                2. Guest & Host Cultural Etiquette & Boundaries
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 space-y-2">
                  <div className="font-bold text-charcoal-900">Sacred Ritual Reverence</div>
                  <p className="text-charcoal-600 leading-relaxed">
                    Solemn religious rituals (such as Vedic Saat Phere, Anand Karaj ardas, or Kanyadaan) require quiet respect. Follow coordinator cues regarding footwear removal and head covering.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 space-y-2">
                  <div className="font-bold text-charcoal-900">Photography & Video Consent</div>
                  <p className="text-charcoal-600 leading-relaxed">
                    Personal photos for private social memories are encouraged. Commercial filming, intrusive livestreaming, or drone operation without host consent is strictly prohibited.
                  </p>
                </div>
              </div>
            </section>

            {/* Statutory Grievance Redressal Mechanism */}
            <section id="grievance" className="space-y-4 pt-4 border-t border-warm-100">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
                  <Scale size={20} className="text-[var(--color-brand-primary)]" />
                  <span>3. Statutory Grievance Redressal Officer (IT Rules 2021)</span>
                </h2>
                <Link
                  href="/dashboard/safety"
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[var(--color-brand-primary)] hover:underline"
                >
                  <span>File Safety Report</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600">
                In compliance with Rule 3(2) of the Information Technology Intermediary Rules, 2021 and Consumer Protection E-Commerce Rules, 2020:
              </p>

              <div className="p-5 rounded-2xl bg-warm-50 border border-warm-200 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-charcoal-400 text-xs font-semibold uppercase tracking-wider block">Designated Grievance Officer</span>
                    <span className="font-bold text-charcoal-900 text-base">{LEGAL_CONFIG.GRIEVANCE_OFFICER.NAME}</span>
                    <span className="text-xs text-charcoal-500 block">{LEGAL_CONFIG.GRIEVANCE_OFFICER.DEPARTMENT}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 text-xs font-semibold uppercase tracking-wider block">Physical Address</span>
                    <span className="text-charcoal-700 text-xs leading-relaxed block">{LEGAL_CONFIG.GRIEVANCE_OFFICER.ADDRESS}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-warm-200">
                  <div>
                    <span className="text-charcoal-400 text-xs font-semibold uppercase tracking-wider block">Official Email</span>
                    <a href={`mailto:${LEGAL_CONFIG.GRIEVANCE_OFFICER.EMAIL}`} className="font-bold text-[var(--color-brand-primary)] underline">
                      {LEGAL_CONFIG.GRIEVANCE_OFFICER.EMAIL}
                    </a>
                  </div>
                  <div>
                    <span className="text-charcoal-400 text-xs font-semibold uppercase tracking-wider block">Statutory Response SLA</span>
                    <span className="font-bold text-charcoal-900">24-Hour Receipt Ack / 15-Day Final Disposal</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
