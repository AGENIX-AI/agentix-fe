import { AlignJustify, ChevronDown, ChevronRight } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HistorySectionProps {
  title: string;
  isExpanded: boolean;
  toggleExpanded: () => void;
  children: ReactNode;
}

export const HistorySection = ({
  title,
  isExpanded,
  toggleExpanded,
  children,
}: HistorySectionProps) => {
  return (
    <div className="mb-3">
      {/* Section Header */}
      <div
        className="flex items-center justify-between hover:bg-accent/30 rounded-md cursor-pointer transition-colors py-1"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium text-xs">{title}</span>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && <div className="ml-1">{children}</div>}
    </div>
  );
};

interface BaseHistoryComponentProps {
  className?: string;
  isHistoryVisible?: boolean;
  toggleHistory?: () => void;
  historyTitle: string;
  collapsedContent: ReactNode;
  expandedSections: ReactNode;
  versionInfo?: string;
  headerRight?: ReactNode;
}

export function BaseHistoryComponent({
  className,
  isHistoryVisible,
  toggleHistory,
  historyTitle,
  collapsedContent,
  expandedSections,
  versionInfo,
  headerRight,
}: BaseHistoryComponentProps) {
  // Collapsed state - show avatars and expand button
  if (!isHistoryVisible) {
    return (
      <div
        className={cn(
          className,
          "border-r border-border w-16 h-full max-w-full overflow-hidden"
        )}
      >
        <div className="bg-background h-full p-4">
          <div className="flex flex-col h-full">
            {/* Header - matching expanded state */}
            <div>
              <div className="flex items-center justify-center pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`transition-all duration-300 border-none ${className}`}
                      onClick={toggleHistory}
                      aria-label={
                        isHistoryVisible ? "Collapse history" : "Expand history"
                      }
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isHistoryVisible ? "Collapse history" : "Expand history"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Navigation section */}
            <div
              className="overflow-y-auto no-scrollbar"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              {collapsedContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded state - show full history component
  return (
    <div
      className={cn(
        className,
        "max-w-full overflow-hidden h-full w-full min-w-0"
      )}
    >
      <div className="bg-background text-sm flex flex-col overflow-hidden h-full pb-2 max-w-full w-full">
        <div className="flex flex-col flex-grow min-h-0 w-full h-full max-w-full">
          {/* Header (fixed 80px) */}
          <div className="w-full max-w-full">
            <div className="h-20 flex items-center justify-between w-full max-w-full px-4">
              <div className="flex items-center gap-2.5">
                {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`transition-all duration-300 border-none ${className}`}
                      onClick={toggleHistory}
                      aria-label={
                        isHistoryVisible ? "Collapse history" : "Expand history"
                      }
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isHistoryVisible ? "Collapse history" : "Expand history"}
                  </TooltipContent>
                </Tooltip> */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[20px] font-semibold leading-none">
                    {historyTitle}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 text-foreground/70"
                    aria-hidden
                  />
                </div>
              </div>
              {/* Right side header actions slot (e.g., count pill, add button) */}
              {headerRight ? (
                <div className="flex items-center gap-2 px-6">
                  {headerRight}
                </div>
              ) : null}
            </div>
            {/* Divider */}
            <div className="h-px w-full bg-border/30" />
          </div>

          {/* Scrollable content area with flex-grow to take available space */}
          <div className="flex-grow overflow-hidden min-h-0 max-w-full">
            <div className="h-full overflow-y-auto overflow-x-hidden px-4 py-2 max-w-full space-y-2">
              {expandedSections}
            </div>
          </div>

          {versionInfo && (
            <div className="text-[10px] text-center">
              <span className="text-[9px] block font-normal text-xs truncate pb-[4px]">
                {versionInfo}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
