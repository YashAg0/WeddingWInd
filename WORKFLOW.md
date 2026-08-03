# WeddingWithIndia — End-to-End User Workflow Manual

This document details the step-by-step end-to-end workflows across all user journeys on **WeddingWithIndia**.

---

## 1. Guest Journey: Search to Attendance

```
 [ 1. Search ] ──► [ 2. Detail ] ──► [ 3. Book ] ──► [ 4. Checkout ] ──► [ 5. Pass ] ──► [ 6. Attend & Review ]
 Filter by city   Review events,    Select guest    Stripe payment   Access digital   Scan QR at venue gate,
 & budget         traditions        count & date    processing       QR entry pass    write 5-star review
```

1. **Discovery**: Traveler searches on `/weddings`, selecting destination (e.g. Jodhpur), month, and budget in local currency (`USD $`, `EUR €`, `INR ₹`).
2. **Evaluation**: Traveler inspects wedding details on `/weddings/[slug]`, reviewing event schedules (Mehndi, Sangeet, Pheras), traditions, venue photography, and host family bio.
3. **Reservation Request**: Traveler clicks "Book Experience", selects guest count, and inputs dietary preferences.
4. **Payment Processing**: Traveler completes Stripe Checkout payment. System generates a `Booking` record with status `PAID` and triggers a confirmation email via Resend.
5. **Digital Guest Pass**: Traveler accesses their digital QR Guest Pass (`/dashboard/events/[bookingId]`) containing dress code advice and emergency contact numbers.
6. **Venue Entry & Review**: Coordinator scans guest pass QR code at venue gate. Post-event, traveler submits a 5-star review with category ratings (Food, Hospitality, Culture, Safety).

---

## 2. Host Journey: Listing to Revenue Payout

1. **Submission**: Host family fills out listing form (`/list-wedding`), specifying location, capacity (`guestsAllowed`), price per guest in INR, and event timeline.
2. **Verification Audit**: Admin reviews uploaded host ID and venue proof in `/dashboard/admin/verifications` and clicks "Approve". Listing status updates to `PUBLISHED`.
3. **Guest Request Management**: Host receives notification of new traveler booking requests and reviews traveler profiles before confirming.
4. **On-Site Hosting**: Host welcomes guest to wedding ceremonies. Coordinator handles QR check-in scanning.
5. **Revenue Disbursal**: Host tracks 72% revenue share in INR (`/dashboard/earnings`) and requests bank transfer payout.

---

## 3. Agent Journey: Link Sharing to Commission Payout

1. **Onboarding**: Agent registers at `/for-agents/apply` and receives unique tracking code (`WWI-AGENT-XXXX`).
2. **Link Distribution**: Agent shares customized referral link (`https://weddingwithindia.com?ref=WWI-ROYAL-AGENT`) with clients.
3. **Attribution & Conversion**: First-touch cookie attributes traveler signup to agent. When traveler completes a paid booking, agent accrues 7% commission.
4. **Payout Withdrawal**: Agent tracks accrued commissions (`/dashboard/referrals`) and requests payout.
