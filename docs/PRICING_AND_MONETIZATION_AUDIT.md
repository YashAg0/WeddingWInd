# WEDDINGWITHINDIA — MASTER PRICING, MONETIZATION & PAYOUT FORENSIC AUDIT

**Platform:** WeddingWithIndia  
**Audit Purpose:** Comprehensive Pre-Implementation Forensic Audit of Pricing, Monetization, Payouts, Tiers, Durations, and UX Exposure  
**Date:** August 18, 2026  
**Audited By:** Principal Software Architect & Financial Systems Auditor  
**Status:** COMPLETE AUDIT ONLY (Zero Code/Database Modifications Made)  

---

## 1. Executive Summary

This forensic audit investigates every file, schema model, database field, server action, API route, calculation utility, and customer-facing UI component related to pricing, payments, host earnings, agent commissions, currency conversion, wedding durations, experience tiers, and checkout.

### Primary Architectural Findings:
1. **Decentralized & Inconsistent Pricing Sources:**
   - Pricing is currently fragmented across multiple conflicting locations: `Wedding.pricePerGuest` in PostgreSQL, hard-coded `PRICING_TIERS` in `lib/constants/financial-model.ts`, local multiplier state (`1.35x` and `2.0x`) in `BookingSidebar.tsx` and `StickyBookingCard.tsx`, and `for-couples/page.tsx` illustrative tiers.
2. **Currency Ambiguity:**
   - The database stores numeric floats without strict currency tagging on `Wedding.pricePerGuest`. In `lib/data.ts`, prices are labeled `currency: "USD"` with numbers like `17999` (which are INR figures in reality). `CurrencyContext` assumes all inputs are INR and divides by static exchange rates (`USD = 95.50`, `EUR = 108.00`).
3. **Host Payout Discrepancy:**
   - `lib/constants/financial-model.ts` assumes a **78% host allocation / 22% platform share** model.
   - `app/for-couples/page.tsx` hard-codes a **72% illustrative host share**.
   - Neither aligns with the planned **fixed INR per-guest payout structure**.
4. **Agent Commission Discrepancy:**
   - `lib/constants/financial-model.ts` defines tier-based fixed referral amounts (Budget: ₹500, Premium: ₹900, VIP: ₹1800).
   - `SystemConfig.agentCommissionPercent` defaults to `10.0%`.
   - `lib/actions/referrals.ts` calculates commissions from percentages.
5. **Customer Price Exposure on Homepage:**
   - `components/wedding/WeddingCard.tsx` directly renders `{formatPrice(displayPriceINR).primary} / guest` in its pinned card footer, exposing prices on the homepage via `FeaturedWeddings.tsx`.
6. **Stripe Residual References:**
   - Active runtime Stripe packages were previously removed, but legacy schema fields (`stripePaymentIntentId`, `stripeChargeId`, `stripeAccountId`, `stripeRefundId`, `stripeTransferId`) and legacy helper text remain in various admin and earnings components.

---

## 2. Section A: Current Pricing & Payment Architecture

