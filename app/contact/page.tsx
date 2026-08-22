"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  HelpCircle,
  Mail,
  MapPin,
  Send,
  Users,
  Briefcase,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CONTACT_EMAILS } from "@/lib/constants";

type FormState = {
  name: string;
  email: string;
  role: string;
  subject: string;
  message: string;
  privacyConsent: boolean;
  website: string; // Honeypot
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  role: "traveler",
  subject: "",
  message: "",
  privacyConsent: false,
  website: "",
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (
    field: keyof FormState,
    value: string | boolean
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }

    if (isSuccess) {
      setIsSuccess(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSuccess(false);

    // Honeypot: silently ignore automated submissions.
    if (formData.website.trim()) {
      setIsSuccess(true);
      setFormData(INITIAL_FORM);
      return;
    }

    if (!formData.privacyConsent) {
      setErrorMessage(
        "Please confirm that you have read our Privacy Policy before sending your message."
      );
      return;
    }

    if (formData.message.trim().length < 10) {
      setErrorMessage(
        "Please provide a little more detail so our team can understand your request."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          privacyConsent: formData.privacyConsent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setIsSuccess(true);
      setFormData(INITIAL_FORM);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-warm-50)] pt-28 pb-20">
      {/* Header */}
      <section className="container-luxury text-center max-w-2xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-maroon-100/50">
          <Mail size={12} aria-hidden="true" />
          Get in Touch
        </div>

        <h1 className="font-display font-bold text-3xl md:text-5xl text-charcoal-900 leading-tight">
          How Can We Help You?
        </h1>

        <p className="text-charcoal-500 text-sm md:text-base leading-relaxed">
          Whether you are an international traveler planning your experience, a
          participating host family, or exploring career opportunities, choose the right
          team below or send us a message.
        </p>
      </section>

      {/* Contact channels */}
      <section
        className="container-luxury grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-16"
        aria-label="Contact channels"
      >
        {/* General */}
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
              <Mail size={18} aria-hidden="true" />
            </div>

            <h2 className="font-display font-bold text-base text-charcoal-900">
              General & Support
            </h2>

            <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
              General enquiries, platform support, and partnership questions.
            </p>
          </div>

          <a
            href={`mailto:${CONTACT_EMAILS.CONTACT}`}
            className="text-xs sm:text-sm font-semibold text-[var(--color-brand-primary)] hover:underline break-all pt-2 border-t border-warm-100"
          >
            {CONTACT_EMAILS.CONTACT}
          </a>
        </div>

        {/* Booking */}
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
              <Users size={18} aria-hidden="true" />
            </div>

            <h2 className="font-display font-bold text-base text-charcoal-900">
              Booking Support
            </h2>

            <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
              Assistance with reservations, verification, payment instructions, and refunds.
            </p>
          </div>

          <a
            href={`mailto:${CONTACT_EMAILS.BOOKINGS}`}
            className="text-xs sm:text-sm font-semibold text-[var(--color-brand-primary)] hover:underline break-all pt-2 border-t border-warm-100"
          >
            {CONTACT_EMAILS.BOOKINGS}
          </a>
        </div>

        {/* Careers */}
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
              <Briefcase size={18} aria-hidden="true" />
            </div>

            <h2 className="font-display font-bold text-base text-charcoal-900">
              Careers & Talent
            </h2>

            <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
              Explore open coordinator, operational, and engineering roles at WeddingWithIndia.
            </p>
          </div>

          <a
            href={`mailto:${CONTACT_EMAILS.CAREERS}`}
            className="text-xs sm:text-sm font-semibold text-[var(--color-brand-primary)] hover:underline break-all pt-2 border-t border-warm-100"
          >
            {CONTACT_EMAILS.CAREERS}
          </a>
        </div>

        {/* Founder / Executive */}
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
              <Crown size={18} aria-hidden="true" />
            </div>

            <h2 className="font-display font-bold text-base text-charcoal-900">
              Founder & Executive
            </h2>

            <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
              Direct executive liaison and strategic institutional inquiries.
            </p>
          </div>

          <a
            href={`mailto:${CONTACT_EMAILS.FOUNDER}`}
            className="text-xs sm:text-sm font-semibold text-[var(--color-brand-primary)] hover:underline break-all pt-2 border-t border-warm-100"
          >
            {CONTACT_EMAILS.FOUNDER}
          </a>
        </div>
      </section>

      {/* Main content */}
      <section className="container-luxury grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-16">
        {/* Contact form */}
        <div className="lg:col-span-7 bg-white border border-warm-200/50 p-6 sm:p-10 rounded-[2.5rem] shadow-sm">
          <div className="space-y-2 mb-7">
            <h2 className="font-display font-bold text-xl text-charcoal-900">
              Send us a Message
            </h2>

            <p className="text-charcoal-500 text-sm leading-relaxed">
              Tell us what you need help with. Please do not include passport
              numbers, government ID numbers, payment card details, passwords
              or other highly sensitive information in this form.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name-input"
                  className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest"
                >
                  Full Name
                </label>

                <input
                  id="name-input"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={100}
                  value={formData.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  placeholder="Your name"
                  className="input-luxury"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email-input"
                  className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest"
                >
                  Email Address
                </label>

                <input
                  id="email-input"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={254}
                  value={formData.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  className="input-luxury"
                />
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="role-select"
                className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest"
              >
                I am a...
              </label>

              <select
                id="role-select"
                name="role"
                value={formData.role}
                onChange={(event) =>
                  updateField("role", event.target.value)
                }
                className="input-luxury bg-white cursor-pointer font-semibold"
              >
                <option value="traveler">
                  Traveler / Wedding Guest
                </option>
                <option value="host">
                  Host Family / Couple
                </option>
                <option value="agent">
                  Travel Agent / Partner
                </option>
                <option value="coordinator">
                  Event Coordinator
                </option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="subject-input"
                className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest"
              >
                Subject
              </label>

              <input
                id="subject-input"
                name="subject"
                type="text"
                required
                maxLength={160}
                value={formData.subject}
                onChange={(event) =>
                  updateField("subject", event.target.value)
                }
                placeholder="How can we help?"
                className="input-luxury"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="message-textarea"
                className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest"
              >
                Message
              </label>

              <textarea
                id="message-textarea"
                name="message"
                required
                minLength={10}
                maxLength={5000}
                rows={6}
                value={formData.message}
                onChange={(event) =>
                  updateField("message", event.target.value)
                }
                placeholder="Tell us what you need help with..."
                className="input-luxury resize-none"
              />

              <p className="text-[0.6875rem] text-charcoal-400">
                Please avoid sending passwords, card details, passport numbers
                or government identification numbers.
              </p>
            </div>

            {/* Honeypot */}
            <div
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="website-field">
                Website
              </label>

              <input
                id="website-field"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={(event) =>
                  updateField("website", event.target.value)
                }
              />
            </div>

            {/* Privacy consent */}
            <div className="rounded-2xl border border-warm-200 bg-warm-50/60 p-4">
              <label
                htmlFor="privacy-consent"
                className="flex items-start gap-3 cursor-pointer"
              >
                <input
                  id="privacy-consent"
                  name="privacyConsent"
                  type="checkbox"
                  required
                  checked={formData.privacyConsent}
                  onChange={(event) =>
                    updateField("privacyConsent", event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[var(--color-brand-primary)]"
                />

                <span className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  I understand that Wedding With India will process the
                  information I submit to respond to my enquiry. I have read
                  the{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-[var(--color-brand-primary)] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Error */}
            <AnimatePresence initial={false}>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                    aria-hidden="true"
                  />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </form>

          {/* Success */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                aria-live="polite"
                className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 mt-5"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={16} aria-hidden="true" />
                </div>

                <div>
                  <h3 className="font-sans font-bold text-emerald-800 text-sm">
                    Message received
                  </h3>

                  <p className="text-emerald-700 text-xs mt-0.5 leading-relaxed">
                    Thank you for contacting Wedding With India. Your enquiry
                    has been submitted successfully. We&apos;ll respond using
                    the email address you provided.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[0.6875rem] text-charcoal-400 leading-relaxed mt-5">
            Please do not use this form for emergencies. If you are in
            immediate danger, contact the appropriate local emergency service
            first.
          </p>
        </div>

        {/* Right column */}
        <aside className="lg:col-span-5 space-y-6">
          {/* Business contact */}
          <div className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-5">
            <div>
              <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
                Contact Information
              </h2>

              <p className="text-xs sm:text-sm text-charcoal-500 mt-3 leading-relaxed">
                For correspondence, support and business enquiries, please use
                the official email channels below.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail
                  size={16}
                  className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />

                <div>
                  <div className="font-bold text-charcoal-800 text-xs sm:text-sm">
                    General & Support
                  </div>

                  <a
                    href={`mailto:${CONTACT_EMAILS.CONTACT}`}
                    className="text-xs sm:text-sm text-charcoal-600 hover:text-[var(--color-brand-primary)] break-all"
                  >
                    {CONTACT_EMAILS.CONTACT}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users
                  size={16}
                  className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />

                <div>
                  <div className="font-bold text-charcoal-800 text-xs sm:text-sm">
                    Bookings & Payments
                  </div>

                  <a
                    href={`mailto:${CONTACT_EMAILS.BOOKINGS}`}
                    className="text-xs sm:text-sm text-charcoal-600 hover:text-[var(--color-brand-primary)] break-all"
                  >
                    {CONTACT_EMAILS.BOOKINGS}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase
                  size={16}
                  className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />

                <div>
                  <div className="font-bold text-charcoal-800 text-xs sm:text-sm">
                    Careers & Talent
                  </div>

                  <a
                    href={`mailto:${CONTACT_EMAILS.CAREERS}`}
                    className="text-xs sm:text-sm text-charcoal-600 hover:text-[var(--color-brand-primary)] break-all"
                  >
                    {CONTACT_EMAILS.CAREERS}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Crown
                  size={16}
                  className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />

                <div>
                  <div className="font-bold text-charcoal-800 text-xs sm:text-sm">
                    Founder Office
                  </div>

                  <a
                    href={`mailto:${CONTACT_EMAILS.FOUNDER}`}
                    className="text-xs sm:text-sm text-charcoal-600 hover:text-[var(--color-brand-primary)] break-all"
                  >
                    {CONTACT_EMAILS.FOUNDER}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
                <MapPin size={18} aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-display font-bold text-lg text-charcoal-900">
                  Our Presence
                </h2>

                <p className="text-xs text-charcoal-500">
                  India-based wedding experience platform
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Wedding With India operates an India-focused platform connecting
              international travelers with participating Indian wedding
              experiences. Event locations vary by individual wedding listing.
            </p>

            <div className="rounded-2xl bg-warm-50 border border-warm-200 p-4">
              <p className="text-xs text-charcoal-500 leading-relaxed">
                <strong className="text-charcoal-800">
                  Visiting an office?
                </strong>{" "}
                Please contact us before visiting. We do not publish an
                unverified walk-in address on this page.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-warm-100 border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-charcoal-800 font-display font-bold">
              <HelpCircle
                size={18}
                className="text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />

              <span>Looking for a quick answer?</span>
            </div>

            <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
              You may find answers about attending weddings, cultural
              etiquette, guest requirements and other common questions in our
              traveler guide.
            </p>

            <Link
              href="/for-travelers#faqs"
              className="inline-flex items-center gap-1.5 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-wider hover:underline pt-1"
            >
              <span>Read Traveler FAQs</span>
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </section>

      {/* Legal / privacy links */}
      <section className="container-luxury max-w-3xl">
        <div className="text-center bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-8 shadow-sm">
          <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
            For information about how we handle personal information, please
            review our{" "}
            <Link
              href="/privacy"
              className="font-semibold text-[var(--color-brand-primary)] hover:underline"
            >
              Privacy Policy
            </Link>
            . For cookie-related information, see our{" "}
            <Link
              href="/cookies"
              className="font-semibold text-[var(--color-brand-primary)] hover:underline"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}