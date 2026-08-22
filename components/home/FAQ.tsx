import { MessageCircle, Phone, Mail, HelpCircle } from "lucide-react";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import type { FAQItem } from "@/types";
import { CONTACT_EMAILS } from "@/lib/constants";

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  return (
    <section
      id="faq"
      className="section-padding relative overflow-hidden bg-white border-t border-warm-200/50"
      aria-labelledby="faq-heading"
    >
      <div className="container-luxury relative z-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-10 items-start">
          {/* FAQ Introduction */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="section-label mb-1" aria-hidden="true">
                BEFORE YOU BOOK
              </div>

              <h2
                id="faq-heading"
                className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900 tracking-tight leading-tight"
              >
                Have Questions?
                <span className="text-gradient-brand">
                  {" "}
                  You&apos;re Not Alone.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-charcoal-600 mt-1 leading-relaxed">
                Find quick answers about invitations, bookings, safety,
                etiquette, what to expect, and your time with the host family.
              </p>
            </div>

            {/* Contact Options */}
            <div className="flex flex-col gap-2.5 pt-2">
              {/* Email */}
              <a
                href={`mailto:${CONTACT_EMAILS.CONTACT}`}
                className="flex items-center justify-between p-3 rounded-xl border border-warm-200/80 bg-warm-50/50 hover:bg-warm-100/60 hover:border-warm-300 transition-all group"
                aria-label="Email the WeddingWithIndia guest experience team"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] group-hover:scale-105 transition-transform">
                    <Mail size={15} aria-hidden="true" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-charcoal-800">
                      Guest Experience Team
                    </div>

                    <div className="text-[0.6875rem] text-charcoal-500">
                      Typically replies within 4 hours
                    </div>
                  </div>
                </div>

                <span className="text-xs font-medium text-[var(--color-brand-primary)]">
                  {CONTACT_EMAILS.CONTACT}
                </span>
              </a>

              {/* WhatsApp / Phone */}
              <a
                href="https://wa.me/919116734675"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-warm-200/80 bg-warm-50/50 hover:bg-warm-100/60 hover:border-warm-300 transition-all group"
                aria-label="WhatsApp with WeddingWithIndia concierge"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-105 transition-transform">
                    <Phone size={15} aria-hidden="true" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-charcoal-800">
                      WhatsApp Concierge
                    </div>

                    <div className="text-[0.6875rem] text-charcoal-500">
                      Available daily · 9 AM - 9 PM IST
                    </div>
                  </div>
                </div>

                <span className="text-xs font-medium text-[var(--color-brand-primary)]">
                  +91 91 1673 4675
                </span>
              </a>

              <div className="mt-4 pt-4 border-t border-warm-200/80">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--color-brand-primary)]/10 flex-shrink-0">
                    <HelpCircle
                      size={15}
                      className="text-[var(--color-brand-primary)]"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-charcoal-800">
                      Can&apos;t find your question?
                    </p>

                    <p className="text-[0.6875rem] text-charcoal-500 mt-0.5">
                      Reach out anytime.
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 bg-warm-100/70 p-2.5 rounded-lg border border-warm-200/60">
                  <MessageCircle
                    size={15}
                    className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />

                  <p className="text-[0.6875rem] text-charcoal-500 leading-relaxed">
                    If you&apos;re unsure about anything, ask before booking. We&apos;d
                    rather you feel comfortable with your decision.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-3">
            {items.length > 0 ? (
              <FAQAccordion items={items} />
            ) : (
              <div
                className="rounded-xl border border-warm-200 bg-white p-6 text-center"
                role="status"
              >
                <h3 className="mb-1 text-sm font-bold text-charcoal-900">
                  We&apos;re updating the guest guide
                </h3>

                <p className="text-xs text-charcoal-500">
                  Have a question? Contact us and we&apos;ll be happy to help.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}