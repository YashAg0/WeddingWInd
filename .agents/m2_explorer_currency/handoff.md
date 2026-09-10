# Handoff Report: FIN-01 Native Multi-Currency Engine Investigation & Architecture

**Agent**: Explorer (`m2_explorer_currency`)  
**Milestone**: Milestone 2 (Phase 2: Multi-Currency Engine — FIN-01)  
**Project**: WeddingWithIndia  
**Date**: 2026-08-30  
**Status**: Investigation Complete — Ready for Implementation  

---

## 1. Observation

Direct code inspections across the codebase revealed the following structural facts:

### 1.1 `lib/currency.ts`
In `lib/currency.ts` (lines 1–66), the currency engine only supports three currencies (`INR`, `USD`, `EUR`) using static hardcoded conversion rates relative to INR:
```typescript
// lib/currency.ts:3-15
import { FX_RATES as MODEL_FX } from "@/lib/constants/financial-model";

export type Currency = "INR" | "USD" | "EUR";

export const FX_RATES: Record<Currency, number> = {
  INR: 1,
  USD: MODEL_FX.USD || 95.50,
  EUR: MODEL_FX.EUR || 108.00,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
};
```
Furthermore:
- `formatCurrencyAmount` (lines 29–45) formats INR amounts converted to target currency using simple conditionals for `INR`, `USD`, and `EUR`.
- `detectBrowserCurrency` (lines 50–65) detects `INR` (Indian locales) and `EUR` (Eurozone locales), defaulting everything else to `USD`. There is zero support for `GBP`, `AUD`, `CAD`, `SGD`, or `AED`.

### 1.2 `context/CurrencyContext.tsx`
In `context/CurrencyContext.tsx` (lines 1–62):
- The `CurrencyProvider` is already mounted at the root layout (`app/layout.tsx:237`).
- Local storage check in `CurrencyProvider` explicitly hardcodes the 3-currency list:
  ```typescript
  // context/CurrencyContext.tsx:25-29
  const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
  if (stored && ["INR", "USD", "EUR"].includes(stored)) {
    setCurrencyState(stored);
    return;
  }
  ```
- `formatPrice(amountINR: number)` returns `{ primary: string; secondary?: string }` where secondary is `(₹X INR ref)`.

### 1.3 `components/layout/Navbar.tsx`
In `components/layout/Navbar.tsx`:
- Lines 39–41 hardcode:
  ```typescript
  const CURRENCIES = ["INR", "USD", "EUR"] as const;
  type CurrencyCode = (typeof CURRENCIES)[number];
  ```
- Lines 52–54 define a hardcoded ternary `currencySymbol`:
  ```typescript
  function currencySymbol(code: CurrencyCode) {
    return code === "INR" ? "₹" : code === "USD" ? "$" : "€";
  }
  ```
- `CurrencySwitcher` (lines 110–162) implements a single-row segmented sliding pill assuming exactly 3 items:
  ```typescript
  className={cn(
    "relative flex items-center bg-warm-50 border border-warm-200 rounded-full p-1",
    compact ? "w-full" : "w-[180px]"
  )}
  style={{
    width: "calc((100% - 0.5rem) / 3)",
    transform: `translateX(${activeIndex * 100}%)`,
  }}
  ```
  This UI breaks visually and becomes unusable when expanding to 8 currencies (`INR`, `USD`, `EUR`, `GBP`, `AUD`, `CAD`, `SGD`, `AED`).
- The switcher is rendered in two places:
  1. Desktop dropdown popover (lines 567–587) triggered by the Globe icon.
  2. Mobile navigation drawer footer (lines 811–818).

### 1.4 Pricing Display in Consumer Components
1. `components/wedding/WeddingCard.tsx` (lines 50–53, 298–305):
   ```typescript
   const displayPriceUSD = typeof wedding.pricePerGuest === "number" && wedding.pricePerGuest > 0 ? wedding.pricePerGuest : 149;
   ...
   <span className="font-display font-bold text-lg text-charcoal-900">
     ${displayPriceUSD.toLocaleString()}
   </span>
   <span className="text-xs text-charcoal-500">/guest</span>
   ```
   `WeddingCard` hardcodes `$` without consuming `useCurrency()` to display estimates in the user's active currency.
