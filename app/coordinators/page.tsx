"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Info,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { CoordinatorJourneyDiagram } from "@/components/diagrams/CoordinatorJourneyDiagram";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { COORDINATOR_MODEL } from "@/lib/constants/financial-model";

const responsibilities = [
  {
    title: "Guest Arrival & Orientation",
    description:
      "Welcome assigned international guests, help them understand the venue layout and share the event schedule and practical instructions provided by the operations team.",
    icon: MapPin,
  },
  {
    title: "Guest & Host Liaison",
    description:
      "Act as a communication point between assigned guests, the host and the Wedding With India operations team while maintaining a professional and respectful experience.",
    icon: Users,
  },
  {
    title: "Experience Assistance",
    description:
      "Help guests understand ceremony etiquette, event timing, dress guidance and other practical information included in their experience.",
    icon: Compass,
  },
  {
    title: "Issue Escalation",
    description:
      "Identify operational or guest issues and escalate them through the designated Wedding With India support process rather than attempting to handle situations outside your role.",
    icon: ShieldCheck,
  },
];

const expectations = [
  "Arrive at the agreed location and time for an accepted assignment.",
  "Communicate clearly and professionally with guests, hosts and the operations team.",
  "Follow the event-specific briefing and reasonable venue instructions.",
  "Respect religious practices, cultural traditions and guest privacy.",
  "Do not make promises to guests that have not been authorized by Wedding With India.",
  "Escalate safety, medical, security or other serious incidents through the appropriate channel.",
];

