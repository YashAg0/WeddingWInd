# CHATGPT <-> ANTIGRAVITY HANDOFF PROTOCOL

This document defines the authoritative state-machine and handoff contract between ChatGPT (planner/reviewer) and Antigravity (executor).

## STATE MACHINE

The primary synchronization signal is `.agent/chatgpt/STATE.md`.

Valid States:
- `WAITING_FOR_CHATGPT`: Antigravity has completed a task and is waiting for ChatGPT to assign the next task.
- `WAITING_FOR_ANTIGRAVITY`: ChatGPT has prepared a new task in `TASK.md` and handed off execution to Antigravity.
- `WORKING`: Antigravity is currently executing the task in `TASK.md`.
- `GOAL_COMPLETE`: All tasks are finished; the goal is achieved.

## STATE.md FORMAT

```markdown
STATE: <WAITING_FOR_CHATGPT | WAITING_FOR_ANTIGRAVITY | WORKING | GOAL_COMPLETE>
TASK_ID: <unique_task_id>
RESULT_TASK_ID: <last_completed_task_id>
UPDATED_AT: <ISO_TIMESTAMP>
```

## RULES OF ENGAGEMENT

1. **ChatGPT Action (Assigning a task):**
   - Write new task details into `TASK.md` including a new `TASK_ID: <id>`.
   - Update `STATE.md` with `TASK_ID: <id>` and `STATE: WAITING_FOR_ANTIGRAVITY`.
   - Push commit to branch `agent/chatgpt-antigravity`.

2. **Antigravity Action (Executing a task):**
   - Check `STATE.md`. If `STATE` is `WAITING_FOR_ANTIGRAVITY` and `TASK_ID` is newer than `RESULT_TASK_ID`:
   - Set `STATE: WORKING` in `STATE.md`.
   - Execute all instructions from `TASK.md`.
   - Run type checks, linter, tests, and build.
   - Document all changes in `RESULT.md`, `DIFF.md`, `LOG.md`.
   - Update `STATE.md` with `RESULT_TASK_ID: <id>` and `STATE: WAITING_FOR_CHATGPT`.
   - Commit and push to `agent/chatgpt-antigravity`.

3. **Protection Rules:**
   - Never modify application code while `STATE` is `WAITING_FOR_CHATGPT`.
   - Never overwrite a task or result belonging to a different `TASK_ID`.
   - Never push directly to `main`.
