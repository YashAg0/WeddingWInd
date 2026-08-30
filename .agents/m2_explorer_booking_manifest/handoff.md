# Handoff Report: Milestone 2 — Phase 2: Booking, Escrow & Guest Manifest (UX-03 & UX-02)

**Author**: Explorer Subagent (M2 Booking & Manifest)  
**Date**: 2026-08-30  
**Scope**: 
1. **UX-03**: Cancellation & Escrow Transparency in `components/wedding/BookingSidebar.tsx`
2. **UX-02**: Multi-Guest Attendee Manifest (`BookingGuest`) in `BookingSidebar.tsx`, `createBookingAction` (`lib/actions/index.ts`), and Event Hub (`app/dashboard/events/[bookingId]`)

---

## 1. Observation

Direct code inspections of the target files revealed the following exact baseline conditions:

### 1.1 UX-03 (Cancellation & Escrow Transparency Baseline)
- **`components/wedding/BookingSidebar.tsx` (lines 112–272)**:
  - Renders:
    1. Tier header (`{tierConfig.label} Experience`, `{durationDays}-Day Celebration`, and Verified Host badge at lines 114–136).
    2. Pass Price box (`getCustomerPriceUSD(tier, durationDays)` at lines 139–152).
    3. Availability slots indicator (lines 155–165).
    4. `WeddingSideSelector` (lines 168–172).
    5. Guest count selector dropdown (1 to 10 guests, lines 176–198).
    6. Price breakdown and Total Booking Price summary (lines 201–214).
    7. CTA buttons ("Reserve Invitation", Save, Share at lines 217–270).
  - **Omission**: Zero cancellation terms, refund tier timelines, or escrow protection notices are displayed prior to booking submission. Foreign travelers committing $150–$2,000 have no visibility into refund schedules or platform payment escrow holding.
- **`lib/services/cancellation-policy.ts` (lines 111–160)**:
  - Defines the authoritative 4-tier refund policy engine calculating UTC calendar day differences between event date and cancellation date:
    - **$\ge$ 30 days before event**: **90% refund** (10% retained for platform processing and host reservation hold).
    - **15–29 days before event**: **70% refund** (30% retained for locked coordinator allocation and preparations).
    - **7–14 days before event**: **40% refund** (60% retained for finalized venue and vendor commitments).
    - **$<$ 7 days before event**: **0% non-refundable** (catering, ceremonial supplies, and attire finalized).
    - **Host cancellation**: **100% full refund** (`actor === CancellationActor.HOST`).
    - **Safety/Admin override**: Up to **100% full refund** upon Trust & Safety investigation.
- **`prisma/schema.prisma` (lines 349, 494) & Escrow Architecture**:
  - `Payment.hostPayoutTransferred: Boolean @default(false)` guarantees that traveler funds are held in platform escrow and disbursed to host couples only after verified check-in/attendance at the event.

### 1.2 UX-02 (Multi-Guest Attendee Manifest Baseline)
- **`prisma/schema.prisma` (lines 387–400)**:
  - Model `BookingGuest` already exists in PostgreSQL:
    ```prisma
    model BookingGuest {
      id                String   @id @default(uuid())
      bookingId         String
      fullName          String
      email             String?
      age               Int?
      gender            String?
      foodPreference    String   @default("No Restrictions")
      accessibilityNeed String   @default("None")
      createdAt         DateTime @default(now())
      booking           Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)

      @@index([bookingId])
    }
    ```
- **`components/wedding/BookingSidebar.tsx` (lines 175–198, 68–109)**:
  - Traveler can choose 2 to 10 guests in `guestsCount`.
  - No form inputs exist for accompanying attendees (Seats 2 through $N$).
  - `handleBook` submits only `weddingId`, `date`, `guestsCount`, and `attendanceSide` via `addBooking`.
  - Result: Hosts and caterers receive a booking with $N$ attendees but zero names, dietary restrictions, or medical alerts for guests #2–#$N$.
