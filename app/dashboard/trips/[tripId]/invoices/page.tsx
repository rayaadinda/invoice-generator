"use client"

import * as React from "react"
import { Plus, FileText, Download, Copy, Trash2, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"

import useSWR, { useSWRConfig } from "swr"
import { fetcher, api } from "@/lib/api"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>
    case "PARTIALLY_PAID":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Partial</Badge>
    case "SENT":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>
    case "DRAFT":
    default:
      return <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20">Draft</Badge>
  }
}

export default function InvoicesListPage({ params }: { params: Promise<{ tripId: string }> }) {
  const resolvedParams = React.use(params)
  const { data: tripData } = useSWR(`/trips/${resolvedParams.tripId}`, fetcher)
  const { data: invoices, isLoading } = useSWR(`/trips/${resolvedParams.tripId}/invoices`, fetcher)
  const { mutate } = useSWRConfig()
  const [isGenerating, setIsGenerating] = React.useState(false)

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      await api.post(`/trips/${resolvedParams.tripId}/invoices/generate-from-budget`)
      mutate(`/trips/${resolvedParams.tripId}/invoices`)
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/trips/${resolvedParams.tripId}/invoices/${id}`)
      mutate(`/trips/${resolvedParams.tripId}/invoices`)
    } catch (e) {
      console.error(e)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading invoices...</div>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Invoices"
        breadcrumbs={[
          { label: "Trips", href: "/dashboard/trips" },
          { label: tripData?.name || "Trip", href: `/dashboard/trips/${resolvedParams.tripId}` },
          { label: "Invoices" }
        ]}
        description="Manage and generate invoices for your trip."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate from Budget"}
            </Button>
            <Link href={`/dashboard/trips/${resolvedParams.tripId}/invoices/new`} className={buttonVariants()}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </div>
        }
      />

      <Card className="rounded-sm shadow-sm border-muted">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!invoices || invoices.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/trips/${resolvedParams.tripId}/invoices/${invoice.id}`} className="hover:underline text-primary">
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatIDR(invoice.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm text-muted-foreground hover:text-primary">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm text-muted-foreground hover:text-primary">
                        <Download className="h-4 w-4" />
                      </Button>
                      <ConfirmDeleteDialog onConfirm={() => handleDelete(invoice.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
