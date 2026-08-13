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

export function AddMemberDialog({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const { mutate } = useSWRConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setIsLoading(true)
      await api.post(`/trips/${tripId}/members`, {
        name: name.trim(),
        role: role.trim() || undefined,
      })
      
      // Refresh the trip data
      mutate(`/trips/${tripId}`)
      
      setOpen(false)
      setName("")
      setRole("")
    } catch (error) {
      console.error("Failed to add member", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={<Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs px-3" />}
      >
        Add Member
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border/40 text-foreground">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Trip Member</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new friend to this trip to start sharing costs and assigning equipment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Budi Santoso"
                className="bg-primary/5 border-border text-foreground"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role (Optional)</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Driver, Photographer"
                className="bg-primary/5 border-border text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
