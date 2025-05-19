import * as React from "react";
import { cn } from "@/lib/utils";

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "row-reverse" | "col" | "col-reverse";
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
  wrap?: boolean | "reverse";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * Flexible layout component with configurable flex properties
 */
const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ 
    className, 
    direction = "row", 
    justify = "start", 
    align = "start", 
    wrap = false, 
    gap = "none", 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          {
            "flex-row": direction === "row",
            "flex-row-reverse": direction === "row-reverse",
            "flex-col": direction === "col",
            "flex-col-reverse": direction === "col-reverse",
            
            "justify-start": justify === "start",
            "justify-end": justify === "end",
            "justify-center": justify === "center",
            "justify-between": justify === "between",
            "justify-around": justify === "around",
            "justify-evenly": justify === "evenly",
            
            "items-start": align === "start",
            "items-end": align === "end",
            "items-center": align === "center",
            "items-baseline": align === "baseline",
            "items-stretch": align === "stretch",
            
            "flex-wrap": wrap === true,
            "flex-wrap-reverse": wrap === "reverse",
            "flex-nowrap": wrap === false,
            
            "gap-0": gap === "none",
            "gap-1": gap === "xs",
            "gap-2": gap === "sm",
            "gap-4": gap === "md",
            "gap-6": gap === "lg",
            "gap-8": gap === "xl",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Flex.displayName = "Flex";

export { Flex };
