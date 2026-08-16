import { MetadataRoute } from "next";

/**
 * app/robots.ts
 *
 * Generates /robots.txt.
 * Blocks crawling of auth, dashboard, API, and onboarding routes.
 * Allows all public pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/weddings",
          "/weddings/",
          "/how-it-works",
          "/for-travelers",
          "/for-couples",
          "/for-agents",
          "/for-agents/apply",
          "/coordinators",
          "/coordinators/apply",
          "/about",
          "/founder/tanishq-gupta",
          "/contact",
          "/list-wedding",
          "/safety",
          "/terms",
          "/privacy",
          "/cookies",
          "/cancellation-policy",
          "/refund-policy",
          "/traveler-agreement",
          "/host-agreement",
          "/agent-agreement",
          "/coordinator-agreement",
          "/copyright",
          "/trademark",
          "/dpdp",
          "/gdpr",
        ],
        disallow: [
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
        ],
      },
    ],
    sitemap: "https://weddingwithindia.com/sitemap.xml",
    host: "https://weddingwithindia.com",
  };
}
