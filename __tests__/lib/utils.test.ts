/**
 * __tests__/lib/utils.test.ts
 *
 * Unit tests for utility functions in lib/utils.ts (cn, sanitizeRedirectUrl).
 */

import { sanitizeRedirectUrl, cn } from "@/lib/utils";

describe("lib/utils - cn", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2", "py-2")).toBe("px-2 py-2");
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("lib/utils - sanitizeRedirectUrl", () => {
  it("should allow valid relative paths starting with /", () => {
    expect(sanitizeRedirectUrl("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("/dashboard/admin")).toBe("/dashboard/admin");
    expect(sanitizeRedirectUrl("/onboarding?redirect_url=%2Fdashboard")).toBe("/onboarding?redirect_url=%2Fdashboard");
    expect(sanitizeRedirectUrl("/weddings/123?tab=info#section")).toBe("/weddings/123?tab=info#section");
    expect(sanitizeRedirectUrl("/")).toBe("/");
  });

  it("should reject null, undefined, or empty string and return default fallback", () => {
    expect(sanitizeRedirectUrl(null)).toBe("/dashboard");
    expect(sanitizeRedirectUrl(undefined)).toBe("/dashboard");
    expect(sanitizeRedirectUrl("")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("   ")).toBe("/dashboard");
  });

  it("should respect custom fallback when provided", () => {
    expect(sanitizeRedirectUrl(null, "/custom-fallback")).toBe("/custom-fallback");
    expect(sanitizeRedirectUrl("http://evil.com", "/custom-fallback")).toBe("/custom-fallback");
  });

  it("should reject protocol-relative URLs starting with //", () => {
    expect(sanitizeRedirectUrl("//attacker.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("//evil.com/phishing")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("///triple-slash")).toBe("/dashboard");
  });

  it("should reject absolute URLs containing ://", () => {
    expect(sanitizeRedirectUrl("https://attacker.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("http://attacker.com/login")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("ftp://files.example.com")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("javascript://alert(1)")).toBe("/dashboard");
  });

  it("should reject paths not starting with /", () => {
    expect(sanitizeRedirectUrl("dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("javascript:alert(1)")).toBe("/dashboard");
    expect(sanitizeRedirectUrl("data:text/html,hack")).toBe("/dashboard");
  });
});
