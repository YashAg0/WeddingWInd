import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getFutureDateString(daysAhead: number = 90): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

test.describe("Real Authenticated Admin and Host Sponsorship E2E Suite", () => {
  test.beforeEach(async () => {
    // Clear device sessions before each test to ensure fresh test browser context doesn't hit the 2-device limit
    await prisma.userDeviceSession.deleteMany({});
  });

  test.afterAll(async () => {
    await prisma.userDeviceSession.deleteMany({});
    await prisma.$disconnect();
  });

  test("1. Admin UI Flow: Authenticate -> Edit w5 -> Enable Sponsorship & Campaign Dates -> Submit -> Verify DB & Fresh Browser", async ({
    browser,
  }) => {
    // Precondition: Reset w5 to unsponsored
    await prisma.sponsorshipRequest.deleteMany({ where: { weddingId: "w5" } });
    await prisma.wedding.update({
      where: { id: "w5" },
      data: { sponsored: false, sponsorshipStart: null, sponsorshipEnd: null },
    });

    // A. Admin Authentication & UI Mutation
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // Authenticate as Admin via E2E test auth endpoint
    await adminPage.goto("/api/test/auth?email=admin@weddingwithindia.com&redirect=/dashboard/admin/weddings");

    // Verify Admin Dashboard header rendered
    const pageHeader = adminPage.locator('h1:has-text("Wedding Directory")');
    await expect(pageHeader).toBeVisible({ timeout: 15000 });

    // Navigate to edit form for w5 ("Varanasi Ganges Spiritual Union")
    const editLink = adminPage.locator('a[href*="action=edit"][href*="id=w5"]');
    await expect(editLink).toBeVisible({ timeout: 30000 });
    await editLink.click();

    // Verify edit form is open and populated
    const titleInput = adminPage.locator('input[name="title"]');
    await expect(titleInput).toHaveValue("Varanasi Ganges Spiritual Union", { timeout: 30000 });

    // Set Sponsorship fields in the real form
    const sponsoredSelect = adminPage.locator('select[name="sponsored"]');
    await sponsoredSelect.selectOption("true");

    const today = getTodayString();
    const futureDate = getFutureDateString(90);

    const startDateInput = adminPage.locator('input[name="sponsorshipStart"]');
    await startDateInput.fill(today);

    const endDateInput = adminPage.locator('input[name="sponsorshipEnd"]');
    await endDateInput.fill(futureDate);

    // Submit form via actual button click
    const saveButton = adminPage.locator('button[type="submit"]:has-text("Save Celebration")');
    await saveButton.click();

    // B. Independent DB Verification (proves real UI form submission persisted to database)
    await expect.poll(async () => {
      const w = await prisma.wedding.findUnique({ where: { id: "w5" } });
      return w?.sponsored;
    }, { timeout: 30000 }).toBe(true);

    const dbWedding = await prisma.wedding.findUnique({ where: { id: "w5" } });
    expect(dbWedding).not.toBeNull();
    expect(dbWedding?.sponsored).toBe(true);
    expect(dbWedding?.sponsorshipStart).not.toBeNull();
    expect(dbWedding?.sponsorshipEnd).not.toBeNull();

    // C. Cache Invalidation & Fresh Browser Context Verification
    const freshContext = await browser.newContext(); // completely fresh context with no cookies
    const freshPage = await freshContext.newPage();

    // Check /weddings Marketplace shows w5
    await freshPage.goto("/weddings");
    const marketplaceW5 = freshPage.locator('text="Varanasi Ganges Spiritual Union"');
    await expect(marketplaceW5.first()).toBeVisible({ timeout: 30000 });

    await adminContext.close();
    await freshContext.close();
  });

  test("2. Admin UI Flow: Disable Sponsorship via quick-toggle button -> Verify DB & Fresh Browser", async ({
    browser,
  }) => {
    // Precondition: Set w5 to sponsored with active dates
    await prisma.wedding.update({
      where: { id: "w5" },
      data: { sponsored: true, sponsorshipStart: new Date(), sponsorshipEnd: null },
    });

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/api/test/auth?email=admin@weddingwithindia.com&redirect=/dashboard/admin/weddings");

    const pageHeader = adminPage.locator('h1:has-text("Wedding Directory")');
    await expect(pageHeader).toBeVisible({ timeout: 30000 });

    // Locate the quick toggle sponsored button for w5
    const toggleButton = adminPage.locator('form:has(input[name="id"][value="w5"]) button[title*="Sponsored"]').first();
    await expect(toggleButton).toBeVisible({ timeout: 30000 });
    await toggleButton.click();

    // Independent DB check: w5 sponsored is now false
    await expect.poll(async () => {
      const w = await prisma.wedding.findUnique({ where: { id: "w5" } });
      return w?.sponsored;
    }, { timeout: 30000 }).toBe(false);

    // Fresh Browser verification
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto("/weddings");
    await expect(freshPage.locator('h1:has-text("Explore Wedding Celebrations")')).toBeVisible({ timeout: 30000 });

    await adminContext.close();
    await freshContext.close();
  });

  test("3. Host UI Flow: Authenticate as Host -> Submit Sponsorship Request -> Verify PENDING in DB and UI", async ({
    browser,
  }) => {
    // Precondition: Reset w5 to unsponsored and delete any old requests
    await prisma.sponsorshipRequest.deleteMany({ where: { weddingId: "w5" } });
    await prisma.wedding.update({
      where: { id: "w5" },
      data: { sponsored: false, sponsorshipStart: null, sponsorshipEnd: null },
    });

    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    // Authenticate as host_w5
    await hostPage.goto("/api/test/auth?email=host_w5@weddingwithindia.com&redirect=/dashboard/listings");

    // Verify Host Listings dashboard rendered
    const pageHeading = hostPage.locator('h1:has-text("Our Indian Weddings")');
    await expect(pageHeading).toBeVisible({ timeout: 30000 });

    // Find w5 listing and expand sponsorship request details
    const requestDetails = hostPage.locator('details:has-text("Request marketplace sponsorship")').first();
    await expect(requestDetails).toBeVisible({ timeout: 30000 });
    await requestDetails.locator("summary").click();

    // Fill request form inside details
    const requestForm = requestDetails.locator('form');
    const messageInput = requestForm.locator('textarea[name="message"]');
    await messageInput.fill("E2E Test: Please sponsor Varanasi Ganges Spiritual Union celebration.");

    const budgetInput = requestForm.locator('input[name="budget"]');
    await budgetInput.fill("$1,500");

    // Submit Request
    const submitBtn = requestForm.locator('button[type="submit"]:has-text("Submit Request")');
    await submitBtn.click();

    // Independent DB Verification: Request is created with status PENDING in PostgreSQL
    await expect.poll(async () => {
      const pendingReq = await prisma.sponsorshipRequest.findFirst({
        where: { weddingId: "w5", status: "PENDING" },
      });
      return pendingReq?.status;
    }, { timeout: 30000 }).toBe("PENDING");

    const pendingReq = await prisma.sponsorshipRequest.findFirst({
      where: { weddingId: "w5", status: "PENDING" },
    });
    expect(pendingReq).not.toBeNull();
    expect(pendingReq?.message).toContain("Varanasi Ganges Spiritual Union");
    expect(pendingReq?.budget).toBe("$1,500");

    // Verify Host UI displays pending status banner
    await hostPage.reload();
    const pendingBanner = hostPage.locator('text="Sponsorship request pending review"');
    await expect(pendingBanner.first()).toBeVisible({ timeout: 30000 });

    await hostContext.close();
  });

  test("4. Admin Approval Flow: Authenticate as Admin -> Review Queue -> Approve Request -> Verify APPROVED DB & Fresh Public Browser", async ({
    browser,
  }) => {
    // Precondition: Ensure there is a PENDING request for w5
    await prisma.sponsorshipRequest.deleteMany({ where: { weddingId: "w5" } });
    await prisma.wedding.update({
      where: { id: "w5" },
      data: { sponsored: false, sponsorshipStart: null, sponsorshipEnd: null },
    });
    await prisma.sponsorshipRequest.create({
      data: {
        weddingId: "w5",
        coupleId: "523cb51e-39a5-4193-b599-bc80c89c2b10",
        message: "E2E Test: Please approve sponsorship for Varanasi Ganges Spiritual Union.",
        budget: "$2,000",
        status: "PENDING",
      },
    });

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // Authenticate as Admin and visit sponsorship queue with encoded redirect
    const targetUrl = encodeURIComponent("/dashboard/admin/weddings/sponsorship?filter=PENDING");
    await adminPage.goto(`/api/test/auth?email=admin@weddingwithindia.com&redirect=${targetUrl}`);

    const queueHeading = adminPage.locator('h1:has-text("Sponsorship Requests")');
    await expect(queueHeading).toBeVisible({ timeout: 30000 });

    // Verify queue lists the request for Varanasi
    const requestCard = adminPage.locator('div:has-text("Varanasi Ganges Spiritual Union")').filter({
      has: adminPage.locator('form'),
    }).first();
    await expect(requestCard).toBeVisible({ timeout: 30000 });

    // Open approval accordion
    const approveSummary = requestCard.locator('summary:has-text("Approve with sponsorship dates")');
    await approveSummary.click();

    // Locate the approve form specifically
    const approveForm = requestCard.locator('form').filter({
      has: adminPage.locator('button:has-text("Approve Sponsorship")'),
    });

    // Set approval dates and notes
    const today = getTodayString();
    const futureDate = getFutureDateString(60);

    const startInput = approveForm.locator('input[name="sponsorshipStart"]');
    await startInput.fill(today);

    const endInput = approveForm.locator('input[name="sponsorshipEnd"]');
    await endInput.fill(futureDate);

    const notesInput = approveForm.locator('textarea[name="adminNotes"]');
    await notesInput.fill("Approved in Playwright E2E authenticated test.");

    // Submit Approval
    const approveBtn = approveForm.locator('button[type="submit"]:has-text("Approve Sponsorship")');
    await approveBtn.click();

    // Independent DB verification: Request is APPROVED, Wedding w5 is sponsored: true
    await expect.poll(async () => {
      const req = await prisma.sponsorshipRequest.findFirst({
        where: { weddingId: "w5" },
        orderBy: { requestedAt: "desc" },
      });
      return req?.status;
    }, { timeout: 30000 }).toBe("APPROVED");

    const updatedWedding = await prisma.wedding.findUnique({ where: { id: "w5" } });
    expect(updatedWedding?.sponsored).toBe(true);
    expect(updatedWedding?.sponsorshipStart).not.toBeNull();
    expect(updatedWedding?.sponsorshipEnd).not.toBeNull();

    // Fresh Browser Context check
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto("/weddings");

    const w5Marketplace = freshPage.locator('text="Varanasi Ganges Spiritual Union"');
    await expect(w5Marketplace.first()).toBeVisible({ timeout: 30000 });

    await adminContext.close();
    await freshContext.close();
  });

  test("5. Security & RBAC Guards: Role segregation is strictly enforced in real browser", async ({
    browser,
  }) => {
    // A. Unauthenticated guest accessing Admin UI is redirected away from admin dashboard
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto("/dashboard/admin/weddings");
    await expect(guestPage).not.toHaveURL(/\/dashboard\/admin\/weddings/);
    await guestContext.close();

    // B. Host accessing Admin UI is blocked / redirected
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await hostPage.goto("/api/test/auth?email=host_w5@weddingwithindia.com&redirect=/dashboard/admin/weddings");
    // Middleware redirects non-ADMIN role away from /dashboard/admin to /dashboard
    await hostPage.waitForURL("**/dashboard", { timeout: 30000 });
    await hostContext.close();

    // C. Host w4 cannot see or edit Host w5's wedding in listings
    const hostW4Context = await browser.newContext();
    const hostW4Page = await hostW4Context.newPage();
    await hostW4Page.goto("/api/test/auth?email=host_w4@weddingwithindia.com&redirect=/dashboard/listings");

    // Host w4 page must show w4 but NOT w5
    const w4Text = hostW4Page.locator('text="Goan Sunset Beach Nuptials"');
    await expect(w4Text.first()).toBeVisible({ timeout: 15000 });

    const w5Text = hostW4Page.locator('text="Varanasi Ganges Spiritual Union"');
    await expect(w5Text).toHaveCount(0);

    await hostW4Context.close();
  });
});
