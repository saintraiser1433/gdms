"use client"

import { IconCircleCheckFilled } from "@tabler/icons-react"
import { IconLoader2 } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || ""
  const isDone = normalizedStatus.includes("done") || normalizedStatus.includes("completed")
  const isInProgress =
    normalizedStatus.includes("in process") ||
    normalizedStatus.includes("in progress") ||
    normalizedStatus.includes("progress")

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-2 py-0.5 font-normal",
        isDone && "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
        isInProgress && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
        className
      )}
    >
      {isDone ? (
        <IconCircleCheckFilled className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
      ) : isInProgress ? (
        <IconLoader2 className="h-3.5 w-3.5 animate-spin text-amber-600 dark:text-amber-400" />
      ) : null}
      {status || "—"}
    </Badge>
  )
}