### How Pricing & Bookings Currently Operate:
```
1. HOST CREATES WEDDING
   - Enters `pricePerGuest` in Admin/Host Form (e.g. 16,000).
   - Saved directly to `Wedding.pricePerGuest` (Float) in PostgreSQL.

2. TRAVELLER DISCOVERS WEDDING
   - Homepage `FeaturedWeddings.tsx` -> `WeddingCard.tsx` displays `{formatPrice(wedding.pricePerGuest)}`.
   - Detail Page `/weddings/[slug]` renders `BookingSidebar.tsx` & `StickyBookingCard.tsx`.
   - Client UI offers 3 synthetic tiers:
     * BUDGET: basePriceINR (e.g. ₹16,000)
     * PREMIUM: basePriceINR * 1.35 (e.g. ₹21,600)
     * VIP: basePriceINR * 2.0 (e.g. ₹32,000)
   - Traveller selects Tier, Side, and Guests Count.

3. BOOKING CREATION (`createBookingAction` in `lib/actions/index.ts`)
   - Client submits `{ weddingId, guestsCount, attendanceSide }`.
   - SERVER-AUTHORITATIVE INVARIANT: The server completely ignores the client tier selection and derives price strictly as:
     `serverPricePerGuest = wedding.pricePerGuest`
     `serverTotalAmount = serverPricePerGuest * data.guestsCount`
   - Saved to `Booking.pricePerGuest` and `Booking.totalAmount`. Status -> `PENDING`.
   * DISCREPANCY: If a traveller selected "VIP (2.0x)" on the UI, the booking is recorded at 1.0x base price!

4. ADMIN PAYMENT REQUEST (`adminRequestPaymentAction` in `lib/actions/payment-manual.ts`)
   - Admin reviews booking and inputs/confirms base amount (defaulting to `Booking.totalAmount`).
   - Surcharge fee (3.5%) is calculated: `processingFeeAmount = (base * 3.5%)`.
   - Total amount: `totalAmount = baseAmount + processingFeeAmount`.
   - Admin attaches PayPal HTTPS link and submits.
   - Status -> `AWAITING_PAYMENT`.

5. TRAVELLER PAYMENT & ADMIN CONFIRMATION (`adminMarkPaymentPaidAction`)
   - Traveller pays externally via PayPal.
   - Admin enters verified PayPal Transaction ID.
   - Atomic mutation: `Payment.status = PAID`, `Booking.status = PAID`, single `GuestPass` generated, Agent `Commission` generated.
```

---

## 3. Section B: Stripe Dependency Map

| Category | File Location | Existing Reference | Planned Action in Next Phase |
| :--- | :--- | :--- | :--- |
| **Prisma Schema** | `prisma/schema.prisma` | `CoupleProfile.stripeAccountId`, `CoupleProfile.stripeOnboardingComplete` | Deprecate / Make Nullable Legacy |
| **Prisma Schema** | `prisma/schema.prisma` | `AgentProfile.stripeAccountId`, `AgentProfile.stripeOnboardingComplete` | Deprecate / Make Nullable Legacy |
| **Prisma Schema** | `prisma/schema.prisma` | `Payment.stripePaymentIntentId`, `Payment.stripeChargeId` | Preserve for historical records |
| **Prisma Schema** | `prisma/schema.prisma` | `Refund.stripeRefundId`, `Payout.stripeTransferId` | Preserve for historical records |
| **Prisma Schema** | `prisma/schema.prisma` | `model PaymentIntent`, `model StripeWebhookEvent` | Deprecate / Retain for schema stability |
| **Admin UI** | `app/dashboard/admin/analytics/page.tsx:85,97` | Helper text: "pay Stripe invoices", "issue Stripe refunds" | Replace text with "PayPal payments" / "Manual refunds" |
| **Admin UI** | `app/dashboard/page.tsx:923-979` | `stripeFees = totalVolume * 0.029 + 0.3`, "Stripe Settlement Statistics" | Replace with WWI Contribution & Payout Telemetry |
| **Agent Payouts** | `app/dashboard/earnings/ClientPayoutForm.tsx:13,104` | `<option value="STRIPE_CONNECT">Stripe Connect Instant Payout</option>` | Replace with Bank Transfer / UPI / PayPal |
| **Agent Actions** | `lib/actions/referrals.ts:30` | `z.enum(["BANK_TRANSFER", "STRIPE_CONNECT", "MANUAL"])` | Update validation enum |
| **Guest Journey** | `components/diagrams/GuestJourneyDiagram.tsx:22` | "Payments are protected and processed via Stripe Checkout." | Replace text with "Secure External Payment & Verified Guest Pass" |
| **Invoices** | `app/api/invoice/[bookingId]/route.ts:93` | Fallback: `paidPayment?.stripePaymentIntentId` | Retain as fallback for historical invoices |

---

## 4. Section C: Pricing Dependency Map

