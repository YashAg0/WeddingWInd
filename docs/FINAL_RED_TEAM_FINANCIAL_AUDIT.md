# WeddingWithIndia — Red-Team Financial, Monetization & Security Audit
**Authoritative Hostile Forensic Audit of Commercial Engine & Financial Lifecycles**

---

## A. Executive Verdict

### **SAFE WITH REQUIRED FIXES**

The core commercial matrices (25 Customer Prices in USD, 25 Host Payouts in INR, 5 Agent Payouts in INR) are strictly implemented, verified, and protected against direct client-side price injection. However, hostile red-team auditing identified **4 critical/high financial and ledger discrepancies** in downstream payout recording, host dashboard reporting, and legacy marketing diagrams that must be remediated before accepting live money from foreign travellers.

---

## B. Complete End-to-End Money Flow Diagram

```text
                                  TRAVELLER
                                      │
                 1. Discovers Wedding on Marketplace (/weddings)
                 (Clean USD Price displayed; Hidden on Homepage)
                                      │
                 2. Selects Date & Guest Count (1-50 guests)
                                      │
                 3. Submits Reservation Request (createBookingAction)
                                      │
                                      ▼
                      SERVER-SIDE PRICING DERIVATION
       ┌─────────────────────────────────────────────────────────────┐
       │ - Pessimistic Row Lock on Wedding (SELECT FOR UPDATE)       │
       │ - Capacity Check across Active Bookings                     │
       │ - Authoritative calculateBookingPricing(tier, durationDays) │
       │ - Freezes Commercial Snapshot in Booking Record (Postgres)  │
       └─────────────────────────────────────────────────────────────┘
                                      │
                 4. Admin Reviews & Approves Booking
                                      │
                 5. Admin Generates PayPal Payment Request (adminRequestPaymentAction)
                 (Clean USD amount, verified PayPal link)
                                      │
                 6. Traveller Pays Outside via PayPal Link
                                      │
                 7. Admin Verifies PayPal Transaction ID (adminMarkPaymentPaidAction)
                                      │
                                      ▼
                      ATOMIC PAYMENT CONFIRMATION
       ┌─────────────────────────────────────────────────────────────┐
       │ - Idempotency Guard (Already Paid check)                    │
       │ - Global Uniqueness check on PayPal Transaction ID          │
       │ - Booking transitioned to PAID                              │
       │ - AES-256-GCM Encrypted Digital Pass Issued                 │
       │ - Transaction Ledger CHARGE Entry Created                   │
       │ - Fixed Agent Commission Accrued (14-Day Hold, Pending)     │
       └─────────────────────────────────────────────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
       ATTENDANCE & HOST PAYOUT                      AGENT SETTLEMENT
┌──────────────────────────────────────┐  ┌─────────────────────────────────────┐
│ 8. Guest Check-In & Attendance       │  │ 9. 14-Day Maturity Elapsed          │
│ 9. Safety Clearance Check            │  │ 10. Status -> APPROVED (Payable)    │
│ 10. Admin Disburses Fixed Host INR   │  │ 11. Agent Requests Payout           │
│     (adminProcessHostPayoutAction)   │  │ 12. Admin Reviews & Disburses INR   │
└──────────────────────────────────────┘  └─────────────────────────────────────┘
               │                                             │
               └──────────────────────┬──────────────────────┘
                                      ▼
                         CANCELLATION / REFUND FLOW
       ┌─────────────────────────────────────────────────────────────┐
       │ - Overdraft Check: existingRefunds + amount <= payment.amount│
       │ - Status -> REFUNDED (Full) / PARTIAL_REFUND                │
       │ - Transaction Ledger REFUND Entry Created                   │
       │ - Unvested Agent Commission REVERSED (Status: CANCELLED)    │
       │ - Guest Pass Revoked (if full refund)                       │
       └─────────────────────────────────────────────────────────────┘
```

---

## C. Forensic Findings & Vulnerability Inventory

