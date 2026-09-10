# Explorer 1 Forensic Audit Report: Architecture, Routes, Database Schema & State Machines

**Audit Date**: 2026-08-30  
**Target Repository**: `c:\Projects\WeddingWithIndia\wedding-with-india`  
**Auditor**: Explorer 1 (Architecture, Routes, Schema & State Machines)  
**Deliverable**: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_arch\handoff.md`  

---

## 1. Observation

### 1.1 Next.js App Router Structure & Special Files Inventory
The application is built on **Next.js 16.2.10**, **React 19.2.4**, **Prisma 6.2.1**, **Clerk 7.5.16**, and **Tailwind CSS 4**.
Total Next.js special files identified under `app/`: **162 files**.

#### Special Root Files:
- `app/layout.tsx`: Root application shell (Geist/Cinzel font loader, ThemeProvider, ClerkProvider, PwaProvider, LayoutVisibilityWrapper, Navbar, BottomNav, Toaster).
- `app/error.tsx`: Root client-side boundary error handler (`"use client"`).
- `app/global-error.tsx`: Catch-all HTML fallback error handler (`"use client"`).
- `app/not-found.tsx`: Global 404 page with navigation fallback.
- `proxy.ts`: Root Next.js middleware / proxy routing engine (Clerk session enforcement, E2E test bypass, affiliate tracking cookie ingestion).

---

### 1.2 Section C: Route-by-Route Matrix (Full App Router Inventory)

| Route Path | Type | Special Files Present | Dynamic Params | Auth Required | Role Guard | Data Fetching Mode | Description & Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Page | `page.tsx` | None | Public | None | Server (SSR) + Client islands | Homepage: Hero, curated weddings, stats, testimonials, FAQ |
| `/about` | Page | `page.tsx`, `layout.tsx`, `AboutContent.tsx` | None | Public | None | Server (SSR) + Client island | Brand story, cultural mission, values, founder overview |
| `/acceptable-use` | Page | `page.tsx` | None | Public | None | Static / SSR | Acceptable Use Policy & platform guidelines |
| `/accessibility` | Page | `page.tsx` | None | Public | None | Static / SSR | WCAG 2.2 AA accessibility commitment & contact |
| `/account` | Page | `page.tsx`, `layout.tsx` | None | Authenticated | Any logged-in user | Client (`"use client"`) + Server Actions | User security settings, session revocation, profile |
| `/agent-agreement` | Page | `page.tsx` | None | Public | None | Static / SSR | B2B Travel Agent legal terms & commission agreement |
| `/booking-terms` | Page | `page.tsx` | None | Public | None | Static / SSR | Guest booking terms, escrow rules, attendance covenants |
| `/cancellation-policy`| Page | `page.tsx` | None | Public | None | Static / SSR | Traveler & host cancellation policy, timelines, tiers |
| `/community-guidelines`| Page | `page.tsx` | None | Public | None | Static / SSR | Code of conduct for foreign guests and Indian hosts |
| `/complaints` | Page | `page.tsx` | None | Public | None | Static / SSR | Formal grievance handling & consumer protection |
| `/contact` | Page | `page.tsx`, `layout.tsx` | None | Public | None | Client (`"use client"`) + API | Customer support contact form & communication channels |
| `/content-policy` | Page | `page.tsx` | None | Public | None | Static / SSR | Media upload rules, copyright, and content standards |
| `/cookies` | Page | `page.tsx` | None | Public | None | Static / SSR | Cookie policy, tracking disclosure, consent manager |
| `/coordinator-agreement`| Page | `page.tsx` | None | Public | None | Static / SSR | On-site coordinator partnership contract |
| `/coordinators` | Page | `page.tsx`, `layout.tsx` | None | Public | None | Client (`"use client"`) | Coordinator value proposition & career overview |
| `/coordinators/apply`| Page | `page.tsx` | None | Authenticated | Any logged-in user | Client (`"use client"`) + Server Action | Coordinator application submission form |
| `/coordinators/dashboard`| Page | `page.tsx`, `layout.tsx` | None | Authenticated | `COORDINATOR`, `ADMIN` | Server (SSR) + Client Actions | Coordinator event roster, check-in operations |
| `/copyright` | Page | `page.tsx` | None | Public | None | Static / SSR | Intellectual property & DMCA copyright notices |
| `/dashboard` | Page | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` | None | Authenticated | All Roles | Server (SSR) -> Role Router | Master dashboard router dispatching by user role |
| `/dashboard/admin` | Page | `page.tsx`, `layout.tsx`, `loading.tsx` | None | Authenticated | `ADMIN` | Server (SSR) | Admin command center: KPIs, volume, pending tasks |
| `/dashboard/admin/agents` | Page | `page.tsx`, `ClientAdminAgentsList.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Client island | Agent application triage, approval, referral codes |
| `/dashboard/admin/analytics` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) | Platform conversion funnels, search CTR, engagement |
| `/dashboard/admin/bookings` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Server Actions | Master booking ledger, manual status, pass manager |
| `/dashboard/admin/cms` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Server Actions | Site content editor: Hero, stats, policies, terms |
| `/dashboard/admin/coordinators` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Client island | Coordinator assignments, event roster management |
| `/dashboard/admin/discovery` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Client (`"use client"`) + Server Actions | Search ranking algorithm & manual trending boosts |
| `/dashboard/admin/events` | Page | `page.tsx`, `ClientAdminEvents.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Client island | Live wedding events overview, check-in statistics |
| `/dashboard/admin/finance` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) | Balance sheet, escrow hold, commissions, tax ledger |
| `/dashboard/admin/founder` | Page | `page.tsx` | None | Authenticated | `ADMIN` (`SUPER_ADMIN`) | Server (SSR) + Client island | Emergency kill-switches, maintenance mode, seeds |
| `/dashboard/admin/growth` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) | Campaign tracking, UTM attribution, referral loops |
| `/dashboard/admin/hosts` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Client (`"use client"`) + Server Actions | Host application triage pipeline & KYC queue |
| `/dashboard/admin/hosts/[id]` | Page | `page.tsx` | `id` (HostApp/Wedding ID) | Authenticated | `ADMIN` | Client (`"use client"`) + Server Actions | Individual host application dossier deep review |
| `/dashboard/admin/messages` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Client (`"use client"`) | Global platform messaging oversight & safety monitor |
| `/dashboard/admin/operations` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) | Daily operational health, background crons, logs |
| `/dashboard/admin/payments` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Client island | Manual PayPal/UPI payment verification & Stripe audit |
| `/dashboard/admin/reviews` | Page | `page.tsx`, `ClientAdminReviews.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Client island | Review moderation, fraud signal triage, appeals |
| `/dashboard/admin/safety` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) | Trust & Safety incident ledger, dispute management |
| `/dashboard/admin/safety/[caseId]` | Page | `page.tsx`, `ClientCaseDetailActions.tsx` | `caseId` (Safety Case UUID) | Authenticated | `ADMIN` | Server (SSR) + Client island | Incident investigation, evidence viewer, timeline |
| `/dashboard/admin/settings` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) | Global system configuration, fees, policies |
| `/dashboard/admin/support` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) | Helpdesk ticket center & contact form submissions |
| `/dashboard/admin/users` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Client (`"use client"`) + Server Actions | User account management, roles, ban/unban, restricts |
| `/dashboard/admin/verifications` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Server Actions | KYC verification document review pipeline |
| `/dashboard/admin/weddings` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Server Actions | Master wedding catalog, tier overrides, suspend/live |
| `/dashboard/admin/weddings/[id]` | Page | `page.tsx` | `id` (Wedding UUID) | Authenticated | `ADMIN` | Server (SSR) + Client island | Wedding editor, ceremony builder, tier assignment |
| `/dashboard/admin/weddings/sponsorship` | Page | `page.tsx` | None | Authenticated | `ADMIN` | Server (SSR) + Server Actions | Sponsorship CRM, payment verification, promo boost |
| `/dashboard/bookings` | Page | `page.tsx`, `loading.tsx` | None | Authenticated | `TRAVELER` | Client (`"use client"`) + Server Actions | Traveler booking manager, tickets, past celebrations |
| `/dashboard/celebrations` | Page | `page.tsx` | None | Authenticated | `COUPLE` | Server (SSR) | Host wedding celebrations list & guest rosters |
| `/dashboard/check-in` | Page | `page.tsx`, `ClientCheckInScanner.tsx` | None | Authenticated | `COUPLE`, `COORDINATOR`, `ADMIN` | Client (`"use client"`) + Server Actions | Live QR scanner & guest pass validation engine |
| `/dashboard/earnings` | Page | `page.tsx`, `ClientPayoutForm.tsx` | None | Authenticated | `COUPLE`, `AGENT` | Server (SSR) + Client island | Payout ledger, escrow release status, bank accounts |
| `/dashboard/events` | Page | `page.tsx`, `loading.tsx` | None | Authenticated | `TRAVELER` | Server (SSR) | Upcoming booked wedding itineraries & timelines |
| `/dashboard/events/[bookingId]` | Page | `page.tsx`, `ClientEventHubForm.tsx` | `bookingId` (Booking UUID) | Authenticated | `TRAVELER`, `ADMIN` | Server (SSR) + Client island | Live Guest Hub: encrypted QR pass, emergency contacts |
| `/dashboard/leads` | Page | `page.tsx` | None | Authenticated | `COUPLE`, `ADMIN` | Server (SSR) | Prospective guest inquiries & booking lead pipeline |
| `/dashboard/listings` | Page | `page.tsx`, `loading.tsx` | None | Authenticated | `COUPLE`, `ADMIN` | Server (SSR) + Server Actions | Host wedding listing manager, draft editor |
| `/dashboard/messages` | Page | `page.tsx`, `loading.tsx` | None | Authenticated | All Logged-in | Client (`"use client"`) + Realtime/Actions | In-app messaging between travelers, hosts, admins |
| `/dashboard/notifications` | Page | `page.tsx` | None | Authenticated | All Logged-in | Client (`"use client"`) + Server Actions | User notification center & alerts |
| `/dashboard/operations` | Page | `page.tsx`, `ClientOperationsCenter.tsx` | None | Authenticated | `COUPLE`, `COORDINATOR`, `ADMIN` | Server (SSR) + Client island | Wedding day operations, coordinator liaison, contacts |
| `/dashboard/profile` | Page | `page.tsx` | None | Authenticated | All Logged-in | Client (`"use client"`) + Server Actions | User profile editor, dietary/cultural preferences |
| `/dashboard/referrals` | Page | `page.tsx`, `ClientReferralCenter.tsx` | None | Authenticated | All Logged-in | Server (SSR) + Client island | Referral link generator, click stats, earned credits |
| `/dashboard/safety` | Page | `page.tsx` | None | Authenticated | All Logged-in | Server (SSR) | User safety center, active cases, appeal status |
| `/dashboard/safety/report` | Page | `page.tsx`, `ClientReportForm.tsx` | None | Authenticated | All Logged-in | Client (`"use client"`) + Server Actions | Formal safety incident reporting form |
| `/dashboard/settings` | Page | `page.tsx` | None | Authenticated | All Logged-in | Client (`"use client"`) + Server Actions | User preferences: currency, language, notifications |
| `/dashboard/verification` | Page | `page.tsx` | None | Authenticated | All Logged-in | Server (SSR) + Client island | Identity document upload (Passport, Aadhaar, KYC) |
| `/dashboard/wishlist` | Page | `page.tsx` | None | Authenticated | `TRAVELER` | Client (`"use client"`) + Server Actions | Saved favorite weddings & custom collections |
| `/destinations` | Page | `page.tsx` | None | Public | None | Server (SSR) | Regional destination hub (Note: shadowed by redirect) |
| `/destinations/delhi-ncr` | Page | `page.tsx` | None | Public | None | Static / SSR | Regional guide: Delhi NCR weddings |
| `/destinations/goa` | Page | `page.tsx` | None | Public | None | Static / SSR | Regional guide: Goa beach & Christian weddings |
| `/destinations/kerala` | Page | `page.tsx` | None | Public | None | Static / SSR | Regional guide: Kerala backwater weddings |
| `/destinations/mumbai` | Page | `page.tsx` | None | Public | None | Static / SSR | Regional guide: Mumbai Bollywood & Parsi weddings |
| `/destinations/punjab` | Page | `page.tsx` | None | Public | None | Static / SSR | Regional guide: Punjabi Sikh Anand Karaj |
| `/destinations/rajasthan` | Page | `page.tsx` | None | Public | None | Static / SSR | Regional guide: Rajasthan royal palace weddings |
| `/dpdp` | Page | `page.tsx` | None | Public | None | Static / SSR | Digital Personal Data Protection Act (India) notice |
| `/for-agents` | Page | `page.tsx`, `layout.tsx` | None | Public | None | Client (`"use client"`) | Travel Agent partnership landing page |
| `/for-agents/apply` | Page | `page.tsx` | None | Authenticated | Any Logged-in | Client (`"use client"`) + API | Agent application submission form |
| `/for-agents/dashboard` | Page | `page.tsx`, `layout.tsx` | None | Authenticated | `AGENT`, `ADMIN` | Client (`"use client"`) + API | Agent portal: referral tracking, commissions |
| `/for-couples` | Page | `page.tsx`, `layout.tsx` | None | Public | None | Client (`"use client"`) | Host value proposition & earning calculator |
| `/for-travelers` | Page | `page.tsx` | None | Public | None | Static / SSR | Foreign traveler cultural primer & safety promise |
| `/founder/tanishq-gupta` | Page | `page.tsx` | None | Public | None | Static / SSR | Founder identity, credentials, mission statement |
| `/gdpr` | Page | `page.tsx` | None | Public | None | Static / SSR | GDPR compliance, data subject rights, DPO contact |
| `/grievance` | Page | `page.tsx` | None | Public | None | Static / SSR | Grievance officer contact details & escalation path |
| `/guest-safety` | Page | `page.tsx` | None | Public | None | Static / SSR | Foreign guest safety protocols, emergency guidelines |
| `/host-agreement` | Page | `page.tsx` | None | Public | None | Static / SSR | Host family legally binding service agreement |
| `/host-safety` | Page | `page.tsx` | None | Public | None | Static / SSR | Host family security standards & guest vetting rules |
| `/how-it-works` | Page | `page.tsx`, `layout.tsx` | None | Public | None | Client (`"use client"`) | 4-step guide for guests and hosts |
| `/incident-report` | Page | `page.tsx` | None | Public / Auth | None | Static / SSR | Public incident reporting guide & emergency hotline |
| `/insurance` | Page | `page.tsx` | None | Public | None | Static / SSR | Travel medical insurance recommendations & FAQs |
| `/learn` | Page | `page.tsx` | None | Public | None | Static / SSR | Cultural education knowledge base directory |
| `/learn/can-foreigners-attend-indian-weddings` | Page | `page.tsx` | None | Public | None | Static / SSR | Cultural guide: legality, invitation authenticity |
| `/learn/how-to-attend-an-indian-wedding` | Page | `page.tsx` | None | Public | None | Static / SSR | Step-by-step traveler walkthrough |
| `/learn/indian-wedding-etiquette-for-foreigners` | Page | `page.tsx` | None | Public | None | Static / SSR | Do's and Don'ts: gifts, footwear, customs |
| `/learn/indian-wedding-experience-cost` | Page | `page.tsx` | None | Public | None | Static / SSR | Transparent cost breakdown & tier explanation |
| `/learn/indian-wedding-food-guide` | Page | `page.tsx` | None | Public | None | Static / SSR | Dietary guide: spice levels, vegetarianism, hygiene |
| `/learn/indian-wedding-rituals-explained` | Page | `page.tsx` | None | Public | None | Static / SSR | Meaning of Sangeet, Haldi, Baraat, Pheras |
| `/learn/indian-wedding-tourism` | Page | `page.tsx` | None | Public | None | Static / SSR | Cultural tourism & economic impact analysis |
| `/learn/what-to-wear-to-an-indian-wedding` | Page | `page.tsx` | None | Public | None | Static / SSR | Attire guide: Sarees, Lehengas, Kurtas, Colors |
| `/list-wedding` | Page | `page.tsx`, `layout.tsx` | None | Auth (or Draft) | Any Logged-in | Client (`"use client"`) + Actions/API | 4-step interactive host wedding listing wizard |
| `/login` / `/login/[[...rest]]` | Page | `page.tsx`, `layout.tsx` | Catch-all | Public | None | Client (`"use client"`) | Clerk authentication sign-in with redirect handle |
| `/offline` | Page | `page.tsx`, `layout.tsx` | None | Public | None | Client (`"use client"`) | PWA service worker offline fallback screen |
| `/onboarding` | Page | `page.tsx`, `layout.tsx` | None | Authenticated | Any Logged-in | Client (`"use client"`) + Server Actions | Role selection (Traveler vs Host vs Agent) |
| `/payment-terms` | Page | `page.tsx` | None | Public | None | Static / SSR | Escrow protection, fee structure, payment guarantees |
| `/photo-video-consent`| Page | `page.tsx` | None | Public | None | Static / SSR | Media capture, drone usage, and privacy guidelines |
| `/privacy` | Page | `page.tsx` | None | Public | None | Static / SSR | Privacy policy & data protection standards |
| `/refund-policy` | Page | `page.tsx` | None | Public | None | Static / SSR | Refund matrix, timelines, dispute resolution |
| `/safety` | Page | `page.tsx` | None | Public | None | Static / SSR | Trust & Safety overview: 5-pillar security model |
| `/signup` / `/signup/[[...rest]]` | Page | `page.tsx`, `layout.tsx` | Catch-all | Public | None | Client (`"use client"`) | Clerk user registration with affiliate attribution |
| `/terms` | Page | `page.tsx` | None | Public | None | Static / SSR | Master platform Terms of Service |
| `/trademark` | Page | `page.tsx` | None | Public | None | Static / SSR | Brand guidelines, logo usage, trademark rights |
| `/travel-visa` | Page | `page.tsx` | None | Public | None | Static / SSR | India e-Visa guide, embassy letters, requirements |
| `/traveler-agreement`| Page | `page.tsx` | None | Public | None | Static / SSR | Foreign traveler code of conduct agreement |
| `/weddings` | Page | `page.tsx`, `loading.tsx`, `SortSelect.tsx` | Query params | Public | None | Server (SSR) + Client Filter | Marketplace search, multi-facet filter, sorting |
| `/weddings/map` | Page | `page.tsx`, `layout.tsx` | None | Public | None | Client (`"use client"`) | Interactive geolocation map view of wedding listings |
| `/weddings/[slug]` | Page | `page.tsx`, `loading.tsx` | `slug` (Wedding slug) | Public | None | Server (SSR) + Client Modal | Wedding detail page: ceremonies, host bio, reviews |
| `/wishlist/shared` | Page | `page.tsx`, `layout.tsx` | None | Public / Auth | None | Server (SSR) | Public shared wishlist directory |
| `/wishlist/shared/[token]` | Page | `page.tsx` | `token` (Wishlist share token) | Public | None | Server (SSR) | Tokenized public view of a traveler's wishlist |

---

### 1.3 Section C: API Endpoints Inventory (All 21 Endpoints)

| Endpoint Path | HTTP Method(s) | Dynamic Route Params | Auth Level | Role Authorization | Request Validation | Response Status Codes | Rate Limit | Cache-Control Header |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/account/bookings` | `GET` | None | Authenticated | `TRAVELER` | None | `200`, `401`, `404`, `500` | None | Inherits default API no-cache |
| `/api/admin/agents` | `GET`, `PATCH` | None | Authenticated | `ADMIN` | JSON body (`agentProfileId`, `action: 'approve' \| 'reject'`) | `200`, `400`, `401`, `403`, `404`, `500` | None | Inherits default API no-cache |
| `/api/admin/bookings` | `GET`, `PATCH` | None | Authenticated | `ADMIN` | JSON body (`bookingId`, `status: BookingStatus`) | `200`, `400`, `401`, `403`, `500` | None | Inherits default API no-cache |
| `/api/admin/hosts` | `GET`, `PATCH` | None | Authenticated | `ADMIN` | JSON body (`weddingId`, `action: 'approve' \| 'reject' \| 'make_live'`, `reason?`) | `200`, `400`, `401`, `403`, `500` | None | Inherits default API no-cache |
| `/api/admin/overview` | `GET` | None | Authenticated | `ADMIN` | None | `200`, `401`, `403`, `500` | None | Inherits default API no-cache |
| `/api/agent-application`| `POST` | None | Authenticated | `AGENT` | JSON body (`fullName`, `email`, `city`, `networkType`, `focusArea`) | `200`, `400`, `401`, `409`, `500` | None | Inherits default API no-cache |
| `/api/agents/dashboard` | `GET` | None | Authenticated | `AGENT` | None | `200`, `401`, `500` | None | Inherits default API no-cache |
| `/api/contact` | `POST` | None | Public | None | Sanitized string checks, honeypot (`website`), 60s duplicate check | `200`, `400`, `429`, `500` | 5 req / 10 min per IP | Inherits default API no-cache |
| `/api/cron/commission-settlement` | `GET` | None | Cron Secret | Bearer token (`CRON_SECRET`) | None | `200`, `401`, `500`, `503` | None | `force-dynamic` |
| `/api/cron/event-reminders` | `GET` | None | Cron Secret | Bearer token (`CRON_SECRET`) | None | `200`, `401`, `500`, `503` | None | `force-dynamic` |
| `/api/health` | `GET` | None | Public | None | None | `200`, `503` | None | `no-store` |
| `/api/host-application` | `GET`, `POST` | None | Authenticated | `TRAVELER` (auto-promoted to `COUPLE`), `COUPLE` | Cultural authenticity validation (`validateWeddingAuthenticity`), required fields | `200`, `400`, `401`, `403`, `500`, `503` | None | Inherits default API no-cache |
| `/api/invoice/[bookingId]` | `GET` | `bookingId` | Authenticated | `ADMIN` or Booking Owner (`traveler.userId === user.id`) | None | `200` (HTML), `403`, `404`, `500` | None | `Content-Type: text/html` |
| `/api/newsletter` | `POST` | None | Public | None | Zod schema (`newsletterSchema` email validation) | `200`, `400`, `429`, `500` | 10 req / 10 min per IP | Inherits default API no-cache |
| `/api/readiness` | `GET` | None | Public | None | None | `200`, `503` | None | `force-dynamic` |
| `/api/ready` | `GET` | None | Public | None | None | `200`, `503` | None | `no-store`, `force-dynamic` |
| `/api/reports/host/[weddingId]` | `GET` | `weddingId` | Authenticated | `ADMIN` or Wedding Owner (`hostCouple.userId === user.id`) | None | `200` (CSV), `403`, `404`, `500` | None | `Content-Type: text/csv` |
| `/api/safety/evidence/[evidenceId]` | `GET` | `evidenceId` | Authenticated | `ADMIN`, Uploader, Reporter, Subject, or Case Participant | None | `307` (Redirect to signed URL), `403`, `404`, `500` | None | `force-dynamic` |
| `/api/test/auth` | `GET`, `POST` | None | Test Env Only | Restricted by `isE2ETestAuthEnabled()` | Query params (`email`, `role`, `redirect`) or JSON body | `200`, `307`, `404` | None | `force-dynamic` |
| `/api/uploadthing` | `GET`, `POST` | None | Handled by Router | Session verified in FileRouter `.middleware()` | UploadThing protocol | `200`, `400`, `401`, `500` | Handled by UT | Managed by UploadThing |
| `/api/webhooks/stripe` | `POST` | None | Webhook Signature | Cryptographic HMAC signature (`stripe.webhooks.constructEvent`) | Stripe Webhook Payload & DB Idempotency (`StripeWebhookEvent`) | `200`, `400`, `500` | None | `force-dynamic` |