- **`lib/actions/index.ts` (`createBookingAction` lines 559–719)**:
  - Accepts `data: { weddingId: string; date: string; guestsCount: number; attendanceSide?: string; }`.
  - Executes pessimistic row locking `tx.$queryRaw SELECT id FROM "Wedding" WHERE id = ${data.weddingId} FOR UPDATE` to serialize bookings and prevent overcapacity.
  - Recalculates authoritative pricing via `calculateBookingPricing`.
  - Creates `Booking` record at line 677 without creating any nested `BookingGuest` records.
- **Event Hub: `app/dashboard/events/[bookingId]/page.tsx` (lines 25–41)**:
  - Prisma query includes `traveler`, `preparations`, `emergencies`, and `travelDetails`, but omits `guests: true`.
- **Event Hub: `app/dashboard/events/[bookingId]/ClientEventHubForm.tsx` (lines 1–578)**:
  - Contains tabs for *Preparation Checks*, *Itinerary Timeline*, *Travel Details*, and *Announcements*.
  - Lacks an attendee roster / manifest editor to view and update accompanying guest details post-booking.
- **Host Catering Export: `app/api/reports/host/[weddingId]/route.ts` (lines 18–24, 65–72)**:
  - Already queries `bookings: { include: { guests: true } }` and serializes `b.guests.map(g => `${g.fullName} (${g.foodPreference})`).join("; ")`.
  - As soon as `BookingGuest` records are populated by booking or Event Hub, host catering exports automatically serialize complete attendee dietary profiles.

---

## 2. Logic Chain

From the observations above, the implementation requirements map to the following logical architecture:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. BookingSidebar.tsx (Pre-Booking UX)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ • If guestsCount > 1: Render dynamic BookingGuest attendee cards (2 to N)   │
│   - Full Name (required)                                                    │
│   - Email / Phone (optional)                                                │
│   - Age & Gender (optional)                                                 │
│   - Dietary Allergen Selector (Strict Veg, Jain, Halal, Celiac, Nuts, etc.)│
│   - Accessibility Needs (optional)                                          │
│ • Directly below Booking CTA: Render expandable Cancellation & Escrow Drawer│
│   - 4-Tier Refund Badges (>30d: 90%, 15-30d: 70%, 7-14d: 40%, <7d: 0%)      │
│   - Escrow Guarantee: Funds held in platform escrow until event check-in   │
│   - Host Cancellation: 100% full refund guarantee                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Submits guest manifest payload
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. lib/actions/index.ts -> createBookingAction                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Preserves SELECT FOR UPDATE pessimistic concurrency lock on Wedding row   │
│ • Validates guests array length <= data.guestsCount                         │
│ • Atomically inserts Booking and nested BookingGuest[] records in Prisma tx │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Saved to PostgreSQL
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. Event Hub (app/dashboard/events/[bookingId])                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ • page.tsx: Includes `guests: true` in booking fetch                        │
│ • ClientEventHubForm.tsx: Dedicated "Attendee Manifest" management tab     │
│ • Server Action `saveBookingGuestsAction`: Allows traveler to update       │
│   guest names, dietary allergen chips, and accessibility needs anytime      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. Downstream Systems (Automatic Propagation)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Host Catering CSV Export: Serializes all attendee dietary profiles        │
│ • Event Check-in Scanner: Verifies multi-seat pass tokens and guest counts  │
│ • Kitchen Prep Manifest: Flags medical alerts (Celiac, Nut Allergies)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Technical Architecture & Proposed Implementations

### 3.1 UX-03: Cancellation & Escrow Protection Drawer Component

#### Component Structure (`components/wedding/CancellationEscrowDrawer.tsx` or inline in `BookingSidebar.tsx`):
- Positioned directly below the primary booking CTA button (`Reserve Invitation`).
- Collapsible interactive drawer with an accessible trigger button (`aria-expanded`, `aria-controls`, `data-testid="cancellation-escrow-drawer"`).
- Trust header badge: `ShieldCheck` icon with "Cancellation & Escrow Protection" + "4-Tier Refund Guarantee".

