"use client"

import { Fragment, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { exportReportToExcel } from "@/lib/excel-export"
import { RiFileExcel2Line, RiEditLine, RiPushpin2Line, RiFileLine, RiFilePdfLine, RiFileWordLine, RiFileExcelLine, RiDownloadLine, RiEyeLine } from "@remixicon/react"
import { IconChevronDown } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

interface Comment {
  id: string
  commentText: string
  pinnedToType: "CELL" | "KPI" | "SECTION"
  pinnedToId: string | null
  createdAt: string
  createdBy: { name: string }
}

interface TimeEntry {
  id: string
  period: string
  periodStartMonth: string
  periodEndMonth: string
  activities?: string
  status?: string
  statusComment?: string | null
  budgetAllocated?: number
  budgetSource?: string
  budgetSpent?: number
  variance?: number
}

interface Strategy {
  id: string
  description: string
  target?: string
  timeEntries: TimeEntry[]
}

interface Kpi {
  id: string
  description: string
  attachments: { id: string; fileName: string; mimeType: string }[]
  strategies: Strategy[]
}

interface Objective {
  id: string
  title: string
  kpis: Kpi[]
}

interface Report {
  id: string
  programName: string
  implementationPeriod: string
  responsiblePerson: string
  location: string
  course: string
  schoolYear: string
  status: string
  objectives: Objective[]
  createdBy: { id: string; name: string; email: string }
  submittedAt: string | null
  reviewedAt: string | null
  comments?: Comment[]
}

export default function ReportViewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Program heads can only view their own reports (API enforces this), so disapproved = can resubmit
  const canResubmit = report?.status === "DISAPPROVED" && session?.user?.role === "PROGRAM_HEAD"
  const isAdmin = session?.user?.role === "ADMIN"
  const comments = report?.comments ?? []

  const [addCommentOpen, setAddCommentOpen] = useState(false)
  const [commentPinTarget, setCommentPinTarget] = useState<{ type: "SECTION" | "KPI" | "CELL"; id: string; label: string } | null>(null)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false)
  const [documentsDialogAttachments, setDocumentsDialogAttachments] = useState<{ id: string; fileName: string; mimeType: string }[]>([])
  const [collapsedKpis, setCollapsedKpis] = useState<Set<string>>(new Set())

  const toggleKpi = (id: string) => {
    setCollapsedKpis((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openPinComment = (type: "SECTION" | "KPI" | "CELL", id: string, label: string) => {
    setCommentPinTarget({ type, id, label })
    setCommentText("")
    setAddCommentOpen(true)
  }

  const closePinComment = () => {
    setAddCommentOpen(false)
    setCommentPinTarget(null)
    setCommentText("")
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !commentPinTarget || !report) return
    setIsSubmittingComment(true)
    try {
      const res = await fetch(`/api/reports/${report.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentText: commentText.trim(),
          pinnedToType: commentPinTarget.type,
          pinnedToId: commentPinTarget.id,
        }),
      })
      if (res.ok) {
        toast.success("Comment pinned")
        fetchReport()
        closePinComment()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Failed to add comment")
      }
    } catch {
      toast.error("Failed to add comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const getCommentsFor = (type: "SECTION" | "KPI" | "CELL", id: string) =>
    comments.filter((c) => c.pinnedToType === type && c.pinnedToId === id)

  useEffect(() => {
    fetchReport()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch on mount only
  }, [params.id])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      }
    } catch {
      toast.error("Failed to fetch report")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportExcel = async () => {
    if (!report) return
    try {
      await exportReportToExcel(report)
      toast.success("Report exported to Excel")
    } catch (error) {
      toast.error("Failed to export report")
      console.error(error)
    }
  }

  if (isLoading) {
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

  if (!report) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <p className="text-muted-foreground">Report not found</p>
            <Button variant="outline" onClick={() => router.push("/reports")}>
              Back to Reports
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6 print:p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center print:hidden">
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate sm:text-2xl md:text-3xl">{report.programName}</h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {report.course} - {report.schoolYear}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {canResubmit && (
                <Button onClick={() => router.push(`/reports/${report.id}/edit`)} variant="default" size="sm" className="shrink-0">
                  <RiEditLine className="w-4 h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Edit & Resubmit</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              )}
              <Button onClick={handleExportExcel} variant="default" size="sm" className="shrink-0">
                <RiFileExcel2Line className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Download Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => router.push(isAdmin ? "/admin" : "/reports")}>
                Back
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="px-3 py-2 sm:px-4 sm:py-3">
              <CardTitle className="text-base font-bold sm:text-lg">Report Information</CardTitle>
            </CardHeader>
            <Separator className="mx-4 my-1" />
            <CardContent className="space-y-2 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 text-sm sm:text-base">
                <div className="break-words">
                  <strong>Program Name:</strong> {report.programName}
                </div>
                <div className="break-words">
                  <strong>Implementation Period:</strong> {report.implementationPeriod}
                </div>
                <div className="break-words">
                  <strong>Responsible Person:</strong> {report.responsiblePerson}
                </div>
                <div className="break-words">
                  <strong>Location:</strong> {report.location}
                </div>
                <div className="break-words">
                  <strong>Course:</strong> {report.course}
                </div>
                <div className="break-words">
                  <strong>School Year:</strong> {report.schoolYear}
                </div>
                <div>
                  <strong>Status:</strong> <StatusBadge status={report.status} />
                </div>
                <div className="break-words">
                  <strong>Created By:</strong> {report.createdBy.name}
                </div>
              </div>
            </CardContent>
          </Card>

          {report.objectives.map((objective, objIndex) => {
            const sectionComments = getCommentsFor("SECTION", objective.id)
            return (
            <Card key={objective.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <CardTitle className="text-base font-bold sm:text-lg min-w-0 break-words">Objective {objIndex + 1}: {objective.title}</CardTitle>
                {isAdmin && (report.status === "SUBMITTED" || report.status === "DISAPPROVED") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 h-7 sm:h-8"
                    onClick={() => openPinComment("SECTION", objective.id, `Objective ${objIndex + 1}: ${objective.title}`)}
                    title="Pin comment"
                  >
                    <RiPushpin2Line className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Pin comment</span>
                  </Button>
                )}
              </CardHeader>
              {sectionComments.length > 0 && (
                <div className="px-6 pb-2 space-y-2">
                  {sectionComments.map((c) => (
                    <div key={c.id} className="rounded-lg border bg-rose-50 dark:bg-rose-950/30 p-3 text-sm flex gap-2">
                      <RiPushpin2Line className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      <div>
                        <p className="font-medium">{c.commentText}</p>
                        <p className="text-xs text-muted-foreground mt-1">— {c.createdBy.name} · {new Date(c.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Separator className="mx-4 my-1" />
              <CardContent>
                {objective.kpis.map((kpi: Kpi, kpiIndex: number) => {
                  const kpiComments = getCommentsFor("KPI", kpi.id)
                  return (
                  <div key={kpi.id} className="mb-6">
                    <button
                      type="button"
                      onClick={() => toggleKpi(kpi.id)}
                      className="flex w-full flex-col gap-2 text-left sm:flex-row sm:items-start sm:justify-between mb-3 group"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <IconChevronDown
                          className={`size-5 shrink-0 mt-0.5 transition-transform text-muted-foreground group-hover:text-foreground ${collapsedKpis.has(kpi.id) ? "-rotate-90" : ""}`}
                        />
                        <h3 className="font-semibold text-sm sm:text-base min-w-0 break-words">
                          KPI {kpiIndex + 1}: {kpi.description}
                        </h3>
                      </div>
                      {isAdmin && (report.status === "SUBMITTED" || report.status === "DISAPPROVED") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="shrink-0 h-7 sm:h-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            openPinComment("KPI", kpi.id, `KPI ${kpiIndex + 1}: ${kpi.description}`)
                          }}
                          title="Pin comment"
                        >
                          <RiPushpin2Line className="h-3.5 w-3.5 mr-1" />
                          <span className="hidden sm:inline">Pin</span>
                        </Button>
                      )}
                    </button>
                    {!collapsedKpis.has(kpi.id) && (
                    <>
                    {kpiComments.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {kpiComments.map((c) => (
                          <div key={c.id} className="rounded-lg border bg-rose-50 dark:bg-rose-950/30 p-2 text-sm flex gap-2">
                            <RiPushpin2Line className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                            <div>
                              <p>{c.commentText}</p>
                              <p className="text-xs text-muted-foreground">— {c.createdBy.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {kpi.attachments && kpi.attachments.length > 0 && (
                      <div className="mb-4">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="shrink-0"
                          onClick={() => {
                            setDocumentsDialogAttachments(kpi.attachments)
                            setDocumentsDialogOpen(true)
                          }}
                        >
                          <RiFileLine className="h-4 w-4 mr-2" />
                          View Documents ({kpi.attachments.length})
                        </Button>
                      </div>
                    )}
                    {kpi.strategies.map((strategy: Strategy, stratIndex: number) => (
                      <div key={strategy.id} className="mb-4 pl-3 sm:pl-4 border-l-2">
                        <p className="font-medium mb-2 text-sm sm:text-base break-words">
                          Strategy {stratIndex + 1}: {strategy.description}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 break-words">
                          Target: {strategy.target}
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <Table className="min-w-[640px]">
                            <TableHeader>
                              <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
                                <TableHead className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">Period</TableHead>
                                <TableHead className="px-2 py-2 text-xs sm:text-sm">Activities</TableHead>
                                <TableHead className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
                                <TableHead className="px-2 py-2 text-xs sm:text-sm text-right whitespace-nowrap">Budget Alloc.</TableHead>
                                <TableHead className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">Budget Source</TableHead>
                                <TableHead className="px-2 py-2 text-xs sm:text-sm text-right whitespace-nowrap">Budget Spent</TableHead>
                                <TableHead className="px-2 py-2 text-xs sm:text-sm text-right whitespace-nowrap">Variance</TableHead>
                                {isAdmin && (report.status === "SUBMITTED" || report.status === "DISAPPROVED") && <TableHead className="w-10 px-1.5"></TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {strategy.timeEntries.map((entry: TimeEntry) => (
                                <Fragment key={entry.id}>
                                <TableRow className="border-border">
                                  <TableCell className="px-2 py-2 text-xs sm:text-sm">
                                    <span className="font-medium">{entry.period}</span>
                                    <br />
                                    <span className="text-xs text-muted-foreground">
                                      ({entry.periodStartMonth} - {entry.periodEndMonth})
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-2 py-2 text-xs sm:text-sm whitespace-normal max-w-[120px] sm:max-w-none">{entry.activities || "-"}</TableCell>
                                  <TableCell className="px-2 py-2 text-xs sm:text-sm">
                                    {entry.status ? (
                                      <div>
                                        <StatusBadge status={entry.status} />
                                        {entry.statusComment && (
                                          <p className="text-xs text-muted-foreground mt-1">{entry.statusComment}</p>
                                        )}
                                      </div>
                                    ) : "-"}
                                  </TableCell>
                                  <TableCell className="px-2 py-2 text-xs sm:text-sm text-right tabular-nums whitespace-nowrap">₱{Number(entry.budgetAllocated).toLocaleString()}</TableCell>
                                  <TableCell className="px-2 py-2 text-xs sm:text-sm max-w-[80px] sm:max-w-none truncate" title={entry.budgetSource || ""}>{entry.budgetSource || "-"}</TableCell>
                                  <TableCell className="px-2 py-2 text-xs sm:text-sm text-right tabular-nums whitespace-nowrap">₱{Number(entry.budgetSpent).toLocaleString()}</TableCell>
                                  <TableCell className="px-2 py-2 text-xs sm:text-sm text-right tabular-nums whitespace-nowrap">₱{Number(entry.variance).toLocaleString()}</TableCell>
                                  {isAdmin && (report.status === "SUBMITTED" || report.status === "DISAPPROVED") && (
                                    <TableCell className="px-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={() => openPinComment("CELL", entry.id, `${entry.period} (${entry.periodStartMonth} - ${entry.periodEndMonth})`)}
                                      >
                                        <RiPushpin2Line className="h-3.5 w-3.5" />
                                      </Button>
                                    </TableCell>
                                  )}
                                </TableRow>
                                {getCommentsFor("CELL", entry.id).length > 0 && (
                                  <TableRow className="bg-rose-50/80 dark:bg-rose-950/20 border-border">
                                    <TableCell colSpan={isAdmin && (report.status === "SUBMITTED" || report.status === "DISAPPROVED") ? 8 : 7} className="px-3 py-2">
                                      {getCommentsFor("CELL", entry.id).map((c) => (
                                        <div key={c.id} className="rounded border bg-rose-50 dark:bg-rose-950/30 p-2 text-sm mb-1 last:mb-0 flex gap-2">
                                          <RiPushpin2Line className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                                          <div>
                                            <p>{c.commentText}</p>
                                            <p className="text-xs text-muted-foreground">— {c.createdBy.name}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </TableCell>
                                  </TableRow>
                                )}
                                </Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                    </>
                    )}
                  </div>
                )})}
              </CardContent>
            </Card>
          )})}
        </div>
      </SidebarInset>

      <Dialog open={addCommentOpen} onOpenChange={(open) => !open && closePinComment()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pin Comment</DialogTitle>
          </DialogHeader>
          {commentPinTarget && (
            <p className="text-sm text-muted-foreground">
              Pinning to: <strong>{commentPinTarget.label}</strong>
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="comment-text">Comment</Label>
            <Textarea
              id="comment-text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your feedback or comment..."
              rows={4}
              disabled={isSubmittingComment}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closePinComment} disabled={isSubmittingComment}>
              Cancel
            </Button>
            <Button onClick={handleAddComment} disabled={isSubmittingComment || !commentText.trim()}>
              {isSubmittingComment ? "Adding..." : "Pin Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-[min(95vw,42rem)] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Documents / Pictures</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto grid gap-4 py-4 grid-cols-1 sm:grid-cols-2">
            {documentsDialogAttachments.map((att: { id: string; fileName: string; mimeType: string }) => {
              const isImage = att.mimeType?.startsWith("image/")
              const ext = att.fileName?.split(".").pop()?.toLowerCase() ?? ""
              const isPdf = ext === "pdf" || att.mimeType === "application/pdf"
              const isWord = ["doc", "docx"].includes(ext) || att.mimeType?.includes("word") || att.mimeType === "application/msword"
              const isExcel = ["xls", "xlsx"].includes(ext) || att.mimeType?.includes("sheet") || att.mimeType === "application/vnd.ms-excel"
              const FileIcon = isPdf ? RiFilePdfLine : isWord ? RiFileWordLine : isExcel ? RiFileExcelLine : RiFileLine
              const url = `/api/attachments/${att.id}`
              return (
                <div
                  key={att.id}
                  className="flex flex-col gap-2 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    {isImage ? (
                      <div className="shrink-0 w-24 h-24 rounded overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element -- API-served image, auth required */}
                        <img
                          src={url}
                          alt={att.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="shrink-0 w-24 h-24 rounded flex items-center justify-center bg-muted">
                        <FileIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={att.fileName}>
                        {att.fileName}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="default"
                          size="sm"
                          asChild
                        >
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <RiEyeLine className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          asChild
                        >
                          <a href={url} download={att.fileName}>
                            <RiDownloadLine className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