### 1. [CRITICAL] Host Payout Action Records Customer USD Amount as Payout Amount
- **Severity**: `CRITICAL`
- **File**: [`lib/actions/admin.ts:1400-1409`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/actions/admin.ts#L1400-L1409)
- **Function**: `adminProcessHostPayoutAction`
- **Problem**: When an admin marks a host payout as processed, the system writes `amount: payment.amount` into `prisma.payout.create`. Since `payment.amount` is the **Customer USD Gross Amount** (e.g. $19,980), the ledger records a USD number instead of the host's actual INR fixed entitlement (`booking.totalHostPayoutINR`, e.g. ₹10,22,020).
- **Attack / Failure Scenario**: An admin viewing the payout ledger or export sees an erroneous amount ($19,980 instead of ₹10,22,020), causing accounting distortion between USD customer revenue and INR host liabilities.
- **Financial Impact**: Distorts financial reporting and risks wire/bank transfer discrepancy if an automated integration reads `payout.amount`.
- **Recommended Fix**: Update `adminProcessHostPayoutAction` to set `amount: payment.booking.totalHostPayoutINR || getHostPayoutPerGuestINR(payment.booking.weddingTier, payment.booking.durationDays) * payment.booking.guestsCount`.

---

### 2. [HIGH] Host Couple Dashboard Computes Revenue in USD Instead of Fixed INR
- **Severity**: `HIGH`
- **File**: [`lib/actions/index.ts:1283-1290`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/actions/index.ts#L1283-L1290)
- **Function**: `fetchDashboardDataAction` (for `COUPLE` role)
- **Problem**: Host couple dashboard aggregates `revenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0)` and `budget: $${(b.totalAmount).toLocaleString()}`. This exposes customer USD prices to hosts and displays USD figures in their revenue and pending payout cards instead of their fixed INR earnings (`totalHostPayoutINR`).
- **Attack / Failure Scenario**: Host couples log into `/dashboard` and see "$19,980 USD" or confuse customer revenue with their family payout.
- **Financial Impact**: Communication mismatch, host confusion, and internal price leakage.
- **Recommended Fix**: Update `fetchDashboardDataAction` for `UserRole.COUPLE` to sum `b.totalHostPayoutINR` and format as `₹` INR.

---

### 3. [HIGH] Admin Finance Dashboard Currency Mismatch on Agent Commission Card
- **Severity**: `HIGH`
- **File**: [`app/dashboard/admin/finance/page.tsx:64-66`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/dashboard/admin/finance/page.tsx#L64-L66)
- **Function**: `ExecutiveFinanceDashboardPage`
- **Problem**: The KPI card displays `${finance.agentCommissionsPaid.toLocaleString()} USD` where `finance.agentCommissionsPaid` is the sum of `Commission.commissionAmount` stored in **INR (₹)**.
- **Financial Impact**: An agent commission total of ₹50,220 INR is displayed as "$50,220 USD" on the executive dashboard.
- **Recommended Fix**: Change the card label and formatting to `₹{finance.agentCommissionsPaid.toLocaleString()} INR`.

---

### 4. [HIGH] Residual Legacy 78% Percentage Split Diagrams in Marketing Explainer UI
- **Severity**: `HIGH`
- **Files**:
  - [`components/diagrams/PlatformOverviewDiagram.tsx:48-52`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/components/diagrams/PlatformOverviewDiagram.tsx#L48-L52)
  - [`components/diagrams/HostJourneyDiagram.tsx:34-35`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/components/diagrams/HostJourneyDiagram.tsx#L34-L35)
  - [`app/dashboard/admin/page.tsx:205`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/dashboard/admin/page.tsx#L205)
- **Problem**: Active diagram components still render "Receive 78% Share", "Platform Commission 22%", and "Avg ₹9,935.28", directly contradicting the new fixed INR payout matrix (₹5,101 to ₹61,101 / guest).
- **Financial Impact**: False representation of commercial terms to prospective host families.
- **Recommended Fix**: Update diagram copy and graphics to explain the fixed guaranteed INR host payout model.

---

### 5. [MEDIUM] Manual Payment Request Allows Arbitrary Admin Base Amount Without Soft Bounds
- **Severity**: `MEDIUM`
- **File**: [`lib/actions/payment-manual.ts:32-55`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/actions/payment-manual.ts#L32-L55)
- **Function**: `adminRequestPaymentAction`
- **Problem**: `adminRequestPaymentAction` accepts `baseAmount: number` from the admin. If an admin accidentally types `$599` instead of `$5,994`, the system generates a PayPal request for `$599` without asserting that `baseAmount === booking.customerTotalAmount` or requiring an explicit discount confirmation.
- **Financial Impact**: Admin operational typo could lead to undercharging a customer.
- **Recommended Fix**: Add a warning/validation in `adminRequestPaymentAction` if `params.baseAmount !== booking.customerTotalAmount`, or default to `booking.customerTotalAmount` unless an explicit `allowOverride: true` is confirmed.

---

### 6. [LOW] Agent Notification String Uses Dollar Sign for INR Commission
- **Severity**: `LOW`
- **File**: [`lib/actions/referrals.ts:648`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/actions/referrals.ts#L648)
- **Function**: `generateBookingCommissionAction`
- **Problem**: In-app notification text reads `You earned a commission of $${commissionAmount}`, displaying `$` instead of `₹`.
- **Recommended Fix**: Change to `₹${commissionAmount.toLocaleString("en-IN")}`.

---

## D. Exact Financial Reconciliation (6 Canonical Scenarios)

All numbers verified against [`lib/services/pricing-engine.ts`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/lib/services/pricing-engine.ts):

| Scenario | Tier & Duration | Guests | Gross Customer (USD) | PayPal Fee (4.4%+$0.30) | Net Customer (USD) | Net Post-PayPal (INR @ 95.5/1.03) | Fixed Host Payout (INR) | Fixed Agent Payout (INR) | 5% Reserve (INR) | WWI Contribution After Reserve (INR) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | Standard 1-Day | 1 | **$149.00** | $6.86 | $142.14 | ₹13,179 | ₹5,101 | ₹0 / ₹511 | ₹659 | **₹7,419** *(₹6,908 w/ agent)* |
| **2** | Grand 3-Day | 20 | **$8,980.00** | $395.42 | $8,584.58 | ₹7,95,949 | ₹4,02,020 | ₹30,220 | ₹39,797 | **₹3,23,912** |
| **3** | Royal 4-Day | 20 | **$15,980.00** | $703.42 | $15,276.58 | ₹14,16,421 | ₹8,22,020 | ₹40,220 | ₹70,821 | **₹4,83,360** |
| **4** | Signature Royal 4-Day | 20 | **$19,980.00** | $879.42 | $19,100.58 | ₹17,70,976 | ₹10,22,020 | ₹50,220 | ₹88,549 | **₹6,10,187** |
| **5** | Signature Royal 5-Day | 20 | **$23,980.00** | $1,055.42 | $22,924.58 | ₹21,25,531 | ₹12,22,020 | ₹50,220 | ₹1,06,277 | **₹7,47,014** |
| **6** | Signature Royal 5-Day | 50 | **$59,950.00** | $2,638.10 | $57,311.90 | ₹53,13,870 | ₹30,55,050 | ₹1,25,550 | ₹2,65,694 | **₹18,67,576** |

*Verification of Signature Royal 4-Day 20-Guest Benchmark: Host Payout = ₹51,101 × 20 = **₹10,22,020** (Exact match to business specification).*

---

## E. Authoritative Matrix Verification

### 1. Customer Price Matrix (25/25 USD per Guest) — PASS
- **Standard**: 1d $149 | 2d $199 | 3d $249 | 4d $299 | 5d $349
- **Enhanced**: 1d $179 | 2d $249 | 3d $299 | 4d $349 | 5d $399
- **Grand**: 1d $229 | 2d $329 | 3d $449 | 4d $549 | 5d $649
- **Royal**: 1d $299 | 2d $449 | 3d $649 | 4d $799 | 5d $949
- **Signature Royal**: 1d $399 | 2d $799 | 3d $999 | 4d $999 | 5d $1,199

### 2. Host Payout Matrix (25/25 INR per Eligible Guest) — PASS
- **Standard**: 1d ₹5,101 | 2d ₹7,101 | 3d ₹9,101 | 4d ₹11,101 | 5d ₹13,101
- **Enhanced**: 1d ₹7,101 | 2d ₹10,101 | 3d ₹13,101 | 4d ₹16,101 | 5d ₹19,101
- **Grand**: 1d ₹10,101 | 2d ₹15,101 | 3d ₹20,101 | 4d ₹27,101 | 5d ₹32,101
- **Royal**: 1d ₹15,101 | 2d ₹22,101 | 3d ₹32,101 | 4d ₹41,101 | 5d ₹51,101
- **Signature Royal**: 1d ₹20,101 | 2d ₹30,101 | 3d ₹41,101 | 4d ₹51,101 | 5d ₹61,101

### 3. Agent Payout Matrix (5/5 Fixed INR per Guest) — PASS
- **Standard**: ₹511 | **Enhanced**: ₹1,011 | **Grand**: ₹1,511 | **Royal**: ₹2,011 | **Signature Royal**: ₹2,511

---

## F. Payment Flow & Transaction Verification — PASS
1. **Domain Allowlist Validation**: `validatePaymentLink()` rejects non-PayPal domains (only `paypal.com`, `paypal.me`, `py.pl` allowed).
2. **Transaction ID Global Uniqueness**: Verified by `markPaymentPaidAtomic` to prevent reusing transaction IDs across multiple bookings.
3. **Idempotency Guard**: Repeated clicks or concurrent confirmations return safe existing state without re-accruing commissions or issuing duplicate guest passes.
4. **Digital Pass Issuance**: Passes are encrypted via AES-256-GCM with SHA-256 hashed lookup tokens.

---

## G. Payout & Agent Attribution Verification — PASS
1. **Self-Referral Prevention**: Agents attempting to refer their own account are blocked and flagged with `SELF_REFERRAL_COMMISSION_ATTEMPT`.
2. **Commission Idempotency**: Protected by unique compound key `BOOKING_PAYMENT:${paymentId}:${agentId}`.
3. **14-Day Maturation Period**: Commissions remain in `PENDING` state until 14 days post-payment, preventing early withdrawal before event clearance.
4. **Safety Hold Enforcement**: `assertCanRequestPayout` and `isFinanciallyHeld` prevent payouts if any party is subject to an active safety case.

---

## H. Refund Flow & Liability Reversal Verification — PASS
1. **Overdraft Protection**: `recordManualRefundAtomic` enforces `existingRefunds + refundAmount <= payment.amount`.
2. **Commission Reversal**: Automatically reverses unvested agent commissions upon refund (`reverseBookingCommissionAction`).
3. **Ledger Immutability**: All refunds write a separate `REFUND` ledger row into `Transaction`.

---

## I. Security & Price Injection Protection — PASS
1. **Zero Client Price Input**: `createBookingAction` does NOT accept `pricePerGuest`, `totalAmount`, or tier overrides from the client.
2. **Concurrency Safety**: Employs PostgreSQL row-level lock (`SELECT ... FOR UPDATE`) inside the booking creation transaction.
3. **Demo Wedding Isolation**: Invariant `if (wedding.isDemo) throw Error(...)` blocks booking creation on showcase weddings.

---

## J. Legacy Logic Residue Analysis

| Legacy String / Pattern | Locations | Classification | Action Required |
| :--- | :--- | :--- | :--- |
| `1.35x` / `2.0x` multipliers | Audit docs only | `SAFE / HISTORICAL` | None |
| `78% Host Share` | `PlatformOverviewDiagram.tsx`, `HostJourneyDiagram.tsx`, `admin/page.tsx` | `ACTIVE UI BUG` | **Fix in next patch** |
| `stripeTransferId` | `prisma/schema.prisma:486`, `admin.ts:1405` | `LEGACY COLUMN NAME` | Safe, used as internal platform reference |
| `paymentFeeAmount: 0` | `Booking.paymentFeeAmount`, `actions/index.ts:650` | `SAFE` | Reflects zero customer-facing surcharge |

---

## K. Database Schema & Migration Verification — PASS
- **Schema Push**: Live PostgreSQL schema synchronized with `prisma db push` (0 data loss).
- **Snapshot Columns**: All 13 commercial snapshot columns present in `model Booking`.
- **Indexes**: Indexed on `[weddingTier]`, `[status]`, `[weddingId]`, `[travelerId]`, `[transactionId]`.

---

## L. Prioritized Remediation List (Before Accepting Live Money)

1. **P0 (Immediate)**: Fix `adminProcessHostPayoutAction` to write `booking.totalHostPayoutINR` into `Payout.amount` rather than `payment.amount` (USD).
2. **P0 (Immediate)**: Fix `fetchDashboardDataAction` for host couples to display `totalHostPayoutINR` in **₹ INR** and remove customer USD pricing from host views.
3. **P1 (High)**: Fix `app/dashboard/admin/finance/page.tsx` KPI card to display Agent Commissions in **₹ INR** rather than `$ USD`.
4. **P1 (High)**: Update `HostJourneyDiagram.tsx`, `PlatformOverviewDiagram.tsx`, and `admin/page.tsx` to remove legacy 78% percentage split claims.
5. **P2 (Medium)**: Add soft warning / confirmation in `adminRequestPaymentAction` if entered amount differs from `booking.customerTotalAmount`.
6. **P3 (Low)**: Correct currency symbol to `₹` in `generateBookingCommissionAction` notification string.

---

## M. Final Decision

### **Would I allow WeddingWithIndia to accept its FIRST REAL CUSTOMER PAYMENT today?**

**YES, for customer checkout & payment collection** — customer pricing calculation ($149–$1,199), capacity locking, PayPal link verification, and payment confirmation are 100% mathematically sound and protected against price tampering.

**HOWEVER, before disbursing the first HOST PAYOUT or launching host couple dashboards**, the 4 identified fixes in Section L (host payout ledger currency and host dashboard reporting) must be applied to prevent accounting and currency confusion.
