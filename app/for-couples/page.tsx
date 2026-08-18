"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Gift,
  Heart,
  Info,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";
import { cn } from "@/lib/utils";

const hostFAQs = [
  {
    q: "Who pays for the guest's clothing?",
    a: "Guests are generally responsible for their own clothing and personal purchases unless a particular experience explicitly includes attire. Hosts can share recommendations for local shops or traditional clothing, but should not represent optional purchases as included unless they are part of the confirmed booking.",
  },
  {
    q: "How many international guests can we host?",
    a: "You decide the number of guest places you are comfortable offering, subject to the capacity, venue rules, family preferences and requirements applicable to your celebration. Wedding With India may also apply reasonable limits for safety, operations or experience quality.",
  },
  {
    q: "How much can we earn?",
    a: "Your earnings depend on the experience price, number of confirmed and completed bookings, applicable Platform fees, taxes, refunds, payment costs and the commercial terms applicable to your host account. The calculator on this page is only an illustrative estimate and is not a guaranteed payout.",
  },
  {
    q: "How does guest verification work?",
    a: "Wedding With India may use identity, account, booking or other verification measures depending on the experience and applicable requirements. Verification methods can vary, and verification does not guarantee a guest's future conduct or eliminate all risk.",
  },
  {
    q: "Do we have to accept every guest?",
    a: "Not necessarily. The applicable booking workflow will determine whether a host can review and approve an application. Hosts must apply the Platform's rules consistently and must not reject or treat guests unlawfully on a prohibited discriminatory basis.",
  },
  {
    q: "What happens if we need to cancel?",
    a: "If you need to cancel or materially change a confirmed experience, notify Wedding With India as soon as reasonably possible. Guest refunds and any resulting host payout adjustments are handled according to the applicable booking and cancellation terms.",
  },
  {
    q: "When will we receive our payout?",
    a: "Payout timing depends on the payment provider, verification status, the applicable host agreement and the booking's settlement conditions. A specific payout timeframe should only be relied upon when it is expressly shown in your applicable commercial or payout terms.",
  },
  {
    q: "Are we responsible for taxes?",
    a: "Hosts are responsible for understanding and meeting tax and reporting obligations applicable to income or payments they receive. The exact treatment can depend on your legal status, location, turnover and the nature of the experience. Consider professional tax advice where appropriate.",
  },
];

const hostBenefits = [
  {
    title: "Share your celebration",
    description:
      "Give international travelers an opportunity to experience selected parts of your celebration, traditions, food and hospitality.",
    icon: Heart,
  },
  {
    title: "Potential additional income",
    description:
      "Earn according to the actual bookings and commercial terms applicable to your experience. Use our estimator for an illustrative scenario.",
    icon: DollarSign,
  },
  {
    title: "Structured guest experience",
    description:
      "Present your event details, guest requirements, inclusions and expectations clearly before a traveler books.",
    icon: ShieldCheck,
  },
  {
    title: "Cross-cultural connection",
    description:
      "Meet people from around the world while sharing the traditions and atmosphere that make your celebration special.",
    icon: Gift,
  },
];

const hostResponsibilities = [
  "Provide accurate information about the wedding experience.",
  "Only offer access to ceremonies, venues and activities you are authorized to offer.",
  "Clearly disclose what is and is not included in the guest booking.",
  "Follow applicable Platform, safety, privacy and payment requirements.",
  "Treat guests respectfully and maintain reasonable safety standards.",
  "Promptly report material changes or cancellations affecting confirmed bookings.",
];

import { HostEarningsCalculator } from "@/components/wedding/HostEarningsCalculator";

