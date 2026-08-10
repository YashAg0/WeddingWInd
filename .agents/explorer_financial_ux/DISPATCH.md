# DISPATCH — explorer_financial_ux

## Task Objective
Investigate security, financial, messaging, contact moderation, error handling, and visual/responsive QA requirements for WeddingWithIndia.

## Requirements Scope
- R8: Security, Financial, & UX Integrity.
  - Audit Stripe webhook idempotency and server-authoritative price calculation in checkout/webhooks.
  - Audit messaging contact moderation filters (phone, email, WhatsApp, homoglyphs, space obfuscation).
  - Audit error boundaries for sensitive internal leaks (stack traces, raw Prisma error details).
  - Audit responsive breakpoints and UI layout boundaries (320px to 1920px).

## Reference File
Read `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\ORIGINAL_REQUEST.md` (latest timestamp).

## Deliverable
Write investigation report to `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_financial_ux\analysis.md` and `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\explorer_financial_ux\handoff.md` and send completion message to orchestrator with summary.
