import { useEffect } from "react";
import { FullImageModal } from "./FullImageModal";

interface ImageViewerProps {
  currentImageUrl: string;
  onClose: () => void;
}

export function ImageViewer({ currentImageUrl, onClose }: ImageViewerProps) {
  // Reset scale when a new image is shown
  useEffect(() => {
    // No-op for now
  }, [currentImageUrl]);

  return (
    <FullImageModal
      image={{
        id: "viewer",
        url: currentImageUrl,
        file_name: currentImageUrl.split("/").pop() || "image",
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