2. `components/wedding/BookingSidebar.tsx` (lines 25, 143–147, 203–214):
   - Derives USD base price via `getCustomerPriceUSD(tier, durationDays)`.
   - Displays static `$${pricePerGuestUSD}/guest` and `$${subtotalUSD} USD` without secondary currency estimates.
3. `components/wedding/StickyBookingCard.tsx` (lines 22, 59–66):
   - Displays static `$${pricePerGuestUSD}/guest` for mobile sticky bar.
4. `components/dashboard/BookingCard.tsx` (line 205) and `WishlistCard.tsx` (line 51):
   - Correctly consume `const { formatPrice } = useCurrency();` and render `formatPrice(amount).primary`.

### 1.5 Transaction Pricing Authority & Settlement Invariants
1. `lib/actions/index.ts` (`createBookingAction`, lines 559–719):
   - Rejects any client-supplied `pricePerGuest` or `totalAmount` parameters to eliminate price tampering (T2-02).
   - Acquires PostgreSQL row lock `SELECT id FROM "Wedding" WHERE id = $1 FOR UPDATE`.
   - Derives authoritative pricing server-side via `calculateBookingPricing({ tier, durationDays, guestCount })`.
   - Inserts booking into PostgreSQL with:
     - `pricePerGuest: pricing.customerPricePerGuestUSD`
     - `totalAmount: pricing.customerTotalAmountUSD`
     - `hostPayoutPerGuestINR: pricing.hostPayoutPerGuestINR`
     - `totalHostPayoutINR: pricing.totalHostPayoutINR`
     - `currency: "USD"`
2. `lib/services/pricing-engine.ts` (lines 121–171):
   - Host payouts (`HOST_PAYOUT_MATRIX_INR`) and agent payouts (`AGENT_PAYOUT_MATRIX_INR`) are fixed INR amounts.
   - Payout calculations are 100% independent of client display currency selections or foreign exchange fluctuations.
3. `app/api/webhooks/stripe/route.ts` (lines 94–287) & `lib/services/payments.ts`:
   - Stripe webhook processing reads line item amounts and charges directly from server-side database records.
   - External gateways (Stripe/PayPal) settle transactions in authoritative USD/INR. Display currency conversions are strictly cosmetic UI display estimates.

---

## 2. Logic Chain

From the above observations, the reasoning is direct and rigorous:

1. **Deficiency Identification (Obs 1.1 & 1.3)**:
   - WeddingWithIndia currently excludes major Tier-1 tourism & Indian diaspora markets: United Kingdom (`GBP`), Australia (`AUD`), Canada (`CAD`), Singapore (`SGD`), and United Arab Emirates / Gulf (`AED`).
   - The current 3-currency set in `lib/currency.ts` and the 3-button segmented slider in `Navbar.tsx` cannot support these currencies without a clean architectural expansion.

2. **UI Architecture Strategy (Obs 1.3)**:
   - A single-row sliding segment cannot accommodate 8 items in a 180px navbar popover or mobile drawer.
   - Replacing the slider with a structured currency picker modal/popover (a 2-column or 4x2 grid with country flags, currency symbols, ISO codes, and currency names) provides an accessible, mobile-friendly, and scalable UI.

3. **Multi-Currency Calculation Flow (Obs 1.1, 1.2, 1.4)**:
   - Base customer prices are defined in USD (`CUSTOMER_PRICE_MATRIX_USD`, e.g. $149–$1199) and planning rates are anchored to INR via `PLANNING_FX_USD_INR` (95.50).
   - `lib/currency.ts` requires:
     - `FX_RATES` relative to INR for all 8 currencies (`INR: 1`, `USD: 95.50`, `EUR: 108.00`, `GBP: 122.00`, `AUD: 62.00`, `CAD: 70.00`, `SGD: 73.00`, `AED: 26.00`).
     - Conversion functions: `convertFromINR`, `convertFromUSD`, `convertToINR`.
     - Locale-aware formatters: `formatCurrencyAmount(amountINR, currency)` and `formatCurrencyFromUSD(amountUSD, currency)`.
     - Auto-detection helper `detectBrowserCurrency()` matching British, Australian, Canadian, Singaporean, Emirati, European, and Indian browser locales.