---

### 1.4 Prisma & Database Schema Audit
- **Total Models**: 84
- **Total Enums**: 29
- **Database Provider**: PostgreSQL (Direct URL configured via Supabase pooling)

#### Critical Index & Foreign Key Audit Findings:
1. **Missing Indexes on Foreign Key Columns**:
   - `Commission.commissionRuleId` -> References `CommissionRule(id)` without an index.
   - `Commission.payoutRequestId` -> References `PayoutRequest(id)`. Indexed only as the 3rd column of composite index `[agentId, status, payoutRequestId]`, preventing efficient single-column lookups by `payoutRequestId`.
   - `UserRestriction.createdById` -> References `User(id)` without an index.
   - `UserRestriction.revokedById` -> References `User(id)` without an index.

2. **Soft Delete (`deletedAt`) Index Audit**:
   Out of 11 models implementing `deletedAt`, only 1 model (`Wedding`) includes `deletedAt` in an index (`@@index([status, suspended, deletedAt, date])`).
   The following 10 models have **unindexed `deletedAt`** columns:
   - `User`
   - `TravelerProfile`
   - `CoupleProfile`
   - `AgentProfile`
   - `CoordinatorProfile`
   - `Booking`
   - `Review`
   - `Payment`
   - `Message`
   - `ReviewReply`
   *Impact*: As soft-deleted records accumulate, queries filtering `where: { deletedAt: null }` will degrade to sequential scans on large tables.

