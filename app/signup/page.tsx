"use client";

import React from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Compass } from "lucide-react";

export default function SignupPage() {
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
            signInUrl="/login"
            fallbackRedirectUrl="/onboarding"
          />
        </div>

      </div>
    </div>
  );
}
