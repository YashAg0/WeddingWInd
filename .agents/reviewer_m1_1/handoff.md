# Review Handoff Report — Milestone M1 (Identity & Auth Hardening)

## 1. Observation

### Implementation & Verification Findings
- **Target Source File**: `lib/auth.ts` (lines 50–239)
- **Unit Test File**: `__tests__/lib/auth-reconciliation.test.ts`
- **Related Auth Tests**: `__tests__/lib/auth-db-availability.test.ts`, `__tests__/lib/m1-m4-hardening.test.ts`

#### Key Code Implementation Observations in `lib/auth.ts`:

1. **Email Normalization** (lines 70-71):
   ```typescript
   const rawEmail = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@guest.weddingwithindia.com`;
   const email = rawEmail.toLowerCase().trim();
   ```
   *Verification*: Ensures consistent casing and whitespace removal before any database query or record mutation.

2. **Identity Reconciliation State Machine** (lines 89-174):
   - Queries `existingByClerkId = await tx.user.findUnique({ where: { clerkUserId: clerkUser.id } })` and `existingByEmail = await tx.user.findUnique({ where: { email } })`.
   - **Branch 1 (Both exist & mismatch)**: Unlinks `clerkUserId` on `existingByClerkId` by setting `clerkUserId: unlinked_${existingByClerkId.id}_${Date.now()}`. Then updates `existingByEmail` with `clerkUserId: clerkUser.id`, `name`, `avatar`. Excludes `role` and `status` from the update payload.
   - **Branch 2 (Both exist & match)**: Updates `existingByEmail` with `name` and `avatar`.
   - **Branch 3 (Only `existingByEmail` exists)**: Updates `existingByEmail` with `clerkUserId: clerkUser.id`, `name`, `avatar`. Leaves `role` and `status` untouched.
   - **Branch 4 (Only `existingByClerkId` exists)**: Updates `existingByClerkId` with `email`, `name`, `avatar`.
   - **Branch 5 (Neither exists)**: Creates new user record (`role: "TRAVELER"`, `status: "ONBOARDING"`). Catches Prisma `P2002` constraint error (concurrent signup race condition) and retrieves the created record via `tx.user.findUnique({ where: { email } })` or `tx.user.findUnique({ where: { clerkUserId: clerkUser.id } })`.

3. **Fail-Closed DB Security (SEC-002)** (lines 227-238):
   - Errors caught during `syncAndGetDbUser()` re-throw `SERVICE_UNAVAILABLE`. Synthetic guest users or fallback roles are strictly prevented.

4. **Referral Handling Safety** (lines 212-224):
   - Executes `associateReferralOnSignup` post-transaction, guarded with `dbUser?.createdAt && dbUser?.updatedAt && dbUser.createdAt.getTime() === dbUser.updatedAt.getTime()`.

#### Verification Command Output Logs:

1. **TypeScript Compiler Check**:
   - Command: `cmd /c "npm run type-check"` (`tsc --noEmit`)
   - Result: **PASSED** (Exit code 0, 0 errors).

2. **ESLint Check**:
   - Command: `cmd /c "npm run lint"` (`eslint`)
   - Result: **PASSED** (Exit code 0, 0 errors, 1 warning in a script file).

3. **Jest Unit & Behavioral Tests**:
   - Command: `cmd /c "npm test -- __tests__/lib/auth-reconciliation.test.ts __tests__/lib/auth-db-availability.test.ts __tests__/lib/m1-m4-hardening.test.ts --no-coverage"`
   - Result: **PASSED** (3 test suites passed, 27 tests passed, 0 failed).

---

## 2. Logic Chain

1. **Email Normalization Prevents Case/Space Duplicate Collision**:
   - *Observation*: `rawEmail.toLowerCase().trim()` normalizes input before database lookup.
   - *Reasoning*: Standardizing emails ensures `findUnique({ where: { email } })` matches existing pre-seeded records (such as `founder@weddingwithindia.com`), preventing duplicate account creation caused by casing variations.

2. **Unlinking Stale Clerk User IDs Eliminates P2002 Violations**:
   - *Observation*: Branch 1 updates `existingByClerkId` with `clerkUserId: unlinked_${id}_${Date.now()}` prior to assigning `clerkUser.id` to `existingByEmail`.
   - *Reasoning*: Because `clerkUserId` has a `@unique` index in Prisma schema, assigning `clerkUser.id` to `existingByEmail` while `existingByClerkId` still holds it would trigger a `P2002` constraint failure. Unlinking `existingByClerkId` first clears the key space atomically within the transaction.

3. **Canonical Founder Row Integrity**:
   - *Observation*: Neither Branch 1 nor Branch 3 includes `role` or `status` in the `tx.user.update` data object.
   - *Reasoning*: Omitting `role` and `status` ensures that pre-existing accounts (e.g. founder account seeded with `ADMIN`/`ACTIVE`) maintain their authoritative status and cannot be downgraded or mutated during authentication sync.

4. **Race Condition Resilience**:
   - *Observation*: Branch 5 wraps `tx.user.create` in a try/catch for error code `P2002`.
   - *Reasoning*: If two concurrent HTTP requests for the same new user execute simultaneously, the second attempt catches `P2002` and recovers the newly created record via `findUnique`, preventing request failure.

5. **No Integrity Violations Detected**:
   - *Observation*: Code inspection reveals real Prisma transaction queries and error handling; test suite verifies behavioral matrix under Jest mock environment.
   - *Reasoning*: Code satisfies all integrity constraints — no hardcoded mock returns, no facade logic, no bypassed checks.

---

## 3. Review Report & Verdict

### Review Summary
**Verdict**: **APPROVE**

### Findings
- **Critical Findings**: None (0).
- **Major Findings**: None (0).
- **Minor Findings**: None (0).

### Verified Claims
1. **Email Normalization**: `rawEmail.toLowerCase().trim()` verified in `lib/auth.ts:71` → PASS
2. **5-Branch Reconciliation**: All branches verified in `lib/auth.ts:104-173` and tested in `auth-reconciliation.test.ts` → PASS
3. **Founder Row Role Protection**: Omission of `role` and `status` in updates verified in `lib/auth.ts:117-120, 134-137` → PASS
4. **P2002 Retry Catch**: Verified in `lib/auth.ts:159-168` and `auth-reconciliation.test.ts:235-271` → PASS
5. **Fail-Closed DB Security**: Verified in `lib/auth.ts:227-238` and `auth-db-availability.test.ts:110-141` → PASS

---

## 4. Adversarial Stress-Test / Challenge Summary

**Overall Risk Assessment**: LOW

### Challenges & Attack Surface Analysis
1. **Challenge 1: Concurrent Signup Race Condition**
   - *Attack Scenario*: Two identical requests for a new user land simultaneously.
   - *Stress Test*: Branch 5 catches `P2002` error on `tx.user.create`, executes `findUnique` by `email` or `clerkUserId`, and returns the existing record.
   - *Result*: PASS.

2. **Challenge 2: Account Hijacking / Self-Elevation Attempt**
   - *Attack Scenario*: Non-admin user attempts to gain ADMIN by modifying Clerk profile.
   - *Stress Test*: `syncAndGetDbUser` only updates `clerkUserId`, `name`, and `avatar`. It never assigns `ADMIN` role unless the user row in PostgreSQL already possessed `ADMIN` role.
   - *Result*: PASS.

3. **Challenge 3: Stale Unique Key Constraint Trap**
   - *Attack Scenario*: Re-binding a Clerk ID to a founder email when the Clerk ID was previously attached to a temporary row.
   - *Stress Test*: Stale row's `clerkUserId` is unlinked with a unique timestamped key before updating canonical email row.
   - *Result*: PASS.

---

## 5. Caveats

- Unit tests mock Prisma transaction callbacks and Clerk server actions. Database performance under real production PostgreSQL connection pool saturation should be monitored via staging/production telemetry.
- No other caveats.

---

## 6. Conclusion

- `lib/auth.ts` implementation of `syncAndGetDbUser()` is **correct**, **complete**, **robust**, and **secure**.
- All acceptance criteria for Milestone M1 (Requirement R3 / Identity & Auth Hardening) are satisfied.
- **Verdict**: **`APPROVE`**

---

## 7. Verification Method

To re-verify this assessment:

1. **Run TypeScript Compiler**:
   ```cmd
   cmd /c "npm run type-check"
   ```
   *Expected Output*: Exit code 0, 0 errors.

2. **Run ESLint**:
   ```cmd
   cmd /c "npm run lint"
   ```
   *Expected Output*: Exit code 0, 0 errors.

3. **Run Jest Auth Test Suites**:
   ```cmd
   cmd /c "npm test -- __tests__/lib/auth-reconciliation.test.ts __tests__/lib/auth-db-availability.test.ts __tests__/lib/m1-m4-hardening.test.ts --no-coverage"
   ```
   *Expected Output*: 3 test suites passed, 27 tests passed.