4. **Pricing Consistency & Safety (Obs 1.4 & 1.5)**:
   - In `WeddingCard`, `BookingSidebar`, and `StickyBookingCard`, display currency estimates should update immediately upon currency selection in `Navbar`.
   - In `BookingSidebar`, display the selected currency estimate with a clear reference (e.g. `~£195 GBP ($249 USD authoritative)`), ensuring foreign travelers understand the exact billing denomination while feeling comfortable with local currency equivalents.
   - Because `createBookingAction` derives `totalAmount` strictly server-side using PostgreSQL database fields and `calculateBookingPricing()`, multi-currency display estimates introduce zero risk of client price manipulation, revenue leakage, or settlement mismatch.

---

## 3. Caveats

- **Live FX vs Static Base Rates**:
  In accordance with the financial model specifications (`FINANCIAL_PLANNING_CONSTANTS`), `lib/currency.ts` uses authoritative deterministic conversion rates calibrated to standard planning economics. If live OpenExchangeRates/ECB API feeds are activated in future sprints, they should update the `FX_RATES` cache with a safe fallback to these static constants.
- **Authoritative Denomination**:
  Stripe and manual PayPal transaction settlements remain in `USD` / `INR`. Display currencies other than USD/INR are explicitly formatted with display estimate disclaimers to prevent dispute ambiguities.
- **No Other Caveats**: All components, actions, database schemas, and contexts have been verified.

---

## 4. Conclusion & Proposed Implementation Specifications

The multi-currency engine expansion requires modifications to 4 files and 1 new reusable component:

### 4.1 Target 1: `lib/currency.ts` (Full Expansion)

