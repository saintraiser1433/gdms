"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Inbox } from "lucide-react"
import { RiCheckLine, RiCloseLine, RiSendPlaneLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Notification {
  id: string
  title: string
  message: string
  reportId?: string | null
  createdAt: string
  read?: boolean
}

interface NotificationDropdownProps {
  notifications?: Notification[]
}

function getNotificationIcon(title: string) {
  const t = title?.toLowerCase() ?? ""
  if (t.includes("approved")) return <RiCheckLine className="size-4 shrink-0 text-green-600 dark:text-green-400" />
  if (t.includes("disapproved")) return <RiCloseLine className="size-4 shrink-0 text-red-600 dark:text-red-400" />
  if (t.includes("submitted")) return <RiSendPlaneLine className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
  return null
}

function formatNotificationDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function NotificationDropdown({ notifications: initialNotifications }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications ?? [])
  const [open, setOpen] = useState(false)

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => (Array.isArray(data) ? setNotifications(data) : []))
      .catch(() => setNotifications([]))
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Refetch when dropdown opens to get latest notifications
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) fetchNotifications()
  }

  const hasNotifications = notifications.length > 0
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (notificationId: string) => {
    // Optimistically update local state so count decreases immediately
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    fetch(`/api/notifications/${notificationId}`, {
      method: "PATCH",
    }).catch(() => {
      // Revert on failure
      fetchNotifications()
    })
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="bg-destructive absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-2">
          <h4 className="font-semibold">Notifications</h4>
        </div>
        {hasNotifications ? (
          <div className="max-h-[280px] overflow-y-auto">
            <div className="p-1">
              {notifications.map((n, index) => {
                const content = (
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(n.title)}
                      <span className="font-medium">{n.title}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">{n.message}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatNotificationDate(n.createdAt)}
                    </span>
                  </div>
                )
                const handleClick = () => {
                  if (!n.read) markAsRead(n.id)
                }
                const item = n.reportId ? (
                  <DropdownMenuItem key={n.id} asChild>
                    <Link
                      href={`/reports/${n.reportId}`}
                      className="block p-3 cursor-pointer"
                      onClick={handleClick}
                    >
                      {content}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-1 p-3"
                    onClick={handleClick}
                  >
                    {content}
                  </DropdownMenuItem>
                )
                return (
                  <div key={n.id} className="contents">
                    {item}
                    {index < notifications.length - 1 && <DropdownMenuSeparator />}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Inbox className="text-muted-foreground size-12" />
            <p className="text-muted-foreground text-sm">No notification yet</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
