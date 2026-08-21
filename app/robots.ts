import { MetadataRoute } from "next";

/**
 * app/robots.ts
 *
 * Master Robots Policy for WeddingWithIndia.
 * Explicitly configures crawl permissions for primary search engines and AI discovery engines:
 * - Google (Googlebot)
 * - Bing (Bingbot)
 * - OpenAI (OAI-SearchBot, OAI-AdsBot)
 * - Anthropic (ClaudeBot, Claude-SearchBot, Claude-User)
 * - Perplexity (PerplexityBot, Perplexity-User)
 *
 * Allows all public discoverable content, educational guides (/learn/*), and destination clusters (/destinations/*).
 * Strictly disallows private dashboards, admin portals, onboarding, account state, and APIs.
 */
export default function robots(): MetadataRoute.Robots {
  const privateDisallows = [
    "/dashboard/",
    "/admin/",
    "/account/",
    "/onboarding/",
    "/for-agents/dashboard",
    "/coordinators/dashboard",
    "/wishlist/",
    "/offline",
    "/api/",
    "/login",
    "/signup",
    "/_next/",
  ];

  const searchAndAiBots = [
    "Googlebot",
    "Bingbot",
    "OAI-SearchBot",
    "OAI-AdsBot",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateDisallows,
      },
      ...searchAndAiBots.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: privateDisallows,
      })),
    ],
    sitemap: "https://weddingwithindia.com/sitemap.xml",
    host: "https://weddingwithindia.com",
  };
}
