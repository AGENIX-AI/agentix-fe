import { useState } from "react";
import { TopicKnowledgeComponent } from "./knowledgeNotes/TopicKnowledgeComponent";

import { AddTopicKnowledgeSidebar } from "./knowledgeNotes/AddTopicKnowledgeSidebar";
// import { EmbeddedDocumentsComponent } from "../addDocument/ownDocuments/EmbeddedDocumentsComponent";
import { useInstructor } from "@/contexts/InstructorContext";
import TopicKnowledgeDetails from "./knowledgeNotes/topic-knowledge-details";

export default function KnowledgeNotesTab() {
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const { metaData, setMetaData } = useInstructor();
  const [showDetails, setShowDetails] = useState(false);
  const handleSidebarSuccess = () => {
    // Refresh the knowledge component list
    setRefreshDocuments((prev) => prev + 1);
    // Close the sidebar to show the updated list
    setShowAddSidebar(false);
    // Don't automatically navigate to details - let user see the updated list
  };

  if (showDetails) {
    return <TopicKnowledgeDetails setShowDetails={setShowDetails} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <TopicKnowledgeComponent
          refreshTrigger={refreshDocuments}
          onAddTopicKnowledge={() => setShowAddSidebar(true)}
          setShowDetails={setShowDetails}
        />
      </div>

      <AddTopicKnowledgeSidebar
        isVisible={showAddSidebar}
        onClose={() => setShowAddSidebar(false)}
        onSuccess={handleSidebarSuccess}
        setMetaData={setMetaData}
        metaData={metaData}
      />
    </div>
  );
}
