"use client"

import * as React from "react"
import { CheckSquare, Plus, CheckCircle2, Circle, MoreHorizontal, ChevronDown, Check, Trash2, Edit, ListChecks, Kanban, List, Search, Filter, Box } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import useSWR, { mutate } from "swr"
import { fetcher, api } from "@/lib/api"
import { AddEquipmentItemDialog } from "@/components/trips/add-equipment-item-dialog"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

export default function EquipmentPage({ params }: { params: Promise<{ tripId: string }> }) {
  const resolvedParams = React.use(params)
  const { data, isLoading } = useSWR(`/trips/${resolvedParams.tripId}/equipment`, fetcher)
  const { data: tripData } = useSWR(`/trips/${resolvedParams.tripId}`, fetcher)
  
  const equipment = {
    stats: data?.stats || { total: 0, ready: 0, pending: 0 },
    grouped: data?.grouped || {}
  }
  const percentReady = Math.round((equipment.stats.ready / (equipment.stats.total || 1)) * 100) || 0

  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  const filteredGrouped = React.useMemo(() => {
    if (!equipment.grouped) return {}
    const result: Record<string, any[]> = {}
    
    Object.entries(equipment.grouped as Record<string, any[]>).forEach(([categoryName, items]) => {
      const filteredItems = items.filter((item) => {
        if (statusFilter !== "ALL" && item.status !== statusFilter) return false
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const nameMatch = item.name?.toLowerCase().includes(query)
          const notesMatch = item.notes?.toLowerCase().includes(query)
          const categoryMatch = categoryName.toLowerCase().includes(query)
          if (!nameMatch && !notesMatch && !categoryMatch) return false
        }
        
        return true
      })
      
      if (filteredItems.length > 0) {
        result[categoryName] = filteredItems
      }
    })
    
    return result
  }, [equipment.grouped, searchQuery, statusFilter])

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === "YA" ? "BELUM" : "YA"
    try {
      await api.patch(`/trips/${resolvedParams.tripId}/equipment/${item.id}`, {
        status: newStatus
      })
      mutate(`/trips/${resolvedParams.tripId}/equipment`)
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleAssignee = async (item: any, memberId: string) => {
    const currentAssigneeIds = item.assignees?.map((a: any) => a.id) || []
    let newAssigneeIds = []
    
    if (currentAssigneeIds.includes(memberId)) {
      newAssigneeIds = currentAssigneeIds.filter((id: string) => id !== memberId)
    } else {
      newAssigneeIds = [...currentAssigneeIds, memberId]
    }
    
    try {
      await api.patch(`/trips/${resolvedParams.tripId}/equipment/${item.id}`, {
        assigneeIds: newAssigneeIds
      })
      mutate(`/trips/${resolvedParams.tripId}/equipment`)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      await api.delete(`/trips/${resolvedParams.tripId}/equipment/${itemId}`)
      mutate(`/trips/${resolvedParams.tripId}/equipment`)
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading equipment...</div>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Equipment Checklist"
        breadcrumbs={[
          { label: "Trips", href: "/dashboard/trips" },
          { label: tripData?.name || "Trip", href: `/dashboard/trips/${resolvedParams.tripId}` },
          { label: "Equipment" }
        ]}
        actions={
          <div className="flex items-center gap-4">
            {tripData?.members && tripData.members.length > 0 && (
              <div className="flex -space-x-2 overflow-hidden">
                {tripData.members.slice(0, 4).map((member: any) => (
                  <Avatar key={member.id} className="inline-block h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted text-foreground">
                      {member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {tripData.members.length > 4 && (
                  <Avatar className="inline-block h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                      +{tripData.members.length - 4}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )}
            <Button variant="outline" className="h-9 gap-2 rounded-md bg-transparent">
              <Plus className="h-4 w-4" />
              Invite
            </Button>
          </div>
        }
      />

      {/* Craftboard Style Header - Bottom Row (Toolbar) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Button variant="ghost" className="h-9 gap-2 px-3 bg-muted/50 text-foreground rounded-md">
            <List className="h-4 w-4" />
            List
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full sm:w-[200px] pl-9 bg-transparent border-border/40 focus-visible:ring-1"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "h-9 gap-2 bg-transparent border-border/40 font-normal")}>
              <Filter className="h-4 w-4" />
              {statusFilter === "ALL" ? "All Status" : statusFilter === "YA" ? "Ready" : "Pending"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[140px]">
              <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("YA")}>Ready</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("BELUM")}>Pending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AddEquipmentItemDialog tripId={resolvedParams.tripId} />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-8">
        {Object.keys(filteredGrouped).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No equipment items found matching your filters.
          </div>
        ) : (
          Object.entries(filteredGrouped).map(([categoryName, items]) => (
          <details key={categoryName} open className="group">
            <summary className="flex items-center justify-between py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden border-b border-border/40 bg-background mb-4 transition-colors hover:bg-muted/10">
              <div className="flex items-center gap-3">
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-0 -rotate-90" />
                <div className="h-4 w-1 bg-primary/40 rounded-full" />
                <h2 className="font-semibold text-lg">{categoryName}</h2>
                <Badge variant="secondary" className="rounded-full h-5 px-2 min-w-6 flex items-center justify-center text-xs bg-muted/50 text-muted-foreground border-border/50">
                  {items.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Plus className="h-4 w-4" />
              </Button>
            </summary>
            
            <div className="pl-0 sm:pl-4 pr-1">
              <div className="overflow-x-auto">
              <Table className="border-none min-w-[700px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-12 h-10 text-xs font-medium text-muted-foreground"></TableHead>
                    <TableHead className="h-10 text-xs font-medium text-muted-foreground">Item Name</TableHead>
                    <TableHead className="h-10 text-xs font-medium text-muted-foreground">Notes</TableHead>
                    <TableHead className="w-24 h-10 text-xs font-medium text-muted-foreground">Qty</TableHead>
                    <TableHead className="w-48 h-10 text-xs font-medium text-muted-foreground">Assigned To</TableHead>
                    <TableHead className="w-12 h-10 text-xs font-medium text-muted-foreground"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <TableCell className="py-3">
                        <button 
                          onClick={() => handleToggleStatus(item)} 
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            item.status === "YA" ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-muted-foreground/50"
                          )}
                        >
                          {item.status === "YA" && <Check className="h-3 w-3" />}
                        </button>
                      </TableCell>
                      <TableCell className={cn("font-medium text-sm py-3", item.status === "YA" && "text-muted-foreground")}>
                        {item.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">
                        {item.notes}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="font-normal bg-muted/20 text-muted-foreground border-border/40">
                          {item.quantity} {item.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <Popover>
                          <PopoverTrigger className={cn(buttonVariants({ variant: "ghost" }), "w-[160px] h-8 justify-start p-1 hover:bg-muted/30 font-normal")}>
                            {item.assignees && item.assignees.length > 0 ? (
                              <div className="flex -space-x-2 overflow-hidden">
                                {item.assignees.slice(0, 3).map((assignee: any) => (
                                  <Avatar key={assignee.id} className="inline-block h-6 w-6 border-[1.5px] border-background">
                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                      {assignee.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {item.assignees.length > 3 && (
                                  <Avatar className="inline-block h-6 w-6 border-[1.5px] border-background">
                                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                      +{item.assignees.length - 3}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/60 text-sm">Unassigned</span>
                            )}
                          </PopoverTrigger>
                          <PopoverContent className="w-[220px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search member..." />
                              <CommandList>
                                <CommandEmpty>No members found.</CommandEmpty>
                                <CommandGroup>
                                  {tripData?.members?.map((member: any) => {
                                    const isSelected = item.assignees?.some((a: any) => a.id === member.id)
                                    return (
                                      <CommandItem
                                        key={member.id}
                                        onSelect={() => handleToggleAssignee(item, member.id)}
                                      >
                                        <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-[4px] border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                          <Check className="h-3 w-3" />
                                        </div>
                                        <Avatar className="mr-2 h-5 w-5">
                                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                            {member.name.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{member.name}</span>
                                      </CommandItem>
                                    )
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-muted-foreground hover:text-foreground")}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem className="text-muted-foreground">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          </details>
        )))}
      </div>
    </div>
  )
}
