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

export function AddBudgetCategoryDialog({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const { mutate } = useSWRConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setIsLoading(true)
      await api.post(`/trips/${tripId}/budget/categories`, {
        name: name.trim(),
      })
      
      mutate(`/trips/${tripId}/budget`)
      mutate(`/trips/${tripId}/budget/summary`)
      mutate(`/trips/${tripId}`) // update summary counts
      
      setOpen(false)
      setName("")
    } catch (error) {
      console.error("Failed to add category", error)
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
        Add Category
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border/40 text-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new category to group your expenses (e.g., Transportation, Accommodation).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Transportation"
                className="bg-primary/5 border-border text-foreground"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
