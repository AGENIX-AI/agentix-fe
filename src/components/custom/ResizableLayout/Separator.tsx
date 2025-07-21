import { cn } from "@/lib/utils";

export interface SeparatorProps {
  leftWidth: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  disabled?: boolean;
}

export function Separator({
  leftWidth,
  onMouseDown,
  onTouchStart,
  disabled = false,
}: SeparatorProps) {
  if (disabled) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 md:w-4 w-full h-4 md:h-full flex items-center justify-center z-100"
      )}
      style={{
        left: `${leftWidth}%`,
        transform: "translateX(-50%)",
        cursor: "col-resize",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className={cn("h-full w-px bg-border transition-opacity")} />
    </div>
  );
}
