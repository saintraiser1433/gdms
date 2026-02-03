import ExcelJS from "exceljs"

interface TimeEntry {
  period: string
  periodStartMonth: string
  periodEndMonth: string
  activities: string
  status: string
  statusComment: string | null
  budgetAllocated: number
  budgetSource: string
  budgetSpent: number
  variance: number
}

interface Strategy {
  description: string
  target: string
  timeEntries: TimeEntry[]
}

interface KPI {
  description: string
  strategies: Strategy[]
}

interface Objective {
  title: string
  kpis: KPI[]
}

interface Report {
  programName: string
  implementationPeriod: string
  responsiblePerson: string
  location: string
  course: string
  schoolYear: string
  status: string
  objectives: Objective[]
  createdBy: {
    name: string
  }
}

const thinBorder = {
  top: { style: "thin" as const },
  left: { style: "thin" as const },
  bottom: { style: "thin" as const },
  right: { style: "thin" as const },
}

function getStatusColor(status: string): string | undefined {
  if (!status) return undefined
  const s = status.toLowerCase()
  if (s === "completed" || s === "c") return "90EE90"
  if (s === "not started" || s === "ns") return "FFB6C1"
  if (s === "in progress" || s === "ip") return "ADD8E6"
  if (s === "cancelled" || s === "nc") return "FFA500"
  if (s.includes("not completed")) return "FFFFE0"
  return undefined
}