| File Path | Lines | Current Hardcoded / Calculated Logic |
| :--- | :---: | :--- |
| `lib/constants/financial-model.ts` | 7–10 | `FX_RATES = { USD: 95.50, EUR: 108.00 }` |
| `lib/constants/financial-model.ts` | 24–74 | `PRICING_TIERS` (BUDGET: ₹9,000, PREMIUM: ₹16,000, VIP: ₹30,000) |
| `lib/constants/financial-model.ts` | 82–96 | `COMMISSION_MODEL` (Platform 22%, Host 78%, Agent payouts: ₹500, ₹900, ₹1800) |
| `lib/constants/financial-model.ts` | 137–170 | `calculateBookingFinancials()` using 22% platform / 78% host split |
| `lib/currency.ts` | 5–9 | `FX_RATES: Record<Currency, number>` |
| `lib/currency.ts` | 20–45 | `convertFromINR()`, `formatCurrencyAmount()` |
| `context/CurrencyContext.tsx` | 43–50 | `formatPrice(amountINR)` formatting primary & secondary currency strings |
| `components/wedding/BookingSidebar.tsx` | 28 | `const basePriceINR = wedding.pricePerGuest \|\| 12000;` |
| `components/wedding/BookingSidebar.tsx` | 68–88 | `dynamicTiers` with synthetic multipliers (`1.0x`, `1.35x`, `2.0x`) |
| `components/wedding/StickyBookingCard.tsx` | 25, 36–56 | Duplicate `dynamicTiers` multipliers (`1.0x`, `1.35x`, `2.0x`) |
| `components/wedding/WeddingCard.tsx` | 47, 313–322 | `displayPriceINR = wedding.pricePerGuest \|\| PRICING_TIERS.PREMIUM.priceINR` and bottom card footer |
| `app/for-couples/page.tsx` | 89–125 | Host calculator: `illustrativeHostShare = 0.72`, Tiers: ₹10k, ₹16k, ₹32k |
| `lib/actions/index.ts` | 615–617 | `serverPricePerGuest = wedding.pricePerGuest`, `serverTotalAmount = serverPricePerGuest * guestsCount` |
| `lib/actions/payment-manual.ts` | 32–93 | Payment request breakdown with 3.5% fee surcharge |
| `lib/services/payments.ts` | 87–107 | `calculatePaymentBreakdown()` calculating 3.5% fee on top of base amount |
| `app/dashboard/page.tsx` | 445 | `sum + b.pricePerGuest * b.guestsCount` |

---

## 5. Section D: Host Payout Dependency Map

| File Path | Component / Field | Existing Behavior |
| :--- | :--- | :--- |
| `prisma/schema.prisma:419` | `Payment.payouts`, `model Payout` | Relational table originally created for Stripe Connect transfers |
| `prisma/schema.prisma:391` | `Payment.hostPayoutTransferred` | Boolean flag indicating whether host payout was settled |
| `lib/constants/financial-model.ts:84` | `HOST_ALLOCATION_PERCENT: 78` | Calculates host share as 78% of gross booking |
| `app/for-couples/page.tsx:102` | `illustrativeHostShare = 0.72` | Calculates host share as 72% of gross booking |
| `app/dashboard/admin/hosts/[id]/page.tsx:192` | Host Detail UI | Displays `wedding.pricePerGuest` |
| `app/dashboard/admin/hosts/page.tsx:319` | Host Roster UI | Displays `app.pricePerGuest / guest` |
| `app/dashboard/celebrations/page.tsx` | Host Celebrations UI | Displays gross attendee booking counts |

---

## 6. Section E: Agent Payout Dependency Map

| File Path | Logic / Field | Existing Behavior |
| :--- | :--- | :--- |
| `lib/actions/referrals.ts:539-675` | `generateBookingCommissionAction` | Accrues commission on payment confirmation |
| `lib/actions/referrals.ts:198-213` | `settleMaturedCommissionsAction` | 14-day hold on `Commission.status = PENDING -> APPROVED` |
| `lib/actions/referrals.ts:218-265` | `submitPayoutRequestAction` | Agent requests payout for approved commissions (min $50) |
| `lib/actions/referrals.ts:680-730` | `reverseBookingCommissionAction` | Reverses commission if booking is refunded |
| `lib/constants/financial-model.ts:85-88` | `AGENT_REFERRAL_PAYOUT_*` | Budget ₹500, Premium ₹900, VIP ₹1800, Default ₹1000 |
| `prisma/schema.prisma:1365` | `SystemConfig.agentCommissionPercent` | Configurable percentage (default 10.0%) |
| `app/dashboard/earnings/ClientPayoutForm.tsx` | Agent Payout Form | Payout request submission UI |
| `app/dashboard/admin/finance/page.tsx` | Admin Finance Payout UI | Admin approves agent payout requests |

