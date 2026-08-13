"use client"

import { Mountain, Users, Calendar, MapPin, Edit, ArrowRight, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/api"
import * as React from "react"
import { useParams } from "next/navigation"
import { AddMemberDialog } from "@/components/trips/add-member-dialog"

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const resolvedParams = React.use(params)
  const tripId = resolvedParams.tripId as string

  const { data: trip, error, isLoading } = useSWR(`/trips/${tripId}`, fetcher)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-10">
        <Skeleton className="h-32 w-full rounded-xl bg-card/20" />
        <div className="grid gap-4 md:grid-cols-4">
           {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl bg-card/20" />)}
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return <div className="text-foreground text-center py-20">Trip not found</div>
  }

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between bg-card/20 border border-border/40 p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className="rounded-full bg-primary/5 border-border/40 font-normal">
              {trip.type}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">{trip.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/trips/${tripId}/edit`} className={cn(buttonVariants({ variant: "outline" }), "rounded-full h-9 px-4 text-xs font-medium bg-transparent border-border/40 text-foreground hover:bg-primary/10 relative z-10")}>
          <Edit className="mr-2 h-3 w-3" />
          Edit Trip
        </Link>
      </div>

      {/* Quick Access Modules */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl shadow-none border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:bg-card/80 group">
          <Link href={`/dashboard/trips/${tripId}/budget`} className="block p-5 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-base font-medium text-foreground">Budget & RAB</CardTitle>
              <div className="h-8 w-8 bg-primary/5 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors"><ArrowRight className="h-4 w-4 text-foreground" /></div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground mb-1">Rp 0</div>
              <p className="text-xs text-muted-foreground">Plan expenses and share cost</p>
            </div>
          </Link>
        </Card>

        <Card className="rounded-xl shadow-none border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:bg-card/80 group">
          <Link href={`/dashboard/trips/${tripId}/equipment`} className="block p-5 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-base font-medium text-foreground">Equipment</CardTitle>
              <div className="h-8 w-8 bg-primary/5 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors"><ArrowRight className="h-4 w-4 text-foreground" /></div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground mb-1">{trip._count?.equipmentItems || 0} items</div>
              <p className="text-xs text-muted-foreground">Checklist and gear assignment</p>
            </div>
          </Link>
        </Card>

        <Card className="rounded-xl shadow-none border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:bg-card/80 group">
          <Link href={`/dashboard/trips/${tripId}/cashflow`} className="block p-5 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-base font-medium text-foreground">Cashflow</CardTitle>
              <div className="h-8 w-8 bg-primary/5 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors"><ArrowRight className="h-4 w-4 text-foreground" /></div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-emerald-500 mb-1">Rp 0</div>
              <p className="text-xs text-muted-foreground">Track payments & expenses</p>
            </div>
          </Link>
        </Card>

        <Card className="rounded-xl shadow-none border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:bg-card/80 group">
          <Link href={`/dashboard/trips/${tripId}/invoices`} className="block p-5 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-base font-medium text-foreground">Invoices</CardTitle>
              <div className="h-8 w-8 bg-primary/5 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors"><ArrowRight className="h-4 w-4 text-foreground" /></div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground mb-1">{trip._count?.invoices || 0} invoices</div>
              <p className="text-xs text-muted-foreground">Generate bills for members</p>
            </div>
          </Link>
        </Card>
      </div>

      {/* Members Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 rounded-xl shadow-none border-border/40 bg-card/20">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20">
            <div>
              <CardTitle className="text-sm font-medium text-foreground">Trip Members</CardTitle>
            </div>
            <AddMemberDialog tripId={tripId} />
          </CardHeader>
          <CardContent className="pt-6">
            {trip.members?.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trip.members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-border/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-foreground text-sm">
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm text-foreground font-medium">{m.name}</span>
                         <span className="text-xs text-muted-foreground">{m.role || 'Member'}</span>
                      </div>
                    </div>
                  ))}
               </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <span className="text-sm text-foreground font-medium">No members added yet</span>
                <span className="text-xs text-muted-foreground max-w-[200px] mt-1">Add friends to start assigning costs and equipment</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1 rounded-xl shadow-none border-border/40 bg-card/20">
          <CardHeader className="border-b border-border/20 pb-4">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2"><Activity className="h-4 w-4"/> Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-foreground">Trip created</span>
                 <span className="text-[10px] text-muted-foreground">{new Date(trip.createdAt).toLocaleString()}</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
