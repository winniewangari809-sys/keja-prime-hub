import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-primary/50 bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border border-secondary/50 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border border-destructive/50 bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border border-border hover:bg-muted",
        success: "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        warning: "border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
