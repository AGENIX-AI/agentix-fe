"use client";

import { useState, useEffect } from "react";
import { FullImageModal } from "./FullImageModal";

interface ImageViewerProps {
  imageUrls: string[];
  currentImageUrl: string;
  onClose: () => void;
}

export function ImageViewer({
  imageUrls,
  currentImageUrl,
  onClose,
}: ImageViewerProps) {
  const [scale, setScale] = useState(1);

  // Reset scale when a new image is shown
  useEffect(() => {
    setScale(1);
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
