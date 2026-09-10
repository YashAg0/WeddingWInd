# BRIEFING — 2026-08-30T04:35:00Z

## Mission
Investigate FIN-01 (Native Multi-Currency Engine) for Milestone 2: expand `lib/currency.ts` to support GBP, AUD, CAD, SGD, AED alongside USD, EUR, INR, design Navbar currency selector, and ensure display estimates update cleanly across pricing components while strictly preserving authoritative INR transaction pricing and settlement in Stripe/Razorpay.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Read-only investigation, codebase analysis, multi-currency engine architecture design
- Working directory: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\m2_explorer_currency
- Original parent: 2bef5307-2898-47cb-b043-393c117215ef
- Milestone: Milestone 2 (Phase 2: Multi-Currency Engine - FIN-01)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in source code
- Strictly preserve authoritative INR transaction pricing and settlement in Stripe/Razorpay
- Output 5-component handoff report to `handoff.md`

## Current Parent
- Conversation ID: 2bef5307-2898-47cb-b043-393c117215ef
- Updated: 2026-08-30T04:35:00Z

## Investigation State
- **Explored paths**:
  - `lib/currency.ts` (lines 1–66: static 3-currency set INR/USD/EUR and FX_RATES)
  - `context/CurrencyContext.tsx` (lines 1–62: CurrencyProvider mounted in app/layout.tsx:237, localStorage `wwi_user_currency_pref`)
  - `components/layout/Navbar.tsx` (lines 39–41, 110–162, 551–587, 811–818: 3-item segmented slider)
  - `lib/constants/financial-model.ts` (lines 37–40: FX_RATES USD/EUR, PLANNING_FX_USD_INR = 95.50)
  - `lib/services/pricing-engine.ts` (lines 80–183: CUSTOMER_PRICE_MATRIX_USD, HOST_PAYOUT_MATRIX_INR, AGENT_PAYOUT_MATRIX_INR)
  - `lib/wedding-dto.ts` (lines 77–84: toWeddingDTO deriving customer price USD)
  - `components/wedding/WeddingCard.tsx` (lines 50–53, 300–305: hardcoded $ displayPriceUSD)
  - `components/wedding/BookingSidebar.tsx` (lines 25, 36, 144, 203–214: USD price rendering and booking action trigger)
  - `components/wedding/StickyBookingCard.tsx` (lines 22, 59–66: mobile USD pricing)
  - `components/dashboard/BookingCard.tsx` (lines 31, 205: formatPrice usage)
  - `components/dashboard/WishlistCard.tsx` (lines 21, 51: formatPrice usage)
  - `lib/actions/index.ts` (lines 559–719: createBookingAction server-authoritative pricing derivation with SELECT FOR UPDATE)
  - `app/api/webhooks/stripe/route.ts` (lines 1–368: Stripe webhook idempotent handling)
  - `lib/actions/payment-manual.ts` & `lib/services/payments.ts` (PayPal payment workflows)
  - `app/api/invoice/[bookingId]/route.ts` (lines 13–18, 120–133: invoice formatting)

- **Key findings**:
  1. `lib/currency.ts` only declares `Currency = "INR" | "USD" | "EUR"`, with hardcoded rates `USD: 95.50`, `EUR: 108.00`. Lacks `GBP`, `AUD`, `CAD`, `SGD`, `AED`.
  2. `Navbar.tsx` implements a 3-button segmented slider `w-[180px]` with `calc((100% - 0.5rem)/3)` that breaks when expanded to 8 currencies. Requires a modern grid/popover selector with currency metadata (flag, symbol, code, label).
  3. `CurrencyContext.tsx` is already globally mounted in `app/layout.tsx:237`, but checks `["INR", "USD", "EUR"].includes(stored)` in localStorage. Needs expansion to all 8 currencies and additional helper `formatPriceFromUSD`.
  4. Pricing components (`WeddingCard`, `BookingSidebar`, `StickyBookingCard`) hardcode `$` or USD without consuming `useCurrency()` for display estimates.
  5. Critical Invariant: `createBookingAction` in `lib/actions/index.ts` derives pricing 100% server-side via `calculateBookingPricing()`, rejecting client price parameters. Host payouts (`HOST_PAYOUT_MATRIX_INR`) and agent payouts (`AGENT_PAYOUT_MATRIX_INR`) are fixed INR amounts. Expanding display currencies will NOT affect backend settlement integrity.

- **Unexplored areas**: None. All relevant modules, context providers, components, and action workflows have been fully audited.

## Key Decisions Made
- Formulated concrete design for `lib/currency.ts` expansion to 8 currencies with robust FX rates, metadata, locale-aware formatting, and comprehensive browser locale detection.
- Designed 8-currency selector for `Navbar.tsx` (2-column/4x2 popover for desktop, responsive grid for mobile drawer).
- Designed non-breaking extensions for `CurrencyContext.tsx` and proposed reusable `PriceDisplay.tsx` component.
- Documented strict transaction invariant preservation for Stripe/Razorpay/PayPal and PostgreSQL booking tables.

## Artifact Index
- DISPATCH.md — Initial dispatch instructions
- BRIEFING.md — Persistent context & situational awareness
- progress.md — Liveness & task execution status
- handoff.md — Comprehensive 5-component handoff report
