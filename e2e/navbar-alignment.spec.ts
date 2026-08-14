import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { width: 320, height: 568, name: "mobile-320x568" },
  { width: 360, height: 800, name: "mobile-360x800" },
  { width: 375, height: 812, name: "mobile-375x812" },
  { width: 390, height: 844, name: "mobile-390x844" },
  { width: 412, height: 915, name: "mobile-412x915" },
  { width: 768, height: 1024, name: "tablet-768x1024" },
  { width: 820, height: 1180, name: "tablet-820x1180" },
  { width: 900, height: 1200, name: "tablet-900x1200" },
  { width: 1024, height: 768, name: "desktop-1024x768" },
  { width: 1100, height: 800, name: "desktop-1100x800" },
  { width: 1200, height: 800, name: "desktop-1200x800" },
  { width: 1280, height: 800, name: "desktop-1280x800" },
  { width: 1366, height: 768, name: "desktop-1366x768" },
  { width: 1440, height: 900, name: "desktop-1440x900" },
  { width: 1600, height: 900, name: "desktop-1600x900" },
  { width: 1920, height: 1080, name: "desktop-1920x1080" },
  { width: 2560, height: 1440, name: "desktop-2560x1440" },
];

test.describe("Navbar Alignment, Separation & Symmetry Suite", () => {
  test.setTimeout(90000);

  for (const vp of VIEWPORTS) {
    test(`Navbar layout at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const header = page.locator("header[role='banner']");
      await expect(header).toBeVisible();

      // Check for horizontal overflow across document
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasOverflow).toBe(false);

      if (vp.width >= 1280) {
        // DESKTOP (>= 1280px): Full 3-section navbar
        const nav = header.locator("nav[aria-label='Primary navigation']");
        await expect(nav).toBeVisible();

        // Wait for auth resolution / button visibility
        const attendBtn = header.locator("a", { hasText: "Attend a Wedding" });
        await expect(attendBtn).toBeVisible({ timeout: 15000 });

        // Check bounding box collisions and separations
        const layoutMetrics = await page.evaluate(() => {
          const capsule = document.querySelector("header > div > div");
          const brand = document.querySelector("header a[aria-label='WeddingWithIndia — Home']");
          const logo = document.querySelector("header a[aria-label='WeddingWithIndia — Home'] img");
          const nav = document.querySelector("header nav[aria-label='Primary navigation']");
          const navControls = Array.from(
            document.querySelectorAll(
              "header nav[aria-label='Primary navigation'] > div > button, header nav[aria-label='Primary navigation'] > a"
            )
          );
          const actions = nav?.nextElementSibling;
          const attendBtn = Array.from(document.querySelectorAll("header a")).find((el) =>
            el.textContent?.includes("Attend a Wedding")
          );

          if (!capsule || !brand || !logo || !nav || navControls.length === 0 || !actions || !attendBtn) {
            return { valid: false, reason: "Missing required elements" };
          }

          const capsuleRect = capsule.getBoundingClientRect();
          const brandRect = brand.getBoundingClientRect();
          const logoRect = logo.getBoundingClientRect();
          const navRect = nav.getBoundingClientRect();
          const actionsRect = actions.getBoundingClientRect();
          const attendRect = attendBtn.getBoundingClientRect();

          const logoMid = logoRect.top + logoRect.height / 2;
          const attendMid = attendRect.top + attendRect.height / 2;

          const navControlMetrics = navControls.map((item) => {
            const r = item.getBoundingClientRect();
            return {
              left: r.left,
              right: r.right,
              top: r.top,
              mid: r.top + r.height / 2,
              height: r.height,
            };
          });

          // 1. Vertical alignment check: midpoints of logo, nav items, and CTA within 3px
          const maxDiff = Math.max(
            Math.abs(logoMid - attendMid),
            ...navControlMetrics.map((n) => Math.abs(n.mid - logoMid))
          );

          // 2. Separation between Brand and Navigation: no overlap
          const brandNavSeparation = navRect.left - brandRect.right;

          // 3. Separation between Navigation and Actions: no overlap
          const navActionsSeparation = actionsRect.left - navRect.right;

          // 4. Capsule right edge containment: attend button nested inside capsule
          const isRightContained = attendRect.right <= capsuleRect.right - 8;

          // 5. Capsule left edge containment: brand nested inside capsule
          const isLeftContained = brandRect.left >= capsuleRect.left + 8;

          // 6. Navigation items internal collisions check
          let navItemsOverlap = false;
          for (let i = 0; i < navControlMetrics.length - 1; i++) {
            if (navControlMetrics[i].right > navControlMetrics[i + 1].left) {
              navItemsOverlap = true;
              break;
            }
          }

          return {
            valid: true,
            maxDiff,
            brandNavSeparation,
            navActionsSeparation,
            isRightContained,
            isLeftContained,
            navItemsOverlap,
            capsuleWidth: capsuleRect.width,
            brandWidth: brandRect.width,
            navWidth: navRect.width,
            actionsWidth: actionsRect.width,
          };
        });

        expect(layoutMetrics.valid).toBe(true);
        expect(layoutMetrics.maxDiff).toBeLessThanOrEqual(3);
        expect(layoutMetrics.brandNavSeparation).toBeGreaterThanOrEqual(12); // Minimum 12px separation
        expect(layoutMetrics.navActionsSeparation).toBeGreaterThanOrEqual(12); // Minimum 12px separation
        expect(layoutMetrics.isRightContained).toBe(true);
        expect(layoutMetrics.isLeftContained).toBe(true);
        expect(layoutMetrics.navItemsOverlap).toBe(false);
      } else {
        // TABLET & MOBILE (<1280px): Mobile hamburger toggle active
        const hamburger = header.locator("button[aria-controls='mobile-menu']");
        await expect(hamburger).toBeVisible();

        // Check that desktop nav is hidden
        const desktopNav = header.locator("nav[aria-label='Primary navigation']");
        await expect(desktopNav).toBeHidden();

        // Open mobile drawer
        await hamburger.click();
        const mobileMenu = page.locator("#mobile-menu");
        await expect(mobileMenu).toBeVisible();

        // Close mobile drawer
        const closeBtn = mobileMenu.locator("button[aria-label='Close menu']");
        await closeBtn.click();
        await expect(mobileMenu).not.toBeVisible();
      }
    });
  }
});
