"use client"

import * as React from "react"
import { useState } from "react"
import { useSWRConfig } from "swr"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function AddBudgetItemDialog({ tripId, categoryId }: { tripId: string, categoryId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [estimated, setEstimated] = useState("")
  const [actual, setActual] = useState("")
  const [splitType, setSplitType] = useState<"SHARED" | "PER_PERSON">("SHARED")
  const { mutate } = useSWRConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !estimated) return

    try {
      setIsLoading(true)
      await api.post(`/trips/${tripId}/budget/items`, {
        name: name.trim(),
        estimated: Number(estimated),
        actual: actual ? Number(actual) : undefined,
        categoryId,
        splitType
      })
      
      mutate(`/trips/${tripId}/budget`)
      mutate(`/trips/${tripId}/budget/summary`)
      mutate(`/trips/${tripId}`) // update summary counts
      
      setOpen(false)
      setName("")
      setEstimated("")
      setActual("")
      setSplitType("SHARED")
    } catch (error) {
      console.error("Failed to add item", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={<Button variant="outline" size="sm" className="w-full rounded-sm border-dashed" />}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Item
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border/40 text-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Budget Item</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new expense item to this category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bus Tickets"
                className="bg-primary/5 border-border text-foreground"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimated">Estimated Cost (Rp)</Label>
              <Input
                id="estimated"
                type="number"
                min="0"
                value={estimated}
                onChange={(e) => setEstimated(e.target.value)}
                placeholder="e.g. 150000"
                className="bg-primary/5 border-border text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="actual">Actual Cost (Optional)</Label>
              <Input
                id="actual"
                type="number"
                min="0"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                placeholder="e.g. 145000"
                className="bg-primary/5 border-border text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <Label>Expense Type</Label>
              <RadioGroup value={splitType} onValueChange={(v: "SHARED" | "PER_PERSON") => setSplitType(v)} className="flex flex-col gap-2 mt-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SHARED" id="type-shared" />
                  <Label htmlFor="type-shared" className="font-normal">Shared Group Expense <span className="text-muted-foreground text-xs">(divided by all members)</span></Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PER_PERSON" id="type-per-person" />
                  <Label htmlFor="type-per-person" className="font-normal">Per Person Expense <span className="text-muted-foreground text-xs">(multiplied by member count)</span></Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !estimated || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
