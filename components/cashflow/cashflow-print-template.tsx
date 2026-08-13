import * as React from "react"
import { forwardRef } from "react"

export interface CashflowPrintTemplateProps {
  trip: any
  cashflow: {
    summary: { totalIncome: number; totalExpense: number; netBalance: number }
    entries: any[]
    memberBreakdown: any[]
  }
}

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

export const CashflowPrintTemplate = forwardRef<HTMLDivElement, CashflowPrintTemplateProps>(
  ({ trip, cashflow }, ref) => {
    return (
      <div 
        ref={ref}
        className="w-[210mm] bg-[#ffffff] text-[#000000] p-[20mm] font-serif mx-auto shadow-none"
        style={{ boxSizing: "border-box", WebkitFontSmoothing: "antialiased" }}
      >
        {/* Header / Letterhead */}
        <div className="flex justify-between items-start border-b border-[#000000] pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#000000] uppercase mb-1" style={{ letterSpacing: "1px" }}>
              Laporan Arus Kas
            </h1>
            <h2 className="text-lg font-semibold text-[#333333]">{trip?.name || "Trip Name"}</h2>
            <p className="text-sm text-[#555555] mt-1">
              Periode: {trip?.startDate ? new Date(trip.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""} – {trip?.endDate ? new Date(trip.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
            </p>
          </div>
          
        </div>

        {/* Executive Summary (Traditional Table Format) */}
        <div className="mb-10 w-1/2">
          <h3 className="text-md font-semibold text-[#000000] uppercase border-b border-[#000000] pb-1 mb-2">Ringkasan Akun</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-[#333333]">Total Pemasukan</td>
                <td className="py-1 text-right text-[#000000]">{formatIDR(cashflow.summary.totalIncome)}</td>
              </tr>
              <tr>
                <td className="py-1 text-[#333333]">Total Pengeluaran</td>
                <td className="py-1 text-right text-[#000000]">({formatIDR(cashflow.summary.totalExpense)})</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold border-t border-[#000000] mt-1 pt-1">Saldo Bersih Akhir</td>
                <td className="py-1 text-right font-semibold border-t border-[#000000] mt-1 pt-1">
                  {cashflow.summary.netBalance < 0 ? `(${formatIDR(cashflow.summary.netBalance)})` : formatIDR(cashflow.summary.netBalance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Transaction Ledger */}
        <div className="mb-10">
          <h3 className="text-md font-semibold text-[#000000] uppercase border-b border-[#000000] pb-1 mb-2">Detail Transaksi</h3>
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b-2 border-[#000000]">
                <th className="py-2 text-left font-semibold w-[15%]">Tanggal</th>
                <th className="py-2 text-left font-semibold w-[35%]">Deskripsi</th>
                <th className="py-2 text-left font-semibold w-[20%]">Referensi</th>
                <th className="py-2 text-right font-semibold w-[15%]">Pemasukan</th>
                <th className="py-2 text-right font-semibold w-[15%]">Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              {cashflow.entries.map((entry, idx) => (
                <tr key={entry.id || idx} className="border-b border-[#dddddd]">
                  <td className="py-2 text-[#333333] whitespace-nowrap">
                    {new Date(entry.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-2 text-[#000000]">
                    {entry.description}
                  </td>
                  <td className="py-2 text-[#555555] text-xs">
                    {entry.member?.name || "Kas"}
                  </td>
                  <td className="py-2 text-right font-mono">
                    {entry.type === "INCOME" ? formatIDR(entry.amount) : "-"}
                  </td>
                  <td className="py-2 text-right font-mono">
                    {entry.type === "EXPENSE" ? formatIDR(entry.amount) : "-"}
                  </td>
                </tr>
              ))}
              {cashflow.entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#555555] italic border-b border-[#dddddd]">
                    Tidak ada transaksi tercatat untuk periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-4 border-t border-[#000000] flex justify-between items-end text-xs text-[#555555]">
          <div className="text-right">
            <p className="font-semibold text-[#000000] uppercase tracking-wider">Akhir Laporan</p>
          </div>
        </div>
      </div>
    )
  }
)
CashflowPrintTemplate.displayName = "CashflowPrintTemplate"
