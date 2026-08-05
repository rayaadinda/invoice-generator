export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  notes: string;
}

export interface OptionalCharge {
  type: "flat" | "percent";
  value: number;
}

export interface InvoiceData {
  logo: string | null;
  invoiceNumber: string;
  senderName: string;
  billTo: string;
  shipTo: string;
  date: string;
  paymentTerms: string;
  dueDate: string;
  poNumber: string;
  lineItems: LineItem[];
  notes: string;
  terms: string;
  discount: OptionalCharge | null;
  tax: OptionalCharge | null;
  shipping: number | null;
  amountPaid: number;
  bankDetails: BankDetails;
  currency: CurrencyCode;
  theme: InvoiceTheme;
}

export type InvoiceTheme = "slate" | "blue" | "emerald";

export type CurrencyCode = "IDR" | "USD" | "EUR" | "GBP" | "JPY" | "SGD" | "MYR" | "THB" | "AUD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "IDR", symbol: "Rp", label: "IDR (Rp)", locale: "id-ID" },
  { code: "USD", symbol: "$", label: "USD ($)", locale: "en-US" },
  { code: "EUR", symbol: "€", label: "EUR (€)", locale: "de-DE" },
  { code: "GBP", symbol: "£", label: "GBP (£)", locale: "en-GB" },
  { code: "JPY", symbol: "¥", label: "JPY (¥)", locale: "ja-JP" },
  { code: "SGD", symbol: "S$", label: "SGD (S$)", locale: "en-SG" },
  { code: "MYR", symbol: "RM", label: "MYR (RM)", locale: "ms-MY" },
  { code: "THB", symbol: "฿", label: "THB (฿)", locale: "th-TH" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)", locale: "en-AU" },
];

export const THEME_COLORS: Record<InvoiceTheme, { bg: string; text: string; label: string }> = {
  slate: { bg: "#1e293b", text: "#ffffff", label: "Slate" },
  blue: { bg: "#1e40af", text: "#ffffff", label: "Blue" },
  emerald: { bg: "#065f46", text: "#ffffff", label: "Emerald" },
};
