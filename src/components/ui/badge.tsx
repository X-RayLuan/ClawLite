import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-stone-300/70 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-stone-600",
        className
      )}
      {...props}
    />
  );
}
