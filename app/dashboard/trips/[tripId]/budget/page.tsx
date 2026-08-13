"use client"

import * as React from "react"
import { Plus, Trash2, Edit2, TrendingDown, TrendingUp, Users, Target, Activity, Calculator, Info, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import useSWR, { mutate } from "swr"
import { fetcher, api } from "@/lib/api"
import { AddBudgetCategoryDialog } from "@/components/trips/add-budget-category-dialog"
import { AddBudgetItemDialog } from "@/components/trips/add-budget-item-dialog"
import { EditBudgetItemDialog } from "@/components/trips/edit-budget-item-dialog"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const resolvedParams = React.use(params)
  const { data: tripData } = useSWR(`/trips/${resolvedParams.tripId}`, fetcher)
  const { data: categories = [], isLoading: isCategoriesLoading } = useSWR(`/trips/${resolvedParams.tripId}/budget`, fetcher)
  const { data: summaryData, isLoading: isSummaryLoading } = useSWR(`/trips/${resolvedParams.tripId}/budget/summary`, fetcher)
  
  const budget = {
    summary: summaryData || { totalEstimated: 0, totalActual: 0, totalDifference: 0, memberCount: 0, perPerson: 0 },
    categories: Array.isArray(categories) ? categories : []
  }

  const isLoading = isCategoriesLoading || isSummaryLoading

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await api.delete(`/trips/${resolvedParams.tripId}/budget/categories/${categoryId}`)
      mutate(`/trips/${resolvedParams.tripId}/budget`)
      mutate(`/trips/${resolvedParams.tripId}/budget/summary`)
      mutate(`/trips/${resolvedParams.tripId}`)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteItem = async (categoryId: string, itemId: string) => {
    try {
      await api.delete(`/trips/${resolvedParams.tripId}/budget/items/${itemId}`)
      mutate(`/trips/${resolvedParams.tripId}/budget`)
      mutate(`/trips/${resolvedParams.tripId}/budget/summary`)
      mutate(`/trips/${resolvedParams.tripId}`)
    } catch (e) {
      console.error(e)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading budget...</div>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Budget & RAB"
        breadcrumbs={[
          { label: "Trips", href: "/dashboard/trips" },
          { label: tripData?.name || "Trip", href: `/dashboard/trips/${resolvedParams.tripId}` },
          { label: "Budget" }
        ]}
        description="Plan and track estimated versus actual costs."
        actions={<AddBudgetCategoryDialog tripId={resolvedParams.tripId} />}
      />

      {/* Summary Cards */}
      <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm mb-6 bg-border/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px]">
          
          <div className="bg-card p-5 flex flex-col justify-center hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-sm font-medium">Total Estimated</span>
              <Info className="h-3.5 w-3.5 opacity-50" />
            </div>
            <div className="text-xl sm:text-3xl font-medium tracking-tight text-foreground mt-2 mb-2">{formatIDR(budget.summary.totalEstimated)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>projected cost</span>
              <span className="inline-flex items-center rounded bg-muted-foreground/10 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Calculator className="mr-1 h-3 w-3" />
                Planned
              </span>
            </div>
          </div>

          <div className="bg-card p-5 flex flex-col justify-center hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-sm font-medium">Total Actual</span>
              <Info className="h-3.5 w-3.5 opacity-50" />
            </div>
            <div className="text-xl sm:text-3xl font-medium tracking-tight text-foreground mt-2 mb-2">{formatIDR(budget.summary.totalActual)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>realized cost</span>
              <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600">
                <Activity className="mr-1 h-3 w-3" />
                Spent
              </span>
            </div>
          </div>

          <div className="bg-card p-5 flex flex-col justify-center hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-sm font-medium">Remaining / Diff</span>
              <Info className="h-3.5 w-3.5 opacity-50" />
            </div>
            <div className="text-xl sm:text-3xl font-medium tracking-tight text-foreground mt-2 mb-2">
              {budget.summary.totalDifference > 0 ? "+" : ""}{formatIDR(budget.summary.totalDifference)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>vs estimated</span>
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${
                budget.summary.totalDifference >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
              }`}>
                {budget.summary.totalDifference >= 0 ? (
                  <TrendingDown className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingUp className="mr-1 h-3 w-3" />
                )}
                {budget.summary.totalDifference >= 0 ? "Under" : "Over"}
              </span>
            </div>
          </div>

          <div className="bg-card p-5 flex flex-col justify-center hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-sm font-medium">Est. Per Person</span>
              <Info className="h-3.5 w-3.5 opacity-50" />
            </div>
            <div className="text-xl sm:text-3xl font-medium tracking-tight text-foreground mt-2 mb-2">{formatIDR(budget.summary.perPerson)}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>share amount</span>
              <span className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                <Users className="mr-1 h-3 w-3" />
                {budget.summary.memberCount} Mbrs
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-6">
        {budget.categories.map((category: any) => {
          const catEst = category.items?.reduce((sum: number, item: any) => sum + Number(item.estimated || 0), 0) || 0
          const catAct = category.items?.reduce((sum: number, item: any) => sum + Number(item.actual || 0), 0) || 0
          const catDiff = catEst - catAct

          return (
            <Card key={category.id} className="rounded-sm shadow-sm border-muted">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <ConfirmDeleteDialog onConfirm={() => handleDeleteCategory(category.id)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right sm:w-40">Estimated <span className="sm:hidden text-muted-foreground text-[10px] font-normal block">/ Actual / Diff</span></TableHead>
                      <TableHead className="text-right w-40 hidden sm:table-cell">Actual</TableHead>
                      <TableHead className="text-right w-40 hidden sm:table-cell">Difference</TableHead>
                      <TableHead className="w-12 sm:w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.items?.map((item: any) => {
                      const isPerPerson = item.splitType === 'PER_PERSON';
                      const itemTotalEst = isPerPerson ? Number(item.estimated) * budget.summary.memberCount : Number(item.estimated);
                      const itemTotalAct = isPerPerson ? Number(item.actual) * budget.summary.memberCount : Number(item.actual);
                      
                      return (
                      <BudgetItemRow 
                        key={item.id} 
                        item={item} 
                        categoryId={category.id} 
                        tripId={resolvedParams.tripId} 
                        memberCount={budget.summary.memberCount}
                        itemTotalEst={itemTotalEst}
                        itemTotalAct={itemTotalAct}
                        onDelete={() => handleDeleteItem(category.id, item.id)}
                      />
                    )})}
                    {/* Category Totals */}
                    <TableRow className="bg-muted/30 hover:bg-muted/30 font-semibold">
                      <TableCell>Subtotal</TableCell>
                      <TableCell className="text-right">
                        <div>{formatIDR(catEst)}</div>
                        <div className="sm:hidden text-xs text-muted-foreground font-normal mt-1 flex flex-col gap-0.5">
                          <span>Act: {formatIDR(catAct)}</span>
                          <span className={`${catDiff >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                            Diff: {catDiff > 0 && "+"}{formatIDR(catDiff)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{formatIDR(catAct)}</TableCell>
                      <TableCell className={`text-right hidden sm:table-cell ${catDiff >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {catDiff > 0 && "+"}
                        {formatIDR(catDiff)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </div>
                
                <div className="p-3 bg-muted/10 border-t">
                  <AddBudgetItemDialog tripId={resolvedParams.tripId} categoryId={category.id} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function BudgetItemRow({ item, categoryId, tripId, memberCount, itemTotalEst, itemTotalAct, onDelete }: any) {
  const [editOpen, setEditOpen] = React.useState(false);
  const isPerPerson = item.splitType === 'PER_PERSON';

  return (
    <TableRow>
      <TableCell className="font-medium">
        {item.name}
        {isPerPerson && (
          <span className="ml-2 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            Per Person
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end">
          {isPerPerson ? (
            <div className="flex flex-col items-end">
              <span>{formatIDR(itemTotalEst)}</span>
              <span className="text-xs text-muted-foreground">{formatIDR(item.estimated)} / pax</span>
            </div>
          ) : (
            <span>{formatIDR(item.estimated)}</span>
          )}
          <div className="sm:hidden text-xs text-muted-foreground mt-2 flex flex-col items-end gap-0.5">
            <span className="font-normal text-muted-foreground">Act: {formatIDR(itemTotalAct)}</span>
            <span className={`font-medium ${itemTotalEst - itemTotalAct >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              Diff: {itemTotalEst - itemTotalAct > 0 && "+"}{formatIDR(itemTotalEst - itemTotalAct)}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right hidden sm:table-cell">
        {isPerPerson ? (
          <div className="flex flex-col items-end">
            <span>{formatIDR(itemTotalAct)}</span>
            <span className="text-xs text-muted-foreground">{formatIDR(item.actual)} / pax</span>
          </div>
        ) : (
          formatIDR(item.actual)
        )}
      </TableCell>
      <TableCell className={`text-right font-medium hidden sm:table-cell ${itemTotalEst - itemTotalAct >= 0 ? "text-emerald-600" : "text-destructive"}`}>
        {itemTotalEst - itemTotalAct > 0 && "+"}
        {formatIDR(itemTotalEst - itemTotalAct)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit Item</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete()}>
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <EditBudgetItemDialog tripId={tripId} item={item} open={editOpen} onOpenChange={setEditOpen} />
      </TableCell>
    </TableRow>
  );
}
