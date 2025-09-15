
"use client";

import React, { createContext, useState, ReactNode, useMemo, useEffect } from 'react';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (value: number, options?: Intl.NumberFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<string>('USD');

  useEffect(() => {
    const storedCurrency = localStorage.getItem('app-currency');
    if (storedCurrency) {
      setCurrencyState(storedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('app-currency', newCurrency);
  }

  const formatCurrency = useMemo(() => (value: number, options: Intl.NumberFormatOptions = {}) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      ...options
    }).format(value);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencyContext = () => {
  const context = React.useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
};
