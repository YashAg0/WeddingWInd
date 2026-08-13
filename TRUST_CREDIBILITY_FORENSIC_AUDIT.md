# WeddingWithIndia — Forensic Trust & Credibility Audit (Phase 0)

**Date**: August 14, 2026  
**Auditor**: Principal Engineer, QA Lead, Cultural Authenticity Auditor, Trust & Safety Reviewer  
**Scope**: Full repository analysis for trust vulnerabilities, cultural contradictions, fake social proof, pricing mismatches, SEO inconsistencies, and operational risks.

---

## 1. Executive Summary & Core Mandate

A previous lead visited WeddingWithIndia, observed a Muslim wedding displaying Hindu rituals, concluded the platform was fake, and left. 

This forensic audit identifies and classifies every vulnerability across 10 critical dimensions to ensure that a foreign traveler browsing the platform finds **100% internal truthfulness, operational realism, cultural consistency, and absolute transparency**.

---

## 2. Risk Inventories

### 2.1 Trust-Risk Inventory
- **Unsubstantiated Marketing Claims**: Headings and descriptions across `app/layout.tsx`, `app/page.tsx`, and static fallback data referencing total guests/weddings without distinguishing database state from platform metrics.
- **Testimonial Representation**: Sample testimonials in `lib/data.ts` ("Sarah Jenkins", "Marcus Vance") presented alongside copy claiming "Every review and story shared here comes from a real celebration", violating strict non-fabrication rules.
- **Host Verification Badges**: Host profiles missing clear, verifiable signals between "Verified Host" (completed identity & venue verification) vs. unverified demo hosts.

### 2.2 Data Authenticity Inventory
- **Hardcoded Fallbacks vs Database State**: In `lib/data.ts`, `featuredWeddings` fallbacks exist with fixed `rating: 5.0` and `reviewCount: 14`, which could leak into components if DB queries fail or fallback handlers are triggered.
- **Unspecified Regions/Communities in DB**: Audit revealed two database wedding entries (`ananya-kabir-udaipur-1786527554404` and `kerala-backwater-wedding`) with `Unspecified` region/community and generic dress/food notes.

### 2.3 Demo-Content Inventory
- **Showcase Weddings Classification**: 23 seeded marketplace weddings are marked `isDemo: true`. While protected against real server-side bookings, UI badges on cards and detail pages must unambiguously communicate "Showcase Experience / Example Listing" to prevent visitors from believing they are booking a real family event without host verification.
- **Fake Progress & Scarcity Bars**: Any remaining UI elements showing static "X seats left" or "17 people viewing" without DB derivation must be audited and sanitized.

### 2.4 Cultural-Risk Inventory
- **Cross-Cultural Contamination Risk**: Ensure no Muslim, Sikh, Christian, or Buddhist wedding listing contains prohibited cross-cultural terms (`phera`, `saptapadi`, `ganesh puja`, `nikah`, `anand karaj`, `laavan`, `church mass`, `sindoor`, `mangalsutra`, `kanyadaan`).
- **Christian Sub-Community Nuance**: Universal flattening of Christian traditions (Goan Catholic vs. Kerala Syrian Christian vs. Nagaland Protestant).
- **Hindu Regional Variation**: Universal flattening of Hindu traditions (Tamil Brahmin Sadya/Thali vs. Rajasthani Marwari vs. Bengali Subho Drishti).
- **Interfaith Wedding Representation**: Ensuring interfaith weddings explicitly cite both traditions rather than collapsing under one religion.

### 2.5 Booking-Risk Inventory
- **State Machine Transitions**: Ensuring clean transitions between `DRAFT`, `PENDING_VERIFICATION`, `ACTIVE`, `SHOWCASE`, `SUSPENDED`, `CANCELLED`, and `COMPLETED`.
- **Server-Side Validation**: Ensuring no client-side price or capacity manipulation can bypass server action checks in `lib/actions/index.ts` and `lib/actions/stripe.ts`.

### 2.6 Marketing-Claim Inventory
- **Business Metrics Consistency**: `BUSINESS_METRICS` in `lib/constants/business-metrics.ts` correctly sets hosted count to `"Awaiting first verified celebration"`. However, text concatenation in `app/layout.tsx` ("collection of Awaiting first verified celebration verified celebrations") produces ungrammatical copy.

### 2.7 Operational-Risk Inventory
- **Traveler Support & Logistics Transparency**: Clear guidance on arrival, dress code, gifting etiquette, dietary restrictions (Halal, Jain, Pure Veg, Vegan), photo boundaries, and post-booking emergency contacts.
- **Host Onboarding & Guidelines**: Clear expectations for host family response times, safety guidelines, and participation boundaries.

### 2.8 SEO-Risk Inventory
- **Misleading Structured Data**: JSON-LD schema on showcase listings claiming `EventReservation` or `Offer` for demo events must reflect showcase/illustrative status.
- **Metadata Alignment**: Title tags, descriptions, OpenGraph tags, and sitemaps matching exact DB models.

### 2.9 UX-Risk Inventory
- **Filter Scroll Independence**: Ensuring filter sidebars scroll independently of the main wedding card grid.
- **Mobile Filter Drawer**: Smooth opening, clear active filter counters, and body scroll lock.
- **Empty & Loading States**: Clean fallback screens when filters return zero results, network fails, or non-existent slugs are requested.

### 2.10 Technical-Risk Inventory
- **Strict Type Checking**: TypeScript compilation (`tsc --noEmit`) passing without errors.
- **Automated Quality Gates**: Execution of test scripts `verify-db.js`, `verify-authenticity.js`, `verify-wedding-discovery.js`, `verify-wedding-dates.js`, and new verification scripts.

---

## 3. Mandatory Action Plan

1. **Phase 1**: Enforce Single Source of Truth across Card, Detail, Booking, and Metadata.
2. **Phase 2**: Upgrade Cultural Authenticity Engine to 2.0 with deep regional/community compatibility matrices.
3. **Phase 3**: Audit Visual / Image Authenticity to ensure zero religion-image mismatches.
4. **Phase 4**: Audit Date Realism & Seasonal accuracy.
5. **Phase 5**: Refine Showcase vs. Real Inventory handling.
6. **Phase 6**: Build Host Authenticity & Verification states.
7. **Phase 7**: Guarantee Pricing Realism & Fee Transparency.
8. **Phase 8**: Audit Full Booking & Checkout Flow.
9. **Phase 9**: Enhance International Traveler Experience & Guidance.
10. **Phase 10**: Expand Cultural Etiquette Engine.
11. **Phase 11 & 12**: Clean Social Proof & Review verification architecture.
12. **Phase 13**: Competitor Gap Analysis (`COMPETITOR_GAP_AUDIT.md`).
13. **Phase 14**: Comprehensive FAQ & Objection-Killer System.
14. **Phase 15**: Audit Error, Empty, and Edge States.
15. **Phase 16**: Mobile & Accessibility Audit.
16. **Phase 17**: SEO Realism & Structured Data Integrity.
17. **Phase 18**: Security, RLS, and Data Integrity Hardening.
18. **Phase 19 & 20**: Lead Capture, Recovery, and Lead Loss Simulation (`LEAD_LOSS_SIMULATION.md`).
19. **Phase 21**: Adversarial Trust Testing.
20. **Phase 22 & 23**: Comprehensive Automated Quality Gate Suite & Full Regression.
21. **Phase 24 & 25**: Final Production Trust Gate & Final Reports (`WEDDINGWITHINDIA_PRODUCTION_TRUST_AUDIT.md` and `WEDDINGWITHINDIA_TRUST_CHECKLIST.md`).
