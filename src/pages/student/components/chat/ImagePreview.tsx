import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Small } from "@/components/ui/typography";
import { FullImageModal } from "./FullImageModal";
import { useTranslation } from "react-i18next";

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

export function ImagePreview({ imageUrl, onRemove }: ImagePreviewProps) {
  const { t } = useTranslation();
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <>
      {showFullImage && (
        <FullImageModal
          image={{
            id: "preview",
            url: imageUrl,
            file_name: t("chat.image.previewImage", "Preview image"),
            content: "",
            summary: "",
            created_at: new Date().toISOString(),
            assistantId: "",
          }}
          isOpen={showFullImage}
          onClose={() => setShowFullImage(false)}
        />
      )}
      <div className="relative mb-2 rounded-md border border-border p-2">
        <img
          src={imageUrl}
          alt={t("chat.image.pastedImage", "Pasted image")}
          className="max-h-40 rounded-md object-contain cursor-pointer"
          onClick={() => setShowFullImage(true)}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1 h-6 w-6 rounded-full bg-background/80 text-foreground hover:bg-background/90"
          onClick={onRemove}
        >
          <Small className="sr-only">{t("chat.image.removeImage", "Remove image")}</Small>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      </div>
    </>
  );
}
