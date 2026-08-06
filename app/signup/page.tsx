"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { Compass } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const redirectUrl = searchParams.get("redirect_url") || searchParams.get("returnTo") || null;

  React.useEffect(() => {
    if (!loading && user) {
      if (!user.onboarded) {
        const onboardingTarget = redirectUrl
          ? `/onboarding?redirect_url=${encodeURIComponent(redirectUrl)}`
          : "/onboarding";
        router.replace(onboardingTarget);
      } else {
        router.replace(redirectUrl || "/dashboard");
      }
    }
  }, [user, loading, router, redirectUrl]);

  if (loading && user) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-800 animate-spin" />
        <span className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">Restoring session...</span>
      </div>
    );
  }

  const clerkSignInUrl = redirectUrl
    ? `/login?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/login";

  const fallbackOnboardingUrl = redirectUrl
    ? `/onboarding?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/onboarding";

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-warm-200/50 rounded-[2.5rem] p-6 sm:p-8 shadow-luxury space-y-6 flex flex-col items-center">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 w-full">
          <Link href="/" className="inline-flex items-center gap-2 bg-maroon-50 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-maroon-100/50">
            <Compass size={12} />
            Wedding With India
          </Link>
          <h1 className="font-display font-bold text-2xl text-charcoal-900 leading-tight">
            Create account
          </h1>
          <p className="text-charcoal-400 text-xs sm:text-sm">
            Join the world&apos;s leading wedding discovery experience
          </p>
        </div>

        {/* Clerk Sign Up component */}
        <div className="w-full flex justify-center">
          <SignUp 
            signInUrl={clerkSignInUrl}
            fallbackRedirectUrl={fallbackOnboardingUrl}
          />
        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="px-5 sm:px-8 lg:px-12 xl:px-16">
    <Suspense fallback={
      <div className="min-h-screen bg-warm-50 flex items-center justify-center flex-col gap-3 rounded-[2.5rem]">
        <div className="w-8 h-8 rounded-full border-4 border-maroon-100 border-t-maroon-800 animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  
    </div>);
}
