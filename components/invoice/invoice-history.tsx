"use client";

import { useState, useEffect } from "react";
import { History, Trash2, Edit3, Plus, X, FileText } from "lucide-react";
import { getInvoiceHistory, deleteInvoice, type SavedInvoice } from "@/lib/invoice-history";
import { formatCurrency } from "@/lib/format-currency";
import type { CurrencyCode } from "@/lib/invoice-types";

interface InvoiceHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadInvoice: (invoice: SavedInvoice) => void;
  onNewInvoice: () => void;
  currentInvoiceId: string | null;
}

export function InvoiceHistoryPanel({
  isOpen,
  onClose,
  onLoadInvoice,
  onNewInvoice,
  currentInvoiceId,
}: InvoiceHistoryPanelProps) {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);

  useEffect(() => {
    if (isOpen) {
      setInvoices(getInvoiceHistory());
    }
  }, [isOpen]);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteInvoice(id);
    setInvoices(getInvoiceHistory());
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="fixed left-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-r border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Invoice History</h2>
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {invoices.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Invoice button */}
        <div className="border-b border-border px-4 py-3">
          <button
            onClick={() => {
              onNewInvoice();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-border bg-muted/30 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New Invoice
          </button>
        </div>

        {/* Invoice list */}
        <div className="history-scroll flex-1 overflow-y-auto">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No saved invoices yet</p>
              <p className="text-xs text-muted-foreground/60">
                Save an invoice to see it here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {invoices.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => {
                    onLoadInvoice(inv);
                    onClose();
                  }}
                  className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    currentInvoiceId === inv.id ? "bg-muted/60" : ""
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {inv.billTo || "Untitled"}
                      </p>
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <span
                          onClick={(e) => handleDelete(inv.id, e)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </span>
                      </div>
                    </div>

                    <p className="truncate text-xs text-muted-foreground">
                      {inv.senderName || "No sender"}
                    </p>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground/60">
                        {formatDate(inv.updatedAt)}
                      </span>
                      <span className="text-xs font-medium">
                        {formatCurrency(inv.total, inv.currency as CurrencyCode)}
                      </span>
                    </div>

                    {currentInvoiceId === inv.id && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <Edit3 className="h-2.5 w-2.5" />
                        Currently editing
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
