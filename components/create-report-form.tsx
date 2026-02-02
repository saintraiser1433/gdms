"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react"

export interface TimeEntry {
  period: "T1" | "T2" | "T3" | "T4"
  periodStartMonth: string
  periodEndMonth: string
  activities: string
  status: string
  statusComment: string
  addStatusComment: boolean
  budgetAllocated: number
  budgetSource: string
  budgetSpent: number
}

export interface Strategy {
  description: string
  target: string
  timeEntries: TimeEntry[]
}

export interface KPI {
  description: string
  strategies: Strategy[]
}

export interface Objective {
  title: string
  kpis: KPI[]
}

const PERIODS: ("T1" | "T2" | "T3" | "T4")[] = ["T1", "T2", "T3", "T4"]

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed", "Cancelled"]

const IMPLEMENTATION_PERIOD_YEARS = Array.from({ length: 91 }, (_, i) =>
  String(2000 + i)
)

const SCHOOL_YEARS = Array.from({ length: 91 }, (_, i) =>
  `${2000 + i}-${2001 + i}`
)

interface CreateReportFormProps {
  reportId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

function mapReportToForm(report: {
  programName: string
  implementationPeriod: string
  responsiblePerson: string
  location: string
  course: string
  schoolYear: string
  objectives?: Array<{
    title: string
    kpis?: Array<{
      description: string
      strategies?: Array<{
        description: string
        target: string
        timeEntries?: Array<{
          period: string
          periodStartMonth: string
          periodEndMonth: string
          activities: string
          status: string
          statusComment: string | null
          budgetAllocated: number
          budgetSource: string
          budgetSpent: number
        }>
      }>
    }>
  }>
}): {
  programName: string
  implementationPeriod: string
  responsiblePerson: string
  location: string
  course: string
  schoolYear: string
  objectives: Objective[]
} {
  const objs = (report.objectives ?? []).sort(
    (a, b) => ((a as { orderIndex?: number }).orderIndex ?? 0) - ((b as { orderIndex?: number }).orderIndex ?? 0)
  )
  return {
    programName: report.programName ?? "",
    implementationPeriod: report.implementationPeriod ?? "",
    responsiblePerson: report.responsiblePerson ?? "",
    location: report.location ?? "",
    course: report.course ?? "",
    schoolYear: report.schoolYear ?? "",
    objectives: objs.map((obj) => ({
      title: obj.title ?? "",
      kpis: (obj.kpis ?? [])
        .sort((a, b) => ((a as { orderIndex?: number }).orderIndex ?? 0) - ((b as { orderIndex?: number }).orderIndex ?? 0))
        .map((kpi) => ({
          description: kpi.description ?? "",
          strategies: (kpi.strategies ?? [])
            .sort((a, b) => ((a as { orderIndex?: number }).orderIndex ?? 0) - ((b as { orderIndex?: number }).orderIndex ?? 0))
            .map((strat) => ({
              description: strat.description ?? "",
              target: strat.target ?? "",
              timeEntries: (strat.timeEntries ?? [])
                .sort((a, b) => PERIODS.indexOf((a.period as "T1") ?? "T1") - PERIODS.indexOf((b.period as "T1") ?? "T1"))
                .map((te) => ({
                  period: (te.period ?? "T1") as "T1" | "T2" | "T3" | "T4",
                  periodStartMonth: te.periodStartMonth ?? "January",
                  periodEndMonth: te.periodEndMonth ?? "December",
                  activities: te.activities ?? "",
                  status: te.status ?? "",
                  statusComment: te.statusComment ?? "",
                  addStatusComment: !!(te.statusComment ?? ""),
                  budgetAllocated: te.budgetAllocated ?? 0,
                  budgetSource: te.budgetSource ?? "",
                  budgetSpent: te.budgetSpent ?? 0,
                })),
            })),
        })),
    })),
  }
}

export function CreateReportForm({ reportId, onSuccess, onCancel }: CreateReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([])

  const [programName, setProgramName] = useState("")
  const [implementationPeriod, setImplementationPeriod] = useState("")
  const [responsiblePerson, setResponsiblePerson] = useState("")
  const [location, setLocation] = useState("")
  const [course, setCourse] = useState("")
  const [schoolYear, setSchoolYear] = useState("")

  const createEmptyTimeEntry = () => ({
    period: "T1" as const,
    periodStartMonth: "January",
    periodEndMonth: "December",
    activities: "",
    status: "",
    statusComment: "",
    addStatusComment: false,
    budgetAllocated: 0,
    budgetSource: "",
    budgetSpent: 0,
  })

  const createEmptyStrategy = () => ({
    description: "",
    target: "",
    timeEntries: [] as TimeEntry[],
  })

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.ok && res.json())
      .then((data) => (Array.isArray(data) ? setCourses(data) : []))
      .catch(() => setCourses([]))
  }, [])

  useEffect(() => {
    if (!reportId) return
    fetch(`/api/reports/${reportId}`)
      .then((res) => res.ok && res.json())
      .then((data) => {
        const mapped = mapReportToForm(data)
        setProgramName(mapped.programName)
        setImplementationPeriod(mapped.implementationPeriod)
        setResponsiblePerson(mapped.responsiblePerson)
        setLocation(mapped.location)
        setCourse(mapped.course)
        setSchoolYear(mapped.schoolYear)
        if (mapped.objectives.length > 0) {
          setObjectives(mapped.objectives)
        }
      })
      .catch(() => toast.error("Failed to load report"))
  }, [reportId])

  useEffect(() => {
    if (!reportId) {
      fetch("/api/users/me")
        .then((res) => res.ok && res.json())
        .then((data) => {
          if (data?.role === "PROGRAM_HEAD") {
            if (data.name) setResponsiblePerson(data.name)
            if (data.course?.name) setCourse(data.course.name)
          }
        })
        .catch(() => {})
    }
  }, [reportId])

  const [objectives, setObjectives] = useState<Objective[]>([
    {
      title: "",
      kpis: [
        {
          description: "",
          strategies: [createEmptyStrategy()],
        },
      ],
    },
  ])

  const addObjective = () => {
    setObjectives([
      ...objectives,
      {
        title: "",
        kpis: [{ description: "", strategies: [createEmptyStrategy()] }],
      },
    ])
  }

  const removeObjective = (objIndex: number) => {
    setObjectives(objectives.filter((_, i) => i !== objIndex))
  }

  const addKPI = (objIndex: number) => {
    const newObjectives = [...objectives]
    newObjectives[objIndex].kpis.push({
      description: "",
      strategies: [createEmptyStrategy()],
    })
    setObjectives(newObjectives)
  }

  const removeKPI = (objIndex: number, kpiIndex: number) => {
    const newObjectives = [...objectives]
    newObjectives[objIndex].kpis = newObjectives[objIndex].kpis.filter(
      (_, i) => i !== kpiIndex
    )
    setObjectives(newObjectives)
  }

  const addTimeEntry = (objIndex: number, kpiIndex: number) => {
    const newObjectives = [...objectives]
    const strategy = newObjectives[objIndex].kpis[kpiIndex].strategies[0]
    const period = PERIODS[Math.min(strategy.timeEntries.length, 3)] ?? "T4"
    strategy.timeEntries.push({
      ...createEmptyTimeEntry(),
      period,
    })
    setObjectives(newObjectives)
  }

  const removeTimeEntry = (
    objIndex: number,
    kpiIndex: number,
    entryIndex: number
  ) => {
    const newObjectives = [...objectives]
    const strategy = newObjectives[objIndex].kpis[kpiIndex].strategies[0]
    strategy.timeEntries = strategy.timeEntries.filter((_, i) => i !== entryIndex)
    setObjectives(newObjectives)
  }

  const updateObjectiveTitle = (objIndex: number, title: string) => {
    const newObjectives = [...objectives]
    newObjectives[objIndex].title = title
    setObjectives(newObjectives)
  }

  const updateKPIDescription = (objIndex: number, kpiIndex: number, description: string) => {
    const newObjectives = [...objectives]
    newObjectives[objIndex].kpis[kpiIndex].description = description
    setObjectives(newObjectives)
  }

  const updateStrategy = (
    objIndex: number,
    kpiIndex: number,
    stratIndex: number,
    field: "description" | "target",
    value: string
  ) => {
    const newObjectives = [...objectives]
    newObjectives[objIndex].kpis[kpiIndex].strategies[stratIndex][field] = value
    setObjectives(newObjectives)
  }

  const updateTimeEntry = (
    objIndex: number,
    kpiIndex: number,
    stratIndex: number,
    entryIndex: number,
    field: keyof TimeEntry,
    value: string | number
  ) => {
    const newObjectives = [...objectives]
    const entry = newObjectives[objIndex].kpis[kpiIndex].strategies[stratIndex].timeEntries[entryIndex]
    ;(entry as Record<string, unknown>)[field] = value
    setObjectives(newObjectives)
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = true) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let courseToSubmit = course
      if (!courseToSubmit) {
        const meRes = await fetch("/api/users/me")
        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData?.course?.name) {
            courseToSubmit = meData.course.name
            setCourse(meData.course.name)
          }
        }
      }
      if (!courseToSubmit) {
        toast.error("Your course is not loaded yet. Please wait a moment and try again.")
        setIsSubmitting(false)
        return
      }

      const normalizedObjectives = objectives.map((obj) => ({
        ...obj,
        kpis: obj.kpis.map((kpi) => ({
          ...kpi,
          strategies: kpi.strategies.map((strat) => ({
            ...strat,
            timeEntries: strat.timeEntries.map((entry, ei) => {
            const { addStatusComment, ...rest } = entry
            return {
              ...rest,
              period: PERIODS[Math.min(ei, 3)] ?? ("T4" as const),
            }
          }),
          })),
        })),
      }))

      const reportData = {
        programName,
        implementationPeriod,
        responsiblePerson,
        location,
        course: courseToSubmit,
        schoolYear,
        objectives: normalizedObjectives,
      }

      const isEdit = !!reportId
      const url = isEdit ? `/api/reports/${reportId}` : "/api/reports"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error ?? "Failed to save report")
      }

      const report = await response.json()

      if (!saveAsDraft) {
        const submitResponse = await fetch(`/api/reports/${report.id}/submit`, {
          method: "POST",
        })

        if (!submitResponse.ok) {
          throw new Error("Failed to submit report")
        }
      }

      toast.success(
        saveAsDraft
          ? isEdit ? "Report updated" : "Report saved as draft"
          : "Report submitted successfully"
      )
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to save report")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEdit = !!reportId

  return (
    <form onSubmit={(e) => handleSubmit(e, true)} className="flex flex-col min-h-0 flex-1">
      <div className="shrink-0 pb-4">
        <h2 className="text-2xl font-bold">{isEdit ? "Edit Report" : "Create New Report"}</h2>
      </div>

      <div className="space-y-6 overflow-y-auto pr-2 flex-1 min-h-0">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="programName">Program/Project Name</Label>
                <Input
                  id="programName"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="implementationPeriod">Implementation Period</Label>
                <Combobox
                  items={IMPLEMENTATION_PERIOD_YEARS}
                  value={implementationPeriod}
                  onValueChange={setImplementationPeriod}
                  required
                >
                  <ComboboxInput
                    id="implementationPeriod"
                    placeholder="Search year (2000-2090)"
                    className="w-full"
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No year found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="responsiblePerson">Person/Unit Responsible</Label>
                <Input
                  id="responsiblePerson"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  required
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={course}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="schoolYear">School Year</Label>
                <Select value={schoolYear} onValueChange={setSchoolYear} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select school year" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_YEARS.map((sy) => (
                      <SelectItem key={sy} value={sy}>
                        {sy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {objectives.map((objective, objIndex) => (
          <Card key={objIndex}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Objective {objIndex + 1}</CardTitle>
                {objectives.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeObjective(objIndex)}
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 w-full">
                <Label>Objective Title</Label>
                <Input
                  value={objective.title}
                  onChange={(e) => updateObjectiveTitle(objIndex, e.target.value)}
                  placeholder="Enter objective title"
                  required
                />
              </div>

              {objective.kpis.map((kpi, kpiIndex) => {
                const strategy = kpi.strategies[0]
                return (
                  <Card key={kpiIndex} className="bg-muted/50">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">KPI {kpiIndex + 1}</CardTitle>
                        {objective.kpis.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeKPI(objIndex, kpiIndex)}
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-2 w-full">
                        <Label>KPI Description</Label>
                        <Textarea
                          value={kpi.description}
                          onChange={(e) => updateKPIDescription(objIndex, kpiIndex, e.target.value)}
                          placeholder="Enter KPI description"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <Label>Strategy Description</Label>
                        <Textarea
                          value={strategy.description}
                          onChange={(e) =>
                            updateStrategy(objIndex, kpiIndex, 0, "description", e.target.value)
                          }
                          placeholder="Enter strategy description"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <Label>Target</Label>
                        <Input
                          value={strategy.target}
                          onChange={(e) =>
                            updateStrategy(objIndex, kpiIndex, 0, "target", e.target.value)
                          }
                          placeholder="Enter target"
                          required
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Timeline Data</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeEntry(objIndex, kpiIndex)}
                          >
                            <RiAddLine className="w-4 h-4 mr-2" />
                            Add Timeline Entry
                          </Button>
                        </div>
                        {strategy.timeEntries.map((entry, entryIndex) => (
                          <Card key={entryIndex} className="p-4 bg-background">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold">Entry {entryIndex + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTimeEntry(objIndex, kpiIndex, entryIndex)}
                              >
                                <RiDeleteBinLine className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-2 w-full">
                                <Label>Month Range (Start)</Label>
                                <Select
                                  value={entry.periodStartMonth}
                                  onValueChange={(v) =>
                                    updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "periodStartMonth", v)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Start month" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {MONTHS.map((m) => (
                                      <SelectItem key={m} value={m}>{m}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex flex-col gap-2 w-full">
                                <Label>Month Range (End)</Label>
                                <Select
                                  value={entry.periodEndMonth}
                                  onValueChange={(v) =>
                                    updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "periodEndMonth", v)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="End month" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {MONTHS.map((m) => (
                                      <SelectItem key={m} value={m}>{m}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2 flex flex-col gap-2 w-full">
                                <Label>Activities</Label>
                                <Textarea
                                  value={entry.activities}
                                  onChange={(e) =>
                                    updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "activities", e.target.value)
                                  }
                                  rows={2}
                                />
                              </div>
                              <div className="flex flex-col gap-2 w-full">
                                <Label>Status</Label>
                                <Select
                                  value={entry.status}
                                  onValueChange={(value) =>
                                    updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "status", value)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUS_OPTIONS.map((s) => (
                                      <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center gap-2 pt-1">
                                  <Checkbox
                                    id={`status-comment-${objIndex}-${kpiIndex}-${entryIndex}`}
                                    checked={entry.addStatusComment}
                                    onCheckedChange={(checked) => {
                                      updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "addStatusComment", !!checked)
                                      if (!checked) {
                                        updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "statusComment", "")
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`status-comment-${objIndex}-${kpiIndex}-${entryIndex}`}
                                    className="text-sm font-normal cursor-pointer"
                                  >
                                    Add comment to status
                                  </Label>
                                </div>
                                {entry.addStatusComment && (
                                  <Textarea
                                    placeholder="Enter status comment..."
                                    value={entry.statusComment}
                                    onChange={(e) =>
                                      updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "statusComment", e.target.value)
                                    }
                                    rows={2}
                                    className="mt-1"
                                  />
                                )}
                              </div>
                              <div className="flex flex-col gap-2 w-full">
                                <Label>Budget Allocated</Label>
                                <Input
                                  type="number"
                                  value={entry.budgetAllocated}
                                  onChange={(e) =>
                                    updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "budgetAllocated", parseFloat(e.target.value) || 0)
                                  }
                                />
                              </div>
                              <div className="flex flex-col gap-2 w-full">
                                <Label>Budget Source</Label>
                                <Input
                                  value={entry.budgetSource}
                                  onChange={(e) =>
                                    updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "budgetSource", e.target.value)
                                  }
                                />
                              </div>
                              <div className="flex flex-col gap-2 w-full">
                                <Label>Budget Spent</Label>
                                <Input
                                  type="number"
                                  value={entry.budgetSpent}
                                  onChange={(e) =>
                                    updateTimeEntry(objIndex, kpiIndex, 0, entryIndex, "budgetSpent", parseFloat(e.target.value) || 0)
                                  }
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <Button type="button" variant="outline" onClick={() => addKPI(objIndex)}>
                <RiAddLine className="w-4 h-4 mr-2" />
                Add KPI
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addObjective}
          className="mb-6"
        >
          <RiAddLine className="w-4 h-4 mr-2" />
          Add Objective
        </Button>
      </div>

      <div className="shrink-0 flex justify-end gap-2 pt-4 mt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="destructive"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          disabled={isSubmitting}
          className="bg-linear-to-r from-red-800 to-rose-900 text-white hover:opacity-90 dark:from-red-700 dark:to-rose-950 dark:text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </form>
  )
}
