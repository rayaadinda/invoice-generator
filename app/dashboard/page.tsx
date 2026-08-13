"use client"

import { Map, Users, CreditCard, ArrowUpRight, FolderOpen, MoreHorizontal, Link2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { data: trips, error, isLoading } = useSWR("/trips", fetcher)

  const activeTripsCount = trips?.length || 0
  const totalMembers = trips?.reduce((acc: number, trip: any) => acc + (trip._count?.members || 0), 0) || 0
  const pendingInvoices = trips?.reduce((acc: number, trip: any) => acc + (trip._count?.invoices || 0), 0) || 0

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground">Brekele Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back! Manage your group trips and financials from a central command.</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
             <h2 className="text-lg sm:text-xl font-medium tracking-tight">Active Trips</h2>
             <div className="flex gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
               <span className="flex items-center gap-1"><Map className="h-3 w-3"/> {activeTripsCount} Trips</span>
               <span className="flex items-center gap-1"><Users className="h-3 w-3"/> {totalMembers} Members</span>
               <span className="flex items-center gap-1"><CreditCard className="h-3 w-3"/> {pendingInvoices} Invoices</span>
             </div>
          </div>
          <Link href="/dashboard/trips/new" className={cn(buttonVariants({ variant: "outline" }), "rounded-full h-8 px-4 text-xs bg-transparent border-border/50 text-muted-foreground hover:text-foreground w-full sm:w-auto text-center")}>
            Create New Trip
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
             Array(2).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-[220px] rounded-xl bg-card/20" />
             ))
          ) : trips?.slice(0, 5).map((trip: any) => (
            <Card key={trip.id} className="rounded-xl shadow-none border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:bg-card/80 flex flex-col justify-between group">
              <CardHeader className="pb-4">
                <div className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mb-3">
                  <Map className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-medium text-foreground mb-1">{trip.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-3">
                  {trip.destination} • {new Date(trip.startDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/trips/${trip.id}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-7 px-3 text-[11px] rounded-lg bg-primary/10 text-foreground hover:bg-primary/20 border-transparent w-fit")}>
                  Open Trip
                </Link>
              </CardContent>
            </Card>
          ))}
          
          <Card className="rounded-xl shadow-none border-border/40 border-dashed bg-transparent hover:bg-card/20 transition-all flex flex-col items-center justify-center text-center p-6 h-full min-h-[220px]">
             <Link href="/dashboard/trips/new" className={cn(buttonVariants({ variant: "ghost" }), "h-12 w-12 rounded-full bg-primary/5 hover:bg-primary/10 text-foreground mb-3 p-0 flex items-center justify-center")}>
               <ArrowUpRight className="h-5 w-5" />
             </Link>
             <h3 className="text-sm font-medium text-foreground mb-1">Plan a New Adventure</h3>
             <p className="text-xs text-muted-foreground max-w-[180px]">Start drafting RAB and invite your friends</p>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-medium tracking-tight">Quick Access Modules</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {['Budget & RAB', 'Equipment', 'Cashflow', 'Invoices', 'Members', 'Settings'].map((mod) => (
             <div key={mod} className="flex flex-col items-center gap-3">
                <div className="h-16 w-full rounded-xl bg-card/30 border border-border/30 flex items-center justify-center hover:bg-card/60 transition-colors cursor-pointer group">
                  <FolderOpen className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{mod}</span>
             </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 rounded-xl shadow-none border-border/40 bg-card/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-foreground">Financial Overview (All Trips)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for chart */}
            <div className="h-48 w-full border-b border-border/20 flex items-end gap-2 pb-4 pt-8">
               {[40, 70, 45, 90, 65, 85, 120, 50, 80, 100].map((h, i) => (
                 <div key={i} className="flex-1 bg-primary/10 hover:bg-primary/20 transition-colors rounded-t-sm relative group" style={{ height: `${h}%` }}>
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                     Rp {h}k
                   </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-none border-border/40 bg-card/20 flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-foreground">Pending Action Items</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
             <div className="flex items-start justify-between border-b border-border/20 pb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-foreground">Unpaid Invoices</span>
                  <span className="text-[10px] text-muted-foreground">3 invoices awaiting payment</span>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md"><MoreHorizontal className="h-3 w-3" /></Button>
             </div>
             <div className="flex items-start justify-between border-b border-border/20 pb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-foreground">Missing Equipment</span>
                  <span className="text-[10px] text-muted-foreground">2 items unassigned in Gn. Gede</span>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md"><MoreHorizontal className="h-3 w-3" /></Button>
             </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
