import { TopicKnowledgeReferenceDocuments } from "./TopicKnowledgeReferenceDocuments";
import { TopicKnowledgeItems } from "./TopicKnowledgeItems";
import { Large } from "@/components/ui/typography";
import { useInstructor } from "@/contexts/InstructorContext";

export default function TopicKnowledgeDetails() {
  const { metaData } = useInstructor();

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-6 flex-shrink-0">
        <Large className="font-bold tracking-tight">Topic Knowledge</Large>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-3">
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
