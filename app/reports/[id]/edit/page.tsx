"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { CreateReportForm } from "@/components/create-report-form"
import { toast } from "sonner"

export default function EditReportPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [canEdit, setCanEdit] = useState<boolean | null>(null)
  const reportId = params.id as string

  useEffect(() => {
    if (!reportId) return
    fetch(`/api/reports/${reportId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load")
        return res.json()
      })
      .then((data) => {
        if (data.status === "APPROVED") {
          toast.error("Approved reports cannot be edited")
          router.replace(`/reports/${reportId}`)
          setCanEdit(false)
        } else {
          setCanEdit(true)
        }
      })
      .catch(() => {
        toast.error("Report not found")
        router.replace("/reports")
        setCanEdit(false)
      })
  }, [reportId, router])

  const handleSuccess = () => {
    router.push("/reports")
  }

  const handleCancel = () => {
    router.push(`/reports/${reportId}`)
  }

  if (session?.user?.role !== "PROGRAM_HEAD") {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-muted-foreground">Only program heads can edit reports.</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (canEdit === null) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (canEdit === false) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="mx-auto w-full max-w-4xl">
            <CreateReportForm
              reportId={reportId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
