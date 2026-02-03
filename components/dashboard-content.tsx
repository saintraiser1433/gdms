"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  IconReport,
  IconFilePlus,
  IconCheck,
  IconClock,
  IconArrowRight,
  IconFileText,
  IconX,
} from "@tabler/icons-react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

interface ReportStats {
  total: number
  draft: number
  submitted: number
  approved: number
  disapproved: number
}

export function DashboardContent() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
    disapproved: 0,
  })

  const isAdmin = session?.user?.role === "ADMIN"

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/reports")
        if (res.ok) {
          const reports = await res.json()
          setStats({
            total: reports.length,
            draft: reports.filter((r: { status: string }) => r.status === "DRAFT").length,
            submitted: reports.filter((r: { status: string }) => r.status === "SUBMITTED").length,
            approved: reports.filter((r: { status: string }) => r.status === "APPROVED").length,
            disapproved: reports.filter((r: { status: string }) => r.status === "DISAPPROVED").length,
          })
        }
      } catch {
        // ignore
      }
    }
    fetchStats()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:gap-6 lg:p-6">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
              {isAdmin ? "Admin Dashboard" : "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Welcome back, {session?.user?.name}
            </p>
          </div>

          {/* Analytics */}
          <div>
            <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">Analytics</h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardContent className="flex items-center gap-3 py-4 sm:gap-4 sm:pt-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-red-800 to-rose-900 text-white shadow-lg sm:size-12">
                    <IconReport className="size-5 sm:size-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold tabular-nums sm:text-2xl">{stats.total}</p>
                    <p className="text-xs font-medium sm:text-sm">Total Reports</p>
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      All reports in the system
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4 sm:gap-4 sm:pt-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg sm:size-12">
                    <IconFileText className="size-5 sm:size-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold tabular-nums sm:text-2xl">{stats.draft}</p>
                    <p className="text-xs font-medium sm:text-sm">Draft</p>
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      Reports in progress
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4 sm:gap-4 sm:pt-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg sm:size-12">
                    <IconClock className="size-5 sm:size-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold tabular-nums sm:text-2xl">{stats.submitted}</p>
                    <p className="text-xs font-medium sm:text-sm">Pending Review</p>
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      Awaiting approval
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4 sm:gap-4 sm:pt-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg sm:size-12">
                    <IconCheck className="size-5 sm:size-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold tabular-nums sm:text-2xl">{stats.approved}</p>
                    <p className="text-xs font-medium sm:text-sm">Approved</p>
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      Completed reports
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 py-4 sm:gap-4 sm:pt-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg sm:size-12">
                    <IconX className="size-5 sm:size-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold tabular-nums sm:text-2xl">{stats.disapproved}</p>
                    <p className="text-xs font-medium sm:text-sm">Disapproved</p>
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      Rejected reports
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chart */}
          <ChartAreaInteractive />

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                Get started with common actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {!isAdmin && (
                  <Link href="/reports?create=1">
                    <Button
                      variant="outline"
                      className="h-auto w-full justify-start gap-4 p-4"
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconFilePlus className="size-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Create Report</div>
                        <div className="text-xs text-muted-foreground">
                          Start a new community engagement report
                        </div>
                      </div>
                      <IconArrowRight className="ml-auto size-4 text-muted-foreground" />
                    </Button>
                  </Link>
                )}
                <Link href="/reports">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start gap-4 p-4"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconReport className="size-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">View Reports</div>
                      <div className="text-xs text-muted-foreground">
                        Browse and manage your reports
                      </div>
                    </div>
                    <IconArrowRight className="ml-auto size-4 text-muted-foreground" />
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      className="h-auto w-full justify-start gap-4 p-4"
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconCheck className="size-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Review Submissions</div>
                        <div className="text-xs text-muted-foreground">
                          Approve or disapprove pending reports
                        </div>
                      </div>
                      <IconArrowRight className="ml-auto size-4 text-muted-foreground" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
