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
    return <div>Loading...</div>
  }

  if (!report) {
    return <div>Report not found</div>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 print:p-0">
          <div className="flex justify-between items-center print:hidden">
            <div>
              <h1 className="text-3xl font-bold">{report.programName}</h1>
              <p className="text-muted-foreground">
                {report.course} - {report.schoolYear}
              </p>
            </div>
            <div className="flex gap-2">
              {canResubmit && (
                <Button onClick={() => router.push(`/reports/${report.id}/edit`)} variant="default">
                  <RiEditLine className="w-4 h-4 mr-2" />
                  Edit & Resubmit
                </Button>
              )}
              <Button onClick={handleExportExcel} variant="default">
                <RiFileExcel2Line className="w-4 h-4 mr-2" />
                Download Excel
              </Button>
              <Button variant="outline" onClick={() => router.push(isAdmin ? "/admin" : "/reports")}>
                Back
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <Separator className="mx-4 my-1" />
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Program Name:</strong> {report.programName}
                </div>
                <div>
                  <strong>Implementation Period:</strong> {report.implementationPeriod}
                </div>
                <div>
                  <strong>Responsible Person:</strong> {report.responsiblePerson}
                </div>
                <div>
                  <strong>Location:</strong> {report.location}
                </div>
                <div>
                  <strong>Course:</strong> {report.course}
                </div>
                <div>
                  <strong>School Year:</strong> {report.schoolYear}
                </div>
                <div>
                  <strong>Status:</strong> <StatusBadge status={report.status} />
                </div>
                <div>
                  <strong>Created By:</strong> {report.createdBy.name}
                </div>
              </div>
            </CardContent>
          </Card>

          {report.objectives.map((objective, objIndex) => {
            const sectionComments = getCommentsFor("SECTION", objective.id)
            return (
            <Card key={objective.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle>Objective {objIndex + 1}: {objective.title}</CardTitle>
                {isAdmin && (report.status === "SUBMITTED" || report.status === "DISAPPROVED") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => openPinComment("SECTION", objective.id, `Objective ${objIndex + 1}: ${objective.title}`)}
                  >
                    <RiPushpin2Line className="h-4 w-4 mr-1" />
                    Pin comment
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
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold">
                        KPI {kpiIndex + 1}: {kpi.description}
                      </h3>
                      {isAdmin && (report.status === "SUBMITTED" || report.status === "DISAPPROVED") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="shrink-0 h-8"
                          onClick={() => openPinComment("KPI", kpi.id, `KPI ${kpiIndex + 1}: ${kpi.description}`)}
                        >
                          <RiPushpin2Line className="h-3.5 w-3.5 mr-1" />
                          Pin
                        </Button>
                      )}
                    </div>
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
                      <div key={strategy.id} className="mb-4 pl-4 border-l-2">
                        <p className="font-medium mb-2">
                          Strategy {stratIndex + 1}: {strategy.description}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Target: {strategy.target}
                        </p>
                        <div className="overflow-hidden rounded-lg border border-border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
                                <TableHead className="px-1.5">Period</TableHead>
                                <TableHead className="px-1.5">Activities</TableHead>
                                <TableHead className="px-1.5">Status</TableHead>
                                <TableHead className="px-1.5 text-right">Budget Allocated</TableHead>
                                <TableHead className="px-1.5">Budget Source</TableHead>
                                <TableHead className="px-1.5 text-right">Budget Spent</TableHead>
                                <TableHead className="px-1.5 text-right">Variance</TableHead>
                                {isAdmin && (report.status === "SUBMITTED" || report.status === "DISAPPROVED") && <TableHead className="w-12 px-1.5"></TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {strategy.timeEntries.map((entry: TimeEntry) => (
                                <Fragment key={entry.id}>
                                <TableRow className="border-border">
                                  <TableCell className="px-3">
                                    <span className="font-medium">{entry.period}</span>
                                    <br />
                                    <span className="text-xs text-muted-foreground">
                                      ({entry.periodStartMonth} - {entry.periodEndMonth})
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-3 whitespace-normal">{entry.activities || "-"}</TableCell>
                                  <TableCell className="px-3">
                                    {entry.status ? (
                                      <div>
                                        <StatusBadge status={entry.status} />
                                        {entry.statusComment && (
                                          <p className="text-xs text-muted-foreground mt-1">{entry.statusComment}</p>
                                        )}
                                      </div>
                                    ) : "-"}
                                  </TableCell>
                                  <TableCell className="px-3 text-right tabular-nums">₱{Number(entry.budgetAllocated).toLocaleString()}</TableCell>
                                  <TableCell className="px-3">{entry.budgetSource || "-"}</TableCell>
                                  <TableCell className="px-3 text-right tabular-nums">₱{Number(entry.budgetSpent).toLocaleString()}</TableCell>
                                  <TableCell className="px-3 text-right tabular-nums">₱{Number(entry.variance).toLocaleString()}</TableCell>
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
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Documents / Pictures</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto grid gap-4 py-4">
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
