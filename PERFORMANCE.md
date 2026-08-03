# WeddingWithIndia — Performance Architecture Manual

This document details the performance optimization strategies, bundling architecture, image loading mechanisms, caching strategies, and Core Web Vitals targets for **WeddingWithIndia**.

---

## 1. Core Web Vitals Targets & Benchmarks

| Metric | Target Benchmark | Implementation Strategy |
| :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | `< 1.8s` | Next.js Image priority flag on hero media, WebP/AVIF compression. |
| **FID / INP** (Interaction to Next Paint) | `< 50ms` | React 19 Server Components reducing JS bundle execution overhead. |
| **CLS** (Cumulative Layout Shift) | `0.00` | Fixed aspect ratio containers (`aspect-video`, `aspect-square`) on dynamic images. |
| **TTFB** (Time to First Byte) | `< 200ms` | Next.js App Router edge middleware and Prisma session pooling. |

---

## 2. Server Components vs Client Components

WeddingWithIndia strictly enforces a **Server-First Architecture**:
- **Server Components (Default)**: Static pages (`/about`, `/contact`, `/how-it-works`, `/terms`, `/privacy`) and listings (`/weddings`, `/weddings/[slug]`) compile to static HTML at build time.
- **Client Components (`"use client"`)**: Isolated strictly to interactive leaf nodes (e.g. `SearchBar.tsx`, `WishlistButton.tsx`, `SortSelect.tsx`, `BookingSidebar.tsx`, `GateScanner.tsx`).

---

## 3. Media & Image Optimization Strategy

All images across the application utilize `next/image` rather than raw `<img>` tags:

```tsx
<Image
  src={wedding.heroImage}
  alt={wedding.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isHero}
  className="object-cover transition-transform duration-500 group-hover:scale-105"
/>
```

### Key Image Rules:
1. **Responsive `sizes` Attributes**: Prevents browser from downloading full 4K resolutions on mobile devices.
2. **Quality & Format**: Automatic AVIF / WebP conversion configured in Next.js build pipeline.
3. **External Domains**: Configured remote image patterns (`Unsplash`, `Pravatar`, `UploadThing`, `Cloudinary`) in `next.config.mjs`.

---

## 4. Font & Resource Optimization

- **Web Fonts**: `Inter` and `Playfair Display` loaded via `next/font/google` with `display: "swap"`. Fonts are self-hosted at build time to prevent render-blocking external network calls to Google Fonts.
- **Third-Party Script Strategy**: Google Analytics 4 loads asynchronously via `next/script` with `strategy="afterInteractive"` and IP anonymization.

---

## 5. Build & Bundle Benchmarks

```
Route (app)                                Size     First Load JS
┌ ƒ /                                      2.4 kB         102 kB
├ ○ /about                                 1.2 kB         98.5 kB
├ ƒ /weddings                              4.1 kB         104 kB
├ ƒ /weddings/[slug]                       5.8 kB         106 kB
└ ○ /dashboard                             3.8 kB         101 kB
```
- Total Initial JS Bundle: **~100 kB** gzip across all public landing pages.
