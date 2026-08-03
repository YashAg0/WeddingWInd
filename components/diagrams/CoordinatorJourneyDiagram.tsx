"use client";

import { FileCheck, Search, Building2, Calendar, DollarSign, Compass } from "lucide-react";

export function CoordinatorJourneyDiagram() {
  const steps = [
    {
      num: "01",
      title: "Roster Application",
      desc: "Submit city, languages, and event/fest management experience.",
      icon: FileCheck,
    },
    {
      num: "02",
      title: "Background Review",
      desc: "Regional ops verifies event qualifications and language fluency.",
      icon: Search,
    },
    {
      num: "03",
      title: "City Roster Pool",
      desc: "Approved profile placed on roster awaiting local city activation.",
      icon: Building2,
      accent: true,
    },
    {
      num: "04",
      title: "Placed on Shift",
      desc: "Assigned to live wedding shifts as guest liaison when bookings scale.",
      icon: Calendar,
    },
    {
      num: "05",
      title: "Paid Per Day",
      desc: "Contractor daily rate confirmed post-event completion.",
      icon: DollarSign,
    },
  ];

  return (
    <div className="w-full bg-white border border-purple-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
          <Compass size={12} /> Coordinator Operations Flow
        </div>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal-900">
          How On-Ground Coordination Works
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((step) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.num}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-colors ${
                step.accent
                  ? "bg-purple-50/70 border-purple-200"
                  : "bg-warm-50/60 border-warm-200/60 hover:border-purple-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                    step.accent
                      ? "bg-purple-100 text-purple-800"
                      : "bg-white border border-warm-200/60 text-purple-700"
                  }`}
                >
                  <IconComponent size={18} />
                </div>
                <span className="font-display font-black text-xl text-purple-300">
                  {step.num}
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-charcoal-900">
                  {step.title}
                </h4>
                <p className="text-charcoal-600 text-xs leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
