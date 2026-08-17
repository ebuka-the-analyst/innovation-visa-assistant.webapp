import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs",
        outline: "border [border-color:var(--badge-outline)] shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function badgeText(node: React.ReactNode): string {
  let text = ""
  React.Children.forEach(node, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      text += ` ${child}`
      return
    }
    if (React.isValidElement(child)) {
      const childProps = child.props as { children?: React.ReactNode }
      text += ` ${badgeText(childProps.children)}`
    }
  })
  return text.trim().replace(/\s+/g, " ").toLowerCase()
}

function semanticStatusClass(children: React.ReactNode): string {
  const label = badgeText(children)

  const isReady =
    label === "ready" ||
    label.startsWith("ready ") ||
    label === "completed" ||
    label.startsWith("completed ") ||
    label === "complete" ||
    label.endsWith(" complete")

  if (isReady) {
    return "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
  }

  const isInProgress =
    label === "in progress" ||
    label.startsWith("in progress ") ||
    label === "in-progress" ||
    label === "pending" ||
    label.startsWith("pending ") ||
    label === "processing" ||
    label.startsWith("processing ")

  if (isInProgress) {
    return "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
  }

  const isNotStarted =
    label === "not started" ||
    label.startsWith("not started ") ||
    label === "not-started" ||
    label === "incomplete" ||
    label === "blocked" ||
    label === "failed" ||
    label.startsWith("failed ")

  if (isNotStarted) {
    return "border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
  }

  return ""
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  const statusClass = semanticStatusClass(children)

  return (
    <div
      className={cn(badgeVariants({ variant }), statusClass, className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
