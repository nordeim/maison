/**
 * Maison — Currency selector (Client Component)
 *
 * Dropdown for switching display currency. Stored in localStorage.
 * Prices are converted client-side using static exchange rates.
 *
 * Phase 3: static rates. Phase 3.1: fetch live rates from an API.
 */

'use client';

import { useState, useEffect } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'DKK' | 'SEK';

const CURRENCIES: {
  code: Currency;
  symbol: string;
  name: string;
  rate: number;
}[] = [
  { code: 'USD', symbol: '$', name: 'USD', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'EUR', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'GBP', rate: 0.79 },
  { code: 'DKK', symbol: 'kr', name: 'DKK', rate: 6.87 },
  { code: 'SEK', symbol: 'kr', name: 'SEK', rate: 10.62 },
];

const CURRENCY_KEY = 'maison_currency';

export function getCurrencies() {
  return CURRENCIES;
}

export function convertPrice(cents: number, currency: Currency): string {
  const curr = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
  if (!curr) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      cents / 100,
    );
  }
  const converted = (cents / 100) * curr.rate;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: curr.code,
    maximumFractionDigits: curr.code === 'DKK' || curr.code === 'SEK' ? 0 : 2,
  }).format(converted);
}

export function CurrencySelector() {
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    const saved = localStorage.getItem(CURRENCY_KEY) as Currency | null;
    if (saved && CURRENCIES.some((c) => c.code === saved)) {
      setCurrency(saved);
    }
  }, []);

  const handleChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem(CURRENCY_KEY, newCurrency);
    window.dispatchEvent(new CustomEvent('currency-change', { detail: newCurrency }));
  };

  return (
    <select
      value={currency}
      onChange={(e) => {
        handleChange(e.target.value as Currency);
      }}
      style={{
        padding: '0.25rem 0.5rem',
        fontSize: 12,
        border: '1px solid var(--line)',
        background: 'transparent',
        color: 'var(--ink)',
        cursor: 'pointer',
      }}
      aria-label="Select currency"
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.symbol} {c.name}
        </option>
      ))}
    </select>
  );
}
