"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { toast } from "sonner"
import { ReportCatalogGrid } from "@/components/report-catalog-grid"

interface CatalogReport {
  id: string
  programName: string
  course: string
  schoolYear: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export default function AdminReportCatalogPage() {
  const [reports, setReports] = useState<CatalogReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCatalog()
  }, [])

  const fetchCatalog = async () => {
    try {
      const response = await fetch("/api/reports/catalog")
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      } else {
        toast.error("Failed to fetch report catalog")
      }
    } catch {
      toast.error("Failed to fetch report catalog")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Report Catalogs</h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-1">
              Browse all approved community engagement reports
            </p>
          </div>
          <ReportCatalogGrid reports={reports} isLoading={isLoading} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
