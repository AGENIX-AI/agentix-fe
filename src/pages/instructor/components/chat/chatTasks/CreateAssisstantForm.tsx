import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SendIcon, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { eventBus } from "@/lib/utils/event/eventBus";
import { useInstructor } from "@/contexts/InstructorContext";
import { Grid, Item } from "@/components/ui/grid";
import { createAssistant } from "@/api/assistants";
import { useTranslation } from "react-i18next";

export interface CreateAssisstantFormData {
  name: string;
  tagline: string;
  description: string;
  language: string;
}

export interface CreateAssisstantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (formData: CreateAssisstantFormData, characterId?: string) => void;
  taskTitle: string;
}

export function CreateAssisstantForm({
  open,
  onOpenChange,
  taskTitle,
}: CreateAssisstantFormProps) {
  const { t } = useTranslation();
  const { setAssistantId, setConversationId, setRightPanel } = useInstructor();
  const [formData, setFormData] = useState<CreateAssisstantFormData>({
    name: "",
    tagline: "",
    description: "",
    language: "English",
  });
  const [isLoading, setIsLoading] = useState(false);

  const languageOptions: ComboboxOption[] = [
    { value: "Vietnamese", label: "Vietnamese" },
    { value: "English", label: "English" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (value: string) => {
    setFormData((prev) => ({ ...prev, language: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('chat.create_assistant_form.name_required'));
      return;
    }

    try {
      setIsLoading(true);
      setAssistantId(null);
      //   setConversationId(null);

      const response = await createAssistant({
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        language: formData.language,
      });

      setAssistantId(response.assistant_id);
      setConversationId(response.conversation_id);
      setRightPanel("modifyAssisstant");
      // Trigger event to refresh the conversations list
      eventBus.emit("refresh-conversations", {});
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create assistant:", error);
      toast.error(t('chat.create_assistant_form.error_creating'));
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
          <Grid container spacing={2}>
            <Item size={12}>
              <div className="space-y-1">
                <Label className="text-xs">{t('chat.create_assistant_form.name_label')}</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('chat.create_assistant_form.name_placeholder')}
                  className="h-9 text-xs"
                  disabled={isLoading}
                  required
                />
              </div>
            </Item>
            <Item size={12}>
              <div className="space-y-1">
                <Label className="text-xs">{t('chat.create_assistant_form.tagline_label')}</Label>
                <Input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder={t('chat.create_assistant_form.tagline_placeholder')}
                  className="h-9 text-xs"
                  disabled={isLoading}
                />
              </div>
            </Item>
            <Item size={12}>
              <div className="space-y-1">
                <Label className="text-xs">{t('chat.create_assistant_form.description_label')}</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={t('chat.create_assistant_form.description_placeholder')}
                  className="text-xs min-h-[120px] resize-none"
                  disabled={isLoading}
                />
              </div>
            </Item>
            <Item size={12}>
              <div className="space-y-1">
                <Label className="text-xs">{t('chat.create_assistant_form.language_label')}</Label>
                <Combobox
                  options={languageOptions}
                  value={formData.language}
                  onValueChange={handleLanguageChange}
                  placeholder={t('chat.create_assistant_form.language_placeholder')}
                  triggerClassName="h-9 text-xs"
                  disabled={isLoading}
                />
              </div>
            </Item>
          </Grid>
          <Button
            size="icon"
            type="submit"
            className="h-8 w-32 mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                {t('chat.create_assistant_form.creating')}
              </>
            ) : (
              <>
                {t('chat.create_assistant_form.create')}
                <SendIcon className="size-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