3. **Migration History Verification**:
   12 migration directories confirmed in `prisma/migrations`:
   - `20260701000000_init_baseline`
   - `20260711180000_phase_13_trust_safety_disputes`
   - `20260711181000_phase_13_5_trust_safety_corrections`
   - `20260711190000_phase_14_reputation_quality_engine`
   - `20260712030000_phase_14_5_corrections`
   - `20260712040000_phase_14_7_corrections`
   - `20260716000000_wedding_listing_fields`
   - `20260817000000_add_wedding_side_and_sponsorship_requests`
   - `20260820000000_production_sponsorship_lifecycle_and_indexes`
   - `20260821000000_sponsorship_payment_crm_and_config`
   - `20260821010000_add_promotion_type_and_proposed_amount`
   - `20260822000000_phase_21_host_applications`
   *Consistency*: All 84 models in `schema.prisma` correspond directly to the cumulative migration definitions.

---

### 1.5 Server vs Client Component Boundaries & Data Fetching

1. **Client Component Inventory**:
   - `"use client"` directive is present in **43 app page/island files** and **44 reusable component files** (87 files total).
   - Client components are used primarily for interactive UI: multi-step wizards (`app/list-wedding/page.tsx`), QR scanners (`components/dashboard/ClientCheckInScanner.tsx`), charts/diagrams, modals, and forms (`react-hook-form`).

