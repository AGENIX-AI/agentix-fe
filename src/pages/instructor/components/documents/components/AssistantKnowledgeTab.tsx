import { useEffect, useState } from "react";
import { getAssistantKnowledge } from "../../../../../api/instructor";
import type { AssistantKnowledgeItem } from "../../../../../api/instructor";
import { Avatar } from "../../../../../components/ui/avatar";
import { Badge } from "../../../../../components/ui/badge";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { Separator } from "../../../../../components/ui/separator";

export function AssistantKnowledgeTab() {
  const [loading, setLoading] = useState(true);
  const [assistants, setAssistants] = useState<AssistantKnowledgeItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssistantKnowledge = async () => {
      try {
        setLoading(true);
        const response = await getAssistantKnowledge();
        setAssistants(response.assistant_knowledge);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch assistant knowledge:", err);
        setError("Failed to load assistant data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssistantKnowledge();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 px-2">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="py-2">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-2.5 w-28" />
                  <Skeleton className="h-2 w-40" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
            {i < 3 && <Separator />}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-2 text-xs text-destructive">{error}</div>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="px-2">
        {assistants.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-4">
            No assistants found
          </div>
        ) : (
          assistants.map((assistant, index) => (
            <div key={assistant.id}>
              <div className="py-2 hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <Avatar className="h-6 w-6">
                    <img src={assistant.image} alt={assistant.name} />
                  </Avatar>
                  <div>
                    <h4 className="text-xs font-medium leading-tight">
                      {assistant.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {assistant.tagline}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">
                  {assistant.description}
                </p>
                {assistant.documents.length > 0 && (
                  <div className="mt-1">
                    <p className="text-[10px] font-medium mb-1">Documents:</p>
                    <div className="flex flex-wrap gap-1">
                      {assistant.documents.map((doc) => (
                        <Badge
                          key={doc.id}
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 h-4"
                        >
                          {doc.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {index < assistants.length - 1 && (
                <Separator className="my-0.5" />
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