export default function CoordinatorsLandingPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      {/* Hero */}
      <section
        className="container-luxury text-center max-w-4xl mb-16 space-y-5"
        aria-labelledby="coordinator-heading"
      >
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Compass size={13} aria-hidden="true" />
          Event Operations & Guest Support
        </div>

        <h1
          id="coordinator-heading"
          className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-900 leading-tight"
        >
          Become a Wedding With India{" "}
          <span className="text-gradient-brand">
            Experience Coordinator
          </span>
        </h1>

        <p className="text-charcoal-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Support international guests at eligible Indian wedding experiences
          by helping with arrival, orientation, communication and on-ground
          event coordination.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/coordinators/apply"
            className="btn btn-primary btn-lg shadow-lg font-bold flex items-center gap-2"
          >
            Apply as Coordinator
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Role overview */}
      <section
        className="container-luxury max-w-5xl mb-20 space-y-8"
        aria-labelledby="responsibilities-heading"
      >
        <SectionHeader
          label="Role Responsibilities"
          title="What You May Do On-Ground"
          highlightedWord="Do On-Ground"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {responsibilities.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="bg-white border border-warm-200/60 p-6 sm:p-7 rounded-3xl shadow-sm space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
                  <Icon size={20} aria-hidden="true" />
                </div>

                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  {item.title}
                </h3>

                <p className="text-charcoal-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Journey diagram */}
      <section
        className="container-luxury max-w-5xl mb-20"
        aria-label="Coordinator journey"
      >
        <CoordinatorJourneyDiagram />
      </section>

      {/* How assignments work */}
      <section
        className="container-luxury max-w-5xl mb-20"
        aria-labelledby="assignment-heading"
      >
        <div className="bg-white border border-warm-200/60 rounded-[2.5rem] p-7 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-widest">
              Assignment Process
            </span>

            <h2
              id="assignment-heading"
              className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 mt-2"
            >
              From application to assignment
            </h2>

            <p className="text-sm text-charcoal-500 leading-relaxed mt-2">
              Joining the coordinator roster does not guarantee a particular
              number of assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                number: "01",
                title: "Apply",
                text: "Submit your location, experience, availability and other requested information.",
              },
              {
                number: "02",
                title: "Review",
                text: "Our team may review your application and contact you for additional information or verification.",
              },
              {
                number: "03",
                title: "Roster",
                text: "Approved candidates may be placed in an appropriate local coordinator pool.",
              },
              {
                number: "04",
                title: "Assignment",
                text: "When a suitable opportunity arises, we may contact you with the assignment details and applicable terms.",
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

      {/* Compensation and candidate profile */}
      <section
        className="container-luxury max-w-4xl bg-white border border-warm-200/60 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-20 space-y-8"
        aria-labelledby="compensation-heading"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center">
            <Award size={20} aria-hidden="true" />
          </div>

          <div>
            <span className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-widest">
              Role Details
            </span>

            <h2
              id="compensation-heading"
              className="font-display font-bold text-xl text-charcoal-900 mt-0.5"
            >
              Compensation & Candidate Profile
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Compensation */}
          <div className="bg-warm-50 border border-warm-200 p-6 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">
              Compensation Model
            </span>

            <h3 className="font-display font-bold text-lg text-[var(--color-brand-primary)]">
              {COORDINATOR_MODEL.COMPENSATION_LABEL}
            </h3>

            <p className="text-charcoal-600 text-sm leading-relaxed">
              Compensation, assignment duration, travel or meal arrangements
              and other applicable terms are confirmed before an assignment is
              accepted.
            </p>

            <p className="text-xs text-charcoal-500 leading-relaxed">
              Any displayed rate or compensation information is subject to the
              applicable coordinator agreement or assignment confirmation.
            </p>
          </div>

          {/* Candidate profile */}
          <div className="bg-warm-50 border border-warm-200 p-6 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">
              Preferred Profile
            </span>

            <h3 className="font-display font-bold text-lg text-charcoal-900">
              Event, Hospitality & People Skills
            </h3>

            <p className="text-charcoal-600 text-sm leading-relaxed">
              Experience with college events, cultural programs, hospitality,
              tourism, customer service or event operations can be useful.
            </p>

            <p className="text-xs text-charcoal-500 leading-relaxed">
              Prior experience may be preferred for some assignments but is not
              necessarily required for every role.
            </p>
          </div>
        </div>

        {/* Deployment note */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3 text-amber-900 text-sm leading-relaxed">
          <Clock
            size={18}
            className="text-amber-700 shrink-0 mt-0.5"
            aria-hidden="true"
          />

          <div>
            <strong className="font-bold">
              Local deployment:
            </strong>{" "}
            {COORDINATOR_MODEL.DEPLOYMENT_NOTE}. Coordinator applications may
            be organized by city or operating region, and assignments depend on
            actual wedding bookings, guest requirements and operational needs.
          </div>
        </div>
      </section>

      {/* Expectations */}
      <section
        className="container-luxury max-w-5xl mb-20"
        aria-labelledby="expectations-heading"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-warm-200/60 rounded-[2rem] p-7 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center mb-5">
              <CheckCircle2 size={20} aria-hidden="true" />
            </div>

            <h2
              id="expectations-heading"
              className="font-display font-bold text-xl text-charcoal-900"
            >
              What we expect
            </h2>

            <div className="space-y-3 mt-5">
              {expectations.map((item) => (
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

          <div className="bg-white border border-warm-200/60 rounded-[2rem] p-7 sm:p-8 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center mb-5">
              <Info size={20} aria-hidden="true" />
            </div>

            <h2 className="font-display font-bold text-xl text-charcoal-900">
              What this role is not
            </h2>

            <div className="space-y-4 mt-5 text-sm text-charcoal-600 leading-relaxed">
              <p>
                A coordinator is not a police officer, security guard, medical
                professional, immigration adviser, tour guide, taxi operator or
                emergency-response service unless separately qualified and
                specifically engaged for that purpose.
              </p>

              <p>
                Coordinators should not provide legal, immigration, medical or
                financial advice to guests.
              </p>

              <p>
                Serious emergencies should be escalated to the appropriate
                local emergency service and Wedding With India&apos;s designated
                operational contact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contractor/legal clarification */}
      <section className="container-luxury max-w-3xl mb-16">
        <div className="rounded-2xl border border-warm-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <Info
              size={20}
              className="mt-0.5 shrink-0 text-[var(--color-brand-primary)]"
              aria-hidden="true"
            />

            <div className="space-y-3">
              <h2 className="font-display font-bold text-lg text-charcoal-900">
                Assignment and engagement terms
              </h2>

              <p className="text-sm text-charcoal-600 leading-relaxed">
                Applying to the coordinator roster does not create an
                employment relationship, guarantee work or guarantee income.
              </p>

              <p className="text-sm text-charcoal-600 leading-relaxed">
                The legal nature of any engagement, compensation, working
                arrangements, responsibilities and applicable deductions or
                taxes will depend on the actual agreement and circumstances of
                the engagement.
              </p>

              <p className="text-sm text-charcoal-600 leading-relaxed">
                Do not rely on this page as a substitute for the specific
                coordinator agreement provided before accepting an assignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="container-luxury text-center max-w-2xl mx-auto space-y-6"
        aria-labelledby="cta-heading"
      >
        <h2
          id="cta-heading"
          className="font-display font-bold text-3xl text-charcoal-900"
        >
          Interested in joining the coordinator roster?
        </h2>

        <p className="text-charcoal-500 text-sm leading-relaxed">
          Submit your details, location and experience. If your profile matches
          an upcoming operational requirement, our team can contact you with
          further information.
        </p>

        <Link
          href="/coordinators/apply"
          className="btn btn-primary btn-lg shadow-lg font-bold inline-flex items-center gap-2"
        >
          Apply for Coordinator Roster
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}