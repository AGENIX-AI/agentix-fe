import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LinkedinIcon, MessageCircle } from "lucide-react";
import { H6, ExtraSmall } from "@/components/ui/typography";
import { LoadingState } from "@/components/ui/loading-state";
import type { InstructorAssistant } from "@/api/instructor";
import { Button } from "@/components/ui/button";
import { useStudent } from "@/contexts/StudentContext";
import { createFirstConversation } from "@/api/conversations";
import { eventBus } from "@/lib/utils/event/eventBus";
import { useState } from "react";

interface AIAssistantsProps {
  assistants: InstructorAssistant[];
}

export function AIAssistants({ assistants = [] }: AIAssistantsProps) {
  const { setAssistantId, setConversationId, setChatPanel, setRightPanel } =
    useStudent();
  const [loadingAssistantId, setLoadingAssistantId] = useState<string | null>(
    null
  );

  const handleStartChat = async (assistant: InstructorAssistant) => {
    console.log("Starting chat with AI Assistant:", assistant);
    setLoadingAssistantId(assistant.id);
    setAssistantId(assistant.id);

    try {
      const response = await createFirstConversation(assistant.id);
      console.log("Conversation created with ID:", response.conversation_id);
      setConversationId(response.conversation_id);
      setChatPanel("chat");
      setRightPanel("agentCapabilityStatement");

      // Emit reload-history event to refresh the conversation list
      console.log("Emitting reload-history event");
      eventBus.emit("reload-history", {
        assistantId: assistant.id,
        conversationId: response.conversation_id,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setLoadingAssistantId(null);
    }
  };
  return (
    <div className="mt-6">
      <H6>AI Assistants</H6>

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        {assistants.map((assistant) => (
          <div
            key={assistant.id}
            className="relative cursor-pointer"
            onClick={() => handleStartChat(assistant)}
          >
            <div className="flex items-center rounded-md p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    assistant.image ||
                    "https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?semt=ais_hybrid&w=740"
                  }
                  alt={assistant.name}
                />
                <AvatarFallback>
                  {assistant.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="ml-3 flex-1">
                <div className="flex">
                  <ExtraSmall>
                    {assistant.name}{" "}
                    <LinkedinIcon className="inline-block h-3.5 w-3.5 text-primary ml-1" />
                  </ExtraSmall>
                  <ExtraSmall className="ml-1 text-muted-foreground">
                    · AI
                  </ExtraSmall>
                </div>

                <ExtraSmall className="text-muted-foreground line-clamp-1 mt-1">
                  {assistant.tagline}
                </ExtraSmall>
              </div>

              <Button
                size="sm"
                className="flex items-center gap-1 ml-2"
                disabled={loadingAssistantId !== null}
              >
                {loadingAssistantId === assistant.id ? (
                  <div className="h-4 w-4 flex items-center justify-center">
                    <LoadingState size="small" message="" />
                  </div>
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}

        {assistants.length === 0 && (
          <div className="col-span-2 text-center py-4">
            <ExtraSmall className="text-muted-foreground">
              No AI assistants available
            </ExtraSmall>
          </div>
        )}
      </div>
    </div>
  );
}
