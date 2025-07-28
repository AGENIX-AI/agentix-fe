import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SendIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Small } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";
import { LoadingState } from "@/components/ui/loading-state";

export interface CreateTopicFormData {
  topic: string;
  goal: string;
  problems: string;
  language: string;
}

export interface CreateTopicFormProps {
  onClose: () => void;
  onSubmit: (formData: CreateTopicFormData) => void;
  taskTitle: string;
}

export function CreateTopicForm({ onClose, onSubmit }: CreateTopicFormProps) {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTopicFormData>({
    topic: "",
    goal: "",
    problems: "",
    language: i18n.language === "vi" ? "Vietnamese" : "English",
  });

  const handleSubmit = () => {
    if (isLoading) return;
    setIsLoading(true);
    onSubmit(formData);
  };

  // const languageOptions: ComboboxOption[] = [
  //   { value: "Vietnamese", label: t("language_vi") },
  //   { value: "English", label: t("language_en") },
  // ];

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
      handleSubmit();
    }
  };

  // const handleLanguageChange = (value: string) => {
  //   setFormData((prev) => ({ ...prev, language: value }));
  // };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">{t("chat.create_topic_form.topic")}</Label>
        <Textarea
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={t("chat.create_topic_form.topic_placeholder")}
          className="text-xs min-h-[30px] resize-none"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("chat.create_topic_form.goal")}</Label>
        <Textarea
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={t("chat.create_topic_form.goal_placeholder")}
          className="text-xs min-h-[80px] resize-none"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">
          {t("chat.create_topic_form.problems")}
        </Label>
        <Textarea
          name="problems"
          value={formData.problems}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={t("chat.create_topic_form.problems_placeholder")}
          className="text-xs min-h-[80px] resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="h-8 w-32"
        >
          {t("common.cancel", "Cancel")}
        </Button>
        <Button
          className="h-8 w-32"
          disabled={isLoading}
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {isLoading ? (
            <LoadingState size="small" message="" />
          ) : (
            <>
              <Small>{t("chat.create_topic_form.create")}</Small>
              <SendIcon className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
