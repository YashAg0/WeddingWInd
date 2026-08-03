"use client";

import Link from "next/link";
import { Users, Calendar, MapPin, ShieldCheck, CheckCircle2, ArrowRight, Clock, Award, Compass, MessageSquare } from "lucide-react";
import { CoordinatorJourneyDiagram } from "@/components/diagrams/CoordinatorJourneyDiagram";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { COORDINATOR_MODEL } from "@/lib/constants/financial-model";

export default function CoordinatorsLandingPage() {
  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      
      {/* Hero */}
      <section className="container-luxury text-center max-w-4xl mb-16 space-y-5">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Compass size={13} />
          Event Operations & Guest Management
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-900 leading-tight">
          Become a Local Experience Coordinator <br className="hidden sm:inline" />
          <span className="text-gradient-brand">On-Ground Wedding Host</span>
        </h1>
        <p className="text-charcoal-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Manage and guide international guests at live Indian wedding celebrations. A hands-on, per-event day contractor role tailored for energetic individuals.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/coordinators/apply"
            className="btn btn-primary btn-lg shadow-lg font-bold flex items-center gap-2"
          >
            Apply as Coordinator
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Role Responsibilities */}
      <section className="container-luxury max-w-5xl mb-20 space-y-8">
        <SectionHeader
          label="Key Responsibilities"
          title="What You Do On-Ground"
          highlightedWord="What You Do"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
              <MapPin size={20} />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal-900">Guest Arrival & Orientation</h3>
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              Greet international guests upon arrival at the venue, provide physical cultural guidebooks, and orient them with event schedules and venue layouts.
            </p>
          </div>

          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal-900">Cultural Hospitality & Liaison</h3>
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              Keep international visitors comfortable, engaged, and seated correctly during ceremonies. Act as a friendly bridge between the host family and guests.
            </p>
          </div>

          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
              <Compass size={20} />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal-900">Logistics & Attire Coordination</h3>
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              Assist guests with traditional clothing drape fitting (turbans, dupattas, sarees), venue dietary guidance, and local transportation coordination.
            </p>
          </div>

          <div className="bg-white border border-warm-200/60 p-6 rounded-3xl shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 text-[var(--color-brand-primary)] flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal-900">On-Site Escalation & Safety</h3>
            <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">
              Serve as the designated point of contact to resolve any guest inquiries or logistical issues immediately, maintaining safety and smooth operations.
            </p>
          </div>
        </div>
      </section>

      {/* On-Site Coordinator Explainer Diagram */}
      <section className="container-luxury max-w-5xl mb-20">
        <CoordinatorJourneyDiagram />
      </section>

      {/* Role Details: Pay & Qualifications */}
      <section className="container-luxury max-w-4xl bg-white border border-warm-200/60 rounded-[2.5rem] p-6 sm:p-10 shadow-sm mb-20 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
            <Award size={20} />
          </div>
          <h2 className="font-display font-bold text-xl text-charcoal-900">
            Compensation & Preferred Candidate Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Per-Day Pay */}
          <div className="bg-warm-50 border border-warm-200 p-6 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Compensation Model</span>
            <h4 className="font-display font-bold text-lg text-[var(--color-brand-primary)]">
              {COORDINATOR_MODEL.COMPENSATION_LABEL}
            </h4>
            <p className="text-charcoal-600 text-xs leading-relaxed">
              This is a contractor per-event-day role. Daily rates and meal inclusions are confirmed with candidates prior to each wedding assignment. Not a salaried position.
            </p>
          </div>

          {/* Preferred Profile */}
          <div className="bg-warm-50 border border-warm-200 p-6 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest block">Preferred Experience</span>
            <h4 className="font-display font-bold text-lg text-charcoal-900">
              College Event & Fest Management
            </h4>
            <p className="text-charcoal-600 text-xs leading-relaxed">
              College students and young professionals with prior experience leading college fests, cultural societies, or hospitality events are strongly preferred.
            </p>
          </div>
        </div>

        {/* City Density Deployment Note */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3 text-amber-900 text-xs sm:text-sm leading-relaxed">
          <Clock size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">City Density Deployment Note:</strong> {COORDINATOR_MODEL.DEPLOYMENT_NOTE}. Applications are pooled by city (e.g., Jaipur, Udaipur, Amritsar, Delhi, Goa) and activated as local wedding bookings are confirmed.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-luxury text-center max-w-2xl mx-auto space-y-6">
        <h2 className="font-display font-bold text-3xl text-charcoal-900">
          Ready to Coordinate Real Weddings?
        </h2>
        <p className="text-charcoal-500 text-sm leading-relaxed">
          Submit your details to join our coordinator roster. When weddings are scheduled in your city, our operations team will contact you.
        </p>
        <Link
          href="/coordinators/apply"
          className="btn btn-primary btn-lg shadow-lg font-bold inline-flex items-center gap-2"
        >
          Apply for Coordinator Roster
          <ArrowRight size={16} />
        </Link>
      </section>

    </div>
  );
}
