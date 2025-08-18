import type {
  HelpTopic,
  ContentBlock as ApiContentBlock,
} from "@/api/admin/helpCenter";
import { TopicCreateSidebar } from "./TopicCreateSidebar";
import { TopicEditSidebar } from "./TopicEditSidebar";
import { TopicViewSidebar } from "./TopicViewSidebar";

interface TopicFormSidebarProps {
  isVisible: boolean;
  mode: "create" | "edit" | "view";
  mainId: string;
  topic?: HelpTopic;
  onClose: () => void;
  onSave: (
    mainId: string,
    topic: Partial<HelpTopic> & { title: string; content: ApiContentBlock[] }
  ) => void;
  onEdit?: () => void;
  onDelete?: (topicId: string) => void;
  activeTab?: "student" | "instructor";
}

export function TopicFormSidebar({
  isVisible,
  mode,
  mainId,
  topic,
  onClose,
  onSave,
  onEdit,
  onDelete,
  activeTab = "student",
}: TopicFormSidebarProps) {
  // Route to appropriate component based on mode
  switch (mode) {
    case "create":
      return (
        <TopicCreateSidebar
          isVisible={isVisible}
          mainId={mainId}
          onClose={onClose}
          onSave={onSave}
        />
      );

    case "edit":
      if (!topic) {
        console.error("Topic is required for edit mode");
        return null;
      }
      return (
        <TopicEditSidebar
          isVisible={isVisible}
          mainId={mainId}
          topic={topic}
          onClose={onClose}
          onSave={onSave}
          activeTab={activeTab}
        />
      );

    case "view":
      if (!topic) {
        console.error("Topic is required for view mode");
        return null;
      }
      if (!onEdit || !onDelete) {
        console.error("onEdit and onDelete are required for view mode");
        return null;
      }
      return (
        <TopicViewSidebar
          isVisible={isVisible}
          topic={topic}
          onClose={onClose}
          onEdit={onEdit}
          onDelete={onDelete}
          activeTab={activeTab}
        />
      );

    default:
      console.error(`Unknown mode: ${mode}`);
      return null;
  }
}
