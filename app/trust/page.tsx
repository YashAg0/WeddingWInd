import { Metadata } from "next";
import { Suspense } from "react";
import { TrustPortalClient } from "@/components/trust/TrustPortalClient";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Trust, Legal & Safety Portal | WeddingWithIndia",
  description:
    "Comprehensive trust guarantees, terms of service, privacy compliance, DPDP & GDPR rights, guest safety protocols, and statutory grievance redressal.",
  alternates: {
    canonical: "https://weddingwithindia.com/trust",
  },
  openGraph: {
    title: "Trust, Legal & Safety Portal | WeddingWithIndia",
    description:
      "All-in-one trust portal: Terms of Service, Privacy & Data Protection, and Safety & Incident Resolution.",
    url: "https://weddingwithindia.com/trust",
    siteName: "WeddingWithIndia",
    type: "website",
  },
};

function TrustPortalSkeleton() {
  return (
    <div className="container-luxury max-w-5xl py-12 animate-pulse space-y-6">
      <div className="h-10 bg-warm-200 rounded-xl w-1/3 mx-auto" />
      <div className="h-6 bg-warm-100 rounded-lg w-2/3 mx-auto" />
      <div className="h-12 bg-warm-200 rounded-2xl w-full" />
      <div className="h-96 bg-white rounded-3xl border border-warm-200 p-8" />
    </div>
  );
}

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-5xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/60 flex items-center justify-center shadow-sm">
            <ShieldCheck size={26} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal-900 tracking-tight">
            Trust, Legal & Safety Portal
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Transparent policies, verified host standards, data protection compliance, and statutory protections designed for international wedding guests and host families.
          </p>
        </div>

        {/* Client Interactive Portal wrapped in Suspense */}
        <Suspense fallback={<TrustPortalSkeleton />}>
          <TrustPortalClient />
        </Suspense>
      </div>
    </main>
  );
}
