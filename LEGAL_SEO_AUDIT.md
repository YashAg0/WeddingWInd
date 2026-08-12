# LEGAL & SEO AUDIT MATRIX — WEDDING WITH INDIA

**Target Platform:** Wedding With India (Production Platform)  
**Date of Audit:** August 13, 2026  
**Auditor Role:** Legal Compliance, Trust, Brand, Product-Copy & SEO Auditor  

---

## Executive Legal & Trust Audit Summary

This document presents a comprehensive audit of all commercial, legal, safety, financial, and SEO claims across the Wedding With India platform. Unsupported, exaggerated, misleading, or legally unsafe statements have been systematically identified and rewritten to reflect the actual technical architecture and operational reality of the business.

---

## Detailed Audit & Correction Matrix

### 1. Payment & Escrow Claims
| Field | Detail |
| :--- | :--- |
| **Issue** | Misrepresentation of standard payment gateway processing as "Stripe Escrow" or "Trust Account" |
| **Original Claim** | `"Escrow Safety Hold included"` in Stripe line item metadata and `Stripe Escrow Protection` in public copy |
| **Risk** | Exposes the company to financial regulator enforcement and breach-of-contract lawsuits for false financial representation. Stripe Checkout is a payment gateway, not a third-party escrow holder. |
| **Corrected Wording** | `"Taxes & Platform Service Fee included"` in Stripe Checkout line items and `"Platform Payment Protection & Secure Payout Hold"` across public copy. |
| **Page / File** | [`lib/actions/stripe.ts`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/actions/stripe.ts), [`app/refund-policy/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/refund-policy/page.tsx), [`app/terms/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/terms/page.tsx) |
| **Legal Basis** | Consumer protection laws, FTC unfair/deceptive practices, Reserve Bank of India (RBI) payment aggregator regulations, and Stripe API terms of service. |
| **Founder Action Required** | None for current implementation. If an actual third-party bank escrow structure is required in the future, formal legal agreements with a licensed escrow agent must be executed. |
| **Documentary Evidence Required** | Stripe Merchant Terms & Account Documentation. |

---

### 2. Absolute Liability Disclaimers
| Field | Detail |
| :--- | :--- |
| **Issue** | Oversimplified absolute disclaimers ("Wedding With India is not responsible for anything") |
| **Original Claim** | Unsupported blanket disclaimers attempting to exclude all liability under any circumstance. |
| **Risk** | Deemed void or unconscionable under consumer protection acts in India, UK, EU, and Australia; fails to protect platform from statutory non-excludable obligations. |
| **Corrected Wording** | `"To the maximum extent permitted by applicable law... Nothing in these Terms excludes or limits any statutory consumer guarantee, non-excludable remedy or mandatory liability. Where Wedding With India acts solely as a platform facilitator, primary responsibility for event hosting, venues, catering, transportation and guest conduct remains with the respective provider."` |
| **Page / File** | [`app/terms/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/terms/page.tsx), [`app/safety/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/safety/page.tsx), [`app/traveler-agreement/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/traveler-agreement/page.tsx) |
| **Legal Basis** | Indian Consumer Protection Act 2019, UK Consumer Rights Act 2015, Australian Consumer Law (ACL), and EU Unfair Contract Terms Directive. |
| **Founder Action Required** | Formal review by qualified legal counsel in operating jurisdictions prior to high-volume commercial scaling. |
| **Documentary Evidence Required** | Operating Entity Legal Registration Documents. |

---

### 3. Absolute Safety Guarantees
| Field | Detail |
| :--- | :--- |
| **Issue** | Exaggerated safety claims such as "100% safe", "guaranteed safety", or "police background checks" |
| **Original Claim** | `100% Safe` / `Guaranteed Safety` / `Police background checked` |
| **Risk** | Creates strict liability / implied warranty if an incident occurs during an offline wedding event. |
| **Corrected Wording** | `"Multi-layer Identity Verification & Account Screening"`. Explicit disclaimer: `"Identity verification procedures assist in screening participants but do not guarantee an individual's future conduct or eliminate all offline risks."` |
| **Page / File** | [`app/safety/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/safety/page.tsx), [`app/for-couples/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/for-couples/page.tsx), [`app/for-travelers/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/for-travelers/page.tsx) |
| **Legal Basis** | Tort law, negligence claims, misleading advertising regulations. |
| **Founder Action Required** | Maintain operational identity verification logs for all verified host and guest accounts. |
| **Documentary Evidence Required** | Third-party KYC/identity verification vendor agreements. |

---

