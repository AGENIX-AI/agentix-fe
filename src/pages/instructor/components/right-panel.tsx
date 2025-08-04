import { ProfileInfo } from "./instructorProfile/ProfileInfo";
import { useInstructor } from "@/contexts/InstructorContext";
import { FollowingPosts } from "./followingPosts/FollowingPosts";
import { AssistantView } from "./assistantProfile/layout";
import ModifyAssistantComponent from "./modifyAssisstant/ModifyAssistantComponent";
import { Dashboard } from "./dashboard/dashboard";
import ReviewDocument from "./reviewDocument/review-document";

import { EditProfile } from "./editProfile/EditProfile";
import { BuyCredits } from "../../../components/reused/buyCredits/BuyCredits";
import { SharingTopics } from "./history/SharingTopics";
import { Helps } from "@/components/reused/helps/Helps";
import { Large } from "@/components/ui/typography";
import { memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AlignJustify } from "lucide-react";
import { DocumentsLayout } from "./documents";
import AssistantManager from "./assistantList/AssistantList";
import AssistantDetailsLayout from "./assistantManagement/AssistantDetailsLayout";
import { BlogsPanel } from "@/components/reused/blogs/BlogsPanel";
import { t } from "i18next";
import {
  fetchHelpMainTopics,
  fetchHelpTopicsByMainId,
  fetchHelpTopic,
} from "@/api/admin/helpCenterInstructor";

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
          className={`transition-all duration-300 border-none ${className}`}
          onClick={toggleMiniapp}
          aria-label={isExpanded ? "Collapse miniapp" : "Expand miniapp"}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
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
  const { rightPanel, metaData } = useInstructor();

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
      case "modifyDocument":
        return "Modify Document";
      case "modifyImageDocument":
        return "Modify Image Document";
      case "modifyAssisstant":
        return "Modify Assistant";
      case "addDocument":
        return "Add Document";
      case "dashboard":
        return "Dashboard";
      case "reviewDocument":
        return "Review Document";
      case "topicKnowledge":
        return "Topic Knowledge";
      case "topicKnowledgeDetails":
        return "Topic Knowledge Details";
      case "editProfile":
        return "Edit Profile";
      case "buyCredits":
        return "Buy Credits";
      case "sharing_topics":
        return "Sharing Topics";
      case "helps":
        return "Help Center";
      case "knowledgeBase":
        return "Knowledge Base";
      case "assistantManager":
        return "Assistant Manager";
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
          <AssistantView page="assistantTopics" />
        </div>
      );
    case "tasks":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title="Tasks" toggleMiniapp={toggleMiniapp} />
          <AssistantView page="tasks" />
        </div>
      );

    case "modifyImageDocument":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Modify Image Document"
            toggleMiniapp={toggleMiniapp}
          />
          <div>Modify Image Document</div>
        </div>
      );
    case "modifyAssisstant":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Modify Assistant"
            toggleMiniapp={toggleMiniapp}
          />
          <ModifyAssistantComponent />
        </div>
      );

    case "dashboard":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title="Dashboard" toggleMiniapp={toggleMiniapp} />
          <Dashboard />
        </div>
      );

    case "reviewDocument":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Review Document"
            toggleMiniapp={toggleMiniapp}
          />
          <ReviewDocument />
        </div>
      );

    case "editProfile":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Edit Profile"
            toggleMiniapp={toggleMiniapp}
          />
          <EditProfile />
        </div>
      );
    case "buyCredits":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title="Buy Credits" toggleMiniapp={toggleMiniapp} />
          <BuyCredits />
        </div>
      );
    case "sharing_topics":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Sharing Topics"
            toggleMiniapp={toggleMiniapp}
          />
          <SharingTopics />
        </div>
      );
    case "helps":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title="Help Center" toggleMiniapp={toggleMiniapp} />
          <Helps
            fetchHelpMainTopics={fetchHelpMainTopics}
            fetchHelpTopicsByMainId={fetchHelpTopicsByMainId}
            fetchHelpTopic={fetchHelpTopic}
          />
        </div>
      );
    case "documents":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Knowledge Base"
            toggleMiniapp={toggleMiniapp}
          />
          <DocumentsLayout defaultTab="documents" />
        </div>
      );
    case "knowledge-notes":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Knowledge Base"
            toggleMiniapp={toggleMiniapp}
          />
          <DocumentsLayout defaultTab="knowledge-notes" />
        </div>
      );
    case "media":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Knowledge Base"
            toggleMiniapp={toggleMiniapp}
          />
          <DocumentsLayout defaultTab="media" />
        </div>
      );
    case "online-sources":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Knowledge Base"
            toggleMiniapp={toggleMiniapp}
          />
          <DocumentsLayout defaultTab="online-sources" />
        </div>
      );
    case "assistantManager":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Assistant Management"
            toggleMiniapp={toggleMiniapp}
          />
          <AssistantManager />
        </div>
      );
    case "assistant-dashboard":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Assistant Details"
            toggleMiniapp={toggleMiniapp}
          />
          <AssistantDetailsLayout
            defaultTab="dashboard"
            assistantId={metaData.assistantId}
          />
        </div>
      );

    case "assistant-profile":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Assistant Details"
            toggleMiniapp={toggleMiniapp}
          />
          <AssistantDetailsLayout
            defaultTab="profile"
            assistantId={metaData.assistantId}
          />
        </div>
      );
    case "assistant-knowledge":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Assistant Details"
            toggleMiniapp={toggleMiniapp}
          />
          <AssistantDetailsLayout
            defaultTab="knowledge"
            assistantId={metaData.assistantId}
          />
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
    default:
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title="Right Panel" toggleMiniapp={toggleMiniapp} />
          <div>RightPanel</div>
        </div>
      );
  }
}
