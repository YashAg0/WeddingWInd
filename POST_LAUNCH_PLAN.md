# WeddingWithIndia — Post-Launch Operational & Disaster Recovery Plan

This document outlines the operational runbook, incident management procedures, disaster recovery protocols, and backup strategies for **WeddingWithIndia**.

---

## 1. Incident Management & On-Call Rotation

### Severity Tiers & Response SLA

| Severity Level | Definition / Criteria | Response SLA | Mitigation Protocol |
| :--- | :--- | :--- | :--- |
| **Sev-0 (Critical)** | Checkout or payment webhook pipeline down. Total site outage. | `< 15 Minutes` | Rollback deployment, switch database connection pooler, notify leadership. |
| **Sev-1 (Major)** | Auth session degradation, guest pass QR generation failure. | `< 1 Hour` | Restart edge instances, clear Redis cache, inspect Clerk session logs. |
| **Sev-2 (Minor)** | Minor UI layout glitch, non-critical email delivery delay. | `< 24 Hours` | Log ticket in GitHub Issues, queue patch in next sprint deployment. |

---

## 2. Disaster Recovery & Multi-Region Backup Strategy

### Database Backups (PostgreSQL)
- **Point-in-Time Recovery (PITR)**: Write-Ahead Logs (WAL) archived every 5 minutes to S3 / Cloud Storage with 30-day retention.
- **Daily Snapshots**: Automated daily database dumps executed at 02:00 UTC.
- **Recovery Time Objective (RTO)**: `< 30 Minutes`.
- **Recovery Point Objective (RPO)**: `< 5 Minutes`.

### Multi-Region Failover Plan
1. **Primary Infrastructure**: Managed Next.js on Vercel (US East) backed by PostgreSQL Primary in `us-east-1`.
2. **Failover Replica**: Read-replica database maintained in `eu-west-1`.
3. **DNS Failover**: Cloudflare Traffic Manager monitors origin health checks (`/api/health`) and automatically redirects traffic to failover origin if primary drops for > 60 seconds.

---

## 3. Fraud Prevention & Safety Escalation Runbook

### Financial Fraud Mitigation
- Automated velocity monitoring flags any account making > 3 booking attempts in 10 minutes.
- Stripe Radar rules automatically block payments flagged with high risk scores (> 75).

### Host & Guest Safety Escalation
1. **Urgent Report Filed**: Incident submitted via `/dashboard/safety/report` or on-site Coordinator dashboard.
2. **Immediate Alert**: Triggers high-priority SMS and email alert to the Operations Duty Lead.
3. **Account Freeze**: Admin panel provides an instant **Freeze Booking & Account** button preventing further interaction until investigation completes.