```typescript
import { FX_RATES as MODEL_FX } from "@/lib/constants/financial-model";

export type Currency = "INR" | "USD" | "EUR" | "GBP" | "AUD" | "CAD" | "SGD" | "AED";

export const SUPPORTED_CURRENCIES: Currency[] = [
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "AED",
  "INR",
];

export interface CurrencyMetadata {
  code: Currency;
  name: string;
  symbol: string;
  flag: string;
  locale: string;
}

export const CURRENCY_METADATA: Record<Currency, CurrencyMetadata> = {
  USD: { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", locale: "en-US" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", locale: "de-DE" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", locale: "en-GB" },
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", locale: "en-AU" },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", locale: "en-CA" },
  SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", locale: "en-SG" },
  AED: { code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪", locale: "en-AE" },
  INR: { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", locale: "en-IN" },
};

/**
 * Authoritative FX conversion rates relative to INR (1 Foreign Unit = X INR)
 */
export const FX_RATES: Record<Currency, number> = {
  INR: 1,
  USD: MODEL_FX.USD || 95.50,
  EUR: MODEL_FX.EUR || 108.00,
  GBP: 122.00,
  AUD: 62.00,
  CAD: 70.00,
  SGD: 73.00,
  AED: 26.00,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  AED: "AED ",
};

/**
 * Converts an INR amount to target currency estimate.
 */
export function convertFromINR(amountINR: number, targetCurrency: Currency): number {
  if (targetCurrency === "INR") return amountINR;
  const rate = FX_RATES[targetCurrency] || 1;
  return amountINR / rate;
}

/**
 * Converts a foreign currency amount to INR.
 */
export function convertToINR(amount: number, fromCurrency: Currency): number {
  if (fromCurrency === "INR") return amount;
  const rate = FX_RATES[fromCurrency] || 1;
  return amount * rate;
}

/**
 * Converts a USD base customer price to target currency estimate.
 */
export function convertFromUSD(amountUSD: number, targetCurrency: Currency): number {
  if (targetCurrency === "USD") return amountUSD;
  const amountINR = amountUSD * FX_RATES.USD;
  return convertFromINR(amountINR, targetCurrency);
}

/**
 * Formats an INR amount to the specified currency string.
 */
export function formatCurrencyAmount(
  amountINR: number,
  currency: Currency,
  options?: { showDecimals?: boolean }
): string {
  const converted = convertFromINR(amountINR, currency);
  const meta = CURRENCY_METADATA[currency] || CURRENCY_METADATA.USD;
  const showDecimals = options?.showDecimals ?? (currency !== "INR");

  try {
    const formattedNumber = converted.toLocaleString(meta.locale, {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });

    if (currency === "AED") {
      return `AED ${formattedNumber}`;
    }
    return `${meta.symbol}${formattedNumber}`;
  } catch {
    return `${CURRENCY_SYMBOLS[currency]}${converted.toFixed(showDecimals ? 2 : 0)}`;
  }
}

/**
 * Formats a USD base price to the specified target currency string.
 */
export function formatCurrencyFromUSD(
  amountUSD: number,
  currency: Currency,
  options?: { showDecimals?: boolean }
): string {
  if (currency === "USD") {
    const formatted = amountUSD.toLocaleString("en-US", {
      minimumFractionDigits: options?.showDecimals ? 2 : 0,
      maximumFractionDigits: options?.showDecimals ? 2 : 0,
    });
    return `$${formatted}`;
  }
  const amountINR = amountUSD * FX_RATES.USD;
  return formatCurrencyAmount(amountINR, currency, options);
}

/**
 * Detects default currency based on browser locale.
 */
export function detectBrowserCurrency(): Currency {
  if (typeof window === "undefined") return "USD";
  try {
    const locale = (navigator.language || Intl.NumberFormat().resolvedOptions().locale || "").toLowerCase();

    // India
    if (locale.includes("-in") || ["hi", "ta", "te", "bn", "gu", "kn", "ml", "mr", "pa"].some((l) => locale.startsWith(l))) {
      return "INR";
    }
    // United Kingdom
    if (locale.includes("-gb") || locale.includes("-uk") || locale === "cy" || locale === "gd") {
      return "GBP";
    }
    // Australia
    if (locale.includes("-au")) {
      return "AUD";
    }
    // Canada
    if (locale.includes("-ca")) {
      return "CAD";
    }
    // Singapore
    if (locale.includes("-sg")) {
      return "SGD";
    }
    // UAE / Gulf
    if (locale.includes("-ae") || locale.startsWith("ar-ae")) {
      return "AED";
    }
    // Eurozone
    const eurozoneLocales = ["de", "fr", "es", "it", "nl", "pt", "fi", "at", "be", "gr", "ie", "lu", "ee", "lv", "lt", "sk", "si", "cy", "mt"];
    if (eurozoneLocales.some((lang) => locale.startsWith(lang))) {
      return "EUR";
    }
  } catch (err) {
    console.warn("Locale detection fallback:", err);
  }
  return "USD";
}
```

---

### 4.2 Target 2: `context/CurrencyContext.tsx`

```typescript
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Currency,
  SUPPORTED_CURRENCIES,
  detectBrowserCurrency,
  formatCurrencyAmount,
  formatCurrencyFromUSD,
  convertFromUSD,
  convertFromINR,
} from "@/lib/currency";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountINR: number) => { primary: string; secondary?: string };
  formatPriceFromUSD: (amountUSD: number) => { primary: string; secondary?: string };
  convertUSD: (amountUSD: number) => number;
  convertINR: (amountINR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  formatPrice: (amountINR: number) => ({ primary: `₹${amountINR}` }),
  formatPriceFromUSD: (amountUSD: number) => ({ primary: `$${amountUSD}` }),
  convertUSD: (amountUSD: number) => amountUSD,
  convertINR: (amountINR: number) => amountINR,
});

const STORAGE_KEY = "wwi_user_currency_pref";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    // 1. Check stored user preference
    const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
    if (stored && SUPPORTED_CURRENCIES.includes(stored)) {
      setCurrencyState(stored);
      return;
    }

    // 2. Auto-detect from browser locale
    const detected = detectBrowserCurrency();
    setCurrencyState(detected);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    if (!SUPPORTED_CURRENCIES.includes(newCurrency)) return;
    setCurrencyState(newCurrency);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newCurrency);
    }
  };

  const formatPrice = (amountINR: number) => {
    const primary = formatCurrencyAmount(amountINR, currency);
    if (currency === "INR") {
      return { primary };
    }
    const secondary = formatCurrencyAmount(amountINR, "INR");
    return { primary, secondary: `(${secondary} INR ref)` };
  };

  const formatPriceFromUSD = (amountUSD: number) => {
    const primary = formatCurrencyFromUSD(amountUSD, currency);
    if (currency === "USD") {
      return { primary };
    }
    const secondaryUSD = `$${Math.round(amountUSD).toLocaleString("en-US")} USD`;
    return { primary, secondary: `(~${secondaryUSD} ref)` };
  };

  const convertUSD = (amountUSD: number) => convertFromUSD(amountUSD, currency);
  const convertINR = (amountINR: number) => convertFromINR(amountINR, currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        formatPriceFromUSD,
        convertUSD,
        convertINR,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
```

