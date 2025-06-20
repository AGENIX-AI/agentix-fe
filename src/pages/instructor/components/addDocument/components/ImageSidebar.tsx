import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import ImageGrid from "./ImageGrid";
import ImageSubmissionButtons from "./ImageSubmissionButtons";

interface ImageSidebarProps {
  isVisible: boolean;
  images: string[];
  selectedImages: string[];
  isLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onImageSelect: (imagePath: string) => void;
  onSelectAll: () => void;
  onSubmitAll: () => void;
  onSubmitSelected: () => void;
}

export default function ImageSidebar({
  isVisible,
  images,
  selectedImages,
  isLoading,
  isSubmitting,
  onClose,
  onImageSelect,
  onSelectAll,
  onSubmitAll,
  onSubmitSelected,
}: ImageSidebarProps) {
  return (
    <div
      className={`fixed top-0 right-0 h-screen border-l overflow-auto flex flex-col z-30 transition-transform duration-300 ease-in-out bg-background ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ width: "700px" }}
    >
      <div className="sticky top-0 z-20 bg-background flex items-center justify-between h-18 border-b w-full px-6 py-3">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-bold">Document Images</h3>
          {images.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedImages.length === images.length && images.length > 0
                }
                onCheckedChange={onSelectAll}
              />
              <Label htmlFor="select-all" className="text-xs">
                Select All ({selectedImages.length}/{images.length})
              </Label>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X size={16} />
        </Button>
      </div>

      <div className="flex flex-col h-full">
        <div className="px-6 py-3 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                Loading document images...
              </p>
            </div>
          ) : images.length > 0 ? (
            <ImageGrid
              images={images}
              selectedImages={selectedImages}
              onImageSelect={onImageSelect}
            />
          ) : (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs text-muted-foreground">
                No images found for this document
              </p>
            </div>
          )}
        </div>

        {images.length > 0 && (
          <ImageSubmissionButtons
            selectedCount={selectedImages.length}
            totalCount={images.length}
            isSubmitting={isSubmitting}
            onSubmitAll={onSubmitAll}
            onSubmitSelected={onSubmitSelected}
          />
        )}
      </div>
    </div>
  );
}
