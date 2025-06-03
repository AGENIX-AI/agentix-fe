import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // const handleLanguageChange = (value: string) => {
  //   setFormData((prev) => ({ ...prev, language: value }));
  // };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">{t("chat.create_topic_form.topic")}</Label>
        <Input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          placeholder={t("chat.create_topic_form.topic_placeholder")}
          className="h-9 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("chat.create_topic_form.goal")}</Label>
        <Textarea
          name="goal"
          value={formData.goal}
          onChange={handleChange}
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
          placeholder={t("chat.create_topic_form.problems_placeholder")}
          className="text-xs min-h-[80px] resize-none"
        />
      </div>
      {/* <div className="space-y-1">
        <Label className="text-xs">
          {t("chat.create_topic_form.language")}
        </Label>
        <Combobox
          options={languageOptions}
          value={formData.language}
          onValueChange={handleLanguageChange}
          placeholder={t("chat.create_topic_form.language_placeholder")}
          triggerClassName="h-9 text-xs z-100"
        />
      </div> */}{" "}
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="h-8 w-32"
        >
          Cancel
        </Button>
        <Button
          className="h-8 w-32"
          disabled={isLoading}
          onClick={(e) => {
            e.preventDefault();
            setIsLoading(true);
            onSubmit(formData);
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
