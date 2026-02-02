"use client"

import * as React from "react"
import {
  IconDashboard,
  IconReport,
  IconSchool,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  const isAdmin = session?.user?.role === "ADMIN"

  const navItems = isAdmin
    ? [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconDashboard,
        },
        {
          title: "Reports",
          url: "/admin",
          icon: IconReport,
        },
        {
          title: "Courses",
          url: "/admin/courses",
          icon: IconSchool,
        },
        {
          title: "User Management",
          url: "/admin/users",
          icon: IconUsers,
        },
      ]
    : [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: IconDashboard,
        },
        {
          title: "My Reports",
          url: "/reports",
          icon: IconReport,
        },
      ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="flex h-(--header-height) flex-col gap-0 p-2 pb-0">
        <SidebarMenu className="flex min-h-0 flex-1 flex-col justify-center">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard" className="flex items-center gap-2">
                <img
                  src="/logo/school-logo.png"
                  alt="Logo"
                  className="size-8 rounded-full object-contain"
                />
                <span
                  className="text-base font-semibold bg-[linear-gradient(to_right,var(--foreground)_50%,#800020_50%)] bg-clip-text text-transparent"
                >
                  GIT-DBCES System
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="-mx-2 mt-auto w-[calc(100%+1rem)] shrink-0">
          <Separator orientation="horizontal" className="bg-sidebar-border h-px w-full" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mb-2" />
        <NavUser
          user={{
            name: session?.user?.name || "User",
            email: session?.user?.email || "",
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
