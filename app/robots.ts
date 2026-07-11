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
        allow: ["/", "/weddings/", "/how-it-works", "/for-travelers", "/for-couples", "/for-agents", "/about", "/contact"],
        disallow: [
          "/dashboard/",
          "/onboarding/",
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
