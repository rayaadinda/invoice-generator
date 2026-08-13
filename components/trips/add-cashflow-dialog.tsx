"use client"

import * as React from "react"
import { useState } from "react"
import { useSWRConfig } from "swr"
import { api, fetcher } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import useSWR from "swr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function AddCashflowDialog({ tripId, type, editEntry, trigger }: { tripId: string, type: "INCOME" | "EXPENSE", editEntry?: any, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState(editEntry ? editEntry.amount.toString() : "")
  const [description, setDescription] = useState(editEntry ? editEntry.description : "")
  const [category, setCategory] = useState(editEntry?.category ? editEntry.category : "")
  const [date, setDate] = useState(editEntry ? new Date(editEntry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [memberId, setMemberId] = useState<string>(editEntry?.memberId ? editEntry.memberId : "none")
  
  const { mutate } = useSWRConfig()
  const { data: trip } = useSWR(`/trips/${tripId}`, fetcher)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description.trim() || !date) return

    try {
      setIsLoading(true)
      const payload = {
        type,
        amount: Number(amount),
        description: description.trim(),
        category: category.trim() || undefined,
        date: new Date(date).toISOString(),
        memberId: memberId === "none" ? undefined : memberId
      }

      if (editEntry) {
        await api.patch(`/trips/${tripId}/cashflow/${editEntry.id}`, payload)
      } else {
        await api.post(`/trips/${tripId}/cashflow`, payload)
      }
      
      mutate(`/trips/${tripId}/cashflow`)
      mutate(`/trips/${tripId}/cashflow/summary`)
      mutate(`/trips/${tripId}`) // update summary stats
      
      setOpen(false)
      if (!editEntry) {
        setAmount("")
        setDescription("")
        setCategory("")
        setDate(new Date().toISOString().split('T')[0])
        setMemberId("none")
      }
    } catch (error) {
      console.error("Failed to add cashflow entry", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isIncome = type === "INCOME"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as any} />
      ) : (
        <DialogTrigger render={<Button variant="outline" />}>
          <Plus className="mr-2 h-4 w-4" /> Add {isIncome ? "Income" : "Expense"}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] bg-background border-border/40 text-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editEntry ? "Edit" : "Add"} {isIncome ? "Income" : "Expense"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editEntry ? "Update the details of this transaction." : `Record a new ${isIncome ? "cash inflow" : "expense"} for this trip.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (Rp)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500000"
                className="bg-primary/5 border-border text-foreground"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isIncome ? "e.g. Initial Deposit" : "e.g. Gas Station"}
                className="bg-primary/5 border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Transport"
                  className="bg-primary/5 border-border text-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-primary/5 border-border text-foreground"
                />
              </div>
            </div>
            {trip?.members && trip.members.length > 0 && (
              <div className="grid gap-2">
                <Label>{isIncome ? "Paid By (Optional)" : "Paid To / For (Optional)"}</Label>
                <select 
                  value={memberId} 
                  onChange={(e) => setMemberId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-primary/5 px-3 py-2 text-sm text-foreground"
                >
                  <option value="none" className="bg-background">None</option>
                  {trip.members.map((member: any) => (
                    <option key={member.id} value={member.id} className="bg-background">
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={!amount || !description.trim() || !date || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
