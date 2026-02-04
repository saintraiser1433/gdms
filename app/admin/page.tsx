"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { toast } from "sonner"
import { RiEyeLine, RiCheckLine, RiCloseLine, RiMore2Line, RiDeleteBinLine } from "@remixicon/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTableWrapper } from "@/components/data-table-wrapper"
import { StatusBadge } from "@/components/status-badge"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  onDelete,
  isLoading,
}: {
  reports: Report[]
  onApprove: (report: Report) => void
  onDisapprove: (report: Report) => void
  onDelete: (report: Report) => void
  isLoading: boolean
}) {
  const router = useRouter()

  const getStatusBadge = (status: string) => <StatusBadge status={status} />

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
      header: "Program",
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <RiMore2Line className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/reports/${row.id}`)}>
              <RiEyeLine className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            {row.status === "SUBMITTED" && (
              <>
                <DropdownMenuItem
                  onClick={() => onApprove(row)}
                  className="text-green-600 focus:text-green-600 dark:text-green-400 dark:focus:text-green-400"
                >
                  <RiCheckLine className="h-4 w-4 mr-2" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDisapprove(row)}
                >
                  <RiCloseLine className="h-4 w-4 mr-2" />
                  Disapprove
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(row)}
            >
              <RiDeleteBinLine className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      headerClassName: "w-24",
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
        {
          columnId: "course",
          label: "Program",
          options: [...new Set(reports.map((r) => r.course))]
            .filter(Boolean)
            .sort()
            .map((c) => ({ value: c, label: c })),
          getValue: (row) => row.course,
        },
        {
          columnId: "schoolYear",
          label: "School Year",
          options: [...new Set(reports.map((r) => r.schoolYear))]
            .filter(Boolean)
            .sort()
            .map((y) => ({ value: y, label: y })),
          getValue: (row) => row.schoolYear,
        },
      ]}
    />
  )
}

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [disapproveDialogOpen, setDisapproveDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isDisapproving, setIsDisapproving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    } catch {
      toast.error("Failed to fetch reports")
    } finally {
      setIsLoading(false)
    }
  }

  const openApproveDialog = (report: Report) => {
    setSelectedReport(report)
    setApproveDialogOpen(true)
  }

  const openDisapproveDialog = (report: Report) => {
    setSelectedReport(report)
    setDisapproveDialogOpen(true)
  }

  const openDeleteDialog = (report: Report) => {
    setReportToDelete(report)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reports/${reportToDelete.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Report deleted successfully")
        setDeleteDialogOpen(false)
        setReportToDelete(null)
        fetchReports()
      } else {
        const err = await response.json().catch(() => ({}))
        toast.error(err.error || "Failed to delete report")
      }
    } catch {
      toast.error("Failed to delete report")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleApproveConfirm = async () => {
    if (!selectedReport) return
    setIsApproving(true)
    try {
      const response = await fetch(`/api/reports/${selectedReport.id}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Report approved successfully")
        setApproveDialogOpen(false)
        setSelectedReport(null)
        fetchReports()
      } else {
        toast.error("Failed to approve report")
      }
    } catch {
      toast.error("Failed to approve report")
    } finally {
      setIsApproving(false)
    }
  }

  const handleDisapproveConfirm = async () => {
    if (!selectedReport) return
    setIsDisapproving(true)
    try {
      const response = await fetch(`/api/reports/${selectedReport.id}/disapprove`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Report disapproved")
        setDisapproveDialogOpen(false)
        setSelectedReport(null)
        fetchReports()
      } else {
        toast.error("Failed to disapprove report")
      }
    } catch {
      toast.error("Failed to disapprove report")
    } finally {
      setIsDisapproving(false)
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
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Reports</h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-1">
              Browse, review, and take action on submitted reports from program heads
            </p>
          </div>

          <Card className="py-2">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Reports</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Browse reports by status and take action on pending submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-2 px-3 sm:px-4 md:px-6">
              <Tabs defaultValue="submitted" className="w-full">
                <TabsList className="w-full grid grid-cols-2 sm:w-auto sm:inline-flex lg:grid-cols-4">
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
                    onApprove={openApproveDialog}
                    onDisapprove={openDisapproveDialog}
                    onDelete={openDeleteDialog}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="approved" className="mt-4">
                  <ReportTable
                    reports={approvedReports}
                    onApprove={openApproveDialog}
                    onDisapprove={openDisapproveDialog}
                    onDelete={openDeleteDialog}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="disapproved" className="mt-4">
                  <ReportTable
                    reports={disapprovedReports}
                    onApprove={openApproveDialog}
                    onDisapprove={openDisapproveDialog}
                    onDelete={openDeleteDialog}
                    isLoading={isLoading}
                  />
                </TabsContent>
                <TabsContent value="all" className="mt-4">
                  <ReportTable
                    reports={reports}
                    onApprove={openApproveDialog}
                    onDisapprove={openDisapproveDialog}
                    onDelete={openDeleteDialog}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Approve report?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedReport
                ? `Are you sure you want to approve "${selectedReport.programName}"? This will mark the report as approved and lock it from further edits.`
                : "Are you sure you want to approve this report?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleApproveConfirm}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isApproving ? "Approving..." : "Approve"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={disapproveDialogOpen} onOpenChange={setDisapproveDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Disapprove report?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedReport
                ? `Are you sure you want to disapprove "${selectedReport.programName}"? The program head will need to make changes and resubmit.`
                : "Are you sure you want to disapprove this report?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisapproving}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDisapproveConfirm}
              disabled={isDisapproving}
            >
              {isDisapproving ? "Disapproving..." : "Disapprove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setReportToDelete(null)
        }}
        title="Delete report?"
        description={
          reportToDelete
            ? `Are you sure you want to delete "${reportToDelete.programName}"? This action cannot be undone.`
            : "Are you sure you want to delete this report? This action cannot be undone."
        }
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </SidebarProvider>
  )
}
