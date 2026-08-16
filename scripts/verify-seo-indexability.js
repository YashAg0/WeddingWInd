#!/usr/bin/env node
/**
 * scripts/verify-seo-indexability.js
 *
 * Forensic Technical SEO & Indexability Verification Suite for WeddingWithIndia.
 * Validates:
 * 1. Public route indexability (robots: index: true, follow: true) & canonical tags
 * 2. Private route protection (strict noindex/nofollow on auth, dashboard, admin, account)
 * 3. Exact brand consistency (WeddingWithIndia across titles, OpenGraph, Schema.org)
 * 4. Structured data integrity (Organization, WebSite, Event, BreadcrumbList)
 * 5. Dynamic wedding detail metadata & canonical URL generation
 * 6. Robots.txt and Sitemap.xml rules and URL coverage
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  \x1b[32m✔\x1b[0m ${message}`);
  } else {
    failedChecks++;
    console.error(`  \x1b[31m✘ FAIL:\x1b[0m ${message}`);
  }
}

console.log('\n===============================================================');
console.log('  WEDDINGWITHINDIA FORENSIC TECHNICAL SEO & INDEXABILITY AUDIT');
console.log('===============================================================\n');

// 1. ROOT LAYOUT METADATA & SCHEMA AUDIT
console.log('[SECTION 1] Root Layout Metadata & Structured Data (app/layout.tsx)');
const layoutPath = path.join(ROOT_DIR, 'app', 'layout.tsx');
assert(fs.existsSync(layoutPath), 'app/layout.tsx exists');

const layoutContent = fs.readFileSync(layoutPath, 'utf8');
assert(layoutContent.includes("metadataBase: new URL(APP_URL)"), 'layout.tsx specifies metadataBase');
assert(layoutContent.includes("template: \"%s | WeddingWithIndia\""), 'layout.tsx defines canonical title template "%s | WeddingWithIndia"');
assert(layoutContent.includes("siteName: \"WeddingWithIndia\""), 'OpenGraph siteName is canonical "WeddingWithIndia"');
assert(layoutContent.includes('"@type": "Organization"'), 'Organization JSON-LD schema is embedded');
assert(layoutContent.includes('"@type": "WebSite"'), 'WebSite JSON-LD schema is embedded');
assert(layoutContent.includes('name: "WeddingWithIndia"'), 'Organization/WebSite name is "WeddingWithIndia"');
assert(layoutContent.includes('target: {'), 'WebSite contains SearchAction potentialAction for Sitelinks searchbox');

// 2. HOMEPAGE SEO AUDIT
console.log('\n[SECTION 2] Homepage SEO & Branding (app/page.tsx)');
const homePath = path.join(ROOT_DIR, 'app', 'page.tsx');
assert(fs.existsSync(homePath), 'app/page.tsx exists');
const homeContent = fs.readFileSync(homePath, 'utf8');
assert(homeContent.includes("title: \"Indian Weddings for International Guests | WeddingWithIndia\""), 'Homepage title matches "Indian Weddings for International Guests | WeddingWithIndia"');
assert(homeContent.includes("canonical: \"https://weddingwithindia.com\""), 'Homepage specifies canonical URL https://weddingwithindia.com');

// 3. PUBLIC MARKETING & DISCOVERY ROUTES AUDIT
console.log('\n[SECTION 3] Public Routes Indexability & Canonical URLs');
const publicRoutes = [
  { name: '/weddings', file: 'app/weddings/page.tsx', canonical: 'https://weddingwithindia.com/weddings' },
  { name: '/weddings/map', file: 'app/weddings/map/layout.tsx', canonical: 'https://weddingwithindia.com/weddings/map' },
  { name: '/how-it-works', file: 'app/how-it-works/layout.tsx', canonical: 'https://weddingwithindia.com/how-it-works' },
  { name: '/for-travelers', file: 'app/for-travelers/page.tsx', canonical: 'https://weddingwithindia.com/for-travelers' },
  { name: '/for-couples', file: 'app/for-couples/layout.tsx', canonical: 'https://weddingwithindia.com/for-couples' },
  { name: '/for-agents', file: 'app/for-agents/layout.tsx', canonical: 'https://weddingwithindia.com/for-agents' },
  { name: '/coordinators', file: 'app/coordinators/layout.tsx', canonical: 'https://weddingwithindia.com/coordinators' },
  { name: '/about', file: 'app/about/layout.tsx', canonical: 'https://weddingwithindia.com/about' },
  { name: '/founder/tanishq-gupta', file: 'app/founder/tanishq-gupta/page.tsx', canonical: 'https://weddingwithindia.com/founder/tanishq-gupta' },
  { name: '/contact', file: 'app/contact/layout.tsx', canonical: 'https://weddingwithindia.com/contact' },
  { name: '/list-wedding', file: 'app/list-wedding/layout.tsx', canonical: 'https://weddingwithindia.com/list-wedding' },
  { name: '/safety', file: 'app/safety/page.tsx', canonical: 'https://weddingwithindia.com/safety' },
  { name: '/privacy', file: 'app/privacy/page.tsx', canonical: 'https://weddingwithindia.com/privacy' },
  { name: '/terms', file: 'app/terms/page.tsx', canonical: 'https://weddingwithindia.com/terms' },
  { name: '/cookies', file: 'app/cookies/page.tsx', canonical: 'https://weddingwithindia.com/cookies' },
  { name: '/cancellation-policy', file: 'app/cancellation-policy/page.tsx', canonical: 'https://weddingwithindia.com/cancellation-policy' },
  { name: '/refund-policy', file: 'app/refund-policy/page.tsx', canonical: 'https://weddingwithindia.com/refund-policy' },
  { name: '/traveler-agreement', file: 'app/traveler-agreement/page.tsx', canonical: 'https://weddingwithindia.com/traveler-agreement' },
  { name: '/host-agreement', file: 'app/host-agreement/page.tsx', canonical: 'https://weddingwithindia.com/host-agreement' },
  { name: '/agent-agreement', file: 'app/agent-agreement/page.tsx', canonical: 'https://weddingwithindia.com/agent-agreement' },
  { name: '/coordinator-agreement', file: 'app/coordinator-agreement/page.tsx', canonical: 'https://weddingwithindia.com/coordinator-agreement' },
  { name: '/copyright', file: 'app/copyright/page.tsx', canonical: 'https://weddingwithindia.com/copyright' },
  { name: '/trademark', file: 'app/trademark/page.tsx', canonical: 'https://weddingwithindia.com/trademark' },
  { name: '/dpdp', file: 'app/dpdp/page.tsx', canonical: 'https://weddingwithindia.com/dpdp' },
  { name: '/gdpr', file: 'app/gdpr/page.tsx', canonical: 'https://weddingwithindia.com/gdpr' },
];

publicRoutes.forEach(({ name, file, canonical }) => {
  const filePath = path.join(ROOT_DIR, file);
  assert(fs.existsSync(filePath), `${name} has metadata definition file at ${file}`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    assert(!content.includes("robots: { index: false") && !content.includes("robots: {\n    index: false"), `${name} is public and indexable (not marked noindex)`);
    assert(content.includes(canonical), `${name} declares absolute canonical URL "${canonical}"`);
  }
});

// 4. PRIVATE / NON-PUBLIC ROUTES AUDIT
console.log('\n[SECTION 4] Private Route Protection (Strict Noindex/Nofollow)');
const privateRoutes = [
  { name: '/dashboard', file: 'app/dashboard/layout.tsx' },
  { name: '/dashboard/admin', file: 'app/dashboard/admin/layout.tsx' },
  { name: '/account', file: 'app/account/layout.tsx' },
  { name: '/login', file: 'app/login/layout.tsx' },
  { name: '/signup', file: 'app/signup/layout.tsx' },
  { name: '/onboarding', file: 'app/onboarding/layout.tsx' },
  { name: '/for-agents/dashboard', file: 'app/for-agents/dashboard/layout.tsx' },
  { name: '/coordinators/dashboard', file: 'app/coordinators/dashboard/layout.tsx' },
  { name: '/wishlist', file: 'app/wishlist/layout.tsx' },
  { name: '/offline', file: 'app/offline/layout.tsx' },
  { name: '404 (not-found.tsx)', file: 'app/not-found.tsx' },
];

privateRoutes.forEach(({ name, file }) => {
  const filePath = path.join(ROOT_DIR, file);
  assert(fs.existsSync(filePath), `${name} has metadata protection at ${file}`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasNoIndex = content.includes("index: false") && content.includes("follow: false");
    assert(hasNoIndex, `${name} has strict robots: { index: false, follow: false } protection`);
  }
});

// 5. DYNAMIC WEDDING EXPERIENCE SEO AUDIT
console.log('\n[SECTION 5] Dynamic Wedding Detail SEO & Schema (app/weddings/[slug]/page.tsx)');
const weddingSlugPath = path.join(ROOT_DIR, 'app', 'weddings', '[slug]', 'page.tsx');
assert(fs.existsSync(weddingSlugPath), 'app/weddings/[slug]/page.tsx exists');
const weddingSlugContent = fs.readFileSync(weddingSlugPath, 'utf8');
assert(weddingSlugContent.includes("export async function generateMetadata"), 'Dynamic generateMetadata function is present');
assert(weddingSlugContent.includes("Attend ${wedding.title} in ${wedding.location}"), 'Title pattern matches "Attend [Title] in [Location]"');
assert(weddingSlugContent.includes("https://weddingwithindia.com/weddings/${resolvedParams.slug}"), 'Dynamic canonical URL matches canonical pattern');
assert(weddingSlugContent.includes('"@type": "Event"'), 'Event schema.org JSON-LD is generated');
assert(weddingSlugContent.includes('"@type": "BreadcrumbList"'), 'BreadcrumbList schema.org JSON-LD is generated');
assert(weddingSlugContent.includes('"@type": "Offer"'), 'Offer schema is included with availability');

// 6. ROBOTS.TS & SITEMAP.TS AUDIT
console.log('\n[SECTION 6] Robots.txt and Sitemap.xml');
const robotsPath = path.join(ROOT_DIR, 'app', 'robots.ts');
assert(fs.existsSync(robotsPath), 'app/robots.ts exists');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert(robotsContent.includes("disallow: ["), 'robots.ts specifies disallow array');
assert(robotsContent.includes('"/dashboard/"'), 'robots.ts blocks /dashboard/');
assert(robotsContent.includes('"/admin/"'), 'robots.ts blocks /admin/');
assert(robotsContent.includes('"/api/"'), 'robots.ts blocks /api/');
assert(robotsContent.includes("sitemap: \"https://weddingwithindia.com/sitemap.xml\""), 'robots.ts declares sitemap URL');

const sitemapPath = path.join(ROOT_DIR, 'app', 'sitemap.ts');
assert(fs.existsSync(sitemapPath), 'app/sitemap.ts exists');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
assert(sitemapContent.includes("url: baseUrl"), 'sitemap.ts includes root URL');
assert(sitemapContent.includes("url: `${baseUrl}/weddings`"), 'sitemap.ts includes /weddings');
assert(sitemapContent.includes("url: `${baseUrl}/how-it-works`"), 'sitemap.ts includes /how-it-works');
assert(sitemapContent.includes("url: `${baseUrl}/founder/tanishq-gupta`"), 'sitemap.ts includes founder profile');
assert(!sitemapContent.includes("dashboard") && !sitemapContent.includes("admin") && !sitemapContent.includes("login"), 'sitemap.ts excludes all private and authenticated routes');

// 7. SUMMARY & RESULTS
console.log('\n===============================================================');
console.log(`  AUDIT COMPLETE: ${passedChecks}/${totalChecks} checks passed (${failedChecks} failures)`);
console.log('===============================================================\n');

if (failedChecks > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
