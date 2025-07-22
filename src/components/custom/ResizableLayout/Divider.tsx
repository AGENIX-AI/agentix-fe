import { cn } from "@/lib/utils";

export interface DividerProps {
  leftWidth: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

export function Divider({
  leftWidth,
  onMouseDown,
  onTouchStart,
}: DividerProps) {
  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 md:w-4 md:h-full flex items-center justify-center h-[100vh] bg-foreground"
      )}
      style={{
        left: `${leftWidth}%`,
        transform: "translateX(-50%)",
        cursor: "col-resize",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    ></div>
  );
}
