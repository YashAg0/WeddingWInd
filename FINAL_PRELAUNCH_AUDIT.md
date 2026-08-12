# FINAL PRE-LAUNCH AUDIT — WEDDING WITH INDIA

**Date of Audit:** August 13, 2026  
**Target Platform:** Wedding With India (Production Codebase)  
**Scope:** Factual Accuracy, Legal Risk Wording, Public Claims, SEO Entity Consistency & Production Readiness  

---

## Executive Audit Principle

Automated tests and static analysis prove software correctness and execution integrity. They **cannot** and **do not** prove legal compliance, regulatory registration, or business tax status. 

Accordingly, this audit strictly categorizes every aspect of the Wedding With India platform into four distinct verification classes. **No component of the platform is labeled as "100% legally compliant."**

---

## Category Breakdown

### A. VERIFIED TECHNICALLY

The following technical components have been empirically executed, tested, and verified using automated test suites, type checking, and static analysis:

1. **TypeScript Type System**: `npm run type-check` (`tsc --noEmit`) passes with **0 errors**.
2. **Linting & Code Style**: `npm run lint` (`eslint`) passes with **0 errors and 0 warnings**.
3. **Automated Test Suite**: `npm test -- --no-coverage` passes **39 of 39 test suites (274 of 274 unit/integration tests)**.
4. **Payment API Integration**: Stripe Checkout (`stripe.checkout.sessions.create`) integration in [`lib/actions/stripe.ts`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/actions/stripe.ts) verified for card payments, platform service fees, and HMAC-SHA256 webhook signatures.
5. **Authentication & Authorization**: Clerk auth integration (`@clerk/nextjs`), Prisma user sync, role-based access control (TRAVELER, HOST, AGENT, COORDINATOR, ADMIN), and session state management in [`lib/auth.ts`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/auth.ts) verified.
6. **SEO & Structured Data**:
   - Canonical Founder Page at [`/founder/tanishq-gupta`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/founder/tanishq-gupta/page.tsx) with Person JSON-LD schema, Organization relationship, and BreadcrumbList.
   - Real founder photo asset at `/images/founder/founder.png` (`public/images/founder/founder.png`) integrated via Next.js `<Image>` component with responsive fill and priority loading.
   - Dynamic Sitemap generator at [`app/sitemap.ts`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/sitemap.ts) containing all public experiences, founder profile, and legal policies.
   - Robots file at [`app/robots.ts`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/robots.ts) explicitly blocking private dashboard, admin, onboarding, and API routes while allowing public crawling.

---

### B. VERIFIED FROM APPLICATION DATA

The following operational metrics and application behaviors are verified directly against local database state:

1. **Marketplace Inventory Audit**: `node scripts/verify-db.js` executed with **23/23 quality checks passed**:
   - Total marketplace weddings: 24 (23 curated active experiences + 1 host draft).
   - Unique host couples: 23 (0 duplicate host couples).
   - Unique image URLs: 23 (0 duplicate image URLs, 0 missing images).
   - Date distribution: Earliest date Nov 18, 2026; latest date May 18, 2028 (0 past-date entries).
   - Total DB users: 34 accounts across host, traveler, agent, coordinator, and admin roles.
2. **Dynamic Business Metrics**: Business stats calculated dynamically in [`lib/constants/business-metrics.ts`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/constants/business-metrics.ts) directly from DB records, preventing unsupported static claims.
3. **Refund & Cancellation Hierarchy**: Unified cancellation policy framework across [`/terms`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/terms/page.tsx), [`/refund-policy`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/refund-policy/page.tsx), [`/cancellation-policy`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/cancellation-policy/page.tsx), [`/traveler-agreement`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/traveler-agreement/page.tsx), and [`/host-agreement`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/host-agreement/page.tsx). Booking-specific host rules override general policies where explicitly stated at checkout.
4. **Factual Founder Representation**:
   - Name: Tanishq Gupta (Founder).
   - Background: Started Wedding With India in July 2026; creator of BigTechJournals; background in private aviation technology initiatives; guest speaker at MNIT Jaipur.
   - Exaggerated labels ("serial entrepreneur", "award-winning founder", "industry leader", "MNIT Jaipur alumnus") strictly excluded across public copy and JSON-LD metadata.

---

### C. REQUIRES BUSINESS DOCUMENTATION

The founder and management team must assemble and maintain the following official documentation prior to commercial launch:

1. **Corporate Entity Registration**: Certificate of Incorporation, Articles of Association, or Partnership Deed establishing the exact legal operating entity in India (e.g. Sole Proprietorship, LLP, or Private Limited Company).
2. **Tax Registrations**: Goods and Services Tax Identification Number (GSTIN), Permanent Account Number (PAN), and Tax Deduction Account Number (TAN) in India.
3. **Stripe Merchant Account Setup**: Fully activated Stripe production account connected to the registered business entity and corporate bank account.
4. **Trademark Filings**: Form TM-A receipt for `Wedding With India™` under Class 39 (Travel/Escorted Tours) and Class 41 (Cultural/Event Services) filed with the Controller General of Patents, Designs and Trade Marks (India).
5. **Third-Party Vendor Agreements**: Signed contracts with third-party KYC/identity verification providers, SMS gateways, and email dispatch services (SendGrid/Postmark).
6. **Host & Agent Written Contracts**: Executed master agreements with host families, partner agencies, and local coordinators governing revenue splits and liability obligations.

---

### D. REQUIRES QUALIFIED PROFESSIONAL REVIEW

The platform's legal documents and operational model require formal review by licensed professionals prior to processing high-volume public transactions:

1. **Legal Counsel Review**: Retain qualified technology and consumer law counsel in India and key guest origin jurisdictions (US, UK, Australia) to review:
   - Platform Terms of Service & Facilitator Role Disclaimers under the Indian Information Technology Act, 2000 (Section 79 Safe Harbor for Intermediaries) and Consumer Protection (E-Commerce) Rules, 2020.
   - Limitation of Liability provisions under statutory non-excludable consumer guarantee laws.
   - Traveler & Host Agreements for compliance with local tort, contract, and emergency liability standards.
2. **Tax & Accounting Advisory**: Engage a practicing Chartered Accountant (CA) to establish:
   - GST liability on platform commissions and cross-border guest transactions.
   - Tax Deducted at Source (TDS) & Tax Collected at Source (TCS) compliance under Indian Income Tax Act rules for host payouts and agent commissions.
   - Cross-border remittance rules (FEMA / RBI guidelines) for foreign currency card processing via Stripe.
3. **Data Privacy Compliance (DPDP Act 2023 & GDPR)**: Retain privacy counsel to review user consent mechanisms, data principal notice forms, data retention policies, and cross-border data transfer protocols under India's Digital Personal Data Protection Act, 2023 and EU GDPR.

---

## Pre-Launch Readiness Assessment

### **PRE-LAUNCH STATUS: READY WITH DOCUMENTATION**

#### Required Founder Action Checklist Before Public Commercial Launch:
- [ ] Finalize corporate entity incorporation and insert official company legal name & registered address into [`/terms`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/terms/page.tsx) and [`Footer.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/components/layout/Footer.tsx).
- [ ] Connect production Stripe API keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) pointing to the verified corporate bank account.
- [ ] Obtain formal CA advice on GST treatment for platform service fees.
- [ ] Execute standard host agreements with initial onboarded wedding families.
