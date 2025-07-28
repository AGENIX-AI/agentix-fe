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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      toast.error(t('chat.learning_topic_form.topic_required'));
      return;
    }

    if (!conversationId) {
      toast.error(t('chat.learning_topic_form.no_conversation'));
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
      toast.success(t('chat.learning_topic_form.success'));
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create training topic:", error);
      toast.error(t('chat.learning_topic_form.error_creating'));
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
              <Label className="text-xs">{t('chat.learning_topic_form.topic_label')}</Label>
              <Input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder={t('chat.learning_topic_form.topic_placeholder')}
                className="h-9 text-xs"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('chat.learning_topic_form.focus_label')}</Label>
              <Textarea
                name="focus_on"
                value={formData.focus_on}
                onChange={handleChange}
                placeholder={t('chat.learning_topic_form.focus_placeholder')}
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
              {t('chat.learning_topic_form.cancel')}
            </Button>
            <Button type="submit" className="h-8 w-32" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {t('chat.learning_topic_form.creating')}
                </>
              ) : (
                <>
                  {t('chat.learning_topic_form.create')}
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
