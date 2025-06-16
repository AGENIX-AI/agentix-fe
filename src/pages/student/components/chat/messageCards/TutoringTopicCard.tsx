import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { TutoringTopicMessageCard } from "./types";
import { Separator } from "@/components/ui/separator";
import { ExtraSmall, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useStudent } from "@/contexts/StudentContext";
import {
  refactorTutoringDiscuss,
  createGenerateTask,
} from "@/api/conversations";

interface TutoringTopicCardProps {
  card: TutoringTopicMessageCard;
  className?: string;
  handleNewMessage?: (newMessage: {
    sender: "agent_response" | "user";
    content: string;
  }) => void;
  onAccept?: (card: TutoringTopicMessageCard) => void;
  onEdit?: (card: TutoringTopicMessageCard) => void;
  onCancel?: () => void;
  invocation_id: string;
}

export function TutoringTopicCard({
  card,
  className,
  handleNewMessage,
  onAccept,
  onEdit,
  onCancel,
  invocation_id,
}: TutoringTopicCardProps) {
  const { setConversationId, conversationId, assistantId } = useStudent();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<
    Omit<TutoringTopicMessageCard, "type">
  >({
    topics: card.topics,
    goals: card.goals,
    problems: card.problems,
    language: card.language,
    callback_conversation_id: card.callback_conversation_id,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  const handleAccept = async () => {
    if (!assistantId) return;

    try {
      setIsLoading(true);
      const response = await createGenerateTask({
        topics: formData.topics,
        goals: formData.goals,
        problems: formData.problems,
        conversation_created_id: conversationId || undefined,
        invocation_id: invocation_id,
      });

      console.log("New topic created:", response);

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      if (onAccept) {
        onAccept(card);
      }
    } catch (error) {
      console.error("Error creating new topic:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!conversationId || isLoading) return;

    try {
      setIsLoading(true);
      const response = await refactorTutoringDiscuss({
        conversation_id: conversationId,
        topics: formData.topics,
        goals: formData.goals,
        problems: formData.problems,
        language: formData.language || "English",
      });

      console.log("Tutoring discussion refactored:", response);

      if (response.new_message && handleNewMessage) {
        handleNewMessage({
          sender: "agent_response",
          content: response.new_message,
        });
      }

      setIsEditDialogOpen(false);

      if (onEdit) {
        const updatedCard: TutoringTopicMessageCard = {
          ...card,
          ...formData,
        };
        onEdit(updatedCard);
      }
    } catch (error) {
      console.error("Error refactoring tutoring discussion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setFormData({
      topics: card.topics,
      goals: card.goals,
      problems: card.problems,
      language: card.language,
      callback_conversation_id: card.callback_conversation_id,
    });
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleForward = (conversationId: string | undefined) => {
    if (conversationId) {
      setConversationId(conversationId);
    }
  };

  const cardContent = (
    <div
      className={cn(
        "w-full border border-border rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out font-sans",
        className
      )}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" } as React.CSSProperties}
    >
      {/* Header */}
      <div className="rounded-t-xl p-3">
        <div className="flex flex-col space-y-1">
          <Small className="text-primary font-bold gap-3">
            Create Tutoring Topic
          </Small>
          <ExtraSmall className="text-muted-foreground">
            {card.language ? `Language: ${card.language}` : ""}
          </ExtraSmall>
        </div>

        <Separator className="mt-3" />
      </div>

      {/* Content */}
      <div className="px-3">
        <div className="space-y-3">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3 ">
              <ExtraSmall className="font-bold text-primary">Topics</ExtraSmall>
            </div>
            <ExtraSmall className="text-xs text-foreground">
              {card.topics}
            </ExtraSmall>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3 ">
              <ExtraSmall className="font-bold text-primary">Goals</ExtraSmall>
            </div>
            <ExtraSmall className="text-xs text-foreground">
              {card.goals}
            </ExtraSmall>
          </div>

          {card.problems && (
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-3 ">
                <ExtraSmall className="font-bold text-primary">
                  Problems
                </ExtraSmall>
              </div>
              <ExtraSmall className="text-xs text-foreground">
                {card.problems}
              </ExtraSmall>
            </div>
          )}
        </div>
        <Separator className="mt-3" />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 p-3">
        {card.forward_to_conversation_id ? (
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              handleForward(card.forward_to_conversation_id);
            }}
            className="text-xs flex-1 max-w-[150px]"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Forward"}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-xs flex-1 max-w-[100px]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="text-xs flex-1 max-w-[100px]"
              disabled={isLoading}
            >
              Edit
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAccept}
              className="text-xs flex-1 max-w-[100px]"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Accept"}
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {cardContent}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Tutoring Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-3">
              <ExtraSmall className="font-bold text-foreground">
                Topics
              </ExtraSmall>
              <Textarea
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="text-xs min-h-[30px]"
              />
            </div>

            <div className="space-y-3">
              <ExtraSmall className="font-bold text-foreground">
                Goals
              </ExtraSmall>
              <Textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="text-xs min-h-[80px]"
              />
            </div>

            <div className="space-y-3">
              <ExtraSmall className="font-bold text-foreground">
                Problems
              </ExtraSmall>
              <Textarea
                name="problems"
                value={formData.problems}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="text-xs min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-3 py-3">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isLoading}
              className="flex-1 max-w-[120px]"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="flex-1 max-w-[120px]"
            >
              {isLoading ? "Processing..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
