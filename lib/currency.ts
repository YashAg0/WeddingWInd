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

/**
 * Converts an INR amount to target currency.
 */
export function convertFromINR(amountINR: number, targetCurrency: Currency): number {
  if (targetCurrency === "INR") return amountINR;
  const rate = FX_RATES[targetCurrency] || 1;
  return amountINR / rate;
}

/**
 * Formats an INR amount to the specified currency string.
 */
export function formatCurrencyAmount(amountINR: number, currency: Currency): string {
  const converted = convertFromINR(amountINR, currency);
  
  if (currency === "INR") {
    return `₹${Math.round(converted).toLocaleString("en-IN")}`;
  }
  
  if (currency === "USD") {
    return `$${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  if (currency === "EUR") {
    return `€${converted.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${CURRENCY_SYMBOLS[currency]}${converted.toFixed(2)}`;
}

/**
 * Detects default currency based on browser locale.
 */
export function detectBrowserCurrency(): Currency {
  if (typeof window === "undefined") return "USD";
  try {
    const locale = navigator.language || Intl.NumberFormat().resolvedOptions().locale || "";
    if (locale.includes("-IN") || locale.includes("hi") || locale.includes("ta") || locale.includes("te")) {
      return "INR";
    }
    const eurozoneLocales = ["de", "fr", "es", "it", "nl", "pt", "fi", "at", "be", "gr", "ie"];
    if (eurozoneLocales.some((lang) => locale.toLowerCase().startsWith(lang))) {
      return "EUR";
    }
  } catch (err) {
    console.warn("Locale detection fallback:", err);
  }
  return "USD";
}
