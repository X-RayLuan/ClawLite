import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "destructive" | "sea" | "coral";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
        {
          "border-stone-300/70 bg-white/40 text-stone-600": variant === "default" || variant === "secondary",
          "border-red-200 bg-red-50 text-red-600": variant === "destructive",
          "border-sea/20 bg-sea/10 text-sea": variant === "sea",
          "border-coral/20 bg-coral/10 text-coral": variant === "coral",
        },
        className
      )}
      {...props}
    />
  );
}
