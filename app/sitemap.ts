import { MetadataRoute } from "next";

const baseUrl = "https://weddingwithindia.com";
const STATIC_PAGE_LASTMOD = new Date("2026-08-20T00:00:00.000Z");

/**
 * app/sitemap.ts
 *
 * Master XML Sitemap Generator for WeddingWithIndia.
 * Includes:
 * - Core discovery & conversion routes
 * - Full regional destination clusters (/destinations/*)
 * - Authoritative educational & answer guides (/learn/*)
 * - Verified published Indian wedding experiences (with authentic database updatedAt timestamps)
 * - Legal, Trust, and Safety resources
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    // Core Homepage & Discovery
    {
      url: baseUrl,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/weddings`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/weddings/map`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // Destination Clusters
    {
      url: `${baseUrl}/destinations`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/destinations/rajasthan`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/destinations/goa`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/destinations/punjab`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/destinations/kerala`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/destinations/delhi-ncr`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/destinations/mumbai`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // Educational Guides & AI Answer Hub (/learn/*)
    {
      url: `${baseUrl}/learn`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/learn/can-foreigners-attend-indian-weddings`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/learn/how-to-attend-an-indian-wedding`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/learn/indian-wedding-etiquette-for-foreigners`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/learn/what-to-wear-to-an-indian-wedding`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/learn/indian-wedding-rituals-explained`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/learn/indian-wedding-food-guide`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/indian-wedding-tourism`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/indian-wedding-experience-cost`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // Platform User Guides & Portals
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/for-travelers`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/for-couples`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/for-agents`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/for-agents/apply`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${baseUrl}/coordinators`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/coordinators/apply`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${baseUrl}/list-wedding`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/founder/tanishq-gupta`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.55,
    },

    // Safety & Trust Standards
    {
      url: `${baseUrl}/safety`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guest-safety`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/host-safety`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/community-guidelines`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/travel-visa`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/insurance`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // Legal, Compliance & Privacy
    {
      url: `${baseUrl}/privacy`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cancellation-policy`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${baseUrl}/traveler-agreement`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/host-agreement`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/agent-agreement`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/coordinator-agreement`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/copyright`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/trademark`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dpdp`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/gdpr`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/acceptable-use`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/content-policy`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/photo-video-consent`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${baseUrl}/incident-report`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${baseUrl}/complaints`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/grievance`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${baseUrl}/payment-terms`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/booking-terms`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic Published Wedding Experience routes
  let weddingRoutes: MetadataRoute.Sitemap = [];
  try {
    const { prisma, withDbRetry } = await import("@/lib/prisma");
    const weddings = await withDbRetry(() =>
      prisma.wedding.findMany({
        where: { status: "PUBLISHED", suspended: false, deletedAt: null },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      })
    );

    if (weddings && weddings.length > 0) {
      weddingRoutes = weddings.map((wedding) => ({
        url: `${baseUrl}/weddings/${wedding.slug}`,
        lastModified: wedding.updatedAt || STATIC_PAGE_LASTMOD,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    } else {
      const { featuredWeddings } = await import("@/lib/data");
      weddingRoutes = featuredWeddings.map((w) => ({
        url: `${baseUrl}/weddings/${w.slug}`,
        lastModified: STATIC_PAGE_LASTMOD,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch {
    const { featuredWeddings } = await import("@/lib/data");
    weddingRoutes = featuredWeddings.map((w) => ({
      url: `${baseUrl}/weddings/${w.slug}`,
      lastModified: STATIC_PAGE_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  return [...staticRoutes, ...weddingRoutes];
}
