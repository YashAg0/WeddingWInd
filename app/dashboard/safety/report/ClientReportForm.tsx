"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { reportIncidentAction } from "@/lib/actions/safety";
import { CaseType } from "@prisma/client";

interface ClientReportFormProps {
  bookings: Array<{ id: string; title: string }>;
  weddings: Array<{ id: string; title: string }>;
  subjects: Array<{ id: string; name: string; role: string }>;
}

export default function ClientReportForm({ bookings, weddings, subjects }: ClientReportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [type, setType] = useState<CaseType>("SAFETY");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [weddingId, setWeddingId] = useState("");
  const [subjectUserId, setSubjectUserId] = useState("");
  
  // Custom attachments (can add files or manual URLs)
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceName, setEvidenceName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const evidenceFiles = evidenceUrl.trim()
      ? [{ fileUrl: evidenceUrl.trim(), mimeType: "image/jpeg", size: 1024 * 100, fileKey: evidenceName || "attachment" }]
      : [];

    try {
      await reportIncidentAction({
        type,
        title,
        description,
        bookingId: bookingId || undefined,
        weddingId: weddingId || undefined,
        subjectUserId: subjectUserId || undefined,
        evidenceFiles,
      });

      setSuccess(true);
      router.push("/dashboard/safety");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while submitting safety report.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-3xl text-emerald-950 text-xs space-y-4 text-center">
        <h3 className="font-display font-black text-emerald-900 text-base">Concern Filed Successfully</h3>
        <p>Your safety case has been recorded. Our safety operations team will look into it immediately.</p>
        <button
          onClick={() => router.push("/dashboard/safety")}
          className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl px-4 py-2 font-bold transition-all"
        >
          View Case Center
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-warm-200 p-6 rounded-3xl shadow-sm space-y-4 text-xs">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 font-semibold rounded-xl">
          {error}
        </div>
      )}

      {/* Category Selection */}
      <div className="space-y-1">
        <label htmlFor="report-type" className="font-bold text-charcoal-700">Classification Category</label>
        <select
          id="report-type"
          value={type}
          onChange={(e) => setType(e.target.value as CaseType)}
          className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-850 font-bold focus:outline-none"
        >
          <option value="SAFETY">Physical Safety Concern</option>
          <option value="HARASSMENT">Harassment or Abuse</option>
          <option value="MISREPRESENTATION">Listing Misrepresentation</option>
          <option value="PAYMENT">Payment or Billing Issue</option>
          <option value="REFUND">Disputed Cancellation Refund</option>
          <option value="HOST_CONDUCT">Host Couple Misconduct</option>
          <option value="TRAVELER_CONDUCT">Traveler Guest Misconduct</option>
          <option value="EVENT_ISSUE">Event Cancellation or Logistics Failure</option>
          <option value="FRAUD">Fraudulent Profile/Referrals</option>
          <option value="OTHER">Other Issue</option>
        </select>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label htmlFor="report-title" className="font-bold text-charcoal-700">Short Summary Title</label>
        <input
          id="report-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Host refused entry to haldi ceremony"
          className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none focus:border-maroon-800"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label htmlFor="report-desc" className="font-bold text-charcoal-700">Detailed Narrative & Event Log</label>
        <textarea
          id="report-desc"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe exactly what happened, including dates, times, and context. Please do not store passport or card data here."
          className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none focus:border-maroon-800 font-sans"
        />
      </div>

      {/* Booking and Wedding References */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="report-booking" className="font-bold text-charcoal-700">Related Booking (Optional)</label>
          <select
            id="report-booking"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none"
          >
            <option value="">No booking selected</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="report-wedding" className="font-bold text-charcoal-700">Related Wedding (Optional)</label>
          <select
            id="report-wedding"
            value={weddingId}
            onChange={(e) => setWeddingId(e.target.value)}
            className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none"
          >
            <option value="">No wedding selected</option>
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>{w.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject User Selection */}
      {subjects.length > 0 && (
        <div className="space-y-1">
          <label htmlFor="report-subject" className="font-bold text-charcoal-700">Reported User Profile (Optional)</label>
          <select
            id="report-subject"
            value={subjectUserId}
            onChange={(e) => setSubjectUserId(e.target.value)}
            className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none"
          >
            <option value="">No user selected</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
        </div>
      )}

      {/* Evidence Attachments */}
      <div className="space-y-2 border-t border-warm-100 pt-3">
        <span className="font-bold text-charcoal-700 block">Supporting Evidence Files</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="evidence-url" className="font-bold text-charcoal-500">Document URL</label>
            <input
              id="evidence-url"
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="e.g. https://uploadthing.com/f/..."
              className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="evidence-name" className="font-bold text-charcoal-500">Label / Title</label>
            <input
              id="evidence-name"
              type="text"
              value={evidenceName}
              onChange={(e) => setEvidenceName(e.target.value)}
              placeholder="e.g. Chat Screenshot"
              className="w-full border border-warm-200 rounded-xl px-3 py-2 bg-warm-50/20 text-charcoal-800 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-maroon-850 hover:bg-maroon-900 text-white rounded-xl py-2.5 font-bold transition-all text-xs disabled:opacity-50"
        >
          {loading ? "Filing Case..." : "File Safety Incident Report"}
        </button>
      </div>
    </form>
  );
}
