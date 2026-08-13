"use client";
import React from "react";


import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { Plus, X, ImagePlus, Download, History, Save, FilePlus, Copy } from "lucide-react";
import {
  invoiceReducer,
  createInitialInvoice,
  loadDefaults,
  getSubtotal,
  getChargeAmount,
  getTotal,
  getBalanceDue,
} from "@/lib/invoice-store";
import { formatCurrency, getCurrencyConfig } from "@/lib/format-currency";
import type { InvoiceData, OptionalCharge } from "@/lib/invoice-types";
import { THEME_COLORS } from "@/lib/invoice-types";
import {
  saveInvoice,
  generatePdfFilename,
  type SavedInvoice,
} from "@/lib/invoice-history";
import { LineItemRow } from "@/components/invoice/line-item-row";
import { BankDetailsSection } from "@/components/invoice/bank-details";
import { SettingsPanel } from "@/components/invoice/settings-panel";
import { InvoiceHistoryPanel } from "@/components/invoice/invoice-history";
import { InvoicePrintTemplate } from "@/components/invoice/invoice-print-template";

export default function InvoiceDetailPage({ params }: { params: Promise<{ tripId: string, invoiceId: string }> }) {
  const resolvedParams = React.use(params);
  const { tripId, invoiceId } = resolvedParams;
  const router = useRouter();
  const [invoice, dispatch] = useReducer(invoiceReducer, null, createInitialInvoice);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const printTemplateRef = useRef<HTMLDivElement>(null);

  // Fetch invoice data if editing, otherwise load defaults
  const { data: existingInvoice, isLoading } = useSWR(
    invoiceId !== "new" ? `/trips/${tripId}/invoices/${invoiceId}` : null,
    fetcher
  );

  useEffect(() => {
    if (invoiceId === "new") {
      const defaults = loadDefaults();
      if (defaults) dispatch({ type: "LOAD_DEFAULTS", data: defaults });
    } else if (existingInvoice) {
      // Hydrate from existingInvoice
      const data = {
        logo: existingInvoice.metadata?.logo || null,
        invoiceNumber: existingInvoice.invoiceNumber,
        senderName: existingInvoice.metadata?.senderName || "",
        billTo: existingInvoice.metadata?.billTo || "",
        shipTo: existingInvoice.metadata?.shipTo || "",
        date: existingInvoice.date.split("T")[0],
        paymentTerms: existingInvoice.metadata?.paymentTerms || "",
        dueDate: existingInvoice.dueDate ? existingInvoice.dueDate.split("T")[0] : "",
        poNumber: existingInvoice.metadata?.poNumber || "",
        lineItems: existingInvoice.lineItems.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
        notes: existingInvoice.notes || "",
        terms: existingInvoice.terms || "",
        discount: existingInvoice.metadata?.discount || null,
        tax: existingInvoice.metadata?.tax || null,
        shipping: existingInvoice.metadata?.shipping || null,
        amountPaid: existingInvoice.metadata?.amountPaid || 0,
        bankDetails: existingInvoice.bankDetails || { bankName: "", accountHolder: "", accountNumber: "", notes: "" },
        currency: existingInvoice.currency,
        theme: existingInvoice.metadata?.theme || "slate",
      };
      dispatch({ type: "LOAD_DEFAULTS", data });
      setCurrentInvoiceId(existingInvoice.id);
    }
  }, [invoiceId, existingInvoice]);


  // Logo upload handler (with compression)
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_SIZE = 400;
        let { width, height } = img;
        
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress to JPEG to save massive amounts of local storage
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        dispatch({ type: "SET_LOGO", value: compressed });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Save invoice to history
  
  async function handleSaveInvoice() {
    try {
      const payload = {
        invoiceNumber: invoice.invoiceNumber,
        date: new Date(invoice.date).toISOString(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : undefined,
        notes: invoice.notes,
        terms: invoice.terms,
        currency: invoice.currency,
        bankDetails: invoice.bankDetails,
        lineItems: invoice.lineItems.map((item: any, index: number) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          sortOrder: index,
        })),
        metadata: {
          logo: invoice.logo,
          senderName: invoice.senderName,
          billTo: invoice.billTo,
          shipTo: invoice.shipTo,
          paymentTerms: invoice.paymentTerms,
          poNumber: invoice.poNumber,
          discount: invoice.discount,
          tax: invoice.tax,
          shipping: invoice.shipping,
          amountPaid: invoice.amountPaid,
          theme: invoice.theme,
        },
      };

      if (invoiceId === "new") {
        const res = await api.post(`/trips/${tripId}/invoices`, payload);
        alert("Invoice created successfully");
        router.push(`/dashboard/trips/${tripId}/invoices/${res.data.id}`);
      } else {
        await api.put(`/trips/${tripId}/invoices/${invoiceId}`, payload);
        alert("Invoice updated successfully");
      }
    } catch (err) {
      alert("Failed to save invoice");
      console.error(err);
    }
  }

  async function handleSaveAsNew() {
    try {
      const payload = {
        invoiceNumber: invoice.invoiceNumber + "-COPY",
        date: new Date(invoice.date).toISOString(),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : undefined,
        notes: invoice.notes,
        terms: invoice.terms,
        currency: invoice.currency,
        bankDetails: invoice.bankDetails,
        lineItems: invoice.lineItems.map((item: any, index: number) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          sortOrder: index,
        })),
        metadata: {
          logo: invoice.logo,
          senderName: invoice.senderName,
          billTo: invoice.billTo,
          shipTo: invoice.shipTo,
          paymentTerms: invoice.paymentTerms,
          poNumber: invoice.poNumber,
          discount: invoice.discount,
          tax: invoice.tax,
          shipping: invoice.shipping,
          amountPaid: invoice.amountPaid,
          theme: invoice.theme,
        },
      };
      
      const res = await api.post(`/trips/${tripId}/invoices`, payload);
      alert("Saved as new invoice");
      router.push(`/dashboard/trips/${tripId}/invoices/${res.data.id}`);
    } catch (err) {
      alert("Failed to save invoice");
      console.error(err);
    }
  }

  // Save + Download PDF
  const handleSaveAndDownload = useCallback(async () => {
    // Save first
    await handleSaveInvoice();

    // Then download
    await handleDownloadPdf();
  }, [invoice, invoiceId, tripId]);

  // New invoice
  function handleNewInvoice() {
    dispatch({ type: "RESET" });
    setCurrentInvoiceId(null);
    router.push(`/dashboard/trips/${tripId}/invoices/new`);
  }

  // PDF download handler
  const handleDownloadPdf = useCallback(async () => {
    if (!printTemplateRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const element = printTemplateRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (doc) => {
          const wrapper = doc.getElementById("invoice-print-template-wrapper");
          if (wrapper) {
            wrapper.style.opacity = "1";
          }
        },
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");

      // Handle multi-page if content is taller than A4
      const pageHeight = 297; // A4 height in mm
      let heightLeft = imgHeight;
      let position = 0;

      // Compress to JPEG for dramatically smaller PDF size (e.g. 300kb instead of 10mb)
      const imgData = canvas.toDataURL("image/jpeg", 0.8);

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Use billTo_senderName format for filename
      const fileName = generatePdfFilename(invoice);
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [invoice]);


  const subtotal = getSubtotal(invoice.lineItems);
  const discountAmt = getChargeAmount(invoice.discount, subtotal);
  const taxAmt = getChargeAmount(invoice.tax, subtotal);
  const total = getTotal(invoice);
  const balanceDue = getBalanceDue(invoice);
  const currencyConfig = getCurrencyConfig(invoice.currency);
  const themeColors = THEME_COLORS[invoice.theme];

  return (
    <>
      {/* Top bar with history toggle */}
      
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 lg:px-0">
        <PageHeader 
          title={invoiceId === "new" ? "Create Invoice" : "Edit Invoice"}
          breadcrumbs={[
            { label: "Trips", href: "/dashboard/trips" },
            { label: "Trip", href: `/dashboard/trips/${tripId}` },
            { label: "Invoices", href: `/dashboard/trips/${tripId}/invoices` },
            { label: invoiceId === "new" ? "New" : existingInvoice?.invoiceNumber || "Edit" }
          ]}
          actions={
            <div className="flex items-center gap-2">
              {invoiceId !== "new" && (
                <>
                  <button
                    onClick={() => router.push(`/dashboard/trips/${tripId}/invoices/new`)}
                    className="flex items-center gap-1.5 rounded border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                    New
                  </button>
                  <button
                    onClick={handleSaveAsNew}
                    className="flex items-center gap-1.5 rounded border border-emerald-600/20 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Save As
                  </button>
                </>
              )}
              <button
                onClick={handleSaveInvoice}
                className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-emerald-700"
              >
                <Save className="h-3.5 w-3.5" />
                {invoiceId !== "new" ? "Update" : "Save"}
              </button>
            </div>
          }
        />
      </div>


      {/* History panel */}
      

      <div className="flex w-full gap-6 pb-24 lg:pb-0">
        {/* Main invoice area */}
        <div className="min-w-0 flex-1">
          <div
            ref={invoiceRef}
            className="invoice-card rounded-md border border-border bg-card p-6 sm:p-8"
          >
            {/* Header: Logo + INVOICE title + number */}
            <div className="flex items-start justify-between gap-4">
              {/* Logo */}
              <div>
                {invoice.logo ? (
                  <div className="relative">
                    <img
                      src={invoice.logo}
                      alt="Invoice logo"
                      className="h-20 w-20 rounded object-cover"
                    />
                    <button
                      onClick={() => dispatch({ type: "SET_LOGO", value: null })}
                      className="no-print absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
                      aria-label="Remove logo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="logo-upload flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-muted-foreground/50">
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Add Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                )}
              </div>

              {/* Title + Invoice number */}
              <div className="text-right">
                <h1 className="text-3xl font-semibold tracking-tight">INVOICE</h1>
                <div className="mt-2 flex items-center justify-end gap-1">
                  <span className="text-sm text-muted-foreground">#</span>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "invoiceNumber",
                        value: e.target.value,
                      })
                    }
                    className="invoice-input w-20 rounded border border-border bg-background px-2 py-1 text-right text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Sender + Dates section */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Left column: Sender, Bill To, Ship To */}
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={invoice.senderName}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "senderName",
                        value: e.target.value,
                      })
                    }
                    placeholder="Your business name"
                    className="invoice-input w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Bill To
                    </label>
                    <input
                      type="text"
                      value={invoice.billTo}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "billTo",
                          value: e.target.value,
                        })
                      }
                      placeholder="Client name"
                      className="invoice-input w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Ship To
                    </label>
                    <input
                      type="text"
                      value={invoice.shipTo}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "shipTo",
                          value: e.target.value,
                        })
                      }
                      placeholder="(optional)"
                      className="invoice-input w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              {/* Right column: Dates */}
              <div className="space-y-3">
                <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-2">
                  <label className="text-sm text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) =>
                      dispatch({ type: "SET_FIELD", field: "date", value: e.target.value })
                    }
                    className="invoice-input w-full rounded border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-2">
                  <label className="text-sm text-muted-foreground">Payment Terms</label>
                  <input
                    type="text"
                    value={invoice.paymentTerms}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "paymentTerms",
                        value: e.target.value,
                      })
                    }
                    placeholder=""
                    className="invoice-input w-full rounded border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-2">
                  <label className="text-sm text-muted-foreground">Due Date</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) =>
                      dispatch({ type: "SET_FIELD", field: "dueDate", value: e.target.value })
                    }
                    className="invoice-input w-full rounded border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-2">
                  <label className="text-sm text-muted-foreground">PO Number</label>
                  <input
                    type="text"
                    value={invoice.poNumber}
                    onChange={(e) =>
                      dispatch({ type: "SET_FIELD", field: "poNumber", value: e.target.value })
                    }
                    placeholder=""
                    className="invoice-input w-full rounded border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mt-8 overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Table header */}
                <div
                  className="grid grid-cols-[1fr_70px_130px_130px_80px] items-center gap-0 rounded-t px-0 text-sm font-medium"
                  style={{ backgroundColor: themeColors.bg, color: themeColors.text }}
                >
                  <div className="px-3 py-2">Item</div>
                  <div className="px-2 py-2 text-center">Qty</div>
                  <div className="px-3 py-2 text-center">Rate</div>
                  <div className="px-3 py-2 text-right">Amount</div>
                  <div />
                </div>

                {/* Line item rows */}
                <div className="rounded-b border border-t-0 border-border">
                  {invoice.lineItems.map((item, index) => (
                    <LineItemRow
                      key={item.id}
                      item={item}
                      currency={invoice.currency}
                      canDelete={invoice.lineItems.length > 1}
                      isFirst={index === 0}
                      isLast={index === invoice.lineItems.length - 1}
                      onUpdate={(field, value) =>
                        dispatch({ type: "UPDATE_LINE_ITEM", id: item.id, field, value })
                      }
                      onDelete={() => dispatch({ type: "REMOVE_LINE_ITEM", id: item.id })}
                      onMoveUp={() => dispatch({ type: "MOVE_LINE_ITEM", id: item.id, direction: "up" })}
                      onMoveDown={() => dispatch({ type: "MOVE_LINE_ITEM", id: item.id, direction: "down" })}
                    />
                  ))}
                  <button
                    onClick={() => dispatch({ type: "ADD_LINE_ITEM" })}
                    className="flex w-full items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Line Item
                  </button>
                </div>
              </div>
            </div>

            {/* Notes / Terms + Totals */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Left: Notes + Terms */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">
                    Notes
                  </label>
                  <textarea
                    value={invoice.notes}
                    onChange={(e) =>
                      dispatch({ type: "SET_FIELD", field: "notes", value: e.target.value })
                    }
                    placeholder="Notes - any relevant information not already covered"
                    rows={3}
                    className="invoice-input w-full resize-none rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">
                    Terms
                  </label>
                  <textarea
                    value={invoice.terms}
                    onChange={(e) =>
                      dispatch({ type: "SET_FIELD", field: "terms", value: e.target.value })
                    }
                    placeholder="Terms and conditions - late fees, payment methods, delivery schedule"
                    rows={3}
                    className="invoice-input w-full resize-none rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Right: Totals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal, invoice.currency)}</span>
                </div>

                <div className="flex gap-2">
                  {!invoice.discount && (
                    <button
                      onClick={() =>
                        dispatch({
                          type: "SET_DISCOUNT",
                          value: { type: "flat", value: 0 },
                        })
                      }
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      + Discount
                    </button>
                  )}
                  {!invoice.tax && (
                    <button
                      onClick={() =>
                        dispatch({ type: "SET_TAX", value: { type: "percent", value: 0 } })
                      }
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      + Tax
                    </button>
                  )}
                  {invoice.shipping === null && (
                    <button
                      onClick={() => dispatch({ type: "SET_SHIPPING", value: 0 })}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      + Shipping
                    </button>
                  )}
                </div>

                {invoice.discount && (
                  <OptionalChargeRow
                    label="Discount"
                    charge={invoice.discount}
                    currency={invoice.currency}
                    amount={discountAmt}
                    isNegative
                    onChange={(val) => dispatch({ type: "SET_DISCOUNT", value: val })}
                    onRemove={() => dispatch({ type: "SET_DISCOUNT", value: null })}
                  />
                )}

                {invoice.tax && (
                  <OptionalChargeRow
                    label="Tax"
                    charge={invoice.tax}
                    currency={invoice.currency}
                    amount={taxAmt}
                    onChange={(val) => dispatch({ type: "SET_TAX", value: val })}
                    onRemove={() => dispatch({ type: "SET_TAX", value: null })}
                  />
                )}

                {invoice.shipping !== null && (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Shipping</span>
                      <button
                        onClick={() => dispatch({ type: "SET_SHIPPING", value: null })}
                        className="no-print text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {currencyConfig.symbol}
                      </span>
                      <input
                        type="number"
                        value={invoice.shipping || ""}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_SHIPPING",
                            value: Number(e.target.value) || 0,
                          })
                        }
                        className="w-20 rounded border border-border bg-background px-2 py-0.5 text-right text-sm outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-3" />

                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{formatCurrency(total, invoice.currency)}</span>
                </div>

                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {currencyConfig.symbol}
                    </span>
                    <input
                      type="number"
                      value={invoice.amountPaid || ""}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_AMOUNT_PAID",
                          value: Number(e.target.value) || 0,
                        })
                      }
                      className="w-24 rounded border border-border bg-background px-2 py-0.5 text-right text-sm outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-3" />

                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Balance Due</span>
                  <span className="text-base font-semibold">
                    {formatCurrency(balanceDue, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Transfer Details */}
            <BankDetailsSection bankDetails={invoice.bankDetails} dispatch={dispatch} />
          </div>
        </div>

        {/* Settings sidebar */}
        <div className="no-print hidden w-[200px] shrink-0 lg:block">
          <div className="sticky top-8">
            <SettingsPanel
              invoice={invoice}
              dispatch={dispatch}
              onDownloadPdf={handleSaveAndDownload}
              isGeneratingPdf={isGeneratingPdf}
            />
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="no-print fixed bottom-0 left-0 right-0 z-30 flex items-center gap-2 border-t border-border bg-card px-4 py-3 lg:hidden">
          <button
            onClick={handleSaveInvoice}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-emerald-700"
          >
            <Save className="h-4 w-4" />
            {currentInvoiceId ? "Update" : "Save"}
          </button>
          
          {currentInvoiceId && (
            <button
              onClick={handleSaveAsNew}
              className="flex flex-1 items-center justify-center gap-2 rounded border border-emerald-600/20 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
            >
              <Copy className="h-4 w-4" />
              Save As
            </button>
          )}
          <button
            onClick={handleSaveAndDownload}
            disabled={isGeneratingPdf}
            className="flex flex-1 items-center justify-center gap-2 rounded border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isGeneratingPdf ? "..." : "PDF"}
          </button>
        </div>
      </div>

      {/* Hidden Print Template for html2canvas */}
      <div
        id="invoice-print-template-wrapper"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -50,
          pointerEvents: "none",
          opacity: 0.001,
        }}
      >
        <div ref={printTemplateRef} className="bg-primary">
          <InvoicePrintTemplate invoice={invoice} />
        </div>
      </div>
    </>
  );
}

