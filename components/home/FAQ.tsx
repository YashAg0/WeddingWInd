import { MessageCircle, Phone, Mail } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import type { FAQItem } from "@/types";

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  return (
    <section
      id="faq"
      className="section-padding relative overflow-hidden"
      aria-labelledby="faq-heading"
      style={{
        background:
          "linear-gradient(180deg, #fff 0%, var(--color-warm-50) 100%)",
      }}
    >
      {/* Subtle gold accent */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-gold-200), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="container-luxury relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Left — FAQ introduction + contact */}
          <div className="lg:col-span-2">
            <SectionHeader
              id="faq-heading"
              label="FAQ"
              title="Questions About Experiencing an Indian Wedding?"
              highlightedWord="Indian Wedding?"
              description="Find answers about discovering weddings, booking an experience, preparing for your visit and taking part in an Indian celebration."
              align="left"
              theme="light"
            />

            <div className="mt-10 flex flex-col gap-4">
              {/* Email */}
              <a
                href="mailto:contact@weddingwithindia.com"
                className="group flex items-center gap-4 rounded-2xl border border-warm-200 bg-white p-5 transition-all duration-200 hover:border-[var(--color-brand-primary)]/30 hover:shadow-[0_4px_24px_0_rgba(107,16,38,0.08)]"
                aria-label="Email WeddingWithIndia at contact@weddingwithindia.com"
              >
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-200 group-hover:bg-maroon-100"
                  style={{
                    background: "var(--color-warm-100)",
                  }}
                  aria-hidden="true"
                >
                  <Mail
                    size={20}
                    className="text-[var(--color-brand-primary)]"
                  />
                </span>

                <div className="min-w-0">
                  <div className="mb-0.5 text-sm font-semibold text-charcoal-800">
                    Email us
                  </div>

                  <span className="break-all text-sm font-medium text-[var(--color-brand-primary)]">
                    contact@weddingwithindia.com
                  </span>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+919116734675"
                className="group flex items-center gap-4 rounded-2xl border border-warm-200 bg-white p-5 transition-all duration-200 hover:border-[var(--color-brand-primary)]/30 hover:shadow-[0_4px_24px_0_rgba(107,16,38,0.08)]"
                aria-label="Call WeddingWithIndia at +91 91 1673 4675"
              >
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-200 group-hover:bg-maroon-100"
                  style={{
                    background: "var(--color-warm-100)",
                  }}
                  aria-hidden="true"
                >
                  <Phone
                    size={20}
                    className="text-[var(--color-brand-primary)]"
                  />
                </span>

                <div>
                  <div className="mb-0.5 text-sm font-semibold text-charcoal-800">
                    Call us
                  </div>

                  <span className="text-sm font-medium text-[var(--color-brand-primary)]">
                    +91 91 1673 4675
                  </span>
                </div>
              </a>

              {/* Support message */}
              <div
                className="flex items-center gap-4 rounded-2xl border p-5"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-warm-50) 0%, var(--color-warm-100) 100%)",
                  borderColor: "rgba(201,151,42,0.2)",
                }}
              >
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(201,151,42,0.12)",
                  }}
                  aria-hidden="true"
                >
                  <MessageCircle
                    size={20}
                    className="text-[var(--color-brand-secondary)]"
                  />
                </span>

                <div>
                  <div className="mb-0.5 text-sm font-semibold text-charcoal-800">
                    Need help?
                  </div>

                  <span className="text-sm leading-relaxed text-charcoal-500">
                    Our team is available to help with questions about
                    weddings, bookings and your experience.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — FAQ accordion */}
          <div className="lg:col-span-3">
            {items.length > 0 ? (
              <FAQAccordion items={items} />
            ) : (
              <div
                className="rounded-2xl border border-warm-200 bg-white p-8 text-center"
                role="status"
              >
                <h3 className="mb-2 text-lg font-bold text-charcoal-900">
                  Questions coming soon
                </h3>

                <p className="text-sm leading-relaxed text-charcoal-500">
                  We are preparing answers to the most common questions about
                  experiencing Indian weddings through WeddingWithIndia.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}