import { useState } from "react";
import { WebDerivedKnowledgeCollectionsComponent } from "./webdeviredKnowledge/WebDerivedKnowledgeCollectionsComponent";
import { AddWebDerivedKnowledgeSidebar } from "./webdeviredKnowledge/WebDerivedKnowledgeSidebar";
import { useInstructor } from "@/contexts/InstructorContext";
import type { Document } from "@/api/documents";
import WebDerivedKnowledgeDetailsView from "./webdeviredKnowledge/WebDerivedKnowledgeDetailsView";

export default function WebDerivedKnowledgeTab() {
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const { metaData, setMetaData } = useInstructor();
  const [selectedCollection, setSelectedCollection] = useState<Document | null>(
    null
  );

  const handleSidebarSuccess = () => {
    // Refresh the web derived knowledge collections list
    setRefreshDocuments((prev) => prev + 1);
    // Close the sidebar to show the updated list
    setShowAddSidebar(false);
    // Don't automatically navigate to details - let user see the updated list
  };

  if (selectedCollection) {
    return (
      <WebDerivedKnowledgeDetailsView
        collection={selectedCollection}
        onBack={() => setSelectedCollection(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <WebDerivedKnowledgeCollectionsComponent
          refreshTrigger={refreshDocuments}
          onAddWebDerivedKnowledge={() => setShowAddSidebar(true)}
          onSelectCollection={(doc) => setSelectedCollection(doc)}
        />
      </div>

      <AddWebDerivedKnowledgeSidebar
        isVisible={showAddSidebar}
        onClose={() => setShowAddSidebar(false)}
        onSuccess={handleSidebarSuccess}
        setMetaData={setMetaData}
        metaData={metaData}
      />
    </div>
  );
}