---

## 7. Section F: Customer Price Visibility Map

| Page / Component | URL / Location | Price Element Rendered | Target Change in Next Phase |
| :--- | :--- | :--- | :--- |
| **Homepage Featured** | `components/home/FeaturedWeddings.tsx` -> `WeddingCard.tsx` | `₹{displayPriceINR} / guest` in card bottom | **REMOVE PRICE FROM HOMEPAGE** (Display Days / Ceremonies / Highlights instead) |
| **Wedding Listings** | `app/weddings/page.tsx` -> `WeddingCard.tsx` | `₹{displayPriceINR} / guest` | Show clean USD / INR price based on centralized tier |
| **Wedding Map** | `app/weddings/map/page.tsx` -> Map Pins & Cards | `pricePerGuest` in map callout | Show clean tier price |
| **Wedding Detail** | `app/weddings/[slug]/page.tsx` -> `BookingSidebar.tsx` | Tier list & Subtotal breakdown | Centralized price based on Wedding Tier & Duration |
| **Mobile Detail** | `components/wedding/StickyBookingCard.tsx` | Bottom sticky bar "From ₹X/guest" | Centralized price based on Wedding Tier & Duration |
| **Wishlist** | `components/dashboard/WishlistCard.tsx` | `formatPrice(wedding.pricePerGuest)` | Centralized tier price |
| **Traveler Bookings** | `components/dashboard/BookingCard.tsx` | `Total: $X USD` / `₹X INR` | Display clean total without PayPal surcharge |
| **Payment Details Modal**| `components/dashboard/PaymentDetailsModal.tsx` | Base + Fee Surcharge + Total | Display single clean WeddingWithIndia all-inclusive total |
| **Invoice PDF/HTML** | `app/api/invoice/[bookingId]/route.ts` | Unit Rate & Total Amount | Centralized line items |
| **Admin Bookings** | `app/dashboard/admin/bookings/page.tsx` | `booking.totalAmount` | Standardized total |
| **Admin Payments** | `app/dashboard/admin/payments/page.tsx` | Base, Fee, Total | Updated payment record manager |

---

## 8. Section G: Database Impact & Schema Readiness

To support the centralized pricing engine and fixed payouts, the following Prisma schema updates will be required in the next implementation phase:

### Planned Model Enhancements:
1. **`model Wedding`**:
   - `tier`: String @default("STANDARD") (Values: `STANDARD`, `ENHANCED`, `GRAND`, `ROYAL`, `SIGNATURE_ROYAL`)
   - `durationDays`: Int @default(1) (Range: 1 to 5 days)
   - `experienceIntensity`: String @default("TRADITIONAL")
   - `ceremoniesCount`: Int @default(3)
   - `pricePerGuest`: Retained as effective customer price per guest (or derived via engine)
2. **`model Booking`**:
   - `weddingTier`: String?
   - `durationDays`: Int @default(1)
   - `pricePerGuest`: Float (centrally calculated USD amount)
   - `totalAmount`: Float (centrally calculated USD amount = `pricePerGuest * guestsCount`)
   - `currency`: String @default("USD")
   - `hostPayoutPerGuestINR`: Float? (fixed INR payout rate locked at booking time)
   - `agentPayoutPerGuestINR`: Float? (fixed INR payout rate locked at booking time)
   - `totalHostPayoutINR`: Float? (`hostPayoutPerGuestINR * guestsCount`)
   - `totalAgentPayoutINR`: Float? (`agentPayoutPerGuestINR * guestsCount`)
3. **`model Payment`**:
   - `cleanCustomerPriceUSD`: Float?
   - `provider`: `MANUAL_PAYPAL`
