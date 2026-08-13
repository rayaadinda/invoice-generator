"use client"

import { PlusCircle, Search, Calendar, MapPin, Map, ArrowRight, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/ui/page-header"
import Link from "next/link"
import useSWR from "swr"
import { fetcher } from "@/lib/api"

export default function TripsListPage() {
  const { data: trips, error, isLoading } = useSWR("/trips", fetcher)

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      <PageHeader 
        title="All Trips"
        breadcrumbs={[{ label: "Trips" }]}
        description="Manage your group trips and adventures."
        actions={
          <>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search trips..."
                className="pl-9 h-9 rounded-full bg-card/50 border-border/40 text-sm focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Link href="/dashboard/trips/new" className={cn(buttonVariants({ variant: "default" }), "rounded-full h-9 px-4 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto text-center")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Trip
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
           Array(3).fill(0).map((_, i) => (
             <Skeleton key={i} className="h-[220px] rounded-xl bg-card/20" />
           ))
        ) : trips?.length === 0 ? (
          <Card className="col-span-full border-dashed shadow-none border-border/40 bg-transparent flex flex-col items-center justify-center p-12 text-center rounded-xl min-h-[300px]">
            <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No trips found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-6">
              You haven't created any trips yet. Get started by creating your first group adventure!
            </p>
            <Link href="/dashboard/trips/new" className={cn(buttonVariants({ variant: "default" }), "rounded-full bg-primary text-primary-foreground hover:bg-primary/90")}>
              Create Trip
            </Link>
          </Card>
        ) : (
          trips?.map((trip: any) => (
            <Card key={trip.id} className="rounded-xl shadow-none border-border/40 bg-card/40 backdrop-blur-sm transition-all hover:bg-card/80 flex flex-col justify-between group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
                    <Map className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="rounded-full bg-primary/5 border-border/40 text-xs font-normal">
                    {trip.type}
                  </Badge>
                </div>
                <CardTitle className="text-base font-medium text-foreground mb-1">{trip.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-3">
                  {trip.destination} • {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2">
                   <div className="flex gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3"/> {trip._count?.members || 0}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24))} days</span>
                   </div>
                   <Link href={`/dashboard/trips/${trip.id}`} className={cn(buttonVariants({ size: "icon", variant: "ghost" }), "h-8 w-8 rounded-full bg-primary/5 text-foreground hover:bg-primary/20 border-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center")}>
                     <ArrowRight className="h-4 w-4" />
                   </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
