import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
