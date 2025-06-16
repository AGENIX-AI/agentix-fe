import { useState, useEffect } from "react";
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
import type { LearningDiscussMessageCard } from "./types";
import { Separator } from "@/components/ui/separator";
import { ExtraSmall, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useInstructor } from "@/contexts/InstructorContext";
import {
  createGenerateTasklistLearning,
  createLearningDiscuss,
} from "@/api/instructor";

interface LearningDiscussCardProps {
  card: LearningDiscussMessageCard;
  className?: string;
  handleNewMessage?: (newMessage: {
    sender: "agent_response" | "user";
    content: string;
    invocation_id: string;
  }) => void;
  onAccept?: (card: LearningDiscussMessageCard) => void;
  onEdit?: (card: LearningDiscussMessageCard) => void;
  onCancel?: () => void;
  invocation_id: string;
}

export function LearningDiscussCard({
  card,
  className,
  handleNewMessage,
  onAccept,
  onEdit,
  onCancel,
  invocation_id,
}: LearningDiscussCardProps) {
  const { setConversationId, conversationId } = useInstructor();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<
    Omit<LearningDiscussMessageCard, "type">
  >({
    topics: card.topics,
    focus_on: card.focus_on,
    language: card.language,
    forward_to_conversation_id: card.forward_to_conversation_id,
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
    if (!conversationId) return;

    try {
      setIsLoading(true);
      const response = await createGenerateTasklistLearning({
        topics: formData.topics,
        focus_on: formData.focus_on,
        conversation_created_id: conversationId,
        invocation_id: invocation_id,
      });

      console.log("Learning discussion created:", response);

      // Handle the new message
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      if (onAccept) {
        onAccept(card);
      }
    } catch (error) {
      console.error("Error creating learning discussion:", error);
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
      const response = await createLearningDiscuss({
        topics: formData.topics,
        focus_on: formData.focus_on,
        conversation_id: conversationId,
      });

      console.log("Learning discussion created:", response);

      // Handle the new message
      if (response.new_message && handleNewMessage) {
        handleNewMessage({
          sender: "agent_response",
          content: response.new_message,
          invocation_id: response.invocation_id || invocation_id,
        });
      }

      setIsEditDialogOpen(false);

      // Update the card if onEdit is provided
      if (onEdit) {
        const updatedCard: LearningDiscussMessageCard = {
          ...card,
          ...formData,
        };
        onEdit(updatedCard);
      }
    } catch (error) {
      console.error("Error creating learning discussion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    // Reset form data to original card values
    setFormData({
      topics: card.topics,
      focus_on: card.focus_on,
      language: card.language,
      forward_to_conversation_id: card.forward_to_conversation_id,
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
        "w-full mb-3 border border-primary/20 rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out font-sans",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div className="p-3 rounded-t-xl">
        <div className="text-primary">
          <div className="flex flex-col gap-1">
            <Small className="font-bold">Learning Discussion</Small>
            {card.language && (
              <ExtraSmall className="text-primary">
                Language: {card.language}
              </ExtraSmall>
            )}
          </div>
          <Separator className="mt-3" />
        </div>
      </div>
      {/* Content */}
      <div className="px-3 pb-3">
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <ExtraSmall className="font-bold text-primary">Topics</ExtraSmall>
            </div>
            <ExtraSmall className="text-xs text-foreground">
              {card.topics}
            </ExtraSmall>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <ExtraSmall className="font-bold text-primary">
                Focus On
              </ExtraSmall>
            </div>
            <ExtraSmall className="text-xs text-foreground">
              {card.focus_on}
            </ExtraSmall>
          </div>
        </div>
        <Separator className="mt-3" />
      </div>

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
      {/* Main Card Component */}
      {cardContent}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Learning Discussion</DialogTitle>
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
              <ExtraSmall className="font-bold">Focus On</ExtraSmall>
              <Textarea
                name="focus_on"
                value={formData.focus_on}
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
