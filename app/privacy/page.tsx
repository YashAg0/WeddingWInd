import { Metadata } from "next";
import { Shield, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "WeddingWithIndia's privacy policy. How we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-warm-50/50 pt-28 pb-20">
      <div className="container-luxury max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-[var(--color-brand-primary)] border border-maroon-100/50 flex items-center justify-center shadow-sm">
            <Shield size={22} />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal-900">
            Privacy Policy
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
            <Clock size={12} />
            <span>Last Updated: July 10, 2026</span>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white border border-warm-200/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8 text-charcoal-700 text-sm sm:text-base leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              1. Introduction
            </h2>
            <p>
              Welcome to <strong>Wedding With India</strong>. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, store, and share your personal information when you use our website, marketplace, or services.
            </p>
            <p>
              By accessing or using our platform, you agree to the collection and use of information in accordance with this policy. If you do not agree with any terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              2. Information We Collect
            </h2>
            <p>
              We collect several types of information to provide and improve our services to you:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Personal Identifiers:</strong> Name, email address, phone number, nationality, and billing address.</li>
              <li><strong>Verification Details:</strong> Passport photos, national IDs, or social profiles (collected securely solely for vetting and security verification of hosts and guests).</li>
              <li><strong>Transaction Records:</strong> Booking requests, guest slot reservations, payment history, and saved preferences.</li>
              <li><strong>Technical Data:</strong> IP addresses, browser types, cookie identifiers, and platform usage analytics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              3. How We Use Your Information
            </h2>
            <p>
              We process your data for the following essential purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To match guests with host families and coordinate wedding invitations.</li>
              <li>To verify the identity of both guests and hosts, ensuring safety and authenticity.</li>
              <li>To facilitate communication, share cultural dress guides, and schedule liaison support.</li>
              <li>To monitor and analyze platform performance, ensuring optimization and responsiveness.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              4. Data Protection & Safety
            </h2>
            <p>
              We implement industry-standard administrative, technical, and physical security measures to safeguard your personal data from unauthorized access, alteration, disclosure, or destruction. Passport copies and verification documents are encrypted in transit and at rest, and are strictly restricted to authorized compliance personnel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              5. Your Privacy Rights
            </h2>
            <p>
              Depending on your location (such as the EU under GDPR), you have specific data rights, including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The right to access, update, or delete the personal information we hold about you.</li>
              <li>The right to restrict or object to our processing of your data.</li>
              <li>The right to withdraw your consent at any time where we rely on consent to process your data.</li>
            </ul>
            <p>
              To exercise these rights, please contact our support team at <a href="mailto:privacy@weddingwithindia.com" className="text-[var(--color-brand-primary)] hover:underline font-semibold">privacy@weddingwithindia.com</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              6. Cookies Policy
            </h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and hold certain local information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent, though some parts of the service may become inaccessible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-2">
              7. Changes to This Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last Updated&rdquo; date at the top.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
