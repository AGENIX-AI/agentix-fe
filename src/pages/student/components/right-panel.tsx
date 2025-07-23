import { ProfileInfo } from "./instructorProfile/ProfileInfo";
import { useStudent } from "@/contexts/StudentContext";
import { FollowingPosts } from "./followingPosts/FollowingPosts";
import { AssistantView } from "./assistantProfile/layout";
import { InstructorFinder } from "./instructorFinder/instructor-finder";
import { BuyCredits } from "./buyCredits/BuyCredits";
import { Helps } from "./helps/Helps";
import { Large } from "@/components/ui/typography";
import { memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AlignJustify } from "lucide-react";

const MiniappToggleButton = memo(
  ({
    isExpanded,
    toggleMiniapp,
    className,
  }: {
    isExpanded: boolean;
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
          aria-label={isExpanded ? "Collapse miniapp" : "Expand miniapp"}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {isExpanded ? "Collapse miniapp" : "Expand miniapp"}
      </TooltipContent>
    </Tooltip>
  )
);

MiniappToggleButton.displayName = "MiniappToggleButton";

const RightPanelHeader = ({
  title,
  toggleMiniapp,
}: {
  title: string;
  toggleMiniapp: () => void;
}) => {
  return (
    <header className="sticky top-0 z-20 bg-background flex h-18 border-b border-l p-4 items-center gap-3 w-full pb-5">
      <MiniappToggleButton isExpanded={true} toggleMiniapp={toggleMiniapp} />
      <Large className="font-bold">{title}</Large>
    </header>
  );
};

const CollapsedVerticalBar = ({
  title,
  toggleMiniapp,
}: {
  title: string;
  toggleMiniapp: () => void;
}) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMiniapp();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="w-12 h-full bg-background border-l border-border flex flex-col cursor-pointer hover:bg-accent/30 transition-all duration-200 shadow-sm relative "
          onClick={toggleMiniapp}
        >
          {/* Expand button at top */}
          <div className="p-2 border-b border-border flex justify-center h-18 items-center">
            <Button
              variant="ghost"
              size="icon"
              className={`transition-all duration-300 border border-border`}
              onClick={handleButtonClick}
              aria-label="Expand miniapp"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {/* Vertical title */}
          <div className="flex-1 flex items-center justify-center py-6">
            <div
              className="transform -rotate-90 whitespace-nowrap origin-center text-sm font-medium text-foreground/70 select-none"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(90deg)",
              }}
            >
              {title}
            </div>
          </div>

          {/* Visual indicators */}
          <div className="flex flex-col items-center gap-1 pb-4">
            <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"></div>
          </div>

          {/* Subtle expand hint */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground/50 select-none">
            ◄
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Click to expand {title}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default function RightPanel({
  onToggle,
  isCollapsed = false,
}: {
  onToggle?: (isCollapsed: boolean) => void;
  isCollapsed?: boolean;
}) {
  const { rightPanel } = useStudent();

  const toggleMiniapp = () => {
    // Notify parent to toggle the state
    if (onToggle) {
      onToggle(!isCollapsed); // Toggle the collapsed state
    }
  };

  const getCurrentTitle = () => {
    switch (rightPanel) {
      case "profile_info":
        return "Profile Info";
      case "following_posts":
        return "Following Posts";
      case "assistantTopics":
        return "Assistant Topics";
      case "tasks":
        return "Tasks";
      case "agentCapabilityStatement":
        return "Agent Capability Statement";
      case "findInstructor":
        return "Find Instructor";
      case "buyCredits":
        return "Buy Credits";
      case "helps":
        return "Help Center";
      case "documents":
        return "Documents";
      case "empty":
        return "Home Page";
      default:
        return "Right Panel";
    }
  };

  const currentTitle = getCurrentTitle();

  // Show collapsed vertical bar when collapsed
  if (isCollapsed) {
    return (
      <CollapsedVerticalBar
        title={currentTitle}
        toggleMiniapp={toggleMiniapp}
      />
    );
  }

  // Show expanded panel content
  switch (rightPanel) {
    case "profile_info":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Profile Info"
            toggleMiniapp={toggleMiniapp}
          />
          <ProfileInfo />
        </div>
      );
    case "following_posts":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Following Posts"
            toggleMiniapp={toggleMiniapp}
          />
          <FollowingPosts />
        </div>
      );
    case "assistantTopics":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Assistant Topics"
            toggleMiniapp={toggleMiniapp}
          />
          <AssistantView defaultTab="tasks" />
        </div>
      );
    case "tasks":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title="Tasks" toggleMiniapp={toggleMiniapp} />
          <AssistantView defaultTab="tasks" />
        </div>
      );
    case "agentCapabilityStatement":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Agent Capability Statement"
            toggleMiniapp={toggleMiniapp}
          />
          <AssistantView defaultTab="agentCapabilityStatement" />
        </div>
      );
    case "findInstructor":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Find Instructor"
            toggleMiniapp={toggleMiniapp}
          />
          <InstructorFinder />
        </div>
      );
    case "buyCredits":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title="Buy Credits" toggleMiniapp={toggleMiniapp} />
          <BuyCredits />
        </div>
      );
    case "helps":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title="Help Center" toggleMiniapp={toggleMiniapp} />
          <Helps />
        </div>
      );
    case "empty":
      return (
        <div className="flex flex-col h-full">
          <div className="sticky top-0 z-20 bg-background flex h-18 border-b w-full p-4">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-bold">Home Page</h1>
              <MiniappToggleButton
                isExpanded={true}
                toggleMiniapp={toggleMiniapp}
              />
            </div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center p-5 bg-background border-r border-border">
            <div className="flex items-center justify-center">
              <img
                src="https://api-app.edvara.net/static/Wavy_Tech-12_Single-01.jpg"
                alt="Edvara"
                className="w-240 h-240 object-contain"
              />
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title="Right Panel" toggleMiniapp={toggleMiniapp} />
          <div>RightPanel</div>
        </div>
      );
  }
}
