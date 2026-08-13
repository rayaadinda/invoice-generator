"use client"

import * as React from "react"
import { Search, Filter, ArrowUpRight, ArrowDownRight, Wallet, X, Plus, ChevronRight, Check, Square, CheckSquare, Settings, Users, Receipt, Calendar, CreditCard, TrendingUp, TrendingDown, Activity, ListOrdered, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PageHeader } from "@/components/ui/page-header"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import useSWR, { mutate } from "swr"
import { fetcher, api } from "@/lib/api"
import { AddCashflowDialog } from "@/components/trips/add-cashflow-dialog"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { CashflowPrintTemplate } from "@/components/cashflow/cashflow-print-template"

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CashflowPage({ params }: { params: Promise<{ tripId: string }> }) {
  const resolvedParams = React.use(params)
  const { data: entriesData = [], isLoading: isEntriesLoading } = useSWR(`/trips/${resolvedParams.tripId}/cashflow`, fetcher)
  const { data: summaryData, isLoading: isSummaryLoading } = useSWR(`/trips/${resolvedParams.tripId}/cashflow/summary`, fetcher)
  const { data: tripData } = useSWR(`/trips/${resolvedParams.tripId}`, fetcher)
  
  const cashflow = {
    summary: summaryData || { totalIncome: 0, totalExpense: 0, netBalance: 0 },
    entries: Array.isArray(entriesData) ? entriesData : [],
    memberBreakdown: summaryData?.memberBreakdown || []
  }

  const isLoading = isEntriesLoading || isSummaryLoading

  // State
  const [selectedEntryId, setSelectedEntryId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<"ALL" | "INCOME" | "EXPENSE">("ALL")
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false)
  const printRef = React.useRef<HTMLDivElement>(null)

  const selectedEntry = React.useMemo(() => {
    return cashflow.entries.find((e: any) => e.id === selectedEntryId) || null
  }, [cashflow.entries, selectedEntryId])

  const filteredEntries = React.useMemo(() => {
    return cashflow.entries.filter((entry: any) => {
      if (filterType !== "ALL" && entry.type !== filterType) return false
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          entry.description?.toLowerCase().includes(query) ||
          entry.category?.toLowerCase().includes(query) ||
          entry.member?.name?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [cashflow.entries, searchQuery, filterType])

  const handleDelete = async (entryId: string) => {
    try {
      await api.delete(`/trips/${resolvedParams.tripId}/cashflow/${entryId}`)
      if (selectedEntryId === entryId) setSelectedEntryId(null)
      mutate(`/trips/${resolvedParams.tripId}/cashflow`)
      mutate(`/trips/${resolvedParams.tripId}/cashflow/summary`)
      mutate(`/trips/${resolvedParams.tripId}`)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDownloadPdf = React.useCallback(async () => {
    if (!printRef.current) return
    setIsGeneratingPdf(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")
      
      const element = printRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/jpeg", 0.95)
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      let position = 0
      const imgHeight = pdfHeight
      
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight)
      
      let heightLeft = imgHeight - pdf.internal.pageSize.getHeight()
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }
      
      const fileName = `Cashflow_Report_${tripData?.name || "TripSync"}.pdf`
      pdf.save(fileName.replace(/[^a-z0-9_.-]/gi, '_'))
    } catch (err) {
      console.error("PDF generation failed:", err)
    } finally {
      setIsGeneratingPdf(false)
    }
  }, [tripData?.name])

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading cashflow...</div>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Cashflow"
        breadcrumbs={[
          { label: "Trips", href: "/dashboard/trips" },
          { label: tripData?.name || "Trip", href: `/dashboard/trips/${resolvedParams.tripId}` },
          { label: "Cashflow" }
        ]}
        actions={
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || cashflow.entries.length === 0}
                className="h-9 gap-2 bg-background flex-1 sm:flex-none"
              >
                <ArrowDownRight className="h-4 w-4" />
                <span className="hidden sm:inline">{isGeneratingPdf ? "Generating..." : "Download PDF"}</span>
                <span className="sm:hidden">{isGeneratingPdf ? "..." : "PDF"}</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground border border-border/40 bg-muted/10">
                <Settings className="h-4 w-4" />
              </Button>
              <Dialog>
                <DialogTrigger className={cn(buttonVariants({ variant: "outline" }), "h-9 gap-2 flex-1 sm:flex-none")}>
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Member Summary</span>
                  <span className="sm:hidden">Members</span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Member Breakdown</DialogTitle>
                    <p className="text-sm text-muted-foreground">Who paid what for this trip.</p>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    {cashflow.memberBreakdown.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground py-4">No data available.</div>
                    ) : (
                      cashflow.memberBreakdown.map((member: any) => (
                      <div key={member.memberId} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{member.name}</span>
                            <span className="text-xs text-muted-foreground">Paid: {formatIDR(member.paid)}</span>
                          </div>
                        </div>
                        {member.spent > 0 && (
                          <div className="text-right flex flex-col">
                            <span className="text-xs text-muted-foreground">Spent</span>
                            <span className="text-sm font-medium text-destructive">{formatIDR(member.spent)}</span>
                          </div>
                        )}
                      </div>
                    )))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Quick search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 bg-muted/20 border-border/40 focus-visible:ring-1"
              />
            </div>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm mb-6 bg-border/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px]">
          
          <div className="bg-card p-5 flex flex-col justify-center hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-sm font-medium">Total Income</span>
              <Info className="h-3.5 w-3.5 opacity-50" />
            </div>
            <div className="text-xl sm:text-3xl font-medium tracking-tight text-foreground mt-2 mb-2">{formatIDR(cashflow.summary.totalIncome)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>vs total funds</span>
              <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Income
              </span>
            </div>
          </div>

          <div className="bg-card p-5 flex flex-col justify-center hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-sm font-medium">Total Expense</span>
              <Info className="h-3.5 w-3.5 opacity-50" />
            </div>
            <div className="text-xl sm:text-3xl font-medium tracking-tight text-foreground mt-2 mb-2">{formatIDR(cashflow.summary.totalExpense)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>vs total funds</span>
              <span className="inline-flex items-center rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
                <TrendingDown className="mr-1 h-3 w-3" />
                Expense
              </span>
            </div>
          </div>

          <div className="bg-card p-5 flex flex-col justify-center hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-sm font-medium">Current Balance</span>
              <Info className="h-3.5 w-3.5 opacity-50" />
            </div>
            <div className="text-xl sm:text-3xl font-medium tracking-tight text-foreground mt-2 mb-2">{formatIDR(cashflow.summary.netBalance)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>avail. balance</span>
              <span className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                <Activity className="mr-1 h-3 w-3" />
                Net
              </span>
            </div>
          </div>

          <div className="bg-card p-5 flex flex-col justify-center hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-sm font-medium">Transactions</span>
              <Info className="h-3.5 w-3.5 opacity-50" />
            </div>
            <div className="text-xl sm:text-3xl font-medium tracking-tight text-foreground mt-2 mb-2">{cashflow.summary.entryCount}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>recorded entries</span>
              <span className="inline-flex items-center rounded bg-muted-foreground/10 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                <ListOrdered className="mr-1 h-3 w-3" />
                Count
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        
        {/* Left Panel: Table */}
        <Card className="rounded-md shadow-sm border-border/50 flex flex-col overflow-hidden h-fit">
          <div className="flex flex-col gap-3 p-4 border-b border-border/50 bg-muted/10 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-lg">All Transactions</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "h-8 gap-2 bg-transparent border-border/50 text-xs font-normal")}>
                  <Filter className="h-3.5 w-3.5" />
                  {filterType === "ALL" ? "Filter" : filterType === "INCOME" ? "Income" : "Expense"}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterType("ALL")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("INCOME")}>Income</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("EXPENSE")}>Expense</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <AddCashflowDialog tripId={resolvedParams.tripId} type="INCOME" />
              <AddCashflowDialog tripId={resolvedParams.tripId} type="EXPENSE" />
            </div>
          </div>
          
          <div className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/30">
                  <TableHead className="text-xs font-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-right text-xs font-medium text-muted-foreground pr-4">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry: any) => {
                    const isSelected = selectedEntryId === entry.id
                    return (
                      <TableRow 
                        key={entry.id}
                        onClick={() => setSelectedEntryId(isSelected ? null : entry.id)}
                        className={`cursor-pointer transition-colors border-border/30 ${
                          isSelected 
                            ? "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary" 
                            : "hover:bg-muted/20 border-l-2 border-l-transparent"
                        }`}
                      >
                        <TableCell>
                          <div className="font-medium text-sm">
                            {entry.description}
                            {entry.type === "INCOME" && entry.member?.name && (
                              <span className="text-xs text-muted-foreground font-normal ml-2">
                                (paid by {entry.member.name})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 sm:hidden">
                            {new Date(entry.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            {" · "}
                            <span className={entry.type === "INCOME" ? "text-emerald-500" : "text-destructive"}>{entry.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                          {new Date(entry.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className={`font-normal text-[10px] uppercase tracking-wider ${
                            entry.type === "INCOME" 
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium text-sm pr-4 ${entry.type === "INCOME" ? "text-emerald-500" : "text-foreground"}`}>
                          {entry.type === "INCOME" ? "+" : "-"}{formatIDR(entry.amount)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          </div>
        </Card>

        {/* Right Panel: Transaction Details */}
        <div className="relative">
          {selectedEntry ? (
            <Card className="rounded-md shadow-md border-border/50 sticky top-4 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="font-medium text-sm">Transaction Detail</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted" onClick={() => setSelectedEntryId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-5 flex flex-col gap-6">
                {/* From / To */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">From</span>
                    <div className="flex items-center gap-2">
                      {selectedEntry.type === "INCOME" && selectedEntry.member ? (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {selectedEntry.member.name.substring(0,2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{selectedEntry.member.name}</span>
                        </>
                      ) : (
                        <>
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium">Trip Fund</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-muted-foreground">To</span>
                    <div className="flex items-center gap-2">
                      {selectedEntry.type === "EXPENSE" && selectedEntry.member ? (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {selectedEntry.member.name.substring(0,2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{selectedEntry.member.name}</span>
                        </>
                      ) : (
                        <>
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Wallet className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">Trip Fund</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 bg-muted/20 p-4 rounded-lg border border-border/30">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date
                    </span>
                    <span className="text-sm font-medium">
                      {new Date(selectedEntry.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Receipt className="h-3 w-3" /> Category
                    </span>
                    <span className="text-sm font-medium">{selectedEntry.category || "Uncategorized"}</span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Notes</span>
                    <span className="text-sm">{selectedEntry.notes || "—"}</span>
                  </div>
                </div>

                {/* Receipt View */}
                <div className="flex flex-col rounded-lg border border-border/50 overflow-hidden mt-2">
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-3 bg-muted/40 border-b border-border/50 text-xs font-medium text-muted-foreground">
                    <div>Description</div>
                    <div className="text-right">Amount</div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-4 p-3 border-b border-border/30 text-sm">
                    <div className="font-medium text-foreground">{selectedEntry.description}</div>
                    <div className="text-right font-medium">{formatIDR(selectedEntry.amount)}</div>
                  </div>
                  
                  <div className="p-3 bg-muted/10 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatIDR(selectedEntry.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium mt-1 pt-2 border-t border-border/30">
                      <span>Total Amount</span>
                      <span className={selectedEntry.type === "INCOME" ? "text-emerald-500" : "text-foreground"}>
                        {formatIDR(selectedEntry.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/50">
                  <AddCashflowDialog
                    tripId={resolvedParams.tripId}
                    type={selectedEntry.type}
                    editEntry={selectedEntry}
                    trigger={
                      <Button variant="outline" className="w-full justify-center">
                        Edit Transaction
                      </Button>
                    }
                  />
                  <ConfirmDeleteDialog 
                    onConfirm={() => handleDelete(selectedEntry.id)} 
                    trigger={
                      <Button variant="ghost" className="w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive">
                        Delete Transaction
                      </Button>
                    }
                  />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="rounded-md border-dashed border-2 border-border/60 bg-transparent hidden lg:flex flex-col items-center justify-center text-center p-8 h-[500px] sticky top-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No transaction selected</h3>
              <p className="text-sm text-muted-foreground">
                Click on a transaction from the list to view its complete details and receipt breakdown.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden print template */}
      <div className="absolute left-[-9999px] top-[-9999px] w-[210mm] overflow-hidden">
        <CashflowPrintTemplate 
          ref={printRef}
          trip={tripData}
          cashflow={cashflow}
        />
      </div>
    </div>
  )
}
