"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { toast } from "sonner"
import { RiEyeLine, RiCheckLine, RiCloseLine } from "@remixicon/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTableWrapper } from "@/components/data-table-wrapper"
import { StatusBadge } from "@/components/status-badge"

interface Report {
  id: string
  programName: string
  course: string
  schoolYear: string
  status: string
  createdAt: string
  submittedAt: string | null
  createdBy: {
    name: string
    email: string
  }
}

function ReportTable({
  reports,
  onApprove,
  onDisapprove,
  isLoading,
}: {
  reports: Report[]
  onApprove: (id: string) => void
  onDisapprove: (id: string) => void
  isLoading: boolean
}) {
  const router = useRouter()

  const getStatusBadge = (status: string) => (
    <StatusBadge
      status={status}
      className={
        status === "APPROVED"
          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
          : status === "DISAPPROVED"
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          : ""
      }
    />
  )

  const columns = [
    {
      id: "header",
      header: "Program Name",
      sortable: true,
      getSortValue: (row: Report) => row.programName,
      cell: (row: Report) => (
        <div>
          <div className="font-medium">{row.programName}</div>
          <div className="text-xs text-muted-foreground">{row.course} · {row.schoolYear}</div>
        </div>
      ),
    },
    {
      id: "course",
      header: "Course",
      sortable: true,
      getSortValue: (row: Report) => row.course,
      cell: (row: Report) => <span className="text-muted-foreground">{row.course}</span>,
    },
    {
      id: "schoolYear",
      header: "School Year",
      sortable: true,
      getSortValue: (row: Report) => row.schoolYear,
      cell: (row: Report) => <span className="text-muted-foreground">{row.schoolYear}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      getSortValue: (row: Report) => row.status,
      cell: (row: Report) => getStatusBadge(row.status),
    },
    {
      id: "reviewer",
      header: "Reviewer",
      sortable: true,
      getSortValue: (row: Report) => row.createdBy.name,
      cell: (row: Report) => (
        <span className="text-muted-foreground">
          {row.createdBy.name}
          <span className="hidden sm:inline"> ({row.createdBy.email})</span>
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row: Report) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => router.push(`/reports/${row.id}`)}
          >
            <RiEyeLine className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          {row.status === "SUBMITTED" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                onClick={() => onApprove(row.id)}
              >
                <RiCheckLine className="h-4 w-4" />
                <span className="sr-only">Approve</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                onClick={() => onDisapprove(row.id)}
              >
                <RiCloseLine className="h-4 w-4" />
                <span className="sr-only">Disapprove</span>
              </Button>
            </>
          )}
        </div>
      ),
      headerClassName: "w-32",
    },
  ]

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <DataTableWrapper
      columns={columns}
      data={reports}
      getRowId={(row) => row.id}
      emptyMessage="No reports found"
      emptyStateDescription="Reports will appear here once submitted by program heads"
      searchPlaceholder="Search reports..."
      getSearchableText={(row) =>
        `${row.programName} ${row.course} ${row.schoolYear} ${row.status} ${row.createdBy.name} ${row.createdBy.email}`
      }
      filters={[
        {
          columnId: "status",
          label: "Status",
          options: [
            { value: "DRAFT", label: "Draft" },
            { value: "SUBMITTED", label: "Submitted" },
            { value: "APPROVED", label: "Approved" },
            { value: "DISAPPROVED", label: "Disapproved" },
          ],
          getValue: (row) => row.status,
        },
      ]}
    />
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      toast.error("Failed to fetch reports")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this report?")) return

    try {
      const response = await fetch(`/api/reports/${id}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Report approved successfully")
        fetchReports()
      } else {
        toast.error("Failed to approve report")
      }
    } catch (error) {
      toast.error("Failed to approve report")
    }
  }

  const handleDisapprove = async (id: string) => {
    if (!confirm("Are you sure you want to disapprove this report?")) return

    try {
      const response = await fetch(`/api/reports/${id}/disapprove`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Report disapproved")
        fetchReports()
      } else {
        toast.error("Failed to disapprove report")
      }
    } catch (error) {
      toast.error("Failed to disapprove report")
    }
  }

  const submittedReports = reports.filter((r) => r.status === "SUBMITTED")
  const approvedReports = reports.filter((r) => r.status === "APPROVED")
  const disapprovedReports = reports.filter((r) => r.status === "DISAPPROVED")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Browse, review, and take action on submitted reports from program heads
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{submittedReports.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedReports.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Disapproved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{disapprovedReports.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="pb-2">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Browse reports by status and take action on pending submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="submitted" className="w-full">
                <TabsList>
                  <TabsTrigger value="submitted">
                    Pending Review ({submittedReports.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Approved ({approvedReports.length})
                  </TabsTrigger>
                  <TabsTrigger value="disapproved">
                    Disapproved ({disapprovedReports.length})
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    All Reports ({reports.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="submitted" className="mt-4">
                  <ReportTable
                    reports={submittedReports}
                    onApprove={handleApprove}
                    onDisapprove={handleDisapprove}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="approved" className="mt-4">
                  <ReportTable
                    reports={approvedReports}
                    onApprove={handleApprove}
                    onDisapprove={handleDisapprove}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="disapproved" className="mt-4">
                  <ReportTable
                    reports={disapprovedReports}
                    onApprove={handleApprove}
                    onDisapprove={handleDisapprove}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="all" className="mt-4">
                  <ReportTable
                    reports={reports}
                    onApprove={handleApprove}
                    onDisapprove={handleDisapprove}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
