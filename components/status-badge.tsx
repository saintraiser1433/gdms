"use client"

import { IconCircleCheckFilled, IconCircleX, IconEdit, IconLoader2, IconSend } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || ""

  // Report-level statuses (DRAFT, SUBMITTED, APPROVED, DISAPPROVED)
  const isReportDraft = normalizedStatus === "draft"
  const isReportSubmitted = normalizedStatus === "submitted"
  const isReportApproved = normalizedStatus === "approved"
  const isReportDisapproved = normalizedStatus === "disapproved"

  // Timeline entry statuses
  const isNotCompleted = normalizedStatus.includes("not completed")
  const isCancelled = normalizedStatus.includes("cancelled") || normalizedStatus.includes("canceled")
  const isDone =
    !isNotCompleted &&
    (normalizedStatus.includes("done") || normalizedStatus === "completed")
  const isInProgress =
    normalizedStatus.includes("in process") ||
    normalizedStatus.includes("in progress") ||
    normalizedStatus.includes("progress")

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2 py-0.5 font-normal",
        isReportDraft && "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
        isReportSubmitted && "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
        isReportApproved && "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
        isReportDisapproved && "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
        isDone && "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
        isNotCompleted && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
        isCancelled && "border-red-200/70 bg-red-50/60 text-red-700/90 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300/90",
        isInProgress && "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
        className
      )}
    >
      {isReportDraft ? (
        <IconEdit className="h-3.5 w-3.5 shrink-0 text-slate-600 dark:text-slate-400" />
      ) : isReportSubmitted ? (
        <IconSend className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
      ) : isReportApproved ? (
        <IconCircleCheckFilled className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
      ) : isReportDisapproved ? (
        <IconCircleX className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
      ) : isDone ? (
        <IconCircleCheckFilled className="h-3.5 w-3.5 shrink-0 animate-in zoom-in-95 fade-in-0 duration-300 text-green-600 dark:text-green-400" />
      ) : isInProgress ? (
        <IconLoader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
      ) : isCancelled ? (
        <IconCircleX className="h-3.5 w-3.5 shrink-0 text-red-600/90 dark:text-red-400/90" />
      ) : null}
      {status || "—"}
    </Badge>
  )
}
