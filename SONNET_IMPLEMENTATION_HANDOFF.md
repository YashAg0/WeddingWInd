# SONNET_IMPLEMENTATION_HANDOFF.md

## 1. EXECUTIVE SUMMARY
This document outlines the required implementation for the WeddingWithIndia marketplace growth and discovery upgrade. It is designed to be executed by Claude Sonnet in a single concentrated pass. The primary goals are introducing sponsored/highlighted wedding placements, creating realistic seed data (safely marked as demo), building a lightweight profile completion system, and enhancing discovery sorting.

## 2. CURRENT ARCHITECTURE
- **Framework:** Next.js 14/15 App Router
- **Database:** PostgreSQL via Prisma (`@prisma/client`)
- **Authentication:** Clerk (`@clerk/nextjs`)
- **Payments:** Stripe
- **Image Storage:** UploadThing (remote URLs from Unsplash, Pravatar, etc. are whitelisted in `next.config.ts`)
- **UI:** Tailwind CSS, Framer Motion, Lucide React

## 3. CURRENT WEDDING FLOW
- **Creation:** Couples create weddings (default `DRAFT`).
- **Approval:** Admin approval or automated KYC (via `Verification` table) allows `PUBLISHED` status.
- **Booking:** Travelers use `createBookingAction`. The action checks capacity, past dates, and existing bookings.

## 4. CURRENT DISCOVERY FLOW
- The homepage calls `getWeddings()` (in `lib/actions/index.ts`). **WARNING:** `getWeddings()` currently has a hardcoded mapping bug where it returns `featured: true` for *all* weddings!
- The `/weddings` page calls `getWeddings()` and filters/sorts in-memory.
- There is also a `searchWeddingsAction` in `lib/actions/discovery.ts` that calculates a robust `relevanceScore`, but the main UI currently relies on `getWeddings()`.

## 5. CURRENT ADMIN FLOW
- Admins can manage users, reviews, and safety cases.
- Admins can apply a `manualTrendingBoost` (Float) to a wedding via `adminSetManualBoost`.

## 6. CURRENT PROFILE FLOW
- `User` has one-to-one relations with `TravelerProfile`, `CoupleProfile`, `AgentProfile`, `CoordinatorProfile`.
- Profile fields are captured during onboarding and editable in the dashboard. There is no existing completion percentage tracking.

## 7. CURRENT AGENT FLOW
- Agents have a `referralCode` and earn `Commission` on successful bookings.

## 8. CURRENT COORDINATOR FLOW
- Coordinators are created, but integration with weddings is manual/pending.

## 9. DATABASE RELEVANT MODELS
- `User`: Base identity.
- `TravelerProfile`: Stores traveler preferences.
- `Wedding`: Stores the wedding details. Currently has `featured: Boolean @default(false)` and `manualTrendingBoost: Float @default(0.0)`.
- `Booking`: Tracks reservations.

## 10. FILES THAT MUST CHANGE
- `prisma/schema.prisma` (Add fields to `Wedding` model)
- `lib/actions/index.ts` (Fix `getWeddings` mapping bug, add profile completion logic)
- `lib/actions/discovery.ts` (Update `searchWeddingsAction` / relevance scoring)
- `lib/actions/admin.ts` (Add admin toggles for sponsored/featured)
- `app/weddings/page.tsx` (Update frontend sorting logic)
- `app/weddings/[slug]/page.tsx` (Add noindex for demo weddings)
- `scripts/seed-complete.js` (Expand seed data)
- Components: Dashboard layout to add Profile Completion UI.

## 11. FILES THAT MUST NOT CHANGE
- Authentication core (`lib/auth.ts`)
- Payment processing logic (`lib/stripe.ts` and Stripe webhooks)
- Core layout wrappers that break existing hydration.

## 12. EXACT FEATURE REQUIREMENTS
- **Sponsored Placements:** First priority in discovery.
- **Demo Weddings:** Realistic marketplace data, 0 slots available, safely marked internally, not indexed by SEO.
- **Profile Completion:** Lightweight progress bar for Travelers and Couples.
- **Sorting Algorithm:** Deterministic, server-authoritative, honoring sponsored -> featured -> regular.

## 13. SPONSORED WEDDING DESIGN
- Add `sponsored` boolean to `Wedding`.
- UI: Add a subtle premium badge or gold border for sponsored cards on the homepage and `/weddings` page.

## 14. DEMO WEDDING DESIGN
- Add `isDemo` boolean to `Wedding`.
- `capacity` must be 0, `requiredGuests` must be 0.
- `createBookingAction` MUST throw an error if `wedding.isDemo === true`.

## 15. PROFILE COMPLETION DESIGN
- **Logic:** Server-side function (e.g., `getProfileCompletion(userId)`) that checks nullable/empty fields on `TravelerProfile` (e.g., `avatar`, `interests`, `country`, `preferences`).
- **UI:** A Progress bar component injected at the top of the Traveler/Couple Dashboard. Example: "Your profile is 60% complete. Add your travel preferences to reach 80%."

