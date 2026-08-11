import { test, expect } from '@playwright/test';

test('check hydration errors on home page', async ({ page }) => {
  let hasHydrationError = false;

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Hydration failed') || 
        text.includes('Text content did not match') || 
        text.includes('Expected server HTML to contain a matching') ||
        text.includes('Warning: Did not expect server HTML to contain a')) {
      hasHydrationError = true;
      console.log(`[Hydration Error] ${text}`);
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  expect(hasHydrationError).toBe(false);
});
