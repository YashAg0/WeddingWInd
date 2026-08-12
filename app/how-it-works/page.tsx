"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Award,
  Compass,
  ArrowRight,
  Sparkles,
  Building2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { GuestJourneyDiagram } from "@/components/diagrams/GuestJourneyDiagram";
import { HostJourneyDiagram } from "@/components/diagrams/HostJourneyDiagram";
import { AgentJourneyDiagram } from "@/components/diagrams/AgentJourneyDiagram";
import { CoordinatorJourneyDiagram } from "@/components/diagrams/CoordinatorJourneyDiagram";

type ActiveRoleTab = "guest" | "host" | "agent" | "coordinator";

type Role = {
  id: ActiveRoleTab;
  title: string;
  tagline: string;
  targetAudience: string;
  benefit: string;
  ctaHref: string;
  ctaText: string;
  icon: typeof Heart;
};

const roles: Role[] = [
  {
    id: "guest",
    title: "For Global Guests",
    tagline: "Discover authentic Indian weddings",
    targetAudience: "International travelers seeking cultural immersion.",
    benefit:
      "Browse available wedding experiences, review the booking terms, complete required verification, and attend an eligible celebration.",
    ctaHref: "/weddings",
    ctaText: "Browse Weddings",
    icon: Heart,
  },
  {
    id: "host",
    title: "For Host Families",
    tagline: "Share your celebration with guests",
    targetAudience: "Indian couples and families hosting eligible celebrations.",
    benefit:
      "List an eligible wedding experience, provide the required information, welcome approved guests, and receive payouts according to your host agreement.",
    ctaHref: "/list-wedding",
    ctaText: "Become a Host",
    icon: Building2,
  },
  {
    id: "agent",
    title: "For Referral Agents",
    tagline: "Refer guests or eligible hosts",
    targetAudience:
      "Travel professionals, creators, students, networkers, and community connectors.",
    benefit:
      "Introduce suitable travelers or hosts through your referral link and earn commissions when eligible referrals meet the applicable program requirements.",
    ctaHref: "/for-agents",
    ctaText: "Explore Agent Program",
    icon: Award,
  },
  {
    id: "coordinator",
    title: "For Event Coordinators",
    tagline: "Support guests on the ground",
    targetAudience:
      "People with event, hospitality, tourism, or coordination experience.",
    benefit:
      "Support approved experiences where coordinator services are required and receive compensation according to the applicable coordinator agreement.",
    ctaHref: "/coordinators",
    ctaText: "Apply as Coordinator",
    icon: Compass,
  },
];

