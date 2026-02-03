"use client"

import { useCallback, useState } from "react"
import { RiDeleteBinLine, RiFileLine, RiImageLine } from "@remixicon/react"
import { cn } from "@/lib/utils"

interface KpiFileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
  maxSize?: number
  accept?: string
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPT = "image/*,.pdf,.doc,.docx"

export function KpiFileUpload({
  files,
  onFilesChange,
  disabled = false,
  maxSize = DEFAULT_MAX_SIZE,
  accept = ACCEPT,
}: KpiFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateAndAdd = useCallback(
    (newFiles: File[]) => {
      setError(null)
      const valid: File[] = []
      for (const f of newFiles) {
        if (f.size > maxSize) {
          setError(`${f.name} exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`)
          continue
        }
        valid.push(f)
      }
      if (valid.length) {
        onFilesChange([...files, ...valid])
      }
    },
    [files, maxSize, onFilesChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      const items = Array.from(e.dataTransfer.files)
      validateAndAdd(items)
    },
    [disabled, validateAndAdd]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled) return
      setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const items = Array.from(e.target.files ?? [])
      validateAndAdd(items)
      e.target.value = ""
    },
    [validateAndAdd]
  )

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index))
      setError(null)
    },
    [files, onFilesChange]
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const isImage = (file: File) => file.type.startsWith("image/")

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <RiFileLine className="mb-2 h-10 w-10 text-muted-foreground" />
        <p className="text-center text-sm text-muted-foreground">
          Drag and drop files here, or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Images, PDF, Word docs • Max 10MB each
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded files ({files.length})</p>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm"
              >
                {isImage(file) ? (
                  <RiImageLine className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <RiFileLine className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate max-w-[180px]" title={file.name}>
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatSize(file.size)}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-1 rounded p-0.5 text-destructive hover:bg-destructive/10"
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
