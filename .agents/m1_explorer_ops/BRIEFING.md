# BRIEFING — 2026-08-30T04:12:45Z

## Mission
Investigate OPS-01 (Server Process Resilience) regarding `process.exit(0)` on `unhandledRejection` in `instrumentation.ts` / server lifecycle and provide structured logging recommendations.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Read-only investigator, Codebase Analyst
- Working directory: c:\Projects\WeddingWithIndia\wedding-with-india\.agents\m1_explorer_ops
- Original parent: 2bef5307-2898-47cb-b043-393c117215ef
- Milestone: Milestone 1 - Phase 1 (OPS-01)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement / modify project source code
- Produce structured handoff report in `.agents/m1_explorer_ops/handoff.md`
- Report completion via `send_message` to parent

## Current Parent
- Conversation ID: 2bef5307-2898-47cb-b043-393c117215ef
- Updated: 2026-08-30T04:12:45Z

## Investigation State
- **Explored paths**:
  - `instrumentation.ts`: Inspected root server startup and shutdown lifecycle handlers; located `cleanup("unhandledRejection")` calling `process.exit(0)` at lines 54-57 & 28-43.
  - `lib/logger.ts`: Analyzed structured logging infrastructure (`logger.error(message, context, error)`).
  - `lib/env.ts`: Reviewed environment schema and production configuration.
  - `ORIGINAL_REQUEST.md` and `PROJECT.md`: Verified OPS-01 requirements and acceptance criteria.
- **Key findings**:
  - In `instrumentation.ts` (lines 54-57), `process.on("unhandledRejection", ...)` invokes `cleanup("unhandledRejection")`.
  - `cleanup` disconnects Prisma and executes `process.exit(0)`, causing any unhandled asynchronous promise rejection in production to kill the entire Next.js web server.
  - Remediation: Delete `cleanup("unhandledRejection")` from the event handler and log structured metadata via `logger.error(...)`.
- **Unexplored areas**: None for OPS-01 scope.

## Key Decisions Made
- Confirmed that `uncaughtException` should retain graceful shutdown, but `unhandledRejection` must preserve server process liveness while capturing full error context via structured logger.

## Artifact Index
- `.agents/m1_explorer_ops/DISPATCH.md` — Initial dispatch message
- `.agents/m1_explorer_ops/progress.md` — Progress tracker
- `.agents/m1_explorer_ops/BRIEFING.md` — Situational awareness
- `.agents/m1_explorer_ops/handoff.md` — Complete 5-component handoff report
- `.agents/m1_explorer_ops/ops-01-resilience.patch` — Proposed code patch
