"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Heart, Award, Compass, ArrowRight, Sparkles, Search, Building2 } from "lucide-react";
import { GuestJourneyDiagram } from "@/components/diagrams/GuestJourneyDiagram";
import { HostJourneyDiagram } from "@/components/diagrams/HostJourneyDiagram";
import { AgentJourneyDiagram } from "@/components/diagrams/AgentJourneyDiagram";
import { CoordinatorJourneyDiagram } from "@/components/diagrams/CoordinatorJourneyDiagram";

type ActiveRoleTab = "guest" | "host" | "agent" | "coordinator";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<ActiveRoleTab>("guest");

  const roles = [
    {
      id: "guest" as ActiveRoleTab,
      title: "For Global Guests",
      tagline: "Book & Attend Live Weddings",
      targetAudience: "Travelers seeking authentic cultural immersion.",
      benefit: "Attend real celebrations with attire, meals, & 24/7 liaison included.",
      ctaHref: "/weddings",
      ctaText: "Browse Celebrations",
      icon: Heart,
    },
    {
      id: "host" as ActiveRoleTab,
      title: "For Host Families",
      tagline: "List Your Wedding & Earn 72%",
      targetAudience: "Indian couples & families hosting a wedding.",
      benefit: "Share sacred traditions, offset costs, & receive 72% direct payout.",
      ctaHref: "/list-wedding",
      ctaText: "List Your Wedding",
      icon: Building2,
    },
    {
      id: "agent" as ActiveRoleTab,
      title: "For Freelance Agents",
      tagline: "Refer Travelers (7%) or Hosts (4%)",
      targetAudience: "Travel advisors, bloggers, students, & networkers.",
      benefit: "Earn 7% traveler & 4% host referral commissions post-clearance.",
      ctaHref: "/for-agents",
      ctaText: "Become an Agent",
      icon: Award,
    },
    {
      id: "coordinator" as ActiveRoleTab,
      title: "For Event Coordinators",
      tagline: "On-Ground Management (Per-Day Pay)",
      targetAudience: "Energetic individuals with college fest/event experience.",
      benefit: "Manage guests at live weddings & earn confirmed per-day rates.",
      ctaHref: "/coordinators",
      ctaText: "Apply as Coordinator",
      icon: Compass,
    },
  ];

  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      
      {/* Hero Section */}
      <section className="container-luxury text-center max-w-4xl mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Sparkles size={13} />
          Platform Overview & Disambiguation
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-900 leading-tight">
          How <span className="text-gradient-brand">WeddingWithIndia</span> Works
        </h1>
        <p className="text-charcoal-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          WeddingWithIndia is a cultural marketplace connecting four distinct roles. Select a role below to explore how it works and where you fit in.
        </p>
      </section>

      {/* 4 Role Selector Cards */}
      <section className="container-luxury max-w-6xl mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((r) => {
            const IconComp = r.icon;
            const isSelected = activeTab === r.id;

            return (
              <div
                key={r.id}
                onClick={() => setActiveTab(r.id)}
                className={`bg-white border rounded-3xl p-6 shadow-sm cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 relative ${
                  isSelected
                    ? "border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20 shadow-md"
                    : "border-warm-200/60 hover:border-warm-300"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
                      <IconComp size={20} />
                    </div>
                    {isSelected && (
                      <span className="text-[0.625rem] font-bold uppercase tracking-wider bg-maroon-50 text-[var(--color-brand-primary)] px-2.5 py-1 rounded-full border border-maroon-100">
                        Active View
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-charcoal-900">{r.title}</h3>
                    <span className="text-xs font-bold text-[var(--color-brand-primary)] block mt-0.5">{r.tagline}</span>
                  </div>
                  <p className="text-charcoal-600 text-xs leading-relaxed">{r.benefit}</p>
                </div>

                <div className="pt-2 border-t border-warm-100 flex items-center justify-between">
                  <span className="text-[0.6875rem] font-semibold text-charcoal-400">Target: {r.targetAudience.split(" ")[0]}</span>
                  <Link
                    href={r.ctaHref}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1"
                  >
                    Go to Page <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Explainer Diagram Switcher */}
      <section className="container-luxury max-w-6xl mb-20 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-warm-200 pb-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-charcoal-900">
              Role Journey Diagram
            </h2>
            <p className="text-xs text-charcoal-500">
              Visual step-by-step breakdown for <strong>{roles.find(r => r.id === activeTab)?.title}</strong>
            </p>
          </div>

          {/* Diagram Tab Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white border border-warm-200 p-1.5 rounded-2xl shadow-xs">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveTab(r.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === r.id
                    ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
                    : "text-charcoal-600 hover:text-charcoal-900 hover:bg-warm-100/60"
                }`}
              >
                {r.title.replace("For ", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Diagram Display */}
        <div className="transition-all duration-300">
          {activeTab === "guest" && <GuestJourneyDiagram />}
          {activeTab === "host" && <HostJourneyDiagram />}
          {activeTab === "agent" && <AgentJourneyDiagram />}
          {activeTab === "coordinator" && <CoordinatorJourneyDiagram />}
        </div>
      </section>

      {/* Dedicated Role CTAs Footer */}
      <section className="container-luxury max-w-5xl bg-white border border-warm-200/60 rounded-[2.5rem] p-8 sm:p-12 shadow-sm text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
            Ready to Join WeddingWithIndia?
          </h2>
          <p className="text-charcoal-500 text-sm">
            Whether you want to attend, host, refer, or coordinate, select your path below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/weddings" className="btn btn-primary py-3.5 text-xs font-bold justify-center">
            Explore Weddings (Guest)
          </Link>
          <Link href="/list-wedding" className="btn btn-secondary py-3.5 text-xs font-bold justify-center">
            List Your Wedding (Host)
          </Link>
          <Link href="/for-agents" className="btn btn-secondary py-3.5 text-xs font-bold justify-center">
            Become an Agent (7% Rate)
          </Link>
          <Link href="/coordinators" className="btn btn-secondary py-3.5 text-xs font-bold justify-center">
            Become a Coordinator
          </Link>
        </div>
      </section>

    </div>
  );
}
