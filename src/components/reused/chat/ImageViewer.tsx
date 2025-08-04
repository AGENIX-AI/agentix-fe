import { useEffect } from "react";
import { FullImageModal } from "./FullImageModal";
import { useTranslation } from "react-i18next";

interface ImageViewerProps {
  currentImageUrl: string;
  onClose: () => void;
}

export function ImageViewer({ currentImageUrl, onClose }: ImageViewerProps) {
  const { t } = useTranslation();

  // Reset scale when a new image is shown
  useEffect(() => {
    // No-op for now
  }, [currentImageUrl]);

  return (
    <FullImageModal
      image={{
        id: "viewer",
        url: currentImageUrl,
        file_name:
          currentImageUrl.split("/").pop() || t("chat.image.defaultFileName"),
        content: "",
        summary: "",
        created_at: new Date().toISOString(),
        assistantId: "",
      }}
      isOpen={true}
      onClose={onClose}
    />
  );
}
