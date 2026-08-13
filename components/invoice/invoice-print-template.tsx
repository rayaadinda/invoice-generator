import type { InvoiceData } from "@/lib/invoice-types";
import { formatCurrency, getCurrencyConfig } from "@/lib/format-currency";
import { getSubtotal, getChargeAmount, getTotal, getBalanceDue } from "@/lib/invoice-store";

export function InvoicePrintTemplate({ invoice }: { invoice: InvoiceData }) {
  const subtotal = getSubtotal(invoice.lineItems);
  const discountAmt = getChargeAmount(invoice.discount, subtotal);
  const taxAmt = getChargeAmount(invoice.tax, subtotal);
  const total = getTotal(invoice);
  const balanceDue = getBalanceDue(invoice);
  const config = getCurrencyConfig(invoice.currency);

  // Date formatting
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="invoice-print-template"
      className="w-[210mm] bg-primary text-primary-foreground p-[20mm]"
      style={{ minHeight: "297mm", fontFamily: "var(--font-sans), sans-serif" }}
    >
      {/* Header: Logo/Sender (Left) & Invoice Info (Right) */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-center">
          {invoice.logo && (
            <img src={invoice.logo} alt="Logo" className="w-16 h-16 object-cover rounded" />
          )}
          {invoice.senderName && (
            <div className="text-sm font-semibold text-zinc-800 tracking-wide uppercase">
              {invoice.senderName}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-zinc-800">
            # {invoice.invoiceNumber || "001"}
          </div>
          <div className="text-sm text-zinc-500 mt-1">
            {formatDate(invoice.date)}
          </div>
        </div>
      </div>

      <div className="border-b-2 border-zinc-300 mb-6" />

      {/* Title */}
      <h1 className="text-4xl font-normal text-zinc-800 tracking-tight mb-6">
        INVOICE
      </h1>

      {/* Bill To & Payment Info */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Bill To
          </div>
          <div className="text-sm font-semibold text-zinc-800">
            {invoice.billTo || "-"}
          </div>
          {invoice.shipTo && (
            <div className="text-sm text-zinc-600 mt-1">
              {invoice.shipTo}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Payment
          </div>
          <div className="text-sm text-zinc-600">
            Due Date: <span className="font-semibold text-zinc-800">{formatDate(invoice.dueDate)}</span>
          </div>
          {invoice.paymentTerms && (
            <div className="text-sm text-zinc-600 mt-1">
              Terms: {invoice.paymentTerms}
            </div>
          )}
          {invoice.poNumber && (
            <div className="text-sm text-zinc-600 mt-1">
              PO: {invoice.poNumber}
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-4">
        <div className="grid grid-cols-[1fr_70px_130px_130px] bg-zinc-50 border-y border-zinc-200 py-2 px-4">
          <div className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider">Item</div>
          <div className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider text-right">Quantity</div>
          <div className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider text-right">Rate</div>
          <div className="text-[10px] font-semibold text-zinc-800 uppercase tracking-wider text-right">Amount</div>
        </div>

        {invoice.lineItems.map((item, idx) => {
          const rate = Number(item.rate) || 0;
          const quantity = Number(item.quantity) || 0;
          const amount = quantity * rate;
          
          if (!item.description && amount === 0) return null;

          return (
            <div key={item.id} className={`grid grid-cols-[1fr_70px_130px_130px] py-2 px-4 ${idx !== invoice.lineItems.length - 1 ? 'border-b border-zinc-100' : ''}`}>
              <div className="text-sm font-semibold text-zinc-800">{item.description}</div>
              <div className="text-sm text-zinc-600 text-right">{item.quantity}</div>
              <div className="text-sm text-zinc-600 text-right">
                {config.symbol} {rate.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-zinc-600 text-right">
                {config.symbol} {amount.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-b-2 border-zinc-800 mb-2" />

      {/* Totals */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-lg font-semibold text-zinc-600">
          Total
        </div>
        <div className="w-1/2">
          {invoice.discount && (
            <div className="flex justify-between text-sm text-zinc-600 mb-2">
              <span>Discount</span>
              <span>-{formatCurrency(discountAmt, invoice.currency)}</span>
            </div>
          )}
          {invoice.tax && (
            <div className="flex justify-between text-sm text-zinc-600 mb-2">
              <span>Tax</span>
              <span>{formatCurrency(taxAmt, invoice.currency)}</span>
            </div>
          )}
          {invoice.shipping !== null && (
            <div className="flex justify-between text-sm text-zinc-600 mb-2">
              <span>Shipping</span>
              <span>{formatCurrency(invoice.shipping, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-end text-lg font-semibold text-zinc-800 mt-2">
            {formatCurrency(total, invoice.currency)}
          </div>
          {invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-sm text-zinc-600 mt-4 mb-2">
                <span>Amount Paid</span>
                <span>{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
              </div>
              <div className="border-t border-zinc-200 my-2" />
              <div className="flex justify-between text-base font-semibold text-zinc-800">
                <span>Balance Due</span>
                <span>{formatCurrency(balanceDue, invoice.currency)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notes & Bank Details */}
      <div className="mt-8 pt-6 border-t border-zinc-200">
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-2 gap-8 mb-6">
            {invoice.notes && (
              <div>
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Notes</div>
                <div className="text-xs text-zinc-600 whitespace-pre-wrap">{invoice.notes}</div>
              </div>
            )}
            {invoice.terms && (
              <div>
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Terms</div>
                <div className="text-xs text-zinc-600 whitespace-pre-wrap">{invoice.terms}</div>
              </div>
            )}
          </div>
        )}

        {(invoice.bankDetails?.bankName || invoice.bankDetails?.accountHolder || invoice.bankDetails?.accountNumber) && (
          <div>
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-4">Bank Transfer Details</div>
            <div className="text-sm text-zinc-800">
              <div className="flex flex-col gap-y-2.5">
                {invoice.bankDetails.bankName && (
                  <div className="flex gap-4">
                    <span className="text-zinc-500 w-28">Bank Name :</span>
                    <span className="font-semibold">{invoice.bankDetails.bankName}</span>
                  </div>
                )}
                {invoice.bankDetails.accountHolder && (
                  <div className="flex gap-4">
                    <span className="text-zinc-500 w-28">Account Name :</span>
                    <span className="font-semibold">{invoice.bankDetails.accountHolder}</span>
                  </div>
                )}
                {invoice.bankDetails.accountNumber && (
                  <div className="flex gap-4 items-center">
                    <span className="text-zinc-500 w-28">Account No :</span>
                    <span className="font-semibold text-blue-600 underline tracking-wide">
                      {invoice.bankDetails.accountNumber}
                    </span>
                  </div>
                )}
              </div>
              {invoice.bankDetails.notes && (
                <div className="mt-4 pt-4 border-t border-zinc-200 text-xs text-zinc-600 leading-relaxed max-w-[80%]">
                  {invoice.bankDetails.notes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