2. **Heavy Client Libraries & Bundle Weight**:
   - `framer-motion` (^12.42.2) is imported across multiple public and dashboard components. `next.config.ts` mitigates bundle bloat via `experimental.optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"]`.
   - `qrcode` / `@types/qrcode` is used on the client in `ClientQRSection.tsx` and `GuestQRCodeModal.tsx`.
   - `sonner` (^2.0.7) handles toast notifications.

3. **Server Actions Security & Data Fetching**:
   - 17 dedicated Server Action modules in `lib/actions/`.
   - All critical mutations enforce authentication via `requireAuth()` (`lib/auth.ts:415`) and verify role privileges via `requireRole()` (`lib/auth.ts:429`) or `requirePermission()` (`lib/rbac.ts:172`).
   - Server Actions use explicit transactions (`prisma.$transaction`) with concurrency row locking (`SELECT ... FOR UPDATE`) in critical flows like `createBookingAction` and `handleGuestApplicationAction`.

---

## 2. Logic Chain

### 2.1 State Machines Formalization (Section E)

```
========================================================================================
1. AUTHENTICATION LIFECYCLE STATE MACHINE
========================================================================================
[GUEST] ──────(Clerk Signup)──────> [ONBOARDING (role: TRAVELER, status: ONBOARDING)]
                                              │
                                     (completeOnboarding)
                                              │
                                              ▼
                                      [ACTIVE (role: TRAVELER/COUPLE/AGENT/COORDINATOR)]
                                        ▲            │                     │
                        (Revoke / Expire)│            │(Safety Restriction) │(Admin Ban)
                                        │            ▼                     ▼
                                 [RESTRICTED] <───────              [BANNED] (HTTP 403)
                                                                           │
                                                                 (Admin UnbanAction)
                                                                           │
                                                                           ▼
                                                                        [ACTIVE]

Valid Transitions:
- GUEST -> ONBOARDING
- ONBOARDING -> ACTIVE
- ACTIVE (TRAVELER) -> ACTIVE (COUPLE) (Self-upgrade on listing creation)
- ACTIVE (TRAVELER) -> ACTIVE (AGENT) (Admin approval required)
- ACTIVE -> RESTRICTED (Disciplinary hold on booking, hosting, messaging, or payouts)
- RESTRICTED -> ACTIVE (Restriction revoked or expired)
- ACTIVE / RESTRICTED -> BANNED (Immediate freeze across all authenticated actions)
- BANNED -> ACTIVE (Admin explicit unban)

Invalid Transitions & Guard Verification:
- GUEST -> ACTIVE: Blocked by Clerk middleware and requireAuth().
- ACTIVE (TRAVELER) -> ADMIN / SUPER_ADMIN: Blocked. Role update action explicitly rejects privilege escalation.
- BANNED -> ANY ACTION: Blocked. requireAuth() at lib/auth.ts:420 throws immediate BANNED error.
- RESTRICTED -> ACTION: Blocked. assertCanBook() / assertCanHost() in lib/actions/safety.ts prevent restricted operations.
```

