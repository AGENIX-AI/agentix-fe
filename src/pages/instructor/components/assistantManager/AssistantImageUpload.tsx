import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { uploadAssistantImage } from "@/api/assistants/index";

interface AssistantImageUploadProps {
  label: string;
  currentImageUrl: string;
  onImageUrlChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  assistantName?: string;
}

export function AssistantImageUpload({
  label,
  currentImageUrl,
  onImageUrlChange,
  disabled = false,
  className = "",
  assistantName = "Assistant",
}: AssistantImageUploadProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(
        t(
          "assistant.profile.invalidImageFile",
          "Please select a valid image file"
        )
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        t("assistant.profile.imageTooLarge", "Image size must be less than 5MB")
      );
      return;
    }

    setIsUploading(true);

    try {
      const response = await uploadAssistantImage(file);
      if (response.success) {
        onImageUrlChange(response.image_path);
        toast.success(
          t(
            "assistant.profile.imageUploadSuccess",
            "Image uploaded successfully!"
          )
        );
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        t("assistant.profile.imageUploadFailed", "Failed to upload image")
      );
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onImageUrlChange("");
  };

  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>

      <div className="space-y-3 mt-1">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Clickable Image Preview */}
        <div className="relative">
          <div
            className="cursor-pointer relative group"
            onClick={handleUploadClick}
          >
            <Avatar className="h-32 w-32 border-2">
              <AvatarImage src={currentImageUrl} alt={assistantName} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {assistantName
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2) || "AI"}
              </AvatarFallback>
            </Avatar>

            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="size-6 text-white animate-spin" />
              ) : (
                <Upload className="size-6 text-white" />
              )}
            </div>
          </div>

          {/* Remove Button */}
          {currentImageUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              disabled={disabled}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
