import { useState } from "react";
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

interface AddTopicKnowledgeSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  setMetaData: (metaData: any) => void;
  metaData: any;
}

export function AddTopicKnowledgeSidebar({
  isVisible,
  onClose,
  onSuccess,
  setMetaData,
  metaData,
}: AddTopicKnowledgeSidebarProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [framework, setFramework] = useState<Framework>("FWOH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error(t("documents.knowledgeNotes.enterTitle"));
      return;
    }

    if (!language) {
      toast.error(t("documents.knowledgeNotes.selectLanguage"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Create knowledge component with framework
      const createResponse = await createTopicKnowledge({
        title: title.trim(),
        language,
        framework,
      });

      if (createResponse.document_id) {
        toast.success(t("documents.knowledgeNotes.created"));
        setMetaData({
          ...metaData,
          currentTopicKnowledgeId: createResponse.document_id,
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
  };

  const handleClose = () => {
    // Reset form
    setTitle("");
    setLanguage("");
    setFramework("FWOH");
    onClose();
  };

  const isSubmitDisabled = () => {
    if (isSubmitting) return true;
    if (!title.trim() || !language) return true;
    return false;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

      {/* Sidebar */}
      <div className="relative ml-auto w-[500px] bg-background border-l shadow-xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b h-18">
          <h2 className="text-lg font-semibold">{t("documents.knowledgeNotes.addNotes")}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-xs"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs">
              {t("documents.knowledgeNotes.titleLabel")}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("documents.knowledgeNotes.titlePlaceholder")}
              disabled={isSubmitting}
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-xs">{t("documents.knowledgeNotes.languageLabel")}</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isSubmitting}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder={t("documents.knowledgeNotes.languagePlaceholder")} />
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
        </div>

        {/* Footer */}
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
