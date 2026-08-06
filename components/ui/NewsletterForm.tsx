"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    // Phase 2: wire up real newsletter API here
    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <p className="text-sm text-[var(--color-brand-secondary)] font-medium py-3" role="status">
        ✓ You&apos;re on the list — we&apos;ll be in touch soon!
      </p>
    );
  }

  return (
    <form
      className="flex w-full max-w-md gap-3"
      onSubmit={handleSubmit}
      aria-label="Newsletter signup"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        autoComplete="email"
        required
        className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/70 focus:outline-none focus:border-[var(--color-brand-secondary)] focus:bg-white/15 transition-all duration-200"
      />
      <button
        type="submit"
        className="btn btn-secondary btn-sm flex-shrink-0 group"
        aria-label="Subscribe to newsletter"
      >
        Subscribe
        <ArrowRight
          size={15}
          className="group-hover:translate-x-0.5 transition-transform"
          aria-hidden="true"
        />
      </button>
    </form>
  );
}
