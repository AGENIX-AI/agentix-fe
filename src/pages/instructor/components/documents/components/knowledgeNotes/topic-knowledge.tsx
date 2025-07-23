import { useState } from "react";
import { TopicKnowledgeComponent } from "./TopicKnowledgeComponent";
import { TopicKnowledgeItems } from "./TopicKnowledgeItems";
import { AddTopicKnowledgeSidebar } from "./AddTopicKnowledgeSidebar";
// import { EmbeddedDocumentsComponent } from "../addDocument/ownDocuments/EmbeddedDocumentsComponent";
import { useInstructor } from "@/contexts/InstructorContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TopicKnowledge() {
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { metaData, setMetaData } = useInstructor();

  const handleSidebarSuccess = () => {
    // Refresh the knowledge component list
    setRefreshDocuments((prev) => prev + 1);
    // Show TopicKnowledgeDetails component
    setShowDetails(true);
  };

  const handleBackClick = () => {
    setShowDetails(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-3">
        {showDetails && metaData.currentTopicKnowledgeId ? (
          <>
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Knowledge Components
              </Button>
            </div>
            <TopicKnowledgeItems
              topicKnowledgeId={metaData.currentTopicKnowledgeId}
            />
          </>
        ) : (
          <TopicKnowledgeComponent
            refreshTrigger={refreshDocuments}
            onAddTopicKnowledge={() => setShowAddSidebar(true)}
          />
        )}
        {/* <EmbeddedDocumentsComponent refreshTrigger={refreshDocuments} /> */}
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