// -- Optional Charge Row Component --

function OptionalChargeRow({
  label,
  charge,
  currency,
  amount,
  isNegative,
  onChange,
  onRemove,
}: {
  label: string;
  charge: OptionalCharge;
  currency: InvoiceData["currency"];
  amount: number;
  isNegative?: boolean;
  onChange: (val: OptionalCharge) => void;
  onRemove: () => void;
}) {
  const config = getCurrencyConfig(currency);

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{label}</span>
        <button
          onClick={onRemove}
          className="no-print text-muted-foreground hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center gap-1">
        <select
          value={charge.type}
          onChange={(e) =>
            onChange({ ...charge, type: e.target.value as "flat" | "percent" })
          }
          className="rounded border border-border bg-background px-1.5 py-0.5 text-xs outline-none"
        >
          <option value="flat">{config.symbol}</option>
          <option value="percent">%</option>
        </select>
        <input
          type="number"
          value={charge.value || ""}
          onChange={(e) => onChange({ ...charge, value: Number(e.target.value) || 0 })}
          className="w-16 rounded border border-border bg-background px-2 py-0.5 text-right text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="ml-2 min-w-[80px] text-right font-medium">
          {isNegative ? "-" : ""}
          {formatCurrency(amount, currency)}
        </span>
      </div>
    </div>
  );
}
