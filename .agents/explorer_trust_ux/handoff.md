# Master Audit Handoff Report — Explorer 3: Foreign Traveler UX, Trust System & 'Too Much Website' Breakdown

**Target System**: WeddingWithIndia Marketplace  
**Auditor**: Explorer 3 (Foreign Traveler UX, Trust System & 'Too Much Website' Breakdown)  
**Date**: 2026-08-30  
**Scope**: Sections G (Trust & Credibility), H (Foreigner Comfort & Anxiety Reduction), I ('Too Much Website' Component Breakdown), and J (Missing Features Inventory)  
**Working Directory**: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_trust_ux\`

---

## 1. Observations

### 1.1 Trust & Verification Badges vs. Database Reality (Section G)
- **Observation G.1.1 (Verification Badge Synthesis Bypass)**: In `lib/wedding-dto.ts` (line 228), the `isVerified` flag on wedding objects is computed as:
  ```typescript
  isVerified: !rawWedding.isDemo && (rawWedding.status === "VERIFIED" || rawWedding.status === "PUBLISHED" || !rawWedding.isVerified)
  ```
  Consequently, **every published wedding** (`status === "PUBLISHED"`) is automatically assigned `isVerified: true` and rendered with a green `ShieldCheck` "Verified host" badge in `components/wedding/WeddingCard.tsx` (lines 238–242) and `app/weddings/[slug]/page.tsx` (lines 188–193), **even if the host's actual `Verification` record in PostgreSQL (`prisma.verification`) is null, unsubmitted, or pending**.
- **Observation G.1.2 (Decoupled Reputation Badge System)**: In `prisma/schema.prisma` (lines 1380–1424) and `lib/services/badges.ts` (lines 8–62), dedicated models exist for `QualityBadge`, `UserQualityBadge`, and `WeddingQualityBadge` (e.g. `verified-host`, `reliable-host`, `trusted-traveler`, `guest-favorite`). However:
  - `UserQualityBadge` is never queried or rendered in any traveler-facing card, host profile, or booking checkout.
  - `WeddingQualityBadge` is queried only in `lib/actions/discovery.ts` (line 199) to add a 25-point boost to search ranking, but its badge metadata is stripped from the returned DTO.
- **Observation G.1.3 (Hardcoded Marquee Trust Signals)**: In `components/home/TrustStrip.tsx` (lines 5–30), trust signals are hardcoded static strings:
  - `"Verified Host Families"`
  - `"Guests from 48+ Nations"`
  - `"Transparent USD Pricing"`
  - `"Dedicated Concierge"`
  There is zero backend aggregation querying unique guest nationalities from `TravelerProfile.country` or verifying host verification status.
- **Observation G.1.4 (Hero Stat Embellishments)**: In `components/home/Hero.tsx` (lines 67–86), `TRUST_STATS` hardcodes:
  - `"Cultural Wedding Traditions: Thoughtfully curated for guests"`
  - `"Curated Celebrations Only: Every wedding hand-selected"`
  - `"Secure Transparent Payments: AES-256 encrypted & protected"`

### 1.2 Pricing Transparency, FX, Taxes & Escrow (Section G)
- **Observation G.2.1 (Currency Support & Hardcoded FX Rates)**: In `lib/currency.ts` (lines 5–9) and `components/layout/Navbar.tsx` (lines 39–41), only three currencies are supported: `USD`, `EUR`, `INR`. Exchange rates are hardcoded static constants:
  ```typescript
  export const FX_RATES: Record<Currency, number> = {
    INR: 1,
    USD: MODEL_FX.USD || 95.50,
    EUR: MODEL_FX.EUR || 108.00,
  };
  ```
  Major international traveler origin currencies—including **British Pound (`GBP`), Australian Dollar (`AUD`), Canadian Dollar (`CAD`), Singapore Dollar (`SGD`), and UAE Dirham (`AED`)**—are completely absent from the platform's currency switcher.
- **Observation G.2.2 (GST & Tax Disconnect)**: In `prisma/schema.prisma` (line 1450), `SystemConfig` defines `taxPercent: 18.0` (Indian GST rate). However, in `lib/services/pricing-engine.ts` (lines 80–118) and `components/wedding/BookingSidebar.tsx` (lines 200–214), the customer is presented with a flat USD price ($149 to $1,199). In `components/dashboard/BookingCard.tsx` (line 269), a separate `"Processing Surcharge: $..."` line item is displayed post-approval, conflicting with the "Clean price, zero customer surcharge" claim in `lib/services/pricing-engine.ts:15`.
- **Observation G.2.3 (Checkout Cancellation Surfacing Gap)**: `lib/services/cancellation-policy.ts` (lines 111–160) implements a tiered refund policy:
  - $\ge 30$ days: 90% refund (platform retains 10%)
  - 15–29 days: 70% refund
  - 7–14 days: 40% refund
  - $< 7$ days: 0% refund
  However, in `components/wedding/BookingSidebar.tsx` (lines 112–272), **zero cancellation policy terms or escrow safety notices are presented before the user submits a reservation request**.
- **Observation G.2.4 (Escrow Safety Assurances)**: In `prisma/schema.prisma` (line 494), `Payment.hostPayoutTransferred: Boolean @default(false)` ensures host payouts are held by the platform and disbursed post-event. However, the traveler checkout and booking widgets fail to explicitly communicate this escrow protection to foreign travelers.

### 1.3 Review & Testimonial Authenticity (Section G)
- **Observation G.3.1 (Strict Review Backend Enforcement)**: In `lib/services/review-eligibility.ts` (lines 58–105) and `lib/actions/reviews.ts` (lines 149–213), review creation requires:
  - Direct booking ownership (`booking.travelerId === user.travelerProfile.id`).
  - Attended status (`BookingStatus.CHECKED_IN`, `BookingStatus.ATTENDED`, `BookingStatus.COMPLETED`).
  - Event date in the past (`booking.wedding.date <= new Date()`).
  - Non-refunded booking (`totalRefunded < totalPaid`).
  - 14-day edit window lock (`elapsed <= 14 days`).
  - Fraud heuristic scanning (`ReviewFraudSignal`).
- **Observation G.3.2 (Homepage Testimonials Bypass & Empty State)**: In `app/page.tsx` (line 15 & line 73), `Testimonials` receives `testimonials` imported from `lib/data.ts`. In `lib/data.ts` (line 2232), `testimonials` is explicitly defined as `export const testimonials: Testimonial[] = [];`. Consequently, `components/home/Testimonials.tsx` always falls back to the banner `"Guest stories are coming soon"`. The PostgreSQL `Testimonial` table is never queried.

### 1.4 Cultural Anxiety & Etiquette Systems (Section H)
- **Observation H.1.1 (Religion & Region Integrity Engine)**: `lib/culture.ts` contains an extensive Cultural Authenticity Engine:
  - Maps 8 canonical religions (`Hindu`, `Muslim`, `Sikh`, `Christian`, `Jain`, `Buddhist`, `Interfaith`, `Other`) and 18 regions.
  - Enforces `PROHIBITED_CEREMONY_TERMS` (lines 91–165) to prevent cross-cultural contradictions (e.g. banning "Pheras" or "Ganesh Puja" on Muslim/Sikh weddings).
  - Specifies authentic ceremony names, time ranges, and guest participation modes (`participate` vs `observe`).
- **Observation H.1.2 (Dress Code & Etiquette Explanations)**: In `lib/culture.ts` (e.g. lines 177, 212, 282, 352, 387, 422) and `app/learn/what-to-wear-to-an-indian-wedding/page.tsx`, specific attire guidance is defined per ceremony (Mehendi, Sangeet, Haldi, Pheras, Anand Karaj, Walima). In `app/dashboard/events/[bookingId]/ClientEventHubForm.tsx` (lines 220–238), travelers are required to acknowledge dress rules (avoiding mourning black/white).
- **Observation H.1.3 (General Etiquette Guidance)**: `app/learn/indian-wedding-etiquette-for-foreigners/page.tsx` (lines 44–73) explicitly covers shoes removal, right-hand dining, photography etiquette, cash gifting conventions (₹501, ₹1101, ₹2101), and alcohol policies.

### 1.5 Dietary Safety & Restriction Transmission (Section H)
- **Observation H.2.1 (Unstructured Free-Text Dietary Input)**: In `app/onboarding/page.tsx` (lines 307–316) and `app/dashboard/profile/page.tsx` (line 179), dietary preferences are captured as an unstructured text input field (`<input placeholder="Vegetarian, Halal, Gluten Free..." />`). There are no structured selectors for medical allergens or specific diets (Strict Vegetarian, Vegan, Jain, Halal, Celiac/Gluten-Free, Tree Nut/Peanut Allergy, Lactose Intolerance, Egg-Free, Seafood/Shellfish, Spice Tolerance).
- **Observation H.2.2 (Multi-Guest Dietary Blindspot)**: In `components/wedding/BookingSidebar.tsx` (lines 175–198), a user selecting 2 to 10 guests is never prompted to input individual names, dietary restrictions, or medical alerts for accompanying guests (`BookingGuest`).
- **Observation H.2.3 (Host Report Data Disconnect)**: In `app/api/reports/host/[weddingId]/route.ts` (line 46), the host guest CSV export extracts:
  ```typescript
  const notes = b.traveler.foodPreferences || "None";
  ```
  It queries the traveler's top-level profile string and **completely omits the per-booking `TravelDetail.dietaryRequirements`** submitted in the Event Hub (`app/dashboard/events/[bookingId]`), creating a critical risk of dietary miscommunication between foreign travelers and wedding catering teams.

### 1.6 Logistics, Transportation & Physical Safety (Section H)
- **Observation H.3.1 (Airport & Hotel Transport Guidance)**: In `app/dashboard/events/[bookingId]/ClientEventHubForm.tsx` (lines 493–503), travel details only capture a boolean `transportRequired` checkbox. There is no structured integration for flight tracking, airport meeting points, or chauffeur contact details.
- **Observation H.3.2 (Bilingual Coordinator Add-on Missing)**: Although `CoordinatorProfile` exists in PostgreSQL and `WhyChooseUs.tsx` promises "Personal bilingual local coordinator support", there is no UI selector to book or request a dedicated local concierge during checkout.
- **Observation H.3.3 (Emergency Contacts Capture)**: The Event Hub (`ClientEventHubForm.tsx:265–350`) mandates emergency contact details (Name, Relationship, Dial Code, Phone, Email) before issuing the final `READY_FOR_EVENT` pass status.
- **Observation H.3.4 (Emergency SOS / Helpline Absence)**: In `app/safety/page.tsx` (lines 410–440), the platform explicitly disclaims: `"Wedding With India support is not an emergency-response service."` No one-tap emergency SOS button, live 24/7 WhatsApp safety desk trigger, or dedicated female solo traveler hotline exists in the mobile or web UI.

### 1.7 Architectural Bloat & "Too Much Website" (Section I)
- **Observation I.1 (27+ Fragmented Legal/Policy Routes)**: The application contains 27+ separate legal and policy pages in `app/`:
  `terms`, `privacy`, `cookies`, `acceptable-use`, `booking-terms`, `cancellation-policy`, `refund-policy`, `payment-terms`, `traveler-agreement`, `host-agreement`, `agent-agreement`, `coordinator-agreement`, `community-guidelines`, `content-policy`, `copyright`, `trademark`, `dpdp`, `gdpr`, `grievance`, `complaints`, `incident-report`, `guest-safety`, `host-safety`, `safety`, `photo-video-consent`, `insurance`, `travel-visa`.
  This fragmentation scatters critical traveler protections across dozens of disconnected URLs, overwhelming users with legalistic jargon instead of a clear, consolidated Trust & Safety Hub.
- **Observation I.2 (Duplicated & Dead Marketing Artifacts)**: Multiple visual journey diagrams in `components/diagrams/` (`AgentJourneyDiagram.tsx`, `CoordinatorJourneyDiagram.tsx`, `GuestJourneyDiagram.tsx`, `HostJourneyDiagram.tsx`, `PlatformOverviewDiagram.tsx`) duplicate steps already rendered in `components/home/HowItWorks.tsx`.

---

## 2. Logic Chain

```
[Observation G.1.1: isVerified synthesized on status=PUBLISHED]
       │
       ▼
