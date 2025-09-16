import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:scale-105 active:scale-100",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:shadow-sm",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm",
        secondary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-105 active:scale-100",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-green-600 underline-offset-4 hover:underline hover:text-green-700",
        accent: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 hover:shadow-lg hover:scale-105 active:scale-100",
        hero: "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-100",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-sm",
        lg: "h-14 rounded-lg px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
