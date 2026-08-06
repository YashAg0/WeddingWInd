"use client";

import React, { useState } from "react";
import { UserRole, VerificationStatus } from "@prisma/client";
import { submitVerificationAction } from "@/lib/actions";
import { UploadButton } from "@/lib/uploadthing";
import { 
  ShieldCheck, 
  FileText, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  FileCheck,
  Building,
  CreditCard,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

interface VerificationFormProps {
  initialVerification: any;
  userRole: UserRole;
  userEmail: string;
}

export default function VerificationForm({ initialVerification, userRole }: VerificationFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State initialized with database values
  const [formData, setFormData] = useState({
    govtIdUrl: initialVerification?.govtIdUrl || "",
    phoneVerified: initialVerification?.phoneVerified || false,
    emailVerified: initialVerification?.emailVerified || true,

    // Traveler
    passportUrl: initialVerification?.passportUrl || "",
    selfieUrl: initialVerification?.selfieUrl || "",
    emergencyContact: initialVerification?.emergencyContact || "",
    nationality: initialVerification?.nationality || "",
    visaStatus: initialVerification?.visaStatus || "",
    travelInsuranceUrl: initialVerification?.travelInsuranceUrl || "",
    medicalDeclaration: initialVerification?.medicalDeclaration || "",

    // Host
    panNumber: initialVerification?.panNumber || "",
    panUrl: initialVerification?.panUrl || "",
    aadhaarNumber: initialVerification?.aadhaarNumber || "",
    aadhaarUrl: initialVerification?.aadhaarUrl || "",
    addressProofUrl: initialVerification?.addressProofUrl || "",
    weddingProofUrl: initialVerification?.weddingProofUrl || "",
    venueConfirmUrl: initialVerification?.venueConfirmUrl || "",
    invitationUrl: initialVerification?.invitationUrl || "",
    bankName: initialVerification?.bankName || "",
    bankAccountNo: initialVerification?.bankAccountNo || "",
    bankIfsc: initialVerification?.bankIfsc || "",
    bankVerificationUrl: initialVerification?.bankVerificationUrl || "",
    socialLinks: initialVerification?.socialLinks || "",

    // Agent
    gstNumber: initialVerification?.gstNumber || "",
    gstUrl: initialVerification?.gstUrl || "",
    orgDetails: initialVerification?.orgDetails || "",
    businessRegUrl: initialVerification?.businessRegUrl || "",
    linkedinUrl: initialVerification?.linkedinUrl || "",
    portfolioUrl: initialVerification?.portfolioUrl || "",
    experienceYears: initialVerification?.experienceYears || 2,
    references: initialVerification?.references || "",

    // Coordinator
    experienceNotes: initialVerification?.experienceNotes || "",
    availability: initialVerification?.availability || "",
    languages: initialVerification?.languages || "",
  });

  const currentStatus = (initialVerification?.status as VerificationStatus) || "NOT_SUBMITTED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccess(false);

    try {
      const res = await submitVerificationAction(formData);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMessage("Failed to submit verification request. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = () => {
    switch (currentStatus) {
      case "APPROVED":
        return (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600 w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-sans font-bold text-sm text-emerald-900">Identity Verified & Authenticated</h4>
              <p className="text-emerald-700 text-xs mt-0.5">
                Your trust verification checks have passed. Your profile carries a gold verification badge.
              </p>
            </div>
          </div>
        );
      case "PENDING":
      case "UNDER_REVIEW":
        return (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-center gap-3">
            <Clock className="text-purple-650 w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-sans font-bold text-sm text-purple-950">Verification Under Audit</h4>
              <p className="text-purple-700 text-xs mt-0.5">
                Our Trust & Safety team is currently auditing your uploaded documents. Approval usually takes 2–12 hours.
              </p>
            </div>
          </div>
        );
      case "NEED_MORE_DOCUMENTS":
        return (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
            <HelpCircle className="text-amber-600 w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-sans font-bold text-sm text-amber-900">Action Required: Additional Credentials Needed</h4>
              <p className="text-amber-800 text-xs mt-0.5">
                {initialVerification?.notes ? `Admin Audit Note: "${initialVerification.notes}"` : "Please provide clearer scans or missing credentials below."}
              </p>
            </div>
          </div>
        );
      case "REJECTED":
        return (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="text-rose-600 w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-sans font-bold text-sm text-rose-900">Verification Declined</h4>
              <p className="text-rose-700 text-xs mt-0.5">
                {initialVerification?.notes ? `Reason: "${initialVerification.notes}"` : "Please review requirements and re-upload valid government documentation."}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-warm-50 border border-warm-200 p-4 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="text-maroon-600 w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-sans font-bold text-sm text-charcoal-900">Complete Trust Verification</h4>
              <p className="text-charcoal-500 text-xs mt-0.5">
                Please submit the required government and identity documentation to unlock full platform features.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderStatusBadge()}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          Verification submission received successfully! Our team will review your files promptly.
        </motion.div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-8">
        
        {/* Common Identity Fields */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-maroon-600" />
            Core Government Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                Government ID Scan (National ID / Driver License)
              </label>
              {formData.govtIdUrl ? (
                <div className="flex items-center gap-2 p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-800">
                  <FileText size={14} className="text-maroon-600" />
                  <span className="truncate flex-1">Document Uploaded</span>
                  <a href={formData.govtIdUrl} target="_blank" rel="noreferrer" className="text-maroon-600 hover:underline text-[0.75rem]">View</a>
                </div>
              ) : null}
              <UploadButton
                endpoint="verificationDocument"
                onClientUploadComplete={(res: any) => {
                  if (res?.[0]) {
                    setFormData((prev) => ({ ...prev, govtIdUrl: res[0].url }));
                  }
                }}
                onUploadError={(err: Error) => {
                  setErrorMessage(`Upload error: ${err.message}`);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                Live Selfie Verification Photo
              </label>
              {formData.selfieUrl ? (
                <div className="flex items-center gap-2 p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-800">
                  <UserCheck size={14} className="text-maroon-600" />
                  <span className="truncate flex-1">Selfie Photo Uploaded</span>
                  <a href={formData.selfieUrl} target="_blank" rel="noreferrer" className="text-maroon-600 hover:underline text-[0.75rem]">View</a>
                </div>
              ) : null}
              <UploadButton
                endpoint="verificationDocument"
                onClientUploadComplete={(res: any) => {
                  if (res?.[0]) {
                    setFormData((prev) => ({ ...prev, selfieUrl: res[0].url }));
                  }
                }}
                onUploadError={(err: Error) => {
                  setErrorMessage(`Upload error: ${err.message}`);
                }}
              />
            </div>
          </div>
        </div>

        {/* ROLE-SPECIFIC VERIFICATION SECTIONS */}

        {/* TRAVELER VERIFICATION */}
        {(userRole === "TRAVELER" || userRole === "ADMIN") && (
          <div className="space-y-4 pt-4 border-t border-warm-100">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-maroon-600" />
              Traveler & International Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                  Passport Scan (Biometric Page)
                </label>
                {formData.passportUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-800">
                    <FileCheck size={14} className="text-maroon-600" />
                    <span className="truncate flex-1">Passport Scan Uploaded</span>
                    <a href={formData.passportUrl} target="_blank" rel="noreferrer" className="text-maroon-600 hover:underline text-[0.75rem]">View</a>
                  </div>
                ) : null}
                <UploadButton
                  endpoint="passport"
                  onClientUploadComplete={(res: any) => {
                    if (res?.[0]) {
                      setFormData((prev) => ({ ...prev, passportUrl: res[0].url }));
                    }
                  }}
                  onUploadError={(err: Error) => {
                    setErrorMessage(`Upload error: ${err.message}`);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                  Travel Insurance Document
                </label>
                {formData.travelInsuranceUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-800">
                    <FileText size={14} className="text-maroon-600" />
                    <span className="truncate flex-1">Insurance Policy Uploaded</span>
                    <a href={formData.travelInsuranceUrl} target="_blank" rel="noreferrer" className="text-maroon-600 hover:underline text-[0.75rem]">View</a>
                  </div>
                ) : null}
                <UploadButton
                  endpoint="verificationDocument"
                  onClientUploadComplete={(res: any) => {
                    if (res?.[0]) {
                      setFormData((prev) => ({ ...prev, travelInsuranceUrl: res[0].url }));
                    }
                  }}
                  onUploadError={(err: Error) => {
                    setErrorMessage(`Upload error: ${err.message}`);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="emergencyContact" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  Emergency Contact Details (Name, Relationship, Phone)
                </label>
                <input
                  id="emergencyContact"
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. Sarah Jenkins (Sister) - +1 415 555 0199"
                  className="input-luxury text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="nationality" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  Country of Citizenship / Passport Nationality
                </label>
                <input
                  id="nationality"
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="e.g. United Kingdom"
                  className="input-luxury text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="visaStatus" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  India Visa Status (eVisa / Traveler Visa / OCI)
                </label>
                <input
                  id="visaStatus"
                  type="text"
                  value={formData.visaStatus}
                  onChange={(e) => setFormData({ ...formData, visaStatus: e.target.value })}
                  placeholder="e.g. eVisa Approved (Valid through Dec 2026)"
                  className="input-luxury text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="medicalDeclaration" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  Medical & Dietary Declarations
                </label>
                <textarea
                  id="medicalDeclaration"
                  value={formData.medicalDeclaration}
                  onChange={(e) => setFormData({ ...formData, medicalDeclaration: e.target.value })}
                  placeholder="Please declare any severe allergies, medical conditions, or emergency accessibility needs..."
                  rows={3}
                  className="input-luxury text-xs resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* HOST / COUPLE VERIFICATION */}
        {(userRole === "COUPLE" || userRole === "ADMIN") && (
          <div className="space-y-4 pt-4 border-t border-warm-100">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-maroon-600" />
              Host Family & Wedding Venue Verification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* PAN Number & Scan */}
              <div className="space-y-1.5">
                <label htmlFor="panNumber" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  PAN Number (10 Characters)
                </label>
                <input
                  id="panNumber"
                  type="text"
                  maxLength={10}
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  className="input-luxury text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                  PAN Card Document Scan
                </label>
                {formData.panUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-800">
                    <FileCheck size={14} className="text-maroon-600" />
                    <span className="truncate flex-1">PAN Scan Uploaded</span>
                    <a href={formData.panUrl} target="_blank" rel="noreferrer" className="text-maroon-600 hover:underline text-[0.75rem]">View</a>
                  </div>
                ) : null}
                <UploadButton
                  endpoint="verificationDocument"
                  onClientUploadComplete={(res: any) => {
                    if (res?.[0]) setFormData((prev) => ({ ...prev, panUrl: res[0].url }));
                  }}
                  onUploadError={(err: Error) => setErrorMessage(`Upload error: ${err.message}`)}
                />
              </div>

              {/* Aadhaar Number & Scan */}
              <div className="space-y-1.5">
                <label htmlFor="aadhaarNumber" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  Aadhaar Number (12 Digits)
                </label>
                <input
                  id="aadhaarNumber"
                  type="text"
                  maxLength={12}
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  placeholder="1234 5678 9012"
                  className="input-luxury text-xs font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                  Aadhaar Card Scan (Front & Back)
                </label>
                {formData.aadhaarUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-800">
                    <FileCheck size={14} className="text-maroon-600" />
                    <span className="truncate flex-1">Aadhaar Uploaded</span>
                    <a href={formData.aadhaarUrl} target="_blank" rel="noreferrer" className="text-maroon-600 hover:underline text-[0.75rem]">View</a>
                  </div>
                ) : null}
                <UploadButton
                  endpoint="verificationDocument"
                  onClientUploadComplete={(res: any) => {
                    if (res?.[0]) setFormData((prev) => ({ ...prev, aadhaarUrl: res[0].url }));
                  }}
                  onUploadError={(err: Error) => setErrorMessage(`Upload error: ${err.message}`)}
                />
              </div>

              {/* Venue Confirmation & Wedding Proof */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                  Venue Booking Confirmation / Receipt
                </label>
                {formData.venueConfirmUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-800">
                    <FileCheck size={14} className="text-maroon-600" />
                    <span className="truncate flex-1">Venue Booking Receipt</span>
                    <a href={formData.venueConfirmUrl} target="_blank" rel="noreferrer" className="text-maroon-600 hover:underline text-[0.75rem]">View</a>
                  </div>
                ) : null}
                <UploadButton
                  endpoint="verificationDocument"
                  onClientUploadComplete={(res: any) => {
                    if (res?.[0]) setFormData((prev) => ({ ...prev, venueConfirmUrl: res[0].url }));
                  }}
                  onUploadError={(err: Error) => setErrorMessage(`Upload error: ${err.message}`)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                  Wedding Invitation Card / Official Proof
                </label>
                {formData.weddingProofUrl || formData.invitationUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-800">
                    <FileCheck size={14} className="text-maroon-600" />
                    <span className="truncate flex-1">Wedding Card Uploaded</span>
                    <a href={formData.weddingProofUrl || formData.invitationUrl} target="_blank" rel="noreferrer" className="text-maroon-600 hover:underline text-[0.75rem]">View</a>
                  </div>
                ) : null}
                <UploadButton
                  endpoint="verificationDocument"
                  onClientUploadComplete={(res: any) => {
                    if (res?.[0]) setFormData((prev) => ({ ...prev, weddingProofUrl: res[0].url, invitationUrl: res[0].url }));
                  }}
                  onUploadError={(err: Error) => setErrorMessage(`Upload error: ${err.message}`)}
                />
              </div>

              {/* Bank Details */}
              <div className="space-y-1.5 sm:col-span-2 pt-2">
                <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider block border-b border-warm-100 pb-1">
                  Host Bank Account Details (For Guest Reservation Payouts)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label htmlFor="bankName" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">Bank Name</label>
                    <input
                      id="bankName"
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank"
                      className="input-luxury text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="bankAccountNo" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">Account Number</label>
                    <input
                      id="bankAccountNo"
                      type="text"
                      value={formData.bankAccountNo}
                      onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                      placeholder="50100012345678"
                      className="input-luxury text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="bankIfsc" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">IFSC Code</label>
                    <input
                      id="bankIfsc"
                      type="text"
                      value={formData.bankIfsc}
                      onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                      placeholder="HDFC0001234"
                      className="input-luxury text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="socialLinks" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  Family Social Profiles (Instagram, LinkedIn, Facebook)
                </label>
                <input
                  id="socialLinks"
                  type="text"
                  value={formData.socialLinks}
                  onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                  placeholder="https://instagram.com/ourwedding2026, https://linkedin.com/in/host"
                  className="input-luxury text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* AGENT VERIFICATION */}
        {(userRole === "AGENT" || userRole === "ADMIN") && (
          <div className="space-y-4 pt-4 border-t border-warm-100">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-maroon-600" />
              Travel Agent & Partner Agency Verification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="gstNumber" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  GST Registration Number (Optional)
                </label>
                <input
                  id="gstNumber"
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  placeholder="07AAAAA0000A1Z5"
                  className="input-luxury text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                  Business Registration / License Scan
                </label>
                {formData.businessRegUrl ? (
                  <div className="flex items-center gap-2 p-3 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-800">
                    <FileCheck size={14} className="text-maroon-600" />
                    <span className="truncate flex-1">License Scan Uploaded</span>
                    <a href={formData.businessRegUrl} target="_blank" rel="noreferrer" className="text-maroon-600 hover:underline text-[0.75rem]">View</a>
                  </div>
                ) : null}
                <UploadButton
                  endpoint="verificationDocument"
                  onClientUploadComplete={(res: any) => {
                    if (res?.[0]) setFormData((prev) => ({ ...prev, businessRegUrl: res[0].url }));
                  }}
                  onUploadError={(err: Error) => setErrorMessage(`Upload error: ${err.message}`)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="portfolioUrl" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  Agency Website / Portfolio URL
                </label>
                <input
                  id="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://luxurytravelagency.com"
                  className="input-luxury text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="linkedinUrl" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  LinkedIn Company / Executive Profile
                </label>
                <input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/agency-principal"
                  className="input-luxury text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="references" className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">
                  Trade References & Professional Credentials
                </label>
                <textarea
                  id="references"
                  value={formData.references}
                  onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                  placeholder="Provide IATA / TAFI registration details or professional trade references..."
                  rows={3}
                  className="input-luxury text-xs resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-6 border-t border-warm-100 flex items-center justify-between">
          <p className="text-xs text-charcoal-400 font-medium">
            All submitted identity records are encrypted and audited by strict compliance policies.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-md shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Submitting Files...</span>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Submit Verification Docs</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
