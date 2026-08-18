# WeddingWithIndia — Commercial Pricing, Payments & Monetization Specification
**Authoritative Single Source of Truth for Platform Economics**

---

## 1. Executive Summary & Commercial Model

WeddingWithIndia has unified its monetization into a single authoritative pricing engine (`lib/services/pricing-engine.ts`).

- **Currency Segregation**:
  - Customer Pricing: **USD ($)** per guest.
  - Host Payouts: **INR (₹)** per eligible guest.
  - Agent Referral Payouts: **INR (₹)** per eligible guest.
- **Experience Tiers (5 Tiers)**:
  `STANDARD`, `ENHANCED`, `GRAND`, `ROYAL`, `SIGNATURE_ROYAL`.
- **Duration Span**:
  `1 Day`, `2 Days`, `3 Days`, `4 Days`, `5 Days`.
- **Religion Neutrality**:
  Religion never alters prices. Tiers are defined purely by operational scale, ceremony depth, and hospitality intensity.
- **Homepage Clean UX**:
  Prices are hidden from homepage cards (`hidePrice={true}`), focusing on emotional storytelling, location, duration, and ceremonies count.

---

## 2. Master Customer Price Matrix (USD per Guest)

| Tier | 1 Day | 2 Days | 3 Days | 4 Days | 5 Days |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Standard** | $149 | $199 | $249 | $299 | $349 |
| **Enhanced** | $179 | $249 | $299 | $349 | $399 |
| **Grand** | $229 | $329 | $449 | $549 | $649 |
| **Royal** | $299 | $449 | $649 | $799 | $949 |
| **Signature Royal** | $399 | $799 | $999 | $999 | $1,199 |

*Note: Clean commercial price. No customer-facing PayPal surcharge.*

---

## 3. Master Host Payout Matrix (INR per Eligible Guest)

| Tier | 1 Day | 2 Days | 3 Days | 4 Days | 5 Days |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Standard** | ₹5,101 | ₹7,101 | ₹9,101 | ₹11,101 | ₹13,101 |
| **Enhanced** | ₹7,101 | ₹10,101 | ₹13,101 | ₹16,101 | ₹19,101 |
| **Grand** | ₹10,101 | ₹15,101 | ₹20,101 | ₹27,101 | ₹32,101 |
| **Royal** | ₹15,101 | ₹22,101 | ₹32,101 | ₹41,101 | ₹51,101 |
| **Signature Royal** | ₹20,101 | ₹30,101 | ₹41,101 | ₹51,101 | ₹61,101 |

---

## 4. Master Agent Referral Payout (INR per Eligible Guest)

Agents receive fixed INR payouts per attending guest (never a percentage):

| Tier | Fixed Agent Payout (INR / Guest) |
| :--- | :---: |
| **Standard** | ₹511 |
| **Enhanced** | ₹1,011 |
| **Grand** | ₹1,511 |
| **Royal** | ₹2,011 |
| **Signature Royal** | ₹2,511 |

---

## 5. Host Calculator Default Benchmark (`/for-couples`)

- **Default Configuration**: `SIGNATURE_ROYAL`, `4 Days`, `20 Guests`.
- **Authoritative Host Earnings**: `₹10,22,020` (`₹51,101 × 20`).
- **Headline**: "Your Wedding Could Earn ₹10+ Lakh".

---

## 6. Financial Planning Economics & Contribution Model

- Planning Foreign Exchange Rate: **₹95.50 / USD**.
- PayPal Transaction Fee: **4.40% + $0.30**.
- Currency Spread Reserve: **3.00%**.
- Operating & Reserve Provision: **5.00%**.
- WWI Platform Contribution: `Customer Revenue USD (converted) - Host Payout INR - Agent Payout INR - Estimated Processing & Spread Costs`. (Never labelled "net profit" before actual operational audit).

---

## 7. Database Commercial Snapshot Contract

Every booking record created in PostgreSQL captures the complete immutable commercial snapshot:

```prisma
model Booking {
  // Commercial Snapshot
  weddingTier                     String?    @default("STANDARD")
  durationDays                    Int?       @default(3)
  customerPricePerGuestUSD        Float?
  hostPayoutPerGuestINR           Float?
  agentPayoutPerGuestINR          Float?
  eligibleInternationalGuestCount Int?
  totalHostPayoutINR              Float?
  totalAgentPayoutINR             Float?
  pricingVersion                  String?    @default("v2026.1")
  baseCustomerAmountUSD           Float?
  paymentFeeAmount                Float?     @default(0.0)
  customerTotalAmount             Float?
  currency                        String?    @default("USD")
  ...
}
```

---

## 8. Verification & Test Evidence

- **Unit Test Suite**: 47/47 Test Suites Passing, 443/443 Tests Passing.
- **TypeScript Static Analysis**: `tsc --noEmit` cleanly passed (exit code 0).
- **Next.js Production Build**: `next build` with Turbopack compiled all 64 routes successfully with 0 errors (exit code 0).
- **Database Schema Push**: Live PostgreSQL schema synchronized with 0 data loss.
