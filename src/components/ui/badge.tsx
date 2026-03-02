import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink",
        className
      )}
      {...props}
    />
  );
}
