import { useState, useCallback } from "react";
import { TopicKnowledgeComponent } from "./knowledgeNotes/TopicKnowledgeComponent";
import { AddTopicKnowledgeSidebar } from "./knowledgeNotes/AddTopicKnowledgeSidebar";
import { useInstructor } from "@/contexts/InstructorContext";

// Types
interface KnowledgeNotesTabProps {
  // Add any props if needed in the future
}

// Custom hook for managing sidebar state
const useSidebarState = () => {
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);

  const handleSidebarSuccess = useCallback(() => {
    setRefreshDocuments((prev) => prev + 1);
    setShowAddSidebar(false);
  }, []);

  const handleAddTopicKnowledge = useCallback(() => {
    setShowAddSidebar(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setShowAddSidebar(false);
  }, []);

  return {
    refreshDocuments,
    showAddSidebar,
    handleSidebarSuccess,
    handleAddTopicKnowledge,
    handleCloseSidebar,
  };
};

export default function KnowledgeNotesTab({}: KnowledgeNotesTabProps) {
  const { metaData, setMetaData } = useInstructor();
  const {
    refreshDocuments,
    showAddSidebar,
    handleSidebarSuccess,
    handleAddTopicKnowledge,
    handleCloseSidebar,
  } = useSidebarState();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <TopicKnowledgeComponent
          refreshTrigger={refreshDocuments}
          onAddTopicKnowledge={handleAddTopicKnowledge}
        />
      </div>

      <AddTopicKnowledgeSidebar
        isVisible={showAddSidebar}
        onClose={handleCloseSidebar}
        onSuccess={handleSidebarSuccess}
        setMetaData={setMetaData}
        metaData={metaData}
      />
    </div>
  );
}
