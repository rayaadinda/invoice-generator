"use client";

import { ChevronUp, Download, Save } from "lucide-react";
import { CURRENCIES, THEME_COLORS } from "@/lib/invoice-types";
import type { InvoiceData, CurrencyCode, InvoiceTheme } from "@/lib/invoice-types";
import type { InvoiceAction } from "@/lib/invoice-store";
import { saveDefaults } from "@/lib/invoice-store";
import { useState } from "react";

interface SettingsPanelProps {
  invoice: InvoiceData;
  dispatch: React.Dispatch<InvoiceAction>;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export function SettingsPanel({ invoice, dispatch, onDownloadPdf, isGeneratingPdf }: SettingsPanelProps) {
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSaveDefault() {
    saveDefaults(invoice);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="no-print flex flex-col gap-3">
      {/* Download button */}
      <button
        onClick={onDownloadPdf}
        disabled={isGeneratingPdf}
        className="flex w-full items-center justify-center gap-2 rounded border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isGeneratingPdf ? "Generating..." : "Download PDF"}
      </button>

      {/* Settings card */}
      <div className="rounded border border-border bg-background">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        >
          Invoice Settings
          <ChevronUp
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              settingsOpen ? "" : "rotate-180"
            }`}
          />
        </button>

        {settingsOpen && (
          <div className="border-t border-border px-4 py-3 space-y-4">
            {/* Theme selector */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Theme
              </label>
              <select
                value={invoice.theme}
                onChange={(e) =>
                  dispatch({ type: "SET_THEME", value: e.target.value as InvoiceTheme })
                }
                className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm font-medium outline-none focus:ring-1 focus:ring-ring"
              >
                {Object.entries(THEME_COLORS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency selector */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Currency
              </label>
              <select
                value={invoice.currency}
                onChange={(e) =>
                  dispatch({ type: "SET_CURRENCY", value: e.target.value as CurrencyCode })
                }
                className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm font-medium outline-none focus:ring-1 focus:ring-ring"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Save Default */}
            <button
              onClick={handleSaveDefault}
              className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
            >
              <Save className="h-3.5 w-3.5" />
              {saved ? "Saved!" : "Save Default"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
