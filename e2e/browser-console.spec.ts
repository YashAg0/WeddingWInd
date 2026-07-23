import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const targetRoutes = [
  "/",
  "/weddings",
  "/weddings/grand-maharaja-wedding",
  "/for-travelers",
  "/for-couples",
  "/for-agents",
  "/how-it-works",
  "/about",
];

for (const route of targetRoutes) {
  test(`Comprehensive browser audit for route: ${route}`, async ({ page }) => {
    test.setTimeout(60000);

    const consoleLogs: Array<{ type: string; text: string; location: any }> = [];
    const pageErrors: Array<{ message: string; stack?: string }> = [];
    const failedRequests: Array<{ url: string; failure: string }> = [];

    page.on("console", (msg) => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      });
    });

    page.on("pageerror", (err) => {
      pageErrors.push({
        message: err.message,
        stack: err.stack,
      });
    });

    page.on("requestfailed", (req) => {
      failedRequests.push({
        url: req.url(),
        failure: req.failure()?.errorText || "Unknown network failure",
      });
    });

    const targetUrl = `http://localhost:3000${route}`;
    console.log(`\n=== AUDITING ROUTE: ${targetUrl} ===`);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    const overlayCheck = await page.evaluate(() => {
      const portal = !!document.querySelector("nextjs-portal");
      const dialog = !!document.querySelector("[data-nextjs-dialog-overlay]");
      const bodyText = document.body ? document.body.innerText : "";
      const hasConsoleErrorText = bodyText.includes("Console Error");
      const hasModuleFactoryErrorText = bodyText.includes("module factory is not available");
      const hasPlayMjsErrorText = bodyText.includes("play.mjs");

      return {
        portal,
        dialog,
        hasConsoleErrorText,
        hasModuleFactoryErrorText,
        hasPlayMjsErrorText,
        bodyTextSnippet: bodyText.slice(0, 150),
      };
    });

    console.log(`[Route: ${route}] Dialog Overlay Present: ${overlayCheck.dialog}`);
    console.log(`[Route: ${route}] Page Errors Count: ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      console.log(`[Route: ${route}] VERBATIM PAGE ERROR 0: ${pageErrors[0].message}`);
      if (pageErrors[0].stack) {
        console.log(`[Route: ${route}] STACK: ${pageErrors[0].stack}`);
      }
    }

    expect(pageErrors.length).toBe(0);
    expect(overlayCheck.dialog).toBe(false);
    expect(overlayCheck.hasModuleFactoryErrorText).toBe(false);
    expect(overlayCheck.hasPlayMjsErrorText).toBe(false);
  });
}
