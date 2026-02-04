"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const PATH_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Reports",
  reports: "Reports",
  courses: "Program",
  users: "User Management",
  catalog: "Report Catalogs",
}

export function SiteHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const isReportDetail = segments[0] === "reports" && segments.length > 1

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b px-4 py-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex h-full w-full items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 self-stretch" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="flex items-center" aria-label="Home">
                  <Home className="size-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, i) => {
              const href = "/" + segments.slice(0, i + 1).join("/")
              const label =
                PATH_LABELS[segment] ??
                (isReportDetail && i === segments.length - 1
                  ? "Report Details"
                  : segment.charAt(0).toUpperCase() + segment.slice(1))
              const isLast = i === segments.length - 1

              return (
                <Fragment key={href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <NotificationDropdown />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
