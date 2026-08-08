import { MessageCircle, Phone, Mail } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import type { FAQItem } from "@/types";

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  return (
    <>
      <section
        id="faq"
        className="section-padding relative overflow-hidden"
        aria-labelledby="faq-heading"
        style={{
          background: "linear-gradient(180deg, #fff 0%, var(--color-warm-50) 100%)",
        }}
      >
        {/* Subtle gold accent */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-gold-200), transparent)",
          }}
          aria-hidden="true"
        />

        <div className="container-luxury relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left — header + contact */}
            <div className="lg:col-span-2">
              <SectionHeader
                id="faq-heading"
                label="FAQ"
                title="Everything You Need To Know"
                highlightedWord="Need To Know"
                description="Have more questions? Our team is ready to help you plan your perfect wedding experience."
                align="left"
                theme="light"
              />

              <div className="mt-10 flex flex-col gap-4">
                {/* Contact cards with gold accent border */}
                <a
                  href="mailto:contact@weddingwithindia.com"
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-warm-200 hover:border-[var(--color-brand-primary)]/30 hover:shadow-[0_4px_24px_0_rgba(107,16,38,0.08)] transition-all duration-200 group"
                  aria-label="Email contact@weddingwithindia.com"
                >
                  <span
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-200 group-hover:bg-maroon-100"
                    style={{ background: "var(--color-warm-100)" }}
                    aria-hidden="true"
                  >
                    <Mail size={20} className="text-[var(--color-brand-primary)]" />
                  </span>
                  <div>
                    <div className="font-semibold text-charcoal-800 text-sm mb-0.5">
                      Email us
                    </div>
                    <span className="text-[var(--color-brand-primary)] text-sm font-medium">
                      contact@weddingwithindia.com
                    </span>
                  </div>
                </a>

                <a
                  href="tel:+919116734675"
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-warm-200 hover:border-[var(--color-brand-primary)]/30 hover:shadow-[0_4px_24px_0_rgba(107,16,38,0.08)] transition-all duration-200 group"
                  aria-label="Call +91 91 1673 4675"
                >
                  <span
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-200 group-hover:bg-maroon-100"
                    style={{ background: "var(--color-warm-100)" }}
                    aria-hidden="true"
                  >
                    <Phone size={20} className="text-[var(--color-brand-primary)]" />
                  </span>
                  <div>
                    <div className="font-semibold text-charcoal-800 text-sm mb-0.5">
                      Call us
                    </div>
                    <span className="text-[var(--color-brand-primary)] text-sm font-medium">
                      +91 91 1673 4675
                    </span>
                  </div>
                </a>

                <div
                  className="flex items-center gap-4 p-5 rounded-2xl border"
                  style={{
                    background: "linear-gradient(135deg, var(--color-warm-50) 0%, var(--color-warm-100) 100%)",
                    borderColor: "rgba(201,151,42,0.2)",
                  }}
                >
                  <span
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(201,151,42,0.12)" }}
                    aria-hidden="true"
                  >
                    <MessageCircle size={20} className="text-[var(--color-brand-secondary)]" />
                  </span>
                  <div>
                    <div className="font-semibold text-charcoal-800 text-sm mb-0.5">
                      Response time
                    </div>
                    <span className="text-charcoal-500 text-sm">
                      We reply within 24 hours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — accordion */}
            <div className="lg:col-span-3">
              <FAQAccordion items={items} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
