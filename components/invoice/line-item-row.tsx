"use client";

import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { LineItem } from "@/lib/invoice-types";
import { getCurrencyConfig } from "@/lib/format-currency";
import type { CurrencyCode } from "@/lib/invoice-types";

interface LineItemRowProps {
  item: LineItem;
  currency: CurrencyCode;
  canDelete: boolean;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (field: keyof LineItem, value: string | number) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function LineItemRow({ item, currency, canDelete, isFirst, isLast, onUpdate, onDelete, onMoveUp, onMoveDown }: LineItemRowProps) {
  const amount = item.quantity * item.rate;
  const config = getCurrencyConfig(currency);

  const formattedAmount = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(amount);

  return (
    <div className="group grid grid-cols-[1fr_70px_130px_130px_80px] items-center gap-0 border-b border-border">
      <div className="px-3 py-2">
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Item description"
          className="invoice-input w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="border-l border-border px-3 py-2">
        <input
          type="number"
          value={item.quantity || ""}
          onChange={(e) => onUpdate("quantity", Number(e.target.value) || 0)}
          min={0}
          className="invoice-input w-full bg-transparent text-center text-sm outline-none"
        />
      </div>

      <div className="flex items-center gap-1 border-l border-border px-2 py-2">
        <span className="text-xs text-muted-foreground">{config.symbol}</span>
        <input
          type="number"
          value={item.rate || ""}
          onChange={(e) => onUpdate("rate", Number(e.target.value) || 0)}
          min={0}
          className="invoice-input w-full bg-transparent text-right text-sm outline-none"
        />
      </div>

      <div className="border-l border-border px-3 py-2 text-right text-sm font-medium">
        {config.symbol} {formattedAmount}
      </div>

      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            className="rounded p-1 ml-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            aria-label="Remove line item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