export async function exportReportToExcel(report: Report): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Report", {
    views: [{ rightToLeft: false }],
  })

  const colWidths = [35, 35, 30, 30, 20, 14, 14, 14, 30, 20, 14, 14, 14, 30, 20, 14, 14, 14]
  worksheet.columns = colWidths.map((w, i) => ({ width: w, key: String(i) }))

  let currentRow = 1

  // Header section - NO merges so values stay visible
  const headerStyle = { font: { bold: true }, border: thinBorder, alignment: { vertical: "middle" as const, wrapText: true } }
  const valueStyle = { border: thinBorder, alignment: { vertical: "middle" as const, wrapText: true } }
  const defaultRowHeight = 22

  worksheet.getCell(currentRow, 1).value = "Program/Project Name:"
  worksheet.getCell(currentRow, 1).style = headerStyle
  worksheet.getCell(currentRow, 2).value = report.programName ?? ""
  worksheet.getCell(currentRow, 2).style = valueStyle
  worksheet.getRow(currentRow).height = defaultRowHeight
  currentRow++

  worksheet.getCell(currentRow, 1).value = "Implementation Period:"
  worksheet.getCell(currentRow, 1).style = headerStyle
  worksheet.getCell(currentRow, 2).value = report.implementationPeriod ?? ""
  worksheet.getCell(currentRow, 2).style = valueStyle
  worksheet.getRow(currentRow).height = defaultRowHeight
  currentRow++

  worksheet.getCell(currentRow, 1).value = "Person/Unit Responsible:"
  worksheet.getCell(currentRow, 1).style = headerStyle
  worksheet.getCell(currentRow, 2).value = report.responsiblePerson ?? ""
  worksheet.getCell(currentRow, 2).style = valueStyle
  worksheet.getRow(currentRow).height = defaultRowHeight
  currentRow++

  worksheet.getCell(currentRow, 1).value = "Location:"
  worksheet.getCell(currentRow, 1).style = headerStyle
  worksheet.getCell(currentRow, 2).value = report.location ?? ""
  worksheet.getCell(currentRow, 2).style = valueStyle
  worksheet.getRow(currentRow).height = defaultRowHeight
  currentRow += 2

  // Process each objective
  report.objectives.forEach((objective, objIndex) => {
    // OBJECTIVE row
    worksheet.mergeCells(currentRow, 1, currentRow, 18)
    const objCell = worksheet.getCell(currentRow, 1)
    objCell.value = `OBJECTIVE/S: ${objIndex + 1}. ${objective.title}`
    objCell.style = {
      font: { bold: true },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } },
      border: thinBorder,
      alignment: { vertical: "middle" as const },
    }
    worksheet.getRow(currentRow).height = 24
    currentRow += 2

    // Table header row 1 - Period headers
    const headerRow1 = currentRow
    const periodLabels = ["T 1 (January - April)", "T 2 (May - August)", "T 3 (September-December)"]
    const lightBlueFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFADD8E6" } }

    worksheet.getCell(headerRow1, 1).value = "KPI"
    worksheet.getCell(headerRow1, 1).style = {
      font: { bold: true },
      fill: lightBlueFill,
      border: thinBorder,
      alignment: { vertical: "middle" as const, wrapText: true },
    }
    worksheet.getCell(headerRow1, 2).value = "Strategies"
    worksheet.getCell(headerRow1, 2).style = {
      font: { bold: true },
      fill: lightBlueFill,
      border: thinBorder,
      alignment: { vertical: "middle" as const, wrapText: true },
    }
    worksheet.getCell(headerRow1, 3).value = "Target"
    worksheet.getCell(headerRow1, 3).style = {
      font: { bold: true },
      fill: lightBlueFill,
      border: thinBorder,
      alignment: { vertical: "middle" as const, wrapText: true },
    }
    for (let p = 0; p < 3; p++) {
      worksheet.mergeCells(headerRow1, 4 + p * 5, headerRow1, 8 + p * 5)
      const cell = worksheet.getCell(headerRow1, 4 + p * 5)
      cell.value = periodLabels[p]
      cell.style = {
        font: { bold: true },
        fill: lightBlueFill,
        border: thinBorder,
        alignment: { horizontal: "center" as const, vertical: "middle" as const },
      }
    }
    worksheet.getRow(headerRow1).height = 24
    currentRow++

    // Table header row 2 - Column headers
    const headerRow2 = currentRow
    const subHeaders = ["Activities", "Status\n(NS/IP/C/NC)", "Budget\nAllocated", "Budget\nSpent", "Variance"]
    for (let p = 0; p < 3; p++) {
      for (let h = 0; h < 5; h++) {
        const col = 4 + p * 5 + h
        const cell = worksheet.getCell(headerRow2, col)
        cell.value = subHeaders[h]
        cell.style = {
          font: { bold: true },
          fill: lightBlueFill,
          border: thinBorder,
          alignment: { horizontal: "center" as const, vertical: "middle" as const, wrapText: true },
        }
      }
    }
    worksheet.getCell(headerRow2, 1).value = ""
    worksheet.getCell(headerRow2, 1).style = { font: { bold: true }, fill: lightBlueFill, border: thinBorder }
    worksheet.getCell(headerRow2, 2).value = ""
    worksheet.getCell(headerRow2, 2).style = { font: { bold: true }, fill: lightBlueFill, border: thinBorder }
    worksheet.getCell(headerRow2, 3).value = ""
    worksheet.getCell(headerRow2, 3).style = { font: { bold: true }, fill: lightBlueFill, border: thinBorder }
    worksheet.getRow(headerRow2).height = 24
    currentRow++

    const totals = {
      t1: { allocated: 0, spent: 0 },
      t2: { allocated: 0, spent: 0 },
      t3: { allocated: 0, spent: 0 },
    }

    // Data rows
    objective.kpis.forEach((kpi, kpiIndex) => {
      const kpiStartRow = currentRow
      kpi.strategies.forEach((strategy, stratIndex) => {
        const row = currentRow

        // KPI
        worksheet.getCell(row, 1).value = stratIndex === 0 ? `KPI ${kpiIndex + 1}. ${kpi.description}` : ""
        worksheet.getCell(row, 1).style = { border: thinBorder, alignment: { vertical: "top" as const, wrapText: true } }

        // Strategies
        worksheet.getCell(row, 2).value = `S${stratIndex + 1}. ${strategy.description}`
        worksheet.getCell(row, 2).style = { border: thinBorder, alignment: { vertical: "top" as const, wrapText: true } }

        // Target
        worksheet.getCell(row, 3).value = strategy.target ?? ""
        worksheet.getCell(row, 3).style = { border: thinBorder, alignment: { vertical: "top" as const, wrapText: true } }

        worksheet.getRow(row).height = 22

        const t1 = strategy.timeEntries.find((e) => e.period === "T1")
        const t2 = strategy.timeEntries.find((e) => e.period === "T2")
        const t3 = strategy.timeEntries.find((e) => e.period === "T3")

        const fillRow = (entry: TimeEntry | undefined, startCol: number, totKey: "t1" | "t2" | "t3") => {
          if (entry) {
            worksheet.getCell(row, startCol).value = entry.activities ?? ""
            worksheet.getCell(row, startCol).style = { border: thinBorder, alignment: { vertical: "top" as const, wrapText: true } }

            const statusCell = worksheet.getCell(row, startCol + 1)
            statusCell.value = entry.status ?? ""
            const statusColor = getStatusColor(entry.status ?? "")
            statusCell.style = {
              border: thinBorder,
              alignment: { horizontal: "center" as const, vertical: "middle" as const, wrapText: true },
              ...(statusColor ? { fill: { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: `FF${statusColor}` } } } : {}),
            }

            worksheet.getCell(row, startCol + 2).value = entry.budgetAllocated ?? 0
            worksheet.getCell(row, startCol + 2).style = { border: thinBorder, alignment: { horizontal: "right" as const }, numFmt: "#,##0" }
            worksheet.getCell(row, startCol + 3).value = entry.budgetSpent ?? 0
            worksheet.getCell(row, startCol + 3).style = { border: thinBorder, alignment: { horizontal: "right" as const }, numFmt: "#,##0" }
            worksheet.getCell(row, startCol + 4).value = entry.variance ?? 0
            worksheet.getCell(row, startCol + 4).style = { border: thinBorder, alignment: { horizontal: "right" as const }, numFmt: "#,##0" }
            totals[totKey].allocated += entry.budgetAllocated ?? 0
            totals[totKey].spent += entry.budgetSpent ?? 0
          } else {
            for (let c = 0; c < 5; c++) {
              const cell = worksheet.getCell(row, startCol + c)
              cell.value = c >= 2 ? 0 : ""
              cell.style = { border: thinBorder, alignment: c >= 2 ? ("right" as const) : ("top" as const), ...(c >= 2 ? { numFmt: "#,##0" } : {}) }
            }
          }
        }

        fillRow(t1, 4, "t1")
        fillRow(t2, 9, "t2")
        fillRow(t3, 14, "t3")

        currentRow++
      })
      const kpiEndRow = currentRow - 1
      if (kpiEndRow > kpiStartRow) {
        worksheet.mergeCells(kpiStartRow, 1, kpiEndRow, 1)
      }
    })

    // TOTALS row
    const totRow = currentRow
    worksheet.getCell(totRow, 1).value = "TOTALS"
    worksheet.getCell(totRow, 1).style = { font: { bold: true }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } }, border: thinBorder }
    worksheet.getCell(totRow, 2).value = ""
    worksheet.getCell(totRow, 2).style = { border: thinBorder }
    worksheet.getCell(totRow, 3).value = ""
    worksheet.getCell(totRow, 3).style = { border: thinBorder }
    worksheet.getCell(totRow, 4).value = ""
    worksheet.getCell(totRow, 4).style = { border: thinBorder }
    worksheet.getCell(totRow, 5).value = ""
    worksheet.getCell(totRow, 5).style = { border: thinBorder }
    worksheet.getCell(totRow, 6).value = totals.t1.allocated
    worksheet.getCell(totRow, 6).style = { font: { bold: true }, border: thinBorder, numFmt: "#,##0" }
    worksheet.getCell(totRow, 7).value = totals.t1.spent
    worksheet.getCell(totRow, 7).style = { font: { bold: true }, border: thinBorder, numFmt: "#,##0" }
    worksheet.getCell(totRow, 8).value = totals.t1.allocated - totals.t1.spent
    worksheet.getCell(totRow, 8).style = { border: thinBorder, numFmt: "#,##0" }
    worksheet.getCell(totRow, 9).value = ""
    worksheet.getCell(totRow, 9).style = { border: thinBorder }
    worksheet.getCell(totRow, 10).value = ""
    worksheet.getCell(totRow, 10).style = { border: thinBorder }
    worksheet.getCell(totRow, 11).value = totals.t2.allocated
    worksheet.getCell(totRow, 11).style = { font: { bold: true }, border: thinBorder, numFmt: "#,##0" }
    worksheet.getCell(totRow, 12).value = totals.t2.spent
    worksheet.getCell(totRow, 12).style = { font: { bold: true }, border: thinBorder, numFmt: "#,##0" }
    worksheet.getCell(totRow, 13).value = totals.t2.allocated - totals.t2.spent
    worksheet.getCell(totRow, 13).style = { border: thinBorder, numFmt: "#,##0" }
    worksheet.getCell(totRow, 14).value = ""
    worksheet.getCell(totRow, 14).style = { border: thinBorder }
    worksheet.getCell(totRow, 15).value = ""
    worksheet.getCell(totRow, 15).style = { border: thinBorder }
    worksheet.getCell(totRow, 16).value = totals.t3.allocated
    worksheet.getCell(totRow, 16).style = { font: { bold: true }, border: thinBorder, numFmt: "#,##0" }
    worksheet.getCell(totRow, 17).value = totals.t3.spent
    worksheet.getCell(totRow, 17).style = { font: { bold: true }, border: thinBorder, numFmt: "#,##0" }
    worksheet.getCell(totRow, 18).value = totals.t3.allocated - totals.t3.spent
    worksheet.getCell(totRow, 18).style = { border: thinBorder, numFmt: "#,##0" }
    worksheet.getRow(totRow).height = defaultRowHeight
    currentRow += 2
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${(report.programName ?? "Report").replace(/[^a-z0-9]/gi, "_")}_${report.schoolYear ?? ""}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
