import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { X, Loader2, Check, Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadImageDocument, createImageIndex } from "@/api/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddMediaItemSidebarProps {
  isVisible: boolean;
  mediaCollectionId: string;
  onClose: () => void;
  onSuccess: () => void;
  onCreateMediaItem?: (data: {
    title: string;
    description: string;
    url: string;
  }) => Promise<boolean>;
}

export function AddMediaItemSidebar({
  isVisible,
  mediaCollectionId,
  onClose,
  onSuccess,
  onCreateMediaItem,
}: AddMediaItemSidebarProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<"upload" | "describe">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  const validateFile = (file: File): boolean => {
    const fileType = file.type;

    if (allowedImageTypes.includes(fileType)) {
      return true;
    } else {
      toast.error("Only image files (JPEG, PNG, GIF, WEBP, SVG) are allowed");
      return false;
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setTitle(droppedFile.name.split(".")[0] || "Image");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setTitle(selectedFile.name.split(".")[0] || "Image");
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      // Upload the image
      const result = await uploadImageDocument(file);

      if (result.success) {
        setUploadedUrl(result.url);
        setDescription(result.description || "");
        setStep("describe");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIndex = async () => {
    if (!uploadedUrl || !title.trim()) {
      toast.error("Please provide a title for the image");
      return;
    }

    setIsLoading(true);
    try {
      let success = false;

      if (onCreateMediaItem) {
        // Use the custom callback if provided
        success = await onCreateMediaItem({
          title,
          description,
          url: uploadedUrl,
        });
      } else {
        // Fall back to default implementation
        const result = await createImageIndex(
          mediaCollectionId,
          description,
          title,
          uploadedUrl
        );

        if (result.success) {
          success = true;
        }
      }

      if (success) {
        toast.success("Media item added successfully");
        resetForm();
        onSuccess();
      }
    } catch (error) {
      console.error("Error indexing image:", error);
      toast.error("Failed to index image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setUploadedUrl("");
    setStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

      {/* Sidebar */}
      <div className="relative ml-auto w-[500px] bg-background border-l shadow-xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b h-18">
          <h2 className="text-lg font-semibold">
            {step === "upload" ? "Add Media Item" : "Describe Media Item"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-xs"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {step === "upload" ? (
            <>
              <p className="text-xs text-muted-foreground">
                Upload your images to add to the media collection. Accepted
                formats: JPEG, PNG, GIF, WEBP, SVG.
              </p>

              <div
                className={`border-2 border-dashed rounded-lg p-4 w-full flex flex-col items-center justify-center transition-all duration-200 ${
                  isDragging
                    ? "border-primary bg-accent/20"
                    : "border-border hover:border-primary/50 hover:bg-accent/10"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  className={`p-2 rounded-full bg-accent mb-2 ${
                    isDragging ? "bg-primary/10" : ""
                  }`}
                >
                  <Upload
                    size={20}
                    className={`${
                      isDragging ? "text-primary" : "text-primary/70"
                    }`}
                  />
                </div>
                <p className="text-xs font-medium mb-1">
                  Drag and drop your image here
                </p>
                <p className="text-xs text-muted-foreground mb-2">or</p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                />

                <Button
                  onClick={handleButtonClick}
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-accent/50 transition-colors"
                >
                  Browse files
                </Button>
              </div>

              {file && (
                <div className="w-full space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-3 bg-primary rounded-full"></div>
                    <p className="text-xs font-medium">Selected Image</p>
                  </div>

                  <div className="flex items-start space-x-6 p-3 border rounded-md bg-accent/5 hover:bg-accent/10 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-md shadow-sm">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-medium">{file.name}</p>
                        <span className="px-2 py-0.5 bg-success/10 text-success-foreground rounded-full text-[10px] font-medium">
                          Image
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>

                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          className="text-xs h-7 px-3 bg-success hover:bg-success/90 text-success-foreground"
                          onClick={handleUpload}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Upload Image"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {uploadedUrl && (
                <div className="mb-4">
                  <img
                    src={uploadedUrl}
                    alt="Uploaded"
                    className="max-h-60 rounded-md mx-auto"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter media title"
                  disabled={isLoading}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter media description"
                  disabled={isLoading}
                  className="text-xs min-h-[100px]"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t h-16 px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="text-xs"
          >
            Cancel
          </Button>

          {step === "describe" && (
            <Button
              onClick={handleCreateIndex}
              disabled={isLoading || !title.trim()}
              className="flex-1 ml-6 text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  Save Media Item
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
