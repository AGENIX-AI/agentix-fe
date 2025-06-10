import * as React from "react";
import { cn } from "@/lib/utils";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  container?: boolean;
  spacing?: 0 | 1 | 2 | 4 | 8;
  children?: React.ReactNode;
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  height?: "full" | "auto";
  children?: React.ReactNode;
}

/**
 * Grid container component that wraps GridItem components
 */
export function Grid({
  container = false,
  spacing = 0,
  className,
  children,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        container && "grid grid-cols-12 w-full",
        spacing === 1 && "gap-1",
        spacing === 2 && "gap-2",
        spacing === 4 && "gap-4",
        spacing === 8 && "gap-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Item component to be used within Grid
 */
export function Item({
  size = 12,
  height = "auto",
  className,
  children,
  ...props
}: GridItemProps) {
  return (
    <div
      className={cn(
        "rounded-lg",
        size === 1 && "col-span-1",
        size === 2 && "col-span-2",
        size === 3 && "col-span-3",
        size === 4 && "col-span-4",
        size === 5 && "col-span-5",
        size === 6 && "col-span-6",
        size === 7 && "col-span-7",
        size === 8 && "col-span-8",
        size === 9 && "col-span-9",
        size === 10 && "col-span-10",
        size === 11 && "col-span-11",
        size === 12 && "col-span-12",
        height === "full" && "h-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
