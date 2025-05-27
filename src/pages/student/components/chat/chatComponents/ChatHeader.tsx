"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlignJustify } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { H2, Small, Muted } from "@/components/ui/typography";

// Create a memoized button component to prevent rerenders
const HistoryToggleButton = memo(
  ({
    isHistoryVisible,
    toggleHistory,
    className,
  }: {
    isHistoryVisible: boolean;
    toggleHistory: () => void;
    className?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`transition-all duration-300 border border-border ${className}`}
          onClick={toggleHistory}
          aria-label={
            isHistoryVisible ? "Hide history panel" : "Show history panel"
          }
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <Small>{isHistoryVisible ? "Hide history" : "Show history"}</Small>
      </TooltipContent>
    </Tooltip>
  )
);

HistoryToggleButton.displayName = "HistoryToggleButton";

interface ChatHeaderProps {
  isHistoryVisible: boolean;
  toggleHistory: () => void;
  disabled?: boolean;
  agentName?: string;
  tagline?: string;
  agentImage?: string;
}

export function ChatHeader({
  isHistoryVisible,
  toggleHistory,
  agentName = "AI Assistant",
  tagline = "Powered by AI",
  agentImage,
}: ChatHeaderProps) {
  return (
    <div className="">
      <div className="flex items-center justify-start h-full">
        <HistoryToggleButton
          isHistoryVisible={isHistoryVisible}
          toggleHistory={toggleHistory}
          className="mr-2"
        />

        <div className="relative w-full flex items-center gap-2 pl-2">
          <Avatar className="h-8 w-8 overflow-hidden flex-shrink-0">
            <AvatarImage src={agentImage} alt={agentName} />
            <AvatarFallback>{agentName[0] || "AI"}</AvatarFallback>
          </Avatar>
          <div className="">
            <H2 className="text-sm font-medium text-foreground">{agentName}</H2>
            <Muted className="text-xs">{tagline}</Muted>
          </div>
        </div>
      </div>
    </div>
  );
}