#### Content Specification:
1. **Tiered Refund Table**:
   | Timeframe | Refund % | Platform Fee / Retained Policy | Badge Style |
   |---|---|---|---|
   | **> 30 Days Before Event** | **90% Refund** | 10% retained for payment processing & host hold | `bg-emerald-50 text-emerald-800 border-emerald-200` |
   | **15 – 30 Days Before Event** | **70% Refund** | 30% retained for locked coordinator allocation | `bg-blue-50 text-blue-800 border-blue-200` |
   | **7 – 14 Days Before Event** | **40% Refund** | 60% retained for venue & ceremonial setup | `bg-amber-50 text-amber-800 border-amber-200` |
   | **< 7 Days Before Event** | **0% Non-Refundable** | 100% retained due to finalized catering & attire | `bg-rose-50 text-rose-800 border-rose-200` |

2. **Escrow & Host Protection Assurances**:
   - 🛡️ **Platform Escrow Hold**: *Funds are held securely by WeddingWithIndia and released to the host couple only after verified check-in at the wedding celebration.*
   - 🤝 **100% Host Cancellation Guarantee**: *If the host family cancels or the wedding is called off, you are entitled to a full 100% refund.*
   - ⚖️ **Trust & Safety Protection**: *Disputes, safety issues, or unauthorized schedule shifts investigated by Trust & Safety are eligible for up to 100% resolution.*
   - 🔒 **No Hidden Surcharges**: *Pass price covers all ceremonial access, traditional banquets, and local coordination.*

---

### 3.2 UX-02: Multi-Guest Attendee Manifest Design

#### A. `components/wedding/BookingSidebar.tsx` Changes:
1. **State Interface**:
   ```typescript
   export interface GuestAttendeeInput {
     fullName: string;
     email?: string;
     age?: number | "";
     gender?: string;
     foodPreference: string;
     accessibilityNeed?: string;
   }
   ```
2. **Dynamic State Management**:
   ```typescript
   const [guestManifest, setGuestManifest] = useState<GuestAttendeeInput[]>([]);

   useEffect(() => {
     const accompanyingCount = Math.max(0, guestsCount - 1);
     setGuestManifest((prev) => {
       if (prev.length === accompanyingCount) return prev;
       if (prev.length < accompanyingCount) {
         const added: GuestAttendeeInput[] = Array.from({
           length: accompanyingCount - prev.length,
         }).map(() => ({
           fullName: "",
           email: "",
           age: "",
           gender: "",
           foodPreference: "No Restrictions",
           accessibilityNeed: "None",
         }));
         return [...prev, ...added];
       }
       return prev.slice(0, accompanyingCount);
     });
   }, [guestsCount]);
   ```
3. **Session Storage Persistence**:
   - When redirecting to login, save:
     ```typescript
     sessionStorage.setItem(
       `pending_booking_${wedding.id}`,
       JSON.stringify({
         guestsCount,
         attendanceSide,
         guestManifest,
       })
     );
     ```
   - On page load, restore `guestsCount`, `attendanceSide`, and `guestManifest`.
4. **UI Card Collection**:
   - Render dynamic attendee cards for each accompanying guest (`Guest #2`, `Guest #3`, etc.):
     - Name input (`required`, text).
     - Email/phone input (`optional`).
     - Compact dietary selector using `DietaryAllergenSelector` or chip selector with medical alert badge.
     - Accessibility notes.
5. **Validation**:
   - Before executing `addBooking`, verify that all accompanying guests have non-empty `fullName.trim()`. If empty, highlight the field and show toast: `"Please provide full names for all accompanying guests."`

---

#### B. `lib/actions/index.ts` (`createBookingAction`) Changes:
1. **Signature Expansion**:
   ```typescript
   export async function createBookingAction(data: {
     weddingId: string;
     date: string;
     guestsCount: number;
     attendanceSide?: string;
     guests?: Array<{
       fullName: string;
       email?: string | null;
       age?: number | null;
       gender?: string | null;
       foodPreference?: string;
       accessibilityNeed?: string;
     }>;
   })
   ```
