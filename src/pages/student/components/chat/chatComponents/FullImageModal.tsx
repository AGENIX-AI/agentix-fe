"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface FullImageModalProps {
  image: {
    id: string;
    url: string;
    file_name: string;
    content: string;
    summary: string;
    created_at: string;
    assistantId: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function FullImageModal({
  image,
  isOpen,
  onClose,
}: FullImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[90vw] w-[95vw] max-h-[90vh] p-1 overflow-auto bg-background/95">
        <DialogHeader className="absolute top-0 right-0 z-10">
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground bg-background/50 hover:bg-background/70 rounded-full m-2"
              aria-label="Close full image view"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="relative w-full min-h-[80vh] flex items-center justify-center p-8">
          <img
            src={image.url}
            alt={image.file_name}
            className="max-w-full w-auto h-auto object-contain"
            style={{ maxHeight: "calc(90vh - 64px)" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
