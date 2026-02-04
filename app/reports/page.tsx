"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { RiAddLine, RiEyeLine, RiEditLine, RiDeleteBinLine, RiMore2Line } from "@remixicon/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

function ReportsPageContent() {
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

  const draftReports = reports.filter((r) => r.status === "DRAFT")
  const submittedReports = reports.filter((r) => r.status === "SUBMITTED")
  const approvedReports = reports.filter((r) => r.status === "APPROVED")
  const disapprovedReports = reports.filter((r) => r.status === "DISAPPROVED")

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
    } catch {
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
          <div className="text-xs text-muted-foreground">
            {row.course} · {row.schoolYear}
          </div>
        </div>
      ),
    },
    {
      id: "course",
      header: "Program",
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
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6">
          <Card className="py-2">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between space-y-0 pb-2 px-4 sm:px-6">
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl">Reports</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View and manage your community engagement reports
                </CardDescription>
              </div>
              {isProgramHead && (
                <Button onClick={() => setCreateModalOpen(true)} className="w-full sm:w-auto shrink-0" size="sm">
                  <RiAddLine className="w-4 h-4 mr-2" />
                  New Report
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-2 pb-2 px-3 sm:px-4 md:px-6">
              {isLoading ? (
                <div className="text-muted-foreground py-8">Loading...</div>
              ) : isProgramHead ? (
                <Tabs defaultValue="submitted" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 sm:w-auto sm:inline-flex md:grid-cols-5">
                    <TabsTrigger value="submitted">
                      Submitted ({submittedReports.length})
                    </TabsTrigger>
                    <TabsTrigger value="draft">
                      Draft ({draftReports.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                      Approved ({approvedReports.length})
                    </TabsTrigger>
                    <TabsTrigger value="disapproved">
                      Disapproved ({disapprovedReports.length})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      All ({reports.length})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="submitted" className="mt-4">
                    <DataTableWrapper
                      columns={columns}
                      data={submittedReports}
                      getRowId={(row) => row.id}
                      emptyMessage="No submitted reports"
                      showCreateReportButton={true}
                      onCreateReportClick={() => setCreateModalOpen(true)}
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
                  </TabsContent>
                  <TabsContent value="draft" className="mt-4">
                    <DataTableWrapper
                      columns={columns}
                      data={draftReports}
                      getRowId={(row) => row.id}
                      emptyMessage="No draft reports"
                      showCreateReportButton={true}
                      onCreateReportClick={() => setCreateModalOpen(true)}
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
                  </TabsContent>
                  <TabsContent value="approved" className="mt-4">
                    <DataTableWrapper
                      columns={columns}
                      data={approvedReports}
                      getRowId={(row) => row.id}
                      emptyMessage="No approved reports"
                      showCreateReportButton={false}
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
                  </TabsContent>
                  <TabsContent value="disapproved" className="mt-4">
                    <DataTableWrapper
                      columns={columns}
                      data={disapprovedReports}
                      getRowId={(row) => row.id}
                      emptyMessage="No disapproved reports"
                      showCreateReportButton={false}
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
                  </TabsContent>
                  <TabsContent value="all" className="mt-4">
                    <DataTableWrapper
                      columns={columns}
                      data={reports}
                      getRowId={(row) => row.id}
                      emptyMessage="No reports yet"
                      showCreateReportButton={false}
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
                  </TabsContent>
                </Tabs>
              ) : (
                <DataTableWrapper
                  columns={columns}
                  data={reports}
                  getRowId={(row) => row.id}
                  emptyMessage="No reports yet"
                  showCreateReportButton={false}
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

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading reports...</div>}>
      <ReportsPageContent />
    </Suspense>
  )
}
