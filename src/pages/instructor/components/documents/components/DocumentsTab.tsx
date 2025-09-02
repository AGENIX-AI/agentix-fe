import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Check, AlertCircle } from "lucide-react";
import { EmbeddedDocumentsComponent } from "./documentsTab/ownDocuments";
import {
  DocumentUpload,
  DocumentGuidelines,
  ImageSidebar,
} from "./documentsTab/components";
import { updateDocumentImageIndex } from "@/api/documents";

// Removed unused interface
export interface ApiDocument {
  id: string;
  user_id: string;
  url: string;
  upload_status: "completed" | "not_complete" | "failed" | "pending";
  created_at: string;
  updated_at: string;
  file_name: string;
  title: string;
  type: "document" | "image";
  linked?: boolean;
  assistant_document?: {
    assistant_id: string;
  }[];
}
// Response types are defined inline where needed

export default function DocumentsTab() {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingImages] = useState(false);
  const [documentImages, setDocumentImages] = useState<string[]>([]);
  const [showImageSidebar, setShowImageSidebar] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string>("");
  const [isSubmittingImages, setIsSubmittingImages] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // No longer fetching document images after upload; consume returned list instead

  // Handle successful document upload
  const handleUploadSuccess = async (payload: {
    documentId: string;
    images: string[];
  }) => {
    setSuccessMessage("Document successfully uploaded!");
    setCurrentDocumentId(payload.documentId);
    setDocumentImages(payload.images || []);
    setShowImageSidebar(true);
  };

  // Handle upload error
  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Function to close the image sidebar
  const handleCloseSidebar = () => {
    setShowImageSidebar(false);
    setSelectedImages([]);

    // Trigger document refresh
    console.log("Triggering document refresh");
    setRefreshDocuments((prev) => prev + 1);
  };

  // State to trigger document refresh
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  // Function to handle image selection
  const handleImageSelect = (imagePath: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(imagePath)) {
        return prev.filter((img) => img !== imagePath);
      } else {
        return [...prev, imagePath];
      }
    });
  };

  // Function to handle select/deselect all
  const handleSelectAll = () => {
    if (selectedImages.length === documentImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages([...documentImages]);
    }
  };

  // Function to submit images (selected or all)
  const handleSubmitImages = async (
    imagesToSubmit: string[],
    isAllImages = false
  ) => {
    if (!currentDocumentId || imagesToSubmit.length === 0) {
      setError("Please select at least one image to submit.");
      return;
    }

    setIsSubmittingImages(true);
    setError(null);

    try {
      const result = await updateDocumentImageIndex(
        currentDocumentId,
        imagesToSubmit
      );
      console.log("Image index updated:", result);
      setSuccessMessage(
        `Image index updated successfully! ${
          result.remaining_files.length
        } images ${isAllImages ? "submitted" : "selected"}.`
      );

      // Close sidebar after successful submission
      setTimeout(() => {
        setShowImageSidebar(false);
        setSelectedImages([]);
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      console.error("Error updating image index:", err);
      setError("Failed to update image index. Please try again.");
    } finally {
      setIsSubmittingImages(false);
      setRefreshDocuments((prev) => prev + 1);
    }
  };

  // Function to submit selected images
  const handleSubmitSelectedImages = () => {
    handleSubmitImages(selectedImages, false);
  };

  // Function to submit all images
  const handleSubmitAllImages = () => {
    handleSubmitImages(documentImages, true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {successMessage && (
            <div className="bg-green-100 border border-green-200 text-green-800 rounded-md mb-4 text-xs flex items-center p-2 max-w-full">
              <Check className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="break-words">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md flex items-center space-x-2 mb-4 max-w-full">
              <AlertCircle
                size={12}
                className="text-destructive flex-shrink-0"
              />
              <p className="text-xs text-destructive break-words">{error}</p>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <DocumentUpload
              onUploadSuccess={handleUploadSuccess}
              onError={handleUploadError}
            />

            <Separator className="bg-border/50" />

            <DocumentGuidelines />

            <EmbeddedDocumentsComponent refreshTrigger={refreshDocuments} />
          </div>
        </div>
      </div>

      <ImageSidebar
        isVisible={showImageSidebar}
        images={documentImages}
        selectedImages={selectedImages}
        isLoading={isLoadingImages}
        isSubmitting={isSubmittingImages}
        onClose={handleCloseSidebar}
        onImageSelect={handleImageSelect}
        onSelectAll={handleSelectAll}
        onSubmitAll={handleSubmitAllImages}
        onSubmitSelected={handleSubmitSelectedImages}
      />
    </div>
  );
}
