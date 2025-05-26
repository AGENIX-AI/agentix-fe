"use client";
import { cn } from "@/lib/utils";

export interface DividerProps {
  leftWidth: number;
  isDragging: boolean;
  isHovering: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function Divider({
  leftWidth,
  isDragging,
  isHovering,
  onMouseDown,
  onTouchStart,
  onMouseEnter,
  onMouseLeave,
}: DividerProps) {
  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 md:w-4 w-full h-4 md:h-full flex items-center justify-center z-10 ml-2"
      )}
      style={{
        left: `${leftWidth}%`,
        transform: "translateX(-50%)",
        cursor: "col-resize",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    ></div>
  );
}
