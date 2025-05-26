"use client";

import { memo, useState } from "react";
import { ChatComponent } from "./chat/chat-component";
import { AlignJustify, SearchIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Small } from "@/components/ui/typography";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStudent } from "@/contexts/StudentContext";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/Logo";
import { HistoryComponent } from "./history/history-component";
import { ModifiedResizableLayout } from "./resizeable-layout";
import { ResizableSidebar } from "./sidebar/resizable-sidebar";

const MiniappToggleButton = memo(
  ({
    isMiniappVisible,
    toggleMiniapp,
    className,
  }: {
    isMiniappVisible: boolean;
    toggleMiniapp: () => void;
    className?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`transition-all duration-300 border border-border ${className}`}
          onClick={toggleMiniapp}
          aria-label={isMiniappVisible ? "Hide miniapp" : "Show miniapp"}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isMiniappVisible ? "Hide miniapp" : "Show miniapp"}
      </TooltipContent>
    </Tooltip>
  )
);

MiniappToggleButton.displayName = "MiniappToggleButton";
export default function LeftPanel({
  selected,
  onSelect,
  isMiniappVisible,
  onMiniappToggle,
}: {
  selected: string;
  onSelect: (key: string) => void;
  isMiniappVisible?: boolean;
  onMiniappToggle?: (isVisible: boolean) => void;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [localMiniappVisible, setLocalMiniappVisible] = useState(true);

  // Try to use AppPageContext if available
  const appPageContext = useStudent();

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Use prop value if provided, otherwise use AppPageContext if available, otherwise use local state
  // const isMinimappVisibleValue =
  //   isMiniappVisible !== undefined
  //     ? isMiniappVisible
  //     : appPageContext
  //     ? appPageContext.isHistoryVisible
  //     : localMiniappVisible;

  const isMinimappVisibleValue = localMiniappVisible;
  const toggleMiniapp = () => {
    const newValue = !isMinimappVisibleValue;
    // Update parent's state if callback is provided
    if (onMiniappToggle) {
      onMiniappToggle(newValue);
    } else if (appPageContext) {
      // If within AppPageContext, use its toggleHistory function
      // appPageContext.toggleHistory();
      console.log("appPageContext.toggleHistory");
    } else {
      // Otherwise, use local state
      setLocalMiniappVisible(newValue);
    }
  };

  const resetState = () => {
    console.log("Resetting state");
    // appPageContext?.setCharacterId(null);
    // appPageContext?.setConversationId(null);
    // appPageContext?.setRightPanel("dashboard");
  };

  return (
    <div className="flex flex-col h-screen max-h-[100vh] overflow-auto">
      <header className="flex h-18 items-center border bg-background z-30 px-3">
        {/* Left section */}
        <div className="flex items-center cursor-pointer" onClick={resetState}>
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 border border-border"
            onClick={toggleSidebar}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
          <Logo className="w-20 h-10" />
        </div>

        {/* Middle section - navigation */}
        <nav className="flex gap-4 text-sm mx-auto font-semibold mt-1">
          <Link to="#" className="text-[#007E85] hover:text-foreground/80">
            <Small>Student</Small>
          </Link>
          <Separator orientation="vertical" className="h-6 w-0.5 p-0" />
          <Link
            to="/app/instructor"
            className="transition-colors hover:text-foreground/80"
          >
            <Small>Instructor</Small>
          </Link>
          <Separator orientation="vertical" className="h-6 w p-0" />
          <Link to="#" className="transition-colors hover:text-foreground/80">
            <Small>Blogs</Small>
          </Link>
          <Separator orientation="vertical" className="h-6 w p-0" />
          <Link to="#" className="transition-colors hover:text-foreground/80">
            <Small>About</Small>
          </Link>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 text-muted-foreground" />
            <Input
              className={`h-8 pl-8 w-full transition-all duration-300 ${
                isMinimappVisibleValue
                  ? "md:w-[12vw] lg:w-[15vw]"
                  : "md:w-[18vw] lg:w-[20vw]"
              }`}
              type="search"
              placeholder="Search"
            />
          </div>
          <MiniappToggleButton
            isMiniappVisible={isMinimappVisibleValue}
            toggleMiniapp={toggleMiniapp}
          />
        </div>
      </header>

      <div className="flex w-full" style={{ height: "calc(100vh - 4.5rem)" }}>
        {/* Layout container with resizable sidebar and content */}
        <div className="flex w-full h-full">
          {/* Sidebar */}
          <ResizableSidebar
            className="bg-transparent h-[calc(100vh-4.5rem)]"
            isCollapsed={isSidebarCollapsed}
          />

          {/* Main content area */}
          <div className="flex-1 h-full overflow-hidden">
            <div className="flex h-full overflow-hidden">
              <ModifiedResizableLayout
                leftPane={<HistoryComponent className="h-full" />}
                rightPane={<ChatComponent />}
                initialLeftWidth={30}
                minLeftWidth={30}
                maxLeftWidth={40}
                storageKey="edvara-history-width"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
