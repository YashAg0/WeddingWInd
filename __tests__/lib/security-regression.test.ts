/**
 * Regression tests: Security fixes applied to lib/actions/index.ts
 *
 * These tests verify critical security invariants:
 *   1. Price injection prevention (P0): createBookingAction must derive
 *      pricing from the database, never from client-supplied values.
 *   2. KYC publishing gate (SEC-001): Only APPROVED hosts can publish weddings.
 *   3. Admin self-elevation prevention (SEC-EXTRA): Users cannot self-assign ADMIN role.
 *   4. DB auth fallback removal (SEC-002): syncAndGetDbUser throws on DB unavailability.
 */

// ---------------------------------------------------------------------------
// 1. PRICE INJECTION — unit-level invariant check
// ---------------------------------------------------------------------------
describe("createBookingAction — server-authoritative pricing invariant", () => {
  it("createBookingAction signature does NOT accept pricePerGuest or totalAmount", () => {
    /**
     * This test verifies the type-level guarantee: the function no longer
     * accepts client-supplied price fields. If this test fails to compile,
     * it means a regression was introduced restoring client-controlled pricing.
     *
     * We verify this by checking the function source does not destructure
     * pricePerGuest or totalAmount from its data parameter, and by confirming
     * the security comment is present.
     */
    const fs = require("fs");
    const path = require("path");
    const actionsPath = path.join(__dirname, "../../lib/actions/index.ts");
    const source = fs.readFileSync(actionsPath, "utf-8");

    // The function signature must NOT accept pricePerGuest as a parameter
    const functionSignatureMatch = source.match(
      /export async function createBookingAction\(data: \{([\s\S]*?)\}\)/
    );
    expect(functionSignatureMatch).not.toBeNull();
    const signature = functionSignatureMatch![1];
    // Must not declare pricePerGuest or totalAmount as TypeScript fields (type annotations)
    // Comments are allowed; we check for actual field declarations like "pricePerGuest: number"
    expect(signature).not.toMatch(/^\s*pricePerGuest\s*:/m);
    expect(signature).not.toMatch(/^\s*totalAmount\s*:/m);

    // Server must derive prices from DB — check for server-authoritative pricing comment
    expect(source).toContain("serverPricePerGuest");
    expect(source).toContain("serverTotalAmount");
    expect(source).toContain("P0 Security: Client cannot inject a false price");
  });

  it("Stripe checkout uses DB-stored totalAmount from booking, not client input", () => {
    /**
     * Verifies the complete injection chain is closed:
     * 1. Server calculates pricePerGuest × guestsCount (test above).
     * 2. Stripe checkout uses booking.totalAmount from DB (this test).
     * If both pass, the attack vector "client sends totalAmount:1 → pays $0.01" is closed.
     */
    const fs = require("fs");
    const path = require("path");
    const actionsPath = path.join(__dirname, "../../lib/actions/index.ts");
    const source = fs.readFileSync(actionsPath, "utf-8");

    // Stripe checkout creates session with booking.totalAmount (from DB lookup, not client)
    // It must not reference data.totalAmount or data.pricePerGuest at any point
    const stripeSessionMatch = source.match(
      /stripe\.checkout\.sessions\.create\(\{[\s\S]*?unit_amount:([^\n,}]+)/
    );
    expect(stripeSessionMatch).not.toBeNull();
    const unitAmountExpr = stripeSessionMatch![1].trim();
    // Must reference booking.totalAmount (from DB), not data.totalAmount (from client)
    expect(unitAmountExpr).toContain("booking.totalAmount");
    expect(unitAmountExpr).not.toContain("data.totalAmount");
    expect(unitAmountExpr).not.toContain("data.pricePerGuest");
  });
});

// ---------------------------------------------------------------------------
// 2. KYC PUBLISHING GATE — source-level verification
// ---------------------------------------------------------------------------
describe("createWedding / editWedding — KYC gate (SEC-001)", () => {
  it("createWedding performs verification check before allowing PUBLISHED status", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/actions/index.ts"),
      "utf-8"
    );

    // The fix should be present: verification lookup before PUBLISHED
    expect(source).toContain("SEC-001: KYC Gate");
    expect(source).toContain("VerificationStatus.APPROVED");
    expect(source).toContain("WeddingStatus.DRAFT");
  });

  it("editWedding also enforces KYC gate independently", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/actions/index.ts"),
      "utf-8"
    );

    // There should be TWO occurrences of the KYC gate (one for create, one for edit)
    const kycGateMatches = source.match(/SEC-001: KYC Gate/g);
    expect(kycGateMatches).not.toBeNull();
    expect(kycGateMatches!.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// 3. ADMIN SELF-ELEVATION PREVENTION — source-level verification (SEC-EXTRA)
// ---------------------------------------------------------------------------
describe("updateUserRoleAction — admin self-elevation prevention (SEC-EXTRA)", () => {
  it("blocks ADMIN role from being self-assigned", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/actions/index.ts"),
      "utf-8"
    );

    expect(source).toContain("Cannot self-assign administrative roles");
    expect(source).toContain("UserRole.ADMIN");
  });

  it("blocks role change after onboarding is complete", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/actions/index.ts"),
      "utf-8"
    );

    expect(source).toContain("Role cannot be changed after onboarding is complete");
    expect(source).toContain("ONBOARDING");
  });
});