[Finding 1: Verification Badges are UI Decorations, not cryptographic or DB-audited claims]
       │
       ├─► Reduces credibility when foreign traveler notices unverified hosts carry green shields
       │
[Observation G.2.1: Only 3 currencies, static FX rates 95.50 / 108.00]
       │
       ▼
[Finding 2: High Pricing Friction for UK, Australian, Canadian, and Gulf Travelers]
       │
       ├─► Foreign travelers from UK/Australia cannot see native GBP/AUD pricing
       ├─► Static FX rates create margin risk or unexpected credit card conversion fees
       │
[Observation H.2.1 - H.2.3: Free-text food preferences & Host CSV disconnect]
       │
       ▼
[Finding 3: Severe Dietary Safety Hazard for Severe Allergies / Celiac Guests]
       │
       ├─► Anaphylactic nut allergies or Celiac travelers cannot select strict allergen chips
       ├─► Event Hub dietary requirements never reach Host catering CSV export
       │
[Observation I.1: 27+ fragmented legal routes & redundant diagram components]
       │
       ▼
[Finding 4: "Too Much Website" Information Overload destroying Conversion Funnel]
       │
       └─► Foreign traveler seeking simple safety assurances is buried under legalistic bloat
```

---

## 3. Caveats

- **No Live Production Database Modifications**: In accordance with the non-destructive audit mandate, no database records, migrations, or application logic files were altered.
- **Third-Party Payment Gateways**: Live external calls to Stripe or PayPal sandbox were audited via schema, webhooks, and action controllers (`lib/actions/payment-manual.ts`, `app/api/webhooks/stripe/route.ts`).
- **PWA Service Worker**: PWA caching mechanisms were audited via component review (`components/pwa/*`) without simulated service-worker intercept tests.

---

## 4. Conclusion & Forensic Master Deliverables

### Section G: Trust & Credibility Analysis

| Dimension | Audit Finding | Evidence Location | Impact & Severity | Recommended Remediation |
|---|---|---|---|---|
| **Host Verification Integrity** | "Verified Host" badge is assigned to any wedding with `status === "PUBLISHED"`, completely decoupled from `prisma.verification.status === "APPROVED"`. | `lib/wedding-dto.ts:228`, `WeddingCard.tsx:238` | **HIGH (P1)**: Misleading trust signal. Unverified hosts display green verified shields to foreign buyers. | Tie `isVerified` strictly to `rawWedding.hostCouple?.user?.verification?.status === "APPROVED"` and `UserQualityBadge`. |
| **Quality Badge Utilization** | Rich `QualityBadge` & Bayesian rating models exist in PostgreSQL (`badges.ts`) but are never rendered on public cards or detail pages. | `lib/services/badges.ts:8–62`, `prisma/schema.prisma:1380` | **MEDIUM (P2)**: Missed social proof. Complex backend badge infrastructure is completely invisible to users. | Surface awarded `QualityBadge` icons (`guest-favorite`, `reliable-host`) directly on wedding cards and host story blocks. |
| **Multi-Currency & FX Engine** | Only USD, EUR, INR supported. Hardcoded static conversion rates (`USD: 95.50`, `EUR: 108.00`). No GBP, AUD, CAD, SGD, AED. | `lib/currency.ts:5–9`, `Navbar.tsx:39` | **HIGH (P1)**: Conversion barrier for key Indian diaspora/tourist markets (UK, Australia, Canada, UAE). | Integrate live ECB/OpenExchangeRates feed; expand currency dropdown to include `GBP`, `AUD`, `CAD`, `SGD`, `AED`. |
| **Pricing Breakdown Transparency** | Clean USD price shown in sidebar ($149–$1,199), but dashboard displays `"Processing Surcharge: $..."` post-approval. | `BookingSidebar.tsx:208`, `BookingCard.tsx:269` | **MEDIUM (P2)**: Psychological pricing shock if surcharge appears unexpectedly in payment stage. | Maintain strict clean-pricing invariant: eliminate client-facing payment surcharge line items completely. |
| **Cancellation Policy Surfacing** | Strict tiered cancellation policy (90%/70%/40%/0%) exists in backend but is never displayed on the wedding detail booking sidebar. | `lib/services/cancellation-policy.ts:111`, `BookingSidebar.tsx:112` | **HIGH (P1)**: Foreign travelers hesitate to commit $500–$2,000 without visible cancellation & refund terms. | Add an expandable "Cancellation & Refund Terms" drawer directly beneath the "Reserve Invitation" button in `BookingSidebar.tsx`. |
| **Escrow Safety Messaging** | Payments are held by platform until event completion (`hostPayoutTransferred`), but zero escrow badges exist in checkout. | `prisma/schema.prisma:494`, `BookingSidebar.tsx` | **MEDIUM (P2)**: Foreign travelers fear host scams or no-shows without explicit escrow guarantees. | Add explicit trust anchor: *"WeddingWithIndia Escrow Protection: Funds held securely until celebration check-in."* |
| **Review Authenticity & Fraud** | Review submission strictly enforces completed booking attendance (`review-eligibility.ts`) with fraud burst detection. | `lib/services/review-eligibility.ts:58–105`, `lib/actions/reviews.ts:163` | **EXEMPLARY**: Robust anti-fraud and attendance verification architecture. | Keep and maintain. |
| **Homepage Testimonials Feed** | Homepage `Testimonials.tsx` is fed an empty static array (`lib/data.ts:2232`), ignoring the PostgreSQL `Testimonial` table. | `app/page.tsx:15`, `lib/data.ts:2232`, `Testimonials.tsx:114` | **LOW (P3)**: Homepage displays "Guest stories are coming soon" instead of dynamic verified traveler reviews. | Query top-rated verified reviews (`prisma.review.findMany({ where: { rating: 5, status: "PUBLISHED" } })`) for homepage social proof. |

---

### Section H: Foreign Traveler Comfort & Anxiety Reduction

```
                      FOREIGN TRAVELER ANXIETY AUDIT MATRIX
                      
  ┌───────────────────────┬──────────────────────────────────┬────────────────────────┐
  │ Anxiety Dimension     │ Current Implementation           │ Severity & Gap Status  │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 1. Cultural Anxiety   │ Religion-specific ceremony rules │ ADEQUATE               │
  │    & Dress Codes      │ in culture.ts; Event Hub check.  │ Minor UI polish needed │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 2. Dietary Safety &   │ Free-text profile input;         │ CRITICAL (P0)          │
  │    Severe Allergies   │ Disconnected from Host CSV.      │ High medical risk      │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 3. Multi-Guest Data   │ Only guest count (1-10) booked;  │ HIGH (P1)              │
  │    Capture            │ Zero accompanying guest data.    │ Blind catering data    │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 4. Female Solo Safety │ General platform safety text;    │ HIGH (P1)              │
  │    & Panic Helpline   │ No SOS or dedicated desk.        │ Solo traveler friction │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 5. Airport & Local    │ Generic checkbox in Event Hub;   │ MEDIUM (P2)            │
  │    Transportation     │ No flight tracking or chauffeur. │ Arrival anxiety        │
  ├───────────────────────┼──────────────────────────────────┼────────────────────────┤
  │ 6. SIM / Connectivity │ Static mentions in blog posts;   │ LOW (P3)               │
  │    Guidance           │ No dashboard eSIM partnership.   │ First-time visitor gap │
  └───────────────────────┴──────────────────────────────────┴────────────────────────┘
```

#### Detailed Findings:
1. **Dietary Safety Breakdown (P0)**:
   - **Problem**: In `app/onboarding/page.tsx:310`, food preferences are captured via a single unstructured string. In `app/api/reports/host/[weddingId]/route.ts:46`, the host export ignores `TravelDetail.dietaryRequirements`.
   - **Risk**: A guest with severe peanut anaphylaxis or Celiac disease could receive food with cross-contamination because the host catering team only received an outdated account profile string.
   - **Remediation**: Replace free-text with a structured allergen checklist (Chips for: *Strict Vegetarian, Vegan, Jain [No Root Veg], Halal, Celiac / Gluten-Free, Tree Nut Allergy, Peanut Allergy, Lactose Intolerance, Egg-Free, Shellfish, Mild / Non-Spicy*). Fix the host CSV export to serialize `TravelDetail.dietaryRequirements` and all `BookingGuest` dietary profiles.
2. **Multi-Guest Capture Blindspot (P1)**:
   - **Problem**: When a traveler reserves for 4 guests, `BookingSidebar.tsx` records `guestsCount: 4` but never collects names, genders, ages, or dietary needs for Guests #2, #3, and #4.
   - **Remediation**: In `BookingSidebar.tsx` or Event Hub, introduce dynamic guest cards for each seat booked.
3. **Female Solo Traveler Safety & Scam Shielding (P1)**:
   - **Problem**: Women traveling alone to India experience elevated safety anxiety regarding transport, hotel transfers, and unescorted venue navigation. `app/safety/page.tsx` contains generic disclaimers but lacks actionable solo female traveler features.
   - **Remediation**: Introduce a dedicated **"Solo Traveler & Female Guest Assurance"** badge on listings offering verified female host liaisons, vetted airport pickup, and a 24/7 dedicated WhatsApp Concierge Helpline.

---

### Section I: 'Too Much Website' Component Breakdown

Below is the exhaustive, component-by-component classification of the WeddingWithIndia marketplace:

| Component / Section / Route | Current File Location | Classification | Rationale & Forensic Justification |
|---|---|---|---|
| **27+ Fragmented Policy Pages** | `app/terms`, `privacy`, `acceptable-use`, `booking-terms`, `cancellation-policy`, `refund-policy`, `payment-terms`, `traveler-agreement`, `host-agreement`, `agent-agreement`, `coordinator-agreement`, `community-guidelines`, `content-policy`, `copyright`, `trademark`, `dpdp`, `gdpr`, `grievance`, `complaints`, `incident-report`, `guest-safety`, `host-safety`, `photo-video-consent`, `insurance`, `travel-visa` | **COMBINE** | Consolidate into 3 unified tabs under `/trust`: 1) *Guest & Host Terms*, 2) *Privacy & DPDP/GDPR*, 3) *Safety & Incident Desk*. Eliminate 20+ redundant sub-routes. |
| **Marquee Trust Strip** | `components/home/TrustStrip.tsx` | **REDUCE** | 28-second continuous CSS marquee animation is visually distracting. Replace with a clean, static 4-column trust badge grid. |
| **Hero 3D Tilt & Particles** | `components/home/Hero.tsx` (lines 42–47, 145–171) | **REDUCE** | Framer motion mouse-tracking 3D card tilt and 4 floating sparkles add JS execution overhead on low-power mobile devices. Simplify to clean static card with native CSS hover. |
| **Duplicate Journey Diagrams** | `components/diagrams/GuestJourneyDiagram.tsx`, `HostJourneyDiagram.tsx`, etc. | **REMOVE** | Dead weight. These diagrams duplicate the flowchart already rendered in `components/home/HowItWorks.tsx`. |
| **Empty Testimonials Carousel** | `components/home/Testimonials.tsx` | **COMBINE** | Remove empty data fallback banner; combine with real verified review quotes pulled dynamically from `prisma.review`. |
| **Cultural Code Section** | `components/home/CulturalCode.tsx` | **KEEP** | High emotional resonance ("Be a guest, not a disruption"). Sets clear behavioral expectations for international travelers. |
| **6-Step Guest Flowchart** | `components/home/HowItWorks.tsx` | **KEEP** | Essential UX conversion driver. Clear visual breakdown from discovery to post-event memories. |
| **Destination City Cards** | `components/home/Countries.tsx` | **KEEP** | Clean geographic discovery anchor for travelers planning multi-city India itineraries. |
| **Wedding Styles Grid** | `components/home/Categories.tsx` | **KEEP** | Visual categorization (Royal, Beach, Punjabi, South Indian, Traditional) drives quick search filtering. |
| **FAQ Accordion** | `components/home/FAQ.tsx`, `FAQAccordion.tsx` | **KEEP** | Directly addresses international guest concerns (alcohol, gifts, clothing, food spice). |
| **Final CTA Banner** | `components/home/CTASection.tsx` | **KEEP** | Clean conversion endpoint leading to discovery and host listing flows. |
| **Representative Media Disclaimer** | `app/weddings/[slug]/page.tsx:238–242` | **MOVE** | Currently displayed as tiny footnote below gallery. Move into a distinct trust pill directly inside the gallery viewer. |
| **Booking Sidebar Pricing Box** | `components/wedding/BookingSidebar.tsx` | **KEEP** | High conversion component with transparent tier pricing, guest count, and celebration side selector. |
| **Booking Sidebar Cancellation Terms** | `components/wedding/BookingSidebar.tsx` | **ADD** | Missing critical trust link. Add inline expandable summary of the 90%/70%/40% refund schedule before booking submission. |
| **Multi-Currency Switcher (GBP/AUD/CAD)** | `components/layout/Navbar.tsx`, `lib/currency.ts` | **ADD** | Essential international feature. Expand beyond USD/EUR to include GBP, AUD, CAD, SGD, and AED. |
| **Structured Dietary Allergen Selector** | `app/onboarding/page.tsx`, `ClientEventHubForm.tsx` | **ADD** | Critical medical safety feature. Replace free-text with structured allergen and dietary restriction chips. |
| **Host CSV Disconnect Fix** | `app/api/reports/host/[weddingId]/route.ts` | **MOVE** | Update export handler to serialize Event Hub `TravelDetail.dietaryRequirements` instead of static profile strings. |
| **Emergency SOS Helpline Trigger** | `app/dashboard/events/[bookingId]/page.tsx` | **ADD** | Add 24/7 dedicated WhatsApp Concierge & Emergency Coordinator button to the confirmed Event Hub header. |

---

### Section J: Missing Features Inventory

#### 1. Essential Features (P0 – P1): Critical Blockers for Trust & Conversion

| ID | Priority | Feature Name | Problem Solved | Target User | Architectural Touchpoints |
|---|---|---|---|---|---|
| **MF-01** | **P0** | **Structured Dietary & Medical Allergen Selector** | Eliminates severe allergy risks by replacing free-text with structured multi-select chips (Strict Veg, Vegan, Jain, Halal, Celiac, Tree Nut, Peanut, Lactose, Spice level). | Foreign Traveler & Host Caterer | `TravelerProfile`, `BookingGuest`, `TravelDetail`, `app/onboarding`, `ClientEventHubForm.tsx`, `app/api/reports/host` |
| **MF-02** | **P0** | **Multi-Guest Attendee Manifest Capture** | Solves catering and gate pass blindspots when 2–10 seats are booked under a single reservation. | Group Travelers & Gate Security | `BookingGuest` schema, `BookingSidebar.tsx`, `ClientEventHubForm.tsx`, `GuestPass` |
| **MF-03** | **P1** | **Live Multi-Currency Expansion (GBP, AUD, CAD, SGD, AED)** | Removes currency friction for UK, Australian, Canadian, and Gulf travelers; eliminates static FX rate drift. | International Diaspora & Tourists | `lib/currency.ts`, `lib/services/pricing-engine.ts`, `Navbar.tsx`, Currency Context |
| **MF-04** | **P1** | **Inline Checkout Cancellation & Escrow Protection Drawer** | Increases checkout conversion by explicitly assuring travelers of 90%/70%/40% refund rules and platform escrow holding. | Foreign Traveler | `BookingSidebar.tsx`, `StickyBookingCard.tsx`, `cancellation-policy.ts` |
| **MF-05** | **P1** | **Database-Audited Verification Badge Binding** | Restores trust integrity by binding the green "Verified Host" badge strictly to approved database verification records. | Marketplace Buyers | `lib/wedding-dto.ts`, `prisma.verification`, `QualityBadge`, `WeddingCard.tsx` |

#### 2. Important Features (P2): High-Value UX & Operational Tooling

| ID | Priority | Feature Name | Problem Solved | Target User | Architectural Touchpoints |
|---|---|---|---|---|---|
| **MF-06** | **P2** | **Unified Trust & Safety Portal** | Eliminates 27+ fragmented legal pages by consolidating terms, privacy, and incident reporting into a single 3-tab hub. | All Users | `app/trust/page.tsx`, `app/safety/page.tsx`, `Footer.tsx` |
| **MF-07** | **P2** | **Bilingual Local Coordinator Checkout Add-on** | Allows anxious travelers to explicitly book an English-speaking on-ground liaison during checkout. | Solo / Anxious Travelers | `CoordinatorProfile`, `BookingSidebar.tsx`, `pricing-engine.ts` |
| **MF-08** | **P2** | **Dynamic Homepage Review Carousel** | Replaces empty static testimonial array with top 5-star verified reviews from the PostgreSQL database. | Homepage Visitors | `components/home/Testimonials.tsx`, `prisma.review`, `lib/actions/discovery.ts` |
| **MF-09** | **P2** | **Airport Transfer & Chauffeur Logistics Form** | Upgrades the simple `transportRequired` checkbox into a flight number, airport terminal, and pickup schedule tracker. | International Guests & Hosts | `TravelDetail` model, `ClientEventHubForm.tsx`, `app/dashboard/operations` |
| **MF-10** | **P2** | **Host Dietary Reconciliation Dashboard View** | Displays aggregated dietary requirements (e.g. "3 Jain, 2 Nut-Free, 1 Celiac") directly on the host operations dashboard. | Host Family & Caterers | `app/dashboard/operations/page.tsx`, `app/dashboard/celebrations` |

#### 3. Strategic Features (P3 – P4): Long-Term Scale & Partner Integrations

| ID | Priority | Feature Name | Problem Solved | Target User | Architectural Touchpoints |
|---|---|---|---|---|---|
| **MF-11** | **P3** | **Integrated eSIM & Travel Connectivity Partner** | Solves first-day connectivity anxiety by offering instant Airalo/Holafly eSIM activation in the Event Hub. | Foreign Traveler | Event Hub, Partner APIs, `TravelDetail` |
| **MF-12** | **P3** | **Solo Female Traveler Verified Host Filter** | Allows solo female travelers to filter specifically for host families with verified female liaisons and private room accommodations. | Female Solo Travelers | Discovery Filters, `WeddingCard.tsx`, `searchWeddingsAction` |
| **MF-13** | **P4** | **Traditional Attire Rental & Tailoring Concierge** | Solves dress code anxiety by connecting confirmed guests with local Kurta/Lehenga rental services in the wedding city. | Confirmed Travelers | Event Hub Preparation Tab, Local Vendor Directory |
| **MF-14** | **P4** | **Automated Flight Delay & Schedule Rescheduling Alerts** | Automatically alerts hosts and coordinators when an international traveler's flight is delayed. | Logistics Coordinators | FlightAware/AviationStack Webhooks, `WeddingAnnouncement` |

---

## 5. Verification Method

To independently verify all findings and evidence cited in this report:

1. **Verify Badge Decoupling**:
   - Inspect `lib/wedding-dto.ts` line 228. Confirm that `isVerified` evaluates to `true` whenever `rawWedding.status === "PUBLISHED"`.
   - Inspect `components/wedding/WeddingCard.tsx` lines 238–242 and `app/weddings/[slug]/page.tsx` lines 188–193 to confirm the green `ShieldCheck` is rendered solely based on `wedding.isVerified`.
2. **Verify Currency Limitations & Static FX**:
   - Inspect `lib/currency.ts` lines 5–9 and `components/layout/Navbar.tsx` lines 39–41. Confirm only `INR`, `USD`, and `EUR` exist, with hardcoded multipliers `95.50` and `108.00`.
3. **Verify Dietary Disconnect**:
   - Inspect `app/onboarding/page.tsx` lines 307–316 to confirm free-text input for `foodPreferences`.
   - Inspect `app/api/reports/host/[weddingId]/route.ts` line 46 to confirm CSV export reads `b.traveler.foodPreferences` rather than `b.travelDetails.dietaryRequirements`.
4. **Verify Testimonials Empty Array**:
   - Inspect `lib/data.ts` line 2232 (`export const testimonials: Testimonial[] = [];`).
   - Inspect `app/page.tsx` line 15 & line 73 and `components/home/Testimonials.tsx` lines 10 & 114 to confirm the fallback banner is permanently triggered.
5. **Verify 27+ Policy Page Fragmentation**:
   - Inspect `app/` directory routes matching `terms`, `privacy`, `acceptable-use`, `booking-terms`, `cancellation-policy`, etc.
