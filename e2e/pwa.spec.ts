import { test, expect } from "@playwright/test";

test.describe("PWA Production Infrastructure & Integrity", () => {
  test("Manifest route /manifest.webmanifest serves valid WeddingWithIndia metadata", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBe("WeddingWithIndia");
    expect(manifest.short_name).toBe("WeddingWithIndia");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    const icon192 = manifest.icons.find((i: any) => i.sizes === "192x192" && i.purpose === "any");
    expect(icon192).toBeDefined();

    const maskable192 = manifest.icons.find((i: any) => i.sizes === "192x192" && i.purpose === "maskable");
    expect(maskable192).toBeDefined();

    expect(manifest.shortcuts).toBeInstanceOf(Array);
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(4);
  });

  test("Service Worker file /sw.js is accessible with correct v2 headers", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("javascript");

    const body = await response.text();
    expect(body).toContain("CACHE_STATIC");
    expect(body).toContain("SKIP_WAITING");
    expect(body).toContain("/offline");
    expect(body).toContain('CACHE_VERSION = "v2"');
  });

  test("Offline fallback route /offline renders branded offline interface", async ({ page }) => {
    await page.goto("/offline", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText("You're Currently Offline");
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  });

  test("Root layout includes PWA viewport-fit, mobile app tags, and brand identity", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewportMeta).toContain("viewport-fit=cover");

    const appNameMeta = await page.locator('meta[name="application-name"]').getAttribute("content");
    expect(appNameMeta).toBe("WeddingWithIndia");

    const appleTitleMeta = await page.locator('meta[name="apple-mobile-web-app-title"]').getAttribute("content");
    expect(appleTitleMeta).toBe("WeddingWithIndia");
  });
});
