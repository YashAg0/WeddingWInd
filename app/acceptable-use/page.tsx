import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, FileCode, Ban, AlertTriangle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description:
    "Rules, technical limitations, and security policies governing use of the WeddingWithIndia website, APIs, and member dashboards.",
  alternates: {
    canonical: "https://weddingwithindia.com/acceptable-use",
  },
};

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-warm-50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Shield size={22} aria-hidden="true" />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Acceptable Use Policy
          </h1>

          <p className="max-w-2xl text-charcoal-600 text-sm sm:text-base leading-relaxed">
            This policy outlines permissible and prohibited uses of the WeddingWithIndia platform, applications, and digital services.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} aria-hidden="true" />
            <span>Effective Date: 2026 Edition</span>
          </div>
        </div>

        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Scope */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Lock className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              1. Scope & Application
            </h2>
            <p>
              This Acceptable Use Policy applies to all visitors, registered travelers, host couples, partners, coordinators, and administrators accessing any service provided by WeddingWithIndia. By accessing our platform, you agree to comply strictly with these terms and applicable Indian and international cyber laws.
            </p>
          </section>

          {/* Section 2: Prohibited Technical Activities */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <FileCode className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              2. Technical & Security Prohibitions
            </h2>
            <p>You may not engage in or facilitate any of the following activities:</p>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li><strong>Automated Scraping & Crawling:</strong> Extracting wedding listings, host profiles, pricing tables, or media using bots, scrapers, or unauthorized automated tools.</li>
              <li><strong>Vulnerability Probing & Exploits:</strong> Testing or bypassing security controls, rate limiters, authentication tokens, or QR ticket validation systems without authorized disclosure.</li>
              <li><strong>Denial of Service & Abuse:</strong> Transmitting viruses, corrupted files, spam requests, or conducting high-frequency automated calls against our APIs.</li>
              <li><strong>Unauthorized Access (IDOR):</strong> Attempting to access accounts, invoices, private tickets, or safety case records belonging to other users.</li>
            </ul>
          </section>

          {/* Section 3: Commercial & Identity Abuses */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <Ban className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              3. Commercial & Identity Restrictions
            </h2>
            <ul className="space-y-2 list-disc list-inside text-charcoal-600">
              <li><strong>False Identity & Impersonation:</strong> Registering fake accounts, submitting fraudulent KYC documents, or impersonating other individuals or entities.</li>
              <li><strong>Self-Referral & Commission Fraud:</strong> Agents referring their own personal accounts or engaging in multi-account referral manipulation.</li>
              <li><strong>Off-Platform Circumvention:</strong> Soliciting direct payments outside platform-approved channels to bypass safety records and verified reservations.</li>
              <li><strong>Fake Reviews & Reputation Manipulation:</strong> Submitting incentivized, fabricated, or malicious reviews.</li>
            </ul>
          </section>

          {/* Section 4: Enforcement & Account Action */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
              <AlertTriangle className="text-[var(--color-brand-primary)] shrink-0" size={20} />
              4. Investigation, Suspension & Legal Action
            </h2>
            <p>
              WeddingWithIndia reserves the right to investigate suspected violations, suspend or terminate accounts, revoke active guest passes without refund, and pursue civil or criminal remedies under the Information Technology Act, 2000 and applicable penal codes.
            </p>
          </section>

          {/* Related Links */}
          <section className="pt-6 border-t border-warm-200/80 text-xs text-charcoal-500 space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-charcoal-700">Related Legal Documents</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="/terms" className="hover:text-[var(--color-brand-primary)] underline">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-[var(--color-brand-primary)] underline">Privacy Policy</Link>
              <Link href="/content-policy" className="hover:text-[var(--color-brand-primary)] underline">Content Policy</Link>
              <Link href="/community-guidelines" className="hover:text-[var(--color-brand-primary)] underline">Community Guidelines</Link>
              <Link href="/grievance" className="hover:text-[var(--color-brand-primary)] underline">Grievance Redressal</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
