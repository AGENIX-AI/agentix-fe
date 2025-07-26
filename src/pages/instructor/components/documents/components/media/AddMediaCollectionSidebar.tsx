import { useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { createMediaCollection } from "@/api/documents";
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

interface AddMediaCollectionSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  setMetaData: (metaData: any) => void;
  metaData: any;
}

export function AddMediaCollectionSidebar({
  isVisible,
  onClose,
  onSuccess,
  setMetaData,
  metaData,
}: AddMediaCollectionSidebarProps) {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!language) {
      toast.error("Please select a language");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create media collection
      const createResponse = await createMediaCollection({
        title: title.trim(),
        language,
      });

      if (createResponse.document_id) {
        toast.success("Media collection created successfully!");
        setMetaData({
          ...metaData,
          currentMediaCollectionId: createResponse.document_id,
        });
        handleClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error creating media collection:", error);
      toast.error("Failed to create media collection");
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
          <h2 className="text-lg font-semibold">Add Media Collection</h2>
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
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter media collection title"
              disabled={isSubmitting}
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-xs">Language</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isSubmitting}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English" className="text-xs">
                  English
                </SelectItem>
                <SelectItem value="Vietnamese" className="text-xs">
                  Vietnamese
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
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
            className="flex-1 ml-6 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2 text-primary" />
                Create Media Collection
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
