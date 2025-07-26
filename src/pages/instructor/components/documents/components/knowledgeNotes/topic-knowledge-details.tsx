import { TopicKnowledgeItems } from "./TopicKnowledgeItems";
import { useInstructor } from "@/contexts/InstructorContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface TopicKnowledgeDetailsProps {
  setShowDetails: (show: boolean) => void;
}

export default function TopicKnowledgeDetails({
  setShowDetails,
}: TopicKnowledgeDetailsProps) {
  const { metaData } = useInstructor();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(false)}
            className="flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <TopicKnowledgeItems
          topicKnowledgeId={metaData.currentTopicKnowledgeId}
        />
      </div>
    </div>
  );
}
