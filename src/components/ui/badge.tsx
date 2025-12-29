import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
            "border-transparent bg-gov-blue text-white hover:bg-gov-blue/80": variant === "default",
            "border-transparent bg-gov-secondary text-gov-text hover:bg-gov-secondary/80": variant === "secondary",
            "border-transparent bg-red-600 text-white hover:bg-red-600/80": variant === "destructive",
            "border-transparent bg-green-600 text-white hover:bg-green-600/80": variant === "success",
            "border-transparent bg-yellow-600 text-white hover:bg-yellow-600/80": variant === "warning",
            "text-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
