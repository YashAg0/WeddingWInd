# WeddingWithIndia — Lead Loss Simulation (Phase 20)

**Date**: August 14, 2026  
**Evaluator**: Principal Engineer, QA Lead, Reliability Lead & Cultural Authenticity Auditor

---

## 1. Overview

To ensure zero trust-breaking bugs or preventable conversion leaks, 20 distinct foreign traveler personas were simulated browsing WeddingWithIndia. Each persona evaluated specific friction points, trust risks, cultural concerns, and operational edge cases.

---

## 2. Persona Simulations & Remediation Audit

### Persona 1: American First-Time India Traveler
- **Fear**: Getting scammed or lost in an unfamiliar country.
- **Evaluation**: Needs clear host vetting signals and escrow payment guarantees.
- **Fix**: Added "Vetted Host" badges, clear escrow payment explanation ("held securely in trust until check-in"), and 24/7 concierge contact info on booking sidebar.

### Persona 2: British Culture Enthusiast
- **Fear**: Accidental cultural disrespect during sacred ceremonies.
- **Evaluation**: Needs explicit footwear, dress, and photography etiquette.
- **Fix**: Added event-by-event cultural expectations, mandatory head-covering notes for Gurdwaras, shoe-removal notes for Mandaps/Ghats, and right-hand eating customs for banana leaf feasts.

### Persona 3: French Luxury Traveler
- **Fear**: Poor accommodation or unorganized logistics.
- **Evaluation**: Looks for luxury venue details, palace heritage, and VIP tier offerings.
- **Fix**: Dynamic tier pricing with VIP options, venue description breakdowns, and 5-star hotel add-on coordination notes.

### Persona 4: Solo Female Traveler
- **Fear**: Personal safety and venue navigation.
- **Evaluation**: Looks for safety check assurances and dedicated host support.
- **Fix**: Safety case monitoring, in-person host verification, and bilingual local buddy/coordinator support built into experience tiers.

### Persona 5: Vegan / Dietary Restricted Traveler
- **Fear**: Accidental consumption of non-compliant food.
- **Evaluation**: Clear food context per wedding.
- **Fix**: Structured `foodContext` fields explicitly detailing Sattvic, Halal, Pure Veg, Ela Sadya, or Mughlai meat preparations on every listing.

### Persona 6: Muslim Traveler Looking for Muslim Weddings
- **Fear**: Seeing Hindu rituals falsely listed on a Muslim wedding.
- **Evaluation**: Checks Nikah, Walima, Qawwali, and Halal catering alignment.
- **Fix**: Cultural Engine 2.0 strictly prohibiting cross-cultural terms (`phera`, `saptapadi`, `ganesh puja`, `sindoor`) on Muslim listings.

### Persona 7: Sikh Traveler Looking for Sikh Weddings
- **Fear**: False representation of Anand Karaj or Gurdwara rules.
- **Evaluation**: Checks Anand Karaj, Laavan, Langar, and head covering compliance.
- **Fix**: Sikh-specific ceremony templates, mandatory head covering warnings (Rumaal), and Langar equality guidelines.

### Persona 8: Christian Traveler Looking for Goan/Indian Christian Weddings
- **Fear**: Generic flattening of Christian traditions into a non-Indian format.
- **Evaluation**: Checks Roce, Nuptial Mass, and coastal reception details.
- **Fix**: Goan Catholic & Kerala Syrian Christian specific traditions (Roce blessing, organ choir mass, Bebinca dessert).

### Persona 9: Traveler Nervous About Scams & Fake Reviews
- **Fear**: Fake customer reviews or fake trust badges.
- **Evaluation**: Scrutinizes reviews for verified booking links.
- **Fix**: Removed fake static testimonials, implemented `mapToPublicReviewDTO`, linking public reviews strictly to verified completed DB bookings (`verifiedBooking: true`).

### Persona 10: Traveler Looking at Showcase / Demo Listings
- **Fear**: Clicking "Book" on a listing that turns out to be an illustrative demo.
- **Evaluation**: Needs clear showcase labeling.
- **Fix**: Relabeled demo listings from misleading "Fully Booked" to "Showcase Experience · Preview Only". Server-side invariant `isDemo === true` blocking booking attempts with clear error.

### Persona 11: Budget Traveler
- **Fear**: Surprise mandatory fees at checkout.
- **Evaluation**: Checks headline price vs checkout price.
- **Fix**: Single Source of Truth DTO ensuring card price = detail price = checkout price. All taxes and platform fees included upfront.

### Persona 12: Couple Booking Together
- **Fear**: Limited capacity for 2 or more seats.
- **Evaluation**: Checks real-time capacity remaining.
- **Fix**: Dynamic guest count selector clamped against DB capacity `(capacity - guestsBooked)`.

### Persona 13: Traveler Abandons Checkout / Returning Later
- **Fear**: Losing saved weddings or search filters.
- **Evaluation**: Uses wishlist and saved search.
- **Fix**: Saved search and wishlist actions with server-side persistence and shareable wishlist tokens.

### Persona 14: Mobile User
- **Fear**: Broken sticky booking cards or bad filter drawer scrolling.
- **Evaluation**: Checks touch target sizes and mobile drawer locking.
- **Fix**: Fixed mobile bottom bar `StickyBookingCard` with smooth Framer Motion drawer and body scroll lock.

### Persona 15: Traveler with Pre-Booking Questions
- **Fear**: Cannot contact support before booking.
- **Evaluation**: Searches for enquiry / contact options.
- **Fix**: Created `/api/contact` route and embedded support email links on booking sidebars (`support@weddingwithindia.com`).

### Persona 16: Traveler Searching by Specific Region / Religion
- **Fear**: Zero results returning blank unhelpful screens.
- **Evaluation**: Uses discovery search filters.
- **Fix**: Added dynamic filter counts, canonical religion normalization, and friendly empty state with suggestions.

### Persona 17: Traveler Booking Future Wedding Dates
- **Fear**: Impossible past dates or contradictory schedules.
- **Evaluation**: Checks event timeline date logic.
- **Fix**: Automated date verification script (`verify-wedding-dates.js`) ensuring all active dates are set to future dates (Oct 2026 – May 2028).

### Persona 18: Traveler Experiencing Network Instability
- **Fear**: Infinite loading spinners or silent JavaScript crashes.
- **Evaluation**: Triggers fallback paths.
- **Fix**: Error boundaries (`error.tsx`, `global-error.tsx`), static fallback resilience in `getWeddings()`, and image error fallback handlers.

### Persona 19: Skeptical Developer / Auditor
- **Fear**: Finding hardcoded fake customer stats in page metadata.
- **Evaluation**: Inspects meta descriptions and JSON-LD schema.
- **Fix**: Dynamic metric rendering from `BUSINESS_METRICS` with honest zeroed metrics ("Awaiting first verified celebration") and valid `Event` schema.

### Persona 20: Traveler Cancelling Due to Travel Plan Changes
- **Fear**: Opaque cancellation terms or delayed refunds.
- **Evaluation**: Reads cancellation policy section on booking widget.
- **Fix**: Transparent 30+ day (100%), 14-29 day (50%), <14 day policy with automated refund engine integration (`refunds.ts`).

---

## 3. Summary

All 20 persona friction points have been identified, remediated, and protected by server-side invariants and automated test gates.
