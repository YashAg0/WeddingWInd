"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to subscribe. Please try again.");
      }

      setStatus("success");
      setEmail("");
    } catch (err: any) {
      console.error("[NewsletterForm] Error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to subscribe. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <p className="text-sm text-[var(--color-brand-secondary)] font-medium py-3" role="status">
        ✓ You&apos;re on the list — we&apos;ll be in touch soon!
      </p>
    );
  }

  return (
    <div className="w-full max-w-md space-y-2">
      <form
        className="flex flex-col sm:flex-row w-full gap-3"
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
          disabled={status === "loading"}
          className="flex-1 w-full bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/70 focus:outline-none focus:border-[var(--color-brand-secondary)] focus:bg-white/15 transition-all duration-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn btn-secondary btn-sm w-full sm:w-auto flex-shrink-0 group justify-center disabled:opacity-50"
          aria-label="Subscribe to newsletter"
        >
          {status === "loading" ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin" />
              Subscribing...
            </span>
          ) : (
            <>
              Subscribe
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-rose-300 font-medium px-2" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