2. **Validation & Nested Insertion**:
   ```typescript
   // Sanitize and validate accompanying guests if present
   const sanitizedGuests = (data.guests || [])
     .slice(0, data.guestsCount - 1)
     .filter((g) => g.fullName && g.fullName.trim().length > 0)
     .map((g) => ({
       fullName: g.fullName.trim().slice(0, 100),
       email: g.email?.trim().slice(0, 150) || null,
       age: typeof g.age === "number" && !isNaN(g.age) && g.age > 0 && g.age < 120 ? Math.floor(g.age) : null,
       gender: g.gender?.trim().slice(0, 30) || null,
       foodPreference: g.foodPreference?.trim().slice(0, 500) || "No Restrictions",
       accessibilityNeed: g.accessibilityNeed?.trim().slice(0, 500) || "None",
     }));

   const createdBooking = await tx.booking.create({
     data: {
       travelerId: traveler.id,
       weddingId: data.weddingId,
       date: new Date(data.date),
       guestsCount: data.guestsCount,
       pricePerGuest: pricing.customerPricePerGuestUSD,
       totalAmount: pricing.customerTotalAmountUSD,
       weddingTier: pricing.tier,
       durationDays: pricing.durationDays,
       customerPricePerGuestUSD: pricing.customerPricePerGuestUSD,
       hostPayoutPerGuestINR: pricing.hostPayoutPerGuestINR,
       agentPayoutPerGuestINR: pricing.agentPayoutPerGuestINR,
       eligibleInternationalGuestCount: pricing.eligibleInternationalGuestCount,
       totalHostPayoutINR: pricing.totalHostPayoutINR,
       totalAgentPayoutINR: pricing.totalAgentPayoutINR,
       pricingVersion: pricing.pricingVersion,
       baseCustomerAmountUSD: pricing.baseCustomerAmountUSD,
       paymentFeeAmount: 0,
       customerTotalAmount: pricing.customerTotalAmountUSD,
       currency: "USD",
       status: BookingStatus.PENDING,
       attendanceSide: sanitizedSide,
       guests: sanitizedGuests.length > 0 ? {
         create: sanitizedGuests,
       } : undefined,
     },
   });
   ```

---

#### C. Event Hub (`app/dashboard/events/[bookingId]`) Changes:
1. **`page.tsx`**:
   - Update Prisma query:
     ```typescript
     const booking = await prisma.booking.findUnique({
       where: { id: bookingId },
       include: {
         wedding: {
           include: {
             hostCouple: { include: { user: true } },
             itinerary: { orderBy: { sortOrder: "asc" } },
             announcements: { orderBy: { publishedAt: "desc" } },
             contacts: { orderBy: { sortOrder: "asc" } },
           },
         },
         traveler: { include: { user: true } },
         preparations: true,
         emergencies: true,
         travelDetails: true,
         guests: { orderBy: { createdAt: "asc" } }, // <-- Added
       },
     });
     ```
   - Pass `initialGuests={booking.guests}` into `ClientEventHubForm`.
2. **`ClientEventHubForm.tsx`**:
   - Add a 5th tab: `5. Guest Manifest (${guestsCount} Attendees)`.
   - Primary Traveler Card: Lead guest details (linked to traveler profile & travel details).
   - Accompanying Attendee Cards: Form inputs for each seat with `DietaryAllergenSelector` chips, name, email, age, and accessibility.
   - Save button connected to `saveBookingGuestsAction`.
3. **Server Action `saveBookingGuestsAction` in `lib/actions/event-operations.ts`**:
   ```typescript
   export async function saveBookingGuestsAction(
     bookingId: string,
     guests: Array<{
       id?: string;
       fullName: string;
       email?: string | null;
       age?: number | null;
       gender?: string | null;
       foodPreference?: string;
       accessibilityNeed?: string;
     }>
   ) {
     const user = await requireAuth();

     return await prisma.$transaction(async (tx) => {
       const booking = await tx.booking.findUnique({
         where: { id: bookingId },
         include: { traveler: true },
       });

       if (!booking) throw new Error("Booking not found.");
       if (booking.traveler.userId !== user.id && user.role !== UserRole.ADMIN) {
         throw new Error("Unauthorized access to booking.");
       }

       if (guests.length > booking.guestsCount - 1) {
         throw new Error(`Cannot register more than ${booking.guestsCount - 1} accompanying guests.`);
       }

       // Delete existing guests and recreate or upsert
       await tx.bookingGuest.deleteMany({
         where: { bookingId },
       });

       const sanitized = guests
         .filter((g) => g.fullName && g.fullName.trim().length > 0)
         .map((g) => ({
           bookingId,
           fullName: g.fullName.trim().slice(0, 100),
           email: g.email?.trim().slice(0, 150) || null,
           age: typeof g.age === "number" && !isNaN(g.age) ? g.age : null,
           gender: g.gender?.trim().slice(0, 30) || null,
           foodPreference: g.foodPreference?.trim().slice(0, 500) || "No Restrictions",
           accessibilityNeed: g.accessibilityNeed?.trim().slice(0, 500) || "None",
         }));

       if (sanitized.length > 0) {
         await tx.bookingGuest.createMany({
           data: sanitized,
         });
       }

       return { success: true };
     });
   }
   ```

