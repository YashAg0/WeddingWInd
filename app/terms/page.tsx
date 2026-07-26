import { FileText, Clock } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Wedding With India. General rules and guidelines.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <FileText size={22} />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Terms of Service
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} />
            <span>Last Updated: July 10, 2026</span>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using the <strong>Wedding With India</strong> platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms apply to all visitors, users, guest travelers, host families, and partner agents.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Description of Service
            </h2>
            <p>
              Wedding With India provides an online marketplace platform connecting international travelers wishing to experience authentic Indian culture with genuine Indian families hosting weddings. We act solely as a matching and facilitation platform and do not operate, organize, or own any specific wedding events.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. Vetting & Verification
            </h2>
            <p>
              To maintain the security, safety, and exclusivity of our experiences, both travelers and host families agree to go through our identity verification processes. You agree to provide true, accurate, and complete documentation (including identification details and social profiles) upon request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Booking, Refunds & Cancellations
            </h2>
            <p>
              Bookings represent a reservation of a designated guest slot at a host family&apos;s wedding. 
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Cancellations &gt; 30 Days:</strong> Full refund of booking fees.</li>
              <li><strong>Cancellations 15-30 Days:</strong> 50% refund.</li>
              <li><strong>Cancellations &lt; 14 Days:</strong> Non-refundable, as hosts commit resources and make catering arrangements.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. User Code of Conduct
            </h2>
            <p>
              Travelers agree to act respectfully, dress in accordance with local cultural guidelines, and obey reasonable rules set by host families. Violation of local customs or disrespectful behavior may result in immediate eviction from the event and platform ban without refunds.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Limitation of Liability
            </h2>
            <p>
              Wedding With India is not liable for any personal injury, property damage, event cancellation, travel disruption, or cultural misunderstandings that occur during the wedding event. You participate in the wedding celebrations entirely at your own risk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Governing Law
            </h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
