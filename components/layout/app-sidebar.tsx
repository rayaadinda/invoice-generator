"use client"

import * as React from "react"
import {
  Map,
  CreditCard,
  CheckSquare,
  FileText,
  Settings,
  Mountain,
  Search,
  Home,
  CheckCircle,
  Calendar,
  Users,
  FolderOpen,
  ChevronDown,
  Plus,
  MoreVertical,
  LifeBuoy,
  Box,
  Briefcase
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuAction,
  SidebarInput,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const params = useParams()
  const tripId = params?.tripId as string

  const { data: trips } = useSWR("/trips", fetcher)

  // Essentials Section
  const essentials = [
    { title: "Home", url: "/dashboard", icon: Home, isActive: pathname === "/dashboard" },
    { title: "All Trips", url: "/dashboard/trips", icon: Map, isActive: pathname === "/dashboard/trips" },
    { title: "Tasks", url: "/dashboard/tasks", icon: CheckCircle, isActive: pathname === "/dashboard/tasks" },
    { title: "Calendar", url: "/dashboard/calendar", icon: Calendar, isActive: pathname === "/dashboard/calendar" },
    { title: "Members", url: "/dashboard/members", icon: Users, isActive: pathname === "/dashboard/members" },
  ]

  // Color palette for trip icons
  const colors = [
    "bg-emerald-500",
    "bg-orange-500",
    "bg-blue-500",
    "bg-pink-500",
    "bg-purple-500"
  ]

  return (
    <Sidebar {...props} className="border-r border-border/20">
      <SidebarHeader className="p-4 pb-2">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold text-lg text-foreground mb-4 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded text-primary-foreground">
            <img src="/logo-black.webp" alt="TripSync" className="dark:hidden" />
            <img src="/logo.webp" alt="TripSync" className="hidden dark:block" />
          </div>
          <span className="tracking-tight">Brekele</span>
        </Link>
        
        <div className="relative px-2">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
           <SidebarInput 
             placeholder="Search" 
             className="pl-8 bg-card/50 border-border/40 h-8 text-xs rounded-md w-full focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground"
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground bg-primary/5 px-1.5 rounded border border-border z-10 font-mono">⌘F</div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 scrollbar-hide">
        {/* Essentials Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground mb-1 px-2 h-auto">Essentials</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {essentials.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} />} isActive={item.isActive} className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-foreground transition-colors rounded-md">
                    <item.icon className="h-3.5 w-3.5 mr-1" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects (Trips) Group */}
        <SidebarGroup className="mt-2">
          <div className="flex items-center justify-between px-2 mb-1 group/label">
            <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground h-auto p-0 flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
              <ChevronDown className="h-3 w-3" />
              Active Trips
            </SidebarGroupLabel>
            <div className="flex items-center gap-1 opacity-0 group-hover/label:opacity-100 transition-opacity">
              <Link href="/dashboard/trips/new" className="text-muted-foreground hover:text-foreground p-0.5"><Plus className="h-3 w-3" /></Link>
              <button className="text-muted-foreground hover:text-foreground p-0.5"><MoreVertical className="h-3 w-3" /></button>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {trips?.slice(0, 5).map((trip: any, idx: number) => {
                const isActive = tripId === trip.id;
                const colorClass = colors[idx % colors.length];
                
                return (
                  <SidebarMenuItem key={trip.id}>
                    <SidebarMenuButton render={<Link href={`/dashboard/trips/${trip.id}`} />} isActive={isActive} className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-foreground transition-colors rounded-md">
                      <div className={`h-4 w-4 rounded-[4px] flex items-center justify-center mr-1 ${colorClass}`}>
                        <span className="text-[9px] font-semibold text-foreground">{trip.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="truncate">{trip.name}</span>
                    </SidebarMenuButton>
                    {isActive && (
                      <SidebarMenuAction render={<Link href={`/dashboard/trips/${trip.id}/settings`} />} className="text-foreground hover:bg-accent">
                         <MoreVertical className="h-3 w-3" />
                      </SidebarMenuAction>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Current Trip Context (If inside a trip) */}
        {tripId && (
          <SidebarGroup className="mt-2">
            <div className="flex items-center justify-between px-2 mb-1 group/label">
              <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground h-auto p-0 flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                <ChevronDown className="h-3 w-3" />
                Trip Management
              </SidebarGroupLabel>
              <div className="flex items-center gap-1 opacity-0 group-hover/label:opacity-100 transition-opacity">
                <button className="text-muted-foreground hover:text-foreground p-0.5"><Plus className="h-3 w-3" /></button>
                <button className="text-muted-foreground hover:text-foreground p-0.5"><MoreVertical className="h-3 w-3" /></button>
              </div>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  { title: "Budget & RAB", url: `/dashboard/trips/${tripId}/budget`, icon: Briefcase },
                  { title: "Equipment", url: `/dashboard/trips/${tripId}/equipment`, icon: CheckSquare },
                  { title: "Cashflow", url: `/dashboard/trips/${tripId}/cashflow`, icon: CreditCard },
                  { title: "Invoices", url: `/dashboard/trips/${tripId}/invoices`, icon: FileText },
                ].map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton render={<Link href={item.url} />} isActive={pathname.includes(item.url.split('/').pop()!)} className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-foreground transition-colors rounded-md">
                      <item.icon className="h-3.5 w-3.5 mr-1" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Support Group */}
        <SidebarGroup className="mt-auto">
          <div className="flex items-center justify-between px-2 mb-1 group/label">
            <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground h-auto p-0 flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
              <ChevronDown className="h-3 w-3" />
              Support
            </SidebarGroupLabel>
            <div className="flex items-center gap-1 opacity-0 group-hover/label:opacity-100 transition-opacity">
              <button className="text-muted-foreground hover:text-foreground p-0.5"><Plus className="h-3 w-3" /></button>
              <button className="text-muted-foreground hover:text-foreground p-0.5"><MoreVertical className="h-3 w-3" /></button>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/dashboard/settings" />} className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-md">
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/dashboard/releases" />} className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-md">
                  <LifeBuoy className="h-3.5 w-3.5 mr-1" />
                  <span>Help & Releases</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <ThemeToggle />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Apps Group */}
        <SidebarGroup className="mb-4">
          <div className="flex items-center justify-between px-2 mb-1 group/label">
            <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground h-auto p-0 flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
              <ChevronDown className="h-3 w-3" />
              Apps
            </SidebarGroupLabel>
            <div className="flex items-center gap-1 opacity-0 group-hover/label:opacity-100 transition-opacity">
              <button className="text-muted-foreground hover:text-foreground p-0.5"><Plus className="h-3 w-3" /></button>
              <button className="text-muted-foreground hover:text-foreground p-0.5"><MoreVertical className="h-3 w-3" /></button>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/dashboard/apps" />} className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-md">
                  <Box className="h-3.5 w-3.5 mr-1" />
                  <span>Integrations</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
