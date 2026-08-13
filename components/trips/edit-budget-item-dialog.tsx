"use client"

import * as React from "react"
import { useState } from "react"
import { useSWRConfig } from "swr"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export function EditBudgetItemDialog({ tripId, item, open, onOpenChange }: { tripId: string, item: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(item.name)
  const [estimated, setEstimated] = useState(item.estimated?.toString() || "")
  const [actual, setActual] = useState(item.actual?.toString() || "")
  const [splitType, setSplitType] = useState<"SHARED" | "PER_PERSON">(item.splitType || "SHARED")
  const { mutate } = useSWRConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !estimated) return

    try {
      setIsLoading(true)
      await api.patch(`/trips/${tripId}/budget/items/${item.id}`, {
        name: name.trim(),
        estimated: Number(estimated),
        actual: actual ? Number(actual) : undefined,
        splitType
      })
      
      mutate(`/trips/${tripId}/budget`)
      mutate(`/trips/${tripId}/budget/summary`)
      mutate(`/trips/${tripId}`) // update summary counts
      
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to edit item", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border/40 text-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Budget Item</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the details of this budget item.
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !estimated || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
