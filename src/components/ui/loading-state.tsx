import { memo } from "react";
import { Loader2Icon } from "lucide-react";
import { Muted } from "@/components/ui/typography";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export const LoadingState = memo(
  ({
    message = "Loading...",
    size = "medium",
    className = "",
  }: LoadingStateProps) => {
    const sizeClasses = {
      small: "h-6 w-6",
      medium: "h-8 w-8",
      large: "h-10 w-10",
    };

    return (
      <div
        className={`h-full w-full flex flex-col items-center justify-center ${className}`}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2Icon
            className={`${sizeClasses[size]} text-accent animate-spin`}
          />
          {message && <Muted className="text-center">{message}</Muted>}
        </div>
      </div>
    );
  }
);

LoadingState.displayName = "LoadingState";