```
========================================================================================
2. BOOKING LIFECYCLE STATE MACHINE
========================================================================================
[Initial] ──(createBookingAction)──> [PENDING] ──(Host Rejects)──> [REJECTED]
                                        │
                                 (Host Approves)
                                        │
                                        ▼
                              [AWAITING_PAYMENT] ──(Traveler Cancels)──> [CANCELLED]
                                        │
                         (Stripe Webhook / Admin Mark Paid)
                                        │
                                        ▼
                                      [PAID] / [CONFIRMED]
                                        │
                                (Event T-24/48h)
                                        │
                                        ▼
                                [READY_FOR_EVENT] ──(No Show)──> [NO_SHOW]
                                        │
                             (Venue QR Scan Check-in)
                                        │
                                        ▼
                                  [CHECKED_IN]
                                        │
                                 (Event Ends)
                                        │
                                        ▼
                                   [ATTENDED] ──────> [COMPLETED]
                                                           │
                                              (Reviews & Host Payouts)

Post-Payment Cancellation Sub-flow:
[PAID / CONFIRMED / READY_FOR_EVENT] ──(cancelBookingAction)──> [CANCELLED] ──(Refund Processed)──> [REFUNDED]

Valid Transitions:
- PENDING -> AWAITING_PAYMENT (Host approval)
- PENDING -> REJECTED (Host decline)
- PENDING -> CANCELLED (Traveler withdrawal)
- AWAITING_PAYMENT -> PAID / CONFIRMED (Authoritative payment confirmation)
- AWAITING_PAYMENT -> CANCELLED (Payment expired or booking cancelled)
- PAID / CONFIRMED -> READY_FOR_EVENT (Preparation checklist satisfied)
- READY_FOR_EVENT -> CHECKED_IN (Valid QR ticket scan)
- CHECKED_IN -> ATTENDED (Attendance confirmed)
- ATTENDED -> COMPLETED (Post-event settlement)
- READY_FOR_EVENT -> NO_SHOW (Absence at event)
- PAID / CONFIRMED / READY_FOR_EVENT -> CANCELLED -> REFUNDED (Policy-backed refund)

Invalid Transitions & Guard Verification:
- PENDING -> PAID (Skipping host approval): Blocked. Payment requests require host approval.
- AWAITING_PAYMENT -> CONFIRMED (Direct status jump bypassing payment): Blocked. PATCH /api/admin/bookings explicitly prohibits direct status patches to PAID/CONFIRMED (requires adminMarkPaymentPaidAction).
- CANCELLED / REJECTED -> AWAITING_PAYMENT / PAID: Blocked. createOrUpdatePaymentRequestAtomic throws error if booking is CANCELLED/REJECTED.
- COMPLETED / ATTENDED -> CANCELLED: Blocked. Cancellation policy engine checks event date and completion status.
- Duplicate Active Booking: Blocked. createBookingAction checks ACTIVE_RESERVATION_STATUSES.
- Over-Capacity Booking: Blocked. createBookingAction checks capacity across CAPACITY_HOLDING_BOOKING_STATUSES.
```

