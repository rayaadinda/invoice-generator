"use client";

import type { BankDetails } from "@/lib/invoice-types";
import type { InvoiceAction } from "@/lib/invoice-store";
import { Landmark } from "lucide-react";

interface BankDetailsSectionProps {
  bankDetails: BankDetails;
  dispatch: React.Dispatch<InvoiceAction>;
}

export function BankDetailsSection({ bankDetails, dispatch }: BankDetailsSectionProps) {
  function handleChange(field: keyof BankDetails, value: string) {
    dispatch({ type: "SET_BANK_DETAILS", field, value });
  }

  return (
    <div className="mt-6 rounded border border-border bg-muted/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Landmark className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Bank Transfer Details</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Bank Name</label>
          <input
            type="text"
            value={bankDetails.bankName}
            onChange={(e) => handleChange("bankName", e.target.value)}
            placeholder="e.g. BCA, Mandiri, BNI"
            className="invoice-input w-full rounded border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Account Holder
          </label>
          <input
            type="text"
            value={bankDetails.accountHolder}
            onChange={(e) => handleChange("accountHolder", e.target.value)}
            placeholder="Account holder name"
            className="invoice-input w-full rounded border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Account Number
          </label>
          <input
            type="text"
            value={bankDetails.accountNumber}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
            placeholder="1234567890"
            className="invoice-input w-full rounded border border-border bg-background px-3 py-1.5 text-sm font-mono outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Additional Notes
          </label>
          <input
            type="text"
            value={bankDetails.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="e.g. Transfer sebelum tanggal ..."
            className="invoice-input w-full rounded border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}
