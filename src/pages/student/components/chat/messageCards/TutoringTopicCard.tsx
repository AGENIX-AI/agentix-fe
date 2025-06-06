import { useState, useEffect } from "react";
import type { KeyboardEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
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
}

export function TutoringTopicCard({
  card,
  className,
  handleNewMessage,
  onAccept,
  onEdit,
  onCancel,
}: TutoringTopicCardProps) {
  const { setConversationId, conversationId, assistantId } = useStudent();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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

  useEffect(() => {
    // Trigger fade-in animation on mount
    setIsVisible(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit form when Enter is pressed without Shift key
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
        language: formData.language || "English",
        assistant_id: assistantId,
        conversation_created_id: conversationId || undefined,
      });

      console.log("New topic created:", response);

      // Set the new conversation ID if provided
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

      // Handle the new message
      if (response.new_message && handleNewMessage) {
        handleNewMessage({
          sender: "agent_response",
          content: response.new_message,
        });
      }

      setIsEditDialogOpen(false);

      // Update the card if onEdit is provided
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
    // Reset form data to original card values
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

  const cardContent = (
    <Card
      className={cn(
        "w-full border border-primary/20 rounded-xl from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-sm transition-all duration-300 ease-in-out font-sans",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
    >
      <CardHeader className="rounded-t-xl">
        <CardDescription className="text-xs text-primary">
          <div className="flex flex-col space-y-3">
            <Small className="text-primary font-bold">
              Create Tutoring Topic
            </Small>
            <ExtraSmall className="text-primary">
              {card.language ? `Language: ${card.language}` : ""}
            </ExtraSmall>
          </div>
        </CardDescription>
      </CardHeader>
      <Separator className="" />

      <CardContent>
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-1.5">
              {/* <List className="text-primary h-4 w-4" /> */}
              <ExtraSmall className="font-bold text-primary">Topics</ExtraSmall>
            </div>
            <ExtraSmall className="text-xs">{card.topics}</ExtraSmall>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              {/* <Target className="text-primary h-4 w-4" /> */}
              <ExtraSmall className="font-bold text-primary">Goals</ExtraSmall>
            </div>
            <ExtraSmall className="text-xs">{card.goals}</ExtraSmall>
          </div>

          {card.problems && (
            <>
              <div>
                <div className="flex items-center gap-1.5">
                  {/* <AlertCircle className="text-primary h-4 w-4" /> */}
                  <ExtraSmall className="font-bold text-primary">
                    Problems
                  </ExtraSmall>
                </div>
                <ExtraSmall className="text-xs">{card.problems}</ExtraSmall>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <Separator className="" />

      <CardFooter className="flex justify-end gap-2 px-4">
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
      </CardFooter>
    </Card>
  );

  return (
    <>
      {/* Main Card Component */}
      {cardContent}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Tutoring Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <ExtraSmall className="font-bold">Topics</ExtraSmall>
              <Textarea
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="text-xs min-h-[30px]"
              />
            </div>

            <div className="space-y-2">
              <ExtraSmall className="font-bold">Goals</ExtraSmall>
              <Textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="text-xs min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <ExtraSmall className="font-bold">Problems</ExtraSmall>
              <Textarea
                name="problems"
                value={formData.problems}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="text-xs min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 py-2">
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
