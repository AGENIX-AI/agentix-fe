import { useState } from "react";
import { TopicKnowledgeComponent } from "./TopicKnowledgeComponent";

import { AddTopicKnowledgeSidebar } from "./AddTopicKnowledgeSidebar";
import { Large } from "@/components/ui/typography";
import { EmbeddedDocumentsComponent } from "../addDocument/ownDocuments/EmbeddedDocumentsComponent";

export default function TopicKnowledge() {
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);

  const handleSidebarSuccess = () => {
    // Refresh the topic knowledge list
    setRefreshDocuments((prev) => prev + 1);
  };
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-6 flex-shrink-0">
        <Large className="font-bold tracking-tight">Topic Knowledge</Large>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-3">
        <EmbeddedDocumentsComponent refreshTrigger={refreshDocuments} />
        <TopicKnowledgeComponent
          refreshTrigger={refreshDocuments}
          onAddTopicKnowledge={() => setShowAddSidebar(true)}
        />
      </div>

      <AddTopicKnowledgeSidebar
        isVisible={showAddSidebar}
        onClose={() => setShowAddSidebar(false)}
        onSuccess={handleSidebarSuccess}
      />
    </div>
  );
}
