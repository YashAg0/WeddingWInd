import { Metadata } from "next";
import Link from "next/link";
import { CreditCard, DollarSign, ShieldCheck, RefreshCw, FileText, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Terms & Financial Policies",
  description:
    "Pricing transparency, payment processing methods, currency handling, tax disclosures, and refund rules on WeddingWithIndia.",
  alternates: {
    canonical: "https://weddingwithindia.com/payment-terms",
  },
};

export default function PaymentTermsPage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <CreditCard size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Payment Terms & Policies
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            Transparent pricing, supported payment gateways, tax compliance, and automated financial safeguards across WeddingWithIndia.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Updated: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Transparent Pricing */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <DollarSign className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Upfront Pricing with Zero Hidden Fees
            </h2>
            <p>
              In full compliance with the Consumer Protection (E-Commerce) Rules, 2020 and Guidelines for Prevention of Dark Patterns, 2023, WeddingWithIndia guarantees 100% pricing transparency:
            </p>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li><strong>Clean USD Base Rates:</strong> International travelers are charged in US Dollars (USD) as displayed on the wedding package tiers. No surprise drip pricing or forced add-on fees at checkout.</li>
              <li><strong>Inclusive Experience:</strong> The booking price covers all ceremonies, curated cultural events, feasts, and on-site coordinator liaison included in the selected package tier.</li>
              <li><strong>What is Excluded:</strong> Flights to/from India, hotel accommodation, personal ground transit, travel insurance, personal shopping, and visa fees are separate and the responsibility of the traveler.</li>
            </ul>
          </section>

          {/* Section 2: Payment Gateways & Security */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Secure Payment Processing & PCI DSS Compliance
            </h2>
            <p>
              Payments on WeddingWithIndia are processed through authorized payment aggregators and gateways (such as PayPal and Stripe).
            </p>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li><strong>Zero Card Data Storage:</strong> WeddingWithIndia never collects, views, or stores your raw credit/debit card numbers or CVV on our servers. All sensitive financial transactions occur through PCI DSS Level 1 certified gateways.</li>
              <li><strong>Server-Authoritative Calculation:</strong> All pricing, taxes, and payout ledger allocations are verified server-side inside atomic database transactions to prevent tampering.</li>
            </ul>
          </section>

          {/* Section 3: Invoicing & Taxes (GST) */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <FileText className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Invoicing, Currency & Applicable Taxes
            </h2>
            <p>
              Upon successful payment confirmation, an automated electronic tax invoice is generated and accessible in your traveler dashboard. Depending on applicable Indian GST regulations and export-of-service rules, taxes are itemized clearly on your invoice.
            </p>
          </section>

          {/* Section 4: Refund Processing */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <RefreshCw className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Refunds & Reversals
            </h2>
            <p>
              Approved refunds are credited back to the original payment method used during checkout. Refund timelines typically range between 5 and 10 business days depending on your issuing bank&apos;s international processing rules. For complete details, see our <Link href="/refund-policy" className="text-[var(--color-brand-primary)] underline font-semibold">Refund Policy</Link> and <Link href="/cancellation-policy" className="text-[var(--color-brand-primary)] underline font-semibold">Cancellation Policy</Link>.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Financial Policies</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/refund-policy" className="hover:text-[var(--color-brand-primary)] underline">Refund Policy</Link>
              <Link href="/cancellation-policy" className="hover:text-[var(--color-brand-primary)] underline">Cancellation Policy</Link>
              <Link href="/booking-terms" className="hover:text-[var(--color-brand-primary)] underline">Booking Terms</Link>
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
