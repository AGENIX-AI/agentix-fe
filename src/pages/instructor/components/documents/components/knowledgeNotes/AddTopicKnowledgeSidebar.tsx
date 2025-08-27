import { useState, useCallback } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { createTopicKnowledge, type Framework } from "@/api/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface AddTopicKnowledgeSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  setMetaData: (metaData: any) => void;
  metaData: any;
}

interface FormData {
  title: string;
  language: string;
  framework: Framework;
}

// Custom hook for form state management
const useFormState = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    language: "",
    framework: "FWOH",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = useCallback(
    (field: keyof FormData, value: string | Framework) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      language: "",
      framework: "FWOH",
    });
  }, []);

  const isSubmitDisabled = useCallback(() => {
    return isSubmitting || !formData.title.trim() || !formData.language;
  }, [isSubmitting, formData.title, formData.language]);

  return {
    formData,
    updateFormData,
    isSubmitting,
    setIsSubmitting,
    resetForm,
    isSubmitDisabled,
  };
};

export function AddTopicKnowledgeSidebar({
  isVisible,
  onClose,
  onSuccess,
  setMetaData,
  metaData,
}: AddTopicKnowledgeSidebarProps) {
  const { t } = useTranslation();
  const {
    formData,
    updateFormData,
    isSubmitting,
    setIsSubmitting,
    resetForm,
    isSubmitDisabled,
  } = useFormState();

  const handleSubmit = useCallback(async () => {
    if (!formData.title.trim()) {
      toast.error(t("documents.knowledgeNotes.enterTitle"));
      return;
    }

    if (!formData.language) {
      toast.error(t("documents.knowledgeNotes.selectLanguage"));
      return;
    }

    setIsSubmitting(true);
    try {
      const createResponse = await createTopicKnowledge({
        title: formData.title.trim(),
        language: formData.language,
        framework: formData.framework,
      });

      if (createResponse.page_id) {
        toast.success(t("documents.knowledgeNotes.created"));
        setMetaData({
          ...(metaData || {}),
          currentTopicKnowledgeId: createResponse.page_id,
        });
        handleClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error creating knowledge component:", error);
      toast.error(t("documents.knowledgeNotes.failedToCreate"));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, t, setMetaData, metaData, onSuccess]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Render title input
  const renderTitleInput = () => (
    <div className="space-y-2">
      <Label htmlFor="title" className="text-xs">
        {t("documents.knowledgeNotes.titleLabel")}
      </Label>
      <Input
        id="title"
        value={formData.title}
        onChange={(e) => updateFormData("title", e.target.value)}
        placeholder={t("documents.knowledgeNotes.titlePlaceholder")}
        disabled={isSubmitting}
      />
    </div>
  );

  // Render language selection
  const renderLanguageSelection = () => (
    <div className="space-y-2">
      <Label className="text-xs">
        {t("documents.knowledgeNotes.languageLabel")}
      </Label>
      <Select
        value={formData.language}
        onValueChange={(value) => updateFormData("language", value)}
        disabled={isSubmitting}
      >
        <SelectTrigger className="text-xs">
          <SelectValue
            placeholder={t("documents.knowledgeNotes.languagePlaceholder")}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="English" className="text-xs">
            {t("documents.languages.english")}
          </SelectItem>
          <SelectItem value="Vietnamese" className="text-xs">
            {t("documents.languages.vietnamese")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

      <div className="relative ml-auto app-sidebar-panel bg-background border-l shadow-xl h-full flex flex-col">
        <div className="flex items-center justify-between p-6 border-b h-18">
          <h2 className="text-lg font-semibold">
            {t("documents.knowledgeNotes.addNotes")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-xs"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {renderTitleInput()}
          {renderLanguageSelection()}
        </div>

        <div className="border-t h-16 px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            {t("documents.common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
            className="flex-1 ml-6 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                {t("documents.knowledgeNotes.creating")}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2 text-primary" />
                {t("documents.knowledgeNotes.addCollection")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
