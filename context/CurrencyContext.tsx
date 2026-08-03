"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Currency, detectBrowserCurrency, formatCurrencyAmount } from "@/lib/currency";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountINR: number) => { primary: string; secondary?: string };
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  formatPrice: (amountINR: number) => ({ primary: `₹${amountINR}` }),
});

const STORAGE_KEY = "wwi_user_currency_pref";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    // 1. Check stored user preference
    const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
    if (stored && ["INR", "USD", "EUR"].includes(stored)) {
      setCurrencyState(stored);
      return;
    }

    // 2. Auto-detect from browser locale
    const detected = detectBrowserCurrency();
    setCurrencyState(detected);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
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

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
