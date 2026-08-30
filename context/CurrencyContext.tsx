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
