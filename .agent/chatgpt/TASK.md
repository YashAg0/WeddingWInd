# TASK

## MISSION
Completely investigate and fix the WeddingWithIndia host submission flow.

## KEY SCENARIO & REQUIREMENTS
1. Unauthenticated host fills form on `/list-wedding`.
2. Submits -> redirected to Clerk login/signup with return URL intact.
3. Upon login or signup return, draft auto-resumes submission.
4. Deterministic and bounded session readiness (no arbitrary long sleeps).
5. Strong server authorization (`requireAuth`/server session), no trusting client auth alone.
6. DB persistence guarantees & idempotency under concurrent/sequential retries.
7. Local draft and auto-submit intent cleared ONLY after confirmed persistence.
8. Error resilience: failed submissions preserve draft and allow retry.
9. Consistency between Server Action and REST endpoint (`/api/host-application`).
10. Full verification: test suite, type check, lint, build, commit to `agent/chatgpt-antigravity`, push, and update `.agent/chatgpt/` documentation.
