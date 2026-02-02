"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconChevronUp,
  IconInbox,
  IconFilePlus,
  IconSearch,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface DataTableColumn<T> {
  id: string
  header: string
  cell: (row: T, rowIndex?: number) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
  getSortValue?: (row: T) => string | number
}

export interface DataTableFilter<T> {
  columnId: string
  label: string
  options: { value: string; label: string }[]
  getValue: (row: T) => string
}

interface DataTableWrapperProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  pageSize?: number
  pageSizeOptions?: number[]
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  emptyMessage?: string
  emptyStateDescription?: string
  emptyStateAction?: React.ReactNode
  showCreateReportButton?: boolean
  onCreateReportClick?: () => void
  searchPlaceholder?: string
  getSearchableText?: (row: T) => string
  filters?: DataTableFilter<T>[]
  className?: string
}

export function DataTableWrapper<T>({
  columns,
  data,
  getRowId,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  emptyMessage = "No results.",
  emptyStateDescription = "Get started by creating a new report",
  emptyStateAction,
  showCreateReportButton = false,
  onCreateReportClick,
  searchPlaceholder = "Search...",
  getSearchableText,
  filters = [],
  className = "",
}: DataTableWrapperProps<T>) {
  const rowsPerPageId = React.useId()
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  })
  const [search, setSearch] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<{
    columnId: string | null
    direction: "asc" | "desc"
  }>({ columnId: null, direction: "asc" })
  const ALL_FILTER_VALUE = "__all__"
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(
    Object.fromEntries(filters.map((f) => [f.columnId, ALL_FILTER_VALUE]))
  )

  const filteredAndSortedData = React.useMemo(() => {
    let result = [...data]

    if (getSearchableText && search.trim()) {
      const query = search.trim().toLowerCase()
      result = result.filter((row) =>
        getSearchableText(row).toLowerCase().includes(query)
      )
    }

    filters.forEach((f) => {
      const val = filterValues[f.columnId]
      if (val && val !== ALL_FILTER_VALUE) {
        result = result.filter((row) => f.getValue(row) === val)
      }
    })

    const sortCol = columns.find((c) => c.id === sortConfig.columnId)
    if (sortConfig.columnId && sortCol?.sortable && sortCol.getSortValue) {
      result = [...result].sort((a, b) => {
        const aVal = sortCol.getSortValue!(a)
        const bVal = sortCol.getSortValue!(b)
        const cmp =
          typeof aVal === "string" && typeof bVal === "string"
            ? aVal.localeCompare(bVal)
            : (aVal as number) - (bVal as number)
        return sortConfig.direction === "asc" ? cmp : -cmp
      })
    }

    return result
  }, [data, search, getSearchableText, filters, filterValues, sortConfig, columns])

  const pageCount = Math.ceil(filteredAndSortedData.length / pagination.pageSize) || 1
  const paginatedData = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    return filteredAndSortedData.slice(start, start + pagination.pageSize)
  }, [filteredAndSortedData, pagination])

  const handleSort = (columnId: string) => {
    const col = columns.find((c) => c.id === columnId)
    if (!col?.sortable || !col.getSortValue) return
    setSortConfig((prev) => ({
      columnId,
      direction:
        prev.columnId === columnId && prev.direction === "asc" ? "desc" : "asc",
    }))
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const handleFilterChange = (columnId: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [columnId]: value }))
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const showSearch = !!getSearchableText
  const showFilters = filters.length > 0

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange(new Set(paginatedData.map(getRowId)))
    } else {
      onSelectionChange(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    onSelectionChange(newSet)
  }

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedIds.has(getRowId(row)))
  const someSelected = paginatedData.some((row) => selectedIds.has(getRowId(row)))

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(showSearch || showFilters) && (
        <div className="flex flex-wrap items-stretch gap-3">
          {showSearch && (
            <div className="relative w-64 shrink-0">
              <IconSearch className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 z-10" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPagination((p) => ({ ...p, pageIndex: 0 }))
                }}
                className="h-9 min-h-9 pl-9 w-full"
              />
            </div>
          )}
          {showFilters &&
            filters.map((f) => (
              <Select
                key={f.columnId}
                value={filterValues[f.columnId] || ALL_FILTER_VALUE}
                onValueChange={(v) => handleFilterChange(f.columnId, v)}
              >
                <SelectTrigger id={`filter-${f.columnId}`} className="h-9 min-h-9 w-64 shrink-0">
                  <SelectValue placeholder={`All ${f.label}`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL_FILTER_VALUE}>All {f.label}</SelectItem>
                    {f.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ))}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {selectable && (
                <TableHead className="w-10 px-1.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    "px-1.5",
                    col.headerClassName || (col.id === "actions" ? "w-10" : ""),
                    col.sortable && "cursor-pointer select-none hover:bg-muted/70"
                  )}
                  onClick={() => col.sortable && col.id !== "actions" && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable &&
                      (sortConfig.columnId === col.id ? (
                        sortConfig.direction === "asc" ? (
                          <IconChevronUp className="text-muted-foreground size-4 shrink-0" />
                        ) : (
                          <IconChevronDown className="text-muted-foreground size-4 shrink-0" />
                        )
                      ) : (
                        <IconChevronDown className="text-muted-foreground size-4 shrink-0 opacity-40" />
                      ))}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((row, idx) => {
                const rowIndex = pagination.pageIndex * pagination.pageSize + idx + 1
                return (
                <TableRow key={getRowId(row)} className="border-b transition-colors hover:bg-muted/30">
                  {selectable && (
                    <TableCell className="w-10 px-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input"
                        checked={selectedIds.has(getRowId(row))}
                        onChange={(e) => handleSelectRow(getRowId(row), e.target.checked)}
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.className}>
                      {col.cell(row, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16"
                >
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                      <IconInbox className="size-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{emptyMessage}</p>
                      {emptyStateDescription && (
                        <p className="text-sm text-muted-foreground">
                          {emptyStateDescription}
                        </p>
                      )}
                    </div>
                    {(emptyStateAction || showCreateReportButton) && (
                      <div className="mt-2">
                        {emptyStateAction ??
                          (onCreateReportClick ? (
                            <Button onClick={onCreateReportClick}>
                              <IconFilePlus className="size-4 mr-2" />
                              Create New Report
                            </Button>
                          ) : (
                            <Button asChild>
                              <Link href="/reports/new">
                                <IconFilePlus className="size-4 mr-2" />
                                Create New Report
                              </Link>
                            </Button>
                          ))}
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-4 border-t px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          {selectable
            ? `${selectedIds.size} of ${filteredAndSortedData.length} row(s) selected.`
            : `${filteredAndSortedData.length} row(s)`}
        </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Label htmlFor={rowsPerPageId} className="text-sm font-medium whitespace-nowrap">
                Rows per page
              </Label>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) =>
                  setPagination((p) => ({ ...p, pageSize: Number(value), pageIndex: 0 }))
                }
              >
                <SelectTrigger id={rowsPerPageId} size="sm" className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm font-medium whitespace-nowrap">
              Page {pagination.pageIndex + 1} of {pageCount}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
                disabled={pagination.pageIndex === 0}
              >
                <IconChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))
                }
                disabled={pagination.pageIndex === 0}
              >
                <IconChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.min(pageCount - 1, p.pageIndex + 1),
                  }))
                }
                disabled={pagination.pageIndex >= pageCount - 1}
              >
                <IconChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPagination((p) => ({ ...p, pageIndex: pageCount - 1 }))}
                disabled={pagination.pageIndex >= pageCount - 1}
              >
                <IconChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </div>
        </div>
    </div>
  )
}
