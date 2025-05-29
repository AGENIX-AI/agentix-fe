import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SendIcon, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Small } from "@/components/ui/typography";
import { Grid } from "@/components/layout/grid";
import { Item } from "@radix-ui/react-dropdown-menu";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useTranslation } from "react-i18next";

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

export function CreateTopicForm({
  onClose,
  onSubmit,
  taskTitle,
}: CreateTopicFormProps) {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<CreateTopicFormData>({
    topic: "",
    goal: "",
    problems: "",
    language: i18n.language === "vi" ? "Vietnamese" : "English",
  });

  const languageOptions: ComboboxOption[] = [
    { value: "Vietnamese", label: t("language_vi") },
    { value: "English", label: t("language_en") },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full absolute bottom-[calc(100%+8px)] left-0 z-20 shadow-md border-border p-0">
      <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-red-50 rounded p-0.5">
            <div className="w-full h-full text-red-500 text-xs">🖌️</div>
          </div>
          <CardTitle className="text-sm font-medium">{taskTitle}</CardTitle>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-3">
        <form onSubmit={handleSubmit}>
          <Grid>
            <Item>
              <div className="space-y-1">
                <Label className="text-xs">{t('chat.create_topic_form.topic')}</Label>
                <Input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder={t('chat.create_topic_form.topic_placeholder')}
                  className="h-9 text-xs"
                />
              </div>
            </Item>
            <Item>
              <div className="space-y-1">
                <Label className="text-xs">{t('chat.create_topic_form.goal')}</Label>
                <Textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder={t('chat.create_topic_form.goal_placeholder')}
                  className="text-xs min-h-[80px] resize-none"
                />
              </div>
            </Item>
            <Item>
              <div className="space-y-1">
                <Label className="text-xs">{t('chat.create_topic_form.problems')}</Label>
                <Textarea
                  name="problems"
                  value={formData.problems}
                  onChange={handleChange}
                  placeholder={t('chat.create_topic_form.problems_placeholder')}
                  className="text-xs min-h-[80px] resize-none"
                />
              </div>
            </Item>
            <Item>
              <div className="space-y-1">
                <Label className="text-xs">{t('chat.create_topic_form.language')}</Label>
                <Combobox
                  options={languageOptions}
                  value={formData.language}
                  onValueChange={handleLanguageChange}
                  placeholder={t('chat.create_topic_form.language_placeholder')}
                  triggerClassName="h-9 text-xs"
                />
              </div>
            </Item>
          </Grid>
          <Button
            size="icon"
            type="submit"
            className="h-8 w-32 mt-4"
            onClick={handleSubmit}
          >
            <Small>{t('chat.create_topic_form.create')}</Small>
            <SendIcon className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
