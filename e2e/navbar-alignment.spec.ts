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
        const attendBtn = header.locator("a").filter({ hasText: /Attend a Wedding|Explore Weddings/i }).first();
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
            /Attend a Wedding|Explore Weddings/i.test(el.textContent || "")
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

          // Calculate vertical center alignments
          const capsuleCenter = capsuleRect.top + capsuleRect.height / 2;
          const brandCenter = brandRect.top + brandRect.height / 2;
          const logoCenter = logoRect.top + logoRect.height / 2;
          const navCenter = navRect.top + navRect.height / 2;
          const actionsCenter = actionsRect.top + actionsRect.height / 2;
          const attendCenter = attendRect.top + attendRect.height / 2;

          const diffs = [
            Math.abs(capsuleCenter - brandCenter),
            Math.abs(capsuleCenter - logoCenter),
            Math.abs(capsuleCenter - navCenter),
            Math.abs(capsuleCenter - actionsCenter),
            Math.abs(capsuleCenter - attendCenter),
          ];
          const maxDiff = Math.max(...diffs);

          // Horizontal spacing & boundaries
          const brandNavSeparation = navRect.left - brandRect.right;
          const navActionsSeparation = actionsRect.left - navRect.right;
          const isRightContained = actionsRect.right <= capsuleRect.right + 2;
          const isLeftContained = brandRect.left >= capsuleRect.left - 2;

          // Nav controls non-overlap
          let navItemsOverlap = false;
          for (let i = 0; i < navControls.length - 1; i++) {
            const r1 = navControls[i].getBoundingClientRect();
            const r2 = navControls[i + 1].getBoundingClientRect();
            if (r1.right > r2.left + 1) {
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
        await expect(mobileMenu).toBeHidden();
      }
    });
  }
});
