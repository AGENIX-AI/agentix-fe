import { useState, useEffect } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { updateDocumentById, type Document } from "@/api/documents";
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

interface EditDocumentSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  document: Document | null;
}

export function EditDocumentSidebar({
  isVisible,
  onClose,
  onSuccess,
  document,
}: EditDocumentSidebarProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form values when document changes
  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setLanguage(document.language || "");
    }
  }, [document]);

  const handleSubmit = async () => {
    if (!document) return;

    if (!title.trim()) {
      toast.error(t("documents.enterTitle"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateDocumentById(document.id, {
        title: title.trim(),
        language: language || undefined,
      });

      if (response.success) {
        toast.success(t("documents.updated"));
        handleClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error(t("documents.failedToUpdate"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle("");
    setLanguage("");
    onClose();
  };

  const isSubmitDisabled = () => {
    return !title.trim() || isSubmitting;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={isSubmitting ? undefined : handleClose}
      />

      {/* Sidebar */}
      <div className="relative ml-auto w-[400px] bg-background border-l shadow-xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b h-18">
          <h2 className="text-lg font-semibold">
            {t("documents.editDocument")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("documents.title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("documents.enterTitle")}
              disabled={isSubmitting}
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">{t("documents.language")}</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("documents.selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
                <SelectItem value="Korean">Korean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t h-auto px-6 py-4 space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
            className="w-full bg-primary hover:bg-primary/90"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("documents.updating")}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {t("documents.updateDocument")}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full"
            size="sm"
          >
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
