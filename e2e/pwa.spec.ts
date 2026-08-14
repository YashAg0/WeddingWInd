import { test, expect } from "@playwright/test";

test.describe("PWA Production Infrastructure & Integrity", () => {
  test("Manifest route /manifest.webmanifest serves valid PWA metadata", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBe("Wedding With India");
    expect(manifest.short_name).toBe("Wedding India");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    const icon192 = manifest.icons.find((i: any) => i.sizes === "192x192");
    expect(icon192).toBeDefined();
  });

  test("Service Worker file /sw.js is accessible with correct headers", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("javascript");

    const body = await response.text();
    expect(body).toContain("CACHE_STATIC");
    expect(body).toContain("SKIP_WAITING");
    expect(body).toContain("/offline");
  });

  test("Offline fallback route /offline renders branded offline interface", async ({ page }) => {
    await page.goto("/offline", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("You're Currently Offline");
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  });

  test("Root layout includes PWA viewport-fit and mobile app tags", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewportMeta).toContain("viewport-fit=cover");
  });
});
