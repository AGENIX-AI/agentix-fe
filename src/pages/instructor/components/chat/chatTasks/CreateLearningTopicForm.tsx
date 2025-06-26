import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SendIcon, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { useInstructor } from "@/contexts/InstructorContext";
import { createLearningDiscuss } from "@/api/instructor";
import { useChatContext } from "@/contexts/InstructorChatContext";

export interface CreateLearningTopicFormData {
  topic: string;
  focus_on: string;
}

export interface CreateLearningTopicFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (formData: CreateLearningTopicFormData) => void;
  taskTitle: string;
}

export function CreateLearningTopicForm({
  open,
  onOpenChange,
  taskTitle,
}: CreateLearningTopicFormProps) {
  const { conversationId } = useInstructor();
  const { handleNewMessage } = useChatContext();
  const [formData, setFormData] = useState<CreateLearningTopicFormData>({
    topic: "",
    focus_on: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      toast.error("Topic is required");
      return;
    }

    if (!conversationId) {
      toast.error("No active conversation found");
      return;
    }

    try {
      setIsLoading(true);

      const response = await createLearningDiscuss({
        topics: formData.topic,
        focus_on: formData.focus_on,
        conversation_id: conversationId,
      });

      console.log("Learning discussion created:", response);

      // Handle the new message from the response
      if (response) {
        for (const item of response) {
          handleNewMessage({
            sender: item.sender,
            content: item.new_message,
            invocation_id: item.invocation_id,
          });
        }
      }

      // Success messages
      toast.success("Training topic created successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create training topic:", error);
      toast.error("An error occurred while creating the training topic");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{taskTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Topic</Label>
              <Input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Enter training topic"
                className="h-9 text-xs"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Focus On</Label>
              <Textarea
                name="focus_on"
                value={formData.focus_on}
                onChange={handleChange}
                placeholder="What should this topic focus on?"
                className="text-xs min-h-[120px] resize-none"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-8 w-32"
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-8 w-32" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create
                  <SendIcon className="size-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