```
========================================================================================
3. PAYMENT & ESCROW LIFECYCLE STATE MACHINE
========================================================================================
[Initial] ──(adminRequestPaymentAction / Checkout)──> [PENDING]
                                                         │
                                    ┌────────────────────┴────────────────────┐
                          (Stripe Webhook / Admin Mark Paid)           (Payment Failed)
                                    │                                         │
                                    ▼                                         ▼
                                  [PAID]                                   [FAILED]
                          (hostPayoutTransferred: false)
                                    │
                         ┌──────────┴──────────┐
                (Event Concluded)         (Refund Issued)
                         │                     │
                         ▼                     ▼
                 [PAYOUT RELEASED]         [REFUNDED]
           (hostPayoutTransferred: true)

Valid Transitions:
- PENDING -> PAID (Stripe charge success or Admin verifies PayPal transaction ID)
- PENDING -> FAILED (Provider failure)
- PAID -> REFUNDED (Manual or Stripe refund execution)
- Escrow Release: PENDING (held in platform escrow) -> RELEASED (transferred to host after attendance)

Invalid Transitions & Guard Verification:
- PAID -> PENDING (Reverting a completed payment): Blocked. adminUpdatePaymentRequestAction explicitly rejects modifying PAID payments.
- Duplicate Transaction ID Reuse: Blocked. markPaymentPaidAtomic verifies transactionId is not already assigned to another payment.
- Duplicate Webhook Replays: Blocked. Database table StripeWebhookEvent guarantees idempotency via unique stripeEventId.
```

