"use client"

import { Bell, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Notification {
  id: string
  title: string
  message: string
  createdAt: string
  read?: boolean
}

interface NotificationDropdownProps {
  notifications?: Notification[]
}

export function NotificationDropdown({ notifications = [] }: NotificationDropdownProps) {
  const hasNotifications = notifications.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {hasNotifications && (
            <span className="bg-destructive absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white">
              {notifications.length > 9 ? "9+" : notifications.length}
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
            <div className="space-y-1 p-1">
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium">{n.title}</span>
                  <span className="text-muted-foreground text-sm">{n.message}</span>
                  <span className="text-muted-foreground text-xs">{n.createdAt}</span>
                </DropdownMenuItem>
              ))}
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
