## 2026-08-30T03:06:23Z

You are Explorer 2 (User Journeys, Multi-Role Flows & Adversarial Traversal) for the WeddingWithIndia marketplace master audit.
Your working directory is: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_flows\

Read the authoritative user request at:
c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md

STRICT CONSTRAINT: Non-destructive audit. Zero source code, database, config, or business logic files may be modified. Only coordination files and reports in your .agents/ folder are written.

Your Mission:
Perform an exhaustive state, flow, and adversarial traversal audit across all user roles:
1. User Flow Matrix across 4 Roles (Section D):
   - Foreign Traveler: Discovery -> Search/Filter -> Wedding Detail -> Cultural Guides -> Host Inquiry -> Booking Application -> Payment Checkout -> Pre-Trip Preparation -> Onboarding/Event Day -> Post-Event Review.
   - Host / Wedding Family: Signup -> KYC/Identity Verification -> Create/Edit Wedding Listing -> Event Schedule & Cultural Rules -> Guest Application Review -> Accept/Decline -> Escrow Payout Request -> Guest Coordination.
   - Admin: Dashboard -> Host KYC Approval/Rejection -> Listing Curation -> Booking & Escrow Oversight -> Dispute Resolution -> Refund Trigger -> User/Host Suspension.
   - Travel Agent / Partner: Group Bookings, Multi-Guest Management, Commission Tracking.
2. Adversarial & Hostile Traversal Testing:
   - Back-Button Navigation: Does hitting the browser back button during multi-step forms or payment corrupt state or re-submit?
   - Direct URL Access & IDOR: What happens if a user accesses /admin/..., /host/dashboard, or /api/bookings/[id] directly without permissions or with another user's ID?
   - Refresh & Deep-Linking: Do dynamic stateful routes crash on refresh? Are query params synchronized with client state?
   - Multi-Tab State Conflicts: What if a user opens two tabs and initiates checkout for different weddings or edits profile simultaneously?
   - Session Expiry: What happens if auth token expires mid-booking or mid-form submission? Is draft data preserved or silently lost?
   - Race Conditions: Can 2 travelers book the last remaining wedding pass simultaneously? Are transactions atomic in Prisma?
   - Payment Webhook Idempotency: Does the webhook handler handle duplicate, delayed, or out-of-order webhook events safely?
3. Regression Risk Map (Section L):
   - Map out high-risk shared contexts, global stores, shared UI components, Prisma hooks, and utility functions that could break multiple user flows if modified.

Deliverable:
Write a comprehensive, exhaustive, evidence-backed report to:
c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_flows\handoff.md
Maintain progress.md in your working directory.
When finished, send a completion message back with your report path.
