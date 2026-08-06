# WeddingWithIndia — Search Engine Optimization (SEO) & Metadata Manual

This document details the search engine optimization, meta tags, structured data (`JSON-LD`), canonical indexing, and sitemap generation standards for **WeddingWithIndia**.

---

## 1. Structured Data Schema Map (`schema.org`)

WeddingWithIndia embeds semantic **JSON-LD Structured Data** on every key page type to earn Google Rich Snippets.

| Page Type | JSON-LD Schema Type | Embedded Properties |
| :--- | :--- | :--- |
| **Global Layout** | `Organization` | Name, Logo, URL, Social Profiles, Guest Support |
| **Global Layout** | `WebSite` | Sitelinks Searchbox (`target: /weddings?destination={query}`) |
| **Wedding Detail** | `Event` / `TouristAttraction` | Event Name, Date, Location, Per-Guest Pricing, Currency, Capacity |
| **Reviews Section** | `AggregateRating` | Rating Value (1-5), Review Count, Best/Worst Rating |
| **Breadcrumbs** | `BreadcrumbList` | Hierarchical site navigation path |

---

## 2. Dynamic Sitemap & Robots Configuration

- **Dynamic Sitemap Generator** (`app/sitemap.ts`): Automatically indexes static pages (`/about`, `/contact`, `/privacy`, `/terms`, `/how-it-works`) and dynamic published Our Indian Weddings (`/weddings/[slug]`).
  - Access URL: `https://weddingwithindia.com/sitemap.xml`
- **Robots Directives Generator** (`app/robots.ts`): Instructs search engine bots to crawl public pages while blocking private dashboard routes (`/dashboard/*`, `/api/*`).
  - Access URL: `https://weddingwithindia.com/robots.txt`

---

## 3. Metadata & OpenGraph Standards

Every page exports a typed Next.js `Metadata` object:

```typescript
export const metadata: Metadata = {
  title: "Royal Rajputana Wedding Experience | Jodhpur Palace",
  description: "Attend an authentic 3-day royal Indian wedding in Jodhpur. Includes Mehndi, Sangeet & Pheras.",
  openGraph: {
    title: "Royal Rajputana Wedding Experience in Jodhpur",
    description: "Attend an authentic royal wedding as an honoured guest.",
    images: [{ url: "/images/weddings/jodhpur-hero.jpg", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://weddingwithindia.com/weddings/royal-rajputana-wedding",
  },
};
```

---

## 4. Internationalization (i18n) & Localized Meta Tags

- **hreflang Alternates**: Configured for English (`en`) primary with currency parameter variations (`USD`, `EUR`, `INR`).
- **Semantic HTML**: Mandatory single `<h1>` tag per page, logical `<h2>`-`<h4>` hierarchy, and `lang="en"` declaration.
