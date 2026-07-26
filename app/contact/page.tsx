"use client";

import { useState } from "react";
import { Mail, MapPin, HelpCircle, Send, Check, Compass, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    role: "traveler"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "", role: "traveler" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      
      {/* Intro Hero */}
      <section className="container-luxury text-center max-w-3xl mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Mail size={12} />
          Contact Support
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-charcoal-900 leading-tight">
          We&apos;re here to <span className="text-gradient-brand">help</span>
        </h1>
        <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed">
          Have questions about listings, host vetting, or partnership referral programs? Send us a message or contact our team directly.
        </p>
      </section>

      {/* Support Cards Row */}
      <section className="container-luxury grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        
        {/* Card 1 */}
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Mail size={18} />
          </div>
          <h3 className="font-display font-bold text-base text-charcoal-900">General Questions</h3>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            For general enquiries, media, and quick help.
          </p>
          <a href="mailto:hello@weddingwithindia.com" className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline block">
            hello@weddingwithindia.com
          </a>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Users size={18} />
          </div>
          <h3 className="font-display font-bold text-base text-charcoal-900">Booking Assistance</h3>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            For active booking issues, verification updates, or refunds.
          </p>
          <a href="mailto:bookings@weddingwithindia.com" className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline block">
            bookings@weddingwithindia.com
          </a>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Compass size={18} />
          </div>
          <h3 className="font-display font-bold text-base text-charcoal-900">Partnership Requests</h3>
          <p className="text-charcoal-500 text-xs sm:text-sm">
            For travel agents, student ambassadors, or influencers.
          </p>
          <a href="mailto:partners@weddingwithindia.com" className="text-sm font-semibold text-[var(--color-brand-primary)] hover:underline block">
            partners@weddingwithindia.com
          </a>
        </div>

      </section>

      {/* Main Form & Office Grid */}
      <section className="container-luxury grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        
        {/* Form panel */}
        <div className="lg:col-span-7 bg-white border border-warm-200/50 p-6 sm:p-10 rounded-[2.5rem] shadow-sm space-y-6">
          <h2 className="font-display font-bold text-xl text-charcoal-900">Send us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name-input" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="input-luxury"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email-input" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="input-luxury"
                />
              </div>
            </div>

            {/* Role / Subject Selection */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="role-select" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">
                I am a...
              </label>
              <select
                id="role-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-luxury bg-white cursor-pointer font-semibold"
              >
                <option value="traveler">Traveler / Guest</option>
                <option value="couple">Host Family / Couple</option>
                <option value="agent">Travel Agent / Partner</option>
              </select>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject-input" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">
                Subject
              </label>
              <input
                id="subject-input"
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="How does vetting work?"
                className="input-luxury"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message-textarea" className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-widest">
                Message
              </label>
              <textarea
                id="message-textarea"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your query here…"
                className="input-luxury resize-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3.5 justify-center shadow-md font-bold rounded-2xl group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Send Message
                  <Send size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Success Dialog */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 border border-emerald-500/10 p-4 rounded-2xl flex items-start gap-3 mt-4"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check size={16} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-emerald-800 text-sm">Message Sent!</h4>
                  <p className="text-emerald-700 text-xs mt-0.5 leading-normal">
                    Thank you. We have received your query and our compliance/liaison team will get back to you within 24 hours.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Office Details */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Office Address details */}
          <div className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              Our Locations
            </h3>
            
            <div className="space-y-4 text-sm text-charcoal-600">
              {/* Mumbai */}
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-charcoal-800 text-xs sm:text-sm">Mumbai Office (HQ)</div>
                  <div className="text-xs sm:text-sm mt-0.5">
                    Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051, India
                  </div>
                </div>
              </div>

              {/* Delhi */}
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-charcoal-800 text-xs sm:text-sm">New Delhi Office</div>
                  <div className="text-xs sm:text-sm mt-0.5">
                    Connaught Place, New Delhi, Delhi 110001, India
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Box */}
          <div className="bg-warm-100 border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-charcoal-800 font-display font-bold">
              <HelpCircle size={18} className="text-[var(--color-brand-primary)]" />
              <span>Checking FAQs?</span>
            </div>
            <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
              If you have quick queries about what clothes to wear, how payouts work, or security, please check our FAQ listings first.
            </p>
            <Link href="/for-travelers#faqs" className="inline-flex items-center gap-1.5 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-wider hover:underline pt-1">
              <span>Read Travelers FAQs</span>
              <ArrowRight size={12} />
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
}


