# WeddingWithIndia — Admin & Super Admin Setup Manual

This manual explains how to provision, manage, promote, and audit **Platform Admins** and **Super Admins** for **WeddingWithIndia**.

---

## 1. Initial Admin Bootstrapping

When initializing a new environment, administrator accounts can be created or promoted using three methods:

### Method A: Automated Master Bootstrap (Recommended)
Run the master bootstrap CLI suite:
```bash
npm run bootstrap
```
This automatically provisions:
- **Super Admin**: `superadmin@weddingwithindia.com`
- **Platform Admin**: `admin@weddingwithindia.com`
- **Coordinator**: `coordinator@weddingwithindia.com`

### Method B: Targeted Admin Promotion CLI
To promote any existing Clerk user account to `ADMIN` role:
```bash
node scripts/bootstrap-admin.js <user-email>
```
*Example:*
```bash
node scripts/bootstrap-admin.js founder@weddingwithindia.com
```

### Method C: Production Server Action / API (Super Admin Only)
Super Admins can promote registered accounts directly from the Admin Panel (`/dashboard/admin/users`).

---

## 2. Admin Privileges & Capabilities

| Capability | Admin | Super Admin |
| :--- | :---: | :---: |
| Access Internal Operations Control Hub (`/dashboard/admin`) | ✅ | ✅ |
| Review & Approve Host Wedding Listings | ✅ | ✅ |
| Review & Approve Freelance Agent Applications | ✅ | ✅ |
| View Financial Ledger (28% Platform / 72% Host split) | ✅ | ✅ |
| Scan Guest Pass QR Codes at Venue Entry | ✅ | ✅ |
| Triage Safety Dispute Reports | ✅ | ✅ |
| Promote / Demote User Roles | ❌ | ✅ |
| Override Safety Ruling & Ban Accounts | ❌ | ✅ |
| Execute Master Database Bootstrap & Reseed | ❌ | ✅ |
| Inspect System Audit Logs (`AuditLog` Table) | ❌ | ✅ |

---

## 3. Administrative Workflows

### 1. Verification Approval Workflow
1. Log into `/dashboard/admin`.
2. Navigate to **Host Verification Queue** (`/dashboard/admin/hosts`).
3. Verify uploaded ID, venue confirmation, and photography guidelines.
4. Click **Approve Listing & Publish**. The system notifies the host via email and updates the listing status to `PUBLISHED`.

### 2. Referral Agent Activation Workflow
1. Navigate to **Agent Application Review** (`/dashboard/admin/agents`).
2. Review agency credentials and experience.
3. Click **Activate Referral Partner**. The system generates a unique referral tracking code (`WWI-AGENT-XXXX`) and activates 7% commission accrual.

### 3. Financial Audit & Payout Reconciliation
1. Navigate to **Internal Financial Ledger** (`/dashboard/admin/bookings`).
2. Inspect gross booking volume, host 72% earnings, platform 28% fees, and 7% agent commissions.
3. Mark payout requests as `PAID` upon bank transfer completion.

---

## 4. Emergency Role Recovery

If administrative access is locked or lost:
1. Access the production server CLI or database terminal.
2. Execute the standalone admin bootstrapper:
   ```bash
   node scripts/bootstrap-admin.js <your-clerk-email>
   ```
3. The user status will immediately update to `ACTIVE` with role `ADMIN`.
