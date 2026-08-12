"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Info,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";

import { COORDINATOR_MODEL } from "@/lib/constants/financial-model";
import { submitCoordinatorApplication } from "@/app/actions/coordinator";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  availability: "weekends" | "weekdays" | "flexible";
  eventExperience:
    | "college_fest"
    | "hospitality"
    | "travel_guide"
    | "none";
  languages: string;
  interestNote: string;
  privacyConsent: boolean;
  communicationConsent: boolean;
};

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  availability: "weekends",
  eventExperience: "college_fest",
  languages: "English, Hindi",
  interestNote: "",
  privacyConsent: false,
  communicationConsent: true,
};

export default function CoordinatorApplyPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const city = formData.city.trim();
    const languages = formData.languages.trim();
    const interestNote = formData.interestNote.trim();

    if (!fullName || !email || !phone || !city) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (!formData.privacyConsent) {
      toast.error(
        "Please read and accept the Privacy Policy before applying."
      );
      return;
    }

    if (fullName.length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    if (fullName.length > 100) {
      toast.error("Please enter a shorter name.");
      return;
    }

    if (email.length > 254) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (phone.length > 30) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (city.length > 100) {
      toast.error("Please enter a valid city or region.");
      return;
    }

    if (languages.length > 200) {
      toast.error("Please shorten the languages field.");
      return;
    }

    if (interestNote.length > 1_500) {
      toast.error("Please keep your introduction under 1,500 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitCoordinatorApplication({
        fullName,
        email,
        phone,
        city,
        availability: formData.availability,
        eventExperience: formData.eventExperience,
        languages,
        interestNote,
      });

      setSubmitted(true);

      toast.success("Application received successfully.");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to submit your application right now.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-3xl mx-auto space-y-8">

        {/* Navigation */}
        <Link
          href="/coordinators"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-[var(--color-brand-primary)] transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Coordinator Program
        </Link>

        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
            <Users size={13} aria-hidden="true" />
            Coordinator Application
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal-900 leading-tight">
            Join the Wedding With India{" "}
            <span className="text-gradient-brand">
              Coordinator Roster
            </span>
          </h1>

          <p className="text-charcoal-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Tell us about yourself, your location and your experience.
            Suitable applicants may be contacted when relevant event
            coordination opportunities become available.
          </p>
        </header>

        {submitted ? (
          /* =========================================================
             CONFIRMATION
          ========================================================= */
          <section
            className="bg-white border border-warm-200/60 rounded-3xl p-8 sm:p-12 text-center space-y-7 shadow-sm"
            aria-labelledby="application-success-heading"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} aria-hidden="true" />
            </div>

            <div className="space-y-3 max-w-xl mx-auto">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Application Received
              </span>

              <h2
                id="application-success-heading"
                className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900"
              >
                Thank you, {formData.fullName}.
              </h2>

              <p className="text-charcoal-600 text-sm leading-relaxed">
                We have received your coordinator application for the{" "}
                <strong>{formData.city}</strong> area.
              </p>
            </div>

            {/* What happens next */}
            <div className="bg-warm-50 border border-warm-200 rounded-2xl p-5 text-left max-w-xl mx-auto space-y-4">
              <h3 className="font-bold text-sm text-charcoal-900 border-b border-warm-200 pb-3">
                What happens next
              </h3>

              <div className="space-y-3 text-sm text-charcoal-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <p>
                    Your application will be reviewed against current
                    operational requirements.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <p>
                    If additional information or verification is required,
                    our team may contact you.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <p>
                    If a suitable opportunity becomes available in your
                    area, we may contact you with assignment details.
                  </p>
                </div>
              </div>
            </div>

            {/* No guarantee notice */}
            <div className="flex items-start gap-3 text-left max-w-xl mx-auto rounded-2xl border border-warm-200 bg-white p-4">
              <Info
                size={18}
                className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
                Submission of an application does not guarantee acceptance,
                roster placement, a future assignment, minimum work,
                compensation or employment. Any assignment is subject to
                separate terms agreed before the assignment begins.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push("/weddings")}
                className="btn btn-primary px-8 py-3 font-bold"
              >
                Explore Wedding Experiences
              </button>
            </div>
          </section>
        ) : (
          /* =========================================================
             APPLICATION FORM
          ========================================================= */
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white border border-warm-200/60 rounded-3xl p-6 sm:p-10 shadow-sm space-y-9"
          >
            {/* Form intro */}
            <div className="border-b border-warm-200 pb-5">
              <h2 className="font-display font-bold text-xl text-charcoal-900">
                Coordinator Application
              </h2>

              <p className="text-charcoal-500 text-sm mt-1 leading-relaxed">
                Please provide accurate information. Only information
                reasonably relevant to evaluating or administering your
                application should be submitted.
              </p>
            </div>

            {/* Role terms */}
            <section
              className="bg-warm-50 border border-warm-200 p-5 rounded-2xl space-y-3"
              aria-labelledby="role-terms-heading"
            >
              <div className="flex items-center gap-2 text-charcoal-900 font-bold">
                <AlertCircle
                  size={15}
                  className="text-[var(--color-brand-primary)]"
                  aria-hidden="true"
                />

                <h3 id="role-terms-heading">
                  Role information
                </h3>
              </div>

              <div className="space-y-2 text-sm text-charcoal-600 leading-relaxed">
                <p>
                  <strong>Compensation:</strong>{" "}
                  {COORDINATOR_MODEL.COMPENSATION_LABEL}.
                </p>

                <p>
                  <strong>Preferred experience:</strong>{" "}
                  {COORDINATOR_MODEL.PREFERRED_QUALIFICATION}.
                </p>

                <p>
                  <strong>Deployment:</strong>{" "}
                  {COORDINATOR_MODEL.DEPLOYMENT_NOTE}.
                </p>

                <p>
                  Application does not guarantee an assignment or any
                  minimum amount of work.
                </p>
              </div>
            </section>

            {/* =====================================================
                PERSONAL INFORMATION
            ====================================================== */}
            <section className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">
                  1. Personal Information
                </h3>

                <p className="text-xs text-charcoal-500 mt-1">
                  Required to contact you about your application.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Full name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="text-xs font-bold text-charcoal-700 block mb-1.5"
                  >
                    Full Name <span aria-hidden="true">*</span>
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    maxLength={100}
                    placeholder="e.g. Rohan Varma"
                    value={formData.fullName}
                    onChange={(e) =>
                      updateField("fullName", e.target.value)
                    }
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="text-xs font-bold text-charcoal-700 block mb-1.5"
                  >
                    Email Address <span aria-hidden="true">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="text-xs font-bold text-charcoal-700 block mb-1.5"
                  >
                    Phone / WhatsApp <span aria-hidden="true">*</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    maxLength={30}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    className="input-luxury w-full bg-white text-sm"
                  />

                  <p className="text-[11px] text-charcoal-400 mt-1.5">
                    Include country code where applicable.
                  </p>
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="text-xs font-bold text-charcoal-700 block mb-1.5"
                  >
                    Current City / Region{" "}
                    <span aria-hidden="true">*</span>
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    autoComplete="address-level2"
                    maxLength={100}
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={formData.city}
                    onChange={(e) =>
                      updateField("city", e.target.value)
                    }
                    className="input-luxury w-full bg-white text-sm"
                  />
                </div>
              </div>
            </section>

            {/* =====================================================
                EXPERIENCE
            ====================================================== */}
            <section className="space-y-5 pt-5 border-t border-warm-100">
              <div>
                <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">
                  2. Experience & Availability
                </h3>

                <p className="text-xs text-charcoal-500 mt-1">
                  Help us understand what assignments may suit you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Experience */}
                <div>
                  <label
                    htmlFor="eventExperience"
                    className="text-xs font-bold text-charcoal-700 block mb-1.5"
                  >
                    Relevant Experience
                  </label>

                  <select
                    id="eventExperience"
                    name="eventExperience"
                    value={formData.eventExperience}
                    onChange={(e) =>
                      updateField(
                        "eventExperience",
                        e.target.value as FormData["eventExperience"]
                      )
                    }
                    className="input-luxury w-full bg-white text-sm cursor-pointer"
                  >
                    <option value="college_fest">
                      College Fest / Event Management
                    </option>

                    <option value="hospitality">
                      Hospitality / Hotel Experience
                    </option>

                    <option value="travel_guide">
                      Tour Guide / Cultural Liaison
                    </option>

                    <option value="none">
                      No Prior Event Experience
                    </option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label
                    htmlFor="availability"
                    className="text-xs font-bold text-charcoal-700 block mb-1.5"
                  >
                    Availability
                  </label>

                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={(e) =>
                      updateField(
                        "availability",
                        e.target.value as FormData["availability"]
                      )
                    }
                    className="input-luxury w-full bg-white text-sm cursor-pointer"
                  >
                    <option value="weekends">
                      Weekend Events
                    </option>

                    <option value="weekdays">
                      Weekday Events
                    </option>

                    <option value="flexible">
                      Flexible
                    </option>
                  </select>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label
                  htmlFor="languages"
                  className="text-xs font-bold text-charcoal-700 block mb-1.5"
                >
                  Languages Spoken
                </label>

                <input
                  id="languages"
                  name="languages"
                  type="text"
                  maxLength={200}
                  placeholder="e.g. English, Hindi, French, Marwari"
                  value={formData.languages}
                  onChange={(e) =>
                    updateField("languages", e.target.value)
                  }
                  className="input-luxury w-full bg-white text-sm"
                />

                <p className="text-[11px] text-charcoal-400 mt-1.5">
                  List languages you can comfortably use with guests.
                </p>
              </div>

              {/* Interest note */}
              <div>
                <label
                  htmlFor="interestNote"
                  className="text-xs font-bold text-charcoal-700 block mb-1.5"
                >
                  Tell us briefly about your interest
                </label>

                <textarea
                  id="interestNote"
                  name="interestNote"
                  rows={4}
                  maxLength={1500}
                  placeholder="Tell us about your event, hospitality or guest-facing experience and why this opportunity interests you."
                  value={formData.interestNote}
                  onChange={(e) =>
                    updateField("interestNote", e.target.value)
                  }
                  className="input-luxury w-full bg-white text-sm resize-y"
                />

                <div className="flex justify-end mt-1">
                  <span className="text-[11px] text-charcoal-400">
                    {formData.interestNote.length}/1500
                  </span>
                </div>
              </div>
            </section>

            {/* =====================================================
                PRIVACY
            ====================================================== */}
            <section className="space-y-5 pt-5 border-t border-warm-100">
              <div>
                <h3 className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">
                  3. Privacy & Communication
                </h3>

                <p className="text-xs text-charcoal-500 mt-1">
                  Please review these choices before submitting your
                  application.
                </p>
              </div>

              {/* Privacy consent */}
              <label className="flex items-start gap-3 cursor-pointer rounded-2xl border border-warm-200 bg-warm-50/60 p-4">
                <input
                  type="checkbox"
                  checked={formData.privacyConsent}
                  onChange={(e) =>
                    updateField("privacyConsent", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[var(--color-brand-primary)] shrink-0"
                  required
                />

                <span className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  I have read the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--color-brand-primary)] hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and understand that the information I submit may be
                  processed for application review, communication,
                  verification where applicable, and administration of the
                  coordinator program.{" "}
                  <strong className="text-charcoal-900">*</strong>
                </span>
              </label>

              {/* Communication preference */}
              <label className="flex items-start gap-3 cursor-pointer rounded-2xl border border-warm-200 p-4">
                <input
                  type="checkbox"
                  checked={formData.communicationConsent}
                  onChange={(e) =>
                    updateField(
                      "communicationConsent",
                      e.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[var(--color-brand-primary)] shrink-0"
                />

                <span className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  I agree that Wedding With India may contact me using
                  the contact details I provide about my application and
                  potentially relevant coordinator opportunities.
                </span>
              </label>

              {/* Data minimization notice */}
              <div className="flex items-start gap-3 rounded-2xl bg-warm-50 border border-warm-200 p-4">
                <Lock
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                  aria-hidden="true"
                />

                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Please do not submit passwords, financial account
                  credentials, passport copies, Aadhaar/PAN details or
                  other sensitive identity documents through this form
                  unless Wedding With India separately requests them
                  through an authorized verification process.
                </p>
              </div>
            </section>

            {/* =====================================================
                SUBMIT
            ====================================================== */}
            <div className="pt-5 border-t border-warm-200 space-y-4">

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary px-8 py-3.5 shadow-md font-bold w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Submitting Application..."
                  : "Submit Coordinator Application"}
              </button>

              <p className="text-[11px] text-charcoal-400 text-center leading-relaxed max-w-xl mx-auto">
                By submitting this application, you confirm that the
                information provided is accurate to the best of your
                knowledge. Submission does not create an employment,
                agency, partnership or contractor relationship. Any
                future engagement is subject to separate applicable
                terms.
              </p>
            </div>
          </form>
        )}

        {/* Bottom legal/support note */}
        {!submitted && (
          <div className="flex items-start gap-3 max-w-2xl mx-auto px-2">
            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
              aria-hidden="true"
            />

            <p className="text-[11px] sm:text-xs text-charcoal-400 leading-relaxed">
              Wedding With India will evaluate applications according to
              legitimate program and operational requirements. Completing
              this form does not guarantee acceptance, selection, work,
              earnings or future assignments.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}