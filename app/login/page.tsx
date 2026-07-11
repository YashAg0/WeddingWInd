"use client";

import React from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Compass } from "lucide-react";

export default function LoginPage() {
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
            Welcome back
          </h1>
          <p className="text-charcoal-400 text-xs sm:text-sm">
            Sign in to access your wedding discovery dashboard
          </p>
        </div>

        {/* Clerk Sign In component */}
        <div className="w-full flex justify-center">
          <SignIn 
            signUpUrl="/signup"
            fallbackRedirectUrl="/dashboard"
          />
        </div>

      </div>
    </div>
  );
}
