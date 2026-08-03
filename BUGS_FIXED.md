# WeddingWithIndia — Resolved Bugs & Refactoring Log

This document logs all technical bugs, structural issues, hydration errors, and navigation flaws resolved during the production hardening of **WeddingWithIndia**.

---

## 1. Structural Syntax & Build Bugs

### Bug #1: Unclosed JSX Element in Admin Dashboard
- **Location**: `app/dashboard/admin/page.tsx`
- **Symptom**: Next.js Turbopack compiler failed with `Unterminated regexp literal` due to mismatched HTML tree depth.
- **Root Cause**: Extraneous `</div>` tag on line 206 disrupting element nesting.
- **Fix**: Removed orphaned closing tag and restructured administrative widget container.

### Bug #2: Duplicate Middleware Configuration
- **Location**: Project root (`middleware.ts` & `proxy.ts`)
- **Symptom**: Next.js 16 build error: `Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected`.
- **Root Cause**: Conflicting middleware entrypoint files.
- **Fix**: Removed redundant `middleware.ts` and unified edge routing under `proxy.ts`.

---

## 2. Navigation & User Experience Bugs

### Bug #3: Full Page Reloads on Client Navigation
- **Location**: `components/wedding/WeddingCard.tsx` & `components/home/Hero.tsx`
- **Symptom**: Clicking wedding cards or search buttons triggered hard browser reloads (`window.location.href`), breaking SPA state.
- **Fix**: Replaced imperative `window.location.href` assignments with Next.js `useRouter()` SPA navigation (`router.push()`).

### Bug #4: Wishlist Matching Key Discrepancy
- **Location**: `app/dashboard/wishlist/page.tsx`
- **Symptom**: Wishlisted items added via card ID were not rendering on the saved weddings page.
- **Fix**: Updated filter matching logic to evaluate both `wedding.id` and `wedding.slug` (`wishlist.includes(w.id) || wishlist.includes(w.slug)`).

---

## 3. Authentication & RBAC Bugs

### Bug #5: Public API Route Security Hole
- **Location**: `proxy.ts`
- **Symptom**: Wildcard `/api/(.*)` was categorized as a public route, allowing unauthenticated access to private user endpoints.
- **Fix**: Restricted public route matchers strictly to `/api/health` and `/api/webhooks(.*)`, enforcing Clerk JWT authentication on all `/api/account/*`, `/api/admin/*`, and `/api/agents/*` endpoints.