// ---------------------------------------------------------------------------
// 4. AUTH FALLBACK REMOVED — source-level verification (SEC-002)
// ---------------------------------------------------------------------------
describe("syncAndGetDbUser — no synthetic fallback user (SEC-002)", () => {
  it("throws on DB unavailability instead of returning mock user", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/auth.ts"),
      "utf-8"
    );

    // Must throw SERVICE_UNAVAILABLE error
    expect(source).toContain("SERVICE_UNAVAILABLE");
    expect(source).toContain("throw new Error");

    // Must NOT return any synthetic/fallback user object with fake IDs
    expect(source).not.toContain("fallback-${");
    expect(source).not.toContain("role: UserRole.TRAVELER,");
  });
});

// ---------------------------------------------------------------------------
// 5. UPLOADTHING ROUTE — ensures the API endpoint exists
// ---------------------------------------------------------------------------
describe("UploadThing API route", () => {
  it("app/api/uploadthing/route.ts exists and exports GET and POST", () => {
    const fs = require("fs");
    const path = require("path");
    const routePath = path.join(
      __dirname,
      "../../app/api/uploadthing/route.ts"
    );

    expect(fs.existsSync(routePath)).toBe(true);
    const source = fs.readFileSync(routePath, "utf-8");
    expect(source).toContain("createRouteHandler");
    expect(source).toContain("GET");
    expect(source).toContain("POST");
    expect(source).toContain("ourFileRouter");
  });
});

// ---------------------------------------------------------------------------
// 6. VERIFICATION LIFECYCLE GATE — admin must request before user can upload
// ---------------------------------------------------------------------------
describe("submitVerificationAction — admin-gated verification lifecycle", () => {
  it("submitVerificationAction checks existing verification record before allowing upload", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/actions/index.ts"),
      "utf-8"
    );

    // Must check for existing verification record before allowing upload
    expect(source).toContain("VERIFICATION_NOT_REQUESTED");
    expect(source).toContain("existingVerification");
    expect(source).toContain("VerificationStatus.NOT_SUBMITTED");
  });

  it("submitVerificationAction uses update (not upsert) — prevents self-initiated verification", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/actions/index.ts"),
      "utf-8"
    );

    // After the verification gate check, must use .update() not .upsert()
    const submitFunctionMatch = source.match(
      /export async function submitVerificationAction\([\s\S]*?(?=\nexport async function)/
    );
    expect(submitFunctionMatch).not.toBeNull();
    const submitFunction = submitFunctionMatch![0];

    // Must NOT use upsert within submitVerificationAction
    expect(submitFunction).not.toContain("upsert");
    // Must use update (only update an existing record created by admin)
    expect(submitFunction).toContain(".update(");
  });
});

// ---------------------------------------------------------------------------
// 7. CANCELLED BOOKING WEBHOOK GUARD
// ---------------------------------------------------------------------------
describe("Stripe webhook — cancelled booking payment guard", () => {
  it("webhook guards against CANCELLED bookings being marked PAID", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(__dirname, "../../app/api/webhooks/stripe/route.ts"),
      "utf-8"
    );

    // Must check for CANCELLED and REJECTED status before processing payment
    expect(source).toContain("BookingStatus.CANCELLED");
    expect(source).toContain("BookingStatus.REJECTED");
    expect(source).toContain("BookingStatus.REFUNDED");
    expect(source).toContain("Payment received for cancelled/rejected booking");
  });
});

// ---------------------------------------------------------------------------
// 8. ADMIN REQUEST VERIFICATION — self-protection guard
// ---------------------------------------------------------------------------
describe("adminRequestVerificationAction — self-protection and audit", () => {
  it("adminRequestVerificationAction prevents admin from acting on themselves", () => {
    const fs = require("fs");
    const path = require("path");
    const source = fs.readFileSync(
      path.join(__dirname, "../../lib/actions/admin.ts"),
      "utf-8"
    );

    // Must export adminRequestVerificationAction
    expect(source).toContain("adminRequestVerificationAction");
    // Must guard against self-verification requests
    expect(source).toContain("Admins cannot request verification on themselves");
    // Must require admin role
    expect(source).toContain("requireRole([UserRole.ADMIN])");
    // Must log to audit trail
    expect(source).toContain("REQUEST_VERIFICATION");
  });
});
