import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
