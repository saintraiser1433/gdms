"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CreateReportForm } from "@/components/create-report-form"

interface CreateReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateReportModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateReportModalProps) {
  const handleSuccess = () => {
    onSuccess?.()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        title="Create New Report"
        className="max-h-[90vh] max-w-4xl flex flex-col p-6 gap-0 overflow-hidden"
      >
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden py-2 gap-0">
          <CreateReportForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
