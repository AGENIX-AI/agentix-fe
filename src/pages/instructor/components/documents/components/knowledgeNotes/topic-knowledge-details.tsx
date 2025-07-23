import { TopicKnowledgeReferenceDocuments } from "./TopicKnowledgeReferenceDocuments";
import { TopicKnowledgeItems } from "./TopicKnowledgeItems";
import { useInstructor } from "@/contexts/InstructorContext";

export default function TopicKnowledgeDetails() {
  const { metaData } = useInstructor();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-3">
        <TopicKnowledgeReferenceDocuments
          topicKnowledgeId={metaData.currentTopicKnowledgeId}
        />
        <TopicKnowledgeItems
          topicKnowledgeId={metaData.currentTopicKnowledgeId}
        />
      </div>
    </div>
  );
}
