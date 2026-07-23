"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Users, UserCheck, Sparkles, Milestone, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";

type TabKey = "travelers" | "couples" | "agents";

interface Step {
  stepNum: number;
  title: string;
  description: string;
  icon: string;
}

const travelerSteps: Step[] = [
  {
    stepNum: 1,
    title: "Browse Celebrations",
    description: "Explore verified, handpicked listings of weddings across India. Filter by date, style, budget, and location to find your match.",
    icon: "Search"
  },
  {
    stepNum: 2,
    title: "Apply to Join",
    description: "Submit a request indicating why you wish to join the family. This helps host families ensure mutual respect and alignment.",
    icon: "ClipboardList"
  },
  {
    stepNum: 3,
    title: "Confirm Booking",
    description: "Once approved, secure your spot. Booking fees are held in a secure trust account until you arrive, ensuring 100% safety.",
    icon: "CreditCard"
  },
  {
    stepNum: 4,
    title: "Pre-Travel Guidance",
    description: "Receive your customized cultural guide, dress code instructions, and contact details for your dedicated guest liaison.",
    icon: "Compass"
  },
  {
    stepNum: 5,
    title: "Attend & Celebrate",
    description: "Step inside the palace or temple. Dance, feast, and form life-long bonds with the couple and their extended family.",
    icon: "Sparkles"
  },
  {
    stepNum: 6,
    title: "Review & Reflect",
    description: "Share your experience with our global community to help other travelers discover authentic cultural immersion.",
    icon: "Star"
  }
];

const coupleSteps: Step[] = [
  {
    stepNum: 1,
    title: "Register Your Wedding",
    description: "List your wedding date, venue, style, pricing, and the number of guest slots you wish to share with global travelers.",
    icon: "FileEdit"
  },
  {
    stepNum: 2,
    title: "Host Verification",
    description: "Our local compliance manager meets your family, verifies the venue, and confirms safety and hospitality standards.",
    icon: "ShieldCheck"
  },
  {
    stepNum: 3,
    title: "Publish Listing",
    description: "Your wedding page goes live on our premium global marketplace, formatted beautifully by our listing designers.",
    icon: "Sparkles"
  },
  {
    stepNum: 4,
    title: "Review Applications",
    description: "You have full control. Review guest applications, profiles, and reasons for joining. Accept only those who align with your family.",
    icon: "Users"
  },
  {
    stepNum: 5,
    title: "Host & Share Heritage",
    description: "Welcome guests to your ceremonies as honored friends. Share your culinary traditions, folk dances, and sacred vows.",
    icon: "Home"
  },
  {
    stepNum: 6,
    title: "Receive Earnings",
    description: "After the wedding, funds are transferred directly to your bank account. Use it to support your honeymoon or wedding expenses.",
    icon: "DollarSign"
  }
];

const agentSteps: Step[] = [
  {
    stepNum: 1,
    title: "Apply as Partner",
    description: "Sign up for the Student Ambassador, Travel Agency, or Influencer partner programs. Vetting takes 2-3 business days.",
    icon: "Handshake"
  },
  {
    stepNum: 2,
    title: "Verification Approval",
    description: "Receive approval, sign the commission guidelines, and get onboarded onto the partner portal.",
    icon: "CheckCircle2"
  },
  {
    stepNum: 3,
    title: "Generate Referral Link",
    description: "Access your customizable links and dashboard tracker tools to monitor visitors, leads, and conversions.",
    icon: "Link"
  },
  {
    stepNum: 4,
    title: "Invite Global Travelers",
    description: "Share your unique links on social media, blogs, travel agencies, or campus boards to invite travelers to join Indian weddings.",
    icon: "Globe"
  },
  {
    stepNum: 5,
    title: "Earn High Commissions",
    description: "Earn a dedicated percentage commission for every verified traveler booking. Payouts are made monthly directly to your wallet.",
    icon: "Coins"
  }
];

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("travelers");

  const getSteps = (): Step[] => {
    if (activeTab === "travelers") return travelerSteps;
    if (activeTab === "couples") return coupleSteps;
    return agentSteps;
  };

  const getCTA = () => {
    if (activeTab === "travelers") {
      return (
        <Link href="/weddings" className="btn btn-primary btn-lg shadow-lg">
          Browse Weddings <ArrowRight size={16} />
        </Link>
      );
    }
    if (activeTab === "couples") {
      return (
        <Link href="/for-couples" className="btn btn-primary btn-lg shadow-lg">
          Become a Host Couple <ArrowRight size={16} />
        </Link>
      );
    }
    return (
      <Link href="/for-agents" className="btn btn-primary btn-lg shadow-lg">
        Join Partner Program <ArrowRight size={16} />
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      
      {/* Intro Header */}
      <section className="container-luxury text-center max-w-3xl mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
          <Milestone size={12} />
          Your Guide
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-charcoal-900 leading-tight">
          How It <span className="text-gradient-brand">Works</span>
        </h1>
        <p className="text-charcoal-500 text-sm sm:text-base leading-relaxed">
          Select your journey below to see a step-by-step roadmap of how we bring global travelers, host families, and partners together.
        </p>
      </section>

      {/* Tabs Selector Bar */}
      <section className="container-luxury max-w-xl mb-16">
        <div className="flex bg-warm-100 p-1.5 rounded-2xl border border-warm-200/60 shadow-sm relative overflow-hidden">
          {(["travelers", "couples", "agents"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 text-center py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 relative z-10"
              style={{
                color: activeTab === tab ? "#ffffff" : "#454545"
              }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="active-journey-tab"
                  className="absolute inset-0 bg-[var(--color-brand-primary)] rounded-xl -z-10 shadow-md"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              {tab === "travelers" ? "Travelers" : tab === "couples" ? "Hosts" : "Agents"}
            </button>
          ))}
        </div>
      </section>

      {/* Steps Timeline Grid */}
      <section className="container-luxury max-w-3xl relative pl-8 border-l border-warm-300 mx-auto space-y-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            {getSteps().map((step, idx) => (
              <div key={step.stepNum} className="relative group">
                
                {/* Step circle indicator */}
                <span className="absolute -left-[53px] top-0.5 w-10 h-10 rounded-full border border-warm-200 bg-white font-display font-bold text-sm text-[var(--color-brand-primary)] flex items-center justify-center shadow-md group-hover:border-[var(--color-brand-primary)] group-hover:scale-105 transition-all duration-300">
                  {step.stepNum}
                </span>

                {/* Content Box */}
                <div className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 space-y-2">
                  <div className="text-[0.625rem] font-bold text-[var(--color-brand-secondary)] uppercase tracking-widest">
                    Step 0{step.stepNum}
                  </div>
                  <h3 className="font-display font-bold text-lg text-charcoal-900">
                    {step.title}
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Call to action at bottom */}
      <section className="container-luxury text-center mt-16">
        {getCTA()}
      </section>

    </div>
  );
}
