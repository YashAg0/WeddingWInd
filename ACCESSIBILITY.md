# WeddingWithIndia — Accessibility (WCAG 2.1 AA) Manual

This document details the accessibility standards, keyboard navigation, screen reader support, focus management, and color contrast compliance implemented across **WeddingWithIndia**.

---

## 1. Compliance Level & Guidelines

WeddingWithIndia adheres strictly to **WCAG 2.1 Level AA Standards**.

| Accessibility Criterion | Implementation Standard | Compliance Status |
| :--- | :--- | :--- |
| **Color Contrast** | Minimum 4.5:1 ratio for normal text, 3:1 for large text/headings | ✅ Verified |
| **Keyboard Navigation** | Visible focus rings (`focus-visible:ring-2`), logical tab ordering | ✅ Verified |
| **Screen Readers** | Semantic HTML5 tags (`main`, `nav`, `header`, `footer`, `section`, `article`) | ✅ Verified |
| **Form Labels** | Explicit `<label htmlFor="...">` bindings on all inputs and selects | ✅ Verified |
| **Icon Accessibility** | Decorative icons hidden via `aria-hidden="true"`, buttons labeled via `aria-label` | ✅ Verified |
| **Reduced Motion** | Prefers-reduced-motion hook (`useReducedMotion()`) disabling heavy Framer Motion animations | ✅ Verified |

---

## 2. Interactive Component Patterns

### Modal & Drawer Dialogs
- Traps keyboard focus within the modal during open state.
- Supports `Escape` key listener for instant dismissal.
- Uses `aria-modal="true"` and `role="dialog"` with `aria-labelledby`.

### Accordions & Expandable Sections (`FAQAccordion.tsx`)
- Trigger button includes `aria-expanded={isOpen}` and `aria-controls={contentId}`.
- Content panel uses `id={contentId}` and `role="region"`.

### Form Controls & Inputs (`SearchBar.tsx`, `FilterSidebar.tsx`)
- All form inputs, selects, and checkboxes have associated `<label>` elements.
- Validation error messages use `aria-describedby` or toast alerts.

---

## 3. Reduced Motion Support

```tsx
import { useReducedMotion } from "framer-motion";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const animationVariants = prefersReducedMotion ? {} : defaultFadeUpVariants;

  return <motion.div variants={animationVariants}>{/* Content */}</motion.div>;
}
```
If a user has enabled "Reduce Motion" in their operating system settings, all Framer Motion entrance animations and background particles are disabled automatically.
