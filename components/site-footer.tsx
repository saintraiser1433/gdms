import { cn } from "@/lib/utils"

interface SiteFooterProps {
  /** When true, footer is offset to not overlap sidebar on desktop */
  withSidebarOffset?: boolean
}

export function SiteFooter({ withSidebarOffset }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        "fixed bottom-0 z-50 border-t border-border bg-background py-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]",
        withSidebarOffset
          ? "left-0 w-full md:left-64 md:w-[calc(100%-16rem)] md:peer-data-[collapsible=icon]/sidebar:left-0 md:peer-data-[collapsible=icon]/sidebar:w-full"
          : "left-0 right-0"
      )}
    >
      <div className="flex items-center justify-center text-sm text-muted-foreground">
        Developed by : Hernan Trillano MIT
      </div>
    </footer>
  )
}
