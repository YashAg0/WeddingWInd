# DISPATCH — spec_miner_admin_routes

## Task Objective
Probe and document specification & code requirements for admin routing, redirect logic, open redirect protection, and admin-controlled verification lifecycle.

## Requirements Scope
- R6: Admin Routing & Auth Redirects. Audit all `/dashboard/admin/*` routes, server-authoritative RBAC checks, find and map all `/sign-in` occurrences that should be `/login`, and inspect redirect sanitization to prevent open redirects.
- R7: Admin Controls & Verification Lifecycle. Audit verification flow: UI, Server Actions, UploadThing endpoint, and DB. Verify that unrequested KYC uploads are strictly blocked at all 4 levels.

## Reference File
Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md` (latest timestamp).

## Deliverable
Write specification analysis report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\spec_miner_admin_routes\analysis.md` and `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\spec_miner_admin_routes\handoff.md` and send completion message to orchestrator with summary.
