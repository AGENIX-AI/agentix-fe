
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export function LoadingState({ 
  message = "Loading...", 
  size = "medium", 
  className 
}: LoadingStateProps) {
  const sizeMap = {
    small: "h-4 w-4",
    medium: "h-6 w-6",
    large: "h-8 w-8"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