## 16. RECOMMENDED HIGH-VALUE ENGAGEMENT TACTICS
- **Recently Viewed Carousel:** The database already has a `RecentlyViewed` model and `fetchRecentlyViewed` action. Expose this in the Traveler dashboard. (HIGH)
- **Profile Completion Widget:** (HIGH)
- **Wishlist Prompts:** Add a subtle "Save for later" toast prompt when a user spends > 30 seconds on a wedding page. (MEDIUM)
- **"X people have this in their wishlist"** (Using `_count.wishlists`). (HIGH)

## 17. DISCOVERY SORTING ALGORITHM
- **Order of Precedence:**
  1. `sponsored: true` (DESC)
  2. `featured: true` (DESC)
  3. `manualTrendingBoost` (DESC)
  4. `createdAt` (DESC) - Newer real weddings.
- In `lib/actions/discovery.ts` and `app/weddings/page.tsx`, ensure `sponsored` weddings get an overwhelming boost (e.g., +1000 to `relevanceScore`) and `featured` get +500.

## 18. ADMIN CONTROLS
- Create Server Actions:
  - `adminToggleSponsored(weddingId, isSponsored)`
  - `adminToggleFeatured(weddingId, isFeatured)`
- Integrate into the existing Admin Wedding Dashboard UI.

## 19. SECURITY REQUIREMENTS
- **Booking Bypass:** `createBookingAction` must explicitly reject `isDemo === true`. Server must enforce this regardless of client state.
- **Pricing:** `pricePerGuest` is already strictly read from the DB in `createBookingAction`. Maintain this!
- **IDOR:** Ensure Admin actions verify `user.role === UserRole.ADMIN`.
- **RBAC:** Verify that hosts cannot set `sponsored` or `isDemo` themselves in `createWedding` and `editWedding`.

## 20. IMAGE STRATEGY
- `next.config.ts` currently permits `images.unsplash.com`.
- **Strategy:** Use high-quality Unsplash image URLs directly in the seed script. Do not download images or attempt to upload them via UploadThing during the seed process to save bandwidth and execution time.

## 21. SEED STRATEGY
- **File:** Extend `scripts/seed-complete.js`.
- **Mechanism:** It already uses `prisma.wedding.upsert`. Add ~15 distinct demo weddings across regions (Jaipur, Kerala, Goa, Varanasi, etc.).
- **Crucial:** Set `isDemo: true`, `capacity: 0`, and `pricePerGuest: realistic_value`.

## 22. SEO STRATEGY
- In `app/weddings/[slug]/page.tsx`, check if `wedding.isDemo === true`.
- If true, modify the Next.js `generateMetadata` return object to include:
  ```typescript
  robots: {
    index: false,
    follow: false,
  }
  ```

## 23. UI/THEME REQUIREMENTS
- Preserve the existing luxury brand identity (`warm-50`, `charcoal-900`, `font-display`).
- Badges for "Sponsored" and "Featured" should feel premium (e.g., gold accents, subtle glassmorphism) rather than generic SaaS tags.

## 24. MIGRATION REQUIREMENTS
- **Schema Additions (Prisma):**
  ```prisma
  model Wedding {
    // ...existing fields...
    sponsored Boolean @default(false)
    isDemo    Boolean @default(false)
  }
  ```
- Run `npx prisma db push` or `npx prisma migrate dev` (depending on the repo's migration preference).

## 25. VALIDATION REQUIREMENTS
- Ensure `weddingSchema` (zod) strictly ignores `sponsored` and `isDemo` during host creation/editing to prevent privilege escalation.

## 26. TEST REQUIREMENTS
- Verify demo weddings cannot be booked.
- Verify demo weddings do not appear in sitemaps (if generated dynamically) and have `<meta name="robots" content="noindex">`.
- Verify sorting places Sponsored > Featured > Normal.

## 27. EXACT IMPLEMENTATION ORDER
1. Update `prisma/schema.prisma` and run db push.
2. Update `lib/actions/index.ts` to fix the `getWeddings` hardcoded `featured: true` bug, and properly map `featured`, `sponsored`, and `isDemo`.
3. Update `app/weddings/page.tsx` sorting logic.
4. Update `lib/actions/discovery.ts` relevance scoring.
5. Update `lib/actions/admin.ts` with new toggles and hook them into Admin UI.
6. Enforce security constraints in `lib/actions/index.ts` (Booking check for `isDemo`, sanitize host inputs).
7. Update `app/weddings/[slug]/page.tsx` for SEO `noindex` logic.
8. Create Profile Completion Server Action and inject the UI component into the Dashboard.
9. Extend `scripts/seed-complete.js` with new demo weddings.

## 28. ACCEPTANCE CRITERIA
- 15+ demo weddings appear in discovery.
- Demo weddings are unbookable.
- Sponsored weddings appear first.
- Profile completeness shows accurately on the dashboard.
- Admin can toggle sponsored/featured status.

## 29. KNOWN RISKS
- Modifying `getWeddings` removes the hardcoded `featured: true` mapping. If existing UI components depend on every wedding being `featured: true` for styling, they might break visually. Test the WeddingCard component thoroughly.

## 30. DO NOT BREAK LIST
- DO NOT break Clerk Auth.
- DO NOT bypass Stripe checkout logic.
- DO NOT alter `TravelerProfile` and `CoupleProfile` structures drastically.
- DO NOT break `lib/actions/safety.ts` verifications.
