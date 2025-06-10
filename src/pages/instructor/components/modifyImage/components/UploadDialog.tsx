"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ImageData } from "./types";

interface UploadDialogProps {
  image: ImageData;
  isOpen: boolean;
  onClose: () => void;
  onCreateIndex: (description: string) => void;
}

export function UploadDialog({
  image,
  isOpen,
  onClose,
  onCreateIndex,
}: UploadDialogProps) {
  const [description, setDescription] = useState(image.content || "");
  const [isCreatingIndex, setIsCreatingIndex] = useState(false);

  useEffect(() => {
    setDescription(image.content || "");
  }, [image]);

  const handleCreateIndex = async () => {
    if (!image.assistantId) {
      toast.error("Assistant ID is missing");
      return;
    }

    setIsCreatingIndex(true);
    try {
      await onCreateIndex(description);
      onClose();
    } catch (error) {
      console.error("Error creating image index:", error);
      toast.error("Failed to create image index");
    } finally {
      setIsCreatingIndex(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <img
              src={image.url}
              alt={image.file_name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              rows={4}
              placeholder="Describe this image..."
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            aria-label="Cancel image upload"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateIndex}
            disabled={isCreatingIndex || !description.trim()}
            aria-label={
              isCreatingIndex ? "Creating image index..." : "Create image index"
            }
          >
            {isCreatingIndex ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Index
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
