"use client"

import Image from "next/image"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { RiEyeLine, RiSearchLine } from "@remixicon/react"

import schoolLogoImg from "@/app/login/assets/school-logo.png"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CatalogReport {
  id: string
  programName: string
  implementationPeriod?: string
  location?: string
  course: string
  schoolYear: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

interface ReportCatalogGridProps {
  reports: CatalogReport[]
  isLoading: boolean
}

export function ReportCatalogGrid({ reports, isLoading }: ReportCatalogGridProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>("all")

  const filteredReports = useMemo(() => {
    let result = [...reports]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (r) =>
          r.programName.toLowerCase().includes(q) ||
          (r.implementationPeriod ?? "").toLowerCase().includes(q) ||
          (r.location ?? "").toLowerCase().includes(q) ||
          r.course.toLowerCase().includes(q) ||
          r.schoolYear.toLowerCase().includes(q) ||
          (r.createdBy?.name ?? "").toLowerCase().includes(q)
      )
    }
    if (courseFilter && courseFilter !== "all") {
      result = result.filter((r) => r.course === courseFilter)
    }
    if (yearFilter && yearFilter !== "all") {
      result = result.filter((r) => r.schoolYear === yearFilter)
    }
    // Sort by academic year descending, then project name ascending
    result.sort((a, b) => {
      const yearCompare = b.schoolYear.localeCompare(a.schoolYear)
      if (yearCompare !== 0) return yearCompare
      return a.programName.localeCompare(b.programName, undefined, { sensitivity: "base" })
    })
    return result
  }, [reports, search, courseFilter, yearFilter])

  const courses = useMemo(
    () => [...new Set(reports.map((r) => r.course))].filter(Boolean).sort(),
    [reports]
  )
  const years = useMemo(
    () => [...new Set(reports.map((r) => r.schoolYear))].filter(Boolean).sort().reverse(),
    [reports]
  )

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-12 text-center">Loading...</div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 h-16 w-16 relative">
          <Image
            src={schoolLogoImg}
            alt="Glan Institute of Technology"
            width={64}
            height={64}
            className="object-contain opacity-50"
          />
        </div>
        <p className="text-muted-foreground font-medium">No approved reports in catalog</p>
        <p className="text-sm text-muted-foreground mt-1">Approved reports will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-9">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-[160px] h-9">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RiSearchLine className="text-muted-foreground/50 mb-4 h-16 w-16" />
          <p className="text-muted-foreground font-medium">No reports match your filters</p>
          <p className="text-muted-foreground mt-1 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="group overflow-hidden shadow-md transition-shadow hover:shadow-lg"
            >
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30 flex items-center justify-center p-1">
                    <Image
                      src={schoolLogoImg}
                      alt="Glan Institute of Technology"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium line-clamp-2">{report.programName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {report.course} · {report.schoolYear}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t space-y-1.5">
                  {report.implementationPeriod && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Implementation Period:</span>{" "}
                      {report.implementationPeriod}
                    </p>
                  )}
                  {report.location && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Location:</span>{" "}
                      {report.location}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Program Head:</span>{" "}
                    {report.createdBy?.name ?? "—"}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => router.push(`/reports/${report.id}`)}
                  >
                    <RiEyeLine className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
