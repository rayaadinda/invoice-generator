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
import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddEquipmentItemDialog({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unit, setUnit] = useState("pcs")
  const [assignedToId, setAssignedToId] = useState<string>("none")
  
  const { mutate } = useSWRConfig()
  
  // We can fetch members so we can assign equipment
  const { data: trip } = useSWR(`/trips/${tripId}`, fetcher)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category.trim() || !quantity) return

    try {
      setIsLoading(true)
      await api.post(`/trips/${tripId}/equipment`, {
        name: name.trim(),
        category: category.trim(),
        quantity: Number(quantity),
        unit: unit.trim() || "pcs",
        assigneeIds: assignedToId === "none" ? undefined : [assignedToId],
        status: "BELUM"
      })
      
      mutate(`/trips/${tripId}/equipment`)
      mutate(`/trips/${tripId}`) // update stats
      
      setOpen(false)
      setName("")
      setCategory("")
      setQuantity("1")
      setUnit("pcs")
      setAssignedToId("none")
    } catch (error) {
      console.error("Failed to add equipment", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={<Button className="rounded-sm" />}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border/40 text-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Equipment</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new item to the equipment checklist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="category">Category (e.g., Camping, Cooking)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Navigation"
                className="bg-primary/5 border-border text-foreground"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Compass"
                className="bg-primary/5 border-border text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-primary/5 border-border text-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. pcs, sets, kg"
                  className="bg-primary/5 border-border text-foreground"
                />
              </div>
            </div>
            
            {trip?.members && trip.members.length > 0 && (
              <div className="grid gap-2">
                <Label>Assign To (Optional)</Label>
                <select 
                  value={assignedToId} 
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-primary/5 px-3 py-2 text-sm text-foreground"
                >
                  <option value="none" className="bg-background">Unassigned</option>
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
            <Button type="submit" disabled={!name.trim() || !category.trim() || !quantity || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
