import { MessageCircle, Phone } from "lucide-react";
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
        className="section-padding"
        aria-labelledby="faq-heading"
      >
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left — header */}
          <div className="lg:col-span-2">
            <SectionHeader
              id="faq-heading"
              label="FAQ"
              title="Everything You Need To Know"
              highlightedWord="Need To Know"
              description="Have more questions? Our team is happy to help you plan your perfect wedding experience."
              align="left"
              theme="dark"
            />

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-warm-200">
                <span className="text-[var(--color-brand-primary)] flex-shrink-0" aria-hidden="true"><MessageCircle size={22} /></span>
                <div>
                  <div className="font-semibold text-charcoal-800 text-sm mb-0.5">
                    Still have questions?
                  </div>
                  <a
                    href="mailto:contact@weddingwithindia.com"
                    className="text-[var(--color-brand-primary)] text-sm font-medium hover:underline"
                  >
                    contact@weddingwithindia.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-warm-200">
                <span className="text-[var(--color-brand-primary)] flex-shrink-0" aria-hidden="true"><Phone size={22} /></span>
                <div>
                  <div className="font-semibold text-charcoal-800 text-sm mb-0.5">
                    Talk to our team
                  </div>
                  <a
                    href="tel:+919116734675"
                    className="text-[var(--color-brand-primary)] text-sm font-medium hover:underline"
                  >
                    +91 91 1673 4675
                  </a>
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
