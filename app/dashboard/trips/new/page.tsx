"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { mutate } from "swr"

export default function CreateTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "HIKING",
    destination: "",
    startDate: "",
    endDate: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post("/trips", formData)
      mutate("/trips") // revalidate cache
      router.push(`/dashboard/trips/${res.data.id}`)
    } catch (error) {
      console.error(error)
      alert("Failed to create trip")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto pb-10 w-full">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full h-10 w-10 bg-primary/5 hover:bg-primary/10 text-foreground flex items-center justify-center")}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl sm:text-3xl font-semibold tracking-tight text-foreground">Plan a New Adventure</h1>
      </div>

      <Card className="rounded-xl shadow-none border-border/40 bg-card/20 backdrop-blur-sm">
        <CardHeader className="pb-6 border-b border-border/20">
          <CardTitle className="text-xl font-medium text-foreground">Trip Details</CardTitle>
          <CardDescription>Enter the basic information for your group trip.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">Trip Name</label>
              <Input 
                required 
                placeholder="e.g. Gunung Gede Pangrango" 
                className="bg-primary/5 border-border/40 rounded-xl h-12 text-foreground"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="flex flex-col gap-3">
                 <label className="text-sm font-medium text-foreground">Type</label>
                 <select 
                   className="bg-primary/5 border border-border/40 rounded-xl h-12 text-foreground px-3 outline-none focus:ring-1 focus:ring-ring"
                   value={formData.type}
                   onChange={e => setFormData({...formData, type: e.target.value})}
                 >
                   <option value="HIKING" className="bg-background">Hiking</option>
                   <option value="CAMPING" className="bg-background">Camping</option>
                   <option value="ROAD_TRIP" className="bg-background">Road Trip</option>
                   <option value="VACATION" className="bg-background">Vacation</option>
                   <option value="OTHER" className="bg-background">Other</option>
                 </select>
               </div>
               <div className="flex flex-col gap-3">
                 <label className="text-sm font-medium text-foreground">Destination</label>
                 <Input 
                   required 
                   placeholder="e.g. Cibodas" 
                   className="bg-primary/5 border-border/40 rounded-xl h-12 text-foreground"
                   value={formData.destination}
                   onChange={e => setFormData({...formData, destination: e.target.value})}
                 />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="flex flex-col gap-3">
                 <label className="text-sm font-medium text-foreground">Start Date</label>
                 <Input 
                   type="date" 
                   required 
                   className="bg-primary/5 border-border/40 rounded-xl h-12 text-foreground"
                   value={formData.startDate}
                   onChange={e => setFormData({...formData, startDate: e.target.value})}
                 />
               </div>
               <div className="flex flex-col gap-3">
                 <label className="text-sm font-medium text-foreground">End Date</label>
                 <Input 
                   type="date" 
                   required 
                   className="bg-primary/5 border-border/40 rounded-xl h-12 text-foreground"
                   value={formData.endDate}
                   onChange={e => setFormData({...formData, endDate: e.target.value})}
                 />
               </div>
            </div>

            <div className="flex justify-end mt-4">
               <Button type="submit" disabled={loading} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 w-full sm:w-auto">
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Create Trip & Continue
               </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
