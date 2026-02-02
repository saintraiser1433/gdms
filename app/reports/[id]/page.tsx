"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { RiFileExcel2Line, RiPrinterLine } from "@remixicon/react"

interface Report {
  id: string
  programName: string
  implementationPeriod: string
  responsiblePerson: string
  location: string
  course: string
  schoolYear: string
  status: string
  objectives: any[]
  createdBy: any
  submittedAt: string | null
  reviewedAt: string | null
}

export default function ReportViewPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      }
    } catch (error) {
      toast.error("Failed to fetch report")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
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
              <Button onClick={handleExportExcel} variant="default">
                <RiFileExcel2Line className="w-4 h-4 mr-2" />
                Download Excel
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <RiPrinterLine className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button variant="outline" onClick={() => router.push("/reports")}>
                Back
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
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

          {report.objectives.map((objective, objIndex) => (
            <Card key={objective.id}>
              <CardHeader>
                <CardTitle>Objective {objIndex + 1}: {objective.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {objective.kpis.map((kpi: any, kpiIndex: number) => (
                  <div key={kpi.id} className="mb-6">
                    <h3 className="font-semibold mb-3">
                      KPI {kpiIndex + 1}: {kpi.description}
                    </h3>
                    {kpi.strategies.map((strategy: any, stratIndex: number) => (
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
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {strategy.timeEntries.map((entry: any) => (
                                <TableRow key={entry.id} className="border-border">
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
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