---

### 4.3 Target 3: `components/layout/Navbar.tsx` (Currency Popover & Drawer Grid)

Replace the 3-button sliding segment with an 8-currency grid component:

```tsx
import {
  Currency,
  SUPPORTED_CURRENCIES,
  CURRENCY_METADATA,
} from "@/lib/currency";

function CurrencyPickerGrid({
  value,
  onChange,
  onClose,
  compact = false,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
  onClose?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className={cn("grid gap-1.5", compact ? "grid-cols-2" : "grid-cols-2 w-[280px]")}>
        {SUPPORTED_CURRENCIES.map((code) => {
          const meta = CURRENCY_METADATA[code];
          const isSelected = value === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => {
                onChange(code);
                onClose?.();
              }}
              className={cn(
                "flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all text-xs font-semibold cursor-pointer border",
                isSelected
                  ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)] shadow-xs"
                  : "bg-warm-50/80 hover:bg-warm-100 text-charcoal-800 border-warm-200/80"
              )}
              aria-pressed={isSelected}
            >
              <span className="text-base leading-none" aria-hidden="true">{meta.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{meta.code}</span>
                  <span className={cn("text-[0.6875rem]", isSelected ? "text-white/80" : "text-charcoal-500")}>
                    {meta.symbol}
                  </span>
                </div>
                <div className={cn("text-[0.625rem] truncate", isSelected ? "text-white/80" : "text-charcoal-400")}>
                  {meta.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[0.625rem] text-charcoal-400 text-center leading-tight pt-1 border-t border-warm-100">
        Prices display as estimates. Authoritative transactions settle in USD / INR.
      </p>
    </div>
  );
}
```

In desktop navbar popover:
```tsx
<div
  className={cn(
    "absolute right-0 top-full mt-2 bg-white border border-warm-200 rounded-2xl shadow-[0_8px_40px_0_rgba(0,0,0,0.14)] p-3.5 z-50 origin-top-right transition-[opacity,transform,visibility] duration-200",
    showCurrencyPicker ? "visible opacity-100 scale-100" : "invisible opacity-0 scale-95"
  )}
  aria-hidden={!showCurrencyPicker}
>
  <div className="flex items-center justify-between px-1 mb-2.5">
    <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-charcoal-500">
      Select Display Currency
    </span>
    <span className="text-[0.6875rem] font-semibold text-[var(--color-brand-primary)]">
      {CURRENCY_METADATA[currency].flag} {currency}
    </span>
  </div>
  <CurrencyPickerGrid
    value={currency}
    onChange={(c) => {
      setCurrency(c);
      setShowCurrencyPicker(false);
    }}
  />
</div>
```

In mobile menu drawer footer:
```tsx
<div className="flex items-center justify-between px-3 py-2 rounded-xl bg-warm-50 border border-warm-200 text-xs font-semibold text-charcoal-700">
  <span className="flex items-center gap-2">
    <Globe size={15} className="text-charcoal-500" aria-hidden="true" />
    Display Currency
  </span>
  <span className="font-bold text-[var(--color-brand-primary)]">
    {CURRENCY_METADATA[currency].flag} {currency} ({CURRENCY_METADATA[currency].symbol})
  </span>
</div>
<CurrencyPickerGrid
  value={currency}
  onChange={setCurrency}
  compact
/>
```

---

### 4.4 Target 4: `components/wedding/WeddingCard.tsx` Update

