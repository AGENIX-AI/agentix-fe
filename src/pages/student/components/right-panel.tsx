import { ProfileInfo } from "./instructorProfile/ProfileInfo";
import { useStudent } from "@/contexts/StudentContext";
import { FollowingPosts } from "./followingPosts/FollowingPosts";
import { AssistantView } from "./assistantProfile/layout";
import { useTranslation } from "react-i18next";
import { InstructorFinder } from "./instructorFinder/instructor-finder";
import { BuyCredits } from "./buyCredits/BuyCredits";
import { Helps } from "./helps/Helps";
import { BlogsPanel } from "@/components/reused/blogs/BlogsPanel";
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
  }) => {
    const { t } = useTranslation();
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`transition-all duration-300 border-none ${className}`}
            onClick={toggleMiniapp}
            aria-label={isExpanded ? "Collapse miniapp" : "Expand miniapp"}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {isExpanded
            ? t("student.rightPanel.collapse")
            : t("student.rightPanel.expand")}
        </TooltipContent>
      </Tooltip>
    );
  }
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
  const { t } = useTranslation();
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
              className={`transition-all duration-300 border-none`}
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
        <p>{t("student.rightPanel.clickToExpand", { title })}</p>
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
  const { t } = useTranslation();
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
        return t("student.rightPanel.profileInfo");
      case "following_posts":
        return t("student.rightPanel.followingPosts");
      case "assistantTopics":
        return t("student.rightPanel.assistantTopics");
      case "tasks":
        return t("student.rightPanel.tasks");
      case "agentCapabilityStatement":
        return t("student.rightPanel.agentCapability");
      case "findInstructor":
        return t("student.rightPanel.findInstructor");
      case "buyCredits":
        return t("student.rightPanel.buyCredits");
      case "helps":
        return t("student.rightPanel.helpCenter");
      case "blogs":
        return t("student.rightPanel.blogs");
      case "documents":
        return "Documents";
      case "empty":
        return t("student.rightPanel.homePage");
      default:
        return t("student.rightPanel.rightPanel");
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
            title={t("student.rightPanel.profileInfo")}
            toggleMiniapp={toggleMiniapp}
          />
          <ProfileInfo />
        </div>
      );
    case "following_posts":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title={t("student.rightPanel.followingPosts")}
            toggleMiniapp={toggleMiniapp}
          />
          <FollowingPosts />
        </div>
      );
    case "assistantTopics":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title={t("student.rightPanel.assistantTopics")}
            toggleMiniapp={toggleMiniapp}
          />
          <AssistantView defaultTab="tasks" />
        </div>
      );
    case "tasks":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title={t("student.rightPanel.tasks")}
            toggleMiniapp={toggleMiniapp}
          />
          <AssistantView defaultTab="tasks" />
        </div>
      );
    case "agentCapabilityStatement":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title={t("student.rightPanel.agentCapability")}
            toggleMiniapp={toggleMiniapp}
          />
          <AssistantView defaultTab="agentCapabilityStatement" />
        </div>
      );
    case "findInstructor":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title={t("student.rightPanel.findInstructor")}
            toggleMiniapp={toggleMiniapp}
          />
          <InstructorFinder />
        </div>
      );
    case "buyCredits":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title={t("student.rightPanel.buyCredits")}
            toggleMiniapp={toggleMiniapp}
          />
          <BuyCredits />
        </div>
      );
    case "helps":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title={t("student.rightPanel.helpCenter")}
            toggleMiniapp={toggleMiniapp}
          />
          <Helps />
        </div>
      );
    case "blogs":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title={t("student.rightPanel.blogs")}
            toggleMiniapp={toggleMiniapp}
          />
          <BlogsPanel />
        </div>
      );
    case "empty":
      return (
        <div className="flex flex-col h-full">
          <div className="sticky top-0 z-20 bg-background flex h-18 border-b w-full p-4">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-bold">
                {t("student.rightPanel.homePage")}
              </h1>
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
          <RightPanelHeader
            title={t("student.rightPanel.rightPanel")}
            toggleMiniapp={toggleMiniapp}
          />
          <div>RightPanel</div>
        </div>
      );
  }
}
