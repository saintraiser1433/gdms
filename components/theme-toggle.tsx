"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { RiMoonLine, RiSunLine } from "@remixicon/react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ThemeToggleProps {
  showLabel?: boolean
}

function ThemeToggleInner({ showLabel = false }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={showLabel ? "default" : "icon"} className={showLabel ? "w-full justify-start" : ""}>
          <RiSunLine className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <RiMoonLine className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {showLabel && (
            <span className="ml-2">
              {resolvedTheme === "dark" ? "Dark" : resolvedTheme === "light" ? "Light" : "System"}
            </span>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ThemeToggleClient = dynamic(
  () => Promise.resolve({ default: ThemeToggleInner }),
  { ssr: false }
)

export function ThemeToggle(props: ThemeToggleProps) {
  return (
    <ThemeToggleClient {...props} />
  )
}
