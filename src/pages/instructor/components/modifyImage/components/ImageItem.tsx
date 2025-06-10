import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import type { ImageData } from "./types";
import { FullImageModal } from "./FullImageModal";

interface ImageItemProps {
  image: ImageData;
  onClick: () => void;
}

export function ImageItem({ image, onClick }: ImageItemProps) {
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <>
      {showFullImage && (
        <FullImageModal
          image={image}
          isOpen={showFullImage}
          onClose={() => setShowFullImage(false)}
        />
      )}
      <div className="border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-all duration-200 group cursor-pointer">
        <div className="flex flex-col">
          {/* Image Preview */}
          <div
            className="relative h-40 bg-gray-100 dark:bg-gray-800/50 overflow-hidden"
            onClick={onClick}
          >
            <img
              src={image.url}
              alt={image.file_name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setShowFullImage(true);
              }}
              aria-label="View full image"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {/* Only show the name */}
          <div className="p-3" onClick={onClick}>
            <h3 className="font-medium text-sm truncate text-center">
              {image.content}
            </h3>
          </div>
        </div>
      </div>
    </>
  );
}
