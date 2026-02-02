"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { RiAddLine, RiEyeLine, RiEditLine, RiDeleteBinLine, RiMore2Line } from "@remixicon/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateReportModal } from "@/components/create-report-modal"
import { DataTableWrapper } from "@/components/data-table-wrapper"
import { StatusBadge } from "@/components/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"

interface Report {
  id: string
  programName: string
  course: string
  schoolYear: string
  status: string
  createdAt: string
  createdBy: {
    name: string
  }
}

export default function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isProgramHead = session?.user?.role === "PROGRAM_HEAD"

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (searchParams.get("create") === "1" && isProgramHead) {
      setCreateModalOpen(true)
      router.replace("/reports", { scroll: false })
    }
  }, [searchParams, isProgramHead, router])

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

  const openDeleteDialog = (id: string) => {
    setReportToDelete(id)
    setDeleteDialogOpen(true)
  }

  const deleteReport = async () => {
    if (!reportToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reports/${reportToDelete}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Report deleted successfully")
        fetchReports()
        setReportToDelete(null)
      } else {
        toast.error("Failed to delete report")
      }
    } catch {
      toast.error("Failed to delete report")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "secondary" | "default" | "outline"> = {
      DRAFT: "secondary",
      SUBMITTED: "default",
      APPROVED: "outline",
      DISAPPROVED: "outline",
    }
    return (
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
  }

  const columns = [
    {
      id: "header",
      header: "Program Name",
      sortable: true,
      getSortValue: (row: Report) => row.programName,
      cell: (row: Report) => (
        <div>
          <div className="font-medium">{row.programName}</div>
          <div className="text-xs text-muted-foreground">
            {row.course} · {row.schoolYear}
          </div>
        </div>
      ),
    },
    {
      id: "course",
      header: "Course",
      sortable: true,
      getSortValue: (row: Report) => row.course,
      cell: (row: Report) => row.course,
      className: "text-muted-foreground",
    },
    {
      id: "schoolYear",
      header: "School Year",
      sortable: true,
      getSortValue: (row: Report) => row.schoolYear,
      cell: (row: Report) => row.schoolYear,
      className: "text-muted-foreground",
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
      header: "Created By",
      sortable: true,
      getSortValue: (row: Report) => row.createdBy.name,
      cell: (row: Report) => (
        <span className="text-muted-foreground">{row.createdBy.name}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row: Report) => {
        const canEditOrDelete = row.status !== "APPROVED"
        return (
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
                View Report
              </DropdownMenuItem>
              {canEditOrDelete && (
                <DropdownMenuItem onClick={() => router.push(`/reports/${row.id}/edit`)}>
                  <RiEditLine className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canEditOrDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => openDeleteDialog(row.id)}
                >
                  <RiDeleteBinLine className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      headerClassName: "w-24",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Card className="pb-2">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl">Reports</CardTitle>
                <CardDescription>
                  View and manage your community engagement reports
                </CardDescription>
              </div>
              {isProgramHead && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <RiAddLine className="w-4 h-4 mr-2" />
                  New Report
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground py-8">Loading...</div>
              ) : (
                <DataTableWrapper
                  columns={columns}
                  data={reports}
                  getRowId={(row) => row.id}
                  emptyMessage="No reports yet"
                  showCreateReportButton={isProgramHead}
                  onCreateReportClick={isProgramHead ? () => setCreateModalOpen(true) : undefined}
                  searchPlaceholder="Search reports..."
                  getSearchableText={(row) =>
                    `${row.programName} ${row.course} ${row.schoolYear} ${row.status} ${row.createdBy.name}`
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
              )}
            </CardContent>
          </Card>
        </div>
        {isProgramHead && (
          <CreateReportModal
            open={createModalOpen}
            onOpenChange={setCreateModalOpen}
            onSuccess={fetchReports}
          />
        )}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open)
            if (!open) setReportToDelete(null)
          }}
          title="Delete report?"
          description="Are you sure you want to delete this report? This action cannot be undone."
          onConfirm={deleteReport}
          isLoading={isDeleting}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