4. **`model Commission`**:
   - `commissionAmount`: Float (fixed INR amount based on tier)
   - `currency`: String @default("INR")

---

## 9. Section H: Admin Impact

Every Admin control that will interact with the new pricing engine:
1. **`/dashboard/admin/weddings` (Creation & Editing)**:
   - Admin assigns **Wedding Tier** (`Standard`, `Enhanced`, `Grand`, `Royal`, `Signature Royal`) and **Duration** (`1` to `5` days).
   - System automatically displays the **Customer Price ($USD)**, **Host Payout (₹INR)**, and **Agent Payout (₹INR)** without requiring manual price typing!
2. **`/dashboard/admin/payments`**:
   - Clean payment requests generated with zero customer-facing PayPal fee surcharges.
3. **`/dashboard/admin/finance`**:
   - Telemetry showing Total Customer Revenue ($USD), Total Host Payout Liabilities (₹INR), Total Agent Commissions (₹INR), and Net WWI Contribution ($USD / ₹INR).
4. **`/dashboard/admin/settings`**:
   - Configuration panel for global pricing engine matrices.

---

## 10. Section I: Customer UX Impact

1. **Homepage (`app/page.tsx`)**:
   - **CRITICAL UPDATE:** Remove price numbers from homepage `FeaturedWeddings.tsx` / `WeddingCard.tsx`.
   - Card displays: Cultural Category, Location, Duration (e.g. `3 Days`), Ceremonies (e.g. `5 Ceremonies`), and "View Experience" CTA.
2. **Wedding Details (`app/weddings/[slug]/page.tsx`)**:
   - Displays clear Wedding Tier badge (e.g. `Grand Celebration • 3 Days`).
   - Displays clean, authoritative price per guest in USD (with optional INR reference in selector).
   - Selector allows choosing number of guests, immediately calculating clean total.
3. **Host Onboarding & Calculator (`app/for-couples/page.tsx`)**:
   - Modernized Host Earnings Calculator:
     * Default State: **Signature Royal**, **4 Days**, **20 International Guests**
     * Headline: **₹10,22,020** (₹51,101 × 20 guests)
     * Dropdowns / sliders for Tier (`Standard` to `Signature Royal`), Duration (`1` to `5` days), and Guest Count (`1` to `30`).
     * Prominent disclaimer stating earnings are potential estimates based on confirmed attending guests.

---

## 11. Section J: Risk & Invariant Report

| Risk Area | Risk Description | Prevention Strategy in Target Architecture |
| :--- | :--- | :--- |
| **Religion Discrimination** | Pricing varying based on religious faith. | **Strictly Forbidden:** Pricing engine depends purely on objective factors: `Tier`, `Duration (Days)`, `Ceremonies Count`, `Experience Intensity`. |
| **Client Price Tampering** | Malicious client injecting custom prices. | `createBookingAction` derives price 100% server-side from `getCentralizedPricing(tier, durationDays)`. |
| **Rounding & FX Drift** | Floating point math creating currency mismatches. | Customer pricing is defined in exact USD integers; Host & Agent payouts are defined in exact INR integers. |
| **Double Payout / Overdraft** | Multiple payouts for the same booking. | Unique database constraints on `payoutRequestId` and atomic transaction ledger entries. |
| **Host/Agent Percentage Drift** | Margin compression due to percentage calculations. | Fixed INR payouts guarantee exact predictable costs per guest regardless of discounts or fee variations. |

---

## 12. Section K: Recommended Target Architecture

### The Centralized Pricing Engine (`lib/services/pricing-engine.ts`)