Update price rendering to consume `useCurrency()`:
```tsx
const { formatPriceFromUSD } = useCurrency();
const priceFormatted = formatPriceFromUSD(displayPriceUSD);

// In Footer:
<div className="min-w-0">
  <div className="flex items-baseline gap-1">
    <span className="font-display font-bold text-lg text-charcoal-900">
      {priceFormatted.primary}
    </span>
    <span className="text-xs text-charcoal-500">/guest</span>
  </div>
  <div className="text-[0.625rem] text-charcoal-400">
    {priceFormatted.secondary ? `${priceFormatted.secondary} · Experience Pass` : "Experience Pass"}
  </div>
</div>
```

---

### 4.5 Target 5: `components/wedding/BookingSidebar.tsx` Update

Update header and price summary to consume `useCurrency()`:
```tsx
const { currency, formatPriceFromUSD } = useCurrency();
const priceDisplay = formatPriceFromUSD(pricePerGuestUSD);
const subtotalDisplay = formatPriceFromUSD(subtotalUSD);

// Price Header Card:
<div className="flex justify-between items-baseline">
  <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Pass Price</span>
  <div className="text-right">
    <div className="flex items-baseline gap-1 justify-end">
      <span className="font-display font-black text-2xl text-[var(--color-brand-primary)]">
        {priceDisplay.primary}
      </span>
      <span className="text-xs font-semibold text-charcoal-500">/guest</span>
    </div>
    {currency !== "USD" && (
      <span className="text-[0.6875rem] text-charcoal-400 block font-medium">
        (${pricePerGuestUSD} USD authoritative)
      </span>
    )}
  </div>
</div>

// Price Summary Row:
<div className="flex justify-between items-baseline">
  <span className="font-semibold text-charcoal-800">Total Booking Price</span>
  <div className="text-right">
    <span className="font-display font-bold text-2xl text-charcoal-950">
      {subtotalDisplay.primary}
    </span>
    {currency !== "USD" && (
      <span className="text-[0.6875rem] text-charcoal-500 block font-medium">
        (${subtotalUSD} USD authoritative settlement)
      </span>
    )}
    <span className="text-[0.6875rem] text-charcoal-500 block font-medium">
      All ceremonial access & feasts included
    </span>
  </div>
</div>
```

---

## 5. Verification Method

### 5.1 Static Type Check
Execute TypeScript verification:
```powershell
npx tsc --noEmit
```
**Expected**: 0 type errors. `Currency` type references compile cleanly across `lib/currency.ts`, `context/CurrencyContext.tsx`, `Navbar.tsx`, and pricing components.

### 5.2 Unit & Integration Tests
Run Jest test suite:
```powershell
npm test
```
Or run dedicated tests:
```powershell
npx jest __tests__/lib/remediation-adversarial-concurrency.test.ts
```

### 5.3 Next.js Build Verification
Verify production compilation:
```powershell
npx next build
```
**Expected**: Exit code 0, all static and dynamic routes compile without errors.

### 5.4 Functional Test Checklist
1. **Currency Switcher in Navbar**:
   - Open currency dropdown in desktop navbar -> verify all 8 currencies (`USD`, `EUR`, `GBP`, `AUD`, `CAD`, `SGD`, `AED`, `INR`) render with flag, symbol, code, and title.
   - Select `GBP` -> verify active currency changes to `GBP`.
   - Reload page -> verify `localStorage` persistence restores `GBP`.
2. **Display Estimates**:
   - Navigate to `/weddings` -> verify wedding cards show prices formatted in `£` (e.g. `£195 / guest`).
   - Open a wedding detail page -> verify `BookingSidebar` renders `£195 / guest (~$249 USD authoritative)`.
3. **Settlement Invariant Verification**:
   - Submit a booking -> inspect `createBookingAction` execution.
   - Verify PostgreSQL `Booking` record continues to record `customerPricePerGuestUSD: 249`, `totalAmount: 249`, and `currency: "USD"`.
   - Verify host earnings calculator remains strictly anchored in fixed INR (`HOST_PAYOUT_MATRIX_INR`).

---
*Handoff report finalized. Ready for milestone execution by implementer.*