---

## 4. Caveats

1. **Read-Only Scope**: This report provides structural designs and concrete implementation code proposals without modifying any source files directly.
2. **Single-Seat Bookings (`guestsCount === 1`)**: When a traveler reserves 1 seat, no accompanying guest cards are required in `BookingSidebar.tsx`. The lead traveler's dietary and logistics data are captured via profile onboarding and the Event Hub *Travel Details* tab.
3. **Partial Attendee Information at Checkout**: A traveler booking 4 seats may know only 2 names at checkout time. The implementation should allow booking with partial accompanying guest names while highlighting in the Event Hub checklist that the manifest must be completed prior to the wedding date.
4. **Zero PostgreSQL Schema Migration Needed**: `BookingGuest` already has `fullName`, `email`, `age`, `gender`, `foodPreference`, `accessibilityNeed`, and `bookingId`. `lib/dietary.ts` serializers store structured chips into the existing `String` columns seamlessly.

---

## 5. Conclusion

- **UX-03 is solved** by embedding an accessible, expandable `Cancellation & Escrow Protection` drawer directly below the booking CTA in `BookingSidebar.tsx`, clearly rendering the 4-tier refund policy (90%/70%/40%/0%), 100% host cancellation guarantee, and platform escrow holding rules.
- **UX-02 is solved** by introducing dynamic `BookingGuest` attendee card collection in `BookingSidebar.tsx`, accepting and inserting accompanying guest records in `createBookingAction`, and providing a full manifest editor with structured dietary chips in the Event Hub (`app/dashboard/events/[bookingId]`).
- Both features strictly preserve all platform security invariants: `SELECT FOR UPDATE` locking, server-authoritative pricing calculation, and formula neutralization in host exports.

---

## 6. Verification Method

To independently verify the implementation once executed by the implementing worker:

1. **TypeScript Type Safety Check**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected Result*: Zero type errors across `BookingSidebar.tsx`, `lib/actions/index.ts`, `lib/actions/event-operations.ts`, and `ClientEventHubForm.tsx`.

2. **Host Catering Export Verification**:
   ```bash
   npx jest __tests__/lib/host-catering-export.test.ts
   ```
   *Expected Result*: Verifies that accompanying `BookingGuest` records are correctly serialized into the host catering export.

3. **Dietary Allergen Component Verification**:
   ```bash
   npx jest __tests__/components/dietary-allergen-selector.test.tsx
   ```
   *Expected Result*: Verifies that structured dietary chips and medical safety alerts render correctly.

4. **Full Jest Test Suite Execution**:
   ```bash
   npm test
   ```
   *Expected Result*: All unit and integration test suites pass with 0 failures.

5. **Visual UI Inspection Conditions**:
   - Inspect `components/wedding/BookingSidebar.tsx` in browser:
     - Selecting 1 guest renders no accompanying cards; selecting 3 guests renders 2 accompanying cards.
     - Changing chips updates structured dietary preferences.
     - Clicking "Cancellation & Escrow Protection" expands the 4-tier refund timeline and escrow guarantees.
   - Inspect `app/dashboard/events/[bookingId]`:
     - Renders "Guest Manifest" tab with editable cards for all booked attendee seats.
