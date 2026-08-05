import { CURRENCIES, type CurrencyCode } from "./invoice-types";

export function getCurrencyConfig(code: CurrencyCode) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const config = getCurrencyConfig(currencyCode);

  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.code === "JPY" ? 0 : 2,
    maximumFractionDigits: config.code === "JPY" ? 0 : 2,
  }).format(amount);

  return `${config.code} ${formatted}`;
}

export function formatCurrencyShort(amount: number, currencyCode: CurrencyCode): string {
  const config = getCurrencyConfig(currencyCode);
  return `${config.symbol} ${new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)}`;
}
