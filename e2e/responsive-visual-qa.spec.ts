import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// Ensure screenshot directory exists
const SCREENSHOT_DIR = path.resolve(process.cwd(), "artifacts/responsive-screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  // MOBILE
  { width: 320, height: 568, name: "mobile-320x568" },
  { width: 360, height: 640, name: "mobile-360x640" },
  { width: 375, height: 667, name: "mobile-375x667" },
  { width: 390, height: 844, name: "mobile-390x844" },
  { width: 393, height: 852, name: "mobile-393x852" },
  { width: 414, height: 896, name: "mobile-414x896" },
  { width: 430, height: 932, name: "mobile-430x932" },

  // TABLET
  { width: 768, height: 1024, name: "tablet-768x1024" },
  { width: 820, height: 1180, name: "tablet-820x1180" },
  { width: 834, height: 1194, name: "tablet-834x1194" },
  { width: 1024, height: 1366, name: "tablet-1024x1366" },

  // DESKTOP
  { width: 1280, height: 720, name: "desktop-1280x720" },
  { width: 1366, height: 768, name: "desktop-1366x768" },
  { width: 1440, height: 900, name: "desktop-1440x900" },
  { width: 1536, height: 864, name: "desktop-1536x864" },
  { width: 1920, height: 1080, name: "desktop-1920x1080" },

  // ULTRAWIDE
  { width: 2560, height: 1440, name: "ultrawide-2560x1440" },
];

const ROUTES = [
  { path: "/", name: "homepage" },
  { path: "/weddings", name: "marketplace" },
  { path: "/about", name: "about" },
  { path: "/contact", name: "contact" },
  { path: "/how-it-works", name: "how-it-works" },
  { path: "/for-agents", name: "for-agents" },
  { path: "/weddings/jaipur-havelis-rajwada-wedding", name: "wedding-detail" },
];

test.describe("Real Browser Responsive QA Suite", () => {
  test.setTimeout(120000);

  for (const route of ROUTES) {
    test.describe(`Route: ${route.path}`, () => {
      for (const vp of VIEWPORTS) {
        test(`Viewport ${vp.name} (${vp.width}x${vp.height}) - overflow & layout check`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(route.path, { waitUntil: "domcontentloaded" });

          // 1. Horizontal Overflow Test: scrollWidth <= innerWidth
          const overflowMetrics = await page.evaluate(() => {
            const innerWidth = window.innerWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const overflowingElements: string[] = [];
            const allElements = Array.from(document.querySelectorAll("*"));
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              if (rect.right > innerWidth + 1 || rect.width > innerWidth + 1) {
                const tag = el.tagName.toLowerCase();
                const cls = (el.className && typeof el.className === "string") ? el.className.slice(0, 50) : "";
                const id = el.id ? `#${el.id}` : "";
                overflowingElements.push(`${tag}${id}.${cls} (rect.right: ${Math.round(rect.right)}px, width: ${Math.round(rect.width)}px)`);
              }
            }
            return { scrollWidth, innerWidth, hasOverflow: scrollWidth > innerWidth, overflowingElements: overflowingElements.slice(0, 10) };
          });

          if (overflowMetrics.hasOverflow) {
            console.log(`[OVERFLOW DIAGNOSTIC] Page ${route.path} at ${vp.width}px overflowing elements:`, overflowMetrics.overflowingElements);
          }

          expect(
            overflowMetrics.hasOverflow,
            `Page ${route.path} has horizontal overflow at ${vp.width}px! (scrollWidth: ${overflowMetrics.scrollWidth}px, innerWidth: ${overflowMetrics.innerWidth}px, elements: ${JSON.stringify(overflowMetrics.overflowingElements)})`
          ).toBe(false);

          // 2. Representative Screenshot capturing for key viewports
          const isRepresentative = [
            "mobile-375x667",
            "mobile-390x844",
            "mobile-430x932",
            "tablet-768x1024",
            "tablet-1024x1366",
            "desktop-1440x900",
            "ultrawide-2560x1440",
          ].includes(vp.name);

          if (isRepresentative) {
            const screenshotPath = path.join(
              SCREENSHOT_DIR,
              `${route.name}-${vp.name}.png`
            );
            await page.screenshot({ path: screenshotPath, fullPage: false });
          }
        });
      }
    });
  }

  test("Mobile Navbar behavior & body scroll-lock at 320px, 375px, 390px", async ({ page }) => {
    for (const width of [320, 375, 390]) {
      await page.setViewportSize({ width, height: 700 });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const menuButton = page.locator('button[aria-label*="toggle" i], button[aria-label*="menu" i]').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(200);

        const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
        expect(bodyOverflow, `Body overflow must be hidden when mobile drawer is open at ${width}px`).toBe("hidden");

        const closeButton = page.locator('#mobile-menu button').first();
        if (await closeButton.isVisible()) {
          await closeButton.click({ force: true });
          await page.waitForTimeout(200);
          const restoredOverflow = await page.evaluate(() => document.body.style.overflow);
          expect(restoredOverflow, `Body overflow must be restored after closing mobile drawer at ${width}px`).not.toBe("hidden");
        }
      }
    }
  });

  test("Marketplace Filter Drawer behavior & body scroll-lock at mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/weddings", { waitUntil: "domcontentloaded" });

    const filterButton = page.locator('button:has-text("Filters"), button:has-text("Refine Search")').first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(200);

      const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
      expect(bodyOverflow, "Body overflow must be locked when marketplace filter drawer is open").toBe("hidden");

      const closeButton = page.locator('button[aria-label*="Close" i]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(200);
      }
    }
  });

  test("Sticky Booking CTA non-obstruction on Wedding Detail Page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/weddings/jaipur-havelis-rajwada-wedding", { waitUntil: "domcontentloaded" });

    const bookingForm = page.locator('[data-testid="booking-form"]').first();
    if (await bookingForm.isVisible()) {
      const bbox = await bookingForm.boundingBox();
      if (bbox) {
        expect(bbox.height, "Sticky booking bar should be compact on mobile").toBeLessThanOrEqual(95);
      }
    }
  });
});
