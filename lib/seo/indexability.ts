/**
 * lib/seo/indexability.ts
 *
 * AUTHORITATIVE INDEXABILITY & CANONICAL POLICY FOR WEDDINGWITHINDIA.
 * Centralizes public indexing eligibility, dynamic sitemap rules,
 * and canonical URL construction across all application routes.
 */

export const APP_CANONICAL_ORIGIN = "https://weddingwithindia.com";

/**
 * Checks if a dynamic wedding slug is an audit/synthetic test record.
 */
export function isSyntheticTestSlug(slug?: string | null): boolean {
  if (!slug) return false;
  const s = slug.toLowerCase().trim();
  return s.startsWith("wedding-test_") || s.includes("test_pp_");
}

export interface IndexableWeddingRecord {
  status?: string | null;
  isDemo?: boolean | null;
  suspended?: boolean | null;
  deletedAt?: Date | string | null;
  slug?: string | null;
}

/**
 * Authoritative predicate to determine if a wedding experience is eligible
 * for public Google Search indexing and inclusion in sitemap.xml.
 *
 * Rules:
 * 1. Must have status === "PUBLISHED"
 * 2. Must NOT be a demo wedding (isDemo !== true)
 * 3. Must NOT be suspended (suspended !== true)
 * 4. Must NOT be soft-deleted (deletedAt === null)
 * 5. Must NOT be a synthetic test record (slug does not match test patterns)
 */
export function isWeddingIndexable(wedding?: IndexableWeddingRecord | null): boolean {
  if (!wedding) return false;
  if (wedding.status !== "PUBLISHED") return false;
  if (wedding.isDemo === true) return false;
  if (wedding.suspended === true) return false;
  if (wedding.deletedAt !== null && wedding.deletedAt !== undefined) return false;
  if (isSyntheticTestSlug(wedding.slug)) return false;
  return true;
}

/**
 * Constructs a fully-qualified canonical URL on the canonical apex origin.
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/") return APP_CANONICAL_ORIGIN;
  // Strip trailing slash for consistency (except root)
  return `${APP_CANONICAL_ORIGIN}${cleanPath.replace(/\/+$/, "")}`;
}