```
========================================================================================
4. WEDDING LISTING & SPONSORSHIP LIFECYCLE STATE MACHINE
========================================================================================
[Initial] ──(Host /list-wedding / createWedding)──> [DRAFT (status: DRAFT, isDemo: false)]
                                                         │
                                        (Admin KYC & Listing Review)
                                                         │
                                                         ▼
                                       [PUBLISHED (status: PUBLISHED)]
                                         │                       ▲
                            (Admin Suspend)│                       │(Admin Resolve)
                                         ▼                       │
                                   [SUSPENDED (suspended: true)] ┘
                                         │
                                   (Event Concludes)
                                         │
                                         ▼
                                    [COMPLETED]

Sponsorship Sub-lifecycle:
[PENDING] ──(Admin Approve)──> [APPROVED / PAYMENT_PENDING] ──(Host Pays)──> [PAID] ──(Admin Activate)──> [ACTIVE (wedding.sponsored=true)] ──(Expire / Revoke)──> [EXPIRED / REVOKED]

Valid Transitions:
- DRAFT -> PUBLISHED (Admin approval)
- PUBLISHED -> DRAFT (Admin unpublish)
- PUBLISHED -> SUSPENDED (Trust & Safety temporary hold)
- SUSPENDED -> PUBLISHED (Safety hold cleared)
- PUBLISHED -> COMPLETED (Wedding concluded)
- Sponsorship: PENDING -> APPROVED -> PAYMENT_PENDING -> PAID -> ACTIVE -> EXPIRED / REVOKED

Invalid Transitions & Guard Verification:
- Host Self-Publishing without Admin Review: Blocked. editWedding action only updates DRAFT fields; only admin actions can set PUBLISHED.
- Booking a DRAFT / SUSPENDED / DEMO Wedding: Blocked. createBookingAction enforces status === PUBLISHED, !suspended, and !isDemo.
```

```
========================================================================================
5. HOST VERIFICATION LIFECYCLE STATE MACHINE
========================================================================================
[NOT_SUBMITTED / DRAFT] ──(Host Submits KYC)──> [SUBMITTED / PENDING]
                                                       │
                                            (Admin Begins Review)
                                                       │
                                                       ▼
                                                [UNDER_REVIEW]
                                                       │
                           ┌───────────────────────────┼───────────────────────────┐
                  (Admin Approves)             (Action Required)            (Admin Rejects)
                           │                           │                           │
                           ▼                           ▼                           ▼
                       [APPROVED]             [ACTION_REQUIRED /               [REJECTED]
                (APPROVED_FOR_LISTING)       NEED_MORE_DOCUMENTS]
                           │                           │
                   (Listing Goes Live)          (Host Uploads)
                                                       │
                                                       ▼
                                                [UNDER_REVIEW]

Valid Transitions:
- NOT_SUBMITTED / DRAFT -> SUBMITTED / PENDING (Host submits application and KYC docs)
- SUBMITTED / PENDING -> UNDER_REVIEW (Admin triages application)
- UNDER_REVIEW -> ACTION_REQUIRED / NEED_MORE_DOCUMENTS (Admin requests supplemental evidence)
- ACTION_REQUIRED -> UNDER_REVIEW (Host uploads requested documents)
- UNDER_REVIEW -> APPROVED / APPROVED_FOR_LISTING (Admin approves KYC and publishes listing)
- UNDER_REVIEW -> REJECTED (Admin declines with stated reason)
- SUBMITTED / ACTION_REQUIRED -> WITHDRAWN (Host cancels application)

Invalid Transitions & Guard Verification:
- Unverified Host Publishing Live: Blocked. Requires admin review action.
- Approving Banned Host: Blocked. Verification actions check user status.
```

---

### 2.2 Section K: Code Hotspots & Duplicated Logic Analysis

#### 1. Architectural God-Components & Cyclomatic Complexity Hotspots

| File Path | Lines | File Size | Primary Concerns & Complexity Drivers |
| :--- | :--- | :--- | :--- |
| `lib/actions/admin.ts` | 2,990 lines | 105 KB | **Monolithic God-Action**: Implements 35+ disparate admin actions (finance, users, safety, weddings, hosts, verifications, sponsorships, discovery). High maintenance liability and risk of cross-domain regressions. |
| `lib/actions/index.ts` | 2,087 lines | 75 KB | **Overloaded Core Actions**: Combines traveler booking, profile management, onboarding, notifications, verification, and sponsorship into a single monolithic file. |
| `lib/data.ts` | 2,332 lines | 88 KB | **Static Data Bloat**: Massive mock data file containing 2,300+ lines of static listings, testimonials, and FAQs. Only used as fallback in `app/page.tsx`, yet adds significant bundle overhead. |
| `lib/services/sponsorship.ts` | 1,400+ lines | 60 KB | **Complex Lifecycle Service**: Contains 10-step progress checklists, payment CRM, configuration, and promotion engine. |
| `lib/actions/host-application.ts`| 957 lines | 33 KB | **Multi-Entity Synchronization Engine**: Simultaneously coordinates `HostApplication`, `HostApplicationDay`, `HostApplicationEvent`, `CoupleProfile`, `Wedding`, `Verification`, and `AuditLog`. |
| `app/weddings/[slug]/page.tsx` | 800+ lines | ~35 KB | **Heavy Presentation & State Container**: Renders wedding details, multi-day itinerary, host profile, cultural guidelines, FAQ, reviews, pricing sidebar, and booking modal in a single file. |
| `app/list-wedding/page.tsx` | 750+ lines | ~32 KB | **Multi-Step Client Wizard**: Manages complex 4-step client state, cultural defaults, image uploads, and post-auth resume logic. |

#### 2. Duplicated Logic & Formatting Redundancies

