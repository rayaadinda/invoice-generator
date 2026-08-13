import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-background">
        <div className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:hidden">
          <SidebarTrigger />
          <div className="font-semibold">Brekele</div>
        </div>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