### 4. Visa & Immigration Advice Responsibility
| Field | Detail |
| :--- | :--- |
| **Issue** | Risk of implying visa sponsorship, immigration guarantees, or border entry clearance |
| **Original Claim** | Ambiguous guidance regarding traveler visa approval. |
| **Risk** | Violations of Indian immigration regulations and international consular rules; liability for guest travel delays or deportation. |
| **Corrected Wording** | `"International travelers are solely responsible for obtaining their passports, tourist visas, and travel permits required for entry into India. Wedding With India does not provide visa sponsorship, legal immigration advice, or guaranteed border entry."` |
| **Page / File** | [`app/for-travelers/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/for-travelers/page.tsx), [`app/terms/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/terms/page.tsx), [`app/traveler-agreement/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/traveler-agreement/page.tsx) |
| **Legal Basis** | Foreigners Act 1946 (India), Ministry of External Affairs e-Visa guidelines. |
| **Founder Action Required** | Ensure customer support templates instruct travelers to consult official e-Visa portals (indianvisaonline.gov.in). |
| **Documentary Evidence Required** | None. |

---

### 5. Office & Global Location Misrepresentation
| Field | Detail |
| :--- | :--- |
| **Issue** | Potential confusion between distributed team presences and registered corporate branch offices |
| **Original Claim** | Generic listings of international cities without operational distinction |
| **Risk** | Misleading consumers or tax authorities regarding corporate permanent establishments (PE). |
| **Corrected Wording** | `"Global Presence — Remote & Operating Locations"`. Explicitly labeled: Jaipur, Rajasthan, India as primary Operating Location and US/UK/Australia as Remote Team Presence. |
| **Page / File** | [`components/layout/Footer.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/components/layout/Footer.tsx), [`app/about/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/about/page.tsx) |
| **Legal Basis** | Corporate tax PE rules, Indian Companies Act 2013, e-commerce disclosure rules. |
| **Founder Action Required** | Update legal entity name & registered office details in Terms & Footer once corporate incorporation is finalized. |
| **Documentary Evidence Required** | Certificate of Incorporation / Business Registration / GST Identification. |

---

### 6. Trademark Disclosure & Symbol Usage
| Field | Detail |
| :--- | :--- |
| **Issue** | Claiming registered trademark status (`®`) without completed registration certificates |
| **Original Claim** | `"Wedding With India is a registered trademark"` |
| **Risk** | False claims of registered trademark status constitute an offense in multiple jurisdictions (e.g. Section 107 of Indian Trade Marks Act 1999). |
| **Corrected Wording** | `"Wedding With India™ and associated branding are brand identifiers used by the business. Unauthorized commercial reproduction is prohibited."` |
| **Page / File** | [`app/trademark/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/trademark/page.tsx), [`app/copyright/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/copyright/page.tsx) |
| **Legal Basis** | Indian Trade Marks Act 1999, Lanham Act (US), UK Trade Marks Act 1994. |
| **Founder Action Required** | File TM Application Class 39 (Travel/Escorted tours) & Class 41 (Cultural events) with Controller General of Patents, Designs and Trade Marks (India). |
| **Documentary Evidence Required** | TM Application Filing Acknowledgement Form TM-A. |

---

### 7. Financial Model & Payout Clarity
| Field | Detail |
| :--- | :--- |
| **Issue** | Calling host payouts "guaranteed income" or presenting illustrative tools as promises |
| **Original Claim** | Potential misinterpretation of host calculator values as fixed contractual earnings |
| **Risk** | Misleading income representation under consumer and advertising standards. |
| **Corrected Wording** | Explicit disclaimer on calculator: `"The earnings calculator is an illustrative estimate based on experience pricing and standard host splits. Net payouts depend on confirmed bookings, host tier, platform service fees, taxes, and completed attendance."` |
| **Page / File** | [`app/for-couples/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/for-couples/page.tsx), [`app/for-agents/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/for-agents/page.tsx), [`app/host-agreement/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/host-agreement/page.tsx) |
| **Legal Basis** | Advertising Standards Council of India (ASCI) guidelines, FTC Business Opportunity Rule. |
| **Founder Action Required** | Ensure host terms clearly reflect commercial commission percentages in written agreements. |
| **Documentary Evidence Required** | Standard Host Commercial Agreement. |

---

## Key Verification & Audit Findings

1. **Broken Link Repaired**: Updated [`Footer.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/components/layout/Footer.tsx) link from broken route `/cancellation` to canonical route `/cancellation-policy`.
2. **Age Barrier Policy Enforced**: Explicitly added 18+ adult age restriction across Terms, Traveler Agreement, and Host Agreement.
3. **Legal Consistency Guaranteed**: Harmonized refund timelines and cancellation tiers across Terms, Refund Policy, Cancellation Policy, and Host/Traveler Agreements.
