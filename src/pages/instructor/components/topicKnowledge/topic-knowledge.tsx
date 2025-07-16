import { useState } from "react";
import { TopicKnowledgeComponent } from "./TopicKnowledgeComponent";

import { AddTopicKnowledgeSidebar } from "./AddTopicKnowledgeSidebar";
import { EmbeddedDocumentsComponent } from "../addDocument/ownDocuments/EmbeddedDocumentsComponent";
import { useInstructor } from "@/contexts/InstructorContext";

export default function TopicKnowledge() {
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const { setRightPanel, metaData, setMetaData } = useInstructor();
  const handleSidebarSuccess = () => {
    // Refresh the knowledge component list
    setRefreshDocuments((prev) => prev + 1);
    setRightPanel("topicKnowledgeDetails");
  };
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-3">
        <TopicKnowledgeComponent
          refreshTrigger={refreshDocuments}
          onAddTopicKnowledge={() => setShowAddSidebar(true)}
        />
        <EmbeddedDocumentsComponent refreshTrigger={refreshDocuments} />
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
