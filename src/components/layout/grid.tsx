import * as React from "react";
import { cn } from "@/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  colsSm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  colsMd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  colsLg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  colsXl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * Responsive grid layout component with configurable columns and gap
 */
const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols = 1, 
    colsSm, 
    colsMd, 
    colsLg, 
    colsXl, 
    gap = "md", 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          {
            "grid-cols-1": cols === 1,
            "grid-cols-2": cols === 2,
            "grid-cols-3": cols === 3,
            "grid-cols-4": cols === 4,
            "grid-cols-5": cols === 5,
            "grid-cols-6": cols === 6,
            "grid-cols-7": cols === 7,
            "grid-cols-8": cols === 8,
            "grid-cols-9": cols === 9,
            "grid-cols-10": cols === 10,
            "grid-cols-11": cols === 11,
            "grid-cols-12": cols === 12,
            
            "sm:grid-cols-1": colsSm === 1,
            "sm:grid-cols-2": colsSm === 2,
            "sm:grid-cols-3": colsSm === 3,
            "sm:grid-cols-4": colsSm === 4,
            "sm:grid-cols-5": colsSm === 5,
            "sm:grid-cols-6": colsSm === 6,
            "sm:grid-cols-7": colsSm === 7,
            "sm:grid-cols-8": colsSm === 8,
            "sm:grid-cols-9": colsSm === 9,
            "sm:grid-cols-10": colsSm === 10,
            "sm:grid-cols-11": colsSm === 11,
            "sm:grid-cols-12": colsSm === 12,
            
            "md:grid-cols-1": colsMd === 1,
            "md:grid-cols-2": colsMd === 2,
            "md:grid-cols-3": colsMd === 3,
            "md:grid-cols-4": colsMd === 4,
            "md:grid-cols-5": colsMd === 5,
            "md:grid-cols-6": colsMd === 6,
            "md:grid-cols-7": colsMd === 7,
            "md:grid-cols-8": colsMd === 8,
            "md:grid-cols-9": colsMd === 9,
            "md:grid-cols-10": colsMd === 10,
            "md:grid-cols-11": colsMd === 11,
            "md:grid-cols-12": colsMd === 12,
            
            "lg:grid-cols-1": colsLg === 1,
            "lg:grid-cols-2": colsLg === 2,
            "lg:grid-cols-3": colsLg === 3,
            "lg:grid-cols-4": colsLg === 4,
            "lg:grid-cols-5": colsLg === 5,
            "lg:grid-cols-6": colsLg === 6,
            "lg:grid-cols-7": colsLg === 7,
            "lg:grid-cols-8": colsLg === 8,
            "lg:grid-cols-9": colsLg === 9,
            "lg:grid-cols-10": colsLg === 10,
            "lg:grid-cols-11": colsLg === 11,
            "lg:grid-cols-12": colsLg === 12,
            
            "xl:grid-cols-1": colsXl === 1,
            "xl:grid-cols-2": colsXl === 2,
            "xl:grid-cols-3": colsXl === 3,
            "xl:grid-cols-4": colsXl === 4,
            "xl:grid-cols-5": colsXl === 5,
            "xl:grid-cols-6": colsXl === 6,
            "xl:grid-cols-7": colsXl === 7,
            "xl:grid-cols-8": colsXl === 8,
            "xl:grid-cols-9": colsXl === 9,
            "xl:grid-cols-10": colsXl === 10,
            "xl:grid-cols-11": colsXl === 11,
            "xl:grid-cols-12": colsXl === 12,
            
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
Grid.displayName = "Grid";

export { Grid };
