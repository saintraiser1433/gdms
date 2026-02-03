export interface TimeEntryInput {
  period?: string
  periodStartMonth?: string
  periodEndMonth?: string
  activities?: string
  status?: string
  statusComment?: string | null
  budgetAllocated?: number
  budgetSource?: string
  budgetSpent?: number
}

export interface StrategyInput {
  description?: string
  target?: string
  timeEntries?: TimeEntryInput[]
}

export interface KpiInput {
  description?: string
  strategies?: StrategyInput[]
}

export interface ObjectiveInput {
  title?: string
  kpis?: KpiInput[]
}
