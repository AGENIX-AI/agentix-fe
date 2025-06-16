import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Document } from "@/api/documents";

interface DocumentViewerDialogProps {
  document: Document;
  trigger: React.ReactNode;
}

export function DocumentViewerDialog({
  document,
  trigger,
}: DocumentViewerDialogProps) {
  const renderContent = () => {
    const fileUrl = document.url;
    const fileType = document.type;
    const fileName = document.file_name || document.title;

    if (fileType === "image") {
      return (
        <div className="flex justify-center">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      );
    } else {
      // For PDF, DOCX, and other document types
      const fileExtension = fileName.split(".").pop()?.toLowerCase();
      
      if (fileExtension === "pdf") {
        return (
          <div className="w-full h-[70vh]">
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1`}
              className="w-full h-full"
              title={fileName}
            />
          </div>
        );
      } else {
        // For DOCX and other file types that can't be embedded directly
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="text-center">
              <p className="mb-2">
                This file type ({fileExtension}) cannot be previewed directly.
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Download or Open in New Tab
              </a>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
