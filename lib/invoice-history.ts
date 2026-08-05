import type { InvoiceData } from "./invoice-types";
import { getTotal } from "./invoice-store";

export interface SavedInvoice {
  id: string;
  data: InvoiceData;
  createdAt: string;
  updatedAt: string;
  // Cached display fields
  billTo: string;
  senderName: string;
  total: number;
  currency: string;
}

const HISTORY_KEY = "invoice-generator-history";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/** Get all saved invoices, sorted by updatedAt descending */
export function getInvoiceHistory(): SavedInvoice[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const invoices: SavedInvoice[] = JSON.parse(stored);
    return invoices.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch {
    return [];
  }
}

/** Save a new invoice or update an existing one. Returns the saved invoice. */
export function saveInvoice(data: InvoiceData, existingId?: string): SavedInvoice {
  const history = getInvoiceHistory();
  const now = new Date().toISOString();

  if (existingId) {
    // Update existing
    const index = history.findIndex((inv) => inv.id === existingId);
    if (index !== -1) {
      history[index] = {
        ...history[index],
        data,
        updatedAt: now,
        billTo: data.billTo,
        senderName: data.senderName,
        total: getTotal(data),
        currency: data.currency,
      };
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      return history[index];
    }
  }

  // Create new
  const saved: SavedInvoice = {
    id: generateId(),
    data,
    createdAt: now,
    updatedAt: now,
    billTo: data.billTo,
    senderName: data.senderName,
    total: getTotal(data),
    currency: data.currency,
  };

  history.unshift(saved);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return saved;
}

/** Delete an invoice by ID */
export function deleteInvoice(id: string): void {
  const history = getInvoiceHistory();
  const filtered = history.filter((inv) => inv.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

/** Get a single invoice by ID */
export function getInvoiceById(id: string): SavedInvoice | null {
  const history = getInvoiceHistory();
  return history.find((inv) => inv.id === id) ?? null;
}

/** Generate PDF filename */
export function generatePdfFilename(invoice: InvoiceData): string {
  const number = invoice.invoiceNumber ? `#${invoice.invoiceNumber}` : "";
  const billTo = invoice.billTo ? `- ${invoice.billTo}` : "";
  
  let filename = `Invoice ${number} ${billTo}`.trim();
  // Remove multiple spaces and sanitize invalid file characters
  filename = filename.replace(/\s+/g, " ").replace(/[\\/:*?"<>|]/g, "");
  
  return `${filename}.pdf`;
}
