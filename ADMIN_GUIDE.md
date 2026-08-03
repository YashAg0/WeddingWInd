# WeddingWithIndia — Platform Admin & Operations Guide

This guide documents the administrative control hub, verification procedures, user management, safety triage, financial audits, and Content Management System (CMS) editing for **WeddingWithIndia** operators.

---

## 1. Administrative Control Hub Overview (`/dashboard/admin`)

The Admin Operations Control Hub centralizes marketplace management across 8 key operational areas:

```
                          [ Admin Control Hub ]
                                    │
 ┌─────────────┬─────────────┬──────┴──────┬─────────────┬─────────────┐
 ▼             ▼             ▼             ▼             ▼             ▼
Verifications  Weddings      Users        Bookings      Payments       Safety Ops
Queue         Listings      Accounts     Ledger        Financials     Disputes
```

---

## 2. Key Administrative Modules

### A. Host Identity Verification Queue (`/dashboard/admin/verifications`)
- **Purpose**: Audit host family government IDs, venue booking proofs, and photography guidelines.
- **Workflow**:
  1. Inspect uploaded passport/ID URLs, invitation cards, and venue confirmation letters.
  2. Verify phone number and social media profile links.
  3. Click **Approve Verification** to issue the `VERIFIED_HOST` badge and update listing status to `PUBLISHED`.
  4. Or click **Reject** with structured feedback notes sent directly to the host.

### B. Agent Partner Applications (`/dashboard/admin/agents`)
- **Purpose**: Review luxury travel agent credentials, agency registrations, and target audience alignment.
- **Workflow**:
  1. Inspect agency organization details, website, and LinkedIn profiles.
  2. Click **Activate Partner** to assign a unique referral code (`WWI-AGENT-XXXX`) and enable 7% commission accrual.

### C. Financial Reconciliation Ledger (`/dashboard/admin/payments`)
- **Purpose**: Reconcile Stripe payment intents, host 72% revenue payouts in INR, agent 7% commission payouts, and platform 28% fees.
- **Workflow**:
  1. View gross booking volume across date ranges.
  2. Audit pending host and agent payout withdrawal requests.
  3. Mark payouts as `PAID` upon bank wire transfer completion.

### D. Safety & Dispute Triage Center (`/dashboard/admin/safety`)
- **Purpose**: Investigate guest dispute reports, host conduct concerns, or emergency safety reports.
- **Workflow**:
  1. Open safety case file (`/dashboard/admin/safety/[caseId]`).
  2. Review submitted photo/video evidence files.
  3. Issue official warning, freeze booking escrow funds, or execute account suspension.

---

## 3. Super Admin Bootstrap & CLI Management

```bash
# Bootstrap production accounts and seed connected demo data
npm run bootstrap

# Promote any user email to ADMIN role
node scripts/bootstrap-admin.js founder@weddingwithindia.com
```