const roleDescriptions: Record<ActiveRoleTab, string> = {
  guest:
    "Guests discover eligible Indian wedding experiences, review the details and booking conditions, complete any required verification, and attend the celebration.",
  host:
    "Hosts can submit eligible celebrations for consideration, provide event information, communicate with approved guests, and receive applicable payouts under their host agreement.",
  agent:
    "Agents introduce suitable guests or hosts to Wedding With India using approved referral methods. Eligibility, attribution, commission rates and payment conditions are defined by the applicable agent program.",
  coordinator:
    "Coordinators support selected experiences on the ground when their services are requested and confirmed. Responsibilities, availability, compensation and safety requirements are agreed before the assignment.",
};

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<ActiveRoleTab>("guest");

  const activeRole = roles.find((role) => role.id === activeTab)!;

  const selectRole = (role: ActiveRoleTab) => {
    setActiveTab(role);
  };

  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      {/* Hero */}
      <section
        className="container-luxury max-w-4xl text-center mb-16"
        aria-labelledby="how-it-works-heading"
      >
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Sparkles size={13} aria-hidden="true" />
          How the platform works
        </div>

        <h1
          id="how-it-works-heading"
          className="mt-4 font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-900 leading-tight"
        >
          Experience India{" "}
          <span className="text-gradient-brand">
            through its celebrations
          </span>
        </h1>

        <p className="text-charcoal-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mt-4">
          Wedding With India connects international travelers with eligible
          Indian wedding experiences while giving hosts, referral partners and
          event coordinators a structured way to participate.
        </p>
      </section>

      {/* Role selector */}
      <section
        className="container-luxury max-w-6xl mb-16"
        aria-labelledby="choose-your-role"
      >
        <div className="mb-6 text-center sm:text-left">
          <h2
            id="choose-your-role"
            className="font-display font-bold text-2xl text-charcoal-900"
          >
            Choose your path
          </h2>

          <p className="text-sm text-charcoal-500 mt-1">
            Select the role that best describes how you want to use Wedding
            With India.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((role) => {
            const IconComp = role.icon;
            const isSelected = activeTab === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => selectRole(role.id)}
                aria-pressed={isSelected}
                className={`text-left bg-white border rounded-3xl p-6 shadow-sm cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[255px] relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/15 shadow-md"
                    : "border-warm-200/60 hover:border-warm-300 hover:shadow-md"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
                      <IconComp size={20} aria-hidden="true" />
                    </div>

                    {isSelected && (
                      <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-maroon-50 text-[var(--color-brand-primary)] px-2.5 py-1 rounded-full border border-maroon-100">
                        Selected
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-charcoal-900">
                      {role.title}
                    </h3>

                    <p className="text-xs font-bold text-[var(--color-brand-primary)] mt-1">
                      {role.tagline}
                    </p>
                  </div>

                  <p className="text-charcoal-600 text-xs leading-relaxed">
                    {role.benefit}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-warm-100 flex items-center justify-between">
                  <span className="text-[0.6875rem] font-semibold text-charcoal-400">
                    {role.targetAudience}
                  </span>

                  <ArrowRight
                    size={15}
                    className="shrink-0 text-[var(--color-brand-primary)]"
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active role explanation */}
      <section
        className="container-luxury max-w-6xl mb-16"
        aria-live="polite"
      >
        <div className="bg-white border border-warm-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)] mb-2">
                {activeRole.title}
              </p>

              <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
                {activeRole.tagline}
              </h2>

              <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed mt-3">
                {roleDescriptions[activeTab]}
              </p>
            </div>

            <Link
              href={activeRole.ctaHref}
              className="btn btn-primary shrink-0 justify-center py-3.5 px-6 text-sm font-bold"
            >
              {activeRole.ctaText}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section
        className="container-luxury max-w-6xl mb-20"
        aria-labelledby="journey-heading"
      >
        <div className="flex flex-col gap-5 border-b border-warm-200 pb-5 mb-8">
          <div>
            <h2
              id="journey-heading"
              className="font-display font-bold text-2xl text-charcoal-900"
            >
              Your journey
            </h2>

            <p className="text-sm text-charcoal-500 mt-1">
              A step-by-step view of the{" "}
              <strong>{activeRole.title.toLowerCase()}</strong> experience.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5 bg-white border border-warm-200 p-1.5 rounded-2xl shadow-xs w-fit"
            role="tablist"
            aria-label="Select a role"
          >
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                role="tab"
                aria-selected={activeTab === role.id}
                onClick={() => selectRole(role.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
                  activeTab === role.id
                    ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
                    : "text-charcoal-600 hover:text-charcoal-900 hover:bg-warm-100/60"
                }`}
              >
                {role.title.replace("For ", "")}
              </button>
            ))}
          </div>
        </div>

        <div className="transition-all duration-300">
          {activeTab === "guest" && <GuestJourneyDiagram />}
          {activeTab === "host" && <HostJourneyDiagram />}
          {activeTab === "agent" && <AgentJourneyDiagram />}
          {activeTab === "coordinator" && <CoordinatorJourneyDiagram />}
        </div>
      </section>

      {/* Trust principles */}
      <section
        className="container-luxury max-w-6xl mb-20"
        aria-labelledby="principles-heading"
      >
        <div className="bg-white border border-warm-200/60 rounded-[2rem] p-7 sm:p-10 shadow-sm">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
              Built around trust
            </p>

            <h2
              id="principles-heading"
              className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 mt-2"
            >
              Clear expectations at every step
            </h2>

            <p className="text-sm text-charcoal-500 mt-2 leading-relaxed">
              Wedding With India is designed to make the relationship between
              guests, hosts and partners clear before an experience takes
              place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-3">
              <ShieldCheck
                size={21}
                className="text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />
              <h3 className="font-display font-bold text-charcoal-900">
                Verification where required
              </h3>
              <p className="text-sm text-charcoal-500 leading-relaxed">
                Certain bookings or roles may require identity, account,
                payment or experience verification before participation.
              </p>
            </div>

            <div className="space-y-3">
              <CheckCircle2
                size={21}
                className="text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />
              <h3 className="font-display font-bold text-charcoal-900">
                Clear booking terms
              </h3>
              <p className="text-sm text-charcoal-500 leading-relaxed">
                Guests can review applicable experience details, pricing,
                cancellation rules and requirements before completing a
                booking.
              </p>
            </div>

            <div className="space-y-3">
              <Heart
                size={21}
                className="text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />
              <h3 className="font-display font-bold text-charcoal-900">
                Respect for the celebration
              </h3>
              <p className="text-sm text-charcoal-500 leading-relaxed">
                Guests and hosts are expected to respect privacy, personal
                boundaries, family traditions and applicable event rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="container-luxury max-w-5xl bg-white border border-warm-200/60 rounded-[2.5rem] p-8 sm:p-12 shadow-sm text-center"
        aria-labelledby="join-heading"
      >
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-primary)]">
            Find your place
          </p>

          <h2
            id="join-heading"
            className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900"
          >
            Ready to experience Wedding With India?
          </h2>

          <p className="text-charcoal-500 text-sm leading-relaxed">
            Explore an experience, share your celebration, refer someone, or
            help make an experience happen on the ground.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Link
            href="/weddings"
            className="btn btn-primary py-3.5 text-xs font-bold justify-center"
          >
            Explore Weddings
          </Link>

          <Link
            href="/list-wedding"
            className="btn btn-secondary py-3.5 text-xs font-bold justify-center"
          >
            Become a Host
          </Link>

          <Link
            href="/for-agents"
            className="btn btn-secondary py-3.5 text-xs font-bold justify-center"
          >
            Explore Agent Program
          </Link>

          <Link
            href="/coordinators"
            className="btn btn-secondary py-3.5 text-xs font-bold justify-center"
          >
            Become a Coordinator
          </Link>
        </div>
      </section>
    </main>
  );
}