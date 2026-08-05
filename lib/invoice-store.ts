import type { InvoiceData, LineItem, OptionalCharge, BankDetails, CurrencyCode, InvoiceTheme } from "./invoice-types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function createEmptyLineItem(): LineItem {
  return {
    id: generateId(),
    description: "",
    quantity: 1,
    rate: 0,
  };
}

export function createInitialInvoice(): InvoiceData {
  return {
    logo: null,
    invoiceNumber: "001",
    senderName: "",
    billTo: "",
    shipTo: "",
    date: getTodayString(),
    paymentTerms: "",
    dueDate: getTomorrowString(),
    poNumber: "",
    lineItems: [createEmptyLineItem()],
    notes: "",
    terms: "",
    discount: null,
    tax: null,
    shipping: null,
    amountPaid: 0,
    bankDetails: {
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      notes: "",
    },
    currency: "IDR",
    theme: "slate",
  };
}

// -- Calculations --

export function getLineItemAmount(item: LineItem): number {
  return item.quantity * item.rate;
}

export function getSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + getLineItemAmount(item), 0);
}

export function getChargeAmount(charge: OptionalCharge | null, subtotal: number): number {
  if (!charge) return 0;
  if (charge.type === "percent") return subtotal * (charge.value / 100);
  return charge.value;
}

export function getTotal(invoice: InvoiceData): number {
  const subtotal = getSubtotal(invoice.lineItems);
  const discountAmt = getChargeAmount(invoice.discount, subtotal);
  const taxAmt = getChargeAmount(invoice.tax, subtotal);
  const shippingAmt = invoice.shipping ?? 0;
  return subtotal - discountAmt + taxAmt + shippingAmt;
}

export function getBalanceDue(invoice: InvoiceData): number {
  return getTotal(invoice) - invoice.amountPaid;
}

// -- Reducer --

export type InvoiceAction =
  | { type: "SET_FIELD"; field: keyof InvoiceData; value: string | number | null }
  | { type: "SET_LOGO"; value: string | null }
  | { type: "SET_CURRENCY"; value: CurrencyCode }
  | { type: "SET_THEME"; value: InvoiceTheme }
  | { type: "ADD_LINE_ITEM" }
  | { type: "REMOVE_LINE_ITEM"; id: string }
  | { type: "UPDATE_LINE_ITEM"; id: string; field: keyof LineItem; value: string | number }
  | { type: "SET_DISCOUNT"; value: OptionalCharge | null }
  | { type: "SET_TAX"; value: OptionalCharge | null }
  | { type: "SET_SHIPPING"; value: number | null }
  | { type: "SET_AMOUNT_PAID"; value: number }
  | { type: "SET_BANK_DETAILS"; field: keyof BankDetails; value: string }
  | { type: "LOAD_DEFAULTS"; data: Partial<InvoiceData> }
  | { type: "RESET" };

export function invoiceReducer(state: InvoiceData, action: InvoiceAction): InvoiceData {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_LOGO":
      return { ...state, logo: action.value };
    case "SET_CURRENCY":
      return { ...state, currency: action.value };
    case "SET_THEME":
      return { ...state, theme: action.value };
    case "ADD_LINE_ITEM":
      return { ...state, lineItems: [...state.lineItems, createEmptyLineItem()] };
    case "REMOVE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.filter((item) => item.id !== action.id),
      };
    case "UPDATE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.id ? { ...item, [action.field]: action.value } : item,
        ),
      };
    case "SET_DISCOUNT":
      return { ...state, discount: action.value };
    case "SET_TAX":
      return { ...state, tax: action.value };
    case "SET_SHIPPING":
      return { ...state, shipping: action.value };
    case "SET_AMOUNT_PAID":
      return { ...state, amountPaid: action.value };
    case "SET_BANK_DETAILS":
      return {
        ...state,
        bankDetails: { ...state.bankDetails, [action.field]: action.value },
      };
    case "LOAD_DEFAULTS":
      return { ...state, ...action.data };
    case "RESET":
      return createInitialInvoice();
    default:
      return state;
  }
}

// -- LocalStorage --

const STORAGE_KEY = "invoice-generator-defaults";

export function saveDefaults(invoice: InvoiceData): void {
  try {
    const defaults = {
      senderName: invoice.senderName,
      currency: invoice.currency,
      theme: invoice.theme,
      bankDetails: invoice.bankDetails,
      notes: invoice.notes,
      terms: invoice.terms,
      paymentTerms: invoice.paymentTerms,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch {
    // Silently fail in case localStorage is unavailable
  }
}

export function loadDefaults(): Partial<InvoiceData> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Silently fail
  }
  return null;
}
