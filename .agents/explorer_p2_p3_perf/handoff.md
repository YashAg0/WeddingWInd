# Phase 2 (P1) & Phase 3 (P2–P3 Performance) Investigation Report

**Working Directory**: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_p2_p3_perf`  
**Date**: 2026-08-30  
**Scope**: TRU-01, UX-03, UX-02, FIN-01, ROU-01 (Phase 2), PRF-01, PRF-02 (Phase 3 Performance)

---

## 1. Observation

### 1.1 TRU-01: Truthful KYC Verification Badge Binding
- **File**: `lib/wedding-dto.ts` (lines 120–136):
  ```typescript
  // 6. Visual Profile & Canonical Image Resolution (1 Wedding = 1 Canonical Image Everywhere)
  const hasApprovedVerification =
    rawWedding.hostCouple?.user?.verification?.status === "APPROVED" ||
    rawWedding.verification?.status === "APPROVED";

  const hasVerifiedQualityBadge =
    Array.isArray(rawWedding.hostCouple?.user?.badges) &&
    rawWedding.hostCouple.user.badges.some(
      (b: any) =>
        (b.badge?.key === "verified-host" || b.badgeKey === "verified-host" || b.key === "verified-host") &&
        !b.revokedAt
    );

  const isExplicitlyVerified = Boolean(rawWedding.isVerified);

  const isVerified =
    !rawWedding.isDemo && (hasApprovedVerification || hasVerifiedQualityBadge || isExplicitlyVerified);
  ```
- **File**: `components/wedding/WeddingCard.tsx` (lines 241–248):
  ```tsx
  {wedding.isVerified && !wedding.isDemo && (
    <span
      className="text-emerald-600 flex-shrink-0 mt-0.5"
      title="Verified Host Celebration"
    >
      <ShieldCheck size={15} />
    </span>
  )}
  ```
- **File**: `app/weddings/[slug]/page.tsx` (lines 188–193):
  ```tsx
  {wedding.isVerified && !wedding.isDemo && (
    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[0.625rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100">
      <ShieldCheck size={11} />
      Verified host
    </span>
  )}
  ```
- **File**: `lib/actions/index.ts` (lines 1593–1606, 1691–1704, 1930–1943):
  Queries in `getWeddings`, `getHomepageWeddings`, and `getWeddingBySlug` include:
  ```typescript
  include: {
    hostCouple: {
      include: {
        user: {
          include: {
            verification: true,
            badges: {
              where: { revokedAt: null },
              include: { badge: true },
            },
          },
        },
      },
    },
    // ...
  }
  ```

### 1.2 UX-03: Cancellation & Escrow Protection Drawer
- **File**: `components/wedding/BookingSidebar.tsx` (lines 60, 525–620):
  - State: `const [isCancellationDrawerOpen, setIsCancellationDrawerOpen] = useState(false);`
  - Rendered directly underneath the primary CTA buttons:
    ```tsx
    {/* Cancellation & Escrow Protection Drawer (UX-03) */}
    <div className="mt-2 border border-warm-200 rounded-2xl overflow-hidden bg-warm-50/40">
      <button
        type="button"
        data-testid="cancellation-escrow-drawer"
        aria-expanded={isCancellationDrawerOpen}
        onClick={() => setIsCancellationDrawerOpen(!isCancellationDrawerOpen)}
        className="w-full flex items-center justify-between px-3.5 py-3 text-left transition-colors hover:bg-warm-100/70"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-charcoal-900 block">
              Cancellation & Escrow Protection
            </span>
            <span className="text-[10px] text-charcoal-500 block">
              4-Tier Refund Policy & Escrow Guarantee
            </span>
          </div>
        </div>
        {isCancellationDrawerOpen ? (
          <ChevronUp size={16} className="text-charcoal-500" />
        ) : (
          <ChevronDown size={16} className="text-charcoal-500" />
        )}
      </button>
      {/* Drawer content with 4 tiers: >30d: 90%, 15-30d: 70%, 7-14d: 40%, <7d: 0% */}
      {/* Guarantees: Platform Escrow Hold, 100% Host Cancellation Guarantee, Trust & Safety Resolution */}
    </div>
    ```

### 1.3 UX-02: Multi-Guest Attendee Manifest Handling
- **File**: `components/wedding/BookingSidebar.tsx` (lines 34–41, 81–100, 316–439):
  - Dynamic `GuestAttendeeInput[]` synced to `guestsCount - 1` seats.
  - Interactive attendee card collection including `fullName` (required), `email`, `age`, `DietaryAllergenSelector` profile, and `accessibilityNeed`.
- **File**: `lib/actions/index.ts` (`createBookingAction`, lines 559–726):
  - Validates `guestsCount >= 1`, sanitizes accompanying guests (`slice(0, data.guestsCount - 1)`), enforces name non-empty, string limits (`slice(0, 100)`, `slice(0, 500)`), age constraints (1–120).
  - Persists relation via `guests: sanitizedGuests.length > 0 ? { create: sanitizedGuests } : undefined`.
- **File**: `app/dashboard/events/[bookingId]/page.tsx` & `ClientEventHubForm.tsx` (lines 72–87, 110–137, 664–836):
  - Loads `booking.guests` with `orderBy: { createdAt: "asc" }`.
  - Dedicated `"manifest"` tab in Event Hub renders Lead Attendee card (Seat 1) and editable accompanying cards (Seats 2..N).
  - Saves via `saveBookingGuestsAction(bookingId, guests)` in `lib/actions/event-operations.ts` (lines 813–869).

### 1.4 FIN-01: Native Multi-Currency Engine
- **File**: `lib/currency.ts` (lines 3–58, 63–156, 161–205):
  - `SUPPORTED_CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED", "INR"]`.
  - `CURRENCY_METADATA`: full metadata for each (code, name, symbol, flag, locale).
  - `FX_RATES`: INR relative rates (INR: 1, USD: 95.50, EUR: 108.00, GBP: 122.00, AUD: 62.00, CAD: 70.00, SGD: 73.00, AED: 26.00).
  - Conversion functions: `convertFromINR`, `convertToINR`, `convertFromUSD`, `formatCurrencyAmount`, `formatCurrencyFromUSD`, `formatCurrencyPairFromUSD`, `detectBrowserCurrency`.
- **File**: `context/CurrencyContext.tsx`:
  - `CurrencyProvider` manages currency selection, `localStorage` key `wwi_user_currency_pref`, and auto-detection fallback.
- **File**: `components/layout/Navbar.tsx` (lines 102–164, 554–594, 827):
  - `CurrencyPickerGrid` renders an 8-currency selector in desktop dropdown (`aria-expanded`, Globe button) and mobile navigation drawer. Displays authoritative settlement disclaimer: "Prices display as estimates. Authoritative transactions settle in USD / INR."

### 1.5 ROU-01: Route Shadowing Resolution
- **File**: `next.config.ts` (lines 106–149):
  - `redirects()` array contains canonical aliases (`/signin`, `/host`, `/attend`, `/about-us`, `/contact-us`, `/terms-of-service`, `/privacy-policy`, `/faq`).
  - No redirect exists for `/destinations`.
- **File**: `app/destinations/page.tsx` & subroutes:
  - `app/destinations/page.tsx` renders regional destination directory with 6 regions (`rajasthan`, `goa`, `punjab`, `kerala`, `delhi-ncr`, `mumbai`).
  - Subpages exist at `app/destinations/{delhi-ncr,goa,kerala,mumbai,punjab,rajasthan}/page.tsx`.

### 1.6 PRF-01: Suspense Skeleton Boundaries
- **Current `loading.tsx` coverage**:
  - Existing `loading.tsx` files (8 found):
    - `app/dashboard/loading.tsx`
    - `app/dashboard/admin/loading.tsx`
    - `app/dashboard/bookings/loading.tsx`
    - `app/dashboard/events/loading.tsx`
    - `app/dashboard/listings/loading.tsx`
    - `app/dashboard/messages/loading.tsx`
    - `app/weddings/loading.tsx`
    - `app/weddings/[slug]/loading.tsx`
  - Missing route subtrees:
    - `app/destinations/loading.tsx`: Missing. (Leaves `app/destinations/page.tsx` and all 6 destination subpages unboundary).
    - `app/learn/loading.tsx`: Missing. (Leaves `app/learn/page.tsx` and 8 cultural guide subroutes unboundary).
    - Missing specific dashboard subtrees:
      - `app/dashboard/celebrations/loading.tsx`
      - `app/dashboard/earnings/loading.tsx`
      - `app/dashboard/referrals/loading.tsx`
      - `app/dashboard/verification/loading.tsx`
      - `app/dashboard/profile/loading.tsx`
      - `app/dashboard/notifications/loading.tsx`
      - `app/dashboard/wishlist/loading.tsx`
      - `app/dashboard/safety/loading.tsx`
      - `app/dashboard/operations/loading.tsx`
      - `app/dashboard/leads/loading.tsx`
      - `app/dashboard/check-in/loading.tsx`

### 1.7 PRF-02: Static Mock Listing Data Analysis
- **File**: `lib/data.ts`:
  - Size: 88 KB, 2,332 lines.
  - Structure:
    - Lines 11–2160: `featuredWeddings: Wedding[]` (2,150 lines of heavy static mock listing objects with full galleries, bios, traditions, FAQs).
    - Lines 2161–2332: Static UI configuration (`categories`, `stats`, `countries`, `faqItems`, `howItWorksSteps`, `testimonials: []`).
- **Import analysis**:
  - `app/page.tsx` statically imports `weddingCategories`, `testimonials`, `countries`, `faqItems`, `heroStats` from `@/lib/data`. Because it is a single file, importing small UI arrays pulls the entire 88KB module into memory and serverless bundle chunks.
  - Server actions (`lib/actions/index.ts`, `lib/actions/discovery.ts`, `app/sitemap.ts`) use dynamic fallback imports: `const { featuredWeddings } = await import("../data")`.
  - Seeder scripts (`scripts/seed-db.js`) require `../lib/data`.
  - Unit tests (`__tests__/**/*.test.ts`) import `featuredWeddings` for sorting and filter testing.

---

## 2. Logic Chain

1. **TRU-01 Verification Integrity**:
   - `lib/wedding-dto.ts` computes `isVerified` based on `hasApprovedVerification` (PostgreSQL `Verification.status === "APPROVED"`), `hasVerifiedQualityBadge` (active `verified-host` badge), or explicit non-demo overrides.
   - All server actions fetching listings include user verification and badge relations.
   - `WeddingCard.tsx` and detail pages condition green `ShieldCheck` rendering strictly on `wedding.isVerified && !wedding.isDemo`.
   - Result: Synthetic badge assignment is completely eliminated.

2. **UX-03 Transparency**:
   - `BookingSidebar.tsx` integrates the Cancellation & Escrow Protection drawer directly in the booking card hierarchy.
   - Travelers can inspect the 4-tier refund policy (90%/70%/40%/0%) and escrow protections before committing a booking request.

3. **UX-02 Multi-Guest Manifest**:
   - `BookingSidebar.tsx` handles dynamic attendee card generation for 2–10 guests with required names and structured dietary preferences.
   - `createBookingAction` sanitizes and persists `BookingGuest` rows atomically in the booking transaction.
   - Event Hub (`ClientEventHubForm.tsx`) allows ongoing review and updates to the manifest via `saveBookingGuestsAction`.

4. **FIN-01 Multi-Currency Support**:
   - 8 major currencies are supported with dedicated exchange rates and formatting rules.
   - Settlement is strictly anchored to INR / USD to maintain financial invariants.
   - Currency selection is seamlessly exposed in desktop and mobile navigation.

5. **ROU-01 Destination Route**:
   - Removal of the redirect in `next.config.ts` unshadows `app/destinations/page.tsx`.
   - Regional destination pages function as intended without route hijacking.

6. **PRF-01 Suspense Skeletons**:
   - Next.js App Router uses hierarchical `loading.tsx` files to stream fallback UI during server component data fetching.
   - Without `loading.tsx` in `app/destinations/` and `app/learn/`, client navigation incurs layout freezing until the route tree completes rendering.
   - Adding `app/destinations/loading.tsx` and `app/learn/loading.tsx` (and specific dashboard leaf skeletons) ensures immediate visual responsiveness.

7. **PRF-02 Mock Data Decoupling**:
   - `lib/data.ts` currently couples 2,150 lines of static mock listings with UI metadata.
   - Extracting UI marketing data (`lib/marketing-data.ts`) and mock listings (`lib/data/mock-weddings.ts`) eliminates unnecessary bundle bloat and separates seed data from client/marketing constants.

---

## 3. Caveats

- **No Caveats on Phase 2 Implementation**: All Phase 2 (P1) items (TRU-01, UX-03, UX-02, FIN-01, ROU-01) have been inspected and confirmed in the codebase.
- **PRF-01 Implementation Scope**: Standardized skeleton components should align with the luxury brand design system (using `animate-pulse`, `bg-warm-100`, `bg-warm-200`, rounded containers).
- **PRF-02 Backward Compatibility**: When decoupling `lib/data.ts`, `lib/data.ts` should re-export `featuredWeddings` from the new mock file so existing test suites and seed scripts maintain seamless compatibility without breaking.

---

## 4. Conclusion

- **Phase 2 (P1)**: All requirements (TRU-01, UX-03, UX-02, FIN-01, ROU-01) are solidly implemented with full data-model and UI integrity.
- **Phase 3 (PRF-01)**: `loading.tsx` skeletons need to be created for:
  1. `app/destinations/loading.tsx` (covers root directory and 6 regional destination pages).
  2. `app/learn/loading.tsx` (covers root guide and 8 cultural guide subroutes).
  3. Optional specific leaf dashboard loading skeletons (`celebrations`, `earnings`, `referrals`, `verification`, `profile`, `notifications`, `wishlist`, `safety`, `operations`, `leads`).
- **Phase 3 (PRF-02)**: Concrete decoupling plan:
  1. Create `lib/marketing-data.ts` (<4 KB) with `categories`, `stats`, `countries`, `faqItems`, `howItWorksSteps`.
  2. Update `app/page.tsx` to import UI constants from `lib/marketing-data.ts`.
  3. Move heavy static mock listing array into `lib/data/mock-weddings.ts` and re-export in `lib/data.ts`.

---

## 5. Verification Method

To verify findings independently:
1. **TRU-01 Verification**:
   - Inspect `lib/wedding-dto.ts` (lines 120–136).
   - Inspect `components/wedding/WeddingCard.tsx` (lines 241–248).
   - Run tests: `npx jest __tests__/lib/god-level-marketplace.test.ts`
2. **UX-03 Verification**:
   - Inspect `components/wedding/BookingSidebar.tsx` (lines 525–620).
   - Search for `data-testid="cancellation-escrow-drawer"`.
3. **UX-02 Verification**:
   - Inspect `components/wedding/BookingSidebar.tsx` (lines 316–439).
   - Inspect `lib/actions/index.ts` (lines 685–725).
   - Inspect `app/dashboard/events/[bookingId]/ClientEventHubForm.tsx` (lines 664–836).
4. **FIN-01 Verification**:
   - Inspect `lib/currency.ts` (lines 5–14, 38–47).
   - Inspect `components/layout/Navbar.tsx` (lines 102–164).
   - Run tests: `npx jest __tests__/lib/currency.test.ts` (if present) or `npx jest`.
5. **ROU-01 Verification**:
   - Inspect `next.config.ts` (lines 106–149). Confirm `/destinations` is absent from `redirects()`.
   - Inspect `app/destinations/page.tsx`.
6. **PRF-01 Verification**:
   - Check directory `app/destinations/` and `app/learn/` for existence of `loading.tsx`.
7. **PRF-02 Verification**:
   - Inspect `lib/data.ts` line count and byte size (`wc -l lib/data.ts`).
   - Inspect `app/page.tsx` imports.
