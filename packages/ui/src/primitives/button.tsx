import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";
import { cva, type VariantProps } from "../lib/cva";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border border-transparent font-medium tracking-tightish transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg border-accent hover:opacity-90 active:translate-y-px",
        secondary:
          "bg-surface text-fg border-border hover:bg-surface-2 active:translate-y-px",
        ghost: "bg-transparent text-fg hover:bg-surface-2",
        outline:
          "border border-border bg-bg text-fg hover:bg-surface-2 active:translate-y-px",
      },
      size: {
        sm: "h-8 px-[0.85rem] text-[13px]",
        md: "h-10 px-5 text-[14px]",
        lg: "h-12 px-[1.6rem] text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
