import * as React from "react";
import { cn } from "@/lib/utils";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * VisuallyHidden component that hides content visually but keeps it accessible to screen readers.
 * This follows best practices for accessibility.
 */
export function VisuallyHidden({
  className,
  children,
  ...props
}: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "absolute h-px w-px p-0 overflow-hidden whitespace-nowrap border-0",
        "clip-[rect(0px,0px,0px,0px)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