1. **Triple Health/Readiness Endpoint Duplication**:
   - `app/api/health/route.ts`
   - `app/api/readiness/route.ts`
   - `app/api/ready/route.ts`
   *Observation*: All three execute `SELECT 1` on PostgreSQL and return similar JSON status payloads.
   *Recommendation*: Standardize on `/api/health` for liveness and `/api/ready` for readiness; remove or alias the third.

2. **Duplicated Referral Code Generation**:
   - `app/api/agent-application/route.ts:20` -> `crypto.randomBytes(3).toString('hex').toUpperCase()`
   - `lib/actions/referrals.ts:35` -> Custom generator
   - `lib/actions/admin.ts:1820` -> Custom generator
   *Recommendation*: Centralize into `lib/security/tokens.ts` or `lib/attribution/referrals.ts`.

3. **Duplicated Price and Currency Formatters**:
   - `lib/currency.ts`
   - `lib/utils.ts` (`formatPrice`)
   - `lib/services/pricing-engine.ts`
   - `app/api/invoice/[bookingId]/route.ts:13`
   *Observation*: Currency symbol mapping, decimal formatting, and INR/USD conversions are independently re-implemented across 4 files.

4. **Duplicated Cultural Defaults**:
   - `lib/culture.ts` (`resolveCulturalProfileDefaults`)
   - `lib/data.ts` (inline religion defaults)
   - `app/api/host-application/route.ts` (inline defaults)

#### 3. Route Collision & Dead Routes

1. **The `/destinations` Route Shadowing Collision**:
   - `app/destinations/page.tsx` is a fully built 266-line regional destination hub with structured metadata, imagery, and links to regional subpages (`/destinations/rajasthan`, `/destinations/goa`, etc.).
   - However, `next.config.ts:124` defines:
     ```typescript
     { source: "/destinations", destination: "/weddings", permanent: true }
     ```
   - *Impact*: Any request to `/destinations` is permanently redirected (HTTP 308) to `/weddings`, making `app/destinations/page.tsx` **completely unreachable (dead code)**!
   - *Subpages unaffected*: Direct hits to `/destinations/rajasthan` still load, but the main landing directory is blocked.

2. **Dead Test Routes in Production**:
   - `app/api/test/auth/route.ts` is guarded by `isE2ETestAuthEnabled()`. When disabled in production, it returns 404, but the route file remains compiled into the production deployment bundle.

---

## 3. Caveats
- **Read-Only Non-Destructive Constraint**: No files or database tables were modified during this investigation.
- **Dynamic Database State**: Database metrics (record counts) reflect schema analysis and static migration analysis; live row counts depend on production database contents.
- **Clerk Hosted Auth Flow**: Client-side Clerk widget internals (`@clerk/nextjs`) execute in iframe/SDK runtime outside this repository's codebase; analysis covers the integration layer, middleware (`proxy.ts`), and PostgreSQL sync (`syncAndGetDbUser`).

---

## 4. Conclusion
1. **Architecture & Routing (Section C)**:
   - 162 Next.js App Router files across 65+ URL paths and 21 API endpoints are active, structured, and strictly protected by role-based authorization (`proxy.ts`, `lib/auth.ts`, and `lib/rbac.ts`).
   - A critical routing configuration collision exists in `next.config.ts:124`, where a permanent redirect from `/destinations` to `/weddings` shadows the fully developed `app/destinations/page.tsx`.

2. **Database Schema & Prisma**:
   - 84 Models and 29 Enums provide comprehensive modeling of all marketplace facets (users, weddings, bookings, escrow, reviews, safety, and reputation).
   - 4 foreign keys lack direct indexes (`Commission.commissionRuleId`, `Commission.payoutRequestId`, `UserRestriction.createdById`, `UserRestriction.revokedById`).
   - 10 models lack indexes on `deletedAt`, presenting a future query performance bottleneck under soft-delete volume.

3. **Core State Machines (Section E)**:
   - All 5 critical lifecycles (Authentication, Booking, Payment, Wedding, Host Verification) possess formal valid transitions and are defensively guarded against illegal transitions, price manipulation, duplicate active bookings, capacity overruns, and unverified self-publishing.

4. **Code Hotspots & Tech Debt (Section K)**:
   - God-components `lib/actions/admin.ts` (2,990 lines) and `lib/actions/index.ts` (2,087 lines) represent the highest cyclomatic complexity and maintenance risk.
   - `lib/data.ts` (88KB static mock data) contributes avoidable bundle weight and should be pruned or transitioned into database seeders.

---

## 5. Verification Method

### How to Independently Verify:
1. **Route & Special Files Verification**:
   ```powershell
   Get-ChildItem -Path app -Recurse | Where-Object { $_.Name -match '^(page|layout|loading|error|not-found|route)\.(tsx|ts)$' } | Measure-Object
   ```
   *Expected*: Exactly 162 files returned.

2. **API Endpoint Verification**:
   ```powershell
   Get-ChildItem -Path app/api -Recurse -Filter "route.ts" | Select-Object FullName
   ```
   *Expected*: Exactly 21 `route.ts` files returned.

3. **Prisma Model & Enum Count Verification**:
   ```powershell
   node -e "const fs = require('fs'); const s = fs.readFileSync('prisma/schema.prisma', 'utf8'); console.log('Models:', (s.match(/model\s+\w+\s+{/g)||[]).length, 'Enums:', (s.match(/enum\s+\w+\s+{/g)||[]).length);"
   ```
   *Expected*: Models: 84, Enums: 29.

4. **Destination Redirect Shadowing Inspection**:
   Inspect `next.config.ts` lines 124-127 and compare with `app/destinations/page.tsx`.

5. **Typecheck & Build Validation**:
   ```powershell
   npm run type-check
   ```