```ts
/**
 * Centralized WeddingWithIndia Pricing Engine
 * Single Source of Truth for Customer Pricing, Host Payouts, and Agent Commissions.
 */

export type WeddingTier = "STANDARD" | "ENHANCED" | "GRAND" | "ROYAL" | "SIGNATURE_ROYAL";
export type WeddingDurationDays = 1 | 2 | 3 | 4 | 5;

export interface CentralizedPricingResult {
  tier: WeddingTier;
  tierLabel: string;
  durationDays: WeddingDurationDays;
  customerPriceUSD: number;
  hostPayoutPerGuestINR: number;
  agentPayoutPerGuestINR: number;
  wwiGrossContributionUSD: number;
}

// 1. Customer Pricing Matrix (USD per guest)
export const CUSTOMER_PRICE_MATRIX_USD: Record<WeddingTier, Record<WeddingDurationDays, number>> = {
  STANDARD:        { 1: 149, 2: 199, 3: 249, 4: 299, 5: 349 },
  ENHANCED:        { 1: 179, 2: 249, 3: 299, 4: 349, 5: 399 },
  GRAND:           { 1: 229, 2: 329, 3: 449, 4: 549, 5: 649 },
  ROYAL:           { 1: 299, 2: 449, 3: 649, 4: 799, 5: 949 },
  SIGNATURE_ROYAL: { 1: 399, 2: 799, 3: 999, 4: 999, 5: 1199 },
};

// 2. Fixed Host Payout Matrix (INR per guest)
export const HOST_PAYOUT_MATRIX_INR: Record<WeddingTier, Record<WeddingDurationDays, number>> = {
  STANDARD:        { 1: 5101,  2: 7101,  3: 9101,  4: 11101, 5: 13101 },
  ENHANCED:        { 1: 7101,  2: 10101, 3: 13101, 4: 16101, 5: 19101 },
  GRAND:           { 1: 10101, 2: 15101, 3: 20101, 4: 27101, 5: 32101 },
  ROYAL:           { 1: 15101, 2: 22101, 3: 32101, 4: 41101, 5: 51101 },
  SIGNATURE_ROYAL: { 1: 20101, 2: 30101, 3: 41101, 4: 51101, 5: 61101 },
};

// 3. Fixed Agent Payout Matrix (INR per guest)
export const AGENT_PAYOUT_MATRIX_INR: Record<WeddingTier, number> = {
  STANDARD:        511,
  ENHANCED:        1011,
  GRAND:           1511,
  ROYAL:           2011,
  SIGNATURE_ROYAL: 2511,
};
```

---

## 13. Section L: Exact Implementation Checklist for Next Prompt

### Step 1: Centralized Engine Creation
- [ ] Create `lib/services/pricing-engine.ts` with complete matrices, tier labels, validation functions, and calculations.
- [ ] Add unit tests in `__tests__/lib/pricing-engine.test.ts` verifying all 25 tier/duration matrix permutations and margins.

### Step 2: Database Schema & Migration
- [ ] Update `prisma/schema.prisma` with `tier`, `durationDays`, and `experienceIntensity` on `Wedding` and `Booking`.
- [ ] Apply non-destructive migration script.

### Step 3: Server Action Updates
- [ ] Update `lib/actions/index.ts` (`createBookingAction`) to derive pricing via `getCentralizedPricing(wedding.tier, wedding.durationDays)`.
- [ ] Update `lib/actions/payment-manual.ts` (`adminRequestPaymentAction`) to issue all-inclusive clean payments without separate PayPal fee surcharge.
- [ ] Update `lib/actions/referrals.ts` (`generateBookingCommissionAction`) to use fixed tier INR payouts from `AGENT_PAYOUT_MATRIX_INR`.

### Step 4: UI & Customer Experience Updates
- [ ] Update `components/wedding/WeddingCard.tsx` to support `hidePrice` prop (omitting price on Homepage `FeaturedWeddings.tsx` and displaying Days & Highlights instead).
- [ ] Update `components/wedding/BookingSidebar.tsx` and `StickyBookingCard.tsx` to consume centralized pricing without synthetic multipliers.
- [ ] Update `app/for-couples/page.tsx` with the new Host Calculator (Default: Signature Royal, 4 Days, 20 Guests = ₹10,22,020).
- [ ] Update `app/dashboard/earnings/ClientPayoutForm.tsx` and `app/dashboard/admin/finance/page.tsx`.

### Step 5: Regression & Verification Suite
- [ ] Run `tsc --noEmit`, `eslint`, `jest`, and `next build`.
