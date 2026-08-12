# FOUNDER & ENTITY SEO AUDIT — TANISHQ GUPTA / WEDDING WITH INDIA

**Entity Primary Name:** Tanishq Gupta  
**Associated Entity:** Wedding With India (https://weddingwithindia.com)  
**Date of Audit:** August 13, 2026  
**Auditor Role:** Founder SEO, Entity Knowledge Graph & Product Communications Auditor  

---

## Executive Founder Strategy

This audit establishes a factual, verifiable, and authoritative search presence for **Tanishq Gupta**, Founder of **Wedding With India**, without fabricating credentials, investor metrics, degrees, or corporate relationships.

By linking the Founder entity (`Person`) to the Company entity (`Organization`), search engine knowledge graphs (Google Knowledge Panel, Bing Entity Index) can confidently resolve:

```
[ Tanishq Gupta ]  <--- (founder / worksFor) --->  [ Wedding With India ]
       |                                                    |
       +---> Previously built BigTechJournals               +---> Cultural Wedding Platform
       +---> Private Aviation Tech Initiatives              +---> Operating Location: Jaipur, India
       +---> Guest Speaker at MNIT Jaipur                   +---> Founded: July
```

---

## Founder Facts Matrix

| Fact / Claim | Verification Status | Source / Evidence | Legal & SEO Compliance Standard |
| :--- | :--- | :--- | :--- |
| **Founder Role** | `VERIFIED FACT` | User prompt & platform codebase | Defined as `"Founder of Wedding With India"`. No fake C-suite inflation. |
| **Founding Date** | `VERIFIED FACT` | User prompt & platform history | Stated as `"Started in July"` (July 2026). No fabricated multi-year history. |
| **BigTechJournals** | `VERIFIED FACT` | User prompt | Described as `"Previously built BigTechJournals, an editorial platform for tech career stories."` |
| **Private Aviation** | `VERIFIED FACT` | User prompt | Described as `"Worked on private aviation technology and digital business initiatives."` |
| **MNIT Jaipur** | `VERIFIED FACT` | User prompt | Described precisely as `"Invited by MNIT Jaipur (Malaviya National Institute of Technology) as a guest speaker to share his startup journey."` Not claimed as an institutional endorsement or degree. |
| **Founding Team** | `VERIFIED FACT` | User prompt | Described as `"Building Wedding With India together with a team of co-founders and friends."` |

---

## Technical & Schema Implementation

### 1. Dedicated Founder Route
- **Canonical Route:** [`/founder/tanishq-gupta`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/founder/tanishq-gupta/page.tsx)
- **Title Tag:** `Tanishq Gupta — Founder of Wedding With India | Startup Builder`
- **Primary Heading (H1):** `Tanishq Gupta — Founder of Wedding With India`
- **Target Keywords:** `Tanishq Gupta`, `Tanishq Gupta founder`, `Tanishq Gupta Wedding With India`, `BigTechJournals Tanishq Gupta`, `Tanishq Gupta MNIT Jaipur`

### 2. JSON-LD Person & Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Tanishq Gupta",
  "jobTitle": "Founder",
  "image": "https://weddingwithindia.com/images/founder/founder.png",
  "worksFor": {
    "@type": "Organization",
    "name": "Wedding With India",
    "url": "https://weddingwithindia.com",
    "logo": "https://weddingwithindia.com/images/logos/logo.png"
  },
  "url": "https://weddingwithindia.com/founder/tanishq-gupta",
  "description": "Founder of Wedding With India, technology builder, creator of BigTechJournals, and guest speaker at MNIT Jaipur.",
  "knowsAbout": [
    "Startup Building",
    "Digital Platforms",
    "Cultural Tourism",
    "Technology Management"
  ]
}
```

### 3. Sitemap & Indexing Controls
- **Sitemap Entry:** Included in [`app/sitemap.ts`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/sitemap.ts) with priority `0.7` and monthly update frequency.
- **Robots.txt Rule:** Explicitly permitted in [`app/robots.ts`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/robots.ts) under `/founder/`.

### 4. Internal Link Architecture & Visual Integration
- **Founder Image Path:** Registered at `/images/founder/founder.png` using Next.js `Image` component with responsive fill, priority loading, and object-cover styling.
- **Footer Navigation ([`Footer.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/components/layout/Footer.tsx)):** Maintains clean text link `"Founder: Tanishq Gupta"` under Company links.
- **About Page ([`app/about/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/about/page.tsx)):** Embedded founder portrait card featuring real founder photo, title, and direct link `"Read Founder Profile"`.
- **Founder Page ([`app/founder/tanishq-gupta/page.tsx`](file:///c:/Projects/WeddingWithIndia/wedding-with-india/app/founder/tanishq-gupta/page.tsx)):** Circular portrait card featuring real founder photo, OpenGraph image metadata, and Person JSON-LD schema integration.

---

## Founder Action Items

1. **Social Profile Verification**: Once Tanishq Gupta's official LinkedIn, GitHub, X (Twitter), or personal website URIs are finalized, update the `sameAs` array in `app/founder/tanishq-gupta/page.tsx`.
2. **Founder Image Asset**: Fully integrated from `public/images/founder/founder.png` across Founder page, About page, Person JSON-LD schema, and OpenGraph metadata.
