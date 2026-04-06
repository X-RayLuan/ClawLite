import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/40 disabled:opacity-60",
          variant === "primary" && "bg-stone-900 text-white hover:bg-stone-800",
          variant === "secondary" && "border border-stone-300/80 bg-transparent text-stone-900 hover:bg-stone-100/50",
          variant === "ghost" && "bg-transparent text-stone-700 hover:bg-stone-200/50",
          size === "sm" && "px-5 py-2.5 text-sm",
          size === "md" && "px-6 py-3 text-sm",
          size === "lg" && "px-6 py-3.5 text-sm sm:text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
