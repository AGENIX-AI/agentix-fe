import { ProfileInfo } from "./instructorProfile/ProfileInfo";
import { useInstructor } from "@/contexts/InstructorContext";
import { FollowingPosts } from "./followingPosts/FollowingPosts";
import { AssistantView } from "./assistantProfile/layout";
import ModifyAssistantComponent from "./modifyAssisstant/ModifyAssistantComponent";
import ModifyDocumentComponent from "./modifyDocument/ModifyDocumentComponent";
import AddDocument from "./addDocument/add-document";
import { Dashboard } from "./dashboard/dashboard";
import ReviewDocument from "./reviewDocument/review-document";
import TopicKnowledge from "./topicKnowledge/topic-knowledge";
import TopicKnowledgeDetails from "./topicKnowledge/topic-knowledge-details";
import { EditProfile } from "./editProfile/EditProfile";
import { BuyCredits } from "./buyCredits/BuyCredits";
import { SharingTopics } from "./history/SharingTopics";
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
    <header className="sticky top-0 z-20 bg-background flex h-18 border-b border-l w-full p-4 flex items-center justify-between w-full pb-5">
      <Large className="font-bold">{title}</Large>
      <MiniappToggleButton isExpanded={true} toggleMiniapp={toggleMiniapp} />
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
            <button
              onClick={handleButtonClick}
              className="w-6 h-6 hover:bg-accent rounded transition-colors duration-200 flex items-center justify-center"
              aria-label="Expand miniapp"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
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
  const { rightPanel } = useInstructor();

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
    case "modifyDocument":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Modify Document"
            toggleMiniapp={toggleMiniapp}
          />
          <ModifyDocumentComponent />
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

    case "addDocument":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Add Document"
            toggleMiniapp={toggleMiniapp}
          />
          <AddDocument />
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
    case "topicKnowledge":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Topic Knowledge"
            toggleMiniapp={toggleMiniapp}
          />
          <TopicKnowledge />
        </div>
      );
    case "topicKnowledgeDetails":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader
            title="Topic Knowledge Details"
            toggleMiniapp={toggleMiniapp}
          />
          <TopicKnowledgeDetails />
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
