# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verification-lifecycle.spec.ts >> Verification Lifecycle & Storage Security - Tier 1 & Tier 2 >> R2 & R3 & Tier 2: Admin-Driven Verification Request Gate >> Admin review verification action enforces ADMIN role check
- Location: e2e\verification-lifecycle.spec.ts:34:9

# Error details

```
Error: apiRequestContext.get: read ECONNRESET
Call log:
  - → GET http://localhost:3000/api/admin/overview
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { ourFileRouter } from "../lib/storage/index";
  3  | 
  4  | const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  5  | 
  6  | test.describe("Verification Lifecycle & Storage Security - Tier 1 & Tier 2", () => {
  7  | 
  8  |   test.describe("R2 & Tier 1/2: UploadThing Storage Gate & Unrequested Upload Block", () => {
  9  |     test("UploadThing router defines verificationDocument with middleware check", () => {
  10 |       expect(ourFileRouter).toHaveProperty("verificationDocument");
  11 |       expect(ourFileRouter).toHaveProperty("passport");
  12 |     });
  13 | 
  14 |     test("Unauthenticated user cannot request upload presigned URL", async ({ request }) => {
  15 |       const response = await request.post(`${BASE_URL}/api/uploadthing`, {
  16 |         data: {
  17 |           action: "upload",
  18 |           slug: "verificationDocument",
  19 |         },
  20 |       });
  21 | 
  22 |       // Uploadthing should reject unauthenticated requests
  23 |       expect([400, 401, 403, 500]).toContain(response.status());
  24 |     });
  25 |   });
  26 | 
  27 |   test.describe("R2 & R3 & Tier 2: Admin-Driven Verification Request Gate", () => {
  28 |     test("Admin request verification action enforces ADMIN role check", async ({ page }) => {
  29 |       await page.goto(`${BASE_URL}/dashboard/admin/verifications`);
  30 |       await page.waitForLoadState("load");
  31 |       await expect(page).toHaveURL(/sign-in|login/i);
  32 |     });
  33 | 
  34 |     test("Admin review verification action enforces ADMIN role check", async ({ request }) => {
> 35 |       const response = await request.get(`${BASE_URL}/api/admin/overview`);
     |                                      ^ Error: apiRequestContext.get: read ECONNRESET
  36 |       expect([200, 401, 403, 500, 307, 302]).toContain(response.status());
  37 |     });
  38 |   });
  39 | 
  40 |   test.describe("R3 & Tier 2: Unverified Host Listing Gate", () => {
  41 |     test("Unverified host listing attempt is downgraded to DRAFT status", async ({ page }) => {
  42 |       await page.goto(`${BASE_URL}/list-wedding`);
  43 |       await page.waitForLoadState("load");
  44 |       await expect(page).toHaveURL(/sign-in|login|list-wedding/i);
  45 |     });
  46 |   });
  47 | 
  48 |   test.describe("R2 & Tier 1: Verification Page UI Route", () => {
  49 |     test("Verification dashboard page requires authentication", async ({ page }) => {
  50 |       await page.goto(`${BASE_URL}/dashboard/verification`);
  51 |       await page.waitForLoadState("load");
  52 | 
  53 |       // Redirects to sign-in
  54 |       await expect(page).toHaveURL(/sign-in|login/i);
  55 |     });
  56 |   });
  57 | 
  58 | });
  59 | 
```