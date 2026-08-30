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
  AED: "AED",
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
    const showDecimals = options?.showDecimals ?? false;
    const formatted = amountUSD.toLocaleString("en-US", {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    return `$${formatted}`;
  }
  const amountINR = amountUSD * FX_RATES.USD;
  return formatCurrencyAmount(amountINR, currency, options);
}

/**
 * Formats a USD base price into a display pair (primary formatted currency + secondary reference).
 */
export function formatCurrencyPairFromUSD(
  amountUSD: number,
  currency: Currency
): { primary: string; secondary: string } {
  if (currency === "USD") {
    const formattedUSD = formatCurrencyFromUSD(amountUSD, "USD");
    const amountINR = amountUSD * (FX_RATES.USD || 95.5);
    const formattedINR = formatCurrencyAmount(amountINR, "INR", { showDecimals: false });
    return {
      primary: formattedUSD,
      secondary: `${formattedINR} INR`,
    };
  }
  const formattedPrimary = formatCurrencyFromUSD(amountUSD, currency);
  const formattedUSD = formatCurrencyFromUSD(amountUSD, "USD");
  return {
    primary: formattedPrimary,
    secondary: `${formattedUSD} USD`,
  };
}

/**
 * Detects default currency based on browser locale.
 */
export function detectBrowserCurrency(overrideLocale?: string): Currency {
  const locale = (
    overrideLocale ||
    (typeof window !== "undefined"
      ? navigator.language || Intl.NumberFormat().resolvedOptions().locale || ""
      : "")
  ).toLowerCase();

  if (!locale) return "USD";

  try {
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