export default function ForCouplesPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      {/* Hero */}
      <section
        className="container-luxury text-center max-w-3xl mb-16 space-y-5"
        aria-labelledby="host-heading"
      >
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Heart size={12} aria-hidden="true" />
          Host Your Wedding Experience
        </div>

        <h1
          id="host-heading"
          className="font-display font-bold text-4xl sm:text-5xl text-charcoal-900 leading-tight"
        >
          Share your celebration.{" "}
          <span className="text-gradient-brand">
            Welcome guests from around the world.
          </span>
        </h1>

        <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Wedding With India helps eligible hosts offer selected parts of their
          Indian wedding celebrations to international travelers who want to
          experience Indian culture respectfully.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/list-wedding"
            className="btn btn-primary btn-lg inline-flex items-center gap-2 shadow-sm"
          >
            Apply to Become a Host
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <Link
            href="#earnings"
            className="btn btn-secondary btn-lg inline-flex items-center gap-2"
          >
            Estimate Earnings
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section
        className="container-luxury max-w-6xl mb-20"
        aria-labelledby="benefits-heading"
      >
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
            Why host?
          </p>

          <h2
            id="benefits-heading"
            className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 mt-2"
          >
            More than a wedding listing
          </h2>

          <p className="text-sm text-charcoal-500 mt-2 leading-relaxed">
            Build a thoughtfully designed cultural experience around a
            celebration you are already having.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {hostBenefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="bg-white border border-warm-200/50 p-7 rounded-[2rem] shadow-sm space-y-4"
              >
                <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
                  <Icon size={21} aria-hidden="true" />
                </div>

                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  {benefit.title}
                </h3>

                <p className="text-charcoal-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How hosting works */}
      <section
        className="container-luxury max-w-5xl mb-20"
        aria-labelledby="process-heading"
      >
        <div className="bg-white border border-warm-200/50 rounded-[2.5rem] p-7 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
              The host journey
            </p>

            <h2
              id="process-heading"
              className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 mt-2"
            >
              From wedding plans to international guests
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                number: "01",
                title: "Apply",
                text: "Tell us about your celebration, location, dates, available guest places and the experience you want to offer.",
              },
              {
                number: "02",
                title: "Review",
                text: "We may review your information and request verification or additional details before your experience is published.",
              },
              {
                number: "03",
                title: "Receive bookings",
                text: "Eligible travelers can discover your experience and submit bookings according to the applicable booking workflow.",
              },
              {
                number: "04",
                title: "Host",
                text: "Welcome confirmed guests to the parts of your celebration included in their booking and follow the applicable host requirements.",
              },
            ].map((step) => (
              <div key={step.number} className="space-y-3">
                <div className="text-xs font-bold tracking-widest text-[var(--color-brand-primary)]">
                  {step.number}
                </div>

                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  {step.title}
                </h3>

                <p className="text-sm text-charcoal-500 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings calculator */}
      <section id="earnings" className="container-luxury max-w-5xl mb-20" aria-label="Host Earnings Calculator">
        <HostEarningsCalculator />
      </section>

      {/* Responsibilities */}
      <section
        className="container-luxury max-w-5xl mb-20"
        aria-labelledby="responsibilities-heading"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-warm-200/50 rounded-[2rem] p-7 sm:p-8 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center mb-5">
              <Users size={21} aria-hidden="true" />
            </div>

            <h2
              id="responsibilities-heading"
              className="font-display font-bold text-xl text-charcoal-900"
            >
              Your responsibilities
            </h2>

            <p className="text-sm text-charcoal-500 leading-relaxed mt-2 mb-5">
              Hosting is a real-world responsibility. A successful experience
              starts with accurate information and clear expectations.
            </p>

            <div className="space-y-3">
              {hostResponsibilities.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                    aria-hidden="true"
                  />

                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-warm-200/50 rounded-[2rem] p-7 sm:p-8 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center mb-5">
              <ShieldCheck size={21} aria-hidden="true" />
            </div>

            <h2 className="font-display font-bold text-xl text-charcoal-900">
              What Wedding With India does
            </h2>

            <p className="text-sm text-charcoal-500 leading-relaxed mt-2 mb-5">
              Depending on the experience and operational setup, the Platform
              may support hosts with:
            </p>

            <div className="space-y-3">
              {[
                "Experience discovery and listing management.",
                "Guest applications and booking workflows.",
                "Applicable identity or account verification.",
                "Platform communications and booking information.",
                "Payment processing through applicable payment infrastructure.",
                "Support and operational guidance related to the Platform.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
                    aria-hidden="true"
                  />

                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-warm-50 border border-warm-200 p-4">
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Wedding With India does not replace local emergency services,
                immigration authorities, professional legal advisers, tax
                advisers, medical providers or venue operators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section
        className="container-luxury max-w-3xl mb-20 space-y-8"
        aria-labelledby="faq-heading"
      >
        <SectionHeader
          label="Host Guidance"
          title="Frequently Asked Questions"
          highlightedWord="Questions"
        />

        <div className="space-y-4">
          {hostFAQs.map((faq) => (
            <details
              key={faq.q}
              className="group bg-white border border-warm-200/50 rounded-2xl shadow-sm overflow-hidden"
            >
              <summary className="list-none cursor-pointer p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-primary)]">
                <div className="flex items-start justify-between gap-5">
                  <h3 className="font-display font-bold text-base text-charcoal-900">
                    {faq.q}
                  </h3>

                  <span
                    className="text-[var(--color-brand-primary)] text-lg leading-none transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </div>
              </summary>

              <div className="px-6 pb-6">
                <p className="text-charcoal-600 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Legal / commercial disclaimer */}
      <section className="container-luxury max-w-3xl mb-16">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
          <div className="flex items-start gap-3">
            <Info
              size={20}
              className="mt-0.5 shrink-0 text-amber-700"
              aria-hidden="true"
            />

            <div className="space-y-3">
              <h2 className="font-display font-bold text-lg text-charcoal-900">
                Important information for prospective hosts
              </h2>

              <p className="text-sm text-charcoal-700 leading-relaxed">
                Applying to become a host does not guarantee approval,
                publication, bookings, guest attendance or earnings.
              </p>

              <p className="text-sm text-charcoal-700 leading-relaxed">
                Any fees, commissions, host-share percentages, taxes, payment
                processing costs, refund adjustments and payout timing are
                governed by the applicable host commercial agreement and booking
                terms.
              </p>

              <p className="text-sm text-charcoal-600 leading-relaxed">
                Hosts remain responsible for complying with applicable laws,
                venue requirements, tax obligations, privacy requirements and
                other obligations relating to their activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="container-luxury text-center max-w-2xl"
        aria-labelledby="cta-heading"
      >
        <div className="bg-white border border-warm-200/50 p-8 sm:p-10 rounded-[2.5rem] shadow-sm space-y-5">
          <div className="w-11 h-11 mx-auto rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Heart size={20} aria-hidden="true" />
          </div>

          <h2
            id="cta-heading"
            className="font-display font-bold text-2xl text-charcoal-900"
          >
            Ready to share your celebration?
          </h2>

          <p className="text-charcoal-500 text-sm leading-relaxed">
            Submit your host application and tell us about the celebration you
            would like to share with international travelers.
          </p>

          <Link
            href="/list-wedding"
            className="btn btn-primary btn-lg shadow-lg group inline-flex gap-2"
          >
            Apply to Become a Host
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}